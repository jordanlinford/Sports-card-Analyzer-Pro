import { useState } from 'react';
import { Card, CardService } from '../services/CardService';

interface UpdateMarketValuesProps {
  cards: Card[];
  onUpdate: (updatedCards: Card[]) => void;
}

export const UpdateMarketValues = ({ cards, onUpdate }: UpdateMarketValuesProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateValues = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const updatedCards = await Promise.all(cards.map(async (card) => {
        const price = await CardService.fetchCardMarketValue(card);
        if (price) {
          await CardService.updateCard(card.id!, { currentValue: price });
          return { ...card, currentValue: price };
        }
        return card;
      }));

      onUpdate(updatedCards);
    } catch (err) {
      setError('Failed to update market values');
      console.error('Error updating market values:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleUpdateValues}
        disabled={isUpdating}
        className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
      >
        {isUpdating ? '🔄 Updating...' : '🔄 Update All Values'}
      </button>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}; 