import { describe, it, expect } from "vitest";
import { estimatePointCount, SLIDER_RANGES, INITIAL_CONTROLS } from "./gridControls";

describe("estimatePointCount", () => {
  it("is viewport area divided by density squared, rounded", () => {
    // 1000×800 area, density 20 -> 800000 / 400 = 2000 points.
    expect(estimatePointCount(1000, 800, 20)).toBe(2000);
  });

  it("rounds to the nearest whole point", () => {
    // 1024×768 / 30^2 = 873.81… -> 874
    expect(estimatePointCount(1024, 768, 30)).toBe(874);
  });

  it("falls to fewer points as density (spacing) grows", () => {
    const dense = estimatePointCount(1000, 1000, 20);
    const sparse = estimatePointCount(1000, 1000, 40);
    expect(sparse).toBeLessThan(dense);
  });

  it("returns 0 for a non-positive density instead of dividing by zero", () => {
    expect(estimatePointCount(1000, 800, 0)).toBe(0);
    expect(estimatePointCount(1000, 800, -5)).toBe(0);
  });
});

describe("control configuration", () => {
  it("opens with initial control values inside their slider ranges", () => {
    const within = (v: number, { min, max }: { min: number; max: number }) =>
      v >= min && v <= max;
    expect(within(INITIAL_CONTROLS.radius, SLIDER_RANGES.radius)).toBe(true);
    expect(within(INITIAL_CONTROLS.strength, SLIDER_RANGES.strength)).toBe(true);
    expect(within(INITIAL_CONTROLS.density, SLIDER_RANGES.density)).toBe(true);
  });
});
