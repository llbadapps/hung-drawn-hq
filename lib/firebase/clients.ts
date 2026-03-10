import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Client, ClientFormData } from '@/types/client';

const COLLECTION_NAME = 'clients';

export const createClient = async (userId: string, data: ClientFormData): Promise<{ id: string | null; error: string | null }> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getClients = async (userId: string): Promise<{ clients: Client[]; error: string | null }> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const clients: Client[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Client;
    });
    return { clients, error: null };
  } catch (error: any) {
    return { clients: [], error: error.message };
  }
};

export const updateClient = async (clientId: string, data: Partial<ClientFormData>): Promise<{ error: string | null }> => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await updateDoc(clientRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteClient = async (clientId: string): Promise<{ error: string | null }> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, clientId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
