const mongoose = require("mongoose");

const getMongoUri = () =>
  process.env.MONGO_URI || process.env.MONGODB_URI;

const connectDB = async () => {
  const uri = getMongoUri();
  if (!uri) {
    console.error("MongoDB: set MONGO_URI or MONGODB_URI in environment");
    throw new Error("Missing MONGO_URI / MONGODB_URI");
  }
  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
