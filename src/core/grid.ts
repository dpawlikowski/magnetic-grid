import type { GridData, GridEdge, GridPoint } from "./types";

const MAX_POINTS = 5000;

export const createGrid = (
  width: number,
  height: number,
  density: number,
): GridData => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const estimatedPoints = Math.ceil(safeWidth / density) * Math.ceil(safeHeight / density);
  const spacing = estimatedPoints > MAX_POINTS
    ? Math.sqrt((safeWidth * safeHeight) / MAX_POINTS)
    : density;
  const cols = Math.max(2, Math.floor(safeWidth / spacing) + 1);
  const rows = Math.max(2, Math.floor(safeHeight / spacing) + 1);
  const xGap = cols === 1 ? safeWidth : safeWidth / (cols - 1);
  const yGap = rows === 1 ? safeHeight : safeHeight / (rows - 1);
  const points: GridPoint[] = [];
  const edges: GridEdge[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * xGap;
      const y = row * yGap;

      points.push({
        ox: x,
        oy: y,
        x,
        y,
        vx: 0,
        vy: 0,
        row,
        col,
      });
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;

      if (col < cols - 1) {
        edges.push({ from: index, to: index + 1 });
      }

      if (row < rows - 1) {
        edges.push({ from: index, to: index + cols });
      }
    }
  }

  return { points, edges, rows, cols };
};
