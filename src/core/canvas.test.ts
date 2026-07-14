import { describe, it, expect, afterEach, vi } from "vitest";
import { resizeCanvas } from "./canvas";

// jsdom has no 2D canvas backend; silence its "Not implemented" noise.
// resizeCanvas already guards on a null context.
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

const setDevicePixelRatio = (value: number) => {
  Object.defineProperty(window, "devicePixelRatio", {
    configurable: true,
    value,
  });
};

const originalDpr = window.devicePixelRatio;

afterEach(() => {
  setDevicePixelRatio(originalDpr);
});

describe("resizeCanvas", () => {
  it("scales the backing buffer by the device pixel ratio", () => {
    setDevicePixelRatio(2);
    const canvas = document.createElement("canvas");
    const size = resizeCanvas(canvas, 200, 100);

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);
    expect(size).toEqual({ width: 200, height: 100, dpr: 2 });
  });

  it("keeps the CSS size in unscaled pixels", () => {
    setDevicePixelRatio(2);
    const canvas = document.createElement("canvas");
    resizeCanvas(canvas, 320, 180);

    expect(canvas.style.width).toBe("320px");
    expect(canvas.style.height).toBe("180px");
  });

  it("caps the device pixel ratio at 2x to bound memory/GPU cost", () => {
    setDevicePixelRatio(4);
    const canvas = document.createElement("canvas");
    const size = resizeCanvas(canvas, 100, 100);

    expect(size.dpr).toBe(2);
    expect(canvas.width).toBe(200);
  });

  it("falls back to a ratio of 1 when devicePixelRatio is unset", () => {
    setDevicePixelRatio(0);
    const canvas = document.createElement("canvas");
    const size = resizeCanvas(canvas, 100, 50);

    expect(size.dpr).toBe(1);
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(50);
  });

  it("never produces a zero-sized backing buffer for degenerate input", () => {
    setDevicePixelRatio(1);
    const canvas = document.createElement("canvas");
    const size = resizeCanvas(canvas, 0, 0);

    expect(canvas.width).toBeGreaterThanOrEqual(1);
    expect(canvas.height).toBeGreaterThanOrEqual(1);
    expect(size.width).toBe(0);
    expect(size.height).toBe(0);
  });

  it("skips rewriting the backing buffer when the pixel size is unchanged", () => {
    setDevicePixelRatio(1);
    const canvas = document.createElement("canvas");
    resizeCanvas(canvas, 150, 75);

    const widthSetter = vi.spyOn(canvas, "width", "set");
    const heightSetter = vi.spyOn(canvas, "height", "set");
    resizeCanvas(canvas, 150, 75);

    expect(widthSetter).not.toHaveBeenCalled();
    expect(heightSetter).not.toHaveBeenCalled();
  });
});
