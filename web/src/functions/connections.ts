import { httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, fns } from "../lib";
import type { ConnectionType } from "../modules";

export const createConnection = (name: string) =>
  httpsCallable(fns, "createConnection")({ name });

export const updateConnection = (id: string, name: string) =>
  httpsCallable(fns, "updateConnection")({ id, name });

export const deleteConnection = (id: string) =>
  httpsCallable(fns, "deleteConnection")({ id });

export const subscribeToConnections = (
  userId: string,
  callback: (connections: ConnectionType[]) => void,
): Unsubscribe => {
  const q = query(collection(db, "connections"), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as ConnectionType[];
    callback(connections);
  });
};
