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
          className="relative group cursor-pointer"
          onClick={() => onEditCard(card)}
        >
          {card.imageUrl ? (
            <>
              <img
                src={card.imageUrl}
                alt={`${card.playerName} ${card.year} ${card.cardSet}`}
                className="rounded-xl w-full shadow-md aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-sm rounded-xl p-2">
                <div className="text-center p-3">
                  <div className="font-semibold mb-1">{card.playerName}</div>
                  <div className="text-xs mb-1">{card.year} {card.cardSet}</div>
                  {card.variation && (
                    <div className="text-xs mb-1">Variation: {card.variation}</div>
                  )}
                  {card.condition && (
                    <div className="text-xs mb-1">Condition: {card.condition}</div>
                  )}
                  <div className="text-xs mt-2 flex justify-between">
                    <span>Paid: ${card.pricePaid || 0}</span>
                    <span>Value: ${card.currentValue || 0}</span>
                  </div>
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
                {card.variation && (
                  <div className="text-xs text-gray-600">Var: {card.variation}</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid; 