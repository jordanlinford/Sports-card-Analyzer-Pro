import React from "react";
import { useCards } from "@/hooks/useCards";
import { Card as CardType } from "@/types/Card";
import { AuthDebugger } from "@/components/AuthDebugger";
import { FixUserDocument } from "@/components/FixUserDocument";

export default function Dashboard() {
  const { data: cards = [] } = useCards();
  
  console.log("Dashboard rendering with cards:", cards.length);

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
      
      {/* Auth Debugger - Add this near the top for easy access */}
      <div className="mb-6">
        <AuthDebugger />
        <FixUserDocument />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Cards" 
          value={totalCards}
          icon="🎴"
        />
        <DashboardCard 
          title="Total Value" 
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
        />
        <DashboardCard 
          title="Average Price" 
          value={`$${averagePricePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="📊"
        />
        <DashboardCard 
          title="ROI" 
          value={`${roiPercentage.toFixed(1)}%`}
          icon="📈"
          valueColor={roiPercentage >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Collection Insights</h2>
          <div className="space-y-4">
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
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
          {totalCards > 0 ? (
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
  valueColor = "text-gray-900"
}: { 
  title: string; 
  value: string | number;
  icon?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">{title}</h2>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
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