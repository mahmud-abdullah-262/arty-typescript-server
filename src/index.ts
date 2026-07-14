import "dotenv/config";


import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { MongoClient, ServerApiVersion, Db, ObjectId } from "mongodb";
import { auth } from "./lib/auth.js";
import { getArtWorks, getBannerCollection, setDb } from "./lib/db.js";
import { ArtworkProduct } from "./types/artWorks.js";



const uri = process.env.MONGODB_CONNECTION as string;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// --- DB কানেকশন cache করা হচ্ছে যাতে প্রতি রিকোয়েস্টে নতুন কানেকশন না খোলে ---
let db: Db | null = null;
let dbPromise: Promise<Db> | null = null;

async function connectToMongoDB(): Promise<Db> {
  if (db) return db;
  if (!dbPromise) {
    dbPromise = client.connect().then(() => {
      console.log("You successfully connected to MongoDB!");
      db = client.db("artly-user");
      setDb(db);
      return db;
    });
  }
  return dbPromise;
}

// প্রতিটা রুটে DB রেডি আছে কিনা নিশ্চিত করা হচ্ছে middleware দিয়ে
app.use(async (req: Request, res: Response, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/banner", async (req: Request, res: Response) => {
  try {
    const bannerCollection = getBannerCollection();
    const result = await bannerCollection.find().toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

app.get("/api/artworks", async (req: Request, res: Response) => {
  try {
    const artWorksCollection = getArtWorks();
    const result = await artWorksCollection.find().toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

app.get("/api/artworks/:id", async (req: Request, res: Response) => {
  try {
    const artWorksCollection = getArtWorks();
    console.log(req.params.id)
    const id = req.params.id as string
    const query = {_id: new ObjectId(id)}
    const result = await artWorksCollection.findOne(query);
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch Artwork" });
  }
});

app.get("/api/featuredArtWorks", async (req: Request, res: Response) => {
  try {
    const artWorksCollection = getArtWorks();
    const query = {isFeatured: true}
    const result = await artWorksCollection.find(query).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

app.get("/api/newArrivals", async (req: Request, res: Response) => {
  try {
    const artWorksCollection = getArtWorks();
    const query = {isFeatured: false, status: 'available'}
    const result = await artWorksCollection.
    find(query)
    .sort({createdAt: -1})
    .limit(6)
    .toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

// --- লোকাল ডেভেলপমেন্টে সরাসরি সার্ভার চালু করা হবে, Vercel এ নয় ---
if (process.env.NODE_ENV !== "production") {
  connectToMongoDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default app;