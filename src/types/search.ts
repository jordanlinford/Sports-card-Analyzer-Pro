import { Timestamp } from "firebase/firestore";

export interface SearchData {
  playerName: string;
  year?: string;
  cardSet?: string;
  variation?: string;
  cardNumber?: string;
  price?: number;
  condition?: string;
}

export interface SavedSearch extends SearchData {
  id: string;
  userId: string;
  createdAt: Timestamp;
} 