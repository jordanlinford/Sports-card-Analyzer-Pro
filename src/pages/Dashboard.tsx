import React from "react";
import { useCards } from "@/hooks/useCards";
import { Card as CardType } from "@/types/Card";
import { MessageCenter } from "@/components/MessageCenter";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: cards = [], isLoading, error, retryFetchCards } = useCards();
  
  console.log("Dashboard rendering with cards:", cards.length, "isLoading:", isLoading, "error:", !!error);

  // Basic Stats - handle undefined values correctly
  const totalCards = cards.length;
  const totalValue = cards.reduce((sum, card) => {
    const value = card.currentValue || card.price || 0;
    return sum + value;
  }, 0);
  
  const totalCost = cards.reduce((sum, card) => {
    return sum + (card.pricePaid || 0);
  }, 0);
  
  const totalProfit = totalValue - totalCost;
  const averagePricePaid = totalCards ? (totalCost / totalCards) : 0;
  const roiPercentage = totalCost ? ((totalProfit / totalCost) * 100) : 0;

  // Player Stats
  const playerCount: Record<string, number> = {};
  cards.forEach((card) => {
    const player = card.playerName || "Unknown";
    playerCount[player] = (playerCount[player] || 0) + 1;
  });
  const topPlayer = Object.entries(playerCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Grade Distribution
  const gradeCount: Record<string, number> = {};
  cards.forEach((card) => {
    const grade = card.condition || "Raw";
    gradeCount[grade] = (gradeCount[grade] || 0) + 1;
  });
  const mostCommonGrade = Object.entries(gradeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Most Valuable Card
  const mostValuableCard = cards.reduce((max, card) => {
    const currentCardValue = card.currentValue || card.price || 0;
    const maxCardValue = max.currentValue || max.price || 0;
    return currentCardValue > maxCardValue ? card : max;
  }, { playerName: "N/A", currentValue: 0, price: 0 } as CardType);

  const mostValuableCardValue = mostValuableCard.currentValue || mostValuableCard.price || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Collection Dashboard</h1>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <span className="text-blue-500">Loading collection data...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600 mb-2">There was a problem loading your collection data.</p>
          <Button 
            variant="outline" 
            onClick={retryFetchCards}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Cards" 
          value={isLoading ? "Loading..." : totalCards}
          icon="🎴"
          isLoading={isLoading}
          hasError={!!error && !isLoading}
        />
        <DashboardCard 
          title="Total Value" 
          value={isLoading ? "Loading..." : `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
          isLoading={isLoading}
          hasError={!!error && !isLoading}
        />
        <DashboardCard 
          title="Average Price" 
          value={isLoading ? "Loading..." : `$${averagePricePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="📊"
          isLoading={isLoading}
          hasError={!!error && !isLoading}
        />
        <DashboardCard 
          title="ROI" 
          value={isLoading ? "Loading..." : `${roiPercentage.toFixed(1)}%`}
          icon="📈"
          valueColor={roiPercentage >= 0 ? "text-green-600" : "text-red-600"}
          isLoading={isLoading}
          hasError={!!error && !isLoading}
        />
      </div>

      {/* Message Center */}
      <div className="mb-8">
        <MessageCenter />
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Collection Insights</h2>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="flex justify-center py-4 text-red-500">
                Unable to load insights
              </div>
            ) : (
              <>
            <InsightRow 
              label="Most Valuable Card"
              value={`${mostValuableCard.playerName} - $${mostValuableCardValue.toLocaleString()}`}
            />
            <InsightRow 
              label="Most Common Grade"
              value={mostCommonGrade}
            />
            <InsightRow 
              label="Top Player"
              value={topPlayer}
            />
            <InsightRow 
              label="Total Profit/Loss"
              value={`$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              valueColor={totalProfit >= 0 ? "text-green-600" : "text-red-600"}
            />
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex justify-center py-4 text-red-500">
              Unable to load grade distribution
            </div>
          ) : totalCards > 0 ? (
            <div className="space-y-4">
              {Object.entries(gradeCount).map(([grade, count]) => (
                <div key={grade} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{grade}</div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / totalCards) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">{count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No cards to display</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  value, 
  icon,
  valueColor = "text-gray-900",
  isLoading = false,
  hasError = false
}: { 
  title: string; 
  value: string | number;
  icon?: string;
  valueColor?: string;
  isLoading?: boolean;
  hasError?: boolean;
}) {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">{title}</h2>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      {isLoading ? (
        <div className="mt-2 flex items-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-500">Loading...</span>
        </div>
      ) : hasError ? (
        <div className="mt-2 flex items-center">
          <span className="text-red-500">Error loading data</span>
        </div>
      ) : (
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
      )}
    </div>
  );
}

function InsightRow({ 
  label, 
  value,
  valueColor = "text-gray-900"
}: { 
  label: string; 
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
} 