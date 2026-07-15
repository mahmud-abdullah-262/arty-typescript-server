import { User } from "./user.ts";

export {}; 

declare global {
  namespace Express {
    interface Request {
      user?: User | null; 
    }
  }
}