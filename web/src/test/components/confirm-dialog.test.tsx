import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "../../components/confirm-dialog";

const defaultProps = {
  open: true,
  loading: false,
  title: "Excluir item",
  description: "Tem certeza que deseja excluir?",
  onClose: vi.fn(),
  onConfirm: vi.fn().mockResolvedValue(undefined),
};

describe("ConfirmDialog", () => {
  it("renders title and description", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Excluir item")).toBeInTheDocument();
    expect(screen.getByText("Tem certeza que deseja excluir?")).toBeInTheDocument();
  });

  it("renders default confirm label 'Excluir'", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: /excluir/i })).toBeInTheDocument();
  });

  it("renders custom confirm label when provided", () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Remover" />);
    expect(screen.getByRole("button", { name: /remover/i })).toBeInTheDocument();
  });

  it("does not render dialog content when open is false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("shows loading spinner when loading", () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
