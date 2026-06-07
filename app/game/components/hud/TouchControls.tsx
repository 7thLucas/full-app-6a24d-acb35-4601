import { useEffect } from "react";

// On-screen D-pad for touch devices. Dispatches synthetic keyboard events so
// the engine's existing keyboard handler drives movement — no extra coupling.

const KEY_MAP: Record<string, string> = {
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
};

function press(key: string, down: boolean) {
  const ev = new KeyboardEvent(down ? "keydown" : "keyup", { key });
  window.dispatchEvent(ev);
}

export function TouchControls() {
  // Release all on unmount.
  useEffect(() => {
    return () => Object.values(KEY_MAP).forEach((k) => press(k, false));
  }, []);

  const dirBtn = (dir: keyof typeof KEY_MAP, label: string, cls: string) => (
    <button
      className={`flex items-center justify-center rounded-lg text-[18px] font-bold ${cls}`}
      style={{
        background: "rgba(58,42,40,0.78)",
        border: "2px solid #ffe6bd",
        color: "#ffe6bd",
        width: 44,
        height: 44,
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        press(KEY_MAP[dir], true);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        press(KEY_MAP[dir], false);
      }}
      onPointerLeave={() => press(KEY_MAP[dir], false)}
      onPointerCancel={() => press(KEY_MAP[dir], false)}
      aria-label={`Move ${dir}`}
    >
      {label}
    </button>
  );

  return (
    <div className="pointer-events-none absolute bottom-[110px] left-3 z-20 sm:hidden">
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1" style={{ width: 140 }}>
        <span />
        {dirBtn("up", "▲", "")}
        <span />
        {dirBtn("left", "◀", "")}
        <span />
        {dirBtn("right", "▶", "")}
        <span />
        {dirBtn("down", "▼", "")}
        <span />
      </div>
    </div>
  );
}
