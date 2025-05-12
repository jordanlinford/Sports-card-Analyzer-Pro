import { useState } from 'react';
import { Card } from '../services/CardService';
import { AddCardModal } from './AddCardModal';
import { useUserSubscription } from "@/hooks/useUserSubscription";

interface CardGridProps {
  cards: Card[];
  refreshCards?: () => void;
}

export const CardGridView = ({ cards, refreshCards }: CardGridProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAdmin } = useUserSubscription();

  const MAX_CARDS = 1000; // or whatever your normal limit is
  const canAddCard = isAdmin || cards.length < MAX_CARDS;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Collection</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={!canAddCard}
        >
          Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold">{card.playerName}</h3>
            <p className="text-gray-600">{card.year} {card.cardSet}</p>
            <p className="text-gray-600">#{card.cardNumber}</p>
            {card.condition && <p className="text-gray-600">Condition: {card.condition}</p>}
            {card.currentValue && (
              <p className="text-green-600 font-semibold">
                Value: ${card.currentValue.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCardAdded={refreshCards}
      />
    </div>
  );
}; 