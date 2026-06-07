import type { Direction, NPCDef, InteractiveObjectDef } from "../types";
import {
  BUILDINGS,
  MAP_H,
  MAP_W,
  PROPS,
  SUBWAY_EXIT,
  TILE,
  buildMap,
  type MapData,
  type PropDef,
  type TerrainType,
} from "../data/map";
import { NPCS } from "../data/npcs";
import { OBJECTS } from "../data/objects";
import { drawChibi, drawInteractMarker, roundRect } from "./sprites";
import type { ChibiPalette } from "./sprites";

// ─────────────────────────────────────────────────────────────────────────────
// Warm golden-hour palette for the procedural Hongdae tiles.
// ─────────────────────────────────────────────────────────────────────────────

const TERRAIN_COLORS: Record<TerrainType, [string, string]> = {
  // [base, speckle/shade]
  road: ["#6b5f57", "#5d5249"],
  sidewalk: ["#d8b893", "#cba87f"],
  plaza: ["#e2c19a", "#d3ad84"],
  crosswalk: ["#cdb189", "#f3ead0"],
  alley: ["#574b5f", "#473c50"],
  stage: ["#8a6f86", "#7a5f78"],
  "cafe-floor": ["#caa884", "#b8946e"],
  grass: ["#7fa86a", "#6f9659"],
  wall: ["#3a2f33", "#2c2327"],
  water: ["#5a8fae", "#4a7f9e"],
};

export interface Camera {
  x: number; // top-left world px
  y: number;
  scale: number; // render scale (px per sprite-pixel) — nearest neighbor
}

export interface RenderTargets {
  player: {
    px: number; // world px center x
    py: number; // world px feet y
    dir: Direction;
    frame: number;
    moving: boolean;
    palette: ChibiPalette;
  };
  /** id of the currently-highlighted interactable, if any. */
  highlightId: string | null;
  /** completed NPC/object ids (drawn with a soft checkmark). */
  completedIds: Set<string>;
  /** dim time-of-day overlay alpha (0..1) for cozy evening glow. */
  eveningAlpha: number;
}

let map: MapData | null = null;

function tileColor(t: TerrainType, x: number, y: number): string {
  const [base, shade] = TERRAIN_COLORS[t];
  // Deterministic speckle for texture without noise per frame.
  const h = ((x * 928371 + y * 1299721) >>> 0) % 5;
  return h === 0 ? shade : base;
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  viewW: number,
  viewH: number,
  targets: RenderTargets,
  tick: number,
) {
  if (!map) map = buildMap();
  const s = cam.scale;
  const tileSize = TILE * s;

  // Visible tile bounds.
  const startTX = Math.max(0, Math.floor(cam.x / tileSize));
  const endTX = Math.min(MAP_W - 1, Math.ceil((cam.x + viewW) / tileSize));
  const startTY = Math.max(0, Math.floor(cam.y / tileSize));
  const endTY = Math.min(MAP_H - 1, Math.ceil((cam.y + viewH) / tileSize));

  // Background fill (in case of edges).
  ctx.fillStyle = "#2a2228";
  ctx.fillRect(0, 0, viewW, viewH);

  // ── Terrain ───────────────────────────────────────────────────────────────
  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      const t = map.terrain[ty][tx];
      const sx = Math.round(tx * tileSize - cam.x);
      const sy = Math.round(ty * tileSize - cam.y);
      ctx.fillStyle = tileColor(t, tx, ty);
      ctx.fillRect(sx, sy, tileSize + 1, tileSize + 1);

      // Crosswalk stripes.
      if (t === "crosswalk") {
        ctx.fillStyle = "#f3ead0";
        ctx.fillRect(sx + s, sy + s, 3 * s, tileSize - 2 * s);
        ctx.fillRect(sx + 7 * s, sy + s, 3 * s, tileSize - 2 * s);
        ctx.fillRect(sx + 13 * s, sy + s, 3 * s, tileSize - 2 * s);
      }
      // Road center dashes.
      if (t === "road" && ty % 2 === 0 && tx === Math.round((MAP_W - 1) / 2 - 2)) {
        ctx.fillStyle = "rgba(243,234,208,0.35)";
        ctx.fillRect(sx + 6 * s, sy + 4 * s, 2 * s, 8 * s);
      }
      // Grass tufts.
      if (t === "grass") {
        ctx.fillStyle = "#5f8a4a";
        ctx.fillRect(sx + 3 * s, sy + 6 * s, 2 * s, 4 * s);
        ctx.fillRect(sx + 9 * s, sy + 4 * s, 2 * s, 6 * s);
      }
      // Subtle tile grid for the cozy hand-placed look.
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(sx, sy + tileSize - 1, tileSize, 1);
      ctx.fillRect(sx + tileSize - 1, sy, 1, tileSize);
    }
  }

  // ── Subway exit structure ──────────────────────────────────────────────────
  drawSubwayExit(ctx, cam, s);

  // ── Buildings ───────────────────────────────────────────────────────────────
  for (const b of BUILDINGS) {
    drawBuilding(ctx, cam, s, b, tick);
  }

  // ── Z-sorted entities (props, objects, NPCs, player) by feet-Y ─────────────
  type Drawable = { y: number; draw: () => void };
  const drawables: Drawable[] = [];

  for (const p of PROPS) {
    drawables.push({
      y: p.y * tileSize,
      draw: () => drawProp(ctx, cam, s, p, tick),
    });
  }

  for (const o of OBJECTS) {
    const feetY = (o.tileY + o.height) * tileSize;
    drawables.push({
      y: feetY,
      draw: () =>
        drawObject(
          ctx,
          cam,
          s,
          o,
          targets.highlightId === o.id,
          targets.completedIds.has(o.id),
          tick,
        ),
    });
  }

  for (const n of NPCS) {
    const feetY = (n.tileY + 1) * tileSize;
    drawables.push({
      y: feetY,
      draw: () =>
        drawNpc(
          ctx,
          cam,
          s,
          n,
          targets.highlightId === n.id,
          targets.completedIds.has(n.id),
          tick,
        ),
    });
  }

  // Player.
  drawables.push({
    y: targets.player.py,
    draw: () => {
      drawChibi(
        ctx,
        targets.player.px - cam.x,
        targets.player.py - cam.y,
        s,
        targets.player.palette,
        targets.player.dir,
        targets.player.frame,
        targets.player.moving,
      );
    },
  });

  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  // ── Cozy evening glow overlay ───────────────────────────────────────────────
  if (targets.eveningAlpha > 0) {
    const grad = ctx.createLinearGradient(0, 0, 0, viewH);
    grad.addColorStop(0, `rgba(255,180,90,${0.10 * targets.eveningAlpha})`);
    grad.addColorStop(0.6, `rgba(255,140,80,${0.05 * targets.eveningAlpha})`);
    grad.addColorStop(1, `rgba(60,40,80,${0.18 * targets.eveningAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, viewW, viewH);
  }
}

// ── Building drawing ─────────────────────────────────────────────────────────

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  s: number,
  b: (typeof BUILDINGS)[number],
  tick: number,
) {
  const tileSize = TILE * s;
  const x = Math.round(b.x * tileSize - cam.x);
  const y = Math.round(b.y * tileSize - cam.y);
  const w = b.w * tileSize;
  const h = b.h * tileSize;

  // Facade.
  ctx.fillStyle = b.facade;
  ctx.fillRect(x, y, w, h);
  // Wall shading.
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x, y + h - 3 * s, w, 3 * s);

  // Roof / awning band.
  ctx.fillStyle = b.roof;
  ctx.fillRect(x, y, w, Math.max(4 * s, h * 0.28));

  // Awning stripes.
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < b.w; i += 1) {
    if (i % 2 === 0) ctx.fillRect(x + i * tileSize, y, tileSize, Math.max(4 * s, h * 0.28));
  }

  // Lit windows (warm).
  const winY = y + Math.max(6 * s, h * 0.42);
  for (let i = 0; i < b.w; i++) {
    const wx = x + i * tileSize + 3 * s;
    const flicker = b.neon ? 0.7 + 0.3 * Math.sin(tick / 12 + i) : 1;
    ctx.fillStyle = `rgba(255,214,140,${0.85 * flicker})`;
    ctx.fillRect(wx, winY, tileSize - 6 * s, Math.max(5 * s, h * 0.22));
    ctx.fillStyle = "rgba(120,80,40,0.5)";
    ctx.fillRect(wx, winY, tileSize - 6 * s, 1 * s);
  }

  // Korean sign label (pixel-ish, drawn as text on a sign plate).
  const signW = Math.min(w - 4 * s, b.label.length * 9 * s + 8 * s);
  const signX = x + (w - signW) / 2;
  const signY = y - 6 * s;
  ctx.fillStyle = b.neon ? "#1d1630" : "#3a2a28";
  roundRect(ctx, signX, signY, signW, 9 * s, 2 * s);
  ctx.fill();
  if (b.neon) {
    ctx.shadowColor = "#ff7fc4";
    ctx.shadowBlur = 8 * s * (0.6 + 0.4 * Math.sin(tick / 10));
  }
  ctx.fillStyle = b.neon ? "#ffd1f0" : "#ffe6bd";
  ctx.font = `${7 * s}px 'Press Start 2P', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.label, signX + signW / 2, signY + 5 * s);
  ctx.shadowBlur = 0;
}

function drawSubwayExit(ctx: CanvasRenderingContext2D, cam: Camera, s: number) {
  const tileSize = TILE * s;
  const x = Math.round(SUBWAY_EXIT.x * tileSize - cam.x);
  const y = Math.round(SUBWAY_EXIT.y * tileSize - cam.y);
  const w = SUBWAY_EXIT.w * tileSize;
  const h = SUBWAY_EXIT.h * tileSize;

  // Railings frame.
  ctx.fillStyle = "#6a7078";
  ctx.fillRect(x, y, w, h);
  // Stair opening (dark descent).
  ctx.fillStyle = "#1c1f24";
  ctx.fillRect(x + 4 * s, y + 4 * s, w - 8 * s, h - 6 * s);
  // Stair steps.
  ctx.fillStyle = "#33373d";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 4 * s, y + 4 * s + i * 3 * s, w - 8 * s, 1 * s);
  }
  // Subway sign with Korean.
  ctx.fillStyle = "#2f6f3f";
  roundRect(ctx, x - 1 * s, y - 8 * s, w + 2 * s, 8 * s, 2 * s);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `${6 * s}px 'Press Start 2P', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("홍대입구역", x + w / 2, y - 4 * s);
}

// ── Prop drawing ─────────────────────────────────────────────────────────────

function drawProp(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  s: number,
  p: PropDef,
  tick: number,
) {
  const tileSize = TILE * s;
  const x = Math.round(p.x * tileSize - cam.x);
  const y = Math.round(p.y * tileSize - cam.y);
  const cx = x + tileSize / 2;
  const baseY = y + tileSize;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 1 * s, 5 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (p.kind) {
    case "tree": {
      ctx.fillStyle = "#6a4a30";
      ctx.fillRect(cx - 1.5 * s, baseY - 8 * s, 3 * s, 8 * s);
      const sway = Math.sin(tick / 20 + p.x) * 1 * s;
      ctx.fillStyle = "#5f9a52";
      ctx.beginPath();
      ctx.arc(cx + sway, baseY - 12 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#74b264";
      ctx.beginPath();
      ctx.arc(cx + sway - 3 * s, baseY - 13 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bench": {
      ctx.fillStyle = "#8a5a3a";
      ctx.fillRect(cx - 7 * s, baseY - 5 * s, 14 * s, 2 * s);
      ctx.fillRect(cx - 7 * s, baseY - 9 * s, 14 * s, 2 * s);
      ctx.fillStyle = "#5a3a26";
      ctx.fillRect(cx - 6 * s, baseY - 3 * s, 2 * s, 3 * s);
      ctx.fillRect(cx + 4 * s, baseY - 3 * s, 2 * s, 3 * s);
      break;
    }
    case "lamp": {
      ctx.fillStyle = "#4a4036";
      ctx.fillRect(cx - 1 * s, baseY - 16 * s, 2 * s, 16 * s);
      const glow = 0.6 + 0.4 * Math.sin(tick / 8 + p.x);
      ctx.shadowColor = "#ffd27a";
      ctx.shadowBlur = 10 * s * glow;
      ctx.fillStyle = `rgba(255,220,140,${glow})`;
      ctx.beginPath();
      ctx.arc(cx, baseY - 17 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case "bike":
    case "scooter": {
      ctx.fillStyle = p.kind === "bike" ? "#c45a4a" : "#4a8ac4";
      ctx.fillRect(cx - 6 * s, baseY - 6 * s, 12 * s, 2 * s);
      ctx.fillStyle = "#2b2320";
      ctx.beginPath();
      ctx.arc(cx - 5 * s, baseY - 2 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(cx + 5 * s, baseY - 2 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a322c";
      ctx.fillRect(cx - 1 * s, baseY - 12 * s, 1.5 * s, 7 * s);
      break;
    }
    case "bin": {
      ctx.fillStyle = "#4a7a5a";
      ctx.fillRect(cx - 4 * s, baseY - 9 * s, 8 * s, 9 * s);
      ctx.fillStyle = "#3a5f48";
      ctx.fillRect(cx - 5 * s, baseY - 10 * s, 10 * s, 2 * s);
      break;
    }
    case "planter": {
      ctx.fillStyle = "#9a6a44";
      ctx.fillRect(cx - 5 * s, baseY - 5 * s, 10 * s, 5 * s);
      ctx.fillStyle = "#6aa658";
      ctx.beginPath();
      ctx.arc(cx - 2 * s, baseY - 7 * s, 3 * s, 0, Math.PI * 2);
      ctx.arc(cx + 2 * s, baseY - 8 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bollard": {
      ctx.fillStyle = "#c9a24a";
      ctx.fillRect(cx - 1.5 * s, baseY - 7 * s, 3 * s, 7 * s);
      ctx.fillStyle = "#fff";
      ctx.fillRect(cx - 1.5 * s, baseY - 5 * s, 3 * s, 1 * s);
      break;
    }
    case "speaker": {
      ctx.fillStyle = "#2b2630";
      ctx.fillRect(cx - 4 * s, baseY - 11 * s, 8 * s, 11 * s);
      ctx.fillStyle = "#54606a";
      ctx.beginPath();
      ctx.arc(cx, baseY - 6 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "busstop": {
      ctx.fillStyle = "#3a4a5a";
      ctx.fillRect(cx - 1 * s, baseY - 14 * s, 2 * s, 14 * s);
      ctx.fillStyle = "#4c8ca0";
      roundRect(ctx, cx - 6 * s, baseY - 18 * s, 12 * s, 5 * s, 1.5 * s);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `${4 * s}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("버스", cx, baseY - 15.5 * s);
      break;
    }
  }
}

// ── Interactive object drawing ──────────────────────────────────────────────

function drawObject(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  s: number,
  o: InteractiveObjectDef,
  highlight: boolean,
  completed: boolean,
  tick: number,
) {
  const tileSize = TILE * s;
  const x = Math.round(o.tileX * tileSize - cam.x);
  const y = Math.round(o.tileY * tileSize - cam.y);
  const w = o.width * tileSize;
  const h = o.height * tileSize;
  const cx = x + w / 2;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(cx, y + h - 1 * s, (w / 2) * 0.8, 1.6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Each object kind has a distinct, original look.
  const accent = OBJECT_ACCENT[o.kind] ?? "#c98a4a";
  ctx.fillStyle = accent;
  roundRect(ctx, x + 1 * s, y + 1 * s, w - 2 * s, h - 2 * s, 2 * s);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x + 1 * s, y + h - 3 * s, w - 2 * s, 2 * s);

  // Glyph label for readability.
  ctx.fillStyle = "#fff8ec";
  ctx.font = `${5 * s}px 'Press Start 2P', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const glyph = OBJECT_GLYPH[o.kind] ?? "?";
  ctx.fillText(glyph, cx, y + h / 2);

  // Object-specific flourishes.
  if (o.kind === "vending-machine" || o.kind === "fridge") {
    ctx.fillStyle = "rgba(140,210,255,0.4)";
    ctx.fillRect(x + 3 * s, y + 3 * s, w - 6 * s, h * 0.45);
  }
  if (o.kind === "food-cart") {
    // steam
    ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.15 * Math.sin(tick / 9)})`;
    ctx.beginPath();
    ctx.arc(cx, y - 2 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (o.kind === "noraebang-sign" || o.kind === "graffiti-wall") {
    ctx.shadowColor = "#ff7fc4";
    ctx.shadowBlur = 6 * s * (0.6 + 0.4 * Math.sin(tick / 8));
    ctx.strokeStyle = "rgba(255,150,210,0.8)";
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(x + 1 * s, y + 1 * s, w - 2 * s, h - 2 * s);
    ctx.shadowBlur = 0;
  }

  if (completed) {
    ctx.fillStyle = "#5fbf6a";
    ctx.beginPath();
    ctx.arc(x + w - 3 * s, y + 3 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(x + w - 4.2 * s, y + 3 * s);
    ctx.lineTo(x + w - 3.2 * s, y + 4 * s);
    ctx.lineTo(x + w - 1.6 * s, y + 1.8 * s);
    ctx.stroke();
  }

  if (highlight) {
    drawInteractMarker(ctx, cx, y, s, "#e8964a");
  }
}

const OBJECT_ACCENT: Record<string, string> = {
  "menu-board": "#3a3026",
  "food-cart": "#c0504a",
  "subway-map": "#2f6f6a",
  fridge: "#5a8ca0",
  "photo-booth": "#c97fb0",
  "noraebang-sign": "#6a4a9a",
  "busking-stage": "#8a5a86",
  "poster-wall": "#9a7a4a",
  "vending-machine": "#c0444a",
  "graffiti-wall": "#5a4a7a",
};

const OBJECT_GLYPH: Record<string, string> = {
  "menu-board": "메뉴",
  "food-cart": "분식",
  "subway-map": "지도",
  fridge: "음료",
  "photo-booth": "사진",
  "noraebang-sign": "노래방",
  "busking-stage": "공연",
  "poster-wall": "포스터",
  "vending-machine": "음료수",
  "graffiti-wall": "낙서",
};

// ── NPC drawing ──────────────────────────────────────────────────────────────

function drawNpc(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  s: number,
  n: NPCDef,
  highlight: boolean,
  completed: boolean,
  tick: number,
) {
  const tileSize = TILE * s;
  const cx = n.tileX * tileSize - cam.x + tileSize / 2;
  const baseY = (n.tileY + 1) * tileSize - cam.y;
  // Gentle idle bob.
  const frame = Math.floor(tick / 30 + n.tileX) % 2;
  drawChibi(ctx, cx, baseY, s, n.palette, n.facing, frame, false);

  // Name plate above.
  const topY = baseY - 20 * s;
  ctx.font = `${5 * s}px 'Press Start 2P', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = n.role;
  const plateW = Math.max(label.length * 5 * s + 6 * s, 30 * s);
  ctx.fillStyle = "rgba(40,28,30,0.78)";
  roundRect(ctx, cx - plateW / 2, topY - 4 * s, plateW, 8 * s, 2 * s);
  ctx.fill();
  ctx.fillStyle = "#ffe6bd";
  ctx.fillText(label, cx, topY);

  if (completed) {
    ctx.fillStyle = "#5fbf6a";
    ctx.beginPath();
    ctx.arc(cx + plateW / 2 - 1 * s, topY - 4 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  if (highlight) {
    drawInteractMarker(ctx, cx, baseY - 24 * s, s, "#7fb7a6");
  }
}
