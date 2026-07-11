import { describe, it, expect } from "vitest";
import { updatePoints } from "./animation";
import { resolveConfig } from "./presets";
import type { GridPoint, PointerState } from "./types";

const point = (overrides: Partial<GridPoint> = {}): GridPoint => ({
  ox: 100,
  oy: 100,
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  row: 0,
  col: 0,
  ...overrides,
});

const idlePointer: PointerState = { x: 0, y: 0, active: false, hasPointer: false };

describe("updatePoints", () => {
  it("springs a displaced point back toward its origin", () => {
    const p = point({ x: 150 }); // pulled 50px right of origin
    updatePoints([p], idlePointer, resolveConfig({}));
    // Spring accelerates it back toward ox=100, so x decreases.
    expect(p.x).toBeLessThan(150);
    expect(p.vx).toBeLessThan(0);
  });

  it("attracts nearby points toward an active pointer", () => {
    const p = point();
    const pointer: PointerState = { x: 150, y: 100, active: true, hasPointer: true };
    updatePoints([p], pointer, resolveConfig({ mode: "attract" }));
    expect(p.x).toBeGreaterThan(100); // moved toward the pointer at x=150
  });

  it("repels nearby points away from an active pointer", () => {
    const p = point();
    const pointer: PointerState = { x: 150, y: 100, active: true, hasPointer: true };
    updatePoints([p], pointer, resolveConfig({ mode: "repel" }));
    expect(p.x).toBeLessThan(100); // pushed away from the pointer at x=150
  });

  it("ignores pointers outside the influence radius", () => {
    const config = resolveConfig({ radius: 50, mode: "attract" });
    const p = point();
    const farPointer: PointerState = { x: 400, y: 400, active: true, hasPointer: true };
    updatePoints([p], farPointer, config);
    // Only the (zero) spring force applies — the point stays put.
    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });

  it("bleeds off velocity via damping", () => {
    const config = resolveConfig({});
    const p = point({ vx: 10, vy: 0 });
    updatePoints([p], idlePointer, config);
    // Damping (< 1) plus the inward spring keep the new speed below the original.
    expect(Math.abs(p.vx)).toBeLessThan(10);
  });
});
