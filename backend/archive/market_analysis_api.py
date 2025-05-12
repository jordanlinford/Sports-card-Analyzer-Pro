from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from firebase_admin import auth
from typing import Optional
from datetime import datetime
from .analyzers.market_analyzer import MarketAnalyzer
from .scrapers.ebay_scraper import EbayScraper

router = APIRouter()
analyzer = MarketAnalyzer()
scraper = EbayScraper()

class AnalyzeMarketRequest(BaseModel):
    playerName: str
    year: Optional[str] = None
    cardSet: Optional[str] = None
    variation: Optional[str] = None
    cardNumber: Optional[str] = None
    condition: str  # e.g. "raw", "PSA 9", etc.

async def verify_token(request: Request):
    """Verify Firebase authentication token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")

@router.post("/analyze-market")
async def analyze_market(data: AnalyzeMarketRequest, user=Depends(verify_token)):
    """
    Analyze the market for a specific card.
    
    Args:
        data: Market analysis request parameters
        user: Authenticated user (from Firebase token)
    
    Returns:
        Market analysis results including trend, volatility, liquidity, and investment rating
    """
    try:
        # Search for card sales data
        results = await scraper.search_cards(
            player_name=data.playerName,
            year=data.year,
            card_set=data.cardSet,
            variation=data.variation,
            card_number=data.cardNumber,
            condition=data.condition
        )

        if not results:
            raise HTTPException(
                status_code=404,
                detail="No market data found for the specified card"
            )

        # Analyze the market data
        analysis = analyzer.analyze(results)

        return {
            **analysis,
            "last_updated": datetime.now()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during market analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to perform market analysis"
        ) 