import { Card } from '../types/Card';

interface FetchPriceResponse {
  averagePrice: number;
  searchResults: Array<{
    title: string;
    price: number;
    url: string;
  }>;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchPrice(cardData: Card): Promise<FetchPriceResponse> {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new APIError("Authentication token not found", 401);
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/fetch-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(cardData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.detail || "Failed to fetch price",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      "Network error occurred while fetching price",
      500,
      error
    );
  }
} 