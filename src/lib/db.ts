// lib/db.ts
import { Db } from "mongodb";
import { Banner } from "../types/banner.js";
import { ArtworkProduct } from "../types/artWorks.js";
import { artist } from "../types/artist.js";
import { session } from "../types/session.js";
import { User } from "../types/user.js";

let dbInstance: Db;

export function setDb(db: Db) {
  dbInstance = db;
}

export function getDb(): Db {
  if (!dbInstance) {
    throw new Error("Database not initialized yet!");
  }
  return dbInstance;
}

// --- Collection-specific getters ---
export function getSessionCollection() {
  return getDb().collection<session>('session')
}
export function getUserCollection() {
  return getDb().collection<User>('user')
}

export function getBannerCollection() {
  return getDb().collection<Banner>("banner_slides");
}

export function getArtWorks() {
  return getDb().collection<ArtworkProduct>("artworks");
}

export function getArtist ( ) {
  return getDb().collection<artist>('artists')
}