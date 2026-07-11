import { describe, it, expect } from "vitest";
import { CONFIG_LIMITS, defaultConfig, presets, resolveConfig } from "./presets";

describe("resolveConfig", () => {
  it("returns the defaults when given no props", () => {
    expect(resolveConfig({})).toEqual(defaultConfig);
  });

  it("applies a named preset over the defaults", () => {
    const config = resolveConfig({ preset: "neon" });
    expect(config.variant).toBe(presets.neon.variant);
    expect(config.color).toBe(presets.neon.color);
  });

  it("lets explicit props win over the preset", () => {
    const config = resolveConfig({ preset: "neon", strength: 5 });
    expect(config.strength).toBe(5);
  });

  it("clamps every numeric field to its configured limits", () => {
    const tooHigh = resolveConfig({ density: 1000, radius: 9999, damping: 5 });
    expect(tooHigh.density).toBe(CONFIG_LIMITS.density.max);
    expect(tooHigh.radius).toBe(CONFIG_LIMITS.radius.max);
    expect(tooHigh.damping).toBe(CONFIG_LIMITS.damping.max);

    const tooLow = resolveConfig({ density: -10, strength: -5, dotSize: 0 });
    expect(tooLow.density).toBe(CONFIG_LIMITS.density.min);
    expect(tooLow.strength).toBe(CONFIG_LIMITS.strength.min);
    expect(tooLow.dotSize).toBe(CONFIG_LIMITS.dotSize.min);
  });

  it("falls back to the minimum for NaN values", () => {
    const config = resolveConfig({ density: Number.NaN });
    expect(config.density).toBe(CONFIG_LIMITS.density.min);
  });

  it("keeps every limit's min below its max", () => {
    for (const { min, max } of Object.values(CONFIG_LIMITS)) {
      expect(min).toBeLessThan(max);
    }
  });
});
