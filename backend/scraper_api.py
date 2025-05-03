from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ebay_scraper import EbayScraper

app = FastAPI()
scraper = EbayScraper()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class CardRequest(BaseModel):
    playerName: str
    year: str | None = None
    cardSet: str | None = None
    variation: str | None = None
    cardNumber: str | None = None
    condition: str

@app.post("/fetch-price")
async def fetch_price(card: CardRequest):
    try:
        results = scraper.search_cards(
            player_name=card.playerName,
            year=card.year,
            card_set=card.cardSet,
            variation=card.variation,
            card_number=card.cardNumber,
            scenario=card.condition
        )
        
        if not results:
            return { "price": None }
            
        # Calculate average price from the results
        prices = [r['price'] for r in results if r.get('price')]
        if not prices:
            return { "price": None }
            
        average_price = sum(prices) / len(prices)
        return { "price": round(average_price, 2) }
        
    except Exception as e:
        print(f"Error fetching price: {str(e)}")
        return { "price": None }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
