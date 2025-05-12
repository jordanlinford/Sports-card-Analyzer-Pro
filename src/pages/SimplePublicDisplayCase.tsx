import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/types/Card";
import { NewCommentSection } from "@/components/display-cases/NewCommentSection";
import LikeButton from "@/components/display/LikeButton";
import { EnhancedShareButton } from "@/components/display/EnhancedShareButton";
import { MessageSellerButton } from "@/components/display/MessageSellerButton";
import { SyncDisplayCase } from '@/components/display-cases/SyncDisplayCase';
import { DirectFixer } from '@/components/display-cases/DirectFixer';
import { ensurePublicDisplayCase } from '@/utils/displayCaseUtils';

// Define a proper interface for DisplayCase
interface DisplayCase {
  id: string;
  name: string;
  description?: string;
  userId?: string;
  cardIds?: string[];
  isPublic?: boolean;
  background?: string;
  createdAt: Date;
  updatedAt: Date;
  likes?: number;
  comments?: any[];
}

export default function SimplePublicDisplayCase() {
  const { publicId } = useParams<{ publicId: string }>();
  const { user } = useAuth();
  const [displayCase, setDisplayCase] = useState<DisplayCase | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  // Load the display case
  useEffect(() => {
    async function loadDisplayCase() {
      if (!publicId) return;
      
      try {
        setIsLoading(true);
        const displayCaseRef = doc(db, "public_display_cases", publicId);
        const displayCaseSnap = await getDoc(displayCaseRef);
        
        if (!displayCaseSnap.exists()) {
          console.log("Display case not found, attempting auto-recovery");
          
          // Try to auto-recover the display case
          if (user) {
            try {
              const recovered = await ensurePublicDisplayCase(publicId, user.uid);
              if (recovered) {
                console.log("Successfully recovered display case, reloading");
                // Reload the display case
                const refreshedSnap = await getDoc(displayCaseRef);
                if (refreshedSnap.exists()) {
                  const data = refreshedSnap.data();
                  const displayCaseData: DisplayCase = {
                    id: refreshedSnap.id,
                    name: data.name || "Untitled Display Case",
                    description: data.description,
                    userId: data.userId,
                    cardIds: data.cardIds || [],
                    isPublic: data.isPublic !== false,
                    background: data.background || "default",
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    likes: data.likes || 0,
                    comments: data.comments || []
                  };
                  
                  setDisplayCase(displayCaseData);
                  
                  // Check if current user is the owner
                  if (user && displayCaseData.userId === user.uid) {
                    setIsOwner(true);
                  }
                  
                  // Auto-load cards
                  await loadCardsForDisplayCase(displayCaseData);
                  setIsLoading(false);
                  return;
                }
              }
            } catch (err) {
              console.error("Auto-recovery failed:", err);
            }
          }
          
          setIsLoading(false);
          return;
        }
        
        const data = displayCaseSnap.data();
        const displayCaseData: DisplayCase = {
          id: displayCaseSnap.id,
          name: data.name || "Untitled Display Case",
          description: data.description,
          userId: data.userId,
          cardIds: data.cardIds || [],
          isPublic: data.isPublic !== false,
          background: data.background || "default",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          likes: data.likes || 0,
          comments: data.comments || []
        };
        
        setDisplayCase(displayCaseData);
        
        // Check if current user is the owner
        if (user && displayCaseData.userId === user.uid) {
          setIsOwner(true);
        }
        
        // Load cards if there are any card IDs
        await loadCardsForDisplayCase(displayCaseData);
      } catch (error) {
        console.error("Error loading display case:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    async function loadCardsForDisplayCase(displayCaseData: DisplayCase) {
      if (displayCaseData.cardIds && displayCaseData.cardIds.length > 0) {
        const cardPromises = displayCaseData.cardIds.map(async (cardId: string) => {
          // Skip example cards
          if (cardId === 'card1' || cardId === 'card2' || cardId === 'card3') {
            return null;
          }
          
          try {
            // Try to get the card from the cards collection
            const cardRef = doc(db, "cards", cardId);
            const cardSnap = await getDoc(cardRef);
            
            if (cardSnap.exists()) {
              return { id: cardSnap.id, ...cardSnap.data() } as Card;
            }
            
            // If card not in main collection, try user's collection
            if (displayCaseData.userId) {
              const userCardRef = doc(db, "users", displayCaseData.userId, "collection", cardId);
              const userCardSnap = await getDoc(userCardRef);
              
              if (userCardSnap.exists()) {
                return { id: userCardSnap.id, ...userCardSnap.data() } as Card;
              }
            }
            
            console.warn(`Card ${cardId} not found`);
            return null;
          } catch (err) {
            console.error(`Error loading card ${cardId}:`, err);
            return null;
          }
        });
        
        const loadedCards = await Promise.all(cardPromises);
        const validCards = loadedCards.filter(Boolean) as Card[];
        setCards(validCards);
      }
    }
    
    loadDisplayCase();
  }, [publicId, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading Display Case</h2>
          <p className="text-sm text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!displayCase) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
        <h1 className="text-xl font-bold mb-4">Display Case Not Found</h1>
        <p className="text-gray-600 mb-4">
          This display case doesn't exist or may have been removed.
        </p>
        
        {publicId && user && (
          <div className="mt-8 p-4 border border-amber-200 bg-amber-50 rounded-md">
            <h3 className="font-semibold mb-2">Fix Missing Display Case</h3>
            <p className="text-sm mb-4">
              If you're the owner of this display case, we can try to recover it from your private collection.
            </p>
            <Button
              onClick={async () => {
                if (!publicId) return;
                setIsFixing(true);
                setFixResult(null);
                try {
                  const result = await ensurePublicDisplayCase(publicId, user.uid);
                  if (result) {
                    setFixResult("Display case recovered! Refreshing page...");
                    setTimeout(() => window.location.reload(), 1500);
                  } else {
                    setFixResult("Couldn't recover display case. Make sure you've created it and added cards.");
                  }
                } catch (error) {
                  console.error("Error fixing display case:", error);
                  setFixResult(`Error: ${String(error)}`);
                } finally {
                  setIsFixing(false);
                }
              }}
              disabled={isFixing}
            >
              {isFixing ? "Attempting to recover..." : "Recover My Display Case"}
            </Button>
            
            {fixResult && (
              <div className={`mt-3 p-2 text-sm rounded ${fixResult.includes("Error") || fixResult.includes("Couldn't") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {fixResult}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Display Case Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">{displayCase.name}</h1>
          {displayCase.description && (
            <p className="text-gray-500 max-w-2xl mx-auto">{displayCase.description}</p>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
          <span>Created: {displayCase.createdAt.toLocaleDateString()}</span>
          <LikeButton displayCaseId={displayCase.id} />
        </div>

        <div className="flex justify-center space-x-2">
          <EnhancedShareButton 
            publicId={displayCase.id} 
            title={displayCase.name}
          />
          {displayCase.userId && (
            <MessageSellerButton 
              sellerId={displayCase.userId} 
              displayCaseId={displayCase.id}
              sellerName="Owner"
            />
          )}
        </div>
      </div>

      {/* Cards Display */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Cards</h2>
        </div>

        {cards.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-3xl mb-2">📭</div>
            <h3 className="text-xl font-medium mb-2">Empty Display Case</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              This display case doesn't contain any cards from the owner's collection.
            </p>
            
            {isOwner ? (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                <p className="text-amber-800 mb-2 font-medium">You own this display case</p>
                <p className="text-amber-700 text-sm mb-4">
                  Add cards from your collection to showcase them here.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => window.location.href = `/display-case/${publicId}`}
                    size="sm"
                    className="w-full"
                  >
                    Manage This Display Case
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = "/collection"}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Go To My Collection
                  </Button>

                  <div className="pt-4 mt-4 border-t border-amber-200">
                    <details className="text-left">
                      <summary className="cursor-pointer text-amber-800 font-medium text-sm">Troubleshooting Options</summary>
                      <div className="mt-3 space-y-2">
                        <p className="text-amber-700 text-xs mb-2">
                          If you've already added cards to your display case but they're not showing here, try these options:
                        </p>
                        <Button 
                          onClick={async () => {
                            if (!publicId || !user) return;
                            try {
                              setIsLoading(true);
                              // Direct approach - sync cards from private to public
                              const privateRef = doc(db, "users", user.uid, "display_cases", publicId);
                              const privateSnap = await getDoc(privateRef);
                              
                              if (privateSnap.exists() && privateSnap.data().cardIds?.length) {
                                const cardIds = privateSnap.data().cardIds;
                                
                                // Update public display case
                                const publicRef = doc(db, "public_display_cases", publicId);
                                await updateDoc(publicRef, {
                                  cardIds: cardIds,
                                  updatedAt: new Date()
                                });
                                
                                // Reload the page
                                window.location.reload();
                              } else {
                                alert("No cards found in your private display case. Add cards in the Manage Display Case page first.");
                              }
                            } catch (error) {
                              console.error("Error syncing cards:", error);
                              alert("Error syncing cards: " + String(error));
                            } finally {
                              setIsLoading(false);
                            }
                          }} 
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                        >
                          Force Sync Cards From Private Case
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            if (!publicId) return;
                            // Direct link to display case with debug mode
                            window.location.href = `/display-case/${publicId}?debug=true`;
                          }}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                        >
                          Debug Display Case
                        </Button>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <p className="text-blue-800 text-sm mb-4">
                  This collector hasn't added any cards to their display case yet.
                </p>
                <Button 
                  onClick={() => window.location.href = "/display-cases"}
                  size="sm"
                  variant="outline"
                >
                  Browse Other Display Cases
                </Button>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-md mx-auto">
                <p className="text-gray-700 text-sm mb-4">
                  This collector hasn't added any cards to their display case yet.
                </p>
                <p className="text-gray-500 text-xs">
                  Sign in to create your own display cases and showcase your collection.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map((card: Card) => (
                <div key={card.id} className="relative group">
                  {card.imageUrl ? (
                    <>
                      <img 
                        src={card.imageUrl} 
                        alt={`${card.playerName} ${card.year} ${card.cardSet}`}
                        className="rounded-xl w-full shadow-md aspect-[2/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-sm rounded-xl p-2">
                        <div className="text-center">
                          <div className="font-semibold">{card.playerName}</div>
                          <div className="text-xs">{card.year} {card.cardSet}</div>
                          {card.price && (
                            <div className="text-xs mt-1">${card.price.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl w-full shadow-md aspect-[2/3] bg-gray-100 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="font-semibold">{card.playerName}</div>
                        <div className="text-xs text-gray-600">
                          {card.year} {card.cardSet}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="block md:hidden text-xs text-gray-400 mt-2 text-center">
              Tap cards to view details
            </div>
          </>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <NewCommentSection displayCaseId={displayCase.id} />
      </div>
    </div>
  );
} 