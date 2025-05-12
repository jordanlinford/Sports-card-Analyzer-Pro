import { useState } from "react";
import { analyzeMarket } from "@/lib/firebase/market-analyzer";
import { MarketAnalysisResponse } from "@/types/market";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function MarketAnalysis() {
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMarket({ 
        playerName: playerName.trim(),
        condition: "raw" // Default to raw condition
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze market");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Market Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze market trends and get investment recommendations for sports cards
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="playerName" className="text-sm font-medium">
            Player Name
          </label>
          <Input
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Market"
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Trend</h3>
                <p className="text-2xl font-bold">{result.trend}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Investment Rating</h3>
                <p className="text-2xl font-bold">{result.investment_rating}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Volatility</h3>
                <p className="text-2xl font-bold">
                  {result.volatility !== null ? result.volatility.toFixed(2) : "N/A"}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Liquidity</h3>
                <p className="text-2xl font-bold">
                  {result.liquidity !== null ? result.liquidity.toFixed(2) : "N/A"}
                </p>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(result.last_updated).toLocaleString()}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
} 