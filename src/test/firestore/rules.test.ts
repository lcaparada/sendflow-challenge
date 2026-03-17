import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setDoc, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const PROJECT_ID = "sendflow-test";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync(
        resolve(__dirname, "../../../firestore.rules"),
        "utf8",
      ),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

const db = (uid: string) => testEnv.authenticatedContext(uid).firestore();

const unauthDb = () => testEnv.unauthenticatedContext().firestore();

const seedDoc = async (collection: string, id: string, userId: string) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), collection, id), {
      userId,
      name: "seed",
    });
  });
};

describe("connections", () => {
  it("allows authenticated user to create their own document", async () => {
    await assertSucceeds(
      setDoc(doc(db("alice"), "connections", "conn-1"), {
        userId: "alice",
        name: "My Connection",
      }),
    );
  });

  it("denies creating a document with another user's id", async () => {
    await assertFails(
      setDoc(doc(db("alice"), "connections", "conn-1"), {
        userId: "bob",
        name: "Forged Connection",
      }),
    );
  });

  it("denies unauthenticated create", async () => {
    await assertFails(
      setDoc(doc(unauthDb(), "connections", "conn-1"), {
        userId: "alice",
        name: "Connection",
      }),
    );
  });

  it("allows owner to read their own document", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertSucceeds(getDoc(doc(db("alice"), "connections", "conn-1")));
  });

  it("denies another user from reading someone else's document", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertFails(getDoc(doc(db("bob"), "connections", "conn-1")));
  });

  it("denies unauthenticated read", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertFails(getDoc(doc(unauthDb(), "connections", "conn-1")));
  });

  it("allows owner to update their own document", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertSucceeds(
      updateDoc(doc(db("alice"), "connections", "conn-1"), { name: "Updated" }),
    );
  });

  it("denies another user from updating someone else's document", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertFails(
      updateDoc(doc(db("bob"), "connections", "conn-1"), { name: "Hacked" }),
    );
  });

  it("allows owner to delete their own document", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertSucceeds(deleteDoc(doc(db("alice"), "connections", "conn-1")));
  });

  it("denies another user from deleting someone else's document", async () => {
    await seedDoc("connections", "conn-1", "alice");
    await assertFails(deleteDoc(doc(db("bob"), "connections", "conn-1")));
  });
});

describe("contacts", () => {
  it("allows owner to create their own contact", async () => {
    await assertSucceeds(
      setDoc(doc(db("alice"), "contacts", "c-1"), {
        userId: "alice",
        connectionId: "conn-1",
        name: "John",
        phone: "+55 11 99999-9999",
      }),
    );
  });

  it("denies creating a contact with another user's id", async () => {
    await assertFails(
      setDoc(doc(db("alice"), "contacts", "c-1"), {
        userId: "bob",
        connectionId: "conn-1",
        name: "John",
        phone: "+55 11 99999-9999",
      }),
    );
  });

  it("allows owner to read their own contact", async () => {
    await seedDoc("contacts", "c-1", "alice");
    await assertSucceeds(getDoc(doc(db("alice"), "contacts", "c-1")));
  });

  it("denies another user from reading someone else's contact", async () => {
    await seedDoc("contacts", "c-1", "alice");
    await assertFails(getDoc(doc(db("bob"), "contacts", "c-1")));
  });

  it("allows owner to update their own contact", async () => {
    await seedDoc("contacts", "c-1", "alice");
    await assertSucceeds(
      updateDoc(doc(db("alice"), "contacts", "c-1"), { name: "Updated" }),
    );
  });

  it("denies another user from updating someone else's contact", async () => {
    await seedDoc("contacts", "c-1", "alice");
    await assertFails(
      updateDoc(doc(db("bob"), "contacts", "c-1"), { name: "Hacked" }),
    );
  });

  it("allows owner to delete their own contact", async () => {
    await seedDoc("contacts", "c-1", "alice");
    await assertSucceeds(deleteDoc(doc(db("alice"), "contacts", "c-1")));
  });

  it("denies another user from deleting someone else's contact", async () => {
    await seedDoc("contacts", "c-1", "alice");
    await assertFails(deleteDoc(doc(db("bob"), "contacts", "c-1")));
  });
});

describe("messages", () => {
  it("allows owner to create their own message", async () => {
    await assertSucceeds(
      setDoc(doc(db("alice"), "messages", "msg-1"), {
        userId: "alice",
        connectionId: "conn-1",
        content: "Hello",
        status: "scheduled",
      }),
    );
  });

  it("denies creating a message with another user's id", async () => {
    await assertFails(
      setDoc(doc(db("alice"), "messages", "msg-1"), {
        userId: "bob",
        content: "Hello",
        status: "scheduled",
      }),
    );
  });

  it("allows owner to read their own message", async () => {
    await seedDoc("messages", "msg-1", "alice");
    await assertSucceeds(getDoc(doc(db("alice"), "messages", "msg-1")));
  });

  it("denies another user from reading someone else's message", async () => {
    await seedDoc("messages", "msg-1", "alice");
    await assertFails(getDoc(doc(db("bob"), "messages", "msg-1")));
  });

  it("allows owner to update their own message", async () => {
    await seedDoc("messages", "msg-1", "alice");
    await assertSucceeds(
      updateDoc(doc(db("alice"), "messages", "msg-1"), { status: "sent" }),
    );
  });

  it("denies another user from updating someone else's message", async () => {
    await seedDoc("messages", "msg-1", "alice");
    await assertFails(
      updateDoc(doc(db("bob"), "messages", "msg-1"), { status: "sent" }),
    );
  });

  it("allows owner to delete their own message", async () => {
    await seedDoc("messages", "msg-1", "alice");
    await assertSucceeds(deleteDoc(doc(db("alice"), "messages", "msg-1")));
  });

  it("denies another user from deleting someone else's message", async () => {
    await seedDoc("messages", "msg-1", "alice");
    await assertFails(deleteDoc(doc(db("bob"), "messages", "msg-1")));
  });
});
