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

export type MessageStatus = "scheduled" | "sent";

export type Message = {
  id: string;
  userId: string;
  connectionId: string;
  contactIds: string[];
  content: string;
  status: MessageStatus;
  scheduledAt: Date;
  createdAt: Date;
};

const COLLECTION = "messages";

export const createMessage = (
  userId: string,
  connectionId: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date
) =>
  addDoc(collection(db, COLLECTION), {
    userId,
    connectionId,
    contactIds,
    content,
    status: "scheduled" as MessageStatus,
    scheduledAt,
    createdAt: serverTimestamp(),
  });

export const updateMessage = (
  id: string,
  contactIds: string[],
  content: string,
  scheduledAt: Date
) =>
  updateDoc(doc(db, COLLECTION, id), {
    contactIds,
    content,
    scheduledAt,
  });

export const updateMessageStatus = (id: string, status: MessageStatus) =>
  updateDoc(doc(db, COLLECTION, id), { status });

export const deleteMessage = (id: string) =>
  deleteDoc(doc(db, COLLECTION, id));

export const subscribeToMessages = (
  userId: string,
  connectionId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("connectionId", "==", connectionId)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      scheduledAt: d.data().scheduledAt?.toDate?.() ?? new Date(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as Message[];
    callback(messages);
  });
};

// Checks and fires scheduled messages whose time has passed
export const startMessageScheduler = (
  messages: Message[]
): (() => void) => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  messages
    .filter((m) => m.status === "scheduled")
    .forEach((m) => {
      const delay = m.scheduledAt.getTime() - Date.now();
      if (delay <= 0) {
        updateMessageStatus(m.id, "sent");
      } else {
        timers.push(setTimeout(() => updateMessageStatus(m.id, "sent"), delay));
      }
    });

  return () => timers.forEach(clearTimeout);
};
