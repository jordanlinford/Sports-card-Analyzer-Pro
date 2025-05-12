import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DisplayCase } from "@/types/display-case";
import { Button } from "@/components/ui/button";
import { EditDisplayCaseModal } from "./EditDisplayCaseModal";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DisplayCaseDetailControlsProps {
  displayCase: DisplayCase;
  isOwner: boolean;
  userId: string;
}

export function DisplayCaseDetailControls({ 
  displayCase, 
  isOwner, 
  userId 
}: DisplayCaseDetailControlsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  if (!isOwner) return null;
  
  const handleDeleteDisplayCase = async () => {
    if (!displayCase.id || !userId) return;
    
    setIsDeleting(true);
    
    try {
      // Delete the display case document from user's collection
      const displayCaseRef = doc(db, "users", userId, "display_cases", displayCase.id);
      await deleteDoc(displayCaseRef);
      
      // If the display case was public, also delete it from public collection
      if (displayCase.isPublic) {
        console.log("Deleting from public collection");
        const publicRef = doc(db, "public_display_cases", displayCase.id);
        try {
          const publicSnap = await getDoc(publicRef);
          if (publicSnap.exists()) {
            await deleteDoc(publicRef);
          }
        } catch (err) {
          console.error("Error deleting from public collection:", err);
          // Continue anyway since the main delete succeeded
        }
      }
      
      toast.success("Display case deleted successfully");
      // Redirect to display cases list
      navigate("/display-cases");
    } catch (error) {
      console.error("Error deleting display case:", error);
      toast.error("Failed to delete display case");
      setIsDeleting(false);
    }
  };

  const copyPublicLink = () => {
    // Use the display case ID directly as the publicId
    const publicId = displayCase.id;
    const publicUrl = `${window.location.origin}/display/${publicId}`;
    
    navigator.clipboard.writeText(publicUrl)
      .then(() => {
        toast.success("Public link copied to clipboard!");
        console.log("Public URL:", publicUrl);
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy link");
      });
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsEditModalOpen(true)}
      >
        Edit
      </Button>
      
      {displayCase.isPublic && (
        <Button
          variant="outline"
          size="sm"
          onClick={copyPublicLink}
          className="flex items-center gap-1"
        >
          <Link2 className="h-4 w-4" />
          <span>Get Public Link</span>
        </Button>
      )}
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
          >
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete your display case "{displayCase.name}".
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteDisplayCase}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit display case modal */}
      {isEditModalOpen && (
        <EditDisplayCaseModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          displayCase={displayCase}
        />
      )}
    </div>
  );
} 