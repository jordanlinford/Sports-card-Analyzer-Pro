import { Card as CardType } from "@/types/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CardModalProps {
  card: CardType;
  onClose: () => void;
  onDelete: (cardId: string) => void;
}

export function CardModal({ card, onClose, onDelete }: CardModalProps) {
  const handleDelete = async () => {
    await onDelete(card.id);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {card.imageUrl && (
            <div className="aspect-w-3 aspect-h-4">
              <img
                src={card.imageUrl}
                alt={`${card.playerName} ${card.year} ${card.cardSet}`}
                className="object-cover w-full h-full rounded-lg"
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
              <span className="text-gray-600">Paid: ${card.pricePaid}</span>
              <span className="font-semibold">Value: ${card.currentValue}</span>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="destructive" onClick={handleDelete}>
              Delete Card
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 