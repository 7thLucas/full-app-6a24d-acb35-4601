import type { Interactable } from "../../engine/useGameEngine";
import { NPCS_BY_ID } from "../../data/npcs";
import { OBJECTS_BY_ID } from "../../data/objects";

export function InteractPrompt({ target }: { target: Interactable | null }) {
  if (!target) return null;
  const name =
    target.kind === "npc"
      ? NPCS_BY_ID[target.id]?.name
      : OBJECTS_BY_ID[target.id]?.name;

  return (
    <div className="pointer-events-none absolute bottom-[78px] left-1/2 z-20 -translate-x-1/2">
      <div
        className="hq-bob flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{ background: "rgba(58,42,40,0.9)", border: "2px solid #ffe6bd" }}
      >
        <span
          className="font-pixel flex h-5 w-5 items-center justify-center rounded-md text-[10px]"
          style={{ background: "var(--hq-amber)", color: "#fff6e9", border: "2px solid #fff6e9" }}
        >
          E
        </span>
        <span className="font-korean text-[12px] font-semibold text-[#ffe6bd]">
          Talk to {name}
        </span>
      </div>
    </div>
  );
}
