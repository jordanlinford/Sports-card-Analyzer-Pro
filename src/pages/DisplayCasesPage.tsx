import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisplayCases } from "@/hooks/display/useDisplayCases";
import { useCards } from "@/hooks/useCards";
import { DisplayCase } from "@/types/display-case";
import { Card } from "@/types/Card";
import { CreateDisplayCaseModal } from "@/components/display-cases/CreateDisplayCaseModal";
import { EditDisplayCaseModal } from "@/components/display-cases/EditDisplayCaseModal";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCardTagMatch } from "@/hooks/useCardTagMatch";
import { 
  collection, doc, getDoc, getDocs, updateDoc, deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useUserSubscription } from "@/hooks/useUserSubscription";

const woodBg = "bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-amber-100";
const glassOverlay = "absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 pointer-events-none rounded-lg";
const goldBorder = "border-4 border-yellow-700";
const shadow = "shadow-xl";
const badge = "absolute top-2 right-2 bg-yellow-700 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md z-10";

export default function DisplayCasesPage() {
  const { displayCases = [], isLoading, deleteDisplayCase, createDisplayCase, refetch } = useDisplayCases();
  const { data: cards = [] } = useCards();
  const { user } = useAuth();
  const { isAdmin } = useUserSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalCase, setDeleteModalCase] = useState<DisplayCase | null>(null);
  const [editModalCase, setEditModalCase] = useState<DisplayCase | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [directDisplayCases, setDirectDisplayCases] = useState<any[]>([]);
  const [directCards, setDirectCards] = useState<any[]>([]);
  const [isDirectlyLoading, setIsDirectlyLoading] = useState(true);
  const navigate = useNavigate();

  // Example: If you have a display case limit, allow unlimited for admins
  const MAX_DISPLAY_CASES = 5; // or whatever your normal limit is
  const canCreateDisplayCase = isAdmin || displayCases.length < MAX_DISPLAY_CASES;

  // Directly fetch display cases and cards from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    
    setIsDirectlyLoading(true);
    
    // Get display cases
    const displayCasesRef = collection(db, "users", user.uid, "display_cases");
    const unsubscribe = onSnapshot(displayCasesRef, (snapshot) => {
      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDirectDisplayCases(cases);
      setIsDirectlyLoading(false);
    }, (error) => {
      console.error("Error fetching display cases:", error);
      setIsDirectlyLoading(false);
    });
    
    // Get cards from both paths
    const fetchCards = async () => {
      try {
        let allCards: any[] = [];
        
        // Try cards path
        try {
          const cardsRef = collection(db, "users", user.uid, "cards");
          const cardsSnapshot = await getDocs(cardsRef);
          if (!cardsSnapshot.empty) {
            const cardData = cardsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Ensure tags is an array
              tags: Array.isArray(doc.data().tags) ? doc.data().tags : []
            }));
            allCards = [...allCards, ...cardData];
          }
        } catch (e) {
          console.error("Error fetching from /cards:", e);
        }
        
        // Try collection path
        try {
          const collectionRef = collection(db, "users", user.uid, "collection");
          const collectionSnapshot = await getDocs(collectionRef);
          if (!collectionSnapshot.empty) {
            const collectionData = collectionSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              // Ensure tags is an array
              tags: Array.isArray(doc.data().tags) ? doc.data().tags : []
            }));
            allCards = [...allCards, ...collectionData];
          }
        } catch (e) {
          console.error("Error fetching from /collection:", e);
        }
        
        setDirectCards(allCards);
      } catch (error) {
        console.error("Error directly fetching cards:", error);
      }
    };
    
    fetchCards();
    
    return () => unsubscribe();
  }, [user]);
  
  // Direct Firestore delete function
  const directDeleteDisplayCase = async (id: string) => {
    if (!user?.uid) {
      toast.error("You must be logged in to delete a display case");
      return;
    }
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "display_cases", id));
      toast.success("Display case deleted successfully");
      setDeleteModalCase(null);
    } catch (error) {
      console.error("Error deleting display case:", error);
      toast.error("Failed to delete display case");
    }
  };
  
  // Directly handle a delete request
  const handleDirectDelete = async () => {
    if (!deleteModalCase?.id) return;
    
    await directDeleteDisplayCase(deleteModalCase.id);
  };
  
  // Direct check if a card matches the display case tags
  const cardMatchesDisplayCase = (card: any, displayCase: any): boolean => {
    if (!card?.tags || !displayCase?.tags) return false;
    
    const cardTags = Array.isArray(card.tags) ? card.tags : [];
    const caseTags = Array.isArray(displayCase.tags) ? displayCase.tags : [];
    
    if (cardTags.length === 0 || caseTags.length === 0) return false;
    
    return cardTags.some((tag: string) => caseTags.includes(tag));
  };
  
  // Get matching cards for a display case
  const getMatchingCardsForCase = (displayCase: any): any[] => {
    return directCards.filter(card => cardMatchesDisplayCase(card, displayCase));
  };

  // Directly render card thumbnails
  const DirectCardThumbnails = ({ displayCase }: { displayCase: any }) => {
    const matchingCards = getMatchingCardsForCase(displayCase);
    
    if (matchingCards.length === 0) {
      return <div className="text-xs text-amber-400">No matching cards</div>;
    }
    
    // Take up to 4 cards
    const displayCards = matchingCards.slice(0, 4);
    
    return (
      <>
        {/* Glass overlay */}
        <div className={glassOverlay} />
        {displayCards.map((card, idx) => (
          <img
            key={idx}
            src={card.imageUrl || "https://via.placeholder.com/300x420?text=No+Image"}
            alt={card.playerName || "Card thumbnail"}
            className="w-16 h-24 object-cover rounded shadow-lg border-2 border-amber-200 bg-white/80 group-hover:shadow-yellow-400/40 transition-all duration-200"
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18), 0 0 0 2px #eab30833' }}
          />
        ))}
      </>
    );
  };

  // Define CardThumbnails component for displaying card images
  const CardThumbnails = ({ displayCase }: { displayCase: DisplayCase }) => {
    const { cardImageUrls, hasMatches } = useCardTagMatch(cards, displayCase);
    
    if (cardImageUrls.length === 0) {
      return <div className="text-xs text-amber-400">No cards</div>;
    }
    
    return (
      <>
        {/* Glass overlay */}
        <div className={glassOverlay} />
        {cardImageUrls.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt="Card thumbnail"
            className="w-16 h-24 object-cover rounded shadow-lg border-2 border-amber-200 bg-white/80 group-hover:shadow-yellow-400/40 transition-all duration-200"
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.18), 0 0 0 2px #eab30833' }}
          />
        ))}
      </>
    );
  }

  const handleDelete = async () => {
    if (!deleteModalCase) return;
    try {
      await deleteDisplayCase(deleteModalCase.id);
      toast.success(`"${deleteModalCase.name}" was deleted`);
      setDeleteModalCase(null);
    } catch (error) {
      console.error("Error deleting display case:", error);
      toast.error("Failed to delete display case");
    }
  };

  const handleCardClick = (displayCase: DisplayCase, e: React.MouseEvent) => {
    // Navigate to display case details
    navigate(`/display-case/${displayCase.id}`);
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Close dropdown when clicking outside
  const handlePageClick = () => {
    if (openDropdownId) setOpenDropdownId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" onClick={handlePageClick}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Display Cases</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          onClick={() => setIsModalOpen(true)}
          disabled={!canCreateDisplayCase}
        >
          + Create Display Case
        </button>
      </div>

      {/* Create Display Case Modal */}
      {isModalOpen && (
        <CreateDisplayCaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalCase && (
        <Modal 
          isOpen={!!deleteModalCase}
          onClose={() => setDeleteModalCase(null)}
          title="Delete Display Case"
        >
          <div className="p-6">
            <p className="mb-4">Are you sure you want to delete "{deleteModalCase.name}"? This cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={(e) => {
                e.stopPropagation();
                setDeleteModalCase(null);
              }}>Cancel</Button>
              <Button variant="destructive" onClick={handleDirectDelete}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editModalCase && (
        <EditDisplayCaseModal
          isOpen={!!editModalCase}
          onClose={() => setEditModalCase(null)}
          displayCase={editModalCase}
        />
      )}

      {isDirectlyLoading ? (
        <div>Loading display cases...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {directDisplayCases.map((displayCase) => {
            return (
              <div
                key={displayCase.id}
                className={`relative ${woodBg} ${goldBorder} ${shadow} rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-105 hover:shadow-amber-300/60`}
                style={{ minHeight: 260 }}
                onClick={(e) => navigate(`/display-case/${displayCase.id}`)}
              >
                {/* Wood badge */}
                <span className={badge}>Wood</span>

                {/* Action Menu */}
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <button 
                      className="p-1.5 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100"
                      onClick={(e) => toggleDropdown(displayCase.id, e)}
                      aria-label="Display case options"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    <div className={`${openDropdownId === displayCase.id ? 'block' : 'hidden'} absolute left-0 top-8 bg-white shadow-lg rounded-md py-1 min-w-[150px] z-20`}>
                      <button 
                        className="w-full text-left px-4 py-1.5 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModalCase(displayCase);
                          setOpenDropdownId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="w-full text-left px-4 py-1.5 hover:bg-gray-100 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalCase(displayCase);
                          setOpenDropdownId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b border-amber-300/40">
                  <h2 className="text-lg font-bold mb-1 group-hover:text-yellow-800 transition">{displayCase.name}</h2>
                  <div className="text-xs text-amber-700 mb-2">
                    {displayCase.createdAt ? 
                      new Date(displayCase.createdAt.seconds ? 
                        displayCase.createdAt.seconds * 1000 : 
                        displayCase.createdAt).toLocaleDateString() 
                      : ''}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {displayCase.tags && displayCase.tags.length > 0 ? (
                      displayCase.tags.map((tag: string) => (
                        <span key={tag} className="bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full mr-1 border border-yellow-300">{tag}</span>
                      ))
                    ) : (
                      <span className="text-xs text-amber-400">No tags</span>
                    )}
                  </div>
                </div>
                <div className="relative flex gap-2 p-4 justify-center items-center min-h-[90px] bg-amber-50 rounded-b-2xl">
                  <DirectCardThumbnails displayCase={displayCase} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 