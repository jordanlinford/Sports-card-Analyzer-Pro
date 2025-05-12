import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DebugInfo {
  publicData?: {
    exists: boolean;
    id: string;
    isPublic?: boolean;
  };
  cardIds?: {
    exists: boolean;
    isArray: boolean;
    length: number;
    type: string;
  };
  cardsFound?: number;
  timestamp?: string;
  error?: string;
  fixed?: boolean;
  fixedWith?: string[];
}

export function DisplayCaseDebugging({ displayCaseId }: { displayCaseId: string }) {
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [fixOption, setFixOption] = useState("sync");
  
  // Display case inspection info
  useEffect(() => {
    if (!isDebugVisible) return;
    
    const inspectDisplayCase = async () => {
      try {
        // Check public display case
        const publicRef = doc(db, "public_display_cases", displayCaseId);
        const publicDoc = await getDoc(publicRef);
        const publicData = publicDoc.exists() ? publicDoc.data() : null;
        
        // Get card IDs info
        const cardIds = publicData?.cardIds || [];
        const cardIdInfo = {
          exists: !!publicData?.cardIds,
          isArray: Array.isArray(publicData?.cardIds),
          length: Array.isArray(publicData?.cardIds) ? publicData?.cardIds.length : 0,
          type: typeof publicData?.cardIds
        };
        
        // Check cards collection for card IDs
        let cardsFound = 0;
        if (Array.isArray(cardIds) && cardIds.length > 0) {
          for (const cardId of cardIds.slice(0, 3)) {
            const cardRef = doc(db, "cards", cardId);
            const cardDoc = await getDoc(cardRef);
            if (cardDoc.exists()) cardsFound++;
          }
        }
        
        setDebugInfo({
          publicData: {
            exists: publicDoc.exists(),
            id: displayCaseId,
            isPublic: publicData?.isPublic,
          },
          cardIds: cardIdInfo,
          cardsFound,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error inspecting display case:", error);
        setDebugInfo({
          error: String(error),
          timestamp: new Date().toISOString()
        });
      }
    };
    
    inspectDisplayCase();
  }, [displayCaseId, isDebugVisible]);
  
  // Fix the display case
  const fixDisplayCase = async () => {
    setIsFixing(true);
    
    try {
      // Hard code some example cards
      const exampleCardIds = ["card1", "card2", "card3"];
      
      // Update with new card IDs
      const publicRef = doc(db, "public_display_cases", displayCaseId);
      await updateDoc(publicRef, {
        cardIds: exampleCardIds
      });
      
      toast.success("Display case updated with example card IDs");
      setDebugInfo((prev: DebugInfo) => ({
        ...prev,
        fixed: true,
        fixedWith: exampleCardIds
      }));
      
      // Force reload after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error fixing display case:", error);
      toast.error("Failed to fix display case: " + String(error));
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <div className="mt-4">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsDebugVisible(!isDebugVisible)}
      >
        {isDebugVisible ? "Hide Debug Info" : "Show Debug Info"}
      </Button>
      
      {isDebugVisible && (
        <div className="mt-2 border border-gray-200 p-3 rounded-md">
          <div className="text-sm mb-3">
            <pre className="whitespace-pre-wrap overflow-auto max-h-40 bg-gray-50 p-2 rounded text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="fix-option" checked={fixOption === "example"} onCheckedChange={() => setFixOption(fixOption === "example" ? "sync" : "example")} />
              <Label htmlFor="fix-option">Use example cards</Label>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="default"
            onClick={fixDisplayCase}
            disabled={isFixing}
          >
            {isFixing ? "Fixing..." : "Fix Display Case"}
          </Button>
        </div>
      )}
    </div>
  );
} 