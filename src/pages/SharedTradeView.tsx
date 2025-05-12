import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/types/Card';
import { TradeSummaryPanel } from '@/components/trade/TradeSummaryPanel';
import { TradeCardGrid } from '@/components/trade/TradeCardGrid';
import { TradeResult } from '@/lib/trade/TradeAnalyzer';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SharedTradeData {
  date: string;
  cardsA: Partial<Card>[];
  cardsB: Partial<Card>[];
  result: TradeResult;
}

export default function SharedTradeView() {
  const { tradeData } = useParams<{ tradeData: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeInfo, setTradeInfo] = useState<SharedTradeData | null>(null);

  useEffect(() => {
    if (!tradeData) {
      setError('Invalid trade data');
      setLoading(false);
      return;
    }

    try {
      // Decode base64 data
      const jsonString = decodeURIComponent(atob(tradeData));
      const parsedData = JSON.parse(jsonString) as SharedTradeData;
      
      // Convert partial cards to full Card objects
      const processedData: SharedTradeData = {
        ...parsedData,
        cardsA: parsedData.cardsA.map(card => ({
          ...card,
          id: card.id || `shared-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: card.createdAt || new Date().toISOString(),
          updatedAt: card.updatedAt || new Date().toISOString(),
          ownerId: card.ownerId || 'shared',
          tags: card.tags || [],
        })) as Card[],
        cardsB: parsedData.cardsB.map(card => ({
          ...card,
          id: card.id || `shared-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: card.createdAt || new Date().toISOString(),
          updatedAt: card.updatedAt || new Date().toISOString(),
          ownerId: card.ownerId || 'shared',
          tags: card.tags || [],
        })) as Card[],
      };
      
      setTradeInfo(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing trade data:', err);
      setError('Unable to load trade data. The shared link may be invalid or corrupted.');
      setLoading(false);
    }
  }, [tradeData]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-3" />
          <span className="text-lg">Loading shared trade...</span>
        </div>
      </div>
    );
  }

  if (error || !tradeInfo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Trade</h3>
            <p className="text-red-700 mt-1">{error || 'Unknown error occurred'}</p>
            <Link to="/trade-analyzer">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Trade Analyzer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { result, cardsA, cardsB, date } = tradeInfo;
  const formattedDate = new Date(date).toLocaleDateString();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shared Trade Analysis</h1>
          <p className="text-gray-600">
            Shared on {formattedDate}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/trade-analyzer">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Trade Analyzer
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mb-8">
        <TradeSummaryPanel result={result} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cardsA.length > 0 && (
          <div>
            <TradeCardGrid 
              cards={cardsA as Card[]} 
              title="Side A Cards"
            />
          </div>
        )}
        {cardsB.length > 0 && (
          <div>
            <TradeCardGrid 
              cards={cardsB as Card[]} 
              title="Side B Cards"
            />
          </div>
        )}
      </div>
    </div>
  );
} 