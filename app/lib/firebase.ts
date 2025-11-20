import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCv_pqxFQQYppKrVmh5T6zkrZlvXBV9kXM",
  authDomain: "my-readme-widget.firebaseapp.com",
  projectId: "my-readme-widget",
  storageBucket: "my-readme-widget.firebasestorage.app",
  messagingSenderId: "884344888202",
  appId: "1:884344888202:web:bc35a3c0cf75f910e54673",
  measurementId: "G-6Y1R8NHN9V"
};

// Initialize Firebase (Singleton pattern to prevent multiple initializations)
// We omit Analytics here to prevent server-side crashes in the API route
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
