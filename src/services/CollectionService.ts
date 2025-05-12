import { db, auth, storage } from '../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card } from '../types/Card';

export interface PaginationOptions {
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}

export interface CardFilters {
  playerName?: string;
  year?: string;
  set?: string;
  condition?: string;
  minValue?: number;
  maxValue?: number;
}

export const addCard = async (card: Omit<Card, 'id' | 'createdAt'>, imageFile?: File) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  let imageUrl = '';

  if (imageFile) {
    const imageRef = ref(storage, `cards/${user.uid}/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const docRef = await addDoc(collection(db, 'users', user.uid, 'collection'), {
    ...card,
    userId: user.uid,
    imageUrl,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getCards = async (options?: PaginationOptions, filters?: CardFilters) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  let q = query(
    collection(db, 'users', user.uid, 'collection'),
    orderBy('createdAt', 'desc')
  );

  if (filters) {
    if (filters.playerName) {
      q = query(q, where('playerName', '>=', filters.playerName));
    }
    if (filters.year) {
      q = query(q, where('year', '==', filters.year));
    }
    if (filters.set) {
      q = query(q, where('set', '==', filters.set));
    }
    if (filters.condition) {
      q = query(q, where('condition', '==', filters.condition));
    }
    if (filters.minValue !== undefined) {
      q = query(q, where('currentValue', '>=', filters.minValue));
    }
    if (filters.maxValue !== undefined) {
      q = query(q, where('currentValue', '<=', filters.maxValue));
    }
  }

  if (options) {
    q = query(q, limit(options.pageSize));
    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }
  }

  const querySnapshot = await getDocs(q);
  const cards: Card[] = [];
  querySnapshot.forEach((doc) => {
    cards.push({ id: doc.id, ...doc.data() } as Card);
  });

  return {
    cards,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
  };
};

export const updateCard = async (cardId: string, updates: Partial<Card>, newImageFile?: File) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  let imageUrl = updates.imageUrl;

  if (newImageFile) {
    // Delete old image if exists
    if (updates.imageUrl) {
      const oldImageRef = ref(storage, updates.imageUrl);
      try {
        await deleteObject(oldImageRef);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Upload new image
    const imageRef = ref(storage, `cards/${user.uid}/${Date.now()}-${newImageFile.name}`);
    const snapshot = await uploadBytes(imageRef, newImageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const cardRef = doc(db, 'users', user.uid, 'collection', cardId);
  await updateDoc(cardRef, {
    ...updates,
    imageUrl,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCard = async (cardId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const cardRef = doc(db, 'users', user.uid, 'collection', cardId);
  const cardDoc = await getDocs(cardRef);
  const card = cardDoc.data() as Card;

  // Delete image if exists
  if (card.imageUrl) {
    const imageRef = ref(storage, card.imageUrl);
    try {
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await deleteDoc(cardRef);
}; 