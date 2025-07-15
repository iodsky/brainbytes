import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

export const connectDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "test-db" });
};

export const closeDatabase = async () => {
  if (mongoServer) await mongoServer.stop();
  await mongoose.connection.close();
};

export const clearDatabase = async () => {
  const collections = await mongoose.connection.db?.collections();
  for (const collection of collections!) {
    await collection.deleteMany({});
  }
};
