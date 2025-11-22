/**
 * WidgetModel
 * 
 * This class encapsulates all data access logic for Widgets.
 * It interacts directly with Firebase Firestore to:
 * - Fetch widgets by User ID.
 * - Fetch a single widget by ID.
 * - Save (create or update) widgets.
 * - Delete widgets.
 * 
 * It serves as the "Model" in the MVC architecture.
 */
import { collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { WidgetData } from './types';

export class WidgetModel {
  /**
   * Fetches all widgets belonging to a specific user.
   * 
   * @param uid - The User ID to fetch widgets for.
   * @returns A list of widget objects, sorted by creation date (newest first).
   */
  static async fetchByUser(uid: string) {
    // Create a query against the "widgets" collection where the "uid" field matches the user's ID.
    const q = query(collection(db, "widgets"), where("uid", "==", uid));
    
    // Execute the query.
    const querySnapshot = await getDocs(q);
    
    // Map the results to a clean array of objects, including the document ID.
    const widgets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort the widgets by creation time (descending).
    widgets.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    
    return widgets;
  }

  /**
   * Fetches a single widget by its ID.
   * 
   * @param id - The ID of the widget to fetch.
   * @returns The widget data if found, or null if not found.
   */
  static async getById(id: string) {
    // Dynamically import firestore functions to reduce initial bundle size.
    const { doc, getDoc } = await import("firebase/firestore");
    
    // Create a reference to the specific document.
    const docRef = doc(db, "widgets", id);
    
    // Fetch the document.
    const docSnap = await getDoc(docRef);
    
    // If it exists, return the data.
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }

  /**
   * Saves a widget to the database.
   * If an ID is provided (and isn't a temp ID), it updates the existing widget.
   * Otherwise, it creates a new widget.
   * 
   * @param id - The ID of the widget (or null/temp ID for new).
   * @param data - The widget data to save.
   * @returns The ID of the saved widget.
   */
  static async save(id: string | null, data: WidgetData) {
    // If we have a real ID (not a temporary one starting with 'temp_'), update the existing doc.
    if (id && !id.startsWith('temp_')) {
      // setDoc with { merge: true } updates fields without overwriting the whole doc if we wanted,
      // but here we are mostly overwriting.
      await setDoc(doc(db, "widgets", id), data, { merge: true });
      return id;
    } else {
      // Otherwise, create a new document in the "widgets" collection.
      // addDoc automatically generates a unique ID.
      const docRef = await addDoc(collection(db, "widgets"), data);
      return docRef.id;
    }
  }

  /**
   * Deletes a widget from the database.
   * 
   * @param id - The ID of the widget to delete.
   */
  static async delete(id: string) {
    // Delete the document with the given ID from the "widgets" collection.
    await deleteDoc(doc(db, "widgets", id));
  }
}
