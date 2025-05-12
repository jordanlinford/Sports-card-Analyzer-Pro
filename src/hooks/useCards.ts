import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCards, addCard, deleteCard } from "@/lib/firebase/cards";
import { Card } from "@/types/Card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function useCards() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading: cardsLoading, 
    error, 
    isFetching,
    refetch 
  } = useQuery<Card[], Error>({
    queryKey: ["cards", user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        console.log("useCards: No user ID available");
        return [];
      }
      console.log("useCards: Fetching cards for user", user.uid);
      try {
        const cards = await getCards(user.uid);
        console.log(`useCards: Retrieved ${cards.length} cards`);
        
        // Verify data integrity for debugging
        const cardsWithValues = cards.filter(card => 
          card.currentValue || card.price || card.pricePaid
        );
        console.log(`useCards: Cards with value data: ${cardsWithValues.length}/${cards.length}`);
        
        // Ensure numeric values are properly converted
        const processedCards = cards.map(card => ({
          ...card,
          currentValue: card.currentValue ? Number(card.currentValue) : undefined,
          price: card.price ? Number(card.price) : undefined,
          pricePaid: card.pricePaid ? Number(card.pricePaid) : undefined
        }));
        
        return processedCards;
      } catch (err) {
        console.error("useCards: Error while fetching cards:", err);
        toast.error("Failed to load cards. Please try again.");
        throw err;
      }
    },
    enabled: !!user?.uid && !authLoading,
    retry: 2,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Force a fresh retry on error
  if (error) {
    console.error("useCards: Error fetching cards:", error);
  }

  const addCardMutation = useMutation({
    mutationFn: async (card: Omit<Card, "id" | "createdAt" | "updatedAt"> & { ownerId: string }) => {
      console.log("useCards: Starting addCard mutation", { card });
      if (!user?.uid) {
        console.error("useCards: No user ID available for addCard");
        throw new Error("User must be logged in to add cards");
      }
      try {
        const result = await addCard(card);
        console.log("useCards: Successfully added card", { result });
        return result;
      } catch (error) {
        console.error("useCards: Error in addCard mutation", { error, card });
        throw error;
      }
    },
    onSuccess: (cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards", user?.uid] });
      
      // Display info about display case syncing
      toast.success("Card added successfully! It will appear in any display cases with matching tags.");
    },
    onError: (error) => {
      console.error("useCards: Error adding card", { error });
      toast.error(error instanceof Error ? error.message : "Failed to add card");
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      console.log("useCards: Starting deleteCard mutation for card", cardId);
      if (!user?.uid) {
        console.error("useCards: No user ID available for deleteCard");
        throw new Error("You must be logged in to delete cards");
      }
      
      try {
        console.log(`useCards: Calling deleteCard with cardId=${cardId}, userId=${user.uid}`);
        await deleteCard(cardId, user.uid);
        console.log("useCards: Successfully deleted card", cardId);
        return cardId;
      } catch (error) {
        console.error("useCards: Error in deleteCard mutation:", error);
        // Check if Firebase returned a specific error code
        if (error instanceof Error) {
          const errorString = error.toString();
          
          if (errorString.includes("permission-denied")) {
            throw new Error("Permission denied: You don't have access to delete this card.");
          } else if (errorString.includes("not-found")) {
            throw new Error("Card not found. It may have already been deleted.");
          }
        }
        throw error;
      }
    },
    onSuccess: (cardId) => {
      console.log("useCards: DeleteCard mutation successful for card", cardId);
      // Properly invalidate all queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["cards", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["displayCases", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["publicDisplayCases"] });
      toast.success("Card deleted successfully");
    },
    onError: (error: any) => {
      console.error("useCards: Error deleting card:", error);
      
      // Provide a more user-friendly error message
      const errorMessage = error?.message || "Failed to delete card";
      toast.error(errorMessage);
    },
  });

  const retryFetchCards = () => {
    if (error) {
      toast.info("Retrying to load your cards...");
      refetch();
    }
  };

  return {
    data: data || [],
    isLoading: cardsLoading || authLoading || isFetching,
    error,
    addCard: addCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    retryFetchCards
  };
} 