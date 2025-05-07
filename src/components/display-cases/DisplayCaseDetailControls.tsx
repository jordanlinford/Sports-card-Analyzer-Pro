import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DisplayCase } from "@/types/display-case";
import { Button } from "@/components/ui/button";
import { EditDisplayCaseModal } from "./EditDisplayCaseModal";
import { toast } from "sonner";
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
      // Delete the display case document
      const displayCaseRef = doc(db, "users", userId, "display_cases", displayCase.id);
      await deleteDoc(displayCaseRef);
      
      toast.success("Display case deleted successfully");
      // Redirect to display cases list
      navigate("/display-cases");
    } catch (error) {
      console.error("Error deleting display case:", error);
      toast.error("Failed to delete display case");
      setIsDeleting(false);
    }
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