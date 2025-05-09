import { compareTwoStrings } from 'string-similarity';

// Types
export interface ScrapedListing {
  title: string;
  price: number;
  shipping: number;
  date: string;
  url: string;
  imageUrl: string;
  [key: string]: any;
}

export interface TargetCard {
  playerName: string;
  year: string;
  cardSet: string;
  variation?: string;
  grade?: string;
  rawOrGraded?: string;
}

export interface GroupedListing extends ScrapedListing {
  grade?: string;
  variation?: string;
  totalPrice?: number;
}

/**
 * Normalize text by removing special characters and converting to lowercase
 */
export function normalizeText(text: string): string {
  return text.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
}

/**
 * Check if a listing matches the target card based on fuzzy matching
 */
export function isMatch(listing: ScrapedListing, target: TargetCard): boolean {
  const title = normalizeText(listing.title || '');
  
  // Create a string of all target keywords
  const targetKeywords = [
    target.playerName,
    target.year,
    target.cardSet,
    target.variation || '',
    target.grade || ''
  ].filter(Boolean); // Filter out empty strings
  
  const keywordString = normalizeText(targetKeywords.join(' '));
  
  // Score the match using string similarity (0 to 1 where 1 is perfect match)
  const score = compareTwoStrings(title, keywordString);
  
  // Convert to percentage score and require 85% match (same as Python version)
  return score * 100 >= 85;
}

/**
 * Group sales by variation, filtering listings that match the target card
 */
export function groupVariationSales(
  scrapedListings: ScrapedListing[], 
  target: TargetCard
): GroupedListing[] {
  const grouped: GroupedListing[] = [];
  
  for (const listing of scrapedListings) {
    if (isMatch(listing, target)) {
      grouped.push({
        ...listing,
        grade: target.grade,
        variation: target.variation,
        // Calculate total price including shipping
        totalPrice: (listing.price || 0) + (listing.shipping || 0)
      });
    }
  }
  
  // Sort by date, newest first
  return grouped.sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Calculate market metrics based on grouped listings
 */
export function calculateMarketMetrics(listings: GroupedListing[]) {
  // Ensure we have valid listings with prices
  const validListings = listings.filter(l => {
    const price = l.totalPrice || l.price || 0;
    return price > 0;
  });
  
  if (!validListings.length) {
    return {
      volatility: 0,
      trend: 50,
      demand: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceRange: 0,
      salesCount: 0,
      recentTrend: 0
    };
  }
  
  // Extract prices, ensuring they are valid numbers
  const prices = validListings.map(l => {
    const price = l.totalPrice || l.price || 0;
    return isNaN(price) ? 0 : price;
  }).filter(p => p > 0); // Extra filter to ensure no zeros slip through
  
  if (!prices.length) {
    return {
      volatility: 0,
      trend: 50,
      demand: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceRange: 0,
      salesCount: 0,
      recentTrend: 0
    };
  }
  
  // Basic statistics
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Calculate volatility (as coefficient of variation)
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(variance);
  const volatility = standardDeviation > 0 ? (standardDeviation / Math.max(0.01, averagePrice)) * 100 : 0;
  
  // Scale volatility to 0-100 range
  const scaledVolatility = Math.min(100, Math.max(0, volatility / 0.5)); // 50% variation = 100 volatility
  
  // Calculate trend (direction of price movement)
  let trend = 50; // Neutral start
  let recentTrend = 0;
  
  try {
    if (validListings.length >= 3) {
      // Make sure listings are sorted by date, newest first
      const sortedListings = [...validListings].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Split listings into "recent" and "older" halves
      const midpoint = Math.floor(sortedListings.length / 2);
      const recentListings = sortedListings.slice(0, midpoint);
      const olderListings = sortedListings.slice(midpoint);
      
      // Calculate averages, avoiding division by zero
      const recentAvg = recentListings.length > 0 
        ? recentListings.reduce((sum, l) => sum + (l.totalPrice || l.price || 0), 0) / recentListings.length
        : 0;
        
      const olderAvg = olderListings.length > 0
        ? olderListings.reduce((sum, l) => sum + (l.totalPrice || l.price || 0), 0) / olderListings.length
        : 0;
      
      // Calculate percent change, avoiding division by zero
      if (olderAvg > 0) {
        const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        // Scale to 0-100 range centered at 50
        trend = Math.min(100, Math.max(0, 50 + percentChange * 2)); // Each percent moves trend score by 2 points
      }
      
      // Calculate recent trend over the last 3 sales
      const recent3 = sortedListings.slice(0, 3);
      if (recent3.length === 3) {
        const newest = recent3[0].totalPrice || recent3[0].price || 0;
        const oldest = recent3[2].totalPrice || recent3[2].price || 0;
        
        // Avoid division by zero
        if (oldest > 0) {
          recentTrend = ((newest - oldest) / oldest) * 100;
        }
      }
    }
  } catch (error) {
    console.error("Error calculating trend:", error);
    // Fallback to neutral trend
    trend = 50;
    recentTrend = 0;
  }
  
  return {
    volatility: Math.round(scaledVolatility),
    trend: Math.round(trend),
    demand: calculateDemand(validListings),
    averagePrice,
    minPrice,
    maxPrice,
    priceRange,
    salesCount: validListings.length,
    recentTrend
  };
}

/**
 * Calculate demand score based on frequency of sales
 */
function calculateDemand(listings: GroupedListing[]): number {
  if (listings.length < 2) return 0;
  
  try {
    // Get unique dates to see how many different days have sales
    const dates = listings.map(l => l.date?.split('T')[0] || '').filter(Boolean);
    if (dates.length < 2) return 0;
    
    const uniqueDates = new Set(dates);
    
    // Get date range in days
    const dateObjects = dates.map(d => new Date(d))
      .filter(d => !isNaN(d.getTime())) // Filter out invalid dates
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dateObjects.length < 2) return 0;
    
    const oldestDate = dateObjects[0];
    const newestDate = dateObjects[dateObjects.length - 1];
    
    const dayRange = Math.max(1, Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate daily sales rate
    const salesPerDay = listings.length / dayRange;
    
    // Scale to 0-100 range
    return Math.min(100, Math.round(salesPerDay * 25 * 100)); // Scoring factor: 0.25 sales/day = 100 demand
  } catch (error) {
    console.error("Error calculating demand:", error);
    return 0;
  }
}

/**
 * Predict future prices based on trend data
 */
export function predictFuturePrices(listings: GroupedListing[], currentPrice: number, isRawCard: boolean = false) {
  // Ensure we have a valid current price
  if (!currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
    return {
      days30: 0,
      days60: 0,
      days90: 0
    };
  }
  
  try {
    // For raw cards - use a much more conservative approach
    if (isRawCard) {
      // For raw cards with limited data, use a very modest growth model
      const growthRate = 0.0025; // 0.25% growth per month for raw cards (very conservative)
      
      return {
        days30: currentPrice * (1 + growthRate),
        days60: currentPrice * (1 + growthRate * 1.8), // Slightly diminishing returns
        days90: currentPrice * (1 + growthRate * 2.4)  // Slightly diminishing returns
      };
    }
    
    // Default to slight increase if no data
    if (!listings || listings.length < 3) {
      // More conservative growth with limited data
      const growthRate = 0.01; // 1% growth per month
      return {
        days30: currentPrice * (1 + growthRate),
        days60: currentPrice * (1 + growthRate * 2),
        days90: currentPrice * (1 + growthRate * 3)
      };
    }
    
    // Calculate the trend from historical data
    // Extract and sort price data points by date
    const priceData: { date: Date, price: number }[] = [];
    
    // Process listings to extract date and price
    listings.forEach(listing => {
      // Make sure we have valid dates and prices
      if (!listing.dateSold && !listing.date) return;
      if (!listing.price && !listing.totalPrice) return;
      
      // Get date
      let dateStr = listing.dateSold || listing.date || '';
      if (!dateStr) return;
      
      // Ensure date is a string we can parse
      if (typeof dateStr !== 'string') {
        try {
          dateStr = dateStr.toString();
        } catch (e) {
          return; // Skip if we can't convert to string
        }
      }
      
      // Try to parse date
      let dateObj: Date;
      try {
        dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return; // Skip invalid dates
      } catch (e) {
        return; // Skip unparseable dates
      }
      
      // Get price - prefer totalPrice if available
      const price = listing.totalPrice || listing.price;
      if (!price || price <= 0) return;
      
      // Add to our dataset
      priceData.push({
        date: dateObj,
        price: price
      });
    });
    
    // Sort by date ascending
    priceData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // If we have less than 3 valid data points, use default growth
    if (priceData.length < 3) {
      const growthRate = isRawCard ? 0.0025 : 0.01;
      return {
        days30: currentPrice * (1 + growthRate),
        days60: currentPrice * (1 + growthRate * 2),
        days90: currentPrice * (1 + growthRate * 3)
      };
    }
    
    // Calculate linear regression to find trend
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    const baseDate = priceData[0].date.getTime();
    
    priceData.forEach(point => {
      // X is days since first date
      const x = (point.date.getTime() - baseDate) / (1000 * 60 * 60 * 24);
      const y = point.price;
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    const n = priceData.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate predicted future prices
    // For raw cards, dampen the slope (more conservative)
    const adjustedSlope = isRawCard ? slope * 0.3 : slope;
    
    // Predict prices at different points
    const days30Price = intercept + adjustedSlope * (30);
    const days60Price = intercept + adjustedSlope * (60);
    const days90Price = intercept + adjustedSlope * (90);
    
    // Ensure predictions are not too extreme
    let maxIncreasePercent = isRawCard ? 1.1 : 1.3; // 10% for raw, 30% for graded max increase
    let minDecreasePercent = isRawCard ? 0.95 : 0.8; // 5% for raw, 20% for graded max decrease
    
    return {
      days30: Math.max(currentPrice * minDecreasePercent, Math.min(currentPrice * maxIncreasePercent, days30Price)),
      days60: Math.max(currentPrice * (minDecreasePercent * 0.98), Math.min(currentPrice * maxIncreasePercent * 1.05, days60Price)),
      days90: Math.max(currentPrice * (minDecreasePercent * 0.95), Math.min(currentPrice * maxIncreasePercent * 1.1, days90Price))
    };
  } catch (error) {
    // Fallback to very modest growth if anything fails
    console.error("Error predicting prices:", error);
    const growthRate = isRawCard ? 0.002 : 0.005;
    return {
      days30: currentPrice * (1 + growthRate),
      days60: currentPrice * (1 + growthRate * 1.5),
      days90: currentPrice * (1 + growthRate * 2)
    };
  }
}

/**
 * Generate investment recommendation based on metrics
 */
export function generateRecommendation(metrics: ReturnType<typeof calculateMarketMetrics>, roi: number) {
  const { trend, volatility, demand } = metrics;
  
  if (trend > 70 && roi > 20) {
    return { action: "BUY", reason: "Strong upward trend and good ROI potential" };
  } else if (trend > 60 && demand > 70) {
    return { action: "BUY", reason: "Positive trend with high market demand" };
  } else if (trend < 40 && roi < 0) {
    return { action: "SELL", reason: "Downward trend and current loss" };
  } else if (trend < 45 && volatility > 70) {
    return { action: "SELL", reason: "Declining price with high volatility" };
  } else if (demand > 70 && volatility < 40) {
    return { action: "HOLD", reason: "Stable prices with high demand" };
  } else if (trend > 45 && trend < 55) {
    return { action: "HOLD", reason: "Stable market conditions" };
  } else {
    return { action: "WATCH", reason: "Unclear market direction" };
  }
} 