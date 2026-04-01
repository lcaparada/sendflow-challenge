import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, fns } from "../lib";
import type { ContactType } from "../modules";

export const createContact = (
  connectionId: string,
  name: string,
  phone: string,
) => httpsCallable(fns, "createContact")({ connectionId, name, phone });

export const updateContact = (id: string, name: string, phone: string) =>
  httpsCallable(fns, "updateContact")({ id, name, phone });

export const deleteContact = (id: string) =>
  httpsCallable(fns, "deleteContact")({ id });

export const subscribeToContacts = (
  userId: string,
  connectionId: string,
  callback: (contacts: ContactType[]) => void,
): Unsubscribe => {
  const q = query(
    collection(db, "contacts"),
    where("userId", "==", userId),
    where("connectionId", "==", connectionId),
  );
  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as ContactType[];
    callback(contacts);
  });
};
