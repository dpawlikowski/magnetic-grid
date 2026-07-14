import type { CSSProperties } from "react";

export type MagneticGridVariant = "dots" | "lines" | "mesh" | "custom";
export type MagneticGridMode = "attract" | "repel";
export type MagneticGridPreset = "silk" | "gravity" | "neon" | "calm";

export type GridPoint = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  col: number;
};

export type GridEdge = {
  from: number;
  to: number;
};

export type GridData = {
  points: GridPoint[];
  edges: GridEdge[];
  rows: number;
  cols: number;
};

export type PointerState = {
  x: number;
  y: number;
  active: boolean;
  hasPointer: boolean;
};

export type GhostCursorOptions = {
  enabled?: boolean;
  speed?: number;
  radius?: number;
};

export type MagneticGridConfig = {
  variant: MagneticGridVariant;
  density: number;
  radius: number;
  strength: number;
  falloff: number;
  mode: MagneticGridMode;
  returnSpeed: number;
  damping: number;
  color: string;
  background: string;
  lineWidth: number;
  dotSize: number;
  interactive: boolean;
  ghostCursor: boolean | GhostCursorOptions;
  respectReducedMotion: boolean;
};

export type RenderContext = {
  ctx: CanvasRenderingContext2D;
  points: GridPoint[];
  edges: GridEdge[];
  width: number;
  height: number;
  time: number;
  config: MagneticGridConfig;
};

export type CustomRenderer = (context: RenderContext) => void;

export type FrameStats = {
  /** `requestAnimationFrame` timestamp for this frame, in ms. */
  time: number;
  /** Milliseconds since the previous frame (0 on the very first frame). */
  delta: number;
  /** Number of points currently in the grid. */
  pointCount: number;
};

export type MagneticGridProps = Partial<MagneticGridConfig> & {
  preset?: MagneticGridPreset;
  className?: string;
  style?: CSSProperties;
  renderCustom?: CustomRenderer;
  "aria-label"?: string;
  /** Called once per animation frame — handy for an FPS readout or other telemetry. */
  onFrame?: (stats: FrameStats) => void;
};

export type CanvasSize = {
  width: number;
  height: number;
  dpr: number;
};
