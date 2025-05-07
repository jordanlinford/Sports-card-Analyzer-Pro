import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Card } from "@/types/Card";
import { CardGrid } from "@/components/cards/CardGrid";
import { cn } from "@/lib/utils";
import { DisplayCase } from "@/types/display-case";
import { useAuth } from "@/context/AuthContext";

const themeStyles = {
  wood: "bg-amber-50 border-amber-200",
  velvet: "bg-purple-50 border-purple-200",
  glass: "bg-blue-50 border-blue-200",
} as const;

const CardDebugger = ({ cards }: { cards: Card[] }) => {
  const [showDebug, setShowDebug] = useState(false);
  
  if (cards.length === 0) return <div className="p-3 bg-red-100 text-red-700 rounded mb-4">No cards found</div>;
  
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Card Data Debugger</h3>
        <button 
          onClick={() => setShowDebug(!showDebug)} 
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          {showDebug ? 'Hide' : 'Show'} Details
        </button>
      </div>
      <div>Found {cards.length} cards</div>
      
      {showDebug && (
        <div className="mt-3 space-y-3 max-h-80 overflow-auto">
          {cards.map((card, i) => (
            <div key={i} className="border p-3 rounded bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>ID:</strong> {card.id}</p>
                  <p><strong>Player:</strong> {card.playerName}</p>
                  <p><strong>Tags:</strong> {Array.isArray(card.tags) ? card.tags.join(', ') : 'No tags'}</p>
                  <p className="break-all"><strong>Image URL:</strong> {card.imageUrl || 'MISSING'}</p>
                </div>
                <div>
                  {card.imageUrl ? (
                    <div>
                      <p className="mb-1 text-green-600">Image Preview:</p>
                      <img 
                        src={card.imageUrl} 
                        alt={card.playerName || 'Card'}
                        className="max-h-40 border object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="bg-red-50 p-2 text-red-600">No image URL available</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function DisplayCaseDetailPage() {
  const { id } = useParams();
  const [displayCase, setDisplayCase] = useState<DisplayCase | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // First fetch the display case
  useEffect(() => {
    async function fetchDisplayCase() {
      if (!id || !user?.uid) return;
      
      setLoading(true);
      
      try {
        console.log("Fetching display case with ID:", id);
        
        // First, try to get it from the user's display cases
        const userDisplayCaseRef = doc(db, "users", user.uid, "display_cases", id);
        let displayCaseSnapshot = await getDoc(userDisplayCaseRef);
        
        // If not found and it might be public, try the public collection
        if (!displayCaseSnapshot.exists()) {
          console.log("Display case not found in user's collection, trying public collection");
          const publicDisplayCaseRef = doc(db, "public_display_cases", id);
          displayCaseSnapshot = await getDoc(publicDisplayCaseRef);
        }

        if (displayCaseSnapshot.exists()) {
          const caseData = {
            id: displayCaseSnapshot.id,
            ...displayCaseSnapshot.data()
          } as DisplayCase;
          
          console.log("Found display case:", caseData);
          setDisplayCase(caseData);
          
          // Store card IDs for the second fetch
          setCardIds(caseData.cardIds || []);
        } else {
          console.log("Display case not found in either location");
          setError("Display case not found.");
        }
      } catch (err) {
        console.error("Error fetching display case:", err);
        setError("Failed to load display case.");
      } finally {
        setLoading(false);
      }
    }

    fetchDisplayCase();
  }, [id, user]);

  // Now that we have the display case data, we can use tag matching to find cards
  useEffect(() => {
    async function fetchMatchingCards() {
      if (!user?.uid || !displayCase) return;
      
      try {
        console.log("Fetching cards for display case with tags:", displayCase.tags);
        
        const cards: Card[] = [];
        
        // Method 1: If we have cardIds, fetch those specific cards
        if (cardIds.length > 0) {
          console.log("Fetching specific cards by ID:", cardIds);
          
          for (const cardId of cardIds) {
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
                }
              } catch (error) {
                console.log("Error fetching from collection:", error);
              }
            }
            
            if (cardDoc) {
              cards.push(cardDoc);
            }
          }
        } 
        // Method 2: Tag matching (if no cardIds or we want to supplement)
        else if (displayCase.tags && displayCase.tags.length > 0) {
          console.log("No cardIds, using tag matching instead");
          
          // Try in cards collection
          try {
            const cardsRef = collection(db, "users", user.uid, "cards");
            const cardsSnapshot = await getDocs(cardsRef);
            
            cardsSnapshot.forEach(doc => {
              const cardData = doc.data();
              const cardTags = Array.isArray(cardData.tags) ? cardData.tags : [];
              const displayCaseTags = displayCase.tags;
              
              // Check if any tags match
              if (cardTags.some(tag => displayCaseTags.includes(tag))) {
                cards.push({
                  id: doc.id,
                  ...cardData
                } as Card);
              }
            });
          } catch (error) {
            console.log("Error fetching from cards collection for tag matching:", error);
          }
          
          // Try in collection path
          try {
            const collectionRef = collection(db, "users", user.uid, "collection");
            const collectionSnapshot = await getDocs(collectionRef);
            
            collectionSnapshot.forEach(doc => {
              const cardData = doc.data();
              const cardTags = Array.isArray(cardData.tags) ? cardData.tags : [];
              const displayCaseTags = displayCase.tags;
              
              // Check if any tags match
              if (cardTags.some(tag => displayCaseTags.includes(tag))) {
                // Check if this card is already included (from previous collection)
                if (!cards.some(c => c.id === doc.id)) {
                  cards.push({
                    id: doc.id,
                    ...cardData
                  } as Card);
                }
              }
            });
          } catch (error) {
            console.log("Error fetching from collection for tag matching:", error);
          }
        }
        
        console.log("Found matching cards:", cards);
        setCards(cards);
      } catch (error) {
        console.error("Error fetching matching cards:", error);
      }
    }
    
    fetchMatchingCards();
  }, [displayCase, cardIds, user]);

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen py-10",
        displayCase?.theme ? themeStyles[displayCase.theme] : "bg-muted"
      )}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-4" />
            <div className="h-4 w-48 bg-muted rounded mb-6" />
            <div className="h-4 w-full bg-muted rounded mb-6" />
            <div className="h-[60vh] w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!displayCase) return null;

  return (
    <div className={cn(
      "min-h-screen py-10",
      themeStyles[displayCase.theme]
    )}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{displayCase.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">
            {displayCase.createdAt && 
              `Created on ${new Date(
                displayCase.createdAt.seconds ? displayCase.createdAt.seconds * 1000 : displayCase.createdAt
              ).toLocaleDateString()}`
            }
          </p>
          {displayCase.tags && displayCase.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {displayCase.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-1 rounded-full border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <CardDebugger cards={cards} />
          {/* Render actual card images instead of just IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.length > 0 ? (
              cards.map((card) => (
                <div key={card.id} className="relative group">
                  {card.imageUrl ? (
                    <img 
                      src={card.imageUrl} 
                      alt={card.playerName || "Card"} 
                      className="w-full h-auto rounded-lg border object-contain aspect-[3/4]"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">{card.playerName || "No Image"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-xs rounded-lg p-2">
                    <div className="text-center">
                      <div className="font-semibold">{card.playerName || "Unknown"}</div>
                      <div>{card.year} {card.cardSet}</div>
                      <div className="mt-1">{card.condition}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No cards in this display case yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 