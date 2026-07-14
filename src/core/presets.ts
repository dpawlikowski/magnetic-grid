import type {
  MagneticGridConfig,
  MagneticGridPreset,
} from "./types";

export const defaultConfig: MagneticGridConfig = {
  variant: "mesh",
  density: 32,
  radius: 160,
  strength: 18,
  falloff: 2,
  mode: "attract",
  returnSpeed: 0.08,
  damping: 0.86,
  lineWidth: 1,
  dotSize: 2,
  color: "rgba(242, 247, 255, 0.68)",
  background: "#07090d",
  interactive: true,
  ghostCursor: true,
  respectReducedMotion: true,
};

export const presets: Record<MagneticGridPreset, Partial<MagneticGridConfig>> = {
  silk: {
    variant: "mesh",
    density: 28,
    radius: 180,
    strength: 14,
    damping: 0.88,
    returnSpeed: 0.07,
    color: "rgba(236, 246, 255, 0.58)",
    background: "#080a0f",
    lineWidth: 0.9,
  },
  gravity: {
    variant: "mesh",
    density: 34,
    radius: 220,
    strength: 28,
    damping: 0.82,
    returnSpeed: 0.055,
    color: "rgba(186, 226, 255, 0.68)",
    background: "#070b12",
    lineWidth: 1,
  },
  neon: {
    variant: "lines",
    density: 26,
    radius: 170,
    strength: 22,
    damping: 0.84,
    returnSpeed: 0.065,
    color: "rgba(92, 255, 214, 0.76)",
    background: "#06090a",
    lineWidth: 1.1,
  },
  calm: {
    variant: "dots",
    density: 30,
    radius: 130,
    strength: 10,
    damping: 0.9,
    returnSpeed: 0.09,
    color: "rgba(255, 245, 220, 0.66)",
    background: "#10100d",
    dotSize: 1.8,
  },
};

/**
 * Inclusive `{ min, max }` bounds for every numeric config field. This is the
 * single source of truth for the tunable surface — `resolveConfig` clamps to
 * it, and UIs (e.g. the demo control panel) should read slider ranges from here
 * rather than hard-coding their own numbers.
 */
export const CONFIG_LIMITS = {
  density: { min: 12, max: 96 },
  radius: { min: 24, max: 520 },
  strength: { min: 0, max: 90 },
  falloff: { min: 0.75, max: 5 },
  returnSpeed: { min: 0.01, max: 0.24 },
  damping: { min: 0.55, max: 0.98 },
  lineWidth: { min: 0.2, max: 6 },
  dotSize: { min: 0.5, max: 12 },
} as const satisfies Record<string, { min: number; max: number }>;

type ClampedField = keyof typeof CONFIG_LIMITS;

const clampToLimit = (value: number, field: ClampedField): number => {
  const { min, max } = CONFIG_LIMITS[field];
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
};

export const resolveConfig = (
  props: Partial<MagneticGridConfig> & { preset?: MagneticGridPreset },
): MagneticGridConfig => {
  const preset = props.preset ? presets[props.preset] : undefined;
  const cleanProps = Object.fromEntries(
    Object.entries(props).filter(([_, value]) => value !== undefined)
  );
  const merged = { ...defaultConfig, ...preset, ...cleanProps } as MagneticGridConfig;

  return {
    ...merged,
    density: clampToLimit(merged.density, "density"),
    radius: clampToLimit(merged.radius, "radius"),
    strength: clampToLimit(merged.strength, "strength"),
    falloff: clampToLimit(merged.falloff, "falloff"),
    returnSpeed: clampToLimit(merged.returnSpeed, "returnSpeed"),
    damping: clampToLimit(merged.damping, "damping"),
    lineWidth: clampToLimit(merged.lineWidth, "lineWidth"),
    dotSize: clampToLimit(merged.dotSize, "dotSize"),
  };
};
