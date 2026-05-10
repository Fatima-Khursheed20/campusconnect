const mongoose = require("mongoose");

const getMongoUri = () => {
  let s = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  s = String(s).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
};

const connectOptions = () => ({
  serverSelectionTimeoutMS: process.env.VERCEL ? 15000 : 5000,
  maxPoolSize: 10,
  family: 4,
});

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
  const uri = getMongoUri();
  if (!uri) {
    console.error("MongoDB: set MONGO_URI or MONGODB_URI in environment");
    throw new Error("Missing MONGO_URI / MONGODB_URI");
  }
  registerListenersOnce();
  const opts = connectOptions();

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
  const uri = getMongoUri();
  if (!uri) {
    throw new Error("Missing MONGO_URI / MONGODB_URI");
  }
  registerListenersOnce();

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
