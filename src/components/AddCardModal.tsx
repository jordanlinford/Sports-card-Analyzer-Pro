import { useState } from 'react';
import { Card as CardType, CardService } from '../services/CardService';
import { uploadImage } from '../utils/imageUpload';
import { useAuth } from '../contexts/AuthContext';
import { MarketValueService } from '../services/MarketValueService';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: () => void;
}

export const AddCardModal = ({ isOpen, onClose, onCardAdded }: AddCardModalProps) => {
  const { currentUser } = useAuth();
  const [card, setCard] = useState<Partial<CardType>>({
    playerName: '',
    year: '',
    cardSet: '',
    variation: '',
    cardNumber: '',
    condition: 'Mint',
    grade: '',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    imageUrl: '',
    ownerId: currentUser?.uid || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleFetchPrice = async () => {
    if (!card.playerName || !card.condition) {
      setError('Player name and condition are required to fetch price');
      return;
    }

    setIsFetchingPrice(true);
    setError(null);

    try {
      const marketValue = await MarketValueService.fetchCardMarketValue({
        playerName: card.playerName,
        year: card.year,
        cardSet: card.cardSet,
        variation: card.variation,
        cardNumber: card.cardNumber,
        condition: card.condition,
      });

      if (marketValue !== null) {
        setCard(prev => ({ ...prev, purchasePrice: marketValue }));
      } else {
        setError('Could not fetch market value for this card');
      }
    } catch (err) {
      setError('Error fetching market value');
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to add a card');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, currentUser.uid);
      }

      const newCard = {
        ...card,
        imageUrl,
        ownerId: currentUser.uid,
      } as CardType;

      await CardService.createCard(newCard);
      onCardAdded();
      onClose();
    } catch (err) {
      setError('Failed to add card');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Card</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">Player Name *</label>
              <input
                id="playerName"
                type="text"
                name="playerName"
                value={card.playerName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
              <input
                id="year"
                type="text"
                name="year"
                value={card.year}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="cardSet" className="block text-sm font-medium text-gray-700">Card Set</label>
              <input
                id="cardSet"
                type="text"
                name="cardSet"
                value={card.cardSet}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="variation" className="block text-sm font-medium text-gray-700">Variation</label>
              <input
                id="variation"
                type="text"
                name="variation"
                value={card.variation}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                value={card.cardNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition *</label>
              <select
                id="condition"
                name="condition"
                value={card.condition}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Mint">Mint</option>
                <option value="Near Mint">Near Mint</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
              <input
                id="grade"
                type="text"
                name="grade"
                value={card.grade}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <div className="flex gap-2">
                <input
                  id="purchasePrice"
                  type="number"
                  name="purchasePrice"
                  value={card.purchasePrice}
                  onChange={handleInputChange}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleFetchPrice}
                  disabled={isFetchingPrice}
                  className="mt-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isFetchingPrice ? 'Fetching...' : 'Fetch Price'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
              <input
                id="purchaseDate"
                type="date"
                name="purchaseDate"
                value={card.purchaseDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={card.notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Card Image</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm mt-2">{error}</div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isLoading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 