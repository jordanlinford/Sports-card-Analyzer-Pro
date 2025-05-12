# Sports Card Collection Manager

A full-stack application for managing sports card collections with automatic market value tracking.

## Features

- User authentication and authorization
- Card collection management (CRUD operations)
- Image upload and storage
- Automatic market value tracking using eBay data
- Responsive design with modern UI

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Firebase for authentication and storage
- React Query for data management

### Backend
- FastAPI (Python)
- BeautifulSoup for web scraping
- Pandas for data analysis
- Uvicorn for ASGI server

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Firebase account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sports-card-collection.git
cd sports-card-collection
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
- Create a `.env` file in the root directory
- Add your Firebase configuration
- Add any other necessary environment variables

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run start
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Using the eBay Scraper

The Market Analyzer feature uses direct web scraping from eBay to provide real-time market data for sports cards.

1. Start the scraper server:
```bash
npm run scraper
# or directly with
./server/start.sh
```

2. Go to the Market Analyzer page in the application
3. Fill in the card details and uncheck "Use Test Data"
4. Click "Analyze Market" to scrape eBay for actual listings

The scraper will:
- Search for completed listings on eBay matching your criteria
- Group similar listings using fuzzy matching
- Calculate market metrics (volatility, trend, demand)
- Generate price predictions based on historical data
- Provide investment recommendations

#### Scraper API Endpoint

The eBay scraper provides a RESTful API endpoint that can be used to fetch sold listings:

```
POST /api/scrape
```

Request payload:
```json
{
  "playerName": "Shohei Ohtani",
  "year": "2018",
  "cardSet": "Topps Chrome Update",
  "cardNumber": "HMT32",
  "variation": "Pink Refractor",
  "condition": "PSA 10",
  "grade": "PSA 10",
  "negKeywords": ["lot", "auto"]
}
```

Response:
```json
{
  "listings": [
    {
      "title": "2018 Topps Chrome Update Shohei Ohtani Pink Refractor PSA 10 HMT32",
      "price": 220.00,
      "shipping": 5.00,
      "totalPrice": 225.00,
      "dateSold": "2024-04-12",
      "date": "2024-04-12T14:30:00.000Z",
      "url": "https://www.ebay.com/itm/...",
      "imageUrl": "https://i.ebayimg.com/...",
      "source": "eBay"
    },
    ...
  ],
  "count": 15,
  "query": "https://www.ebay.com/sch/i.html?_nkw=..."
}
```

Note: Please use the scraper responsibly and in accordance with eBay's terms of service.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 