import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MessagesPage from "../../web/pages/MessagesPage";
import type { Contact, Message } from "../../types";

vi.mock("../../web/hooks/useAuth", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
}));

vi.mock("../../functions", () => ({
  subscribeToMessages: vi.fn(),
  subscribeToContacts: vi.fn(),
  createMessage: vi.fn().mockResolvedValue(undefined),
  updateMessage: vi.fn().mockResolvedValue(undefined),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
  startMessageScheduler: vi.fn().mockReturnValue(vi.fn()),
}));

import {
  subscribeToMessages,
  subscribeToContacts,
  createMessage,
  deleteMessage,
} from "../../functions";

const makeContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: "contact-1",
  userId: "user-1",
  connectionId: "conn-1",
  name: "Alice",
  phone: "+55 11 91234-5678",
  createdAt: new Date(),
  ...overrides,
});

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  userId: "user-1",
  connectionId: "conn-1",
  contactIds: ["contact-1"],
  content: "Hello world",
  status: "scheduled",
  scheduledAt: new Date("2030-01-01T10:00:00"),
  createdAt: new Date(),
  ...overrides,
});

const renderWithData = (
  messages: Message[] = [],
  contacts: Contact[] = [],
) => {
  vi.mocked(subscribeToMessages).mockImplementation((_uid, _connId, callback) => {
    callback(messages);
    return vi.fn();
  });
  vi.mocked(subscribeToContacts).mockImplementation((_uid, _connId, callback) => {
    callback(contacts);
    return vi.fn();
  });
  return render(
    <MemoryRouter initialEntries={["/connections/conn-1/messages"]}>
      <Routes>
        <Route path="/connections/:connectionId/messages" element={<MessagesPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when there are no messages", () => {
    renderWithData([], []);
    expect(screen.getByText(/nenhuma mensagem encontrada/i)).toBeInTheDocument();
  });

  it("renders a list of messages", () => {
    renderWithData([
      makeMessage({ id: "1", content: "First message" }),
      makeMessage({ id: "2", content: "Second message" }),
    ]);
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });

  it("shows correct chip for scheduled messages", () => {
    renderWithData([makeMessage({ status: "scheduled" })]);
    expect(screen.getByText("Agendada")).toBeInTheDocument();
  });

  it("shows correct chip for sent messages", () => {
    renderWithData([makeMessage({ status: "sent" })]);
    expect(screen.getByText("Enviada")).toBeInTheDocument();
  });

  it("filters to show only scheduled messages", async () => {
    renderWithData([
      makeMessage({ id: "1", content: "Scheduled msg", status: "scheduled" }),
      makeMessage({ id: "2", content: "Sent msg", status: "sent" }),
    ]);

    fireEvent.click(screen.getByRole("tab", { name: /agendadas/i }));

    await waitFor(() => {
      expect(screen.getByText("Scheduled msg")).toBeInTheDocument();
      expect(screen.queryByText("Sent msg")).not.toBeInTheDocument();
    });
  });

  it("filters to show only sent messages", async () => {
    renderWithData([
      makeMessage({ id: "1", content: "Scheduled msg", status: "scheduled" }),
      makeMessage({ id: "2", content: "Sent msg", status: "sent" }),
    ]);

    fireEvent.click(screen.getByRole("tab", { name: /enviadas/i }));

    await waitFor(() => {
      expect(screen.getByText("Sent msg")).toBeInTheDocument();
      expect(screen.queryByText("Scheduled msg")).not.toBeInTheDocument();
    });
  });

  it("opens create dialog when clicking the button", async () => {
    renderWithData([], []);
    fireEvent.click(screen.getAllByRole("button", { name: /nova mensagem/i })[0]);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("does not show edit button for sent messages", () => {
    renderWithData([makeMessage({ status: "sent" })]);
    expect(screen.queryByTitle("Editar")).not.toBeInTheDocument();
  });

  it("shows edit button for scheduled messages", () => {
    renderWithData([makeMessage({ status: "scheduled" })]);
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
  });

  it("calls createMessage with correct data", async () => {
    const contact = makeContact({ id: "contact-1", name: "Alice" });
    renderWithData([], [contact]);

    fireEvent.click(screen.getAllByRole("button", { name: /nova mensagem/i })[0]);
    await waitFor(() => screen.getByRole("textbox", { name: /mensagem/i }));

    fireEvent.change(screen.getByRole("textbox", { name: /mensagem/i }), {
      target: { value: "Test content" },
    });
    fireEvent.change(screen.getByDisplayValue(""), {
      target: { value: "2030-06-01T10:00" },
    });
    fireEvent.click(screen.getByLabelText(/alice/i));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(createMessage).toHaveBeenCalledWith(
        "user-1",
        "conn-1",
        ["contact-1"],
        "Test content",
        expect.any(Date),
      );
    });
  });

  it("calls deleteMessage after confirm", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithData([makeMessage({ id: "msg-1" })]);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => {
      expect(deleteMessage).toHaveBeenCalledWith("msg-1");
    });
  });

  it("does not delete when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithData([makeMessage()]);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(deleteMessage).not.toHaveBeenCalled();
  });
});
