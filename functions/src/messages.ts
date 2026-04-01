import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "./lib/db";

export const processScheduledMessages = onSchedule(
  "every 1 minutes",
  async () => {
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
  },
);

export const onMessageCreated = onDocumentCreated(
  "messages/{messageId}",
  async (event) => {
    const data = event.data?.data();
    if (!data || data.status !== "scheduled") return;

    const scheduledAt: Date =
      data.scheduledAt?.toDate?.() ?? new Date(data.scheduledAt);
    if (scheduledAt <= new Date()) {
      await event.data!.ref.update({ status: "sent" });
      console.log(
        `Message ${event.params.messageId} marked as sent immediately.`,
      );
    }
  },
);
