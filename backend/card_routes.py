from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from utils.auth import verify_token

router = APIRouter()

# Example model for a card
class Card(BaseModel):
    player: str
    year: int
    team: str | None = None

# Protected route to add a card
@router.post("/cards")
async def add_card(card: Card, user=Depends(verify_token)):
    # 'user' is the authenticated Firebase user
    return {
        "message": f"Card added for {card.player}",
        "user_id": user["uid"],
        "card": card
    }

# You can add more routes here, and apply 'Depends(verify_token)' to any that need protection 