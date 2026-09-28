import mongoose from "mongoose";

const globalCache = globalThis as typeof globalThis & {
  __feedbackMongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!globalCache.__feedbackMongoose) {
    globalCache.__feedbackMongoose = { conn: null, promise: null };
  }

  const cache = globalCache.__feedbackMongoose;
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
