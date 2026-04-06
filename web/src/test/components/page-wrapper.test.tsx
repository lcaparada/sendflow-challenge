import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageWrapper } from "../../components/page-wrapper/PageWrapper";

describe("PageWrapper", () => {
  it("renders title and description", () => {
    render(
      <PageWrapper title="Conexões" description="3 conexões cadastradas">
        <div>content</div>
      </PageWrapper>,
    );
    expect(screen.getByText("Conexões")).toBeInTheDocument();
    expect(screen.getByText("3 conexões cadastradas")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <PageWrapper title="T" description="D">
        <div>child content</div>
      </PageWrapper>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <PageWrapper
        title="T"
        description="D"
        button={{ icon: <span />, label: "Nova conexão", onClick: vi.fn() }}
      >
        <div />
      </PageWrapper>,
    );
    expect(
      screen.getByRole("button", { name: /nova conexão/i }),
    ).toBeInTheDocument();
  });

  it("calls button onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <PageWrapper
        title="T"
        description="D"
        button={{ icon: <span />, label: "Nova conexão", onClick }}
      >
        <div />
      </PageWrapper>,
    );
    fireEvent.click(screen.getByRole("button", { name: /nova conexão/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not render action button when not provided", () => {
    render(
      <PageWrapper title="T" description="D">
        <div />
      </PageWrapper>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders search field when search.show is true", () => {
    render(
      <PageWrapper
        title="T"
        description="D"
        search={{
          value: "",
          onChange: vi.fn(),
          placeholder: "Buscar...",
          show: true,
        }}
      >
        <div />
      </PageWrapper>,
    );
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("does not render search field when search.show is false", () => {
    render(
      <PageWrapper
        title="T"
        description="D"
        search={{
          value: "",
          onChange: vi.fn(),
          placeholder: "Buscar...",
          show: false,
        }}
      >
        <div />
      </PageWrapper>,
    );
    expect(screen.queryByPlaceholderText("Buscar...")).not.toBeInTheDocument();
  });

  it("calls search.onChange when typing in search field", () => {
    const onChange = vi.fn();
    render(
      <PageWrapper
        title="T"
        description="D"
        search={{ value: "", onChange, placeholder: "Buscar...", show: true }}
      >
        <div />
      </PageWrapper>,
    );
    fireEvent.change(screen.getByPlaceholderText("Buscar..."), {
      target: { value: "texto" },
    });
    expect(onChange).toHaveBeenCalledWith("texto");
  });
});
