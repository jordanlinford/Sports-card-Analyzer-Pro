# Sports Card Analyzer Pro

A comprehensive web application for sports card collectors to analyze, track, and manage their collections.

## Features

- **Collection Management**: Track cards with detailed information (player, team, year, condition, etc.)
- **Display Cases**: Create virtual display cases to showcase your collection
- **Market Analysis**: Analyze market value with real-time eBay data
- **Trade Analyzer**: Compare the value of potential trades
- **Mobile Responsive**: Fully optimized for mobile devices
- **PWA Support**: Install as a standalone app on mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Vercel

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Vercel account (for deployment)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_SERVER_URL=http://localhost:3001
```

Create a `.env` file in the `server` directory with:

```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key_with_newlines"
```

### Firebase Admin SDK

For the backend, you need a service account key:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the file as `firebase-adminsdk.json` in the root directory

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running Locally

```bash
# Start the backend server
cd server
npm run dev

# In a separate terminal, start the frontend
npm run dev
```

## eBay Scraper

The Market Analyzer feature uses direct web scraping from eBay to provide real-time market data for sports cards.

1. Make sure the server is running
2. Go to the Market Analyzer page in the application
3. Fill in the card details
4. Click "Analyze Market" to scrape eBay for actual listings

The scraper will:
- Search for completed listings on eBay matching your criteria
- Calculate market metrics (average price, high, low)
- Generate a visual price distribution
- Provide investment insights

### Scraper API Endpoint

The eBay scraper provides a RESTful API endpoint that can be used to fetch sold listings:

```
POST /api/scrape
```

Request payload:
```json
{
  "playerName": "CeeDee Lamb",
  "year": "2020",
  "cardSet": "Mosaic",
  "cardNumber": "268",
  "variation": "No Huddle",
  "condition": "PSA 10"
}
```

Response:
```json
{
  "listings": [
    {
      "title": "2020 Mosaic CeeDee Lamb No Huddle Prizm #268 PSA 10",
      "price": 69.99,
      "shipping": 4.99,
      "totalPrice": 74.98,
      "dateSold": "2024-05-10",
      "url": "https://www.ebay.com/itm/...",
      "imageUrl": "https://i.ebayimg.com/...",
      "source": "eBay"
    },
    ...
  ],
  "count": 150,
  "query": "https://www.ebay.com/sch/i.html?_nkw=..."
}
```

Note: Please use the scraper responsibly and in accordance with eBay's terms of service.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel project settings
4. Deploy!

## Mobile Optimization

The app is fully optimized for mobile devices with:
- Responsive layouts
- Touch-optimized controls
- Hamburger menu navigation
- Optimized images
- PWA capabilities

## License

MIT

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for frontend tooling
- [Firebase](https://firebase.google.com/) for backend services 