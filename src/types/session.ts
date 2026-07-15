import { ObjectId } from "mongodb";

export interface session {
_id: ObjectId;
expiresAt: string;
token: string
createdAt: string;
updatedAt: string;
ipAddress: string
userAgent: string;
userId: ObjectId
}