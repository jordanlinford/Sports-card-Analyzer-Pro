import { useAuth } from "@/context/AuthContext";
import { emergencyDeleteCard } from "@/lib/firebase/emergencyDeleteCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  cardId: string;
  onDeleted?: () => void;
}

export function EmergencyDeleteButton({ cardId, onDeleted }: Props) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // For showing debug info
  const [message, setMessage] = useState<{success?: boolean; text: string} | null>(null);
  const queryClient = useQueryClient();

  if (!user) return null;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this card?")) {
      return;
    }
    
    setIsDeleting(true);
    setMessage(null);
    
    try {
      console.log(`[EmergencyDeleteButton] Starting deletion for card ${cardId}`);
      const success = await emergencyDeleteCard(cardId, user.uid);
      
      if (success) {
        // Invalidate card queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["cards", user.uid] });
        queryClient.invalidateQueries({ queryKey: ["displayCases", user.uid] });
        
        setMessage({ 
          success: true, 
          text: "Card deleted successfully!" 
        });
        
        // Call the callback if provided
        onDeleted?.();
      } else {
        setMessage({ 
          success: false, 
          text: "Failed to delete card. See console for details." 
        });
        console.error("[EmergencyDeleteButton] Card deletion failed - check browser console logs");
      }
    } catch (error) {
      console.error("[EmergencyDeleteButton] Unexpected error during deletion:", error);
      setMessage({ 
        success: false, 
        text: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDelete} 
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete Card"}
      </Button>
      
      {message && (
        <div 
          className={`absolute top-full right-0 mt-2 p-2 text-xs rounded-md shadow-lg z-10 ${
            message.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
          style={{ minWidth: '200px' }}
        >
          {message.text}
          {!message.success && (
            <button 
              className="block mt-1 text-blue-600 hover:underline"
              onClick={() => setShowDebug(prev => !prev)}
            >
              {showDebug ? "Hide Debug Info" : "Show Debug Info"}
            </button>
          )}
          
          {!message.success && showDebug && (
            <div className="mt-2 p-2 bg-gray-800 text-white rounded text-xs overflow-auto max-h-40">
              <p>Card ID: {cardId}</p>
              <p>User ID: {user.uid}</p>
              <p>Primary Path: users/{user.uid}/collection/{cardId}</p>
              <p>Secondary Path: users/{user.uid}/cards/{cardId}</p>
              <p>Fallback Path: cards/{cardId}</p>
              <p className="mt-1">Check console for more details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 