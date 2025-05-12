import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MarketValueService } from '../services/MarketValueService';
import { collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

interface UpdateProgress {
  current: number;
  total: number;
  cardName: string;
}

export const UpdateValuesButton = () => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<UpdateProgress>({ current: 0, total: 0, cardName: '' });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!user) {
      setError('You must be logged in to update values');
      return;
    }

    setShowConfirm(false);
    setUpdating(true);
    setError(null);
    setSuccess(null);
    setProgress({ current: 0, total: 0, cardName: '' });

    try {
      // Get total number of cards first
      const cardsRef = collection(db, 'users', user.uid, 'cards');
      const snapshot = await getDocs(cardsRef);
      const totalCards = snapshot.size;
      
      setProgress(prev => ({ ...prev, total: totalCards }));

      // Update each card
      for (const [index, docSnap] of snapshot.docs.entries()) {
        const card = docSnap.data();
        setProgress(prev => ({ ...prev, current: index + 1, cardName: card.playerName }));

        try {
          const result = await MarketValueService.fetchLatestCardPrice({
            player: card.playerName,
            year: card.year,
            set: card.brand,
            number: card.cardNumber,
            condition: card.grade || 'ungraded',
          });

          await updateDoc(docSnap.ref, {
            currentValue: result.price,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Failed to update card ${card.playerName}`, error);
        }
      }

      setSuccess('All card values updated successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update values');
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setSuccess(null);
        setProgress({ current: 0, total: 0, cardName: '' });
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={updating}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {updating ? '🔄 Updating...' : '🔄 Update All Values'}
        </button>
        {error && (
          <span className="text-red-500 text-sm">{error}</span>
        )}
        {success && (
          <span className="text-green-500 text-sm">{success}</span>
        )}
      </div>
      
      {updating && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Updating card {progress.current} of {progress.total}</span>
            <span>{progress.cardName}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Update</h3>
            <p className="mb-4">This will update the market values for all cards in your collection. This may take a few minutes.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 