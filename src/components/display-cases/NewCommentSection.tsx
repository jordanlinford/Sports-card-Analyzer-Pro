import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  photoURL?: string;
  timestamp: Date;
}

interface CommentSectionProps {
  displayCaseId: string;
}

export function NewCommentSection({ displayCaseId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (!displayCaseId) return;
      
      setIsLoading(true);
      
      try {
        const publicRef = doc(db, 'public_display_cases', displayCaseId);
        const publicDoc = await getDoc(publicRef);
        
        if (publicDoc.exists()) {
          const docData = publicDoc.data();
          if (docData.comments && Array.isArray(docData.comments)) {
            // Transform and sort comments
            const commentsData = docData.comments.map((comment: any) => ({
            ...comment,
              timestamp: comment.timestamp?.toDate() || new Date(),
              userId: comment.userId || '',
              userName: comment.userName || 'Anonymous',
            }));
            
            // Sort by timestamp desc (newest first)
            commentsData.sort((a: Comment, b: Comment) => 
              b.timestamp.getTime() - a.timestamp.getTime()
            );
        
            setComments(commentsData);
          }
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [displayCaseId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const publicRef = doc(db, 'public_display_cases', displayCaseId);
      
      // Check if the public display case exists
      const publicDoc = await getDoc(publicRef);
      
      if (publicDoc.exists()) {
        const newComment = {
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          text: comment.trim(),
          timestamp: new Date()
        };
        
        // Add comment to public display case
        await updateDoc(publicRef, {
          comments: arrayUnion(newComment)
        });
        
        // Add new comment to state
        setComments(prevComments => [
          {
            ...newComment,
            id: Math.random().toString(36).substr(2, 9)
          },
          ...prevComments
        ]);
        
        // Reset comment field
        setComment('');
        toast.success('Comment added successfully');
      } else {
        toast.error('Display case not found');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaFocus = () => {
    if (!user) {
      setShowAuthDialog(true);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments</h2>
      
      {/* Comment form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
          placeholder={user ? "Add a comment..." : "Sign in to leave a comment"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          onFocus={handleTextareaFocus}
            className="min-h-[100px]"
          disabled={isSubmitting || !user}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
            disabled={isSubmitting || !user || !comment.trim()}
            >
            {isSubmitting ? 'Posting...' : (user ? 'Post Comment' : 'Sign in to comment')}
          </Button>
        </div>
      </form>
      
      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              Please sign in or create an account to comment on this display case.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowAuthDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Redirect to login page with current URL as redirect target
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
              }}
            >
              Sign in / Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comments list */}
      <div className="space-y-4 mt-8">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-3 items-start mb-2">
                <Avatar className="h-8 w-8">
                  {comment.photoURL ? (
                    <AvatarImage src={comment.photoURL} alt={comment.userName} />
                  ) : (
                    <AvatarFallback>
                      {comment.userName?.charAt(0) || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{comment.userName || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 pl-11">{comment.text}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No comments yet. Be the first to comment!</div>
        )}
      </div>
      
      {!user && comments.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          Sign in to leave a comment on this display case.
        </div>
      )}
    </div>
  );
} 