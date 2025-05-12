import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { emergencyDeleteCard } from '@/utils/emergencyDelete';
import { useQueryClient } from '@tanstack/react-query';

interface EmergencyDeleteButtonProps {
  cardId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  onSuccess?: () => void;
}

export function EmergencyDeleteButton({ 
  cardId, 
  className = '', 
  size = 'md',
  label = 'Delete', 
  onSuccess 
}: EmergencyDeleteButtonProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{success?: boolean; message?: string}>({});
  const queryClient = useQueryClient();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (!user) {
      setResult({ success: false, message: "You must be logged in to delete cards" });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this card?")) {
      return;
    }

    setIsDeleting(true);
    setResult({});

    try {
      const result = await emergencyDeleteCard(user.uid, cardId);
      setResult(result);
      
      if (result.success) {
        // Refresh all queries that might contain cards
        queryClient.invalidateQueries({ queryKey: ["cards", user.uid] });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("[EmergencyDeleteButton] Error:", error);
      setResult({ 
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Configure button styling based on size
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3'
  };

  return (
    <div className={className}>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 ${sizeClasses[size]}`}
      >
        {isDeleting ? "..." : label}
      </button>
      
      {result.message && (
        <div className={`mt-2 p-2 text-xs ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded`}>
          {result.message}
        </div>
      )}
    </div>
  );
} 