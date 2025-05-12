import { 
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, 
  where, orderBy, limit, startAfter, writeBatch, DocumentSnapshot,
  QueryConstraint, OrderByDirection
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { MarketValueService } from './MarketValueService';

export interface Card {
  id: string;
  playerName: string;
  year: string;
  cardSet: string;
  cardNumber: string;
  variation?: string;
  condition?: string;
  pricePaid?: number;
  currentValue?: number;
  imageUrl?: string;
  tags?: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardSearchFilters {
  playerName?: string;
  year?: string;
  brand?: string;
  grade?: string;
  minValue?: number;
  maxValue?: number;
}

export interface PaginationOptions {
  pageSize: number;
  startAfter?: DocumentSnapshot;
}

export interface SortOptions {
  field: keyof Card;
  direction: OrderByDirection;
}

export class CardService {
  // Define both possible paths
  private static getUserCardsRef(userId: string) {
    return collection(db, 'users', userId, 'cards');
  }

  private static getUserCollectionRef(userId: string) {
    return collection(db, 'users', userId, 'collection');
  }

  private static getCardRef(userId: string, cardId: string) {
    return doc(db, 'users', userId, 'cards', cardId);
  }

  private static getCollectionCardRef(userId: string, cardId: string) {
    return doc(db, 'users', userId, 'collection', cardId);
  }

  static async createCard(userId: string, cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const now = new Date().toISOString();
    const cardsRef = this.getUserCardsRef(userId);
    
    const newCard = {
      ...cardData,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(cardsRef, newCard);
    return {
      ...newCard,
      id: docRef.id,
    } as Card;
  }

  static async batchCreateCards(userId: string, cardsData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Card[]> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const cardsRef = this.getUserCardsRef(userId);
    const newCards: Card[] = [];

    for (const cardData of cardsData) {
      const newCardRef = doc(cardsRef);
      const newCard = {
        ...cardData,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(newCardRef, newCard);
      newCards.push({ ...newCard, id: newCardRef.id } as Card);
    }

    await batch.commit();
    return newCards;
  }

  static async getCardsByOwner(
    userId: string,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<{ cards: Card[]; lastDoc?: DocumentSnapshot }> {
    const constraints: QueryConstraint[] = [];
    
    if (sort) {
      constraints.push(orderBy(sort.field, sort.direction));
    }
    
    if (pagination) {
      constraints.push(limit(pagination.pageSize));
      if (pagination.startAfter) {
        constraints.push(startAfter(pagination.startAfter));
      }
    }

    // Query both collections
    const cardsRef = this.getUserCardsRef(userId);
    const collectionRef = this.getUserCollectionRef(userId);
    
    const q1 = query(cardsRef, ...constraints);
    const q2 = query(collectionRef, ...constraints);
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    // Combine results, avoiding duplicates
    const cardMap = new Map();
    
    [...snapshot1.docs, ...snapshot2.docs].forEach(doc => {
      if (!cardMap.has(doc.id)) {
        cardMap.set(doc.id, {
          id: doc.id,
          ...doc.data()
        });
      }
    });
    
    const cards = Array.from(cardMap.values()) as Card[];

    return {
      cards,
      lastDoc: snapshot1.docs[snapshot1.docs.length - 1] || snapshot2.docs[snapshot2.docs.length - 1]
    };
  }

  static async getCard(userId: string, cardId: string): Promise<Card | null> {
    // Try both paths
    const cardRef = this.getCardRef(userId, cardId);
    const collectionCardRef = this.getCollectionCardRef(userId, cardId);
    
    // Try cards path first
    const cardDoc = await getDoc(cardRef);
    if (cardDoc.exists()) {
      return {
        id: cardDoc.id,
        ...cardDoc.data()
      } as Card;
    }
    
    // Try collection path second
    const collectionCardDoc = await getDoc(collectionCardRef);
    if (collectionCardDoc.exists()) {
      return {
        id: collectionCardDoc.id,
        ...collectionCardDoc.data()
      } as Card;
    }
    
    return null;
  }

  static async updateCard(userId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'ownerId' | 'createdAt'>>): Promise<Card> {
    // Try to find the card in either location
    const cardRef = this.getCardRef(userId, cardId);
    const collectionCardRef = this.getCollectionCardRef(userId, cardId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Check which path has the card
    const cardDoc = await getDoc(cardRef);
    const collectionCardDoc = await getDoc(collectionCardRef);
    
    if (cardDoc.exists()) {
      // Update in cards path
      await updateDoc(cardRef, updateData);
    } else if (collectionCardDoc.exists()) {
      // Update in collection path
      await updateDoc(collectionCardRef, updateData);
    } else {
      throw new Error('Card not found in either collection');
    }
    
    const updatedCard = await this.getCard(userId, cardId);
    
    if (!updatedCard) {
      throw new Error('Failed to retrieve updated card');
    }

    return updatedCard;
  }

  static async batchUpdateCards(userId: string, updates: { id: string; data: Partial<Omit<Card, 'id' | 'ownerId' | 'createdAt'>> }[]): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const update of updates) {
      // We need to determine which path has this card
      const cardRef = this.getCardRef(userId, update.id);
      const collectionCardRef = this.getCollectionCardRef(userId, update.id);
      
      const cardDoc = await getDoc(cardRef);
      const collectionCardDoc = await getDoc(collectionCardRef);
      
      if (cardDoc.exists()) {
        batch.update(cardRef, {
          ...update.data,
          updatedAt: now,
        });
      } else if (collectionCardDoc.exists()) {
        batch.update(collectionCardRef, {
          ...update.data,
          updatedAt: now,
        });
      }
    }

    await batch.commit();
  }

  static async deleteCard(userId: string, cardId: string): Promise<void> {
    console.log(`CardService.deleteCard: Deleting card ${cardId} for user ${userId}`);
    
    // Try to delete from both potential locations
    const cardRef = this.getCardRef(userId, cardId);
    const collectionCardRef = this.getCollectionCardRef(userId, cardId);
    
    const cardDoc = await getDoc(cardRef);
    const collectionCardDoc = await getDoc(collectionCardRef);
    
    let wasDeleted = false;
    
    if (cardDoc.exists()) {
      await deleteDoc(cardRef);
      console.log(`CardService.deleteCard: Deleted card from cards path`);
      wasDeleted = true;
    }
    
    if (collectionCardDoc.exists()) {
      await deleteDoc(collectionCardRef);
      console.log(`CardService.deleteCard: Deleted card from collection path`);
      wasDeleted = true;
    }
    
    if (!wasDeleted) {
      console.error(`CardService.deleteCard: Card ${cardId} not found in either location`);
      throw new Error(`Card not found or could not be deleted: ${cardId}`);
    }
    
    // Now remove this card from all display cases it might be in
    try {
      console.log(`CardService.deleteCard: Checking display cases for card references`);
      
      // Get all user's display cases
      const displayCaseRef = collection(db, "users", userId, "display_cases");
      const displayCasesSnapshot = await getDocs(displayCaseRef);
      
      let displayCasesUpdated = 0;
      
      // Check each display case
      for (const dcDoc of displayCasesSnapshot.docs) {
        const displayCase = dcDoc.data();
        
        // Skip if display case has no cardIds
        if (!displayCase.cardIds || !Array.isArray(displayCase.cardIds)) {
          continue;
        }
        
        // Check if this display case contains the deleted card
        if (displayCase.cardIds.includes(cardId)) {
          console.log(`CardService.deleteCard: Removing card from display case: ${dcDoc.id}`);
          
          // Remove the card ID
          const updatedCardIds = displayCase.cardIds.filter(id => id !== cardId);
          
          // Update the display case
          const dcRef = doc(db, "users", userId, "display_cases", dcDoc.id);
          await updateDoc(dcRef, {
            cardIds: updatedCardIds,
            updatedAt: new Date()
          });
          
          displayCasesUpdated++;
          
          // Also update public version if it exists and is public
          if (displayCase.isPublic) {
            try {
              const publicRef = doc(db, "public_display_cases", dcDoc.id);
              const publicSnap = await getDoc(publicRef);
              
              if (publicSnap.exists()) {
                await updateDoc(publicRef, {
                  cardIds: updatedCardIds,
                  updatedAt: new Date()
                });
                console.log(`CardService.deleteCard: Updated public display case ${dcDoc.id}`);
              }
            } catch (error) {
              console.error(`CardService.deleteCard: Error updating public display case ${dcDoc.id}:`, error);
            }
          }
        }
      }
      
      if (displayCasesUpdated > 0) {
        console.log(`CardService.deleteCard: Removed card from ${displayCasesUpdated} display cases`);
      } else {
        console.log(`CardService.deleteCard: Card was not in any display cases`);
      }
      
    } catch (error) {
      console.error(`CardService.deleteCard: Error removing card from display cases:`, error);
      // Don't fail the delete operation if display case cleanup fails
    }
    
    console.log(`CardService.deleteCard: Card deletion completed successfully`);
  }

  static async batchDeleteCards(userId: string, cardIds: string[]): Promise<void> {
    const batch = writeBatch(db);

    for (const cardId of cardIds) {
      // Check both paths and delete where the card exists
      const cardRef = this.getCardRef(userId, cardId);
      const collectionCardRef = this.getCollectionCardRef(userId, cardId);
      
      const cardDoc = await getDoc(cardRef);
      const collectionCardDoc = await getDoc(collectionCardRef);
      
      if (cardDoc.exists()) {
        batch.delete(cardRef);
      }
      
      if (collectionCardDoc.exists()) {
        batch.delete(collectionCardRef);
      }
    }

    await batch.commit();
  }

  static async searchCards(
    userId: string, 
    filters: CardSearchFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<{ cards: Card[]; lastDoc?: DocumentSnapshot }> {
    const constraints: QueryConstraint[] = [];

    if (filters.playerName) {
      constraints.push(where('playerName', '>=', filters.playerName));
      constraints.push(where('playerName', '<=', filters.playerName + '\uf8ff'));
    }
    if (filters.year) {
      constraints.push(where('year', '==', filters.year));
    }
    if (filters.brand) {
      constraints.push(where('brand', '==', filters.brand));
    }
    if (filters.grade) {
      constraints.push(where('grade', '==', filters.grade));
    }
    if (filters.minValue !== undefined) {
      constraints.push(where('currentValue', '>=', filters.minValue));
    }
    if (filters.maxValue !== undefined) {
      constraints.push(where('currentValue', '<=', filters.maxValue));
    }

    if (sort) {
      constraints.push(orderBy(sort.field, sort.direction));
    }

    if (pagination) {
      constraints.push(limit(pagination.pageSize));
      if (pagination.startAfter) {
        constraints.push(startAfter(pagination.startAfter));
      }
    }

    const cardsRef = this.getUserCardsRef(userId);
    const q = query(cardsRef, ...constraints);
    const snapshot = await getDocs(q);

    const cards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Card));

    return {
      cards,
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  }

  static async fetchCardMarketValue(card: Card): Promise<number | null> {
    return MarketValueService.fetchCardMarketValue(card);
  }
}
