import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface SubscriptionTier {
  name: string;
  features: string[];
  price: {
    monthly: number;
    annual: number;
  };
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  rookie: {
    name: "Rookie",
    features: [
      "Basic card tracking",
      "Market value updates",
      "Basic analytics"
    ],
    price: {
      monthly: 0,
      annual: 0
    }
  },
  star: {
    name: "Star",
    features: [
      "Everything in Rookie",
      "Advanced analytics",
      "Price predictions",
      "Grading recommendations",
      "Priority support"
    ],
    price: {
      monthly: 9.99,
      annual: 99
    }
  },
  veteran: {
    name: "Veteran",
    features: [
      "Everything in Star",
      "Bulk card management",
      "Custom reports",
      "API access",
      "Dedicated support"
    ],
    price: {
      monthly: 19.99,
      annual: 199
    }
  }
};

export function useUserSubscription() {
  const { user } = useAuth();
  const [tier, setTier] = useState<string>("rookie");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    
    // Set up real-time listener for subscription changes
    const unsubscribe = onSnapshot(userRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setTier(data.subscriptionTier || "rookie");
          setIsAdmin(!!data.isAdmin);
        } else {
          setTier("rookie");
          setIsAdmin(false);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching subscription:", err);
        setError("Failed to load subscription data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const currentTier = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.rookie;

  return {
    user,
    tier,
    currentTier,
    loading,
    error,
    isSubscribed: tier !== "rookie",
    isAdmin
  };
} 