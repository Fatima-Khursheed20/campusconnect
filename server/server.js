const path = require("path");
const express = require("express");
const cors = require("cors");
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

const envTruthy = (v) => /^(1|true|yes)$/i.test(String(v ?? "").trim());

/** True on Vercel serverless; VERCEL_URL is set even if VERCEL is missing in some setups */
const isVercelRuntime =
  envTruthy(process.env.VERCEL) || Boolean(String(process.env.VERCEL_URL || "").trim());

/** Vercel & proxies: needed for correct client IP (rate limit) and optional secure cookies */
if (isVercelRuntime) {
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
  isVercelRuntime &&
  !envTruthy(process.env.CORS_STRICT_ORIGINS) &&
  !envTruthy(process.env.CORS_ALLOW_VERCEL_APP_HOSTS) &&
  !normalizeOrigin(process.env.CLIENT_URL) &&
  !normalizeOrigin(process.env.FRONTEND_URL) &&
  !(process.env.CLIENT_URLS && process.env.CLIENT_URLS.trim())
) {
  console.warn(
    "[CORS] API on Vercel: allowing any https://*.vercel.app origin (classroom default). Set CLIENT_URL for a single origin, or CORS_STRICT_ORIGINS=true to allow only CLIENT_URL / CLIENT_URLS."
  );
}

/**
 * CORS: dynamic reflect of allowed Origin (credentialed requests need an exact ACAO match).
 * Omitting `allowedHeaders` mirrors Access-Control-Request-Headers on preflight (cors default).
 */
const resolveAllowedOriginValue = (raw) => {
  if (!raw || raw === "null") {
    return null;
  }
  const origin = normalizeOrigin(raw);
  if (clientOriginSet.has(origin)) {
    return origin;
  }
  const allowVercelAppHost =
    envTruthy(process.env.CORS_ALLOW_VERCEL_APP_HOSTS) ||
    (isVercelRuntime && !envTruthy(process.env.CORS_STRICT_ORIGINS));
  if (allowVercelAppHost && /^https:\/\/[a-z0-9.-]+\.vercel\.app$/i.test(origin)) {
    return origin;
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    if (allowLocalhostOrigins) {
      return origin;
    }
  }
  console.warn(
    `[CORS] Blocked origin: ${origin} (configured: ${clientOrigins.join(", ")})`
  );
  return null;
};

app.use(
  cors({
    origin(originHeader, callback) {
      if (!originHeader) {
        return callback(null, true);
      }
      const allowed = resolveAllowedOriginValue(originHeader);
      return callback(null, allowed || false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    maxAge: 86400,
    optionsSuccessStatus: 204,
  })
);

/** Vercel serverless: wait for MongoDB before handling requests (connect() is async). */
app.use(async (req, res, next) => {
  if (!isVercelRuntime) {
    return next();
  }
  try {
    await ensureDbConnected();
    return next();
  } catch (err) {
    console.error("[db] ensureDbConnected:", err.message);
    const missing =
      /missing mongo_uri/i.test(String(err.message)) ||
      String(err.message).includes("Missing MONGO_URI");

    const payload = {
      message: missing
        ? "MONGO_URI is missing. In Vercel open your API project (not the frontend) → Settings → Environment Variables → add MONGO_URI (or MONGODB_URI) with your Atlas connection string, then Redeploy."
        : "Cannot connect to MongoDB. Check the connection string and password (URL-encode special characters in the password). In Atlas: Network Access → allow 0.0.0.0/0 (or Vercel IPs). Database user must exist.",
    };

    if (process.env.NODE_ENV !== "production" || process.env.SHOW_DB_ERRORS === "true") {
      payload.detail = err.message;
    }

    return res.status(503).json(payload);
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
