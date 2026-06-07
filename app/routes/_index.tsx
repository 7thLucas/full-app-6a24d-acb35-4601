import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { GameApp } from "~/game/components/GameApp";

export const meta: MetaFunction = () => [
  { title: "Hongdae Korean Quest" },
  {
    name: "description",
    content:
      "A cozy top-down pixel JRPG that teaches beginner Korean as you explore Hongdae, Seoul.",
  },
];

export default function IndexPage() {
  // The game is fully client-side (canvas + localStorage). Render only on the
  // client to avoid SSR hydration mismatches with the live world.
  const [client, setClient] = useState(false);
  const { loading } = useConfigurables();
  useEffect(() => setClient(true), []);

  if (!client) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: "#2a2230" }}
      >
        <span className="font-pixel text-[12px]" style={{ color: "#e8964a" }}>
          Loading Hongdae…
        </span>
      </div>
    );
  }

  // We don't block on configurables loading — the game has sensible defaults —
  // but reading `loading` keeps the provider engaged for live config updates.
  void loading;

  return <GameApp />;
}
