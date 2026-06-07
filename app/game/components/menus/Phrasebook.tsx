import { useMemo, useState } from "react";
import { useGame } from "../../state/store";
import { MenuShell } from "./MenuShell";
import { PHRASES, PHRASES_BY_ID } from "../../data/phrases";
import { CATEGORY_COLORS, PHRASE_CATEGORIES } from "../../data/progression";
import type { MasteryStatus, PhraseCategory } from "../../types";

const MASTERY_COLOR: Record<MasteryStatus, string> = {
  New: "#9aa0a6",
  Practiced: "#e0b23a",
  Remembered: "#7fb7a6",
  Confident: "#5fbf6a",
};

export function Phrasebook({ onClose }: { onClose: () => void }) {
  const { state, reviewPhrase } = useGame();
  const [cat, setCat] = useState<PhraseCategory>("Basics");

  const unlocked = useMemo(() => new Set(state.unlockedPhraseIds), [state.unlockedPhraseIds]);

  const totalByCat = useMemo(() => {
    const m: Record<string, { total: number; got: number }> = {};
    for (const c of PHRASE_CATEGORIES) m[c] = { total: 0, got: 0 };
    for (const p of PHRASES) {
      m[p.category].total++;
      if (unlocked.has(p.id)) m[p.category].got++;
    }
    return m;
  }, [unlocked]);

  const catPhrases = PHRASES.filter((p) => p.category === cat);
  const [reviewId, setReviewId] = useState<string | null>(null);

  return (
    <MenuShell title="PHRASEBOOK" onClose={onClose} accent="#7a9e7c">
      {/* Category tabs with progress */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {PHRASE_CATEGORIES.map((c) => {
          const { total, got } = totalByCat[c];
          const active = c === cat;
          return (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setReviewId(null);
              }}
              className="font-korean rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition"
              style={{
                background: active ? CATEGORY_COLORS[c] : "var(--hq-panel-2)",
                color: active ? "#fff6e9" : "#6a4a30",
                border: `2px solid ${active ? "var(--hq-ink)" : "var(--hq-panel-edge)"}`,
              }}
            >
              {c}{" "}
              <span className="opacity-80">
                {got}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Phrase entries */}
      <div className="space-y-2">
        {catPhrases.map((p) => {
          const got = unlocked.has(p.id);
          const mastery = state.phraseMastery[p.id] ?? "New";
          if (!got) {
            return (
              <div
                key={p.id}
                className="rounded-xl p-3"
                style={{ background: "rgba(58,42,40,0.05)", border: "2px dashed var(--hq-panel-edge)" }}
              >
                <div className="font-korean text-[14px] font-bold" style={{ color: "#b0a090" }}>
                  ??? <span className="text-[11px] font-normal">— not learned yet</span>
                </div>
                <div className="font-korean text-[11px]" style={{ color: "#b0a090" }}>
                  {p.situation}
                </div>
              </div>
            );
          }
          return (
            <div
              key={p.id}
              className="rounded-xl p-3"
              style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-korean text-[19px] font-bold" style={{ color: "var(--hq-ink)" }}>
                    {p.korean}
                  </div>
                  {state.settings.showRomanization && (
                    <div className="font-korean text-[12px] italic" style={{ color: "#a07a52" }}>
                      {p.romanization}
                    </div>
                  )}
                  {state.settings.showEnglish && (
                    <div className="font-korean text-[13px] font-medium" style={{ color: "#5a4030" }}>
                      {p.english}
                    </div>
                  )}
                </div>
                <span
                  className="font-pixel flex-none rounded px-1.5 py-0.5 text-[7px]"
                  style={{ background: MASTERY_COLOR[mastery], color: "#fff" }}
                >
                  {mastery.toUpperCase()}
                </span>
              </div>
              <div className="font-korean mt-1.5 text-[11px] leading-relaxed" style={{ color: "#7a6452" }}>
                {p.usageNote}
              </div>

              {reviewId === p.id ? (
                <div
                  className="mt-2 rounded-lg p-2.5 hq-fade-in"
                  style={{ background: "#eef6f0", border: "2px solid #bcd9c4" }}
                >
                  <div className="font-korean mb-2 text-[12px]" style={{ color: "#3f6a4c" }}>
                    Quick review — what does <b>{p.korean}</b> mean?
                  </div>
                  <button
                    className="hq-btn hq-btn-ghost w-full"
                    onClick={() => {
                      reviewPhrase(p.id);
                      setReviewId(null);
                    }}
                  >
                    {p.english} ✓
                  </button>
                </div>
              ) : (
                <button
                  className="font-pixel mt-2 rounded-md px-2 py-1 text-[8px]"
                  style={{ color: "#3f6a4c", background: "#eef6f0", border: "2px solid #bcd9c4" }}
                  onClick={() => setReviewId(p.id)}
                >
                  REVIEW · +8 XP
                </button>
              )}
            </div>
          );
        })}
      </div>
    </MenuShell>
  );
}
