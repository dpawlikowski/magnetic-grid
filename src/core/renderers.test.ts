import { describe, it, expect, vi } from "vitest";
import { renderGrid } from "./renderers";
import { resolveConfig } from "./presets";
import type { GridPoint, MagneticGridVariant, RenderContext } from "./types";

const mockCtx = () =>
  ({
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    stroke: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    lineJoin: "miter",
  }) as unknown as CanvasRenderingContext2D;

const samplePoint = (x: number, y: number): GridPoint => ({
  ox: x,
  oy: y,
  x,
  y,
  vx: 0,
  vy: 0,
  row: 0,
  col: 0,
});

const context = (variant: MagneticGridVariant, ctx: CanvasRenderingContext2D): RenderContext => ({
  ctx,
  points: [samplePoint(0, 0), samplePoint(10, 0)],
  edges: [{ from: 0, to: 1 }],
  width: 100,
  height: 100,
  time: 0,
  config: resolveConfig({ variant }),
});

describe("renderGrid", () => {
  it("always paints the background first", () => {
    const ctx = mockCtx();
    renderGrid(context("mesh", ctx));
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
  });

  it("draws arcs for the dots variant", () => {
    const ctx = mockCtx();
    renderGrid(context("dots", ctx));
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("strokes edges for the mesh variant", () => {
    const ctx = mockCtx();
    renderGrid(context("mesh", ctx));
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("delegates to a custom renderer for the custom variant", () => {
    const ctx = mockCtx();
    const custom = vi.fn();
    renderGrid(context("custom", ctx), custom);
    expect(custom).toHaveBeenCalledTimes(1);
    // The built-in mesh/dots paths must not also run.
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("falls back to mesh when the custom variant has no renderer", () => {
    const ctx = mockCtx();
    renderGrid(context("custom", ctx));
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
