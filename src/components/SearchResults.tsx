import { Card } from "@/types/Card";
import { useSaveCard } from "@/hooks/useSaveCard";
import { saveSearch } from "@/lib/firebase/saveSearch";
import { toast } from "sonner";
import { useState } from "react";

interface SearchResultsProps {
  results: Card[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const { mutate: saveCard, isPending: isSavingCard } = useSaveCard();
  const [isSavingSearch, setIsSavingSearch] = useState(false);

  const handleSaveCard = (card: Card) => {
    saveCard({
      playerName: card.playerName,
      year: card.year,
      cardSet: card.cardSet,
      cardNumber: card.cardNumber,
      condition: card.condition,
      pricePaid: card.pricePaid,
      currentValue: card.currentValue,
      variation: card.variation,
      imageUrl: card.imageUrl,
    });
  };

  const handleSaveSearch = async (card: Card) => {
    try {
      setIsSavingSearch(true);
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
      setIsSavingSearch(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((card) => (
        <div key={card.id} className="border p-4 rounded-xl shadow-md bg-white">
          <h2 className="text-lg font-bold">{card.playerName}</h2>
          <p>{card.year} • {card.cardSet}</p>
          <p className="text-sm text-gray-500">#{card.cardNumber}</p>
          <p className="text-green-600 font-semibold">${card.currentValue}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleSaveCard(card)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={isSavingCard}
            >
              {isSavingCard ? "Saving..." : "Save Card"}
            </button>

            <button
              onClick={() => handleSaveSearch(card)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              disabled={isSavingSearch}
            >
              {isSavingSearch ? "Saving..." : "Save Search"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 