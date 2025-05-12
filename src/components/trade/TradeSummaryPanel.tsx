import { TradeResult } from "@/lib/trade/TradeAnalyzer";
import { ArrowRight, TrendingUp, AlertTriangle, Check, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface Props {
  result: TradeResult;
  sideALabel?: string;
  sideBLabel?: string;
}

export function TradeSummaryPanel({ result, sideALabel = "You Give", sideBLabel = "You Receive" }: Props) {
  const { 
    valueSideA, 
    valueSideB, 
    difference, 
    percentageDifference, 
    recommendation, 
    riskLevel,
    potentialGrowth 
  } = result;
  
  // Determine color for recommendation
  const getRecommendationColor = () => {
    switch (recommendation) {
      case "Accept": return "text-green-600";
      case "Decline": return "text-red-600";
      default: return "text-blue-600";
    }
  };
  
  // Determine icon for recommendation
  const getRecommendationIcon = () => {
    switch (recommendation) {
      case "Accept": return <Check className="h-5 w-5 text-green-600" />;
      case "Decline": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <ArrowRight className="h-5 w-5 text-blue-600" />;
    }
  };
  
  // Format percentage with sign
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Calculate growth opportunity
  const netGrowthA = potentialGrowth.sideA - valueSideA;
  const netGrowthB = potentialGrowth.sideB - valueSideB;
  const growthComparison = netGrowthB - netGrowthA;
  
  const comparisonData = [
    {
      name: "Current Value",
      sideA: valueSideA,
      sideB: valueSideB
    },
    {
      name: "Potential Value",
      sideA: potentialGrowth.sideA + valueSideA,
      sideB: potentialGrowth.sideB + valueSideB
    },
    {
      name: "Net Growth",
      sideA: potentialGrowth.sideA,
      sideB: potentialGrowth.sideB
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Trade Analysis</h3>
      
      {/* Value comparison */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">{sideALabel}</div>
          <div className="text-lg font-semibold">${valueSideA.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Potential Growth: +${potentialGrowth.sideA.toFixed(2)}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-gray-400" />
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">{sideBLabel}</div>
          <div className="text-lg font-semibold">${valueSideB.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Potential Growth: +${potentialGrowth.sideB.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Value difference */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Value Difference</span>
          <span className={`font-medium ${difference < 0 ? 'text-green-600' : difference > 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {difference < 0 ? '+' : ''}{Math.abs(difference).toFixed(2)} 
            ({formatPercentage(Math.abs(percentageDifference))})
          </span>
        </div>
        
        <div className="relative h-2 bg-gray-200 rounded overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${difference < 0 ? 'bg-green-500' : 'bg-red-500'}`} 
            style={{ 
              width: `${Math.min(Math.abs(percentageDifference) * 2, 100)}%`,
              left: difference < 0 ? '50%' : `${50 - Math.min(Math.abs(percentageDifference) * 2, 100)}%`
            }}
          />
          <div className="absolute top-0 left-50% w-0.5 h-full bg-gray-400" style={{ left: '50%' }}></div>
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Favor {sideBLabel}</span>
          <span>Equal</span>
          <span>Favor {sideALabel}</span>
        </div>
      </div>

      {/* Market trend comparison chart */}
      <div className="mb-6">
        <h4 className="font-medium text-sm mb-3 flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          Market Value Comparison
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
              />
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="sideA" name={sideALabel} fill="#93c5fd" />
              <Bar dataKey="sideB" name={sideBLabel} fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-600">
            Growth Difference:
          </div>
          <div className="flex items-center">
            {growthComparison > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`font-medium ${growthComparison > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthComparison > 0 ? '+' : ''}{growthComparison.toFixed(2)}
              {growthComparison !== 0 && ` in favor of ${growthComparison > 0 ? sideBLabel : sideALabel}`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Summary and recommendation */}
      <div className="flex items-start gap-4">
        <div className="bg-gray-50 rounded-lg p-4 flex-1">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trade Summary
          </h4>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span>Risk Level:</span>
              <span className={
                riskLevel === "High" ? "text-red-600" : 
                riskLevel === "Medium" ? "text-amber-600" : 
                "text-green-600"
              }>
                {riskLevel}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Value Difference:</span>
              <span>${Math.abs(difference).toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Percentage Difference:</span>
              <span>{formatPercentage(Math.abs(percentageDifference))}</span>
            </li>
            <li className="flex justify-between">
              <span>Growth Potential (Side A):</span>
              <span>+${potentialGrowth.sideA.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>Growth Potential (Side B):</span>
              <span>+${potentialGrowth.sideB.toFixed(2)}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 flex-1">
          <h4 className="font-medium mb-2">Verdict</h4>
          <div className="flex items-center gap-2 mb-2">
            {getRecommendationIcon()}
            <span className={`font-bold text-lg ${getRecommendationColor()}`}>
              {recommendation}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {recommendation === "Accept" && 
              `This trade appears favorable. You're receiving greater value than you're giving.`}
            {recommendation === "Decline" && 
              `This trade appears unfavorable. You're giving up more value than you're receiving.`}
            {recommendation === "Fair Trade" && 
              `This trade is relatively even in value. Consider long-term potential before deciding.`}
          </p>
        </div>
      </div>
    </div>
  );
} 