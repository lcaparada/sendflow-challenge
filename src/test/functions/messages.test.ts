import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Message } from "../../types";

vi.mock("firebase/firestore", () => ({
  updateDoc: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn().mockReturnValue({}),
  collection: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock("../../lib", () => ({ db: {} }));

import { startMessageScheduler } from "../../functions/messages";
import { updateDoc } from "firebase/firestore";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  userId: "user-1",
  connectionId: "conn-1",
  contactIds: ["contact-1"],
  content: "Hello!",
  status: "scheduled",
  scheduledAt: new Date(Date.now() + 10_000),
  createdAt: new Date(),
  ...overrides,
});

describe("startMessageScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignores already sent messages", () => {
    const message = makeMessage({ status: "sent" });
    startMessageScheduler([message]);
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("immediately updates messages scheduled in the past", () => {
    const message = makeMessage({
      scheduledAt: new Date(Date.now() - 1000),
    });
    startMessageScheduler([message]);
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it("schedules future messages via setTimeout", () => {
    const message = makeMessage({
      scheduledAt: new Date(Date.now() + 5_000),
    });
    startMessageScheduler([message]);
    expect(updateDoc).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5_000);
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it("processes multiple scheduled messages", () => {
    const messages = [
      makeMessage({ id: "1", scheduledAt: new Date(Date.now() - 1000) }),
      makeMessage({ id: "2", scheduledAt: new Date(Date.now() - 500) }),
      makeMessage({ id: "3", status: "sent" }),
    ];
    startMessageScheduler(messages);
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it("cleanup cancels pending timers", () => {
    const message = makeMessage({
      scheduledAt: new Date(Date.now() + 10_000),
    });
    const cleanup = startMessageScheduler([message]);
    cleanup();

    vi.advanceTimersByTime(10_000);
    expect(updateDoc).not.toHaveBeenCalled();
  });
});
