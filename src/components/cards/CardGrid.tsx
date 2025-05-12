import { PlaceholderCard } from "@/components/ui/placeholder-card";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/types/Card";

interface CardGridProps {
  cards: string[];
}

export function CardGrid({ cards }: CardGridProps) {
  const [cardData, setCardData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCardData() {
      if (!user?.uid || !cards.length) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching card data for IDs:", cards);
        const fetchedCards: Card[] = [];

        // Try both potential card paths
        for (const cardId of cards) {
          let cardDoc = null;
          
          // Try cards collection first
          try {
            const cardRef = doc(db, "users", user.uid, "cards", cardId);
            const cardSnapshot = await getDoc(cardRef);
            
            if (cardSnapshot.exists()) {
              cardDoc = {
                id: cardSnapshot.id,
                ...cardSnapshot.data()
              } as Card;
              console.log("Found card in cards collection:", cardDoc);
            }
          } catch (error) {
            console.log("Error fetching from cards collection:", error);
          }
          
          // If not found, try collection path
          if (!cardDoc) {
            try {
              const collectionRef = doc(db, "users", user.uid, "collection", cardId);
              const collectionSnapshot = await getDoc(collectionRef);
              
              if (collectionSnapshot.exists()) {
                cardDoc = {
                  id: collectionSnapshot.id,
                  ...collectionSnapshot.data()
                } as Card;
                console.log("Found card in collection:", cardDoc);
              }
            } catch (error) {
              console.log("Error fetching from collection:", error);
            }
          }

          if (cardDoc) {
            fetchedCards.push(cardDoc);
          } else {
            console.log("Could not find card with ID:", cardId);
          }
        }

        console.log("Fetched cards:", fetchedCards);
        setCardData(fetchedCards);
      } catch (error) {
        console.error("Error fetching card data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCardData();
  }, [cards, user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(cards.length || 4).fill(0).map((_, i) => (
          <PlaceholderCard key={i} className="animate-pulse" />
        ))}
      </div>
    );
  }

  if (!cards || cards.length === 0 || cardData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No cards in this display case yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cardData.map((card) => (
        <div key={card.id} className="relative group">
          {card.imageUrl ? (
            <img 
              src={card.imageUrl} 
              alt={card.playerName || "Card"} 
              className="w-full h-auto rounded-lg border object-cover aspect-[3/4]"
            />
          ) : (
            <PlaceholderCard />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-xs rounded-lg p-2">
            <div className="text-center">
              <div className="font-semibold">{card.playerName || "Unknown"}</div>
              <div>{card.year} {card.cardSet}</div>
              <div className="mt-1">{card.condition}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 