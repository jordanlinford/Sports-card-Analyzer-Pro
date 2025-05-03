import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MarketValueService } from './MarketValueService';

export interface Card {
  id?: string;
  playerName: string;
  year: string;
  cardSet: string;
  variation: string;
  cardNumber: string;
  condition: string;
  grade: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  notes: string;
  imageUrl: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

class CardService {
  private static readonly collectionName = 'cards';

  static async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...card,
      createdAt: now,
      updatedAt: now,
    });
    return { ...card, id: docRef.id, createdAt: now.toDate(), updatedAt: now.toDate() };
  }

  static async getCards(userId: string): Promise<Card[]> {
    const q = query(collection(db, this.collectionName), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Card[];
  }

  static async updateCard(id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const now = Timestamp.now();
    await updateDoc(doc(db, this.collectionName, id), {
      ...updates,
      updatedAt: now,
    });
  }

  static async deleteCard(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }

  static async searchCards(userId: string, searchTerm: string): Promise<Card[]> {
    const cards = await this.getCards(userId);
    return cards.filter(card => 
      card.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cardSet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.variation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async fetchCardMarketValue(card: Card): Promise<number | null> {
    return MarketValueService.fetchCardMarketValue({
      playerName: card.playerName,
      year: card.year,
      cardSet: card.cardSet,
      variation: card.variation,
      cardNumber: card.cardNumber,
      condition: card.condition,
    });
  }
}

export const cardService = new CardService();
export { CardService }; 