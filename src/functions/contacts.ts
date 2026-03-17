import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

export type Contact = {
  id: string;
  userId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Date;
};

const COLLECTION = "contacts";

export const createContact = (
  userId: string,
  connectionId: string,
  name: string,
  phone: string
) =>
  addDoc(collection(db, COLLECTION), {
    userId,
    connectionId,
    name,
    phone,
    createdAt: serverTimestamp(),
  });

export const updateContact = (id: string, name: string, phone: string) =>
  updateDoc(doc(db, COLLECTION, id), { name, phone });

export const deleteContact = (id: string) =>
  deleteDoc(doc(db, COLLECTION, id));

export const subscribeToContacts = (
  userId: string,
  connectionId: string,
  callback: (contacts: Contact[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("connectionId", "==", connectionId)
  );
  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as Contact[];
    callback(contacts);
  });
};
