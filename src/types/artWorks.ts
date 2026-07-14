import { ObjectId } from "mongodb";

interface Image {
  url: string;
  alt: string;
}

interface Price {
  amount: number;
  currency: 'BDT' | string; 
}

interface RatingBreakdown {
  '5': number;
  '4': number;
  '3': number;
  '2': number;
  '1': number;
}

interface Rating {
  average: number;
  totalReviews: number;
  breakdown: RatingBreakdown;
}

interface DimensionDetails {
  width: number;
  height: number;
}

interface Dimensions {
  cm: DimensionDetails;
  inches: DimensionDetails;
}

interface Shipping {
  shipsFrom: string;
  estimatedDelivery: string;
}

interface Specs {
  year: number;
  edition: string;
  surface: string;
  framing: string;
  certificate: string;
}

interface Artist {
  artistID: number;
}

// মূল ইন্টারফেস
export interface ArtworkProduct {
  _id: ObjectId;
  slug: string;
  title: string;
  category:  string;
  isFeatured: boolean;
  images: Image;
  price: Price;
  status:  string; // স্ট্যাটাস সাধারণত নির্দিষ্ট কিছু ভ্যালু হয়
  rating: Rating;
  medium: string;
  dimensions: Dimensions;
  shipping: Shipping;
  trustBadges: string[];
  description: string;
  specs: Specs;
  artist: Artist;
  reviewsCount: number;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}