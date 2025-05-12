import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useDisplayCases } from '@/hooks/display/useDisplayCases';
import { Card } from '@/types/Card';
import { searchCards } from '@/lib/firebase/cards';

interface CardManagementProps {
  displayCaseId: string;
  currentCards: string[];
  onClose: () => void;
}

export function CardManagement({ displayCaseId, currentCards, onClose }: CardManagementProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { addCard, removeCard } = useDisplayCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement card search functionality
      // This should call your card search API
      const results = await searchCards(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (cardId: string) => {
    try {
      await addCard(displayCaseId, cardId);
      setSelectedCards(prev => [...prev, cardId]);
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    try {
      await removeCard(displayCaseId, cardId);
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Manage Cards">
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for cards..."
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {isLoading ? (
          <p>Loading search results...</p>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((card) => (
              <div
                key={card.id}
                className={`p-4 border rounded-lg ${
                  selectedCards.includes(card.id) ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{card.playerName}</h3>
                    <p className="text-sm text-gray-600">
                      {card.year} {card.cardSet}
                    </p>
                  </div>
                  <Button
                    variant={selectedCards.includes(card.id) ? "destructive" : "outline"}
                    size="sm"
                    onClick={() =>
                      selectedCards.includes(card.id)
                        ? handleRemoveCard(card.id)
                        : handleAddCard(card.id)
                    }
                  >
                    {selectedCards.includes(card.id) ? 'Remove' : 'Add'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No cards found. Try searching for cards to add to your display case.</p>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
} 