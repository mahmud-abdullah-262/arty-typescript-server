import { ObjectId } from "mongodb";

export interface Slide {
  id?: string;
  badge?: string;
  title?: string;
  artist?: string;
  medium?: string;
  dimensions?: string;
  price?: number;
  currency?: string;
  ctaPrimary?: object;
  ctaSecondary?: object;
  image?: string;
  alt?: string;
}


export interface Banner {
  _id?: ObjectId;
  autoPlayIntervalMs: number;
  slides: Slide[];
}