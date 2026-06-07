import { useGame } from "../../state/store";
import { MenuShell } from "./MenuShell";
import { BADGES } from "../../data/progression";
import { BadgeGlyph } from "../PixelIcon";

export function Badges({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const earned = new Set(state.earnedBadgeIds);

  return (
    <MenuShell title="BADGES" onClose={onClose} accent="var(--hq-lilac)">
      <p className="font-korean mb-4 text-[12px]" style={{ color: "#8a6a4a" }}>
        {earned.size} of {BADGES.length} badges earned. Keep exploring Hongdae to collect them all!
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {BADGES.map((b) => {
          const got = earned.has(b.id);
          return (
            <div
              key={b.id}
              className="flex flex-col items-center rounded-xl p-3 text-center"
              style={{
                background: got ? "var(--hq-panel-2)" : "rgba(58,42,40,0.05)",
                border: `2px solid ${got ? "var(--hq-panel-edge)" : "rgba(58,42,40,0.18)"}`,
                opacity: got ? 1 : 0.6,
              }}
            >
              <div className="mb-2" style={{ filter: got ? "none" : "grayscale(1)" }}>
                <BadgeGlyph icon={b.icon} size={34} />
              </div>
              <div className="font-korean text-[12px] font-bold" style={{ color: "var(--hq-ink)" }}>
                {got ? b.name : "Locked"}
              </div>
              <div className="font-korean mt-0.5 text-[10px] leading-tight" style={{ color: "#8a6a4a" }}>
                {got ? b.description : "Keep playing to unlock."}
              </div>
            </div>
          );
        })}
      </div>
    </MenuShell>
  );
}
