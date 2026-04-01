import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
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
import type { ContactType } from "./contacts.types";

const DB_COLLECTION = "contacts";

export function createContact(
  connectionId: string,
  name: string,
  phone: string,
) {
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

export async function checkPhoneDuplicate(
  userId: string,
  phone: string,
  excludeId?: string,
): Promise<boolean> {
  const snapshot = await getDocs(
    query(
      collection(db, DB_COLLECTION),
      where("userId", "==", userId),
      where("phone", "==", phone),
    ),
  );
  return snapshot.docs.some((d) => d.id !== excludeId);
}

export async function searchContacts(
  userId: string,
  connectionId: string,
  search: string,
): Promise<ContactType[]> {
  const base = [
    where("userId", "==", userId),
    where("connectionId", "==", connectionId),
  ];
  const end = search + "\uf8ff";

  const [byName, byPhone] = await Promise.all([
    getDocs(query(collection(db, DB_COLLECTION), ...base,
      where("name", ">=", search), where("name", "<=", end),
    )),
    getDocs(query(collection(db, DB_COLLECTION), ...base,
      where("phone", ">=", search), where("phone", "<=", end),
    )),
  ]);

  const seen = new Set<string>();
  const results: ContactType[] = [];
  for (const snap of [byName, byPhone]) {
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        results.push({ id: d.id, ...d.data() } as ContactType);
      }
    }
  }
  return results;
}

const PAGE_SIZE = 20;

export function getContacts(
  userId: string,
  connectionId: string,
  pageSize = PAGE_SIZE,
) {
  return collectionData(
    query(
      collection(db, DB_COLLECTION),
      where("userId", "==", userId),
      where("connectionId", "==", connectionId),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    { idField: "id" },
  ) as Observable<ContactType[]>;
}

export function useContacts(
  userId: string,
  connectionId: string,
  pageSize = PAGE_SIZE,
) {
  const observable = useMemo(
    () => getContacts(userId, connectionId, pageSize),
    [userId, connectionId, pageSize],
  );
  return useObservable<ContactType>(observable);
}
