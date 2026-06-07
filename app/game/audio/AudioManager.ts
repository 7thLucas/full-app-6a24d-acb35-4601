import type { AreaId } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// AudioManager — structured, area-based music / ambience / SFX layer.
//
// Designed to NEVER crash if audio files are missing. All file URLs are
// placeholders that can be filled in later (drop files into /public/audio/...)
// without touching gameplay code. If a file 404s or audio is unsupported, the
// manager degrades silently.
// ─────────────────────────────────────────────────────────────────────────────

export type SfxKey =
  | "step"
  | "interact"
  | "correct"
  | "wrong"
  | "phrase"
  | "coin"
  | "levelup"
  | "open"
  | "close";

// Placeholder asset map. Swap these for real files later (same keys).
const MUSIC_TRACKS: Record<AreaId, string> = {
  subway: "/audio/music/subway.mp3",
  street: "/audio/music/street.mp3",
  cafe: "/audio/music/cafe.mp3",
  store: "/audio/music/store.mp3",
  busking: "/audio/music/busking.mp3",
  alley: "/audio/music/alley.mp3",
};

const AMBIENCE_TRACKS: Record<AreaId, string> = {
  subway: "/audio/ambience/subway.mp3",
  street: "/audio/ambience/street.mp3",
  cafe: "/audio/ambience/cafe.mp3",
  store: "/audio/ambience/store.mp3",
  busking: "/audio/ambience/busking.mp3",
  alley: "/audio/ambience/alley.mp3",
};

const SFX_FILES: Record<SfxKey, string> = {
  step: "/audio/sfx/step.mp3",
  interact: "/audio/sfx/interact.mp3",
  correct: "/audio/sfx/correct.mp3",
  wrong: "/audio/sfx/wrong.mp3",
  phrase: "/audio/sfx/phrase.mp3",
  coin: "/audio/sfx/coin.mp3",
  levelup: "/audio/sfx/levelup.mp3",
  open: "/audio/sfx/open.mp3",
  close: "/audio/sfx/close.mp3",
};

function safeAudio(src: string, loop: boolean, volume: number): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  try {
    const a = new Audio();
    a.loop = loop;
    a.volume = volume;
    a.preload = "none"; // don't fetch until played; avoids noisy 404s on load
    a.src = src;
    // Swallow load/decode errors silently.
    a.addEventListener("error", () => {}, { once: true });
    return a;
  } catch {
    return null;
  }
}

class AudioManagerImpl {
  private musicOn = true;
  private sfxOn = true;
  private currentArea: AreaId | null = null;
  private music: HTMLAudioElement | null = null;
  private ambience: HTMLAudioElement | null = null;

  setMusicEnabled(on: boolean) {
    this.musicOn = on;
    if (!on) {
      this.stopMusic();
    } else if (this.currentArea) {
      this.playArea(this.currentArea, true);
    }
  }

  setSfxEnabled(on: boolean) {
    this.sfxOn = on;
  }

  /** Switch the music/ambience to a given area. No-op if already there. */
  playArea(area: AreaId, force = false) {
    if (!force && this.currentArea === area) return;
    this.currentArea = area;
    if (!this.musicOn) return;
    this.stopMusic();

    this.music = safeAudio(MUSIC_TRACKS[area], true, 0.35);
    this.ambience = safeAudio(AMBIENCE_TRACKS[area], true, 0.2);
    // play() returns a promise that may reject (autoplay policy / missing file).
    this.music?.play().catch(() => {});
    this.ambience?.play().catch(() => {});
  }

  private stopMusic() {
    try {
      this.music?.pause();
      this.ambience?.pause();
    } catch {
      /* ignore */
    }
    this.music = null;
    this.ambience = null;
  }

  /** Fire a one-shot SFX. Always safe; never throws. */
  play(key: SfxKey) {
    if (!this.sfxOn) return;
    const a = safeAudio(SFX_FILES[key], false, 0.5);
    a?.play().catch(() => {});
  }

  /** Resume area music after a user gesture (autoplay unlock). */
  unlock() {
    if (this.musicOn && this.currentArea) this.playArea(this.currentArea, true);
  }
}

// Singleton — one manager for the whole app.
export const audioManager = new AudioManagerImpl();
