import { Card } from "@/types/Card";
import { Button } from "@/components/ui/button";
import { saveSearch } from "@/lib/firebase/saveSearch";
import { toast } from "sonner";
import { useState } from "react";

interface SearchResultCardProps {
  card: Card;
}

export function SearchResultCard({ card }: SearchResultCardProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSearch = async () => {
    try {
      setIsSaving(true);
      await saveSearch({
        playerName: card.playerName,
        year: card.year,
        cardSet: card.cardSet,
        variation: card.variation,
        cardNumber: card.cardNumber,
        condition: card.condition || "Raw",
        price: card.currentValue || null,
      });
      toast.success("Search saved successfully");
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow">
      <h3 className="font-bold text-lg">{card.playerName}</h3>
      <p className="text-gray-600 dark:text-gray-300">
        {card.year} {card.cardSet} #{card.cardNumber}
      </p>
      <p className="text-muted-foreground">Condition: {card.condition || "Raw"}</p>
      <p className="font-semibold mt-2 text-green-600 dark:text-green-400">
        ${card.currentValue}
      </p>
      <Button 
        className="mt-4 w-full" 
        onClick={handleSaveSearch}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save This Search"}
      </Button>
    </div>
  );
} 