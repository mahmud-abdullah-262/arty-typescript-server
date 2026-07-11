import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { MongoClient, ServerApiVersion, Db } from "mongodb";
import { auth } from "./lib/auth";
import { setDb } from "./lib/db";
import { User } from "./types/user"; // আপনার User ইন্টারফেসের পাথ

const uri = process.env.MONGODB_CONNECTION as string;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// db এখন সঠিকভাবে টাইপড
let db: Db;

async function connectToMongoDB(): Promise<Db> {
  await client.connect();
  console.log("You successfully connected to MongoDB!");
  db = client.db("artly-user");
  return db;
}

// রুটগুলো আলাদা করে বাইরে রাখা হলো, db কানেক্ট হওয়ার পরে সেট হবে
app.get("/api/users", async (req: Request, res: Response) => {
  const userCollection = db.collection<User>("user");
  const result = await userCollection.find().toArray();
  res.json(result);
});

connectToMongoDB()
  .then((connectedDb) => {
    setDb(connectedDb);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });