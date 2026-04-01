import { Timestamp } from "firebase/firestore";

export function toDate(value: Date | Timestamp | unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value as string | number);
}
