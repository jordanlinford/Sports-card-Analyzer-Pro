import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

export function FixUserDocument() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const fixUserDoc = async () => {
    if (!user) {
      setResult("Error: Not logged in");
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Update with all required fields
      await updateDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        updatedAt: serverTimestamp(),
      });
      
      setResult("✅ User document fixed! All fields added.");
      console.log("User document updated with required fields");
    } catch (error: any) {
      console.error("Error updating user document:", error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
      <h3 className="font-medium text-red-800 mb-2">🛠️ Fix User Document</h3>
      <p className="text-sm mb-3">
        Your user document exists but is missing required fields like <code>uid</code>.
        This will prevent card deletion from working properly.
      </p>
      
      <Button 
        onClick={fixUserDoc}
        variant="destructive"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Fixing..." : "Fix User Document"}
      </Button>
      
      {result && (
        <div className="mt-2 text-sm font-medium">
          {result}
        </div>
      )}
    </div>
  );
} 