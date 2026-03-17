import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { db, requireAuth } from "./lib/db";

export const createMessage = onCall(async (request) => {
  const uid = requireAuth(request.auth?.uid);
  const { connectionId, contactIds, content, scheduledAt } = request.data as {
    connectionId: string;
    contactIds: string[];
    content: string;
    scheduledAt: string;
  };

  const ref = await db.collection("messages").add({
    userId: uid,
    connectionId,
    contactIds,
    content,
    status: "scheduled",
    scheduledAt: new Date(scheduledAt),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: ref.id };
});

export const updateMessage = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id, contactIds, content, scheduledAt } = request.data as {
    id: string;
    contactIds: string[];
    content: string;
    scheduledAt: string;
  };
  await db.collection("messages").doc(id).update({
    contactIds,
    content,
    scheduledAt: new Date(scheduledAt),
  });
  return { id };
});

export const updateMessageStatus = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id, status } = request.data as { id: string; status: string };
  await db.collection("messages").doc(id).update({ status });
  return { id };
});

export const deleteMessage = onCall(async (request) => {
  requireAuth(request.auth?.uid);
  const { id } = request.data as { id: string };
  await db.collection("messages").doc(id).delete();
  return { id };
});

export const processScheduledMessages = onSchedule("every 1 minutes", async () => {
  const now = new Date();

  const snapshot = await db
    .collection("messages")
    .where("status", "==", "scheduled")
    .where("scheduledAt", "<=", now)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "sent" });
  });

  await batch.commit();
  console.log(`Processed ${snapshot.size} scheduled message(s).`);
});

export const onMessageCreated = onDocumentCreated("messages/{messageId}", async (event) => {
  const data = event.data?.data();
  if (!data || data.status !== "scheduled") return;

  const scheduledAt: Date = data.scheduledAt?.toDate?.() ?? new Date(data.scheduledAt);
  if (scheduledAt <= new Date()) {
    await event.data!.ref.update({ status: "sent" });
    console.log(`Message ${event.params.messageId} marked as sent immediately.`);
  }
});
