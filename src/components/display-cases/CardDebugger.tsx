import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/types/Card";

export function CardDebugger({ displayCaseId, cardIds }: { displayCaseId: string; cardIds: string[] }) {
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<{[key: string]: any}>({});
  
  const checkCards = async () => {
    setIsLoading(true);
    const results: {[key: string]: any} = {};
    
    try {
      // Check each card in the cards collection
      for (const cardId of cardIds) {
        try {
          const cardRef = doc(db, "cards", cardId);
          const cardDoc = await getDoc(cardRef);
          
          results[cardId] = {
            exists: cardDoc.exists(),
            data: cardDoc.exists() ? cardDoc.data() : null,
            error: null
          };
        } catch (err) {
          results[cardId] = {
            exists: false,
            data: null,
            error: String(err)
          };
        }
      }
      
      setCardData(results);
    } catch (error) {
      console.error("Error checking cards:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        className="mb-2"
        onClick={() => setIsDebugVisible(!isDebugVisible)}
      >
        {isDebugVisible ? "Hide Card Debug" : "Show Card Debug"}
      </Button>
      
      {isDebugVisible && (
        <div className="mt-2 border border-amber-200 bg-amber-50 p-4 rounded-md">
          <div className="mb-2">
            <h3 className="font-medium">Card Debugger</h3>
            <p className="text-sm text-gray-500">
              This tool checks if the cards in this display case exist in the Firestore database.
            </p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm">
              Display Case ID: <span className="font-mono text-xs bg-gray-100 px-1 rounded">{displayCaseId}</span>
            </p>
            <p className="text-sm">
              Card IDs: {cardIds.length > 0 ? (
                <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                  {cardIds.join(', ')}
                </span>
              ) : (
                <span className="text-red-500">No card IDs found</span>
              )}
            </p>
          </div>
          
          <Button 
            size="sm"
            variant="secondary"
            onClick={checkCards}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Check Cards"}
          </Button>
          
          {Object.keys(cardData).length > 0 && (
            <div className="mt-4 bg-white p-3 rounded border border-gray-200 max-h-60 overflow-auto">
              <h4 className="font-medium mb-2">Results:</h4>
              {Object.entries(cardData).map(([cardId, info]) => (
                <div key={cardId} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <p className="font-mono text-xs mb-1">ID: {cardId}</p>
                  <p className="text-xs">
                    Status: 
                    <span className={info.exists ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                      {info.exists ? "Found" : "Not Found"}
                    </span>
                  </p>
                  {info.exists && info.data && (
                    <div className="text-xs mt-1 pl-2 border-l-2 border-green-200">
                      <p>Name: {info.data.playerName || "Unknown"}</p>
                      <p>Year: {info.data.year || "N/A"}</p>
                      <p>Set: {info.data.cardSet || "N/A"}</p>
                      <p>Image: {info.data.imageUrl ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {info.error && (
                    <p className="text-xs text-red-500 mt-1">Error: {info.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 