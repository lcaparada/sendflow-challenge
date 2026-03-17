"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreated = exports.processScheduledMessages = exports.deleteMessage = exports.updateMessageStatus = exports.updateMessage = exports.createMessage = exports.deleteContact = exports.updateContact = exports.createContact = exports.deleteConnection = exports.updateConnection = exports.createConnection = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// ─── Helpers ─────────────────────────────────────────────────────────────────
const requireAuth = (uid) => {
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    return uid;
};
// ─── Connections ──────────────────────────────────────────────────────────────
exports.createConnection = (0, https_1.onCall)(async (request) => {
    var _a;
    const uid = requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { name } = request.data;
    const ref = await db.collection("connections").add({
        userId: uid,
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: ref.id };
});
exports.updateConnection = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id, name } = request.data;
    await db.collection("connections").doc(id).update({ name });
    return { id };
});
exports.deleteConnection = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id } = request.data;
    await db.collection("connections").doc(id).delete();
    return { id };
});
// ─── Contacts ─────────────────────────────────────────────────────────────────
exports.createContact = (0, https_1.onCall)(async (request) => {
    var _a;
    const uid = requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { connectionId, name, phone } = request.data;
    const ref = await db.collection("contacts").add({
        userId: uid,
        connectionId,
        name,
        phone,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: ref.id };
});
exports.updateContact = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id, name, phone } = request.data;
    await db.collection("contacts").doc(id).update({ name, phone });
    return { id };
});
exports.deleteContact = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id } = request.data;
    await db.collection("contacts").doc(id).delete();
    return { id };
});
// ─── Messages ─────────────────────────────────────────────────────────────────
exports.createMessage = (0, https_1.onCall)(async (request) => {
    var _a;
    const uid = requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { connectionId, contactIds, content, scheduledAt } = request.data;
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
exports.updateMessage = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id, contactIds, content, scheduledAt } = request.data;
    await db.collection("messages").doc(id).update({
        contactIds,
        content,
        scheduledAt: new Date(scheduledAt),
    });
    return { id };
});
exports.updateMessageStatus = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id, status } = request.data;
    await db.collection("messages").doc(id).update({ status });
    return { id };
});
exports.deleteMessage = (0, https_1.onCall)(async (request) => {
    var _a;
    requireAuth((_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid);
    const { id } = request.data;
    await db.collection("messages").doc(id).delete();
    return { id };
});
// ─── Scheduler ────────────────────────────────────────────────────────────────
/**
 * Runs every minute and marks scheduled messages as sent
 * when their scheduledAt time has passed.
 */
exports.processScheduledMessages = (0, scheduler_1.onSchedule)("every 1 minutes", async () => {
    const now = new Date();
    const snapshot = await db
        .collection("messages")
        .where("status", "==", "scheduled")
        .where("scheduledAt", "<=", now)
        .get();
    if (snapshot.empty)
        return;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { status: "sent" });
    });
    await batch.commit();
    console.log(`Processed ${snapshot.size} scheduled message(s).`);
});
/**
 * Firestore trigger: marks a new message as sent immediately
 * if its scheduledAt is already in the past.
 */
exports.onMessageCreated = (0, firestore_1.onDocumentCreated)("messages/{messageId}", async (event) => {
    var _a, _b, _c, _d;
    const data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!data || data.status !== "scheduled")
        return;
    const scheduledAt = (_d = (_c = (_b = data.scheduledAt) === null || _b === void 0 ? void 0 : _b.toDate) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : new Date(data.scheduledAt);
    if (scheduledAt <= new Date()) {
        await event.data.ref.update({ status: "sent" });
        console.log(`Message ${event.params.messageId} marked as sent immediately.`);
    }
});
//# sourceMappingURL=index.js.map