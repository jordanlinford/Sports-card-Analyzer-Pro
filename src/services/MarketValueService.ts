interface CardRequest {
  playerName: string;
  year?: string;
  cardSet?: string;
  variation?: string;
  cardNumber?: string;
  condition: string;
}

export class MarketValueService {
  private static readonly API_URL = 'http://localhost:8000';

  static async fetchCardMarketValue(card: CardRequest): Promise<number | null> {
    try {
      const response = await fetch(`${this.API_URL}/fetch-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market value');
      }

      const data = await response.json();
      return data.price || null;
    } catch (error) {
      console.error('Error fetching market value:', error);
      return null;
    }
  }
} 