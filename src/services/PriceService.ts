interface CardRequest {
  playerName: string;
  year?: string;
  cardSet?: string;
  variation?: string;
  cardNumber?: string;
  condition: string;
}

interface PriceResponse {
  price: number | null;
}

export class PriceService {
  private static readonly API_URL = 'http://localhost:8000';

  static async fetchPrice(card: CardRequest): Promise<PriceResponse> {
    try {
      const response = await fetch(`${this.API_URL}/fetch-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching price:', error);
      return { price: null };
    }
  }
} 