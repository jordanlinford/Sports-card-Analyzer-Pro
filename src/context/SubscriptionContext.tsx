import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type SubscriptionTier =
  | "free"
  | "star_monthly"
  | "star_annual"
  | "veteran_monthly"
  | "veteran_annual";

interface SubscriptionContextValue {
  tier: SubscriptionTier;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  tier: "free",
  loading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }

    const subRef = doc(db, "users", user.uid, "subscriptions", "active");

    const unsubscribe = onSnapshot(subRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const priceId = data.priceId || data.price_id;

        switch (priceId) {
          case import.meta.env.VITE_STRIPE_STAR_MONTHLY_PRICE_ID:
            setTier("star_monthly");
            break;
          case import.meta.env.VITE_STRIPE_STAR_ANNUAL_PRICE_ID:
            setTier("star_annual");
            break;
          case import.meta.env.VITE_STRIPE_VETERAN_MONTHLY_PRICE_ID:
            setTier("veteran_monthly");
            break;
          case import.meta.env.VITE_STRIPE_VETERAN_ANNUAL_PRICE_ID:
            setTier("veteran_annual");
            break;
          default:
            setTier("free");
        }
      } else {
        setTier("free");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ tier, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 