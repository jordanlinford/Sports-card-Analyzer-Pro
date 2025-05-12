import { useUserSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useUserSubscription";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Add your Stripe price IDs here
const PRICE_IDS: Record<string, Record<string, string>> = {
  star: {
    annual: "price_1RN5uOGCix0pRkbmK2kCjqw4",         // Star Annual Plan
    monthly: "price_1RDB4fGCix0pRkbmlNdsyo7s",        // Star Monthly Plan
  },
  veteran: {
    annual: "price_1RN5vwGCix0pRkbmT65EllS1",         // Veteran Annual Plan
    monthly: "price_1RDB4fGCix0pRkbmmPrBX8FE",        // Veteran Monthly Plan
  },
  rookie: {
    monthly: "price_1RN5t3GCix0pRkbmBX32A7AG",        // Rookie Plan (if needed)
  }
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function ProfilePage() {
  const { user, tier, currentTier, loading, error, isAdmin } = useUserSubscription();
  const { updateProfile, updateEmail } = useAuth();
  const [username, setUsername] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOptIn = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setEmailOptIn(!!snap.data().emailOptIn);
      }
    };
    fetchOptIn();
  }, [user]);

  const handleProfileSave = async () => {
    setSaving(true);
    setProfileMsg("");
    try {
      if (user && username !== user.displayName) {
        await updateProfile({ displayName: username });
      }
      if (user && email !== user.email) {
        await updateEmail(email);
      }
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { emailOptIn }, { merge: true });
      }
      setProfileMsg("Profile updated!");
    } catch (err) {
      setProfileMsg("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribe = async (tierId: string, interval: 'monthly' | 'annual') => {
    setLoadingId(`${tierId}-${interval}`);
    try {
      const priceId = PRICE_IDS[tierId]?.[interval];
      if (!priceId) throw new Error("Invalid plan or interval");
      const res = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user?.uid,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create Stripe Checkout session");
      }
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Your Profile
          {isAdmin && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Admin
            </span>
          )}
        </h1>
        <p className="text-gray-600">Manage your account details and subscription.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={saving}
              placeholder="Enter your username"
              title="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={saving}
              placeholder="Enter your email"
              title="Email"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailOptIn}
              onChange={e => setEmailOptIn(e.target.checked)}
              id="emailOptIn"
              disabled={saving}
            />
            <label htmlFor="emailOptIn" className="text-sm">Opt in to marketing emails</label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleProfileSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {profileMsg && <div className="text-sm mt-2 text-center text-green-600">{profileMsg}</div>}
        </CardFooter>
      </Card>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Subscription</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-800">Current Plan:</span>
          <span className="font-semibold text-primary">{isAdmin ? "Admin" : currentTier.name}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([tierId, plan]) => (
          <Card key={tierId} className={`${tier === tierId || isAdmin ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {tierId === 'rookie' ? 'Free' : `Starting at $${plan.price.monthly}/month`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {tierId !== 'rookie' && (
                <>
                  <Button 
                    className="w-full"
                    variant={tier === tierId || isAdmin ? "default" : "outline"}
                    onClick={() => handleSubscribe(tierId, 'monthly')}
                    disabled={loadingId === `${tierId}-monthly`}
                  >
                    {loadingId === `${tierId}-monthly` ? "Loading..." : `$${plan.price.monthly}/month`}
                  </Button>
                  <Button 
                    className="w-full"
                    variant={tier === tierId || isAdmin ? "default" : "outline"}
                    onClick={() => handleSubscribe(tierId, 'annual')}
                    disabled={loadingId === `${tierId}-annual`}
                  >
                    {loadingId === `${tierId}-annual` ? "Loading..." : `$${plan.price.annual}/year`}
                  </Button>
                </>
              )}
              {tierId === 'rookie' && (
                <Button 
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Current Plan
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}