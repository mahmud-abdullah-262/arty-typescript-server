// lib/db.ts
import { Db } from "mongodb";
import { Banner } from "../types/banner.js";

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
export function getBannerCollection() {
  return getDb().collection<Banner>("banner_slides");
}