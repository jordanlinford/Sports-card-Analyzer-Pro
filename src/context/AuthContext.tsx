import { createContext, useContext, useEffect, useState } from "react";
import { User, getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, updateProfile as fbUpdateProfile, updateEmail as fbUpdateEmail } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  signInWithGoogle: async () => {},
  updateProfile: async () => {},
  updateEmail: async () => {},
});

// Helper function to create user document if it doesn't exist
const createUserIfNotExists = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || "",
      createdAt: new Date(),
    });
    console.log("✅ Firestore user created:", user.uid);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserIfNotExists(user);
        setUser(user);
        toast.success(`Welcome back, ${user.displayName}!`);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully signed out");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Force sign out first to clear any existing session
      try {
        await signOut(auth);
        console.log("Forced sign out before new login");
      } catch (e) {
        console.log("No previous session to sign out");
      }
      
      const provider = new GoogleAuthProvider();
      // Force account selection dialog every time with multiple parameters
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline',
        include_granted_scopes: 'true'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user.uid);
      
      // Immediately create the user document
      await createUserIfNotExists(result.user);
      
      toast.success("Successfully signed in!");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const updateProfile = async (profile: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) throw new Error("No user");
    await fbUpdateProfile(auth.currentUser, profile);
    // Optionally update Firestore user doc
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { displayName: profile.displayName }, { merge: true });
    setUser({ ...auth.currentUser });
  };

  const updateEmail = async (email: string) => {
    if (!auth.currentUser) throw new Error("No user");
    await fbUpdateEmail(auth.currentUser, email);
    // Optionally update Firestore user doc
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { email }, { merge: true });
    setUser({ ...auth.currentUser });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, updateProfile, updateEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 