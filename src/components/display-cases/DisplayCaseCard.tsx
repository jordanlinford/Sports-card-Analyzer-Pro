import { DisplayCase } from "@/types/display-case";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { PlaceholderCard } from "@/components/ui/placeholder-card";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/types/Card";

interface DisplayCaseCardProps {
  displayCase: DisplayCase;
}

export default function DisplayCaseCard({ displayCase }: DisplayCaseCardProps) {
  const navigate = useNavigate();
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCardImages() {
      if (!user?.uid || !displayCase.cardIds?.length) {
        setLoading(false);
        return;
      }

      try {
        const images: string[] = [];
        // Only fetch the first 3 cards for preview
        const cardIdsToFetch = displayCase.cardIds.slice(0, 3);

        for (const cardId of cardIdsToFetch) {
          let imageUrl = null;
          
          // Try cards collection first
          try {
            const cardRef = doc(db, "users", user.uid, "cards", cardId);
            const cardSnapshot = await getDoc(cardRef);
            
            if (cardSnapshot.exists() && cardSnapshot.data().imageUrl) {
              imageUrl = cardSnapshot.data().imageUrl;
            }
          } catch (error) {
            console.log("Error fetching card image from cards collection:", error);
          }
          
          // If not found, try collection path
          if (!imageUrl) {
            try {
              const collectionRef = doc(db, "users", user.uid, "collection", cardId);
              const collectionSnapshot = await getDoc(collectionRef);
              
              if (collectionSnapshot.exists() && collectionSnapshot.data().imageUrl) {
                imageUrl = collectionSnapshot.data().imageUrl;
              }
            } catch (error) {
              console.log("Error fetching card image from collection:", error);
            }
          }

          if (imageUrl) {
            images.push(imageUrl);
          }
        }

        setCardImages(images);
      } catch (error) {
        console.error("Error fetching card images:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCardImages();
  }, [displayCase.cardIds, user]);

  const handleClick = () => {
    navigate(`/display-case/${displayCase.id}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    
    // Handle both Firestore Timestamp objects and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy");
  };

  return (
    <div 
      className="rounded-2xl border p-4 shadow hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold mb-1">{displayCase.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Created on {formatDate(displayCase.createdAt)}
      </p>

      {displayCase.tags && displayCase.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {displayCase.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {displayCase.cardIds && displayCase.cardIds.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {loading ? (
            // Show placeholders while loading
            Array(Math.min(3, displayCase.cardIds.length)).fill(0).map((_, i) => (
              <div key={i} className="relative group">
                <PlaceholderCard className="h-20 w-auto animate-pulse" />
              </div>
            ))
          ) : (
            // Show actual card images or placeholders if no images found
            displayCase.cardIds.slice(0, 3).map((cardId, idx) => (
              <div key={cardId} className="relative group">
                {cardImages[idx] ? (
                  <img 
                    src={cardImages[idx]} 
                    alt="Card" 
                    className="h-20 w-auto object-cover rounded-lg border"
                  />
                ) : (
                  <PlaceholderCard className="h-20 w-auto" />
                )}
              </div>
            ))
          )}
          {displayCase.cardIds.length > 3 && (
            <div className="flex items-center justify-center h-20 w-20 bg-muted rounded-lg border">
              <span className="text-sm text-muted-foreground">+{displayCase.cardIds.length - 3}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No cards yet</p>
      )}
    </div>
  );
} 