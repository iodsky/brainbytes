import mongoose from "mongoose";

export const connectDB = async () => {
  const IS_DOCKERIZED = process.env.IS_DOCKERIZED === "true";

  const MONGO_URI = IS_DOCKERIZED
    ? process.env.MONGO_URI_DOCKER
    : process.env.MONGO_URI_ATLAS;

  try {
    console.debug(
      `${
        IS_DOCKERIZED
          ? "ℹ️  Connecting to containerized mongodb"
          : "ℹ️  Connecting to mongodb atlas"
      }`
    );
    await mongoose.connect(MONGO_URI!);
    console.log(`✅ Successfully connected to ${MONGO_URI}`);
  } catch (err) {
    console.error("👎 MongoDB connection error:", err);
    process.exit(1);
  }
};

export const flushDB = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not available");
    const collections = await db.listCollections().toArray();
    console.log("🗑️  Flushing DB");
    for (const collection of collections) {
      await mongoose.connection.db?.dropCollection(collection.name);
    }
  } catch (err) {
    console.error("👎 MongoDB connection error:", err);
  }
};
