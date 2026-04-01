import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { collectionData } from "rxfire/firestore";
import type { Observable } from "rxjs";
import { useMemo } from "react";
import { auth, db } from "../../lib";
import { useObservable } from "../../hooks";
import type { ConnectionType } from "..";

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

const PAGE_SIZE = 20;

export function getConnections(userId: string, pageSize = PAGE_SIZE) {
  return collectionData(
    query(
      collection(db, DB_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    { idField: "id" },
  ) as Observable<ConnectionType[]>;
}

export function useConnections(userId: string, pageSize = PAGE_SIZE) {
  const observable = useMemo(
    () => getConnections(userId, pageSize),
    [userId, pageSize],
  );
  return useObservable<ConnectionType>(observable);
}
