import type { AreaId } from "../types";
import { NPCS } from "./npcs";
import { OBJECTS } from "./objects";

// ─────────────────────────────────────────────────────────────────────────────
// The compact, walkable pixel Hongdae map.
//
// Top-down orthographic, tile-based. 16x16 base tile, scaled with nearest-
// neighbor at render time. The grid is generated from a layout description so
// richer hand-drawn tilesets can replace the procedural tiles later without
// changing gameplay/collision logic.
// ─────────────────────────────────────────────────────────────────────────────

export const TILE = 16; // base tile size in px (pre-scale)
export const MAP_W = 40;
export const MAP_H = 28;

export type TerrainType =
  | "road" // main pedestrian asphalt
  | "sidewalk" // walkable warm pavement
  | "plaza" // open warm tile
  | "crosswalk" // striped crossing
  | "alley" // darker alley ground
  | "stage" // busking platform ground
  | "cafe-floor" // warm cafe deck
  | "grass" // small planters / green
  | "wall" // building wall (solid)
  | "water"; // none used, reserved

export interface BuildingRect {
  x: number;
  y: number;
  w: number;
  h: number;
  area: AreaId;
  label: string; // Korean shop label drawn on facade
  facade: string; // base wall color
  roof: string; // roof/awning color
  neon?: boolean;
}

// Buildings (solid). Doorway tiles are carved walkable in the terrain pass.
export const BUILDINGS: BuildingRect[] = [
  // Left: indie cafe + study cafe
  { x: 2, y: 7, w: 7, h: 4, area: "cafe", label: "카페", facade: "#caa27a", roof: "#8a5a3c" },
  { x: 2, y: 13, w: 6, h: 3, area: "cafe", label: "스터디카페", facade: "#bd9a78", roof: "#7a5236" },
  // Right: convenience store + K-fashion boutique
  { x: 27, y: 6, w: 6, h: 4, area: "store", label: "편의점", facade: "#a9c0cf", roof: "#4c8ca0", neon: true },
  { x: 34, y: 7, w: 5, h: 4, area: "store", label: "패션", facade: "#d6a8bf", roof: "#a85e86", neon: true },
  // Top: busking backdrop wall
  { x: 6, y: 1, w: 6, h: 2, area: "busking", label: "라이브", facade: "#b58fb0", roof: "#7a4f86" },
  { x: 20, y: 1, w: 7, h: 2, area: "busking", label: "버스킹", facade: "#a87fb0", roof: "#6f4a86" },
  // Right-bottom alley: coin noraebang + bar
  { x: 31, y: 15, w: 7, h: 4, area: "alley", label: "노래방", facade: "#6a5a86", roof: "#3f3458", neon: true },
  { x: 31, y: 23, w: 7, h: 3, area: "alley", label: "BAR", facade: "#5a4f74", roof: "#352c48", neon: true },
];

// Door tiles carved out of buildings (walkable entrances).
export const DOORWAYS: Array<{ x: number; y: number }> = [
  { x: 5, y: 10 }, // cafe
  { x: 4, y: 15 }, // study cafe
  { x: 29, y: 9 }, // convenience store
  { x: 36, y: 10 }, // boutique
  { x: 34, y: 18 }, // noraebang
];

// Solid decorative props (collision, drawn as small pixel sprites).
export type PropKind =
  | "tree"
  | "bench"
  | "lamp"
  | "bike"
  | "scooter"
  | "bin"
  | "planter"
  | "bollard"
  | "speaker"
  | "busstop";

export interface PropDef {
  kind: PropKind;
  x: number;
  y: number;
}

export const PROPS: PropDef[] = [
  { kind: "tree", x: 14, y: 10 },
  { kind: "tree", x: 19, y: 11 },
  { kind: "tree", x: 24, y: 14 },
  { kind: "tree", x: 11, y: 16 },
  { kind: "bench", x: 13, y: 16 },
  { kind: "bench", x: 21, y: 13 },
  { kind: "lamp", x: 8, y: 19 },
  { kind: "lamp", x: 26, y: 19 },
  { kind: "lamp", x: 18, y: 8 },
  { kind: "bike", x: 25, y: 11 },
  { kind: "scooter", x: 12, y: 13 },
  { kind: "bin", x: 30, y: 13 },
  { kind: "planter", x: 3, y: 12 },
  { kind: "planter", x: 8, y: 6 },
  { kind: "bollard", x: 15, y: 21 },
  { kind: "bollard", x: 17, y: 21 },
  { kind: "speaker", x: 12, y: 3 },
  { kind: "speaker", x: 18, y: 3 },
  { kind: "busstop", x: 6, y: 23 },
];

// Subway exit structure (bottom). Solid block with a stair opening.
export const SUBWAY_EXIT = { x: 15, y: 24, w: 4, h: 3 };

// Player spawn near the subway exit (arrival point).
export const PLAYER_SPAWN = { x: 17, y: 22 };

// ─────────────────────────────────────────────────────────────────────────────
// Terrain + collision grid generation.
// ─────────────────────────────────────────────────────────────────────────────

function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export interface MapData {
  terrain: TerrainType[][];
  solid: boolean[][];
  /** area label per tile for audio/ambience zoning. */
  area: (AreaId | null)[][];
}

let cached: MapData | null = null;

export function buildMap(): MapData {
  if (cached) return cached;

  const terrain: TerrainType[][] = [];
  const solid: boolean[][] = [];
  const area: (AreaId | null)[][] = [];

  for (let y = 0; y < MAP_H; y++) {
    terrain[y] = [];
    solid[y] = [];
    area[y] = [];
    for (let x = 0; x < MAP_W; x++) {
      // Default ground: warm sidewalk.
      let t: TerrainType = "sidewalk";
      let a: AreaId | null = "street";

      // Outer border wall.
      if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
        t = "wall";
      }

      // Main pedestrian road down the center.
      if (x >= 13 && x <= 24 && y >= 4 && y <= 22) {
        t = "road";
        a = "street";
      }

      // Busking zone (top).
      if (y >= 3 && y <= 6 && x >= 6 && x <= 26) {
        t = y <= 4 ? "stage" : "plaza";
        a = "busking";
      }

      // Alley (right).
      if (x >= 28 && y >= 13 && y <= 26) {
        t = "alley";
        a = "alley";
      }

      // Store zone (right top).
      if (x >= 26 && y >= 4 && y <= 12) {
        a = "store";
      }

      // Cafe zone (left).
      if (x <= 11 && y >= 6 && y <= 17) {
        a = "cafe";
        if (t !== "wall") t = "cafe-floor";
      }

      // Subway zone (bottom center).
      if (y >= 22 && x >= 6 && x <= 26) {
        a = "subway";
        if (t !== "wall") t = "plaza";
      }

      terrain[y][x] = t;
      area[y][x] = a;
      solid[y][x] = t === "wall";
    }
  }

  // Crosswalk near subway exit.
  for (let x = 16; x <= 18; x++) {
    if (terrain[21] && terrain[21][x] !== "wall") terrain[21][x] = "crosswalk";
  }

  // Small green planters strips.
  const greenTiles = [
    [10, 9],
    [10, 14],
    [25, 8],
    [25, 16],
  ];
  for (const [gx, gy] of greenTiles) {
    if (terrain[gy] && terrain[gy][gx] !== "wall") terrain[gy][gx] = "grass";
  }

  // Buildings → solid walls.
  for (const b of BUILDINGS) {
    for (let y = b.y; y < b.y + b.h; y++) {
      for (let x = b.x; x < b.x + b.w; x++) {
        if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
          terrain[y][x] = "wall";
          solid[y][x] = true;
          area[y][x] = b.area;
        }
      }
    }
  }

  // Subway exit block (solid) with stair opening (walkable on its bottom row).
  for (let y = SUBWAY_EXIT.y; y < SUBWAY_EXIT.y + SUBWAY_EXIT.h; y++) {
    for (let x = SUBWAY_EXIT.x; x < SUBWAY_EXIT.x + SUBWAY_EXIT.w; x++) {
      if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
        solid[y][x] = true;
        terrain[y][x] = "wall";
        area[y][x] = "subway";
      }
    }
  }
  // Carve stair opening (the front of the exit is walkable approach).
  const stairY = SUBWAY_EXIT.y + SUBWAY_EXIT.h - 1;
  for (let x = SUBWAY_EXIT.x + 1; x < SUBWAY_EXIT.x + SUBWAY_EXIT.w - 1; x++) {
    solid[stairY][x] = true; // keep block solid; player stands in front
  }

  // Carve doorways back to walkable.
  for (const d of DOORWAYS) {
    if (terrain[d.y] && terrain[d.y][d.x] !== undefined) {
      solid[d.y][d.x] = false;
      terrain[d.y][d.x] = "sidewalk";
    }
  }

  // Props → solid.
  for (const p of PROPS) {
    if (solid[p.y]) solid[p.y][p.x] = true;
  }

  // NPCs → solid (can't walk through them).
  for (const n of NPCS) {
    if (solid[n.tileY]) solid[n.tileY][n.tileX] = true;
  }

  // Interactive objects → solid footprint.
  for (const o of OBJECTS) {
    for (let yy = o.tileY; yy < o.tileY + o.height; yy++) {
      for (let xx = o.tileX; xx < o.tileX + o.width; xx++) {
        if (solid[yy]) solid[yy][xx] = true;
      }
    }
  }

  cached = { terrain, solid, area };
  return cached;
}

export function isSolid(map: MapData, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
  return map.solid[ty][tx];
}

export function areaAt(map: MapData, tx: number, ty: number): AreaId | null {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return null;
  return map.area[ty][tx];
}
