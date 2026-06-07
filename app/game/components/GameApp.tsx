import { useEffect, useState } from "react";
import { GameProvider, useGame } from "../state/store";
import { StartScreen } from "./screens/StartScreen";
import { CharacterSetup } from "./screens/CharacterSetup";
import { GameScreen } from "./screens/GameScreen";

type Screen = "start" | "setup" | "game";

function Flow() {
  const { state, hydrated } = useGame();
  const [screen, setScreen] = useState<Screen>("start");
  const [mounted, setMounted] = useState(false);

  // Avoid SSR/CSR mismatch: only render after client hydration of the save.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: "#2a2230" }}>
        <span className="font-pixel text-[12px]" style={{ color: "#e8964a" }}>
          Loading Hongdae…
        </span>
      </div>
    );
  }

  if (screen === "game") return <GameScreen />;
  if (screen === "setup")
    return <CharacterSetup onBack={() => setScreen("start")} onDone={() => setScreen("game")} />;

  return (
    <StartScreen
      onStart={() => setScreen("setup")}
      onContinue={() => {
        if (state.created) setScreen("game");
        else setScreen("setup");
      }}
    />
  );
}

export function GameApp() {
  return (
    <GameProvider>
      <Flow />
    </GameProvider>
  );
}
