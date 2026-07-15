import "dotenv/config";


import express, { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { MongoClient, ServerApiVersion, Db, ObjectId } from "mongodb";
import { auth } from "./lib/auth.js";
import { getArtist, getArtWorks, getBannerCollection, getSessionCollection, getUserCollection, setDb } from "./lib/db.js";
import { ArtworkProduct } from "./types/artWorks.js";
import { error } from "node:console";



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

// verification related 
    const verifyToken = async (req:Request, res:Response, next:NextFunction) => {

  const authHeader = req.headers.authorization;
 
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized access'})
  }
  const token = authHeader.split(' ')[1]
   if(!token){
    return res.status(401).send({message: 'Unauthorized access'})
  }

  const query = {token: token}
  const sessionCollection = getSessionCollection()
  const session = await sessionCollection.findOne(query)
  if(!session) {
      return res.status(403).send({message: 'forbidden'})
  }

  const userQuery = {_id : session?.userId}
  const userCollection = getUserCollection()
  const user = await userCollection.findOne(userQuery)

  req.user = user
next()
}




// banner data fetch
app.get("/api/banner",  async (req: Request, res: Response) => {
  try {
    const bannerCollection = getBannerCollection();
    const result = await bannerCollection.find().toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

// all artwork fetch
app.get("/api/artworks", async (req: Request, res: Response) => {
  try {
   
  const page = parseInt(req.query.page as string) || 1;
    console.log(page, 'page')
    const size = 10// প্রতি পেজে কতগুলো ডাটা দেখাব ঠিক করে দিচ্ছি

    const category = req.query.category
    const sortby = req.query.sortby as string || undefined

   let query:any = {
  ...(category && { category }),
}

  let sort:any = {createdAt : -1}

   if(category){
    query.category = category
   }
   if(sortby == 'Featured'){
    query.isFeatured = true
   }
   if(sortby == "Newest"){
    sort = {createdAt : -1}
   }
   if(sortby == 'Oldest'){
    sort = {createdAt : 1}
   }


    const artWorksCollection = getArtWorks();
    // এটি সরাসরি একটি সংখ্যা (Number) রিটার্ন করবে (যেমন: 150)
const totalArtworks = await artWorksCollection.countDocuments(query);

    const skipCount = (page - 1) * size
    const cursor =  artWorksCollection
    .find(query)
    .skip(skipCount)
    .sort(sort)
    .limit(size)
    const result = await cursor.toArray()
     res.json({
      totalArtworks,
      size,
      page,
      result

    });
    console.log(totalArtworks, size, page, result.length)
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

// single artwork fetch
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


// artists artwork fetch
app.get("/api/artworkbyartist/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const artWorksCollection = getArtWorks();
    console.log(req.params.id)
    const id = req.params.id as string
    const query = {"artist.artistID" : id}
    const result = await artWorksCollection.find(query).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch Artwork" });
  }
});



// featured artwork fetch
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

// new artwork fetch
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


// artist data fetch
app.get("/api/artist/:id", async (req: Request, res: Response) => {
  try {
    const artistCollection = getArtist();

    
    const id = req.params.id as string;
    if(!id){
      return res.status(500).json({message: 'Artist Id not Found'})
    }
  




    const query = {artistId: id}


    const result = await artistCollection.findOne(query);
    res.json(result);
  } catch (error) {
    console.error("Error fetching artist:", error);
    res.status(500).json({ message: "Failed to fetch artist" });
  }
});


// artist data post
app.post('/api/artist', verifyToken, async (req:Request, res:Response) => {
  const data = req.body
  const artistCollection = getArtist()
  if(!data){
    return res.status(500).json({messege: 'data did not found'})
  }

  const result = artistCollection.insertOne(data)
  if(!result){
    return res.send(400).json('data insertetion failed')
  } else{
    return res.json(result)
  }
})

// artist data post
app.post('/api/artwork', verifyToken, async (req:Request, res:Response) => {
  const data = req.body
  const artworkCollection = getArtWorks()
  if(!data){
    return res.status(500).json({messege: 'data did not found'})
  }

  const result = artworkCollection.insertOne(data)
  if(!result){
    return res.send(400).json('data insertion failed')
  } else{
    return res.json(result)
  }
})

// artwork delete function
app.delete('/api/deleteArtwork', verifyToken, async (req : Request, res: Response) => {
try {
    const id = req.query.id as string; 
    console.log(id, 'deleted artwork id'); 

   
    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: "Valid ID is required" });
    }

    const query = { _id: new ObjectId(id) };
    const artworkCollection = getArtWorks()
    const result = await artworkCollection.deleteOne(query);
    
   
    return res.json(result); 

  } catch (error) {
    const err = error as Error
    console.error("Express Delete Error:", error);
    return res.status(500).json({ success: false, message: err.message });
  }
})


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