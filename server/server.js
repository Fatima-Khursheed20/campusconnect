const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { ensureDbConnected } = connectDB;
const apiRoutes = require("./routes");
const { ensureUploadDirs } = require("./utils/ensureUploadDirs");

dotenv.config();

try {
  ensureUploadDirs();
} catch (e) {
  console.warn(
    "[uploads] Skipped or failed creating upload dirs (common on serverless read-only fs):",
    e.message
  );
}

const app = express();

/** Vercel & proxies: needed for correct client IP (rate limit) and optional secure cookies */
if (process.env.VERCEL) {
  app.set("trust proxy", 1);
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

/** Any http://localhost:* / 127.0.0.1:* — set CORS_STRICT_LOCALHOST=true to turn off (e.g. hardened prod). */
const allowLocalhostOrigins = process.env.CORS_STRICT_LOCALHOST !== "true";

const normalizeOrigin = (value) => {
  let s = (value || "").trim().replace(/\/$/, "");
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim().replace(/\/$/, "");
  }
  return s;
};

const envTruthy = (v) => /^(1|true|yes)$/i.test(String(v ?? "").trim());

/** Allowed browser origins for credentialed CORS (cookies, CSRF) */
const parseClientOrigins = () => {
  const fromList = process.env.CLIENT_URLS;
  const out = new Set();
  if (fromList && fromList.trim()) {
    fromList
      .split(",")
      .map((o) => normalizeOrigin(o))
      .filter(Boolean)
      .forEach((o) => out.add(o));
  }
  const single = normalizeOrigin(process.env.CLIENT_URL);
  if (single) {
    out.add(single);
  }
  const front = normalizeOrigin(process.env.FRONTEND_URL);
  if (front) {
    out.add(front);
  }
  if (out.size === 0) {
    out.add("http://localhost:5173");
  }
  return [...out];
};

const clientOrigins = parseClientOrigins();
const clientOriginSet = new Set(clientOrigins);

console.log(
  `[CORS] NODE_ENV=${process.env.NODE_ENV || "(unset)"} allowLocalhost=${allowLocalhostOrigins} origins=${clientOrigins.join(" | ")}`
);

if (
  process.env.VERCEL &&
  !envTruthy(process.env.CORS_ALLOW_VERCEL_APP_HOSTS) &&
  !normalizeOrigin(process.env.CLIENT_URL) &&
  !normalizeOrigin(process.env.FRONTEND_URL) &&
  !(process.env.CLIENT_URLS && process.env.CLIENT_URLS.trim())
) {
  console.warn(
    "[CORS] No CLIENT_URL / FRONTEND_URL / CLIENT_URLS set on Vercel — cross-origin browser calls will fail unless you set one of them or CORS_ALLOW_VERCEL_APP_HOSTS=true"
  );
}

/**
 * Explicit CORS (no `cors` package) so Access-Control-Allow-Origin always matches
 * the browser's Origin (e.g. http://localhost:5174) when allowed.
 */
const resolveAllowedOrigin = (req) => {
  const raw = req.headers.origin;
  if (!raw || raw === "null") {
    return null;
  }
  const origin = normalizeOrigin(raw);
  if (clientOriginSet.has(origin)) {
    return origin;
  }
  /**
   * Dev / class projects: allow any *.vercel.app frontend without listing every preview URL.
   * Set CORS_ALLOW_VERCEL_APP_HOSTS=true on the API. Prefer CLIENT_URL / CLIENT_URLS in production.
   */
  if (envTruthy(process.env.CORS_ALLOW_VERCEL_APP_HOSTS)) {
    if (/^https:\/\/[a-z0-9.-]+\.vercel\.app$/i.test(origin)) {
      return origin;
    }
  }
  if (
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  ) {
    if (allowLocalhostOrigins) {
      return origin;
    }
  }
  console.warn(
    `[CORS] Blocked origin: ${origin} (configured: ${clientOrigins.join(", ")})`
  );
  return null;
};

app.use((req, res, next) => {
  const allowed = resolveAllowedOrigin(req);
  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.append("Vary", "Origin");

  if (req.method === "OPTIONS") {
    if (allowed) {
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
      );
      const requested = req.headers["access-control-request-headers"];
      res.setHeader(
        "Access-Control-Allow-Headers",
        requested ||
          "Content-Type, X-CSRF-Token, Authorization, X-Requested-With"
      );
      res.setHeader("Access-Control-Max-Age", "86400");
    }
    return res.sendStatus(204);
  }

  next();
});

/** Vercel serverless: wait for MongoDB before handling requests (connect() is async). */
app.use(async (req, res, next) => {
  if (!process.env.VERCEL) {
    return next();
  }
  try {
    await ensureDbConnected();
    return next();
  } catch (err) {
    console.error("[db] ensureDbConnected:", err.message);
    return res.status(503).json({
      message:
        "Database unavailable. Set MONGO_URI on Vercel and allow Atlas access from 0.0.0.0/0.",
    });
  }
});

// Security and Performance Middleware (after CORS so preflight is handled first)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  if (req.path.includes('/auth/') || req.path.includes('/jobs')) {
    console.log(`${req.path.includes('/auth/') ? 'Auth' : 'Job'} Request:`, {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body
    });
  }
  next();
});

app.use(express.json({ 
  limit: '10mb',
  strict: false,
  type: 'application/json'
}));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(limiter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "CampusConnect API is running." });
});
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep server running, don't exit
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep server running, don't exit
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Press Ctrl+C to stop the server');
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
