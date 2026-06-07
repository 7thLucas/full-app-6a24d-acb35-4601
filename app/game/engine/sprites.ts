import type { Direction } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Original procedural pixel-art drawing.
//
// All sprites are drawn from small pixel grids at runtime (no copied assets).
// Each grid cell is one "pixel" of the sprite, scaled by the render scale.
// This module is the single place to swap in hand-drawn spritesheets later:
// replace these draw functions with image blits keyed by the same params.
// ─────────────────────────────────────────────────────────────────────────────

/** Draw a filled pixel rect in sprite-grid units. */
function px(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  u: number,
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(ox + gx * u, oy + gy * u, gw * u, gh * u);
}

export interface ChibiPalette {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
}

const OUTLINE = "rgba(40,28,24,0.55)";
const SHADOW = "rgba(0,0,0,0.18)";

/**
 * Draw a cute chibi character (~2 tiles tall). The figure is centered in a
 * tile column. `frame` (0/1) drives a gentle walk bob; `dir` picks facing.
 */
export function drawChibi(
  ctx: CanvasRenderingContext2D,
  cx: number, // center x in canvas px (bottom-center of the tile)
  baseY: number, // baseline y (feet) in canvas px
  scale: number, // px per sprite pixel
  pal: ChibiPalette,
  dir: Direction,
  frame: number,
  moving: boolean,
) {
  // Sprite is 12 wide x 20 tall pixel-units.
  const u = scale; // one sprite pixel
  const w = 12;
  const h = 20;
  const ox = Math.round(cx - (w * u) / 2);
  const oy = Math.round(baseY - h * u);

  // Soft ground shadow.
  ctx.fillStyle = SHADOW;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - u, 5 * u, 1.6 * u, 0, 0, Math.PI * 2);
  ctx.fill();

  const bob = moving && frame === 1 ? -1 : 0; // 1px bob while walking
  const o = oy + bob * u;

  // Legs / shoes (walk swing).
  const legSwing = moving ? (frame === 0 ? 1 : -1) : 0;
  px(ctx, ox, o, u, 4 + (legSwing > 0 ? -1 : 0), 16, 2, 4, pal.bottom);
  px(ctx, ox, o, u, 6 + (legSwing < 0 ? 1 : 0), 16, 2, 4, pal.bottom);
  px(ctx, ox, o, u, 4 + (legSwing > 0 ? -1 : 0), 19, 2, 1, "#2b2320");
  px(ctx, ox, o, u, 6 + (legSwing < 0 ? 1 : 0), 19, 2, 1, "#2b2320");

  // Body / top.
  px(ctx, ox, o, u, 3, 10, 6, 6, pal.top);
  // Top shading.
  px(ctx, ox, o, u, 3, 14, 6, 1, "rgba(0,0,0,0.12)");

  // Arms depending on direction.
  if (dir === "left") {
    px(ctx, ox, o, u, 2, 11, 1, 4, pal.skin);
  } else if (dir === "right") {
    px(ctx, ox, o, u, 9, 11, 1, 4, pal.skin);
  } else {
    px(ctx, ox, o, u, 2, 11, 1, 4, pal.skin);
    px(ctx, ox, o, u, 9, 11, 1, 4, pal.skin);
  }

  // Head (big chibi head).
  px(ctx, ox, o, u, 2, 3, 8, 7, pal.skin);
  // Hair cap.
  px(ctx, ox, o, u, 2, 2, 8, 3, pal.hair);
  px(ctx, ox, o, u, 1, 3, 1, 3, pal.hair);
  px(ctx, ox, o, u, 10, 3, 1, 3, pal.hair);

  // Face by direction.
  if (dir === "down") {
    px(ctx, ox, o, u, 4, 6, 1, 1, "#3a2a26"); // eyes
    px(ctx, ox, o, u, 7, 6, 1, 1, "#3a2a26");
    px(ctx, ox, o, u, 5, 8, 2, 1, "rgba(200,90,90,0.5)"); // cheeks/mouth hint
  } else if (dir === "left") {
    px(ctx, ox, o, u, 3, 6, 1, 1, "#3a2a26");
    px(ctx, ox, o, u, 2, 2, 5, 4, pal.hair); // hair sweeps left
  } else if (dir === "right") {
    px(ctx, ox, o, u, 8, 6, 1, 1, "#3a2a26");
    px(ctx, ox, o, u, 5, 2, 5, 4, pal.hair);
  } else {
    // up — back of head, hair only.
    px(ctx, ox, o, u, 2, 2, 8, 6, pal.hair);
  }

  // Subtle outline frame at feet for readability.
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = Math.max(1, u * 0.25);
}

/** Small pixel marker badge above interactive things ("!" / "..."). */
export function drawInteractMarker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  scale: number,
  color: string,
) {
  const u = scale;
  const bob = Math.sin(Date.now() / 250) * u * 0.6;
  const y = topY + bob;
  // rounded bubble
  ctx.fillStyle = color;
  ctx.beginPath();
  roundRect(ctx, cx - 4 * u, y - 8 * u, 8 * u, 7 * u, 2 * u);
  ctx.fill();
  // tail
  ctx.beginPath();
  ctx.moveTo(cx - 1.5 * u, y - 1.5 * u);
  ctx.lineTo(cx + 1.5 * u, y - 1.5 * u);
  ctx.lineTo(cx, y + 0.8 * u);
  ctx.closePath();
  ctx.fill();
  // "!" glyph
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 0.6 * u, y - 7 * u, 1.2 * u, 3.4 * u);
  ctx.fillRect(cx - 0.6 * u, y - 3 * u, 1.2 * u, 1.2 * u);
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
