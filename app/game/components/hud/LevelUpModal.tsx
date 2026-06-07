import { useEffect } from "react";
import { useGame } from "../../state/store";
import { CoinIcon, StarIcon } from "../PixelIcon";
import { audioManager } from "../../audio/AudioManager";

export function LevelUpModal() {
  const { state, clearLevelUp } = useGame();
  const evt = state.levelUp;

  useEffect(() => {
    if (evt) audioManager.play("levelup");
  }, [evt]);

  if (!evt) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 hq-fade-in">
      {/* confetti */}
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-1/3 h-2 w-2 rounded-sm"
          style={{
            left: `${(i * 53) % 100}%`,
            background: ["#e8964a", "#7fb7a6", "#d98aa8", "#f5c84a", "#a890d4"][i % 5],
            animation: `hq-confetti ${1 + (i % 5) * 0.2}s ${(i % 4) * 0.1}s ease-in forwards`,
          }}
        />
      ))}
      <div className="hq-panel hq-pop w-[300px] max-w-[88vw] p-6 text-center">
        <div className="mx-auto mb-2 flex justify-center">
          <StarIcon size={40} />
        </div>
        <div className="font-pixel mb-1 text-sm" style={{ color: "var(--hq-amber-dark)" }}>
          LEVEL UP!
        </div>
        <div className="font-pixel mb-2 text-2xl" style={{ color: "var(--hq-ink)" }}>
          {evt.level}
        </div>
        <div className="font-korean mb-4 text-base font-bold" style={{ color: "#8a5a3c" }}>
          {evt.name}
        </div>
        <div
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5"
          style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
        >
          <CoinIcon size={18} />
          <span className="font-pixel text-[11px]" style={{ color: "#b8923a" }}>
            +{evt.coins}
          </span>
        </div>
        <button className="hq-btn w-full" onClick={clearLevelUp}>
          Keep Going
        </button>
      </div>
    </div>
  );
}
