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
import { db } from "../lib";
import type { Connection } from "../types";

const COLLECTION = "connections";

export const createConnection = (userId: string, name: string) =>
  addDoc(collection(db, COLLECTION), {
    userId,
    name,
    createdAt: serverTimestamp(),
  });

export const updateConnection = (id: string, name: string) =>
  updateDoc(doc(db, COLLECTION, id), { name });

export const deleteConnection = (id: string) =>
  deleteDoc(doc(db, COLLECTION, id));

export const subscribeToConnections = (
  userId: string,
  callback: (connections: Connection[]) => void,
): Unsubscribe => {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as Connection[];
    callback(connections);
  });
};
