/**
 * useAuth.ts
 * 
 * This custom hook manages the user's authentication state.
 * It wraps Firebase Authentication logic to provide a simple interface for:
 * - Checking if a user is logged in.
 * - Logging in with Google.
 * - Logging out.
 */
import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from '@/lib/firebase';

export function useAuth() {
  // State to hold the current user object (or null if not logged in).
  const [user, setUser] = useState<any>(null);
  
  // State to track if we are currently checking the login status (loading).
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Effect to listen for changes in authentication state (login/logout).
  useEffect(() => {
    // onAuthStateChanged is a Firebase listener that triggers whenever the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false); // We are done loading once we get the first status update.
    });
    
    // Cleanup function to remove the listener when the component unmounts.
    return () => unsubscribe();
  }, []);

  /**
   * Initiates the Google Login flow.
   * It sets persistence to 'local' so the user stays logged in even after closing the browser.
   */
  const login = async () => {
    try {
      // Ensure the session persists in the browser.
      await setPersistence(auth, browserLocalPersistence);
      
      // Create a Google Auth Provider instance.
      const provider = new GoogleAuthProvider();
      
      // Open a popup window for the user to sign in with their Google account.
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("Login failed. Check your Firebase config.");
    }
  };

  /**
   * Logs the user out.
   */
  const logout = () => signOut(auth);

  // Return the state and functions so components can use them.
  return {
    user,
    isAuthLoading,
    login,
    logout
  };
}
