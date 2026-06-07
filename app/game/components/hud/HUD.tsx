import { useGame } from "../../state/store";
import {
  confidenceTier,
  levelForXp,
  levelProgress,
  nextLevel,
} from "../../data/progression";
import { CoinIcon, FlameIcon, HeartIcon } from "../PixelIcon";

export function HUD() {
  const { state } = useGame();
  const lvl = levelForXp(state.xp);
  const nxt = nextLevel(lvl.level);
  const prog = levelProgress(state.xp, lvl.level);
  const confTier = confidenceTier(state.confidence);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-2 sm:p-3">
      {/* Left: level + XP + confidence */}
      <div className="hq-panel pointer-events-auto w-[230px] max-w-[64vw] p-2.5 sm:w-[260px]">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-pixel text-[9px]" style={{ color: "var(--hq-amber-dark)" }}>
            LV {lvl.level}
          </span>
          <span className="font-korean truncate text-[10px] font-semibold" style={{ color: "#7a5236" }}>
            {lvl.name}
          </span>
        </div>
        <div className="hq-bar mb-1.5">
          <div
            className="hq-bar-fill"
            style={{ width: `${prog * 100}%`, background: "var(--hq-amber)" }}
          />
        </div>
        <div className="mb-0.5 flex items-center justify-between">
          <span className="font-pixel text-[7px]" style={{ color: "#9a7a52" }}>
            XP {state.xp}
            {nxt ? ` / ${nxt.xpRequired}` : " · MAX"}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-pixel text-[7px]" style={{ color: "#5a8f8a" }}>
            KOREAN
          </span>
          <span className="font-korean text-[9px] font-semibold" style={{ color: "#4c8ca0" }}>
            {confTier}
          </span>
        </div>
        <div className="hq-bar mt-1" style={{ height: 10 }}>
          <div
            className="hq-bar-fill"
            style={{ width: `${state.confidence}%`, background: "var(--hq-mint)" }}
          />
        </div>
      </div>

      {/* Right: streak / coins / hearts */}
      <div className="hq-panel pointer-events-auto flex items-center gap-3 px-3 py-2">
        <div className="flex items-center gap-1">
          <FlameIcon size={18} className="hq-flame" />
          <span className="font-pixel text-[10px]" style={{ color: "#c97a32" }}>
            {state.streak}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CoinIcon size={18} />
          <span className="font-pixel text-[10px]" style={{ color: "#b8923a" }}>
            {state.coins}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: state.maxHearts }).map((_, i) => (
            <HeartIcon key={i} size={16} filled={i < state.hearts} />
          ))}
        </div>
      </div>
    </div>
  );
}
