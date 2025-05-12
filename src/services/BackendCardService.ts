import { getAuth } from "firebase/auth";

export interface Card {
  playerName: string;
  year: string;
  brand: string;
  cardNumber: string;
  grade?: string;
  currentValue?: number;
  lastUpdated?: string;
  priceSource?: string;
  imageUrl?: string;
}

export class BackendCardService {
  private static readonly API_BASE_URL = "http://localhost:8000";

  private static async getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Not authenticated");
    }

    const token = await user.getIdToken();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }

  static async addCard(cardData: Card) {
    const response = await fetch(`${this.API_BASE_URL}/cards`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error("Failed to add card");
    }

    return response.json();
  }

  static async getCards() {
    const response = await fetch(`${this.API_BASE_URL}/cards`, {
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cards");
    }

    return response.json();
  }

  static async updateCard(cardId: string, cardData: Partial<Card>) {
    const response = await fetch(`${this.API_BASE_URL}/cards/${cardId}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error("Failed to update card");
    }

    return response.json();
  }

  static async deleteCard(cardId: string) {
    const response = await fetch(`${this.API_BASE_URL}/cards/${cardId}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete card");
    }
  }
} 