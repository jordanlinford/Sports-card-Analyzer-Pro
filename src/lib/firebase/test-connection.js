/**
 * Firebase Connection Test Script
 * 
 * Run this script using Node.js to test Firebase connectivity
 * Usage: node src/lib/firebase/test-connection.js
 * 
 * This will attempt to connect to your Firebase project and perform basic Firestore operations
 * to diagnose any connectivity or permission issues.
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, collection, addDoc, doc, getDoc, getDocs, 
  query, where, deleteDoc, serverTimestamp 
} = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for input with a promise wrapper
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function runTests() {
  console.log('\n🔥 FIREBASE CONNECTION TEST 🔥\n');
  
  // 1. Check environment variables
  console.log('Step 1: Checking environment variables...');
  
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  };
  
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please add them to your .env file and try again.');
    return;
  }
  
  console.log('✅ All Firebase environment variables are present.');
  console.log('Firebase Project ID:', firebaseConfig.projectId);
  
  // 2. Initialize Firebase
  console.log('\nStep 2: Initializing Firebase...');
  try {
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully.');
    
    const db = getFirestore(app);
    console.log('✅ Firestore initialized.');
    
    const auth = getAuth(app);
    console.log('✅ Auth initialized.');
    
    // 3. Basic authentication test
    console.log('\nStep 3: Testing Firebase Authentication...');
    
    // Try anonymous auth for testing
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Anonymous authentication successful.');
      console.log('User ID:', userCredential.user.uid);
      
      // 4. Test Firestore read/write
      console.log('\nStep 4: Testing Firestore read/write operations...');
      
      const testUserId = userCredential.user.uid;
      
      // Test writing to Firestore
      try {
        // Create a test collection for this user
        const testCollectionRef = collection(db, 'test', testUserId, 'test_items');
        
        // Add a test document
        const testDoc = await addDoc(testCollectionRef, {
          name: 'Test Document',
          createdAt: serverTimestamp(),
          testValue: 'This is a test'
        });
        
        console.log('✅ Successfully wrote test document with ID:', testDoc.id);
        
        // Read the test document
        const docSnapshot = await getDoc(doc(testCollectionRef, testDoc.id));
        if (docSnapshot.exists()) {
          console.log('✅ Successfully read test document.');
          console.log('Document data:', docSnapshot.data());
        } else {
          console.error('❌ Test document does not exist after writing.');
        }
        
        // Clean up - delete test document
        await deleteDoc(doc(testCollectionRef, testDoc.id));
        console.log('✅ Successfully deleted test document.');
        
        // Suggest testing display cases
        console.log('\nTesting display cases collection:');
        const displayCasesRef = collection(db, 'users', testUserId, 'display_cases');
        
        // Ask if user wants to create a test display case
        const createTestCase = await askQuestion('Would you like to create a test display case? (y/n): ');
        
        if (createTestCase.toLowerCase() === 'y') {
          const testCase = await addDoc(displayCasesRef, {
            name: 'Test Display Case',
            tags: ['test', 'sample', 'demo'],
            createdAt: new Date(),
            theme: 'wood',
            isPublic: true
          });
          
          console.log('✅ Successfully created test display case with ID:', testCase.id);
          console.log(`Path: users/${testUserId}/display_cases/${testCase.id}`);
          
          // Check if it can be read back
          const caseDoc = await getDoc(doc(displayCasesRef, testCase.id));
          if (caseDoc.exists()) {
            console.log('✅ Successfully read test display case.');
            console.log('Display case data:', caseDoc.data());
          }
        }
        
        // Check for existing display cases
        const casesSnapshot = await getDocs(displayCasesRef);
        console.log(`Found ${casesSnapshot.size} display cases for this user.`);
        casesSnapshot.forEach(doc => {
          console.log(`- ID: ${doc.id}, Name: ${doc.data().name}`);
        });
        
        console.log('\nFirebase Connection Test Completed Successfully! 🎉');
        console.log('\nIf you\'re still having issues in your application, check:');
        console.log('1. Are you using the same Firebase config in the app?');
        console.log('2. Check browser developer tools for CORS or network errors');
        console.log('3. Ensure Firestore security rules allow reads/writes');
        console.log('4. Verify browser extensions aren\'t blocking connections');
        
      } catch (error) {
        console.error('❌ Firestore test failed:', error);
      }
      
    } catch (authError) {
      console.error('❌ Authentication test failed:', authError);
    }
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
  
  rl.close();
}

runTests(); 