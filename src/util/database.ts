import mongoose from "mongoose";

export const connectDB = async () => {
  const isDockerized = process.env.IS_DOCKERIZED === "true";

  const mongoUri = isDockerized
    ? process.env.MONGO_DOCKER_URI
    : process.env.MONGO_ATLAS_URI;

  try {
    console.debug(
      `${
        isDockerized
          ? "ℹ️  Initializing local mongodb"
          : "ℹ️  Initializing mongodb atlas"
      }`
    );
    await mongoose.connect(mongoUri!);
    console.log("✅ Database connection established");
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
