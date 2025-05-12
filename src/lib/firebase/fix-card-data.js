// This is a utility script to fix card data and ensure display cases can match with cards
// Run this script with node src/lib/firebase/fix-card-data.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, collection, getDocs, doc, setDoc, updateDoc,
  getDoc, query, where
} = require('firebase/firestore');

// Firebase config - replace with your own
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample tags to ensure cards have data
const sampleTags = ['baseball', 'football', 'basketball', 'rookie', 'star', 'valuable', 'favorite'];

// Update all cards in the database to ensure they have tags
async function fixCardData() {
  try {
    // Get all users
    console.log('Getting all users...');
    const usersRef = collection(db, 'users');
    const userSnapshots = await getDocs(usersRef);
    
    for (const userDoc of userSnapshots.docs) {
      const userId = userDoc.id;
      console.log(`Processing user: ${userId}`);
      
      // Check both possible paths for card collections
      const cardPaths = [
        `users/${userId}/cards`,
        `users/${userId}/collection`
      ];
      
      // Fix cards collection
      for (const path of cardPaths) {
        console.log(`Checking path: ${path}`);
        const cardsRef = collection(db, path);
        const cardSnapshots = await getDocs(cardsRef);
        
        if (cardSnapshots.empty) {
          console.log(`No cards found at ${path}`);
          continue;
        }
        
        console.log(`Found ${cardSnapshots.size} cards at ${path}`);
        
        // Update each card
        for (const cardDoc of cardSnapshots.docs) {
          const cardData = cardDoc.data();
          const cardId = cardDoc.id;
          
          // Check if card has tags
          if (!cardData.tags || !Array.isArray(cardData.tags) || cardData.tags.length === 0) {
            console.log(`Adding tags to card ${cardId}`);
            
            // Assign 2-3 random tags
            const numTags = Math.floor(Math.random() * 2) + 2; // 2-3 tags
            const randomTags = [];
            
            for (let i = 0; i < numTags; i++) {
              const randomTag = sampleTags[Math.floor(Math.random() * sampleTags.length)];
              if (!randomTags.includes(randomTag)) {
                randomTags.push(randomTag);
              }
            }
            
            // Update the card
            await updateDoc(doc(db, path, cardId), {
              tags: randomTags,
              // Ensure there's an image URL
              imageUrl: cardData.imageUrl || 'https://via.placeholder.com/300x420?text=Card+Image'
            });
            
            console.log(`Updated card ${cardId} with tags: ${randomTags.join(', ')}`);
          } else {
            console.log(`Card ${cardId} already has tags: ${cardData.tags.join(', ')}`);
          }
        }
      }
      
      // Now check and fix display cases
      const displayCasePath = `users/${userId}/display_cases`;
      console.log(`Checking display cases at: ${displayCasePath}`);
      
      const displayCasesRef = collection(db, displayCasePath);
      const displayCaseSnapshots = await getDocs(displayCasesRef);
      
      if (displayCaseSnapshots.empty) {
        console.log(`No display cases found for user ${userId}`);
      } else {
        console.log(`Found ${displayCaseSnapshots.size} display cases`);
        
        // Update each display case
        for (const dcDoc of displayCaseSnapshots.docs) {
          const dcData = dcDoc.data();
          const dcId = dcDoc.id;
          
          // Check if display case has tags
          if (!dcData.tags || !Array.isArray(dcData.tags) || dcData.tags.length === 0) {
            console.log(`Adding tags to display case ${dcId}`);
            
            // Assign 1-2 random tags
            const numTags = Math.floor(Math.random() * 2) + 1; // 1-2 tags
            const randomTags = [];
            
            for (let i = 0; i < numTags; i++) {
              const randomTag = sampleTags[Math.floor(Math.random() * sampleTags.length)];
              if (!randomTags.includes(randomTag)) {
                randomTags.push(randomTag);
              }
            }
            
            // Update the display case
            await updateDoc(doc(db, displayCasePath, dcId), {
              tags: randomTags
            });
            
            console.log(`Updated display case ${dcId} with tags: ${randomTags.join(', ')}`);
          } else {
            console.log(`Display case ${dcId} already has tags: ${dcData.tags.join(', ')}`);
          }
        }
      }
    }
    
    console.log('Done fixing card data!');
    
  } catch (error) {
    console.error('Error fixing card data:', error);
  }
}

// Run the fix
fixCardData().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script failed:', err);
}); 