/**
 * Firebase Configuration
 * 
 * This file initializes the Firebase application and exports the services we need.
 * It uses the Singleton pattern to ensure we only initialize the app once.
 * 
 * Services used:
 * - Firestore: For storing widget data (NoSQL database).
 * - Auth: For user authentication (Google Sign-In).
 * 
 * Note: The configuration values are pulled from environment variables (.env.local)
 * to keep secrets out of the codebase.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// We check if an app is already initialized (getApps().length) to prevent errors during hot-reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export initialized services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };