import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../../state/store";
import { useGameEngine, type Interactable } from "../../engine/useGameEngine";
import { AVATAR_BY_ID } from "../../data/progression";
import { NPCS } from "../../data/npcs";
import { OBJECTS } from "../../data/objects";
import { HUD } from "../hud/HUD";
import { QuestTracker } from "../hud/QuestTracker";
import { Toasts } from "../hud/Toasts";
import { LevelUpModal } from "../hud/LevelUpModal";
import { MenuBar, type MenuKey } from "../hud/MenuBar";
import { InteractPrompt } from "../hud/InteractPrompt";
import { TouchControls } from "../hud/TouchControls";
import { DialogueModal } from "../DialogueModal";
import { Phrasebook } from "../menus/Phrasebook";
import { QuestLog } from "../menus/QuestLog";
import { Badges } from "../menus/Badges";
import { Settings } from "../menus/Settings";
import { DailyPhrase } from "../menus/DailyPhrase";
import { audioManager } from "../../audio/AudioManager";

export function GameScreen() {
  const { state, setPlayerTile } = useGame();
  const [dialogue, setDialogue] = useState<Interactable | null>(null);
  const [menu, setMenu] = useState<MenuKey | null>(null);

  const palette = useMemo(
    () => AVATAR_BY_ID[state.avatarPalette] ?? AVATAR_BY_ID.amber,
    [state.avatarPalette],
  );

  const completedIds = useMemo(() => {
    // An NPC/object is "completed" when all its challenges are done.
    const done = new Set(state.completedChallengeIds);
    const set = new Set<string>();
    for (const n of NPCS) {
      if (n.challengeIds.length > 0 && n.challengeIds.every((c) => done.has(c))) set.add(n.id);
    }
    for (const o of OBJECTS) {
      if (o.challengeIds.length > 0 && o.challengeIds.every((c) => done.has(c))) set.add(o.id);
    }
    return set;
  }, [state.completedChallengeIds]);

  const anyOverlay = dialogue !== null || menu !== null || state.levelUp !== null;

  const onTileChange = useCallback(
    (x: number, y: number) => {
      // Throttle persistence: only when the tile actually changes.
      setPlayerTile(x, y);
    },
    [setPlayerTile],
  );

  // Sync audio settings on mount.
  useEffect(() => {
    audioManager.setMusicEnabled(state.settings.musicOn);
    audioManager.setSfxEnabled(state.settings.sfxOn);
    // eslint-disable-next-line
  }, []);

  const engine = useGameEngine({
    palette: { skin: palette.skin, hair: palette.hair, top: palette.top, bottom: palette.bottom },
    spawn: state.playerTile,
    enabled: !anyOverlay,
    onTileChange,
    completedIds,
  });

  const highlightRef = useRef<Interactable | null>(engine.highlight);
  highlightRef.current = engine.highlight;

  // Keyboard: E to interact, Escape to close overlays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        if (dialogue) setDialogue(null);
        else if (menu) setMenu(null);
        return;
      }
      if (k === "e" && !anyOverlay) {
        const target = engine.requestInteract();
        if (target) {
          audioManager.play("open");
          setDialogue(target);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyOverlay, dialogue, menu, engine]);

  const openMenu = (key: MenuKey) => {
    audioManager.play("open");
    setMenu(key);
  };

  return (
    <div
      ref={engine.containerRef}
      className="relative h-dvh w-full overflow-hidden select-none"
      style={{ background: "#2a2230", touchAction: "none" }}
    >
      <canvas ref={engine.canvasRef} className="pixel-canvas absolute inset-0" />

      {/* HUD layers */}
      <HUD />
      <QuestTracker />
      <Toasts />
      {!anyOverlay && <InteractPrompt target={engine.highlight} />}
      {!anyOverlay && <TouchControls />}
      <MenuBar onOpen={openMenu} />

      {/* Touch-friendly tap-to-interact button (mobile) */}
      {!anyOverlay && engine.highlight && (
        <button
          className="hq-btn pointer-events-auto absolute bottom-[120px] right-3 z-20 sm:hidden"
          onClick={() => {
            const t = engine.requestInteract();
            if (t) {
              audioManager.play("open");
              setDialogue(t);
            }
          }}
        >
          TALK (E)
        </button>
      )}

      {/* Modals */}
      {dialogue && (
        <DialogueModal
          targetId={dialogue.id}
          kind={dialogue.kind}
          onClose={() => {
            audioManager.play("close");
            setDialogue(null);
          }}
        />
      )}
      <LevelUpModal />

      {menu === "phrasebook" && <Phrasebook onClose={() => setMenu(null)} />}
      {menu === "quests" && <QuestLog onClose={() => setMenu(null)} />}
      {menu === "badges" && <Badges onClose={() => setMenu(null)} />}
      {menu === "settings" && <Settings onClose={() => setMenu(null)} />}
      {menu === "daily" && <DailyPhrase onClose={() => setMenu(null)} />}
    </div>
  );
}
