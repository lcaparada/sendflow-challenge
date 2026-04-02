import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../../components/empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Nada aqui"
        description="Crie seu primeiro item"
      />,
    );
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Crie seu primeiro item")).toBeInTheDocument();
  });

  it("renders icon content", () => {
    render(
      <EmptyState
        icon={<span data-testid="my-icon">icon</span>}
        title="T"
        description="D"
      />,
    );
    expect(screen.getByTestId("my-icon")).toBeInTheDocument();
  });

  it("does not render add button when onAdd and addLabel are not provided", () => {
    render(<EmptyState icon={<span />} title="T" description="D" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render add button when only addLabel is provided", () => {
    render(
      <EmptyState icon={<span />} title="T" description="D" addLabel="Adicionar" />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders add button when both addLabel and onAdd are provided", () => {
    render(
      <EmptyState
        icon={<span />}
        title="T"
        description="D"
        addLabel="Novo item"
        onAdd={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /novo item/i })).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", () => {
    const onAdd = vi.fn();
    render(
      <EmptyState
        icon={<span />}
        title="T"
        description="D"
        addLabel="Novo item"
        onAdd={onAdd}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /novo item/i }));
    expect(onAdd).toHaveBeenCalledOnce();
  });
});
