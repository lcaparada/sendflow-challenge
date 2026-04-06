import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MessagesPage from "../../modules/messages/messages.page";
import type { ContactType, MessageType } from "../../modules";

vi.mock("../../hooks", () => ({
  useAuth: () => ({ user: { uid: "user-1" } }),
  useObservable: vi.fn(),
}));

vi.mock("../../lib/firebase", () => ({
  auth: { currentUser: { uid: "user-1" } },
  db: {},
}));

vi.mock("../../modules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../modules")>();
  return {
    ...actual,
    useMessages: vi.fn(),
    useContacts: vi.fn(),
    createMessage: vi.fn().mockResolvedValue(undefined),
    updateMessage: vi.fn().mockResolvedValue(undefined),
    deleteMessage: vi.fn().mockResolvedValue(undefined),
  };
});

import {
  useMessages,
  useContacts,
  createMessage,
  deleteMessage,
} from "../../modules";

const makeContact = (overrides: Partial<ContactType> = {}): ContactType => ({
  id: "contact-1",
  userId: "user-1",
  connectionId: "conn-1",
  name: "Alice",
  phone: "+55 11 91234-5678",
  createdAt: new Date(),
  ...overrides,
});

const makeMessage = (overrides: Partial<MessageType> = {}): MessageType => ({
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
  messages: MessageType[] = [],
  contacts: ContactType[] = [],
  loading = false,
) => {
  vi.mocked(useMessages).mockReturnValue([messages, loading, null]);
  vi.mocked(useContacts).mockReturnValue([contacts, false, null]);
  return render(
    <MemoryRouter initialEntries={["/connections/conn-1/messages"]}>
      <Routes>
        <Route
          path="/connections/:connectionId/messages"
          element={<MessagesPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading indicator while fetching", () => {
    renderWithData([], [], true);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows empty state when there are no messages", () => {
    renderWithData([], []);
    expect(
      screen.getByText(/nenhuma mensagem encontrada/i),
    ).toBeInTheDocument();
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

  it("calls useMessages with 'scheduled' status when tab is selected", async () => {
    renderWithData([]);
    fireEvent.click(screen.getByRole("tab", { name: /agendadas/i }));

    await waitFor(() => {
      expect(useMessages).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        "scheduled",
      );
    });
  });

  it("calls useMessages with 'sent' status when tab is selected", async () => {
    renderWithData([]);
    fireEvent.click(screen.getByRole("tab", { name: /enviadas/i }));

    await waitFor(() => {
      expect(useMessages).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        "sent",
      );
    });
  });

  it("calls useMessages with undefined status on 'all' tab", async () => {
    renderWithData([]);
    fireEvent.click(screen.getByRole("tab", { name: /agendadas/i }));
    fireEvent.click(screen.getByRole("tab", { name: /todas/i }));

    await waitFor(() => {
      expect(useMessages).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Number),
        undefined,
      );
    });
  });

  it("does not show edit button for sent messages", () => {
    renderWithData([makeMessage({ status: "sent" })]);
    expect(
      screen.queryByRole("button", { name: /editar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows edit button for scheduled messages", () => {
    renderWithData([makeMessage({ status: "scheduled" })]);
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("opens create dialog when clicking the button", async () => {
    renderWithData([], []);
    fireEvent.click(
      screen.getAllByRole("button", { name: /nova mensagem/i })[0],
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("calls createMessage with correct data", async () => {
    const contact = makeContact({ id: "contact-1", name: "Alice" });
    renderWithData([], [contact]);

    fireEvent.click(
      screen.getAllByRole("button", { name: /nova mensagem/i })[0],
    );
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
        "conn-1",
        ["contact-1"],
        "Test content",
        expect.any(Date),
      );
    });
  });

  it("opens confirm dialog when clicking delete", async () => {
    renderWithData([makeMessage({ id: "msg-1" })]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/excluir mensagem/i)).toBeInTheDocument();
    });
  });

  it("calls deleteMessage after confirm", async () => {
    renderWithData([makeMessage({ id: "msg-1" })]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => screen.getByRole("dialog"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(deleteMessage).toHaveBeenCalledWith("msg-1");
    });
  });

  it("does not delete when confirm dialog is cancelled", async () => {
    renderWithData([makeMessage()]);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => screen.getByRole("dialog"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /cancelar/i }));

    expect(deleteMessage).not.toHaveBeenCalled();
  });
});
