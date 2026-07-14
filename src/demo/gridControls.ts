import type {
  MagneticGridMode,
  MagneticGridPreset,
  MagneticGridVariant,
} from "../core/types";

// Tuning values and control ranges for the demo playground. Extracted from
// App.tsx so the point-count maths is unit-testable and the initial state /
// slider bounds read as named intent rather than inline magic numbers.

/** Angular speed of the auto-orbiting "ghost" cursor when the pointer is idle. */
export const GHOST_CURSOR_SPEED = 0.00028;

/** Source repository, linked from the demo header. */
export const GITHUB_REPO_URL = "https://github.com/dpawlikowski/magnetic-grid";

/** Initial control state the playground opens with. */
export const INITIAL_CONTROLS = {
  preset: "gravity" as MagneticGridPreset,
  variant: "mesh" as MagneticGridVariant,
  mode: "attract" as MagneticGridMode,
  radius: 210,
  strength: 24,
  density: 30,
};

/** Inclusive [min, max] bounds (and step) for each slider. */
export const SLIDER_RANGES = {
  radius: { min: 60, max: 320 },
  strength: { min: 0, max: 50 },
  density: { min: 18, max: 56 },
} as const;

/**
 * Rough number of grid points that fit the viewport at a given `density`
 * (the spacing, in px, between points on both axes). Purely informational —
 * it drives the "estimated points" meter in the header.
 */
export const estimatePointCount = (
  viewportWidth: number,
  viewportHeight: number,
  density: number,
): number => {
  if (density <= 0) return 0;
  return Math.round((viewportWidth * viewportHeight) / (density * density));
};
