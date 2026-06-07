import { useConfigurables } from "~/modules/configurables";
import { useGame } from "../../state/store";

interface Props {
  onStart: () => void;
  onContinue: () => void;
}

export function StartScreen({ onStart, onContinue }: Props) {
  const { config } = useConfigurables();
  const { state } = useGame();

  const title = config?.appName ?? "Hongdae Korean Quest";
  const tagline = config?.tagline ?? "A cozy pixel adventure through Hongdae, Seoul";
  const description =
    config?.startDescription ??
    "Walk the streets, talk to locals, and learn real Korean — one cozy conversation at a time.";
  const startLabel = config?.startButtonLabel ?? "Start Your Adventure";
  const hasSave = state.created;

  return (
    <div
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden p-4"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, #f6b56a 0%, #e8964a 30%, #9a5a86 70%, #3a2f44 100%)",
      }}
    >
      {/* pixel skyline silhouette */}
      <Skyline />

      <div className="hq-panel hq-slide-up relative z-10 w-full max-w-md p-6 text-center sm:p-8">
        {config?.logoUrl && !config.logoUrl.startsWith("FILL_") ? (
          <img
            src={config.logoUrl}
            alt=""
            className="pixel-canvas mx-auto mb-3 h-16 w-16 rounded-xl object-cover"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
        ) : null}

        <h1
          className="font-pixel mx-auto mb-2 text-balance leading-relaxed"
          style={{ color: "var(--hq-ink)", fontSize: "clamp(15px, 4.5vw, 22px)" }}
        >
          {title}
        </h1>
        <p className="font-korean mb-4 text-sm font-medium" style={{ color: "#8a5a3c" }}>
          {tagline}
        </p>

        <div
          className="mb-6 rounded-xl border-2 p-4 text-left text-sm leading-relaxed"
          style={{ background: "var(--hq-panel-2)", borderColor: "var(--hq-panel-edge)", color: "#5a4030" }}
        >
          {description}
        </div>

        <div className="flex flex-col gap-3">
          {hasSave && (
            <button className="hq-btn" onClick={onContinue}>
              Continue ({state.playerName})
            </button>
          )}
          <button className={hasSave ? "hq-btn hq-btn-ghost" : "hq-btn"} onClick={onStart}>
            {hasSave ? "New Game" : startLabel}
          </button>
        </div>

        <p className="font-korean mt-5 text-xs" style={{ color: "#a07a52" }}>
          Move with WASD / arrows · Press E to talk · Learn Korean as you explore
        </p>
      </div>
    </div>
  );
}

function Skyline() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex items-end justify-center opacity-90">
      <svg
        width="100%"
        height="220"
        viewBox="0 0 200 60"
        preserveAspectRatio="xMidYMax slice"
        style={{ imageRendering: "pixelated" }}
      >
        {Array.from({ length: 26 }).map((_, i) => {
          const h = 18 + ((i * 37) % 30);
          const w = 6 + ((i * 13) % 4);
          const x = i * 8;
          const lit = (i * 7) % 3 === 0;
          return (
            <g key={i}>
              <rect x={x} y={60 - h} width={w} height={h} fill={lit ? "#4a3a58" : "#3a2f44"} />
              {Array.from({ length: 3 }).map((_, j) =>
                (i + j) % 2 === 0 ? (
                  <rect
                    key={j}
                    x={x + 1}
                    y={60 - h + 3 + j * 5}
                    width={1.5}
                    height={2}
                    fill="#ffd27a"
                    opacity={0.85}
                  />
                ) : null,
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
