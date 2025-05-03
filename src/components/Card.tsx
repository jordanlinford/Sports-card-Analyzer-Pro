import { useState } from 'react';
import { Card as CardType } from '../services/CardService';
import { EditCardModal } from './EditCardModal';

interface CardProps {
  card: CardType;
  onCardUpdated: () => void;
  onCardDeleted: () => void;
}

export const Card = ({ card, onCardUpdated, onCardDeleted }: CardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsEditModalOpen(true)}
      >
        <img
          src={card.imageUrl}
          alt={card.playerName}
          className="w-full h-auto rounded-lg shadow-md"
        />
        
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex flex-col justify-center p-4 text-white">
            <h3 className="text-xl font-bold">{card.playerName}</h3>
            <p className="text-sm">{card.cardYear} {card.cardSet}</p>
            <p className="text-sm">#{card.cardNumber}</p>
            <p className="text-sm">Condition: {card.condition}</p>
            <p className="text-sm">Paid: ${card.pricePaid.toFixed(2)}</p>
            <p className="text-sm">Value: ${card.currentValue.toFixed(2)}</p>
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-indigo-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditCardModal
        card={card}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCardUpdated={onCardUpdated}
        onCardDeleted={onCardDeleted}
      />
    </div>
  );
}; 