import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { collectionData } from "rxfire/firestore";
import { useMemo } from "react";
import { auth, db } from "../../lib";
import { useObservable } from "../../hooks";

const DB_COLLECTION = "contacts";

export function createContact(connectionId: string, name: string, phone: string) {
  return addDoc(collection(db, DB_COLLECTION), {
    userId: auth.currentUser!.uid,
    connectionId,
    name,
    phone,
    createdAt: serverTimestamp(),
  });
}

export function updateContact(id: string, name: string, phone: string) {
  return updateDoc(doc(collection(db, DB_COLLECTION), id), { name, phone });
}

export function deleteContact(id: string) {
  return deleteDoc(doc(collection(db, DB_COLLECTION), id));
}

export function getContacts(userId: string, connectionId: string) {
  return collectionData(
    query(
      collection(db, DB_COLLECTION),
      where("userId", "==", userId),
      where("connectionId", "==", connectionId),
    ),
    { idField: "id" },
  );
}

export function useContacts(userId: string, connectionId: string) {
  const observable = useMemo(
    () => getContacts(userId, connectionId),
    [userId, connectionId],
  );
  return useObservable(observable);
}
