import { useState } from "react";
import { useGame } from "../../state/store";
import { MenuShell } from "./MenuShell";
import { PHRASES_BY_ID } from "../../data/phrases";

export function DailyPhrase({ onClose }: { onClose: () => void }) {
  const { state, dailyPhraseId, dailyClaimed, claimDaily } = useGame();
  const phrase = PHRASES_BY_ID[dailyPhraseId];
  const [revealed, setRevealed] = useState(dailyClaimed);
  const [picked, setPicked] = useState<boolean | null>(dailyClaimed ? true : null);

  if (!phrase) return null;

  const handleClaim = () => {
    claimDaily(dailyPhraseId);
    setPicked(true);
    setRevealed(true);
  };

  return (
    <MenuShell title="TODAY'S PHRASE" onClose={onClose} accent="#e0b23a">
      <div className="text-center">
        <div
          className="mx-auto mb-4 rounded-2xl p-5"
          style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
        >
          <div className="font-korean text-[28px] font-bold" style={{ color: "var(--hq-ink)" }}>
            {phrase.korean}
          </div>
          {state.settings.showRomanization && (
            <div className="font-korean text-[14px] italic" style={{ color: "#a07a52" }}>
              {phrase.romanization}
            </div>
          )}
          {state.settings.showEnglish && (
            <div className="font-korean mt-1 text-[16px] font-semibold" style={{ color: "#5a4030" }}>
              {phrase.english}
            </div>
          )}
          <div className="font-korean mt-2 text-[12px] leading-relaxed" style={{ color: "#7a6452" }}>
            {phrase.usageNote}
          </div>
        </div>

        {dailyClaimed ? (
          <div
            className="rounded-xl p-3"
            style={{ background: "#eef6f0", border: "2px solid #bcd9c4" }}
          >
            <p className="font-korean text-[13px]" style={{ color: "#3f6a4c" }}>
              You've already practiced today's phrase. Nice work — come back tomorrow!
            </p>
          </div>
        ) : (
          <div>
            <p className="font-korean mb-3 text-[13px]" style={{ color: "#6a4a30" }}>
              Quick challenge: does <b>{phrase.korean}</b> mean "{phrase.english}"?
            </p>
            <div className="flex justify-center gap-3">
              <button className="hq-btn" onClick={handleClaim}>
                Yes! Practice it
              </button>
            </div>
          </div>
        )}
      </div>
    </MenuShell>
  );
}
