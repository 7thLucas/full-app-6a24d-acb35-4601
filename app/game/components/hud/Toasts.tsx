import { useEffect } from "react";
import { useGame, type Toast } from "../../state/store";

const KIND_COLOR: Record<Toast["kind"], string> = {
  xp: "#e8964a",
  coin: "#e0b23a",
  phrase: "#7fb7a6",
  friend: "#d98aa8",
  badge: "#a890d4",
  level: "#f5c84a",
  info: "#6a9e7c",
};

function ToastItem({ t }: { t: Toast }) {
  const { dismissToast } = useGame();
  useEffect(() => {
    const id = setTimeout(() => dismissToast(t.id), 2400);
    return () => clearTimeout(id);
  }, [t.id, dismissToast]);

  return (
    <div
      className="hq-toast font-pixel rounded-lg px-3 py-1.5 text-[10px] text-white shadow-lg"
      style={{
        background: KIND_COLOR[t.kind],
        border: "2px solid rgba(58,42,40,0.6)",
        textShadow: "0 1px 0 rgba(0,0,0,0.25)",
      }}
    >
      {t.text}
    </div>
  );
}

export function Toasts() {
  const { state } = useGame();
  return (
    <div className="pointer-events-none absolute bottom-[150px] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5">
      {state.toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
