import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db, requireAuth } from "./lib/db";

export const createContact = onCall(async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { connectionId, name, phone } = request.data as {
    connectionId: string;
    name: string;
    phone: string;
  };

  const ref = await db.collection("contacts").add({
    userId: uid,
    connectionId,
    name,
    phone,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: ref.id };
});

export const updateContact = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id, name, phone } = request.data as {
    id: string;
    name: string;
    phone: string;
  };
  await db.collection("contacts").doc(id).update({ name, phone });
  return { id };
});

export const deleteContact = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id } = request.data as { id: string };
  await db.collection("contacts").doc(id).delete();
  return { id };
});
