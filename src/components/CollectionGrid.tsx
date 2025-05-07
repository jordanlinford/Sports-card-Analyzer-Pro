import React from 'react';
import { Card } from '@/types/Card';

interface CollectionGridProps {
  cards: Card[];
  onEditCard: (card: Card) => void;
}

const CollectionGrid: React.FC<CollectionGridProps> = ({ cards, onEditCard }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No cards in your collection yet. Add your first card!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative group rounded-xl overflow-hidden shadow bg-white cursor-pointer"
          onClick={() => onEditCard(card)}
        >
          <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
            <img
              src={card.imageUrl || '/placeholder-card.png'}
              alt={card.playerName}
              className="w-full h-auto rounded-lg border object-contain"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-sm font-semibold">{card.playerName} - {card.year}</p>
            <p className="text-xs">Set: {card.cardSet}</p>
            <p className="text-xs">Variation: {card.variation}</p>
            <p className="text-xs">Condition: {card.condition}</p>
            <p className="text-xs">Paid: ${card.pricePaid}</p>
            <p className="text-xs">Value: ${card.currentValue}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid; 