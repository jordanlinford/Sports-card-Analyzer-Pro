import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, orderBy, limit, Timestamp, addDoc } from "firebase/firestore";

interface SpamCheckOptions {
  userId: string;
  actionType: 'comment' | 'like' | 'message';
  cooldownPeriod?: number; // in milliseconds
  maxActions?: number;  
}

/**
 * Checks if a user is spamming actions by enforcing rate limits
 * @returns boolean - true if action should be blocked (spam detected)
 */
export async function checkSpam({
  userId,
  actionType,
  cooldownPeriod = 60000, // Default 1 minute cooldown
  maxActions = 5, // Default max 5 actions per time window
}: SpamCheckOptions): Promise<boolean> {
  if (!userId) return true; // Block if no user ID

  try {
    // Get time threshold for cooldown period (e.g., last 10 minutes)
    const timeWindow = Timestamp.fromMillis(Date.now() - cooldownPeriod);
    
    // Query all user actions of this type within time window
    const actionsRef = collection(db, 'userActions');
    const actionsQuery = query(
      actionsRef,
      where('userId', '==', userId),
      where('actionType', '==', actionType),
      where('timestamp', '>=', timeWindow),
      orderBy('timestamp', 'desc'),
      limit(maxActions + 1)
    );

    const actionsSnapshot = await getDocs(actionsQuery);
    
    // If user has more actions than allowed in the time window, block as spam
    return actionsSnapshot.size > maxActions;
  } catch (error) {
    console.error("Error checking spam:", error);
    return false; // Default to allowing in case of error
  }
}

/**
 * Records a user action to track for spam prevention
 */
export async function recordUserAction(
  userId: string,
  actionType: 'comment' | 'like' | 'message',
  targetId: string
): Promise<void> {
  try {
    // Add record to userActions collection
    const actionsRef = collection(db, 'userActions');
    await addDoc(actionsRef, {
      userId,
      actionType,
      targetId,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error("Error recording user action:", error);
  }
}

/**
 * Detects potentially spammy content in messages and comments
 * @returns boolean - true if spam content is detected
 */
export function detectSpamContent(content: string): boolean {
  if (!content) return false;
  
  // Convert to lowercase for case-insensitive matching
  const text = content.toLowerCase();
  
  // List of spam trigger patterns - revised to reduce false positives
  const spamPatterns = [
    // URLs with suspicious TLDs only
    /\b\w+\.(xyz|tk|ml|ga|cf|gq)\b/,
    
    // More specific spam phrases (removed common words like buy, free, offer)
    /\b(click here|limited time offer|act now|guaranteed|congratulations you've won)\b/i,
    
    // Adult content indicators - more specific
    /\b(xxx|porn|casino|gambl(e|ing)|wager)\b/i,
    
    // Contact information harvesting - more specific
    /\b(contact me on whatsapp|reach me on telegram|call me now)\b/i,
    
    // Repetitive characters (e.g., "aaaaa", "!!!!!!")
    /(.)\1{5,}/,
    
    // Cryptocurrency spam - more specific phrases
    /\b(buy bitcoin now|crypto opportunity|nft investment|wallet synchronization)\b/i,
    
    // ALL CAPS (made more strict - only if 7+ characters in sequence)
    /\b[A-Z]{7,}\b/,
    
    // Excessive punctuation - more permissive
    /([!?.]){5,}/,
    
    // Investment/money scams - more specific
    /\b(get rich quick|money fast|earn from home easily|investment opportunity|passive income guaranteed|financial freedom now)\b/i
  ];
  
  // Check if any spam pattern is found
  return spamPatterns.some(pattern => pattern.test(text));
}

/**
 * Gets user reputation score for spam detection
 * Higher score = more trustworthy
 */
export async function getUserReputationScore(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    // Base score
    let score = 5;
    
    // Query recent user actions
    const actionsRef = collection(db, 'userActions');
    const actionsQuery = query(
      actionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const actionsSnapshot = await getDocs(actionsQuery);
    
    // Too many actions = suspicious
    if (actionsSnapshot.size > 30) {
      score -= 2;
    }
    
    // Return normalized score (0-10)
    return Math.max(0, Math.min(10, score));
  } catch (error) {
    console.error("Error getting user reputation:", error);
    return 5; // Default neutral score
  }
} 