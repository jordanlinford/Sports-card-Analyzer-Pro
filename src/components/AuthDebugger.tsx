import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { signOut, getAuth } from "firebase/auth";
import { Button } from "@/components/ui/button";

export function AuthDebugger() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  // Check if user document exists
  const checkUserDoc = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserDoc(userSnap.data());
        console.log("User document exists:", userSnap.data());
      } else {
        setUserDoc(null);
        console.log("User document does not exist");
      }
    } catch (error) {
      console.error("Error checking user document:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create user document
  const createUserDoc = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
      });
      console.log("User document created successfully");
      await checkUserDoc();
    } catch (error) {
      console.error("Error creating user document:", error);
    } finally {
      setLoading(false);
    }
  };

  // Force sign out
  const forceSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Clear browser storage
  const clearBrowserStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Browser storage cleared");
    alert("Browser storage cleared. Page will reload.");
    window.location.reload();
  };

  // Check user document on mount
  useEffect(() => {
    if (user) {
      checkUserDoc();
    } else {
      setUserDoc(null);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-bold mb-2">Auth Debugger</h2>
        <p>Not signed in</p>
        <Button 
          onClick={clearBrowserStorage} 
          variant="outline" 
          className="mt-2"
        >
          Clear Browser Storage
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h2 className="text-lg font-bold mb-2">Auth Debugger</h2>
      
      <div className="mb-3">
        <p><strong>User ID:</strong> {user.uid}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      
      <div className="mb-3">
        <p>
          <strong>User Document:</strong> {userDoc ? (
            <span className="text-green-600">Exists ✓</span>
          ) : (
            <span className="text-red-600">Missing ✗</span>
          )}
        </p>
        
        {userDoc && (
          <div className="mt-1 pl-4 border-l-2 border-gray-300">
            <p><strong>UID stored:</strong> {userDoc.uid || "missing"}</p>
            <p><strong>Created At:</strong> {userDoc.createdAt ? 
              new Date(userDoc.createdAt.seconds * 1000).toLocaleString() : 
              "missing"
            }</p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={checkUserDoc}
          variant="outline"
          disabled={loading}
        >
          Refresh
        </Button>
        
        {!userDoc && (
          <Button 
            onClick={createUserDoc}
            disabled={loading}
          >
            Create User Doc
          </Button>
        )}
        
        <Button 
          onClick={forceSignOut}
          variant="destructive"
          disabled={loading}
        >
          Force Sign Out
        </Button>
        
        <Button 
          onClick={clearBrowserStorage}
          variant="outline"
          disabled={loading}
        >
          Clear Storage
        </Button>
      </div>
    </div>
  );
} 