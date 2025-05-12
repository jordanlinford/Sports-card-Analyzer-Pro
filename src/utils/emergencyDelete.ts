import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Absolute minimal card deletion with no dependencies
 * Use only when other deletion methods fail
 */
export async function emergencyDeleteCard(userId: string, cardId: string): Promise<{success: boolean, message: string}> {
  console.log(`[emergencyDelete] Starting deletion for card ${cardId}`);
  
  try {
    // Attempt collection path first
    const collectionRef = doc(db, "users", userId, "collection", cardId);
    const collectionDoc = await getDoc(collectionRef);
    
    if (collectionDoc.exists()) {
      await deleteDoc(collectionRef);
      console.log(`[emergencyDelete] Deleted card from collection path`);
      return { 
        success: true, 
        message: "Card deleted successfully" 
      };
    }
    
    // Try cards path if not in collection
    const cardsRef = doc(db, "users", userId, "cards", cardId);
    const cardsDoc = await getDoc(cardsRef);
    
    if (cardsDoc.exists()) {
      await deleteDoc(cardsRef);
      console.log(`[emergencyDelete] Deleted card from cards path`);
      return { 
        success: true, 
        message: "Card deleted successfully" 
      };
    }
    
    return {
      success: false,
      message: "Card not found in either location"
    };
  } catch (error) {
    console.error("[emergencyDelete] Error:", error);
    
    // Create meaningful error message
    let errorMessage = "An error occurred while deleting the card";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
} 