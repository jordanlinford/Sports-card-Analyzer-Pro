import { useState, useEffect } from 'react';
import { Card } from '../services/CardService';
import { cardService } from '../services/CardService';
import { CardGridView } from '../components/CardGridView';
import { AddCardModal } from '../components/AddCardModal';
import { useAuth } from '../contexts/AuthContext';

const CollectionManager = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCards = async () => {
    if (!currentUser) return;
    
    try {
      const fetchedCards = await cardService.getCards(currentUser.uid);
      setCards(fetchedCards);
    } catch (err) {
      setError('Failed to fetch cards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [currentUser]);

  const handleCardAdded = () => {
    fetchCards();
  };

  const handleCardUpdated = () => {
    fetchCards();
  };

  const handleCardDeleted = () => {
    fetchCards();
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Please log in to view your collection</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add New Card
          </button>
        </div>

        <CardGridView
          cards={cards}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />

        <AddCardModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCardAdded={handleCardAdded}
        />
      </div>
    </div>
  );
};

export default CollectionManager; 