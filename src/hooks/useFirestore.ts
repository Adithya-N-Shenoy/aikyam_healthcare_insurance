import { useState } from 'react';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import toast from 'react-hot-toast';

export function useFirestore<T = DocumentData>(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocument = async (id: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching document: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getDocuments = async (constraints: QueryConstraint[] = []): Promise<T[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching documents: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (data: Partial<T>): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success('Document added successfully');
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error adding document: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (id: string, data: Partial<T>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast.success('Document updated successfully');
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error updating document: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      toast.success('Document deleted successfully');
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error deleting document: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const queryDocuments = async (field: string, operator: any, value: any): Promise<T[]> => {
    return getDocuments([where(field, operator, value)]);
  };

  return {
    loading,
    error,
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    queryDocuments
  };
}