import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/types/Card";
import { useAuth } from "@/context/AuthContext";

export function DisplayCaseDebugger() {
  const [displayCaseId, setDisplayCaseId] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCardIds, setManualCardIds] = useState("");
  const { user } = useAuth();

  const debugDisplayCase = async () => {
    if (!displayCaseId.trim()) return;
    
    setIsLoading(true);
    setDebugInfo(null);
    setCards([]);
    
    try {
      // Check in public_display_cases
      console.log("Checking public_display_cases collection");
      const publicDoc = await getDoc(doc(db, "public_display_cases", displayCaseId));
      
      if (publicDoc.exists()) {
        const data = publicDoc.data();
        setDebugInfo({
          source: "public_display_cases",
          id: publicDoc.id,
          data
        });
        
        // Try to fetch cards
        if (data.cardIds?.length) {
          const fetchedCards: Card[] = [];
          for (const cardId of data.cardIds) {
            const cardDoc = await getDoc(doc(db, "cards", cardId));
            if (cardDoc.exists()) {
              fetchedCards.push({
                id: cardDoc.id,
                ...cardDoc.data()
              } as Card);
            }
          }
          setCards(fetchedCards);
        }
      } else {
        // Check in displayCases 
        console.log("Checking displayCases collection");
        const displayCaseDoc = await getDoc(doc(db, "displayCases", displayCaseId));
        
        if (displayCaseDoc.exists()) {
          const data = displayCaseDoc.data();
          setDebugInfo({
            source: "displayCases",
            id: displayCaseDoc.id,
            data
          });
          
          // Try to fetch cards
          if (data.cardIds?.length) {
            const fetchedCards: Card[] = [];
            for (const cardId of data.cardIds) {
              const cardDoc = await getDoc(doc(db, "cards", cardId));
              if (cardDoc.exists()) {
                fetchedCards.push({
                  id: cardDoc.id,
                  ...cardDoc.data()
                } as Card);
              }
            }
            setCards(fetchedCards);
          }
        } else {
          setDebugInfo({
            error: "Display case not found in any collection"
          });
        }
      }
    } catch (error) {
      console.error("Error debugging display case:", error);
      setDebugInfo({
        error: "Error debugging display case: " + String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fixDisplayCase = async () => {
    if (!debugInfo || !displayCaseId || !debugInfo.data) return;
    
    try {
      if (debugInfo.source === "public_display_cases") {
        // Fix the public display case by copying cardIds from the original
        if (debugInfo.data.userId) {
          const userDisplayCaseRef = doc(db, "users", debugInfo.data.userId, "display_cases", displayCaseId);
          const originalDoc = await getDoc(userDisplayCaseRef);
          
          if (originalDoc.exists()) {
            const originalData = originalDoc.data();
            if (originalData.cardIds?.length) {
              // Update the public version with the cardIds from the original
              await updateDoc(doc(db, "public_display_cases", displayCaseId), {
                cardIds: originalData.cardIds
              });
              setDebugInfo({
                ...debugInfo,
                fixed: true,
                message: `Fixed by copying ${originalData.cardIds.length} cardIds from user's display case`
              });
              
              // Re-fetch to show updated info
              debugDisplayCase();
            } else {
              setDebugInfo({
                ...debugInfo,
                warning: "Original display case has no cardIds"
              });
            }
          } else {
            // Try displayCases collection as fallback
            const fallbackRef = doc(db, "displayCases", displayCaseId);
            const fallbackDoc = await getDoc(fallbackRef);
            
            if (fallbackDoc.exists()) {
              const fallbackData = fallbackDoc.data();
              if (fallbackData.cardIds?.length) {
                // Update the public version with these cardIds
                await updateDoc(doc(db, "public_display_cases", displayCaseId), {
                  cardIds: fallbackData.cardIds
                });
                setDebugInfo({
                  ...debugInfo,
                  fixed: true,
                  message: `Fixed by copying ${fallbackData.cardIds.length} cardIds from displayCases collection`
                });
                
                // Re-fetch to show updated info
                debugDisplayCase();
              }
            } else {
              setDebugInfo({
                ...debugInfo,
                error: "Could not find original display case to copy cardIds from"
              });
            }
          }
        } else {
          setDebugInfo({
            ...debugInfo,
            error: "No userId found in display case data"
          });
        }
      }
    } catch (error) {
      console.error("Error fixing display case:", error);
      setDebugInfo({
        ...debugInfo,
        fixError: String(error)
      });
    }
  };

  // Function to manually recreate a public display case
  const recreatePublicDisplayCase = async () => {
    if (!user || !displayCaseId || !debugInfo) return;
    
    try {
      // First check if there's a source display case to get data from
      const userDisplayCaseRef = doc(db, "users", user.uid, "display_cases", displayCaseId);
      const displayCaseDoc = await getDoc(userDisplayCaseRef);
      
      if (displayCaseDoc.exists()) {
        const sourceData = displayCaseDoc.data();
        const cardIds = manualCardIds.split(',').map(id => id.trim()).filter(id => id);
        
        // Create/update the public display case
        await setDoc(doc(db, "public_display_cases", displayCaseId), {
          name: sourceData.name || "Display Case",
          description: sourceData.description || "",
          isPublic: true,
          userId: user.uid,
          ownerName: user.displayName || "User",
          cardIds: cardIds.length > 0 ? cardIds : (sourceData.cardIds || []),
          createdAt: sourceData.createdAt || new Date(),
          updatedAt: new Date(),
          tags: sourceData.tags || [],
          theme: sourceData.theme || "wood",
        });
        
        setDebugInfo({
          ...debugInfo,
          manuallyFixed: true,
          message: "Public display case manually recreated"
        });
        
        // Re-fetch to show updated info
        debugDisplayCase();
      } else {
        // No source display case, create a minimal one
        const cardIds = manualCardIds.split(',').map(id => id.trim()).filter(id => id);
        
        if (cardIds.length === 0) {
          setDebugInfo({
            ...debugInfo,
            error: "Please enter at least one card ID in the manual card IDs field"
          });
          return;
        }
        
        await setDoc(doc(db, "public_display_cases", displayCaseId), {
          name: "Manually Created Display Case",
          description: "Created via debugging tool",
          isPublic: true,
          userId: user.uid,
          ownerName: user.displayName || "User",
          cardIds: cardIds,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          theme: "wood",
        });
        
        setDebugInfo({
          ...debugInfo,
          manuallyFixed: true,
          message: "Created new public display case with provided card IDs"
        });
        
        // Re-fetch to show updated info
        debugDisplayCase();
      }
    } catch (error) {
      console.error("Error recreating public display case:", error);
      setDebugInfo({
        ...debugInfo,
        manualError: String(error)
      });
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Display Case Debugger</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter display case ID"
          value={displayCaseId}
          onChange={(e) => setDisplayCaseId(e.target.value)}
        />
        <Button onClick={debugDisplayCase} disabled={isLoading}>
          {isLoading ? "Checking..." : "Debug"}
        </Button>
      </div>
      
      {debugInfo && (
        <div className="mt-4">
          <div className="p-3 bg-gray-50 rounded-md mb-4 overflow-auto max-h-80">
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          
          <div className="space-y-3">
            {debugInfo.source === "public_display_cases" && !debugInfo.fixed && (
              <Button onClick={fixDisplayCase} variant="outline" size="sm">
                Attempt to Fix cardIds
              </Button>
            )}
            
            <div className="mt-4 p-3 border rounded-lg">
              <h3 className="font-medium mb-2">Manual Fix (Advanced)</h3>
              <div className="mb-3">
                <label className="text-sm text-gray-600 block mb-1">
                  Enter comma-separated card IDs:
                </label>
                <Input
                  placeholder="e.g. card1,card2,card3"
                  value={manualCardIds}
                  onChange={(e) => setManualCardIds(e.target.value)}
                  className="mb-2"
                />
                <Button 
                  onClick={recreatePublicDisplayCase} 
                  variant="outline" 
                  size="sm"
                  disabled={!user || !displayCaseId}
                >
                  Recreate Public Display Case
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-amber-600">
                  You must be logged in to use this feature
                </p>
              )}
            </div>
          </div>
          
          {cards.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Found {cards.length} cards:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {cards.map(card => (
                  <div key={card.id} className="p-2 border rounded">
                    <p className="font-medium">{card.playerName}</p>
                    <p className="text-sm text-gray-500">{card.cardSet}</p>
                    {card.imageUrl && <img src={card.imageUrl} alt={card.playerName} className="mt-2 w-full h-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 