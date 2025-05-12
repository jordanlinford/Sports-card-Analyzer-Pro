import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/types/Card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Example cards to add if no cards are found
const exampleCards = [
  {
    id: "card1",
    playerName: "Michael Jordan",
    year: "1996",
    cardSet: "Upper Deck",
    sport: "Basketball",
    tags: ["Basketball", "Star"],
    imageUrl: "https://placehold.co/300x420/e2e8f0/1e293b?text=Jordan"
  },
  {
    id: "card2",
    playerName: "Kobe Bryant",
    year: "2000",
    cardSet: "Topps Chrome",
    sport: "Basketball",
    tags: ["Basketball", "Star"],
    imageUrl: "https://placehold.co/300x420/e2e8f0/1e293b?text=Kobe"
  },
  {
    id: "card3",
    playerName: "LeBron James",
    year: "2003",
    cardSet: "Topps Rookie",
    sport: "Basketball",
    tags: ["Basketball", "Star"],
    imageUrl: "https://placehold.co/300x420/e2e8f0/1e293b?text=LeBron"
  }
];

export function SyncDisplayCase({ displayCaseId }: { displayCaseId: string }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

  const addExampleCards = async () => {
    setIsSyncing(true);
    setResult(null);

    try {
      console.log("Starting sync process for display case:", displayCaseId);
      
      // Verify the display case exists first
      const displayCaseRef = doc(db, "public_display_cases", displayCaseId);
      const displayCaseDoc = await getDoc(displayCaseRef);
      
      if (!displayCaseDoc.exists()) {
        console.error("Display case not found in public_display_cases collection!");
        setResult("Error: Display case not found");
        toast.error("Display case not found");
        setIsSyncing(false);
        return;
      }
      
      console.log("Display case found:", displayCaseDoc.data());
      
      // Create the example cards in Firestore if they don't exist
      console.log("Creating/updating example cards...");
      for (const card of exampleCards) {
        await setDoc(doc(db, "cards", card.id), card, { merge: true });
        console.log(`Created/updated card: ${card.id}`);
      }

      // Prepare cardIds array
      const cardIds = exampleCards.map(card => card.id);
      console.log("Card IDs to update:", cardIds);
      
      // Update the display case with cardIds
      await updateDoc(displayCaseRef, {
        cardIds: cardIds,
        updatedAt: new Date()
      });
      
      console.log("Successfully updated display case with card IDs");
      
      // Verify the update succeeded
      const updatedDoc = await getDoc(displayCaseRef);
      const updatedData = updatedDoc.data();
      console.log("Updated display case data:", updatedData);
      console.log("Updated cardIds:", updatedData?.cardIds);
      
      if (updatedData?.cardIds && Array.isArray(updatedData.cardIds) && updatedData.cardIds.length > 0) {
        setResult(`Success! Added ${updatedData.cardIds.length} example cards to the display case.`);
        toast.success("Display case updated with example cards");
        
        // Force a hard reload rather than just window.location.reload()
        console.log("Forcing page reload in 1.5 seconds...");
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 1500);
      } else {
        setResult("Warning: Cards were added but cardIds may not have updated correctly.");
        toast.warning("Cards added but verification failed. Try refreshing the page.");
      }
    } catch (error) {
      console.error("Error adding example cards:", error);
      setResult(`Error: ${String(error)}`);
      toast.error("Failed to add example cards");
    } finally {
      setIsSyncing(false);
    }
  };

  // Show different content based on authentication status
  if (!user) {
    return (
      <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">View Public Display Case</h3>
        <p className="text-sm mb-3">
          This display case doesn't have any cards to show. Display cases are meant to showcase real cards from a collector's collection.
        </p>
        <p className="text-xs text-blue-600">Sign in if you're the owner of this display case to add your cards.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
      <h3 className="font-semibold mb-2">Sync Your Collection</h3>
      <p className="text-sm mb-3">
        This display case doesn't contain any cards from your collection. Click below to find cards in your collection that you can showcase.
      </p>
      
      <Button
        onClick={() => window.location.href = `/display-case/${displayCaseId}`}
        disabled={isSyncing}
        size="sm"
      >
        {isSyncing ? "Loading..." : "Manage Display Case"}
      </Button>
      
      {result && (
        <div className={`mt-2 p-2 rounded text-sm ${result.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {result}
        </div>
      )}
    </div>
  );
} 