import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import type {
  AvatarPaletteId,
  MasteryStatus,
  SaveState,
} from "../types";
import {
  clearSave,
  daysBetween,
  defaultSave,
  loadSave,
  persistSave,
  todayStr,
} from "./save";
import { CHALLENGES_BY_ID } from "../data/challenges";
import { PHRASES_BY_ID } from "../data/phrases";
import { QUESTS, QUESTS_BY_ID, unlockedQuestIds } from "../data/quests";
import { NPCS_BY_ID } from "../data/npcs";
import { BADGES, levelForXp, DAILY_PHRASE_IDS } from "../data/progression";

// ─────────────────────────────────────────────────────────────────────────────
// Toast / floating-feedback events (pixel "+30 XP", "Phrase unlocked!" etc.)
// ─────────────────────────────────────────────────────────────────────────────

export interface Toast {
  id: number;
  text: string;
  kind: "xp" | "coin" | "phrase" | "friend" | "badge" | "level" | "info";
}

export interface LevelUpEvent {
  level: number;
  name: string;
  coins: number;
}

// Result returned to UI after resolving a challenge.
export interface ChallengeResult {
  correct: boolean;
  feedback: string;
  phraseId?: string;
  newPhrase?: boolean;
  xp: number;
  coins: number;
  heartsLost: number;
}

interface GameStateInternal extends SaveState {
  toasts: Toast[];
  levelUp: LevelUpEvent | null;
  _toastSeq: number;
}

type Action =
  | { type: "HYDRATE"; payload: SaveState }
  | { type: "CREATE_PLAYER"; name: string; palette: AvatarPaletteId }
  | { type: "RESOLVE_CHALLENGE"; challengeId: string; correct: boolean; sourceId: string }
  | { type: "REVIEW_PHRASE"; phraseId: string }
  | { type: "CLAIM_DAILY"; phraseId: string }
  | { type: "SET_PLAYER_TILE"; x: number; y: number }
  | { type: "UPDATE_SETTINGS"; patch: Partial<SaveState["settings"]> }
  | { type: "ADD_TOAST"; text: string; kind: Toast["kind"] }
  | { type: "DISMISS_TOAST"; id: number }
  | { type: "CLEAR_LEVELUP" }
  | { type: "RESET" }
  | { type: "TICK_DAY" };

function pushToast(
  state: GameStateInternal,
  text: string,
  kind: Toast["kind"],
): GameStateInternal {
  const id = state._toastSeq + 1;
  return {
    ...state,
    _toastSeq: id,
    toasts: [...state.toasts, { id, text, kind }].slice(-6),
  };
}

const MASTERY_ORDER: MasteryStatus[] = ["New", "Practiced", "Remembered", "Confident"];
function bumpMastery(s: MasteryStatus | undefined): MasteryStatus {
  const i = s ? MASTERY_ORDER.indexOf(s) : -1;
  return MASTERY_ORDER[Math.min(MASTERY_ORDER.length - 1, i + 1)];
}

/** Apply XP and detect level-up; returns patched state + levelUp event. */
function applyXp(state: GameStateInternal, xp: number): GameStateInternal {
  if (xp <= 0) return state;
  const prevLevel = state.level;
  const newXp = state.xp + xp;
  const lvl = levelForXp(newXp);
  let next = { ...state, xp: newXp, level: lvl.level };
  if (lvl.level > prevLevel) {
    const bonusCoins = lvl.level * 5;
    next = { ...next, coins: next.coins + bonusCoins };
    next.levelUp = { level: lvl.level, name: lvl.name, coins: bonusCoins };
  }
  return next;
}

function addConfidence(state: GameStateInternal, amount: number): GameStateInternal {
  return { ...state, confidence: Math.min(100, Math.max(0, state.confidence + amount)) };
}

function maybeAwardBadge(
  state: GameStateInternal,
  badgeId: string,
): GameStateInternal {
  if (state.earnedBadgeIds.includes(badgeId)) return state;
  const def = BADGES.find((b) => b.id === badgeId);
  if (!def) return state;
  let next = {
    ...state,
    earnedBadgeIds: [...state.earnedBadgeIds, badgeId],
  };
  next = pushToast(next, `New badge: ${def.name}!`, "badge");
  return next;
}

/** Recompute quest objective/quest completion after a target is interacted with. */
function progressQuests(
  state: GameStateInternal,
  targetId: string,
): GameStateInternal {
  let next = state;
  for (const questId of next.activeQuestIds) {
    const quest = QUESTS_BY_ID[questId];
    if (!quest) continue;
    if (next.completedQuestIds.includes(questId)) continue;

    const done = next.objectiveProgress[questId] ?? [];
    const matched = quest.objectives.filter((o) => o.targetId === targetId && !done.includes(o.id));
    if (matched.length === 0) continue;

    const newDone = [...done, ...matched.map((o) => o.id)];
    next = {
      ...next,
      objectiveProgress: { ...next.objectiveProgress, [questId]: newDone },
    };

    // Quest complete?
    if (quest.objectives.every((o) => newDone.includes(o.id))) {
      next = {
        ...next,
        completedQuestIds: [...next.completedQuestIds, questId],
        activeQuestIds: next.activeQuestIds.filter((q) => q !== questId),
      };
      // Quest rewards.
      next = applyXp(next, quest.rewardXp);
      next = { ...next, coins: next.coins + quest.rewardCoins };
      next = addConfidence(next, 4);
      next = pushToast(next, `Quest complete: ${quest.title}!`, "info");
      next = pushToast(next, `+${quest.rewardXp} XP`, "xp");
      if (quest.rewardCoins > 0) next = pushToast(next, `+${quest.rewardCoins} coins`, "coin");
      // Quest phrase rewards.
      for (const pid of quest.rewardPhraseIds) {
        if (!next.unlockedPhraseIds.includes(pid)) {
          next = {
            ...next,
            unlockedPhraseIds: [...next.unlockedPhraseIds, pid],
            phraseMastery: { ...next.phraseMastery, [pid]: "New" },
          };
        }
      }
      if (quest.rewardBadgeId) next = maybeAwardBadge(next, quest.rewardBadgeId);
    }
  }

  // Unlock newly-available quests.
  const shouldBeActive = unlockedQuestIds(next.completedQuestIds).filter(
    (q) => !next.completedQuestIds.includes(q) && !next.activeQuestIds.includes(q),
  );
  if (shouldBeActive.length > 0) {
    next = { ...next, activeQuestIds: [...next.activeQuestIds, ...shouldBeActive] };
  }
  return next;
}

function reducer(state: GameStateInternal, action: Action): GameStateInternal {
  switch (action.type) {
    case "HYDRATE": {
      const merged: GameStateInternal = {
        ...action.payload,
        toasts: [],
        levelUp: null,
        _toastSeq: 0,
      };
      // Ensure first available quests are active.
      const active = new Set(merged.activeQuestIds);
      for (const id of unlockedQuestIds(merged.completedQuestIds)) {
        if (!merged.completedQuestIds.includes(id)) active.add(id);
      }
      return { ...merged, activeQuestIds: Array.from(active) };
    }

    case "CREATE_PLAYER": {
      const base = defaultSave();
      const today = todayStr();
      let next: GameStateInternal = {
        ...base,
        created: true,
        playerName: action.name.trim() || "Alex",
        avatarPalette: action.palette,
        lastPlayedDate: today,
        streak: 1,
        toasts: [],
        levelUp: null,
        _toastSeq: 0,
      };
      // Activate the opening quests.
      next = {
        ...next,
        activeQuestIds: unlockedQuestIds([]),
      };
      return next;
    }

    case "RESOLVE_CHALLENGE": {
      const ch = CHALLENGES_BY_ID[action.challengeId];
      if (!ch) return state;
      let next = state;

      if (action.correct) {
        const already = next.completedChallengeIds.includes(ch.id);
        // XP & coins (reduced on repeat to avoid grinding the same node).
        const xp = already ? Math.round(ch.xp * 0.3) : ch.xp;
        const coins = already ? 0 : ch.coins;
        next = applyXp(next, xp);
        next = { ...next, coins: next.coins + coins };
        next = addConfidence(next, already ? 1 : 3);
        if (xp > 0) next = pushToast(next, `+${xp} XP`, "xp");
        if (coins > 0) next = pushToast(next, `+${coins} coins`, "coin");

        if (!already) {
          next = {
            ...next,
            completedChallengeIds: [...next.completedChallengeIds, ch.id],
          };
        }

        // Unlock the reward phrase.
        const pid = ch.rewardPhraseId;
        const newPhrase = !next.unlockedPhraseIds.includes(pid);
        if (newPhrase) {
          next = {
            ...next,
            unlockedPhraseIds: [...next.unlockedPhraseIds, pid],
            phraseMastery: { ...next.phraseMastery, [pid]: "New" },
          };
          const ph = PHRASES_BY_ID[pid];
          next = pushToast(next, `Phrase unlocked: ${ph?.korean ?? ""}`, "phrase");
        } else {
          // Reinforce mastery on repeat.
          next = {
            ...next,
            phraseMastery: {
              ...next.phraseMastery,
              [pid]: bumpMastery(next.phraseMastery[pid]),
            },
          };
        }

        // Friendship for NPC sources.
        const npc = NPCS_BY_ID[action.sourceId];
        if (npc && !already) {
          const cur = next.friendship[npc.id] ?? 0;
          next = {
            ...next,
            friendship: { ...next.friendship, [npc.id]: cur + npc.friendshipReward },
          };
          next = pushToast(next, `Friendship +1 with ${npc.name}`, "friend");
        }

        // First-conversation badge.
        if (next.completedChallengeIds.length >= 1) {
          next = maybeAwardBadge(next, "b_first_convo");
        }
        // Phrase collector badge.
        if (next.unlockedPhraseIds.length >= 10) {
          next = maybeAwardBadge(next, "b_phrase_collector");
        }
        // Hero badge at top confidence.
        if (next.confidence >= 95) {
          next = maybeAwardBadge(next, "b_hero");
        }

        // Quest progress (interacting with this source).
        next = progressQuests(next, action.sourceId);
      } else {
        // Gentle, non-punishing: lose a heart but never lock out.
        const hearts = Math.max(0, next.hearts - 1);
        next = { ...next, hearts };
      }

      return next;
    }

    case "REVIEW_PHRASE": {
      // Light review loop: small XP + confidence, bump mastery.
      let next = applyXp(state, 8);
      next = addConfidence(next, 2);
      next = {
        ...next,
        phraseMastery: {
          ...next.phraseMastery,
          [action.phraseId]: bumpMastery(next.phraseMastery[action.phraseId]),
        },
      };
      // Review gently recovers a heart.
      if (next.hearts < next.maxHearts) {
        next = { ...next, hearts: next.hearts + 1 };
      }
      next = pushToast(next, "+8 XP (review)", "xp");
      return next;
    }

    case "CLAIM_DAILY": {
      const today = todayStr();
      if (state.lastDailyPhraseDate === today) return state;
      let next = applyXp(state, 20);
      next = { ...next, coins: next.coins + 8, lastDailyPhraseDate: today };
      next = addConfidence(next, 2);
      const pid = action.phraseId;
      if (!next.unlockedPhraseIds.includes(pid)) {
        next = {
          ...next,
          unlockedPhraseIds: [...next.unlockedPhraseIds, pid],
          phraseMastery: { ...next.phraseMastery, [pid]: "New" },
        };
      }
      next = pushToast(next, "+20 XP daily phrase", "xp");
      next = pushToast(next, "+8 coins", "coin");
      return next;
    }

    case "TICK_DAY": {
      const today = todayStr();
      if (state.lastPlayedDate === today) return state;
      const gap = daysBetween(state.lastPlayedDate, today);
      let streak = state.streak;
      if (gap === 1) streak = state.streak + 1;
      else if (gap > 1) streak = 1; // warm welcome back; reset gently
      else if (!state.lastPlayedDate) streak = 1;
      // Recover hearts on a new day.
      let next: GameStateInternal = {
        ...state,
        streak,
        lastPlayedDate: today,
        hearts: state.maxHearts,
      };
      if (streak >= 3) next = maybeAwardBadge(next, "b_streak3");
      return next;
    }

    case "SET_PLAYER_TILE":
      return { ...state, playerTile: { x: action.x, y: action.y } };

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "ADD_TOAST":
      return pushToast(state, action.text, action.kind);

    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case "CLEAR_LEVELUP":
      return { ...state, levelUp: null };

    case "RESET": {
      clearSave();
      const base = defaultSave();
      return { ...base, toasts: [], levelUp: null, _toastSeq: 0 };
    }

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context + hook
// ─────────────────────────────────────────────────────────────────────────────

interface GameStore {
  state: GameStateInternal;
  hydrated: boolean;
  createPlayer: (name: string, palette: AvatarPaletteId) => void;
  resolveChallenge: (challengeId: string, correct: boolean, sourceId: string) => void;
  reviewPhrase: (phraseId: string) => void;
  claimDaily: (phraseId: string) => void;
  setPlayerTile: (x: number, y: number) => void;
  updateSettings: (patch: Partial<SaveState["settings"]>) => void;
  dismissToast: (id: number) => void;
  clearLevelUp: () => void;
  reset: () => void;
  dailyPhraseId: string;
  dailyClaimed: boolean;
}

const GameContext = createContext<GameStore | null>(null);

function initialInternal(): GameStateInternal {
  return { ...defaultSave(), toasts: [], levelUp: null, _toastSeq: 0 };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialInternal);
  const hydratedRef = useRef(false);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      dispatch({ type: "HYDRATE", payload: saved });
    }
    hydratedRef.current = true;
    // Roll the daily streak / heart recovery once on load if a player exists.
    if (saved?.created) {
      dispatch({ type: "TICK_DAY" });
    }
    // eslint-disable-next-line
  }, []);

  // Persist whenever the save-relevant state changes.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (!state.created) return;
    const { toasts, levelUp, _toastSeq, ...save } = state;
    persistSave(save as SaveState);
  }, [state]);

  const createPlayer = useCallback(
    (name: string, palette: AvatarPaletteId) =>
      dispatch({ type: "CREATE_PLAYER", name, palette }),
    [],
  );
  const resolveChallenge = useCallback(
    (challengeId: string, correct: boolean, sourceId: string) =>
      dispatch({ type: "RESOLVE_CHALLENGE", challengeId, correct, sourceId }),
    [],
  );
  const reviewPhrase = useCallback(
    (phraseId: string) => dispatch({ type: "REVIEW_PHRASE", phraseId }),
    [],
  );
  const claimDaily = useCallback(
    (phraseId: string) => dispatch({ type: "CLAIM_DAILY", phraseId }),
    [],
  );
  const setPlayerTile = useCallback(
    (x: number, y: number) => dispatch({ type: "SET_PLAYER_TILE", x, y }),
    [],
  );
  const updateSettings = useCallback(
    (patch: Partial<SaveState["settings"]>) => dispatch({ type: "UPDATE_SETTINGS", patch }),
    [],
  );
  const dismissToast = useCallback((id: number) => dispatch({ type: "DISMISS_TOAST", id }), []);
  const clearLevelUp = useCallback(() => dispatch({ type: "CLEAR_LEVELUP" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  // Deterministic daily phrase based on the date.
  const dailyPhraseId = useMemo(() => {
    const today = todayStr();
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
    return DAILY_PHRASE_IDS[hash % DAILY_PHRASE_IDS.length];
  }, []);

  const dailyClaimed = state.lastDailyPhraseDate === todayStr();

  const value: GameStore = {
    state,
    hydrated: hydratedRef.current,
    createPlayer,
    resolveChallenge,
    reviewPhrase,
    claimDaily,
    setPlayerTile,
    updateSettings,
    dismissToast,
    clearLevelUp,
    reset,
    dailyPhraseId,
    dailyClaimed,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameStore {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within <GameProvider>");
  return ctx;
}
