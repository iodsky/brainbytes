import mongoose from "mongoose";
import logger from "./logger";

export const connectDB = async () => {
  const IS_DOCKERIZED = process.env.IS_DOCKERIZED === "true";

  const MONGO_URI = IS_DOCKERIZED
    ? process.env.MONGO_URI_DOCKER
    : process.env.MONGO_URI_ATLAS;

  try {
    logger.info(
      `${
        IS_DOCKERIZED
          ? "Connecting to containerized mongodb"
          : "Connecting to mongodb atlas"
      }`
    );
    await mongoose.connect(MONGO_URI!);
    logger.info(`Successfully connected to ${MONGO_URI}`);
  } catch (err) {
    logger.error(`Error connecting to ${MONGO_URI}`, err);
    process.exit(1);
  }
};

export const flushDB = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not available");
    const collections = await db.listCollections().toArray();
    logger.info("🗑️  Flushing DB");
    for (const collection of collections) {
      await mongoose.connection.db?.dropCollection(collection.name);
    }
  } catch (err) {
    console.error("👎 MongoDB connection error:", err);
  }
};
