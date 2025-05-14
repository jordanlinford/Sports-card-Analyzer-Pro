import { useState } from "react";
import { Card as CardType } from "../types/Card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { EmergencyDeleteButton } from "@/components/EmergencyDeleteButton";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

interface CollectionTableProps {
  onEditCard?: (card: CardType) => void;
  onUpdateCard?: (card: CardType) => Promise<void>;
  cards: CardType[]; // Required cards prop from parent
  updatingCardIds?: string[];
}

export default function CollectionTable({ onEditCard, cards, onUpdateCard, updatingCardIds = [] }: CollectionTableProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Calculate pagination
  const paginatedCards = cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(cards.length / PAGE_SIZE);

  const handleCardDeleted = () => {
    // Refetch cards after deletion
    queryClient.invalidateQueries({ queryKey: ["cards"] });
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No cards in your collection yet. Add some cards to get started!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Set
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {card.playerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.cardSet}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.variation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.condition}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${((card.currentValue || card.price || 0).toFixed(2))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.tags && card.tags.length > 0 ? card.tags.join(', ') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    {onUpdateCard && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateCard(card);
                        }}
                        disabled={updatingCardIds.includes(card.id)}
                      >
                        {updatingCardIds.includes(card.id) ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Check on eBay"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Create a full search string for eBay
                        const searchQuery = `${card.year} ${card.playerName} ${card.cardSet} ${card.variation || ''} ${card.cardNumber} ${card.condition || ''}`;
                        // Open eBay search in a new tab
                        window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=0&LH_Complete=1&LH_Sold=1`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => onEditCard?.(card)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <EmergencyDeleteButton
                      cardId={card.id}
                      onDeleted={handleCardDeleted}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * PAGE_SIZE, cards.length)}</span> of{" "}
                <span className="font-medium">{cards.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNum
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 