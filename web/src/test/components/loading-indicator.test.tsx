import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingIndicator } from "../../components/loading-indicator/LoadingIndicator";

describe("LoadingIndicator", () => {
  it("renders a progressbar", () => {
    render(<LoadingIndicator />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
