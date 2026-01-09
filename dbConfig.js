import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config(); // ✅ VERY IMPORTANT

const url = process.env.MONGO_URL;

if (!url) {
  throw new Error("❌ MONGO_URL is missing in .env file");
}

const client = new MongoClient(url);

export const connection = async () => {
  await client.connect();
  return client.db("real-estate");
};
