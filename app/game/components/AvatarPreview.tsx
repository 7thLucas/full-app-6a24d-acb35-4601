import { useEffect, useRef } from "react";
import { drawChibi, type ChibiPalette } from "../engine/sprites";
import type { Direction } from "../types";

interface Props {
  palette: ChibiPalette;
  size?: number;
  dir?: Direction;
  animate?: boolean;
}

export function AvatarPreview({ palette, size = 96, dir = "down", animate = true }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let tick = 0;
    const scale = Math.floor(size / 26);

    const render = () => {
      raf = requestAnimationFrame(render);
      tick++;
      ctx.clearRect(0, 0, size, size);
      const frame = animate ? Math.floor(tick / 30) % 2 : 0;
      drawChibi(ctx, size / 2, size - 6, scale, palette, dir, frame, false);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [palette, size, dir, animate]);

  return (
    <canvas
      ref={ref}
      className="pixel-canvas"
      style={{ width: size, height: size }}
      aria-label="Character preview"
    />
  );
}
