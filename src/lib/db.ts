// lib/db.ts
import { Db } from "mongodb";

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