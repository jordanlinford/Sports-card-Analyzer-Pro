import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveSearch } from "@/lib/firebase/saveSearch";
import { Modal } from "./ui/modal";
import { toast } from "sonner";

interface CardResult {
  playerName: string;
  year: string;
  cardSet: string;
  variation: string;
  cardNumber: string;
  condition: string;
  price: number;
}

interface Props {
  result: CardResult;
}

export default function CardDisplay({ result }: Props) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save searches");
      return;
    }
    
    try {
      setIsSaving(true);
      await saveSearch({
        playerName: result.playerName,
        year: result.year,
        cardSet: result.cardSet,
        variation: result.variation,
        cardNumber: result.cardNumber,
        condition: result.condition || "Raw",
        price: result.price || null,
      });
      toast.success("Search saved successfully");
      setModalOpen(true);
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="p-4 border rounded-xl shadow hover:shadow-lg transition-shadow">
        <div className="mb-2 text-lg font-semibold">{result.playerName}</div>
        <div className="text-sm text-gray-600">{result.cardSet} - {result.year}</div>
        <div className="my-2 font-bold">${result.price}</div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Card Saved!"
        className="border-2 border-blue-500"
      >
        <div className="flex flex-col items-center">
          <svg 
            className="w-12 h-12 text-green-500 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <p className="text-gray-700 text-center">
            Your search for <strong>{result.playerName}</strong> has been saved successfully.
          </p>
        </div>
      </Modal>
    </>
  );
} 