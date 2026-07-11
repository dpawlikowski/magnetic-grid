import type { CustomRenderer, RenderContext } from "./types";

const clearCanvas = (context: RenderContext) => {
  const { ctx, width, height, config } = context;

  ctx.save();
  ctx.fillStyle = config.background;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

const renderDots = (context: RenderContext) => {
  const { ctx, points, config } = context;

  ctx.save();
  ctx.fillStyle = config.color;
  ctx.beginPath();

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    ctx.moveTo(point.x + config.dotSize, point.y);
    ctx.arc(point.x, point.y, config.dotSize, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.restore();
};

const renderMesh = (context: RenderContext) => {
  const { ctx, points, edges, config } = context;

  ctx.save();
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  for (let index = 0; index < edges.length; index += 1) {
    const edge = edges[index];
    const from = points[edge.from];
    const to = points[edge.to];

    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  }

  ctx.stroke();
  ctx.restore();
};

const renderLines = (context: RenderContext) => {
  const { ctx, points, config, width, height } = context;

  ctx.save();
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const driftX = point.x - point.ox;
    const driftY = point.y - point.oy;

    if (Math.abs(driftX) > Math.abs(driftY)) {
      ctx.moveTo(point.x, 0);
      ctx.lineTo(point.x, height);
    } else {
      ctx.moveTo(0, point.y);
      ctx.lineTo(width, point.y);
    }
  }

  ctx.stroke();
  ctx.restore();
};

export const renderGrid = (
  context: RenderContext,
  customRenderer?: CustomRenderer,
) => {
  clearCanvas(context);

  if (context.config.variant === "custom" && customRenderer) {
    customRenderer(context);
    return;
  }

  if (context.config.variant === "dots") {
    renderDots(context);
    return;
  }

  if (context.config.variant === "lines") {
    renderLines(context);
    return;
  }

  renderMesh(context);
};
