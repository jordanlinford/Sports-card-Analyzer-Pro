import { useState } from 'react';
import { Card as CardType } from '../services/CardService';
import { Card } from './Card';
import { AddCardModal } from './AddCardModal';

interface CardGridProps {
  cards: CardType[];
  refreshCards: () => void;
}

export const CardGridView = ({ cards, refreshCards }: CardGridProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Collection</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onCardUpdated={refreshCards}
            onCardDeleted={refreshCards}
          />
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