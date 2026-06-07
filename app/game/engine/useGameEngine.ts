import { useCallback, useEffect, useRef, useState } from "react";
import type { Direction } from "../types";
import {
  MAP_H,
  MAP_W,
  PLAYER_SPAWN,
  TILE,
  buildMap,
  isSolid,
  areaAt,
} from "../data/map";
import { NPCS } from "../data/npcs";
import { OBJECTS } from "../data/objects";
import { drawWorld, type Camera, type RenderTargets } from "./worldRenderer";
import type { ChibiPalette } from "./sprites";
import { audioManager } from "../audio/AudioManager";

// ─────────────────────────────────────────────────────────────────────────────
// Movement is tile-based but visually smooth: the player eases tile→tile.
// Collision is checked against the static solid grid. Camera follows, bounded
// to the map. The nearest interactable in front/adjacent is highlighted.
// ─────────────────────────────────────────────────────────────────────────────

const MOVE_SPEED = 5.2; // tiles per second
const RENDER_SCALE = 3; // nearest-neighbor scale (3x). Adjusted to fit viewport.

export interface Interactable {
  id: string;
  kind: "npc" | "object";
}

interface EngineOptions {
  palette: ChibiPalette;
  spawn?: { x: number; y: number } | null;
  enabled: boolean; // pause movement when a modal/menu is open
  onTileChange?: (x: number, y: number) => void;
  /** ids of completed NPCs/objects (drawn with a check). */
  completedIds: Set<string>;
}

export interface EngineApi {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  highlight: Interactable | null;
  /** Programmatically trigger interaction with the highlighted target. */
  requestInteract: () => Interactable | null;
}

export function useGameEngine(opts: EngineOptions): EngineApi {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [highlight, setHighlight] = useState<Interactable | null>(null);
  const highlightRef = useRef<Interactable | null>(null);

  // Mutable engine state (refs avoid re-renders each frame).
  const stateRef = useRef({
    // pixel position in world space (center x, feet y handled via tile math)
    px: PLAYER_SPAWN.x,
    py: PLAYER_SPAWN.y,
    tx: PLAYER_SPAWN.x,
    ty: PLAYER_SPAWN.y,
    targetTx: PLAYER_SPAWN.x,
    targetTy: PLAYER_SPAWN.y,
    dir: "down" as Direction,
    moving: false,
    frame: 0,
    frameTimer: 0,
    cam: { x: 0, y: 0, scale: RENDER_SCALE } as Camera,
    viewW: 800,
    viewH: 600,
    lastArea: null as ReturnType<typeof areaAt>,
    stepTimer: 0,
  });

  const enabledRef = useRef(opts.enabled);
  enabledRef.current = opts.enabled;
  const paletteRef = useRef(opts.palette);
  paletteRef.current = opts.palette;
  const onTileChangeRef = useRef(opts.onTileChange);
  onTileChangeRef.current = opts.onTileChange;
  const completedIdsRef = useRef<Set<string>>(opts.completedIds);
  completedIdsRef.current = opts.completedIds;

  const keys = useRef<Record<string, boolean>>({});

  // Apply spawn override once on mount.
  useEffect(() => {
    const sp = opts.spawn;
    const st = stateRef.current;
    if (sp && sp.x >= 0 && sp.x < MAP_W && sp.y >= 0 && sp.y < MAP_H) {
      st.px = sp.x;
      st.py = sp.y;
      st.tx = sp.x;
      st.ty = sp.y;
      st.targetTx = sp.x;
      st.targetTy = sp.y;
    }
    // eslint-disable-next-line
  }, []);

  // ── Find nearest interactable adjacent to the player ──────────────────────
  const computeHighlight = useCallback((): Interactable | null => {
    const st = stateRef.current;
    const ptx = Math.round(st.tx);
    const pty = Math.round(st.ty);
    // Check the tile the player faces + adjacent tiles.
    const candidates: Array<[number, number]> = [
      [ptx, pty - 1],
      [ptx, pty + 1],
      [ptx - 1, pty],
      [ptx + 1, pty],
      [ptx, pty],
    ];
    for (const [cx, cy] of candidates) {
      // NPC?
      const npc = NPCS.find((n) => n.tileX === cx && n.tileY === cy);
      if (npc) return { id: npc.id, kind: "npc" };
      // Object footprint?
      const obj = OBJECTS.find(
        (o) =>
          cx >= o.tileX &&
          cx < o.tileX + o.width &&
          cy >= o.tileY &&
          cy < o.tileY + o.height,
      );
      if (obj) return { id: obj.id, kind: "object" };
    }
    return null;
  }, []);

  const requestInteract = useCallback((): Interactable | null => {
    const h = highlightRef.current;
    if (h) audioManager.play("interact");
    return h;
  }, []);

  // ── Keyboard input ──────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "e"].includes(k)
      ) {
        e.preventDefault();
      }
      keys.current[k] = true;
      // Unlock audio on first interaction.
      audioManager.unlock();
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ── Resize handling: fit scale so the world fills the viewport nicely ──────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(240, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false; // pixel-perfect, no blur
      }
      const st = stateRef.current;
      st.viewW = w;
      st.viewH = h;
      // Choose a scale so ~13 tiles are visible vertically (cozy zoom).
      const targetTilesAcross = Math.min(16, Math.max(11, Math.round(w / 56)));
      const scale = Math.max(2, Math.round(w / (targetTilesAcross * TILE)));
      st.cam.scale = scale;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Main loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = buildMap();
    let raf = 0;
    let last = performance.now();
    let tick = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tick++;

      const st = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const tileSize = TILE * st.cam.scale;

      // ── Movement (tile-to-tile easing) ──────────────────────────────────
      const atTarget =
        Math.abs(st.px - st.targetTx) < 0.001 && Math.abs(st.py - st.targetTy) < 0.001;

      if (atTarget) {
        st.px = st.targetTx;
        st.py = st.targetTy;
        st.tx = st.targetTx;
        st.ty = st.targetTy;

        if (enabledRef.current) {
          let dx = 0;
          let dy = 0;
          if (keys.current["arrowup"] || keys.current["w"]) {
            dy = -1;
            st.dir = "up";
          } else if (keys.current["arrowdown"] || keys.current["s"]) {
            dy = 1;
            st.dir = "down";
          } else if (keys.current["arrowleft"] || keys.current["a"]) {
            dx = -1;
            st.dir = "left";
          } else if (keys.current["arrowright"] || keys.current["d"]) {
            dx = 1;
            st.dir = "right";
          }

          if (dx !== 0 || dy !== 0) {
            const ntx = st.targetTx + dx;
            const nty = st.targetTy + dy;
            if (!isSolid(map, ntx, nty)) {
              st.targetTx = ntx;
              st.targetTy = nty;
              st.moving = true;
            } else {
              st.moving = false;
            }
          } else {
            st.moving = false;
          }
        } else {
          st.moving = false;
        }
      } else {
        // Ease toward target tile.
        const step = MOVE_SPEED * dt;
        const mvx = Math.sign(st.targetTx - st.px) * Math.min(step, Math.abs(st.targetTx - st.px));
        const mvy = Math.sign(st.targetTy - st.py) * Math.min(step, Math.abs(st.targetTy - st.py));
        st.px += mvx;
        st.py += mvy;
        st.moving = true;

        // Walk animation + footstep sfx.
        st.frameTimer += dt;
        if (st.frameTimer > 0.14) {
          st.frameTimer = 0;
          st.frame = st.frame === 0 ? 1 : 0;
        }
        st.stepTimer += dt;
        if (st.stepTimer > 0.28) {
          st.stepTimer = 0;
          audioManager.play("step");
        }
      }

      // Tile-change callback (persist position + area music).
      const rtx = Math.round(st.tx);
      const rty = Math.round(st.ty);
      const area = areaAt(map, rtx, rty);
      if (area && area !== st.lastArea) {
        st.lastArea = area;
        audioManager.playArea(area);
      }
      onTileChangeRef.current?.(rtx, rty);

      // ── Camera follow (bounded) ─────────────────────────────────────────
      const playerWorldX = (st.px + 0.5) * tileSize;
      const playerWorldY = (st.py + 1) * tileSize;
      const lookahead =
        st.dir === "left" ? -tileSize : st.dir === "right" ? tileSize : 0;
      let camX = playerWorldX - st.viewW / 2 + lookahead * 0.4;
      let camY = playerWorldY - st.viewH / 2;
      const maxX = MAP_W * tileSize - st.viewW;
      const maxY = MAP_H * tileSize - st.viewH;
      camX = Math.max(0, Math.min(Math.max(0, maxX), camX));
      camY = Math.max(0, Math.min(Math.max(0, maxY), camY));
      // Smooth camera.
      st.cam.x += (camX - st.cam.x) * Math.min(1, dt * 8);
      st.cam.y += (camY - st.cam.y) * Math.min(1, dt * 8);

      // ── Highlight nearest interactable ──────────────────────────────────
      const h = computeHighlight();
      const cur = highlightRef.current;
      if (h?.id !== cur?.id) {
        highlightRef.current = h;
        setHighlight(h);
      }

      // ── Render ───────────────────────────────────────────────────────────
      const targets: RenderTargets = {
        player: {
          px: (st.px + 0.5) * tileSize,
          py: (st.py + 1) * tileSize,
          dir: st.dir,
          frame: st.frame,
          moving: st.moving,
          palette: paletteRef.current,
        },
        highlightId: h?.id ?? null,
        completedIds: completedIdsRef.current,
        eveningAlpha: 1,
      };
      drawWorld(ctx, st.cam, st.viewW, st.viewH, targets, tick);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [computeHighlight]);

  return { canvasRef, containerRef, highlight, requestInteract };
}
