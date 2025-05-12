// Run this script using Node.js to check your Firebase environment variables
// Usage: node src/lib/firebase/check-env.js

const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

// Check for required Firebase environment variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('\n=== FIREBASE ENVIRONMENT VARIABLES CHECK ===\n');

let allVarsPresent = true;
const issues = [];

for (const varName of requiredVars) {
  const value = process.env[varName];
  const valuePresent = !!value;
  
  console.log(`${varName}: ${valuePresent ? '✅ Present' : '❌ Missing'}`);
  
  if (!valuePresent) {
    allVarsPresent = false;
  }
  
  // Additional checks on specific variables
  if (valuePresent) {
    if (varName === 'VITE_FIREBASE_PROJECT_ID') {
      console.log(`  Project ID: ${value}`);
    }
    
    if (varName === 'VITE_FIREBASE_API_KEY' && value.includes('your-api-key')) {
      console.log(`  ⚠️ API key appears to be a placeholder`);
      issues.push('Firebase API key appears to be a placeholder');
    }
  }
}

console.log('\n=== SUMMARY ===\n');

if (allVarsPresent) {
  console.log('✅ All required Firebase environment variables are present.');
} else {
  console.log('❌ Some Firebase environment variables are missing.');
  console.log('Please add them to your .env file or environment.');
  console.log('\nExample .env file:');
  console.log(`
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
`);
}

if (issues.length > 0) {
  console.log('\n⚠️ Issues detected:');
  issues.forEach(issue => {
    console.log(`- ${issue}`);
  });
}

// Check Firestore connection requirements
console.log('\n=== CONNECTIVITY CHECK ===\n');
console.log('💡 To fix Firebase connection issues, ensure:');
console.log('1. Your project has Firestore enabled in the Firebase console');
console.log('2. Your project has proper security rules configured');
console.log('3. Your API key and project ID are correct');
console.log('4. Your web app is authorized to access Firebase services');
console.log('5. If you\'re using Firefox with Enhanced Tracking Protection, this may block Firebase connections');

console.log('\n=== DONE ===\n'); 