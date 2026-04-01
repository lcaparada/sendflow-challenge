import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, fns } from "../lib";
import type { MessageStatus, MessageType } from "../modules";

export const createMessage = (
  connectionId: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date,
) =>
  httpsCallable(
    fns,
    "createMessage",
  )({
    connectionId,
    contactIds,
    content,
    scheduledAt: scheduledAt.toISOString(),
  });

export const updateMessage = (
  id: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date,
) =>
  httpsCallable(
    fns,
    "updateMessage",
  )({
    id,
    contactIds,
    content,
    scheduledAt: scheduledAt.toISOString(),
  });

export const updateMessageStatus = (id: string, status: MessageStatus) =>
  httpsCallable(fns, "updateMessageStatus")({ id, status });

export const deleteMessage = (id: string) =>
  httpsCallable(fns, "deleteMessage")({ id });

export const subscribeToMessages = (
  userId: string,
  connectionId: string,
  callback: (messages: MessageType[]) => void,
): Unsubscribe => {
  const q = query(
    collection(db, "messages"),
    where("userId", "==", userId),
    where("connectionId", "==", connectionId),
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      scheduledAt: d.data().scheduledAt?.toDate?.() ?? new Date(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as MessageType[];
    callback(messages);
  });
};
