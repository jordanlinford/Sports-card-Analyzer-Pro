import { useState } from "react";
import { Share2, Twitter, Facebook, Mail, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { checkSpam, recordUserAction } from "./SpamFilter";
import { useAuth } from "@/context/AuthContext";

interface EnhancedShareButtonProps {
  publicId: string;
  title: string;
}

export function EnhancedShareButton({ publicId, title }: EnhancedShareButtonProps) {
  const shareUrl = `${window.location.origin}/display/${publicId}`;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const recordShare = async (platform: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Check for spam behavior
      const isSpam = await checkSpam({
        userId: user.uid,
        actionType: 'message', // Use message action type for rate limiting
        cooldownPeriod: 10000, // 10 seconds between shares
        maxActions: 5 // Max 5 shares in 10 seconds
      });
      
      if (isSpam) {
        toast.error("You're sharing too frequently. Please slow down.");
        return;
      }
      
      // Record the share action
      await recordUserAction(user.uid, 'message', publicId);
      
    } catch (error) {
      console.error("Error recording share:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      
      if (user) {
        recordShare("clipboard");
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this sports card display: ${title}`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    
    if (user) {
      recordShare("twitter");
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    
    if (user) {
      recordShare("facebook");
    }
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Check out this sports card display: ${title}`);
    const body = encodeURIComponent(`I found this awesome sports card display that I think you'll like:\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    if (user) {
      recordShare("email");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard}>
          <LinkIcon className="mr-2 h-4 w-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter}>
          <Twitter className="mr-2 h-4 w-4" />
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="mr-2 h-4 w-4" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareByEmail}>
          <Mail className="mr-2 h-4 w-4" />
          <span>Email</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 