import { useUserSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useUserSubscription";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function ProfilePage() {
  const { user, tier, currentTier, loading, error } = useUserSubscription();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string, interval: 'monthly' | 'annual') => {
    setLoadingId(`${tierId}-${interval}`);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ 
          tierId,
          interval,
          userId: user?.uid
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Error initiating checkout:", err);
      // You might want to show a toast notification here
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-gray-600">Logged in as: {user?.email}</p>
        <div className="flex items-center gap-2">
          <span className="text-gray-800">Current Plan:</span>
          <span className="font-semibold text-primary">{currentTier.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([tierId, plan]) => (
          <Card key={tierId} className={`${tier === tierId ? 'border-primary' : ''}`}>
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
                    variant={tier === tierId ? "default" : "outline"}
                    onClick={() => handleSubscribe(tierId, 'monthly')}
                    disabled={loadingId === `${tierId}-monthly`}
                  >
                    {loadingId === `${tierId}-monthly` ? "Loading..." : `$${plan.price.monthly}/month`}
                  </Button>
                  <Button 
                    className="w-full"
                    variant={tier === tierId ? "default" : "outline"}
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