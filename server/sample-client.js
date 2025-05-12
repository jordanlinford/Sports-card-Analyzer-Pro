/**
 * Sample client for the eBay Scraper API
 * 
 * This demonstrates how to make requests to the scraper API
 * from a Node.js client.
 */

const axios = require('axios');

// Configuration
const SCRAPER_URL = 'http://localhost:3001';

/**
 * Search for card listings on eBay
 * @param {Object} cardInfo - Information about the card to search for
 * @returns {Promise<Object>} - The search results
 */
async function searchCardListings(cardInfo) {
  try {
    console.log('Searching for:', cardInfo);
    
    const response = await axios.post(`${SCRAPER_URL}/api/scrape`, cardInfo, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    throw new Error(`Failed to search card listings: ${error.message}`);
  }
}

// Example usage
async function main() {
  // Test health check
  try {
    const healthResponse = await axios.get(`${SCRAPER_URL}/api/health`);
    console.log('Health check:', healthResponse.data);
  } catch (error) {
    console.error('Health check failed. Is the server running?');
    process.exit(1);
  }
  
  // Example 1: Search for a basic card
  try {
    const result1 = await searchCardListings({
      playerName: 'Mike Trout',
      year: '2011',
      cardSet: 'Topps Update',
      cardNumber: 'US175',
      condition: 'PSA 10'
    });
    
    console.log(`Found ${result1.count} listings for Mike Trout rookie card`);
    
    // Display first 3 results if available
    if (result1.listings.length > 0) {
      console.log('Sample listings:');
      result1.listings.slice(0, 3).forEach((listing, i) => {
        console.log(`\n#${i+1}: ${listing.title}`);
        console.log(`Price: $${listing.price.toFixed(2)} + $${listing.shipping.toFixed(2)} shipping`);
        console.log(`Total: $${listing.totalPrice.toFixed(2)}`);
        console.log(`Sold: ${listing.dateSold}`);
        console.log(`URL: ${listing.url}`);
      });
    }
  } catch (error) {
    console.error('Example 1 failed:', error.message);
  }
  
  // Example 2: Search with negative keywords
  try {
    const result2 = await searchCardListings({
      playerName: 'Shohei Ohtani',
      year: '2018',
      cardSet: 'Topps Chrome Update',
      cardNumber: 'HMT32',
      variation: 'Pink Refractor',
      condition: 'PSA 10',
      negKeywords: ['lot', 'auto', 'autograph', 'reprint']
    });
    
    console.log(`\nFound ${result2.count} listings for Ohtani Pink Refractor`);
    
    // Display first 3 results if available
    if (result2.listings.length > 0) {
      console.log('Sample listings:');
      result2.listings.slice(0, 3).forEach((listing, i) => {
        console.log(`\n#${i+1}: ${listing.title}`);
        console.log(`Price: $${listing.price.toFixed(2)} + $${listing.shipping.toFixed(2)} shipping`);
        console.log(`Total: $${listing.totalPrice.toFixed(2)}`);
        console.log(`Sold: ${listing.dateSold}`);
        console.log(`URL: ${listing.url}`);
      });
    }
  } catch (error) {
    console.error('Example 2 failed:', error.message);
  }
}

// Run the examples
main().catch(error => {
  console.error('Main function error:', error);
  process.exit(1);
}); 