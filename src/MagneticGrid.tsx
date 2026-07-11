import {
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { updatePoints } from "./core/animation";
import { resizeCanvas } from "./core/canvas";
import { createGrid } from "./core/grid";
import { resolveConfig } from "./core/presets";
import { renderGrid } from "./core/renderers";
import type {
  CanvasSize,
  GridData,
  MagneticGridProps,
  PointerState,
} from "./core/types";

const containerStyle = {
  position: "relative",
  overflow: "hidden",
  width: "100%",
  height: "100%",
} as const;

const canvasStyle = {
  display: "block",
  width: "100%",
  height: "100%",
  touchAction: "none",
} as const;

const getRelativePoint = (
  event: ReactPointerEvent<HTMLCanvasElement>,
  element: HTMLCanvasElement,
) => {
  const rect = element.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

/**
 * Ghost-cursor idle animation — traces a gentle Lissajous loop around the
 * canvas centre while no real pointer is present, so the grid is never static.
 */
const GHOST_CURSOR = {
  /** Angular speed (radians per ms) of the orbit. */
  defaultSpeed: 0.00035,
  /** Orbit radius as a fraction of the canvas's smaller dimension. */
  radiusFraction: 0.26,
  /** Vertical frequency multiplier — an irrational-ish ratio keeps the path from repeating tightly. */
  verticalFrequencyRatio: 1.37,
  /** Vertical amplitude scale, flattening the orbit into a wider ellipse. */
  verticalAmplitudeScale: 0.72,
} as const;

const HALF = 0.5;

const shouldReduceMotion = (respectReducedMotion: boolean) => {
  if (!respectReducedMotion || typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const updateGhostPointer = (
  pointer: PointerState,
  size: CanvasSize,
  time: number,
  ghostCursor: MagneticGridProps["ghostCursor"],
) => {
  const options = typeof ghostCursor === "object" ? ghostCursor : undefined;

  if (ghostCursor === false || options?.enabled === false) {
    pointer.active = false;
    return;
  }

  const speed = options?.speed ?? GHOST_CURSOR.defaultSpeed;
  const radius =
    options?.radius ?? Math.min(size.width, size.height) * GHOST_CURSOR.radiusFraction;
  const cx = size.width * HALF;
  const cy = size.height * HALF;

  pointer.x = cx + Math.cos(time * speed) * radius;
  pointer.y =
    cy +
    Math.sin(time * speed * GHOST_CURSOR.verticalFrequencyRatio) *
      radius *
      GHOST_CURSOR.verticalAmplitudeScale;
  pointer.active = true;
};

export function MagneticGrid({
  className,
  style,
  renderCustom,
  "aria-label": ariaLabel = "Interactive magnetic grid",
  background,
  color,
  damping,
  density,
  dotSize,
  falloff,
  ghostCursor,
  interactive,
  lineWidth,
  mode,
  preset,
  radius,
  respectReducedMotion,
  returnSpeed,
  strength,
  variant,
}: MagneticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<GridData | null>(null);
  const sizeRef = useRef<CanvasSize>({ width: 1, height: 1, dpr: 1 });
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    active: false,
    hasPointer: false,
  });
  const frameRef = useRef<number | null>(null);
  const config = useMemo(
    () =>
      resolveConfig({
        background,
        color,
        damping,
        density,
        dotSize,
        falloff,
        ghostCursor,
        interactive,
        lineWidth,
        mode,
        preset,
        radius,
        respectReducedMotion,
        returnSpeed,
        strength,
        variant,
      }),
    [
      background,
      color,
      damping,
      density,
      dotSize,
      falloff,
      ghostCursor,
      interactive,
      lineWidth,
      mode,
      preset,
      radius,
      respectReducedMotion,
      returnSpeed,
      strength,
      variant,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !parent || !ctx) {
      return undefined;
    }

    let reducedMotion = shouldReduceMotion(config.respectReducedMotion);

    const rebuildGrid = () => {
      const rect = parent.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      sizeRef.current = resizeCanvas(canvas, width, height);
      gridRef.current = createGrid(width, height, config.density);
    };

    const resizeObserver = new ResizeObserver(rebuildGrid);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => {
      reducedMotion = shouldReduceMotion(config.respectReducedMotion);
    };

    rebuildGrid();
    resizeObserver.observe(parent);
    media.addEventListener("change", handleMotionPreference);

    const tick = (time: number) => {
      const grid = gridRef.current;
      const size = sizeRef.current;
      const pointer = pointerRef.current;

      if (!grid) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (!config.interactive || reducedMotion) {
        pointer.active = false;
      } else if (!pointer.hasPointer) {
        updateGhostPointer(pointer, size, time, config.ghostCursor);
      }

      updatePoints(grid.points, pointer, config);
      renderGrid(
        {
          ctx,
          points: grid.points,
          edges: grid.edges,
          width: size.width,
          height: size.height,
          time,
          config,
        },
        renderCustom,
      );

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();
      media.removeEventListener("change", handleMotionPreference);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [config, renderCustom]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!config.interactive) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const point = getRelativePoint(event, canvas);
    pointerRef.current.x = point.x;
    pointerRef.current.y = point.y;
    pointerRef.current.active = true;
    pointerRef.current.hasPointer = true;
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.hasPointer = false;
  };

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel}
        role="img"
        style={canvasStyle}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
      />
    </div>
  );
}
