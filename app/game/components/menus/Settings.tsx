import { useEffect, useState } from "react";
import { useGame } from "../../state/store";
import { MenuShell } from "./MenuShell";
import { audioManager } from "../../audio/AudioManager";
import type { GameSettings } from "../../types";

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5"
      style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
    >
      <span className="font-korean text-[13px] font-medium" style={{ color: "#5a4030" }}>
        {label}
      </span>
      <span
        className="relative h-6 w-11 rounded-full transition"
        style={{ background: value ? "var(--hq-mint)" : "rgba(58,42,40,0.25)", border: "2px solid var(--hq-ink)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
          style={{ left: value ? "22px" : "2px" }}
        />
      </span>
    </button>
  );
}

export function Settings({ onClose }: { onClose: () => void }) {
  const { state, updateSettings, reset } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  // Keep AudioManager in sync with settings whenever they change.
  useEffect(() => {
    audioManager.setMusicEnabled(state.settings.musicOn);
    audioManager.setSfxEnabled(state.settings.sfxOn);
  }, [state.settings.musicOn, state.settings.sfxOn]);

  const set = (patch: Partial<GameSettings>) => updateSettings(patch);

  return (
    <MenuShell title="SETTINGS" onClose={onClose} accent="#6a9e8a">
      <div className="space-y-3">
        <div className="font-pixel text-[9px]" style={{ color: "var(--hq-amber-dark)" }}>
          AUDIO
        </div>
        <Toggle label="Music & ambience" value={state.settings.musicOn} onChange={(v) => set({ musicOn: v })} />
        <Toggle label="Sound effects" value={state.settings.sfxOn} onChange={(v) => set({ sfxOn: v })} />

        <div className="font-pixel pt-2 text-[9px]" style={{ color: "var(--hq-amber-dark)" }}>
          LEARNING DISPLAY
        </div>
        <Toggle
          label="Show romanization"
          value={state.settings.showRomanization}
          onChange={(v) => set({ showRomanization: v })}
        />
        <Toggle
          label="Show English meaning"
          value={state.settings.showEnglish}
          onChange={(v) => set({ showEnglish: v })}
        />

        <div className="font-pixel pt-2 text-[9px]" style={{ color: "#c0504a" }}>
          DANGER ZONE
        </div>
        {!confirmReset ? (
          <button
            className="font-korean w-full rounded-xl px-3 py-2.5 text-[13px] font-semibold"
            style={{ background: "#fbeee4", border: "2px solid #e0a07a", color: "#b04a3a" }}
            onClick={() => setConfirmReset(true)}
          >
            Reset all progress
          </button>
        ) : (
          <div
            className="rounded-xl p-3 hq-fade-in"
            style={{ background: "#fbeee4", border: "2px solid #e0a07a" }}
          >
            <p className="font-korean mb-3 text-[12px]" style={{ color: "#8a4a3a" }}>
              This erases your level, phrases, quests, and badges. This can't be undone.
            </p>
            <div className="flex gap-2">
              <button
                className="hq-btn hq-btn-ghost flex-1"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
              <button
                className="font-pixel flex-1 rounded-xl px-3 py-2.5 text-[11px] text-white"
                style={{ background: "#c0504a", border: "3px solid var(--hq-ink)", boxShadow: "0 4px 0 #8a3a34" }}
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </MenuShell>
  );
}
