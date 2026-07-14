import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { App } from "./App";
import { GITHUB_REPO_URL, INITIAL_CONTROLS, estimatePointCount } from "./gridControls";

// jsdom has no 2D canvas backend; the grid guards on a null context and no-ops.
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

afterEach(cleanup);

describe("<App> (magnetic-grid demo)", () => {
  it("marks the initial preset chip as active", () => {
    render(<App />);
    // "Gravity" is INITIAL_CONTROLS.preset — its chip should carry `active`.
    const gravity = screen.getByRole("button", { name: /Gravity/ });
    expect(gravity).toHaveClass("chip", "active");
    expect(INITIAL_CONTROLS.preset).toBe("gravity");
  });

  it("moves the active state when another preset is chosen", () => {
    render(<App />);
    const neon = screen.getByRole("button", { name: /Neon/ });
    expect(neon).not.toHaveClass("active");

    fireEvent.click(neon);

    expect(neon).toHaveClass("active");
    expect(screen.getByRole("button", { name: /Gravity/ })).not.toHaveClass("active");
  });

  it("toggles between attract and repel modes", () => {
    render(<App />);
    const attract = screen.getByRole("button", { name: "Attract" });
    const repel = screen.getByRole("button", { name: "Repel" });
    expect(attract).toHaveClass("active");

    fireEvent.click(repel);

    expect(repel).toHaveClass("active");
    expect(attract).not.toHaveClass("active");
  });

  it("shows a point estimate matching the formula for the current viewport", () => {
    render(<App />);
    const meter = screen.getByTitle("Estimated points");
    const expected = estimatePointCount(
      window.innerWidth,
      window.innerHeight,
      INITIAL_CONTROLS.density,
    );
    expect(within(meter).getByText(String(expected))).toBeInTheDocument();
  });

  it("marks the active preset, variant, and mode buttons with aria-pressed", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Gravity/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Neon/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Attract" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Repel" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("restores every control to its initial value on reset", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Neon/ }));
    fireEvent.click(screen.getByRole("button", { name: "Repel" }));
    expect(screen.getByRole("button", { name: /Neon/ })).toHaveClass("active");

    fireEvent.click(screen.getByRole("button", { name: /Reset controls/ }));

    expect(screen.getByRole("button", { name: /Gravity/ })).toHaveClass("chip", "active");
    expect(screen.getByRole("button", { name: "Attract" })).toHaveClass(
      "modeButton",
      "active",
    );
  });

  it("links to the project's GitHub repository", () => {
    render(<App />);
    const link = screen.getByRole("link", { name: /View source on GitHub/ });
    expect(link).toHaveAttribute("href", GITHUB_REPO_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows a placeholder FPS reading until the first animation frame reports in", () => {
    render(<App />);
    const meter = screen.getByTitle("Frames per second");
    expect(within(meter).getByText("—")).toBeInTheDocument();
  });
});
