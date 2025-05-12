import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { directDeleteCard } from "@/utils/directCardDelete";
import { toast } from "sonner";

interface CardDeletionProps {
  cardId: string;
  onSuccess?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function CardDeletion({ 
  cardId, 
  onSuccess, 
  variant = "destructive", 
  size = "sm", 
  className = "", 
  children 
}: CardDeletionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("You must be logged in to delete cards");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this card?")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`[CardDeletion] Starting deletion for card ${cardId}`);
      
      const success = await directDeleteCard(user.uid, cardId);
      
      if (success) {
        // Refresh all related queries
        queryClient.invalidateQueries({ queryKey: ["cards", user.uid] });
        queryClient.invalidateQueries({ queryKey: ["displayCases", user.uid] });
        queryClient.invalidateQueries({ queryKey: ["publicDisplayCases"] });
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Error already handled by directDeleteCard
        console.error("[CardDeletion] directDeleteCard returned false");
      }
    } catch (error) {
      console.error("[CardDeletion] Unexpected error:", error);
      toast.error("An unexpected error occurred while deleting the card");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDelete}
      disabled={isLoading || !user}
    >
      {isLoading ? "Deleting..." : children || "Delete"}
    </Button>
  );
} 