from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Sports Card Market Analysis API")

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MarketAnalyzeRequest(BaseModel):
    playerName: str

@app.post("/analyze-market")
async def analyze_market(request: MarketAnalyzeRequest):
    return {
        "playerName": request.playerName,
        "trendScore": 87.3,
        "volatility": 22.1,
        "projectedValue": 145.5,
        "insight": f"{request.playerName} cards are showing strong upward trends in the last 30 days."
    }

@app.get("/")
async def root():
    return {"message": "Sports Card Market Analysis API"} 