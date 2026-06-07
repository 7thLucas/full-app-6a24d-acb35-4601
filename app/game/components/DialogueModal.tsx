import { useMemo, useState } from "react";
import { useGame } from "../state/store";
import { NPCS_BY_ID } from "../data/npcs";
import { OBJECTS_BY_ID } from "../data/objects";
import { CHALLENGES_BY_ID } from "../data/challenges";
import { PHRASES_BY_ID } from "../data/phrases";
import { AvatarPreview } from "./AvatarPreview";
import { audioManager } from "../audio/AudioManager";
import type { Challenge } from "../types";

interface Props {
  targetId: string;
  kind: "npc" | "object";
  onClose: () => void;
}

type Phase = "intro" | "challenge" | "feedback" | "done";

export function DialogueModal({ targetId, kind, onClose }: Props) {
  const { state, resolveChallenge } = useGame();
  const npc = kind === "npc" ? NPCS_BY_ID[targetId] : null;
  const obj = kind === "object" ? OBJECTS_BY_ID[targetId] : null;

  const challengeIds = (npc?.challengeIds ?? obj?.challengeIds ?? []).filter(
    (id) => CHALLENGES_BY_ID[id],
  );
  const challenges: Challenge[] = useMemo(
    () => challengeIds.map((id) => CHALLENGES_BY_ID[id]),
    // eslint-disable-next-line
    [targetId],
  );

  const name = npc?.name ?? obj?.name ?? "";
  const role = npc?.role ?? "Object";
  const intro = npc?.intro ?? obj?.intro ?? "";
  const culturalNote = obj?.culturalNote;

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [unlockedPhraseId, setUnlockedPhraseId] = useState<string | null>(null);

  const settings = state.settings;
  const challenge = challenges[index];

  const startChallenges = () => {
    if (challenges.length === 0) {
      setPhase("done");
      return;
    }
    setPhase("challenge");
  };

  const choose = (optIndex: number) => {
    if (picked !== null || !challenge) return;
    const correct = challenge.options[optIndex].correct;
    setPicked(optIndex);
    setWasCorrect(correct);
    setFeedbackText(correct ? challenge.successFeedback : challenge.hintFeedback);
    audioManager.play(correct ? "correct" : "wrong");

    const newPhrase =
      correct && !state.unlockedPhraseIds.includes(challenge.rewardPhraseId);
    setUnlockedPhraseId(correct ? challenge.rewardPhraseId : null);
    void newPhrase;

    // Commit to store (XP, coins, phrase unlock, quest progress, hearts).
    resolveChallenge(challenge.id, correct, targetId);
    setPhase("feedback");
  };

  const next = () => {
    if (index + 1 < challenges.length) {
      setIndex(index + 1);
      setPicked(null);
      setUnlockedPhraseId(null);
      setPhase("challenge");
    } else {
      setPhase("done");
    }
  };

  const rewardPhrase = challenge ? PHRASES_BY_ID[challenge.rewardPhraseId] : null;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center p-2 sm:p-4">
      {/* click-away dimmer (gentle) */}
      <button
        className="absolute inset-0 cursor-default bg-black/20"
        aria-label="Close dialogue"
        onClick={onClose}
      />

      <div className="hq-panel hq-slide-up relative z-10 w-full max-w-2xl p-4 sm:p-5">
        {/* Header: avatar + name tag */}
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex-none rounded-xl p-1"
            style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
          >
            {npc ? (
              <AvatarPreview palette={npc.palette} size={52} dir="down" animate={false} />
            ) : (
              <div className="flex h-[52px] w-[52px] items-center justify-center">
                <span className="font-pixel text-[18px]" style={{ color: "var(--hq-amber-dark)" }}>
                  ?
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-pixel text-[11px]" style={{ color: "var(--hq-ink)" }}>
              {name}
            </div>
            <div className="font-korean text-[11px]" style={{ color: "#8a5a3c" }}>
              {role}
            </div>
          </div>
          <button
            className="font-pixel rounded-md px-2 py-1 text-[9px]"
            style={{ color: "#8a5a3c", background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        {/* Body */}
        {phase === "intro" && (
          <div className="hq-fade-in">
            <p className="font-korean mb-3 text-[15px] leading-relaxed" style={{ color: "#4a3428" }}>
              {intro}
            </p>
            {culturalNote && (
              <div
                className="mb-3 rounded-lg p-2.5 text-[12px] leading-relaxed"
                style={{ background: "#eef6f0", border: "2px solid #bcd9c4", color: "#3f6a4c" }}
              >
                <span className="font-semibold">Culture note: </span>
                {culturalNote}
              </div>
            )}
            <div className="flex justify-end">
              <button className="hq-btn" onClick={startChallenges}>
                {challenges.length > 0 ? "Let's learn" : "Got it"}
              </button>
            </div>
          </div>
        )}

        {phase === "challenge" && challenge && (
          <div className="hq-fade-in">
            <Stepper count={challenges.length} index={index} />
            <p className="font-korean mb-1 text-[15px] leading-relaxed" style={{ color: "#4a3428" }}>
              {challenge.prompt}
            </p>
            {challenge.promptKorean && (
              <p
                className="font-korean mb-3 text-center text-[20px] font-bold"
                style={{ color: "var(--hq-ink)" }}
              >
                {challenge.promptKorean}
              </p>
            )}
            <div className="grid gap-2">
              {challenge.options.map((opt, i) => (
                <button
                  key={i}
                  className="hq-answer font-korean text-[15px]"
                  style={{ color: "#3a2a28" }}
                  onClick={() => choose(i)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "feedback" && challenge && (
          <div className="hq-fade-in">
            <Stepper count={challenges.length} index={index} />
            <div className="mb-3 grid gap-2">
              {challenge.options.map((opt, i) => {
                const isPicked = picked === i;
                const cls = opt.correct
                  ? "hq-answer hq-answer-correct"
                  : isPicked
                    ? "hq-answer hq-answer-wrong"
                    : "hq-answer";
                return (
                  <div key={i} className={`${cls} font-korean text-[15px]`} style={{ color: "#3a2a28" }}>
                    {opt.text}
                    {opt.correct && <span className="ml-2 text-[#3f8a4c]">✓</span>}
                  </div>
                );
              })}
            </div>

            <div
              className="mb-3 rounded-lg p-3 text-[14px] leading-relaxed"
              style={{
                background: wasCorrect ? "#eaf7e6" : "#fbeee4",
                border: `2px solid ${wasCorrect ? "#9cd49a" : "#e6c2a4"}`,
                color: wasCorrect ? "#357a3e" : "#8a5a3c",
              }}
            >
              {feedbackText}
            </div>

            {/* Phrase card (always show the taught phrase, hangul-first) */}
            {rewardPhrase && (
              <div
                className="mb-3 rounded-xl p-3"
                style={{ background: "var(--hq-panel-2)", border: "2px solid var(--hq-panel-edge)" }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-pixel text-[8px]" style={{ color: "var(--hq-amber-dark)" }}>
                    {unlockedPhraseId ? "PHRASE UNLOCKED" : "PHRASE"}
                  </span>
                  <span
                    className="font-pixel rounded px-1.5 py-0.5 text-[7px]"
                    style={{
                      color: "#fff",
                      background: rewardPhrase.register === "casual" ? "var(--hq-rose)" : "var(--hq-mint)",
                    }}
                  >
                    {rewardPhrase.register === "casual" ? "CASUAL" : "POLITE"}
                  </span>
                </div>
                <div className="font-korean text-[22px] font-bold" style={{ color: "var(--hq-ink)" }}>
                  {rewardPhrase.korean}
                </div>
                {settings.showRomanization && (
                  <div className="font-korean text-[13px] italic" style={{ color: "#a07a52" }}>
                    {rewardPhrase.romanization}
                  </div>
                )}
                {settings.showEnglish && (
                  <div className="font-korean text-[14px] font-medium" style={{ color: "#5a4030" }}>
                    {rewardPhrase.english}
                  </div>
                )}
                <div className="font-korean mt-1.5 text-[12px] leading-relaxed" style={{ color: "#7a6452" }}>
                  {rewardPhrase.usageNote}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button className="hq-btn" onClick={next}>
                {index + 1 < challenges.length ? "Next" : "Finish"}
              </button>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="hq-fade-in text-center">
            <p className="font-korean mb-4 text-[15px] leading-relaxed" style={{ color: "#4a3428" }}>
              {npc
                ? `Great chatting! Come back anytime to practice more, ${state.playerName}.`
                : "Nice — you read that like a local. Keep exploring!"}
            </p>
            <button className="hq-btn" onClick={onClose}>
              Continue exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ count, index }: { count: number; index: number }) {
  if (count <= 1) return null;
  return (
    <div className="mb-2 flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 flex-1 rounded-full"
          style={{
            background: i <= index ? "var(--hq-amber)" : "rgba(58,42,40,0.18)",
          }}
        />
      ))}
    </div>
  );
}
