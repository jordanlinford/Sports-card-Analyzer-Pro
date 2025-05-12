import { useState } from 'react';
import { DisplayCase } from '@/lib/firebase/displayCases';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatRelative } from 'date-fns';
import { useDisplayCases } from '@/hooks/display/useDisplayCases';
import { useAuth } from "@/context/AuthContext";

interface DisplayCaseProps {
  displayCase: DisplayCase;
  onEdit?: () => void;
}

export function DisplayCaseComponent({ displayCase, onEdit }: DisplayCaseProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { remove, comment, like } = useDisplayCases();
  const { user } = useAuth();

  const handleDelete = async () => {
    try {
      await remove(displayCase.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting display case:', error);
    }
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    try {
      await comment(displayCase.id, {
        user: user.uid,
        text: commentText.trim()
      });
      setCommentText('');
      setIsCommentModalOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async () => {
    try {
      await like(displayCase.id);
    } catch (error) {
      console.error('Error liking display case:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{displayCase.name}</h2>
          <p className="text-gray-600 mt-1">{displayCase.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {displayCase.cardIds.map((cardId) => (
          <div key={cardId} className="bg-gray-100 rounded-lg p-4">
            {/* Card preview will go here */}
            <p className="text-sm text-gray-600">Card ID: {cardId}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleLike}>
            <span className="mr-2">❤️</span>
            {displayCase.likes}
          </Button>
          <Button variant="ghost" onClick={() => setIsCommentModalOpen(true)}>
            💬 {displayCase.comments.length}
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Created {formatRelative(displayCase.createdAt, new Date())}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Display Case"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this display case? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Add Comment"
      >
        <div className="space-y-4">
          <textarea
            className="w-full p-2 border rounded-md"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCommentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComment}>Post Comment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 