import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCards, addCard, deleteCard } from "@/lib/firebase/cards";
import { Card } from "@/types/Card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function useCards() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Card[], Error>({
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
        throw err;
      }
    },
    enabled: !!user?.uid && !loading,
    retry: 1
  });

  // Show error toast when query fails
  if (error) {
    console.error("useCards: Error fetching cards:", error);
    toast.error("Failed to load cards. Please try again.");
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
    mutationFn: (cardId: string) => {
      if (!user?.uid) throw new Error("No user ID available");
      return deleteCard(cardId, user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Card deleted successfully");
    },
    onError: (error: Error) => {
      console.error("useCards: Error deleting card:", error);
      toast.error("Failed to delete card");
    },
  });

  return {
    data,
    isLoading: isLoading || loading,
    error,
    addCard: addCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
  };
} 