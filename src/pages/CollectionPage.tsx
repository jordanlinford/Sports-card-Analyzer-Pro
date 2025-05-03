import { useEffect, useState } from 'react';
import { Card } from '../services/CardService';
import { cardService } from '../services/CardService';
import { useAuth } from '../contexts/AuthContext';
import { CardGridView } from '../components/CardGridView';

export default function CollectionPage() {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCards = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const userCards = await cardService.getCards(currentUser.uid);
      setCards(userCards);
      setError('');
    } catch (err) {
      setError('Failed to fetch cards');
      console.error('Error fetching cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">Please log in to view your collection</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">Loading your collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={fetchCards}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <CardGridView
      cards={cards}
      onCardAdded={fetchCards}
      onCardUpdated={fetchCards}
      onCardDeleted={fetchCards}
    />
  );
} 