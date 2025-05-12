from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MarketAnalyzeRequest(BaseModel):
    playerName: str

@router.post("/analyze-market")
async def analyze_market(request: MarketAnalyzeRequest):
    return {
        "playerName": request.playerName,
        "trendScore": 87.3,
        "volatility": 22.1,
        "projectedValue": 145.5,
        "insight": f"{request.playerName} cards are showing strong upward trends in the last 30 days."
    } 