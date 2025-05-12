import React, { useState } from 'react';
import { fetchPrice, APIError } from '../api/fetchPrice';
import { Card } from '../types/Card';
import { saveSearch } from "@/lib/firebase/saveSearch";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const CardSearch: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Card>>({
    playerName: '',
    year: '',
    cardSet: '',
    condition: 'Raw',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ averagePrice: number; searchResults: any[] } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error("Please sign in to save searches");
      return;
    }

    try {
      setSaving(true);
      await saveSearch({
        playerName: formData.playerName || '',
        year: formData.year,
        cardSet: formData.cardSet,
        condition: formData.condition || 'Raw',
        price: null,
      });
      toast.success("Search saved successfully");
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate required fields
      if (!formData.playerName || !formData.year || !formData.cardSet) {
        throw new Error('Please fill in all required fields');
      }

      const data = await fetchPrice({
        ...formData,
        userId: '', // This will be set by the backend
        pricePaid: 0,
        currentValue: 0,
        tags: [],
        createdAt: new Date().toISOString(),
      } as Card);

      setResult(data);
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 401) {
          setError('Please log in to search for card prices');
          // You might want to redirect to login here
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Card Price Search</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
            Player Name *
          </label>
          <input
            type="text"
            id="playerName"
            name="playerName"
            value={formData.playerName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year *
          </label>
          <input
            type="text"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cardSet" className="block text-sm font-medium text-gray-700">
            Card Set *
          </label>
          <input
            type="text"
            id="cardSet"
            name="cardSet"
            value={formData.cardSet}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Raw">Raw</option>
            <option value="PSA 10">PSA 10</option>
            <option value="PSA 9">PSA 9</option>
            <option value="PSA 8">PSA 8</option>
            <option value="PSA 7">PSA 7</option>
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search Price'}
          </button>

          <button
            type="button"
            onClick={handleSaveSearch}
            disabled={saving || !formData.playerName}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Search'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Search Results</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-xl font-bold">
              Average Price: ${result.averagePrice.toFixed(2)}
            </p>
            {result.searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Sales:</h4>
                <ul className="space-y-2">
                  {result.searchResults.map((item, index) => (
                    <li key={index} className="text-sm">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.title}
                      </a>
                      <span className="ml-2 font-medium">${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSearch; 