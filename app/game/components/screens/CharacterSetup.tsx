import { useState } from "react";
import { useConfigurables } from "~/modules/configurables";
import { useGame } from "../../state/store";
import { AVATAR_PALETTES } from "../../data/progression";
import type { AvatarPaletteId } from "../../types";
import { AvatarPreview } from "../AvatarPreview";

interface Props {
  onBack: () => void;
  onDone: () => void;
}

export function CharacterSetup({ onBack, onDone }: Props) {
  const { config } = useConfigurables();
  const { createPlayer } = useGame();
  const defaultName = config?.defaultPlayerName || "Alex";
  const [name, setName] = useState(defaultName);
  const [palette, setPalette] = useState<AvatarPaletteId>("amber");

  const selected = AVATAR_PALETTES.find((p) => p.id === palette)!;

  const start = () => {
    createPlayer(name, palette);
    onDone();
  };

  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, #f6b56a 0%, #e8964a 35%, #9a5a86 75%, #3a2f44 100%)",
      }}
    >
      <div className="hq-panel hq-slide-up w-full max-w-md p-6">
        <h2 className="font-pixel mb-1 text-center text-lg" style={{ color: "var(--hq-ink)" }}>
          Who are you?
        </h2>
        <p className="font-korean mb-5 text-center text-sm" style={{ color: "#8a5a3c" }}>
          Set up your traveler before arriving in Hongdae.
        </p>

        <div className="mb-5 flex flex-col items-center gap-3">
          <div
            className="rounded-2xl p-3"
            style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
          >
            <AvatarPreview palette={selected} size={104} />
          </div>
        </div>

        <label className="font-korean mb-1 block text-xs font-semibold" style={{ color: "#7a5236" }}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 16))}
          placeholder={defaultName}
          className="font-korean mb-5 w-full rounded-xl border-2 px-3 py-2 text-sm outline-none focus:border-[var(--hq-amber)]"
          style={{ background: "#fff", borderColor: "var(--hq-panel-edge)", color: "var(--hq-ink)" }}
        />

        <label className="font-korean mb-2 block text-xs font-semibold" style={{ color: "#7a5236" }}>
          Outfit color
        </label>
        <div className="mb-6 grid grid-cols-4 gap-2">
          {AVATAR_PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p.id)}
              className="flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition"
              style={{
                borderColor: palette === p.id ? "var(--hq-amber)" : "var(--hq-panel-edge)",
                background: palette === p.id ? "#ffeccc" : "var(--hq-panel-2)",
                transform: palette === p.id ? "translateY(-2px)" : "none",
              }}
            >
              <span
                className="h-6 w-6 rounded-full"
                style={{ background: p.top, border: "2px solid #3a2a28" }}
              />
              <span className="font-korean text-[10px]" style={{ color: "#7a5236" }}>
                {p.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="hq-btn hq-btn-ghost flex-1" onClick={onBack}>
            Back
          </button>
          <button className="hq-btn flex-1" onClick={start}>
            Arrive
          </button>
        </div>
      </div>
    </div>
  );
}
