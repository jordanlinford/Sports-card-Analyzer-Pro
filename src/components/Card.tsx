import { Card as CardType } from "@/types/Card";
import { useAuth } from "@/context/AuthContext";
import { EmergencyDeleteButton } from "@/components/EmergencyDeleteButton";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onCardDeleted?: () => void;
}

export function Card({ card, onClick, onCardDeleted }: CardProps) {
  const { user } = useAuth();

  return (
    <div
      className="relative p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {card.imageUrl && (
        <div className="w-48 h-64 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <img
            src={card.imageUrl || '/placeholder-card.png'}
            alt={`${card.playerName} ${card.year} ${card.cardSet}`}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{card.playerName}</h3>
        <p className="text-sm text-gray-600">
          {card.year} {card.cardSet}
        </p>
        {card.variation && (
          <p className="text-sm text-gray-600">{card.variation}</p>
        )}
        <p className="text-sm text-gray-600">#{card.cardNumber}</p>
        <p className="text-sm text-gray-600">Condition: {card.condition}</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Paid: ${card.pricePaid !== undefined ? card.pricePaid.toFixed(2) : '0.00'}</span>
          <span className="font-semibold">Value: ${card.currentValue !== undefined ? card.currentValue.toFixed(2) : '0.00'}</span>
        </div>
      </div>
      {user && (
        <div className="absolute top-2 right-2">
          <EmergencyDeleteButton
            cardId={card.id}
            onDeleted={onCardDeleted}
          />
        </div>
      )}
    </div>
  );
} 