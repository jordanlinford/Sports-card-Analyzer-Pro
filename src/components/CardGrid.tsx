import { Card as CardType } from "@/types/Card";
import { Card } from "@/components/Card";

interface CardGridProps {
  cards: CardType[];
  onCardClick: (card: CardType) => void;
}

export function CardGrid({ cards, onCardClick }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  );
} 