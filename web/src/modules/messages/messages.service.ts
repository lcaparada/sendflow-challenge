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
import { useMemo } from "react";
import { auth, db } from "../../lib";
import { useObservable } from "../../hooks";
import { collectionData } from "rxfire/firestore";
import type { MessageStatus, MessageType } from "..";
import type { Observable } from "rxjs";

const DB_COLLECTION = "messages";

export function createMessage(
  connectionId: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date,
) {
  return addDoc(collection(db, DB_COLLECTION), {
    userId: auth.currentUser!.uid,
    connectionId,
    contactIds,
    content,
    scheduledAt,
    status: "scheduled" as MessageStatus,
    createdAt: serverTimestamp(),
  });
}

export function updateMessage(
  id: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date,
) {
  return updateDoc(doc(collection(db, DB_COLLECTION), id), {
    contactIds,
    content,
    scheduledAt,
  });
}

export function updateMessageStatus(id: string, status: MessageStatus) {
  return updateDoc(doc(collection(db, DB_COLLECTION), id), { status });
}

export function deleteMessage(id: string) {
  return deleteDoc(doc(collection(db, DB_COLLECTION), id));
}

export function getMessages(userId: string, connectionId: string) {
  return collectionData(
    query(
      collection(db, DB_COLLECTION),
      where("userId", "==", userId),
      where("connectionId", "==", connectionId),
    ),
    { idField: "id" },
  ) as Observable<MessageType[]>;
}

export function useMessages(userId: string, connectionId: string) {
  const observable = useMemo(
    () => getMessages(userId, connectionId),
    [userId, connectionId],
  );
  return useObservable<MessageType>(observable);
}
