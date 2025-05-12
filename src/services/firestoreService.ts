import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const db = getFirestore(getApp());

export const saveCardToFirestore = async (cardData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'cards'), {
      ...cardData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding card to Firestore:', error);
    throw error;
  }
}; 