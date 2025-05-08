import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface DirectFixerProps {
  displayCaseId: string;
}

export function DirectFixer({ displayCaseId }: DirectFixerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { user } = useAuth();

  const syncFromPrivateToPublic = async () => {
    setLoading(true);
    setResult(null);
    setDebugInfo(null);
    
    try {
      if (!user) {
        setResult("Error: You must be logged in to perform this action");
        return;
      }
      
      // Collect debugging info
      const debug: string[] = [];
      debug.push(`Starting sync for display case ID: ${displayCaseId}`);
      debug.push(`User ID: ${user.uid}`);
      
      // First, try to find the private display case in the user's collection
      debug.push("Looking for private display case in user's collection");
      const privateDisplayCaseRef = doc(db, "users", user.uid, "display_cases", displayCaseId);
      const privateSnapshot = await getDoc(privateDisplayCaseRef);
      
      if (!privateSnapshot.exists()) {
        debug.push("❌ No private display case found with this ID");
        setResult("Error: No private display case found with this ID. Please create a display case first.");
        setDebugInfo(debug.join("\n"));
        setLoading(false);
        return;
      }
      
      const privateData = privateSnapshot.data();
      debug.push(`Found private display case: ${privateData.name || 'Unnamed'}`);
      
      // Check if private display case has cards
      if (!privateData.cardIds || !Array.isArray(privateData.cardIds) || privateData.cardIds.length === 0) {
        debug.push("❌ Private display case has no cards");
        setResult("Your private display case has no cards. Add cards to your display case first.");
        setDebugInfo(debug.join("\n"));
        setLoading(false);
        return;
      }
      
      debug.push(`Private case has ${privateData.cardIds.length} card IDs: ${privateData.cardIds.join(', ')}`);
      
      // Verify the cards exist in the user's collection
      const validCardIds = [];
      for (const cardId of privateData.cardIds) {
        try {
          const cardRef = doc(db, "users", user.uid, "collection", cardId);
          const cardSnap = await getDoc(cardRef);
          
          if (cardSnap.exists()) {
            validCardIds.push(cardId);
            debug.push(`✅ Verified card exists: ${cardId}`);
          } else {
            debug.push(`❌ Card not found in collection: ${cardId}`);
          }
        } catch (err) {
          debug.push(`Error checking card ${cardId}: ${err}`);
        }
      }
      
      debug.push(`Verified ${validCardIds.length} out of ${privateData.cardIds.length} cards`);
      
      if (validCardIds.length === 0) {
        debug.push("❌ No valid cards found in your collection");
        setResult("Error: None of the cards in your display case could be found in your collection. Please add cards to your collection first.");
        setDebugInfo(debug.join("\n"));
        setLoading(false);
        return;
      }
      
      // Update the public display case with valid cardIds
      try {
        const publicRef = doc(db, "public_display_cases", displayCaseId);
        const publicSnap = await getDoc(publicRef);
        
        if (!publicSnap.exists()) {
          debug.push("❌ Public display case doesn't exist yet");
          setResult("Error: The public display case doesn't exist. Please publish it first.");
          setDebugInfo(debug.join("\n"));
          setLoading(false);
          return;
        }
        
        debug.push("Updating public display case with valid card IDs");
        await updateDoc(publicRef, {
          cardIds: validCardIds,
          updatedAt: new Date()
        });
        
        debug.push("✅ Successfully updated public display case");
        setResult(`Success! Synced ${validCardIds.length} cards from your collection to the public display case.`);
        setDebugInfo(debug.join("\n"));
        
        // Force reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        debug.push(`❌ Error updating public display case: ${error}`);
        setResult(`Error updating public display case: ${String(error)}`);
        setDebugInfo(debug.join("\n"));
      }
    } catch (error) {
      console.error("Error fixing display case:", error);
      setResult(`Error: ${String(error)}`);
      setDebugInfo(`Unexpected error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Special display for anonymous users
  if (!user) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
        <h3 className="font-semibold mb-2">Fix Empty Public Display Case</h3>
        <p className="text-sm mb-3">
          This public display case isn't showing any cards. Sign in to fix this display case.
        </p>
        <div className="text-xs text-amber-700 mt-2">
          <p>Only the collection owner can add their cards to this display case.</p>
          <p className="mt-1">Please sign in to manage your display cases.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
      <h3 className="font-semibold mb-2">Fix Empty Public Display Case</h3>
      <p className="text-sm mb-3">
        This public display case isn't showing any cards from your collection. Click the button below to sync real cards from your private display case.
      </p>
      <Button 
        onClick={syncFromPrivateToPublic} 
        disabled={loading} 
        variant="outline"
        size="sm"
      >
        {loading ? "Syncing..." : "Sync Your Cards to Display Case"}
      </Button>
      
      {result && (
        <div className={`mt-2 p-2 rounded text-sm ${result.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {result}
        </div>
      )}
      
      {debugInfo && (
        <details className="mt-3 text-xs border border-gray-200 rounded p-2">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 p-2 bg-gray-50 overflow-auto max-h-[200px]">
            {debugInfo}
          </pre>
        </details>
      )}
    </div>
  );
} 