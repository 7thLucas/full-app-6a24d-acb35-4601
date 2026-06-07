import type { ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  accent?: string;
}

export function MenuShell({ title, onClose, children, accent = "var(--hq-amber)" }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4">
      <button className="absolute inset-0 cursor-default bg-black/45" aria-label="Close" onClick={onClose} />
      <div className="hq-panel hq-slide-up relative z-10 flex max-h-[88dvh] w-full max-w-2xl flex-col p-0">
        <div
          className="flex items-center justify-between rounded-t-[9px] px-4 py-3"
          style={{ background: accent, borderBottom: "3px solid var(--hq-ink)" }}
        >
          <h2 className="font-pixel text-[13px]" style={{ color: "#fff6e9", textShadow: "0 1px 0 rgba(0,0,0,0.25)" }}>
            {title}
          </h2>
          <button
            className="font-pixel rounded-md px-2 py-1 text-[9px]"
            style={{ color: "#fff6e9", background: "rgba(0,0,0,0.2)" }}
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
