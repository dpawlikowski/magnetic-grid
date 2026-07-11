import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { App } from "./App";
import { INITIAL_CONTROLS, estimatePointCount } from "./gridControls";

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
});
