import type { GameSettings, SaveState } from "../types";

export const SAVE_KEY = "hongdaeKoreanQuestSave";
export const SAVE_VERSION = 1;

export function defaultSettings(): GameSettings {
  return {
    musicOn: true,
    sfxOn: true,
    showRomanization: true,
    showEnglish: true,
  };
}

export function defaultSave(): SaveState {
  return {
    version: SAVE_VERSION,
    created: false,
    playerName: "Alex",
    avatarPalette: "amber",
    level: 1,
    xp: 0,
    confidence: 0,
    coins: 0,
    hearts: 5,
    maxHearts: 5,
    streak: 0,
    lastPlayedDate: "",
    lastDailyPhraseDate: "",
    unlockedPhraseIds: [],
    phraseMastery: {},
    completedChallengeIds: [],
    activeQuestIds: [],
    completedQuestIds: [],
    objectiveProgress: {},
    friendship: {},
    earnedBadgeIds: [],
    settings: defaultSettings(),
    playerTile: null,
  };
}

export function loadSave(): SaveState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    if (!parsed || typeof parsed !== "object") return null;
    // Merge with defaults so older/partial saves never crash.
    const base = defaultSave();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      phraseMastery: { ...(parsed.phraseMastery ?? {}) },
      objectiveProgress: { ...(parsed.objectiveProgress ?? {}) },
      friendship: { ...(parsed.friendship ?? {}) },
      version: SAVE_VERSION,
    };
  } catch {
    return null;
  }
}

export function persistSave(state: SaveState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be full/blocked; fail silently so the game keeps running.
  }
}

export function clearSave(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}
