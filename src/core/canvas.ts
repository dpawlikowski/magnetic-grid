import type { CanvasSize } from "./types";

/** Cap the device-pixel-ratio: past 2× the extra canvas pixels cost GPU/memory with no visible gain. */
const MAX_DEVICE_PIXEL_RATIO = 2;

export const resizeCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasSize => {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
  const pixelWidth = Math.max(1, Math.floor(width * dpr));
  const pixelHeight = Math.max(1, Math.floor(height * dpr));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { width, height, dpr };
};
