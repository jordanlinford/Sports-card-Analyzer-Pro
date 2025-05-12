import React from "react";

export type SavedSearch = {
  id: string;
  playerName: string;
  year?: string;
  cardSet?: string;
  variation?: string;
  cardNumber?: string;
  condition: string;
  price: number | null;
  savedAt: string;
};

type Props = {
  search: SavedSearch;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
};

const SavedSearchCard: React.FC<Props> = ({ search, onEdit, onDelete, compact = false }) => {
  return (
    <div
      className={`rounded-2xl shadow-md p-4 border transition-all duration-300 hover:shadow-lg
        ${compact ? "bg-zinc-50 dark:bg-zinc-800 text-xs" : "bg-white dark:bg-zinc-900"} 
        border-zinc-200 dark:border-zinc-800`}
    >
      <h2 className={`font-semibold mb-2 text-zinc-800 dark:text-zinc-100 ${compact ? "text-base" : "text-xl"}`}>
        {search.playerName} ({search.year || "Any Year"})
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400">
        Set: {search.cardSet || "N/A"} | Variation: {search.variation || "N/A"}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400">
        Card #: {search.cardNumber || "N/A"}
      </p>
      <div className="mt-3 flex justify-between text-zinc-600 dark:text-zinc-300">
        <span>
          Condition: <strong>{search.condition}</strong>
        </span>
        {search.price && (
          <span>
            Price: <strong>${search.price}</strong>
          </span>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-1 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SavedSearchCard; 