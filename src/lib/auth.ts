import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_CONNECTION);
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