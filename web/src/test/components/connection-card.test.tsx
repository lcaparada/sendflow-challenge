import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectionCard } from "../../components/connection-card/ConnectionCard";
import type { ConnectionType } from "../../modules";

const makeConnection = (overrides: Partial<ConnectionType> = {}): ConnectionType => ({
  id: "conn-1",
  userId: "user-1",
  name: "Minha Conexão",
  createdAt: new Date("2024-06-15"),
  ...overrides,
});

describe("ConnectionCard", () => {
  it("renders connection name", () => {
    render(
      <ConnectionCard
        connection={makeConnection()}
        index={0}
        onClick={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Minha Conexão")).toBeInTheDocument();
  });

  it("renders the creation date label", () => {
    render(
      <ConnectionCard
        connection={makeConnection({ createdAt: new Date("2024-06-15T12:00:00") })}
        index={0}
        onClick={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/Criada em/)).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const onClick = vi.fn();
    render(
      <ConnectionCard
        connection={makeConnection()}
        index={0}
        onClick={onClick}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Minha Conexão"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("calls onEdit with the connection when edit button is clicked", () => {
    const onEdit = vi.fn();
    const connection = makeConnection();
    render(
      <ConnectionCard
        connection={connection}
        index={0}
        onClick={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(connection);
  });

  it("calls onDelete with connection id when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <ConnectionCard
        connection={makeConnection({ id: "conn-1" })}
        index={0}
        onClick={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onDelete).toHaveBeenCalledWith("conn-1");
  });

  it("does not call onClick when edit button is clicked", () => {
    const onClick = vi.fn();
    render(
      <ConnectionCard
        connection={makeConnection()}
        index={0}
        onClick={onClick}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /editar/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows 'Ativa' chip", () => {
    render(
      <ConnectionCard
        connection={makeConnection()}
        index={0}
        onClick={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Ativa")).toBeInTheDocument();
  });
});
