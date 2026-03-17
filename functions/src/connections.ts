import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { db, requireAuth } from "./lib/db";

export const createConnection = onCall(async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { name } = request.data as { name: string };

  const ref = await db.collection("connections").add({
    userId: uid,
    name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: ref.id };
});

export const updateConnection = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id, name } = request.data as { id: string; name: string };
  await db.collection("connections").doc(id).update({ name });
  return { id };
});

export const deleteConnection = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id } = request.data as { id: string };
  await db.collection("connections").doc(id).delete();
  return { id };
});
