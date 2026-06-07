import { BookIcon, StarIcon } from "../PixelIcon";
import { useGame } from "../../state/store";

export type MenuKey = "phrasebook" | "quests" | "badges" | "settings" | "daily";

interface Props {
  onOpen: (key: MenuKey) => void;
}

function MenuButton({
  label,
  onClick,
  badge,
  children,
}: {
  label: string;
  onClick: () => void;
  badge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="hq-btn-ghost relative flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5"
      style={{ boxShadow: "0 3px 0 var(--hq-panel-edge)", border: "2px solid var(--hq-ink)", background: "var(--hq-panel)" }}
      aria-label={label}
    >
      {children}
      <span className="font-pixel text-[7px]" style={{ color: "#7a5236" }}>
        {label}
      </span>
      {badge && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full" style={{ background: "#e85a6a", border: "1.5px solid #fff" }} />
      )}
    </button>
  );
}

export function MenuBar({ onOpen }: Props) {
  const { dailyClaimed } = useGame();
  return (
    <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-3">
      <div className="pointer-events-auto flex gap-2">
        <MenuButton label="DAILY" onClick={() => onOpen("daily")} badge={!dailyClaimed}>
          <StarIcon size={18} />
        </MenuButton>
        <MenuButton label="PHRASES" onClick={() => onOpen("phrasebook")}>
          <BookIcon size={18} />
        </MenuButton>
        <MenuButton label="QUESTS" onClick={() => onOpen("quests")}>
          <span className="font-pixel text-[14px]" style={{ color: "var(--hq-amber)" }}>
            !
          </span>
        </MenuButton>
        <MenuButton label="BADGES" onClick={() => onOpen("badges")}>
          <span className="font-pixel text-[13px]" style={{ color: "var(--hq-lilac)" }}>
            ◆
          </span>
        </MenuButton>
        <MenuButton label="SETTINGS" onClick={() => onOpen("settings")}>
          <span className="text-[15px]" style={{ color: "#6a9e8a" }}>
            ⚙
          </span>
        </MenuButton>
      </div>
    </div>
  );
}
