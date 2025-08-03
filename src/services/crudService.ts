import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';

export class CrudService {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a new document
  async create(data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Read a single document
  async read(id: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error reading document:', error);
      throw error;
    }
  }

  // Read all documents
  async readAll(): Promise<DocumentData[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error reading all documents:', error);
      throw error;
    }
  }

  // Update a document
  async update(id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToChanges(callback: (data: DocumentData[]) => void): () => void {
    const q = collection(db, this.collectionName);
    return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    });
  }

  // Query documents with conditions
  async query(field: string, operator: any, value: any): Promise<DocumentData[]> {
    try {
      const q = query(collection(db, this.collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }
}