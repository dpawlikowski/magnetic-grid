import type { GridPoint, MagneticGridConfig, PointerState } from "./types";

const EPSILON = 0.0001;

export const updatePoints = (
  points: GridPoint[],
  pointer: PointerState,
  config: MagneticGridConfig,
) => {
  const radiusSquared = config.radius * config.radius;
  const direction = config.mode === "attract" ? 1 : -1;

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const springX = (point.ox - point.x) * config.returnSpeed;
    const springY = (point.oy - point.y) * config.returnSpeed;

    point.vx += springX;
    point.vy += springY;

    if (pointer.active) {
      const dx = pointer.x - point.x;
      const dy = pointer.y - point.y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared < radiusSquared && distSquared > EPSILON) {
        const dist = Math.sqrt(distSquared);
        const influence = (1 - dist / config.radius) ** config.falloff;
        const force = influence * config.strength * direction;

        point.vx += (dx / dist) * force;
        point.vy += (dy / dist) * force;
      }
    }

    point.vx *= config.damping;
    point.vy *= config.damping;
    point.x += point.vx;
    point.y += point.vy;
  }
};
