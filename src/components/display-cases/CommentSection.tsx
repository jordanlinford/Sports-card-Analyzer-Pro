import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, arrayUnion, getDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { checkSpam, recordUserAction, detectSpamContent } from "@/components/display/SpamFilter";
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

export function CommentSection({ displayCaseId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debug, setDebug] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Fetch existing comments
  useEffect(() => {
    async function fetchComments() {
      setIsLoading(true);
      setDebug(null);
      try {
        // Try reading from public_display_cases first
        let commentsData: any[] = [];
        const publicRef = doc(db, 'public_display_cases', displayCaseId);
        const publicDoc = await getDoc(publicRef);
        
        if (publicDoc.exists() && publicDoc.data().comments) {
          commentsData = publicDoc.data().comments;
          setDebug("Loaded comments from public_display_cases");
        } else {
          // Try legacy displayCases collection as fallback
          const legacyRef = doc(db, 'displayCases', displayCaseId);
          const legacyDoc = await getDoc(legacyRef);
          
          if (legacyDoc.exists() && legacyDoc.data().comments) {
            commentsData = legacyDoc.data().comments;
            setDebug("Loaded comments from legacy displayCases");
          } else {
            setDebug("No comments found in any collection");
          }
        }
        
        // Sort comments by timestamp (newest first)
        const sortedComments = commentsData
          .map(comment => ({
            ...comment,
            timestamp: comment.timestamp?.toDate() || new Date()
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        
        setComments(sortedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setDebug(`Error fetching comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchComments();
    
    // Set up a polling mechanism to refresh comments every 30 seconds
    const intervalId = setInterval(() => {
      fetchComments();
    }, 30000);
    
    return () => clearInterval(intervalId);
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
    
    // Check for spam content
    if (detectSpamContent(comment)) {
      toast.error('Your comment contains inappropriate content.');
      return;
    }
    
    setIsSubmitting(true);
    setDebug(null);
    
    try {
      // Check for spam behavior
      const isSpam = await checkSpam({
        userId: user.uid,
        actionType: 'comment',
        cooldownPeriod: 30000, // 30 seconds between comments
        maxActions: 5 // Max 5 comments in 30 seconds
      });
      
      if (isSpam) {
        toast.error("Please slow down. You're commenting too frequently.");
        return;
      }
      
      const publicRef = doc(db, 'public_display_cases', displayCaseId);
      const legacyRef = doc(db, 'displayCases', displayCaseId);
      
      // Check if the public display case exists
      const publicDoc = await getDoc(publicRef);
      const legacyDoc = await getDoc(legacyRef);
      
      const newComment = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        text: comment.trim(),
        timestamp: new Date()
      };
      
      if (publicDoc.exists()) {
        // Add comment to public display case
        await updateDoc(publicRef, {
          comments: arrayUnion({
            ...newComment,
            timestamp: serverTimestamp()
          })
        });
        
        setDebug("Comment added to public_display_cases");
      } else if (legacyDoc.exists()) {
        // Add comment to legacy display case
        await updateDoc(legacyRef, {
          comments: arrayUnion({
            ...newComment,
            timestamp: serverTimestamp()
          })
        });
        
        setDebug("Comment added to legacy displayCases");
      } else {
        throw new Error('Display case not found');
      }
      
      // Record this action for spam prevention
      await recordUserAction(user.uid, 'comment', displayCaseId);
      
      // Add new comment to state immediately for better UX
      setComments(prevComments => [
        {
          ...newComment
        },
        ...prevComments
      ]);
      
      // Reset comment field
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      setDebug(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      {/* Sign In Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              Please sign in or create an account to leave a comment on this display case.
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
                // Redirect to login page
                window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
              }}
            >
              Sign in / Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          placeholder={user ? "Add a comment..." : "Sign in to leave a comment"}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={handleTextareaFocus}
          className="min-h-[100px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || (!user || !comment.trim())}
          >
            {isSubmitting ? 'Posting...' : (user ? 'Post Comment' : 'Sign in to comment')}
          </Button>
        </div>
      </form>
      
      {/* Debug info - only in development */}
      {debug && import.meta.env.DEV && (
        <div className="bg-gray-800 text-white text-xs p-2 rounded">
          {debug}
        </div>
      )}
      
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