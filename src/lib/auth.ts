import { betterAuth, string } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const uri = process.env.MONGODB_CONNECTION

if (!uri) {
  throw new Error("MONGODB_CONNECTION environment variable is not defined");
}

const client = new MongoClient(uri);
const db = client.db('artly-user');

export const auth = betterAuth({
   trustedOrigins: [
    "http://localhost:5173",
  ],

  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client
  }),


   emailAndPassword: { 
    enabled: true, 
  }, 
  

  
});