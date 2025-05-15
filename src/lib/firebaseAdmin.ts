import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import path from "path";
import fs from "fs";

// Only initialize Firebase Admin in server environments
const isServer = typeof window === 'undefined';

// Mock implementations for client-side
const mockDb = {
  collection: () => ({
    doc: () => ({
      collection: () => ({
        doc: () => ({
          set: async () => {},
        }),
      }),
    }),
  }),
};

const mockAuth = {
  verifyIdToken: async () => ({ uid: 'mock-uid' }),
};

// Initialize Firebase Admin SDK only on the server side
let adminDb: any;
let adminAuth: any;

// Always use mock implementations for development environment in the browser
if (!isServer) {
  console.log("Using mock Firebase Admin implementations for client-side");
  adminDb = mockDb;
  adminAuth = mockAuth;
} else {
  try {
    const serviceAccountPath = path.join(process.cwd(), "firebase-adminsdk.json");
    
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        
        if (!getApps().length) {
          initializeApp({ credential: cert(serviceAccount) });
          console.log("Firebase Admin initialized successfully");
        }
        
        adminDb = getFirestore();
        adminAuth = getAuth();
      } catch (parseError) {
        console.error("Error parsing Firebase Admin credentials:", parseError);
        console.log("Using mock implementations due to credential parsing error");
        adminDb = mockDb;
        adminAuth = mockAuth;
      }
    } else {
      console.error("Firebase Admin SDK credential file not found:", serviceAccountPath);
      console.log("Using mock implementations due to missing credentials");
      adminDb = mockDb;
      adminAuth = mockAuth;
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    console.log("Using mock implementations due to initialization error");
    adminDb = mockDb;
    adminAuth = mockAuth;
  }
}

export { adminDb, adminAuth }; 