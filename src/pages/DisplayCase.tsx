import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDisplayCases } from "@/hooks/display/useDisplayCases";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/Card";
import DisplayCaseDetail from "@/components/display-cases/DisplayCaseDetail";
import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DisplayCaseDetailControls } from "@/components/display-cases/DisplayCaseDetailControls";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DisplayCasePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayCases, isLoading: isLoadingDisplayCases } = useDisplayCases();
  const { data: savedSearches, isLoading: isLoadingSavedSearches } = useSavedSearches();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      console.log("Display case page loaded with ID:", id);
    }
  }, [id]);
  
  const displayCase = displayCases?.find(dc => dc.id === id);
  const isLoading = isLoadingDisplayCases || isLoadingSavedSearches;

  // Check if the user is the owner of the display case
  const isOwner = user && displayCase ? user.uid === displayCase.userId : false;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!displayCase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Display case not found</h1>
        <Button 
          className="mt-4"
          onClick={() => navigate('/display-cases')}
        >
          Back to Display Cases
        </Button>
      </div>
    );
  }

  const cards = displayCase.cardIds
    .map(cardId => savedSearches?.find(search => search.id === cardId))
    .filter(Boolean);

  return (
    <div>
      {/* Add edit/delete controls if user is owner */}
      {isOwner && user && (
        <div className="bg-white border-b mb-4">
          <div className="container mx-auto px-4 py-3 flex justify-end">
            <DisplayCaseDetailControls
              displayCase={displayCase}
              isOwner={isOwner}
              userId={user.uid}
            />
          </div>
        </div>
      )}
    
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{displayCase.name}</h1>
          <p className="text-gray-500">
            Created by {user?.displayName || "Anonymous"} on{" "}
            {new Date(displayCase.createdAt.toDate()).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards && cards.length > 0 ? cards.map((card) => (
            card && (
              <Card
                key={card.id}
                card={card as any}
                onClick={() => {
                  // TODO: Implement card click handler
                  console.log("Card clicked:", card);
                }}
              />
            )
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No cards in this display case</p>
            </div>
          )}
        </div>

        <DisplayCaseDetail />
      </div>
    </div>
  );
} 