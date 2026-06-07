import { useGame } from "../../state/store";
import { MenuShell } from "./MenuShell";
import { QUESTS } from "../../data/quests";
import { CoinIcon } from "../PixelIcon";

export function QuestLog({ onClose }: { onClose: () => void }) {
  const { state } = useGame();

  const status = (id: string): "active" | "completed" | "locked" => {
    if (state.completedQuestIds.includes(id)) return "completed";
    if (state.activeQuestIds.includes(id)) return "active";
    return "locked";
  };

  const sorted = [...QUESTS].sort((a, b) => {
    const order = { main: 0, side: 1 };
    return order[a.kind] - order[b.kind];
  });

  return (
    <MenuShell title="QUEST LOG" onClose={onClose} accent="var(--hq-amber)">
      <div className="space-y-2.5">
        {sorted.map((q) => {
          const st = status(q.id);
          const done = state.objectiveProgress[q.id] ?? [];
          const tint =
            st === "completed" ? "#eef6f0" : st === "active" ? "var(--hq-panel-2)" : "rgba(58,42,40,0.06)";
          const edge =
            st === "completed" ? "#9cd49a" : st === "active" ? "var(--hq-panel-edge)" : "rgba(58,42,40,0.2)";
          return (
            <div
              key={q.id}
              className="rounded-xl p-3"
              style={{ background: tint, border: `2px solid ${edge}` }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="font-pixel rounded px-1.5 py-0.5 text-[7px]"
                  style={{
                    color: "#fff6e9",
                    background:
                      st === "completed"
                        ? "#5fbf6a"
                        : q.kind === "main"
                          ? "var(--hq-amber)"
                          : "var(--hq-mint)",
                  }}
                >
                  {st === "completed" ? "DONE" : q.kind === "main" ? "MAIN" : "SIDE"}
                </span>
                <span
                  className="font-korean flex-1 text-[14px] font-bold"
                  style={{ color: st === "locked" ? "#a89a88" : "var(--hq-ink)" }}
                >
                  {st === "locked" ? "Locked quest" : q.title}
                </span>
              </div>

              {st !== "locked" ? (
                <>
                  <div className="font-korean text-[11px]" style={{ color: "#8a6a4a" }}>
                    📍 {q.location}
                  </div>
                  <div className="font-korean mt-1 text-[12px] leading-relaxed" style={{ color: "#6a4a30" }}>
                    {q.summary}
                  </div>
                  {st === "active" && (
                    <ul className="mt-2 space-y-1">
                      {q.objectives.map((o) => {
                        const isDone = done.includes(o.id);
                        return (
                          <li
                            key={o.id}
                            className="font-korean flex items-center gap-1.5 text-[11px]"
                            style={{ color: isDone ? "#9a8a72" : "#5a4030" }}
                          >
                            <span style={{ color: isDone ? "#5fbf6a" : "var(--hq-amber)" }}>
                              {isDone ? "✓" : "○"}
                            </span>
                            <span style={{ textDecoration: isDone ? "line-through" : "none" }}>
                              {o.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-pixel text-[8px]" style={{ color: "var(--hq-amber-dark)" }}>
                      +{q.rewardXp} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <CoinIcon size={14} />
                      <span className="font-pixel text-[8px]" style={{ color: "#b8923a" }}>
                        {q.rewardCoins}
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="font-korean text-[11px]" style={{ color: "#a89a88" }}>
                  Complete earlier quests to unlock this one.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MenuShell>
  );
}
