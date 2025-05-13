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
  const { likeDisplayCase, commentOnDisplayCase } = useDisplayCases();
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
      await commentOnDisplayCase(displayCase.id, {
        user: user.uid,
        text: commentText.trim(),
        createdAt: new Date(),
      });
      setCommentText('');
      setIsCommentModalOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async () => {
    try {
      await likeDisplayCase(displayCase.id);
    } catch (error) {
      console.error('Error liking display case:', error);
    }
  };

  return (
    <div className="relative bg-white dark:bg-background-dark rounded-2xl shadow-lg border-2 border-primary/20 dark:border-secondary/30 p-6 mb-6 hover:shadow-xl transition-shadow group">
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary dark:bg-secondary rounded-full opacity-80" />
      <div className="flex justify-between items-start mb-4 pl-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary dark:text-secondary mb-1">{displayCase.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 font-body mt-1">{displayCase.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit} className="border-primary text-primary dark:border-secondary dark:text-secondary font-bold hover:bg-primary/10 dark:hover:bg-secondary/10 transition-colors">
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} className="font-bold">
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pl-4">
        {displayCase.cardIds.map((cardId) => (
          <div key={cardId} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 shadow font-mono text-sm text-gray-700 dark:text-gray-200">
            {/* Card preview will go here */}
            <p>Card ID: {cardId}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4 pl-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleLike} className="hover:text-accent">
            <span className="mr-2">❤️</span>
            {displayCase.likes || 0}
          </Button>
          <Button variant="ghost" onClick={() => setIsCommentModalOpen(true)} className="hover:text-accent">
            💬 {displayCase.comments ? displayCase.comments.length : 0}
          </Button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          Created {formatRelative(displayCase.createdAt, new Date())}
        </div>
      </div>

      {/* Comments List */}
      {displayCase.comments && displayCase.comments.length > 0 && (
        <div className="mt-4 pl-4">
          <h3 className="font-heading text-primary dark:text-secondary text-lg mb-2">Comments</h3>
          <ul className="space-y-2">
            {displayCase.comments.map((c, idx) => (
              <li key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-200">
                <span className="font-bold text-primary dark:text-secondary">{c.user}:</span> {c.text}
                {c.createdAt && (
                  <span className="block text-xs text-gray-400 mt-1">
                    {typeof c.createdAt === 'string'
                      ? c.createdAt
                      : c.createdAt?.seconds
                        ? new Date(c.createdAt.seconds * 1000).toLocaleString()
                        : ''}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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