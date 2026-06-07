// Tiny inline SVG pixel-style icons (original, crisp, no external assets).
// Each icon renders on a small grid for a chunky pixel feel.

interface IconProps {
  size?: number;
  className?: string;
}

function Grid({
  cells,
  color,
  size = 20,
  className,
}: {
  cells: Array<[number, number, string?]>;
  color: string;
  size?: number;
  className?: string;
}) {
  const n = 7;
  const u = size / n;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${n} ${n}`}
      className={className}
      style={{ imageRendering: "pixelated", display: "block" }}
      aria-hidden
    >
      {cells.map(([x, y, c], i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill={c ?? color} />
      ))}
    </svg>
  );
}

export function HeartIcon({ size = 20, className, filled = true }: IconProps & { filled?: boolean }) {
  const color = filled ? "#e85a6a" : "#b8a89a";
  return (
    <Grid
      size={size}
      className={className}
      color={color}
      cells={[
        [1, 1], [2, 1], [4, 1], [5, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
        [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
        [1, 4], [2, 4], [3, 4], [4, 4], [5, 4],
        [2, 5], [3, 5], [4, 5],
        [3, 6],
      ]}
    />
  );
}

export function CoinIcon({ size = 20, className }: IconProps) {
  return (
    <Grid
      size={size}
      className={className}
      color="#f2c84a"
      cells={[
        [2, 0], [3, 0], [4, 0],
        [1, 1], [5, 1],
        [0, 2], [3, 2, "#fff6c0"], [6, 2],
        [0, 3], [3, 3, "#fff6c0"], [6, 3],
        [0, 4], [3, 4, "#fff6c0"], [6, 4],
        [1, 5], [5, 5],
        [2, 6], [3, 6], [4, 6],
      ]}
    />
  );
}

export function FlameIcon({ size = 20, className }: IconProps) {
  return (
    <Grid
      size={size}
      className={className}
      color="#ff8a3a"
      cells={[
        [3, 0],
        [2, 1], [3, 1, "#ffd24a"],
        [2, 2], [3, 2, "#ffd24a"], [4, 2],
        [1, 3], [2, 3], [3, 3, "#ffd24a"], [4, 3], [5, 3],
        [1, 4], [2, 4, "#ffe27a"], [3, 4, "#ffe27a"], [4, 4, "#ffe27a"], [5, 4],
        [1, 5], [2, 5, "#ffd24a"], [3, 5, "#ffd24a"], [4, 5, "#ffd24a"], [5, 5],
        [2, 6], [3, 6], [4, 6],
      ]}
    />
  );
}

export function StarIcon({ size = 20, className }: IconProps) {
  return (
    <Grid
      size={size}
      className={className}
      color="#f5c84a"
      cells={[
        [3, 0],
        [3, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
        [2, 3], [3, 3], [4, 3],
        [2, 4], [4, 4],
        [1, 5], [5, 5],
      ]}
    />
  );
}

export function BookIcon({ size = 20, className }: IconProps) {
  return (
    <Grid
      size={size}
      className={className}
      color="#7a9e7c"
      cells={[
        [1, 0], [2, 0], [3, 0], [4, 0], [5, 0],
        [1, 1], [3, 1, "#fff6e9"], [5, 1],
        [1, 2], [3, 2, "#fff6e9"], [5, 2],
        [1, 3], [3, 3, "#fff6e9"], [5, 3],
        [1, 4], [3, 4, "#fff6e9"], [5, 4],
        [1, 5], [2, 5], [3, 5], [4, 5], [5, 5],
      ]}
    />
  );
}

const BADGE_ICON_COLORS: Record<string, string> = {
  speech: "#7fb7a6",
  train: "#4c8ca0",
  coffee: "#b07a4a",
  heart: "#e85a6a",
  book: "#7a9e7c",
  flame: "#ff8a3a",
  mic: "#a890d4",
  star: "#f5c84a",
};

export function BadgeGlyph({ icon, size = 28 }: { icon: string; size?: number }) {
  const color = BADGE_ICON_COLORS[icon] ?? "#e8964a";
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        border: "2px solid #3a2a28",
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)",
      }}
    >
      {icon === "heart" && <HeartIcon size={size * 0.6} />}
      {icon === "coffee" && <CoinIcon size={size * 0.6} />}
      {icon === "flame" && <FlameIcon size={size * 0.6} />}
      {icon === "star" && <StarIcon size={size * 0.6} />}
      {icon === "book" && <BookIcon size={size * 0.6} />}
      {(icon === "speech" || icon === "train" || icon === "mic") && (
        <span className="font-pixel" style={{ fontSize: size * 0.35, color: "#fff6e9" }}>
          {icon === "mic" ? "♪" : icon === "train" ? "역" : "말"}
        </span>
      )}
    </div>
  );
}
