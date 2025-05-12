import { deleteDoc, doc, getDoc, collection, getDocs, updateDoc, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';

/**
 * Emergency standalone utility to directly delete a card from Firestore
 * and clean up any references to it in display cases.
 * 
 * This function is completely independent of other services to avoid any errors.
 */
export async function directDeleteCard(userId: string, cardId: string): Promise<boolean> {
  console.log(`[directDeleteCard] Starting emergency deletion of card ${cardId} for user ${userId}`);
  
  try {
    // STEP 1: Delete the card from the collection path (primary storage location)
    let deleted = false;
    
    // Define document references
    const collectionRef = doc(db, "users", userId, "collection", cardId);
    const cardsRef = doc(db, "users", userId, "cards", cardId);
    
    // Try deleting from collection first
    try {
      const docSnapshot = await getDoc(collectionRef);
      if (docSnapshot.exists()) {
        console.log(`[directDeleteCard] Card found in collection path, deleting`);
        
        try {
          await deleteDoc(collectionRef);
          console.log(`[directDeleteCard] Successfully deleted card from collection path`);
          deleted = true;
        } catch (deleteError: any) {
          console.error(`[directDeleteCard] Error deleting from collection path:`, deleteError);
          // Check for permission issues
          if (deleteError?.code === 'permission-denied') {
            toast.error("Permission denied. You don't have access to delete this card.");
            return false;
          }
        }
      }
    } catch (error) {
      console.error(`[directDeleteCard] Error checking collection path:`, error);
      // Continue to try the cards path
    }
    
    // Try cards path as fallback if not already deleted
    if (!deleted) {
      try {
        const altSnapshot = await getDoc(cardsRef);
        
        if (altSnapshot.exists()) {
          console.log(`[directDeleteCard] Card found in cards path, deleting`);
          
          try {
            await deleteDoc(cardsRef);
            console.log(`[directDeleteCard] Successfully deleted card from cards path`);
            deleted = true;
          } catch (deleteError: any) {
            console.error(`[directDeleteCard] Error deleting from cards path:`, deleteError);
            // Check for permission issues
            if (deleteError?.code === 'permission-denied') {
              toast.error("Permission denied. You don't have access to delete this card.");
              return false;
            }
          }
        }
      } catch (error) {
        console.error(`[directDeleteCard] Error checking cards path:`, error);
      }
    }
    
    // Check if we were able to delete the card
    if (!deleted) {
      console.log(`[directDeleteCard] Card not found in either location or could not be deleted`);
      toast.error("Card not found or could not be deleted");
      return false;
    }
    
    // STEP 2: Clean up display cases (silently fail if this errors)
    try {
      console.log(`[directDeleteCard] Cleaning up display cases`);
      const displayCasesRef = collection(db, "users", userId, "display_cases");
      const displayCasesSnapshot = await getDocs(displayCasesRef);
      
      let updatedCount = 0;
      
      for (const dcDoc of displayCasesSnapshot.docs) {
        const displayCase = dcDoc.data();
        
        if (displayCase.cardIds && Array.isArray(displayCase.cardIds) && 
            displayCase.cardIds.includes(cardId)) {
          
          // Remove the card from this display case
          const updatedCardIds = displayCase.cardIds.filter(id => id !== cardId);
          
          // Update the display case
          try {
            await updateDoc(doc(db, "users", userId, "display_cases", dcDoc.id), {
              cardIds: updatedCardIds,
              updatedAt: new Date()
            });
            
            updatedCount++;
            
            // Also update public version if it exists
            if (displayCase.isPublic) {
              try {
                const publicRef = doc(db, "public_display_cases", dcDoc.id);
                const publicSnapshot = await getDoc(publicRef);
                
                if (publicSnapshot.exists()) {
                  await updateDoc(publicRef, {
                    cardIds: updatedCardIds,
                    updatedAt: new Date()
                  });
                }
              } catch (err) {
                console.error(`[directDeleteCard] Error updating public display case (non-fatal):`, err);
              }
            }
          } catch (updateError) {
            console.error(`[directDeleteCard] Error updating display case ${dcDoc.id}:`, updateError);
          }
        }
      }
      
      if (updatedCount > 0) {
        console.log(`[directDeleteCard] Removed card from ${updatedCount} display cases`);
      } else {
        console.log(`[directDeleteCard] Card was not found in any display cases`);
      }
    } catch (error) {
      console.error(`[directDeleteCard] Error cleaning up display cases (non-fatal):`, error);
      // Don't fail the overall operation if this part fails
    }
    
    // If we got here, the card was deleted successfully
    console.log(`[directDeleteCard] Card deletion completed successfully`);
    toast.success("Card deleted successfully");
    return true;
  } catch (error) {
    console.error(`[directDeleteCard] Fatal error during card deletion:`, error);
    
    // Create a user-friendly error message
    let errorMessage = "Failed to delete card";
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        errorMessage = "Permission denied. You don't have access to delete this card.";
      } else if (error.message.includes('not-found')) {
        errorMessage = "Card not found or already deleted.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    toast.error(errorMessage);
    return false;
  }
} 