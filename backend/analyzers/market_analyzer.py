from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np

class MarketAnalyzer:
    """Analyzes market data for sports cards to provide insights and metrics."""
    
    def __init__(self):
        """Initialize the MarketAnalyzer."""
        pass

    def analyze_card(
        self,
        player_name: str,
        year: Optional[str] = None,
        card_set: Optional[str] = None,
        variation: Optional[str] = None,
        card_number: Optional[str] = None,
        scenario: str = "raw"
    ) -> Dict[str, Any]:
        """
        Analyze a specific card's market data.
        
        Args:
            player_name: Name of the player
            year: Year of the card
            card_set: Card set name
            variation: Card variation
            card_number: Card number
            scenario: Condition/scenario (e.g., "raw", "PSA 9")
            
        Returns:
            Dictionary containing market analysis results
        """
        # This method would typically fetch data from a database or external API
        # For now, we'll use the analyze method with mock data
        mock_data = self._get_mock_data(
            player_name, year, card_set, variation, card_number, scenario
        )
        return self.analyze(mock_data)

    def analyze(self, sales_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze market data for a card.
        
        Args:
            sales_data: List of dictionaries containing sales data with 'price' and 'date' fields
            
        Returns:
            Dictionary containing analysis metrics:
            - trend: Overall price trend direction
            - volatility: Price volatility measure
            - liquidity: Market liquidity measure
            - investment_rating: Investment recommendation
        """
        if not sales_data:
            return {
                "trend": "Insufficient Data",
                "volatility": None,
                "liquidity": None,
                "investment_rating": "Unknown"
            }

        prices = []
        sale_dates = []

        for entry in sales_data:
            price = entry.get("price")
            date_str = entry.get("date")
            if price and date_str:
                try:
                    prices.append(price)
                    sale_dates.append(datetime.strptime(date_str, "%Y-%m-%d"))
                except ValueError:
                    continue

        if len(prices) < 3:
            return {
                "trend": "Insufficient Data",
                "volatility": None,
                "liquidity": None,
                "investment_rating": "Unknown"
            }

        # Sort sales by date
        combined = sorted(zip(sale_dates, prices), key=lambda x: x[0])
        dates_sorted, prices_sorted = zip(*combined)

        # Price trend (linear regression slope)
        days = np.array([(d - dates_sorted[0]).days for d in dates_sorted])
        slope = np.polyfit(days, prices_sorted, 1)[0]
        trend = (
            "Upward" if slope > 0.5 else
            "Downward" if slope < -0.5 else
            "Stable"
        )

        # Volatility (standard deviation / mean)
        volatility_score = round(float(np.std(prices_sorted) / np.mean(prices_sorted)), 2)

        # Liquidity (sales per day)
        total_days = max((dates_sorted[-1] - dates_sorted[0]).days, 1)
        liquidity_score = round(len(prices_sorted) / total_days, 2)

        # Investment Rating
        if trend == "Upward" and volatility_score < 0.3 and liquidity_score > 0.2:
            rating = "Strong Buy"
        elif trend == "Stable" and volatility_score < 0.5:
            rating = "Hold"
        elif trend == "Downward" and volatility_score > 0.4:
            rating = "Avoid"
        else:
            rating = "Speculative"

        return {
            "trend": trend,
            "volatility": volatility_score,
            "liquidity": liquidity_score,
            "investment_rating": rating
        }

    def _get_mock_data(
        self,
        player_name: str,
        year: Optional[str],
        card_set: Optional[str],
        variation: Optional[str],
        card_number: Optional[str],
        scenario: str
    ) -> List[Dict[str, Any]]:
        """
        Generate mock sales data for testing.
        In a real implementation, this would fetch data from a database or API.
        """
        # This is just example data - in production, you'd fetch real data
        return [
            {"date": "2024-01-01", "price": 100.0},
            {"date": "2024-01-15", "price": 110.0},
            {"date": "2024-02-01", "price": 105.0},
            {"date": "2024-02-15", "price": 115.0},
            {"date": "2024-03-01", "price": 120.0}
        ] 