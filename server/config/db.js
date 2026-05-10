const mongoose = require("mongoose");

const getMongoUri = () => {
  const mongo = process.env.MONGO_URI;
  const mongodb = process.env.MONGODB_URI;
  if (mongo && String(mongo).trim() && mongodb && String(mongodb).trim()) {
    console.warn(
      "[db] Both MONGO_URI and MONGODB_URI are set; using MONGO_URI only. Delete the unused variable in Vercel to avoid an old string winning by mistake."
    );
  }
  let s = mongo || mongodb || "";
  s = String(s).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
};

/** Atlas DB users authenticate against the admin DB; append if missing. */
function ensureAtlasAuthSourceAdmin(uri) {
  if (!/^mongodb\+srv:/i.test(uri)) {
    return uri;
  }
  if (/[?&]authSource=/i.test(uri)) {
    return uri;
  }
  return uri.includes("?") ? `${uri}&authSource=admin` : `${uri}?authSource=admin`;
}

function assertUriLooksConfigured(uri) {
  const lower = uri.toLowerCase();
  if (
    lower.includes("<password>") ||
    lower.includes("<username>") ||
    lower.includes("yourpassword")
  ) {
    throw new Error(
      "MONGO_URI still contains a placeholder. Paste the real Atlas string and replace <password> with your database user's password."
    );
  }
  // user:pass@host — both sides must be non-empty
  const m = uri.match(/^mongodb(\+srv)?:\/\/([^/?#]+)@/i);
  if (m) {
    const UserPass = m[2];
    if (!UserPass.includes(":") || UserPass.startsWith(":") || UserPass.endsWith(":")) {
      throw new Error(
        "MONGO_URI must include username and password as mongodb+srv://USER:PASSWORD@host/..."
      );
    }
  }
}

function logUriUser(uri) {
  const m = String(uri).match(/^mongodb(\+srv)?:\/\/([^:]+):/i);
  if (m) {
    console.log(`[db] Connecting as Atlas database user: "${m[2]}"`);
  }
}

function normalizeMongoUri(uri) {
  assertUriLooksConfigured(uri);
  return ensureAtlasAuthSourceAdmin(uri);
}

const connectOptions = () => {
  const opts = {
    serverSelectionTimeoutMS: process.env.VERCEL ? 20000 : 5000,
    maxPoolSize: 10,
  };
  /** Forcing IPv4 breaks many cloud ↔ Atlas paths; opt in locally if needed. */
  if (process.env.MONGOOSE_IPV4_ONLY === "true") {
    opts.family = 4;
  }
  return opts;
};

let listenersRegistered = false;

function registerListenersOnce() {
  if (listenersRegistered) return;
  listenersRegistered = true;
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });
}

/**
 * Long-running server (local): retry until MongoDB is available.
 */
const connectDB = async () => {
  const raw = getMongoUri();
  if (!raw) {
    console.error("MongoDB: set MONGO_URI or MONGODB_URI in environment");
    throw new Error("Missing MONGO_URI / MONGODB_URI");
  }
  const uri = normalizeMongoUri(raw);
  registerListenersOnce();
  const opts = connectOptions();
  logUriUser(uri);

  for (;;) {
    try {
      const connection = await mongoose.connect(uri, opts);
      console.log(`MongoDB connected: ${connection.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      console.log("Retrying connection in 5 seconds...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
};

/** Single in-flight connect for serverless (Vercel); await before DB routes. */
let serverlessConnectPromise = null;

const ensureDbConnected = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const raw = getMongoUri();
  if (!raw) {
    throw new Error("Missing MONGO_URI / MONGODB_URI");
  }
  const uri = normalizeMongoUri(raw);
  registerListenersOnce();
  logUriUser(uri);

  if (!serverlessConnectPromise) {
    serverlessConnectPromise = mongoose
      .connect(uri, connectOptions())
      .then((c) => {
        console.log(`MongoDB connected: ${c.connection.host}`);
      })
      .catch((err) => {
        serverlessConnectPromise = null;
        throw err;
      });
  }
  await serverlessConnectPromise;
};

module.exports = connectDB;
module.exports.ensureDbConnected = ensureDbConnected;
module.exports.getMongoUri = getMongoUri;
