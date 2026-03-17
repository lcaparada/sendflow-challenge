import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v2/https";

admin.initializeApp();

export const db = admin.firestore();

export const requireAuth = (uid: string | undefined): string => {
  if (!uid) throw new HttpsError("unauthenticated", "Authentication required.");
  return uid;
};
