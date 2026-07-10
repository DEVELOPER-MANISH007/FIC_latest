import mongoose from "mongoose";
import isServerless from "../utils/isServerless.js";

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  return uri;
};

const connectWithRetry = async (attempt = 1) => {
  const uri = getMongoUri();
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isServerless() ? 10000 : 15000,
      maxPoolSize: isServerless() ? 5 : 10,
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
    if (attempt >= MAX_RETRIES) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
};

/**
 * Establishes (or reuses) a MongoDB connection.
 * Cached for serverless so warm invocations do not reconnect every time.
 */
const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry().then((conn) => {
      cached.conn = conn;
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;
