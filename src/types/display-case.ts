import { Timestamp } from "firebase/firestore";

export interface DisplayCase {
  id: string;
  name: string;
  userId: string;
  cardIds: string[];
  tags: string[];
  theme: 'wood' | 'velvet' | 'glass';
  isPublic: boolean;
  createdAt: any; // Firestore Timestamp
  description?: string;
}

export interface CreateDisplayCaseData {
  name: string;
  userId: string;
  cardIds: string[];
  tags: string[];
  theme: 'wood' | 'velvet' | 'glass';
  isPublic: boolean;
  description?: string;
} 