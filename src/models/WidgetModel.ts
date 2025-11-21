import { collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { WidgetData } from './types';

export class WidgetModel {
  static async fetchByUser(uid: string) {
    const q = query(collection(db, "widgets"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const widgets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    widgets.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return widgets;
  }

  static async getById(id: string) {
    const { doc, getDoc } = await import("firebase/firestore");
    const docRef = doc(db, "widgets", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }

  static async save(id: string | null, data: WidgetData) {
    if (id && !id.startsWith('temp_')) {
      await setDoc(doc(db, "widgets", id), data, { merge: true });
      return id;
    } else {
      const docRef = await addDoc(collection(db, "widgets"), data);
      return docRef.id;
    }
  }

  static async delete(id: string) {
    await deleteDoc(doc(db, "widgets", id));
  }
}
