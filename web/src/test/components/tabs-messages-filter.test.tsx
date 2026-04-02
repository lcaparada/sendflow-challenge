import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabsMessagesFilter } from "../../components/messages/tabs-messages-filter";

describe("TabsMessagesFilter", () => {
  it("renders all three tabs", () => {
    render(<TabsMessagesFilter filter="all" onSelectFilter={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /todas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /agendadas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /enviadas/i })).toBeInTheDocument();
  });

  it("marks the active tab based on filter prop", () => {
    render(<TabsMessagesFilter filter="scheduled" onSelectFilter={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /agendadas/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /todas/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onSelectFilter with 'scheduled' when tab is clicked", () => {
    const onSelectFilter = vi.fn();
    render(<TabsMessagesFilter filter="all" onSelectFilter={onSelectFilter} />);
    fireEvent.click(screen.getByRole("tab", { name: /agendadas/i }));
    expect(onSelectFilter).toHaveBeenCalledWith("scheduled");
  });

  it("calls onSelectFilter with 'sent' when tab is clicked", () => {
    const onSelectFilter = vi.fn();
    render(<TabsMessagesFilter filter="all" onSelectFilter={onSelectFilter} />);
    fireEvent.click(screen.getByRole("tab", { name: /enviadas/i }));
    expect(onSelectFilter).toHaveBeenCalledWith("sent");
  });

  it("calls onSelectFilter with 'all' when tab is clicked", () => {
    const onSelectFilter = vi.fn();
    render(<TabsMessagesFilter filter="scheduled" onSelectFilter={onSelectFilter} />);
    fireEvent.click(screen.getByRole("tab", { name: /todas/i }));
    expect(onSelectFilter).toHaveBeenCalledWith("all");
  });
});
