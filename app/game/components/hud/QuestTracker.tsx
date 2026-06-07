import { useGame } from "../../state/store";
import { QUESTS_BY_ID } from "../../data/quests";

export function QuestTracker() {
  const { state } = useGame();

  // Prefer the first active MAIN quest; fall back to any active quest.
  const activeMain = state.activeQuestIds
    .map((id) => QUESTS_BY_ID[id])
    .filter(Boolean)
    .sort((a, b) => (a.kind === "main" ? -1 : 1) - (b.kind === "main" ? -1 : 1));
  const quest = activeMain[0];
  if (!quest) return null;

  const done = state.objectiveProgress[quest.id] ?? [];

  return (
    <div className="pointer-events-none absolute right-2 top-[92px] z-20 sm:right-3 sm:top-[104px]">
      <div className="hq-panel pointer-events-auto w-[210px] max-w-[60vw] p-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          <span
            className="font-pixel rounded px-1.5 py-0.5 text-[7px]"
            style={{
              color: "#fff6e9",
              background: quest.kind === "main" ? "var(--hq-amber)" : "var(--hq-mint)",
            }}
          >
            {quest.kind === "main" ? "QUEST" : "SIDE"}
          </span>
          <span className="font-korean truncate text-[11px] font-bold" style={{ color: "var(--hq-ink)" }}>
            {quest.title}
          </span>
        </div>
        <ul className="space-y-1">
          {quest.objectives.map((o) => {
            const isDone = done.includes(o.id);
            return (
              <li key={o.id} className="flex items-start gap-1.5">
                <span
                  className="mt-0.5 inline-flex h-3 w-3 flex-none items-center justify-center rounded-sm border"
                  style={{
                    borderColor: isDone ? "#5fbf6a" : "var(--hq-panel-edge)",
                    background: isDone ? "#5fbf6a" : "transparent",
                  }}
                >
                  {isDone && (
                    <svg width="8" height="8" viewBox="0 0 8 8">
                      <path d="M1 4 L3 6 L7 1" stroke="#fff" strokeWidth="1.4" fill="none" />
                    </svg>
                  )}
                </span>
                <span
                  className="font-korean text-[10px] leading-tight"
                  style={{ color: isDone ? "#9a8a72" : "#5a4030", textDecoration: isDone ? "line-through" : "none" }}
                >
                  {o.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
