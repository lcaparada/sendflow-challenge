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

const DB_COLLECTION = "connections";

export function createConnection(name: string) {
  return addDoc(collection(db, DB_COLLECTION), {
    userId: auth.currentUser!.uid,
    name,
    createdAt: serverTimestamp(),
  });
}

export function updateConnection(id: string, name: string) {
  return updateDoc(doc(collection(db, DB_COLLECTION), id), { name });
}

export function deleteConnection(id: string) {
  return deleteDoc(doc(collection(db, DB_COLLECTION), id));
}

export function getConnections(userId: string) {
  return collectionData(
    query(collection(db, DB_COLLECTION), where("userId", "==", userId)),
    { idField: "id" },
  );
}

export function useConnections(userId: string) {
  const observable = useMemo(() => getConnections(userId), [userId]);
  return useObservable(observable);
}
