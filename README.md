# Sports Card Analyzer

A web application for sports card collectors to track, organize, and analyze their collections.

![Sports Card Analyzer](public/chart-logo-new.png)

## Features

- **Card Collection Management**: Add, edit, and organize your sports cards
- **Display Cases**: Create virtual display cases to showcase your collection
- **Market Analysis**: Track and analyze card values over time
- **Trade Analyzer**: Evaluate potential trades with other collectors
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## Technology Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Vercel

## Upcoming Features

- Pokémon TCG support
- Image search capability
- Card grading tools
- Progressive Web App (PWA) features
- Advanced market analytics

## Local Development

### Prerequisites

- Node.js 16+ and npm
- Firebase account and project

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/sports-card-analyzer.git
   cd sports-card-analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   cd server && npm install
   ```

3. Create a `.env` file in the root directory with your Firebase credentials
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start the development server
   ```bash
   # Start the frontend
   npm run dev
   
   # In another terminal, start the backend
   cd server && npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Deployment

This application is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## License

MIT 