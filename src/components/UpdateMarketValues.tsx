import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MarketValueService } from '../services/MarketValueService';

export const UpdateMarketValues = () => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateValues = async () => {
    if (!user) {
      setError('You must be logged in to update card values');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await MarketValueService.updateAllCardValues(user.uid);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update card values');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleUpdateValues}
        disabled={updating}
        className={`px-4 py-2 rounded ${
          updating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {updating ? '🔄 Updating...' : '🔄 Update All Values'}
      </button>
      {error && (
        <div className="ml-4 text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}; 