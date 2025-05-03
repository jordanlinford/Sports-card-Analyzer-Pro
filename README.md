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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 