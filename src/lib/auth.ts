
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const uri = process.env.MONGODB_CONNECTION;

if (!uri) {
  throw new Error("MONGODB_CONNECTION environment variable is not defined");
}

const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
});
const db = client.db("artly-user");

export const auth = betterAuth({
  baseURL: process.env.SERVER_URL || "http://localhost:5000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],


  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true, // নতুন Chrome CHIPS policy-র জন্য, না দিলেও চলতে পারে কিন্তু রাখা ভালো
    }
  },

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },
});