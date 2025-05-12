import React from "react";
import { useCards } from "@/hooks/useCards";

export default function DashboardWidgets() {
  const { data: cards = [] } = useCards();

  // Calculations
  const totalCards = cards.length;
  const totalValue = cards.reduce((sum, card) => sum + (card.currentValue || 0), 0);
  const totalCost = cards.reduce((sum, card) => sum + (card.pricePaid || 0), 0);
  const averagePricePaid = totalCost / (totalCards || 1);
  const totalProfit = totalValue - totalCost;
  const roiPercentage = totalCost ? ((totalProfit / totalCost) * 100) : 0;

  // Most Valuable Card
  const mostValuableCard = cards.reduce((max, card) => 
    (card.currentValue || 0) > (max.currentValue || 0) ? card : max
  , cards[0] || { playerName: "N/A", currentValue: 0 });

  // Most Common Grade
  const gradeCount: Record<string, number> = {};
  cards.forEach((card) => {
    const grade = card.condition || "Raw";
    gradeCount[grade] = (gradeCount[grade] || 0) + 1;
  });
  const mostCommonGrade = Object.entries(gradeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <WidgetCard 
        label="Total Collection Value" 
        value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sublabel="Current Value"
      />
      <WidgetCard 
        label="Total Cards Owned" 
        value={totalCards}
        sublabel="Cards"
      />
      <WidgetCard 
        label="Average Price Paid" 
        value={`$${averagePricePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sublabel="Per Card"
      />
      <WidgetCard 
        label="Total ROI %" 
        value={`${roiPercentage.toFixed(1)}%`}
        sublabel="Return on Investment"
        valueColor={roiPercentage >= 0 ? "text-green-600" : "text-red-600"}
      />
      <WidgetCard 
        label="Most Valuable Card" 
        value={mostValuableCard.playerName}
        sublabel={`$${mostValuableCard.currentValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <WidgetCard 
        label="Most Common Grade" 
        value={mostCommonGrade}
        sublabel=""
      />
    </div>
  );
}

function WidgetCard({ label, value, sublabel, valueColor = "text-gray-900" }: {
  label: string;
  value: string | number;
  sublabel?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200 flex flex-col justify-between h-full">
      <div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      </div>
      {sublabel && <div className="text-xs text-gray-400 mt-2">{sublabel}</div>}
    </div>
  );
} 