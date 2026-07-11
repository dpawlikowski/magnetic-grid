import { describe, it, expect } from "vitest";
import { createGrid } from "./grid";

describe("createGrid", () => {
  it("lays points out on a rows × cols lattice", () => {
    const grid = createGrid(200, 100, 50);
    expect(grid.points).toHaveLength(grid.rows * grid.cols);
    expect(grid.rows).toBeGreaterThanOrEqual(2);
    expect(grid.cols).toBeGreaterThanOrEqual(2);
  });

  it("anchors each point at its origin with zero velocity", () => {
    const { points } = createGrid(120, 120, 40);
    for (const point of points) {
      expect(point.x).toBe(point.ox);
      expect(point.y).toBe(point.oy);
      expect(point.vx).toBe(0);
      expect(point.vy).toBe(0);
    }
  });

  it("spans the full canvas, from the origin to the far corner", () => {
    const width = 300;
    const height = 150;
    const { points } = createGrid(width, height, 50);

    const first = points[0];
    const last = points[points.length - 1];
    expect(first.x).toBe(0);
    expect(first.y).toBe(0);
    expect(last.x).toBeCloseTo(width);
    expect(last.y).toBeCloseTo(height);
  });

  it("connects every point to its right and lower neighbour", () => {
    const { edges, rows, cols } = createGrid(200, 200, 50);
    const horizontal = rows * (cols - 1);
    const vertical = (rows - 1) * cols;
    expect(edges).toHaveLength(horizontal + vertical);
  });

  it("caps the point count for very dense grids", () => {
    // A naive 4000×4000 / 4px grid would be ~1M points; the cap keeps it bounded.
    const { points } = createGrid(4000, 4000, 4);
    expect(points.length).toBeLessThan(6000);
  });

  it("stays valid for degenerate (zero) dimensions", () => {
    const grid = createGrid(0, 0, 32);
    expect(grid.rows).toBeGreaterThanOrEqual(2);
    expect(grid.cols).toBeGreaterThanOrEqual(2);
    expect(grid.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  });
});
