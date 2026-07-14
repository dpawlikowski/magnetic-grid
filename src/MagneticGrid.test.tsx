import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MagneticGrid } from "./MagneticGrid";

// jsdom has no 2D canvas backend; silence its "Not implemented" noise. The
// component already guards on a null context, so the render effect no-ops.
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

afterEach(cleanup);

describe("<MagneticGrid>", () => {
  it("renders an accessible canvas with a default label", () => {
    render(<MagneticGrid />);
    const canvas = screen.getByRole("img");
    expect(canvas.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-label", "Interactive magnetic grid");
  });

  it("honours a custom aria-label", () => {
    render(<MagneticGrid aria-label="Hero backdrop" />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Hero backdrop");
  });

  it("merges a custom className and style onto the container", () => {
    const { container } = render(<MagneticGrid className="hero" style={{ opacity: 0.5 }} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("hero");
    expect(wrapper.style.opacity).toBe("0.5");
    // The base container styling is preserved alongside the override.
    expect(wrapper.style.position).toBe("relative");
  });

  it("disables touch scrolling on the canvas so pointer tracking works", () => {
    render(<MagneticGrid />);
    expect(screen.getByRole("img")).toHaveStyle({ touchAction: "none" });
  });

  it("reports per-frame stats through onFrame once the animation loop runs", async () => {
    // Give this mount a real (mock) 2D context so the rAF loop actually
    // ticks instead of bailing out on the module-level null context.
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      stroke: vi.fn(),
      setTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValueOnce(mockCtx);

    const onFrame = vi.fn();
    render(<MagneticGrid onFrame={onFrame} />);

    await vi.waitFor(() => {
      expect(onFrame).toHaveBeenCalled();
    });

    const [stats] = onFrame.mock.calls[0];
    expect(stats.pointCount).toBeGreaterThan(0);
    expect(stats.delta).toBe(0); // first frame has no prior timestamp to diff against
    expect(typeof stats.time).toBe("number");
  });
});
