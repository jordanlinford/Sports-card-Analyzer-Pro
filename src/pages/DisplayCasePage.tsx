import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DisplayCase } from "@/types/display-case";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DisplayCaseDetailControls } from "@/components/display-cases/DisplayCaseDetailControls";
import DisplayCaseDetail from "@/components/display-cases/DisplayCaseDetail";

export default function DisplayCasePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [displayCase, setDisplayCase] = useState<DisplayCase | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchDisplayCase() {
      if (!id || !user) return;
      
      setLoading(true);
      
      try {
        const displayCaseRef = doc(db, "users", user.uid, "display_cases", id);
        const snapshot = await getDoc(displayCaseRef);
        
        if (snapshot.exists()) {
          setDisplayCase({
            id: snapshot.id,
            ...snapshot.data()
          } as DisplayCase);
        } else {
          toast.error("Display case not found");
        }
      } catch (error) {
        console.error("Error fetching display case:", error);
        toast.error("Failed to load display case");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDisplayCase();
  }, [id, user]);
  
  // Check if the user is the owner of the display case
  const isOwner = user && displayCase ? user.uid === displayCase.userId : false;
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!displayCase) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-500">Display case not found</h1>
        <Button 
          className="mt-4"
          onClick={() => navigate('/display-cases')}
        >
          Back to Display Cases
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Controls for editing/deleting if user is owner */}
      {isOwner && user && (
        <div className="bg-white border-b mb-4">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-end">
            <DisplayCaseDetailControls
              displayCase={displayCase}
              isOwner={isOwner}
              userId={user.uid}
            />
          </div>
        </div>
      )}
      
      {/* Display the display case content */}
      <DisplayCaseDetail />
    </div>
  );
} 