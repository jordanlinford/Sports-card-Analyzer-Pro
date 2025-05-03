import { useState } from 'react';
import { Card } from '../services/CardService';
import { cardService } from '../services/CardService';
import { uploadImage } from '../utils/imageUpload';
import { useAuth } from '../contexts/AuthContext';

interface EditCardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onCardUpdated: () => void;
  onCardDeleted: () => void;
}

export const EditCardModal = ({ card, isOpen, onClose, onCardUpdated, onCardDeleted }: EditCardModalProps) => {
  const { currentUser } = useAuth();
  const [editedCard, setEditedCard] = useState<Card>(card);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file, currentUser.uid);
      setEditedCard(prev => ({ ...prev, imageUrl }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to update a card');
      return;
    }

    try {
      await cardService.updateCard(editedCard.id, {
        ...editedCard,
        ownerId: currentUser.uid
      });
      onCardUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update card');
    }
  };

  const handleDelete = async () => {
    if (!currentUser) {
      setError('You must be logged in to delete a card');
      return;
    }

    try {
      await cardService.deleteCard(editedCard.id);
      onCardDeleted();
      onClose();
    } catch (err) {
      setError('Failed to delete card');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Card</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">Player Name</label>
            <input
              id="playerName"
              type="text"
              value={editedCard.playerName}
              onChange={(e) => setEditedCard(prev => ({ ...prev, playerName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="cardYear" className="block text-sm font-medium text-gray-700">Year</label>
            <input
              id="cardYear"
              type="number"
              value={editedCard.cardYear}
              onChange={(e) => setEditedCard(prev => ({ ...prev, cardYear: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label htmlFor="cardSet" className="block text-sm font-medium text-gray-700">Card Set</label>
            <input
              id="cardSet"
              type="text"
              value={editedCard.cardSet}
              onChange={(e) => setEditedCard(prev => ({ ...prev, cardSet: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="variation" className="block text-sm font-medium text-gray-700">Variation</label>
            <input
              id="variation"
              type="text"
              value={editedCard.variation}
              onChange={(e) => setEditedCard(prev => ({ ...prev, variation: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
            <input
              id="cardNumber"
              type="text"
              value={editedCard.cardNumber}
              onChange={(e) => setEditedCard(prev => ({ ...prev, cardNumber: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
            <select
              id="condition"
              value={editedCard.condition}
              onChange={(e) => setEditedCard(prev => ({ ...prev, condition: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="Mint">Mint</option>
              <option value="Near Mint">Near Mint</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label htmlFor="pricePaid" className="block text-sm font-medium text-gray-700">Price Paid ($)</label>
            <input
              id="pricePaid"
              type="number"
              value={editedCard.pricePaid}
              onChange={(e) => setEditedCard(prev => ({ ...prev, pricePaid: parseFloat(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700">Current Value ($)</label>
            <input
              id="currentValue"
              type="number"
              value={editedCard.currentValue}
              onChange={(e) => setEditedCard(prev => ({ ...prev, currentValue: parseFloat(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              id="tags"
              type="text"
              value={editedCard.tags.join(', ')}
              onChange={(e) => setEditedCard(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full"
            />
            {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
            {editedCard.imageUrl && (
              <img
                src={editedCard.imageUrl}
                alt={editedCard.playerName}
                className="mt-2 h-32 w-auto object-contain"
              />
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Card
            </button>
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                disabled={isUploading}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 