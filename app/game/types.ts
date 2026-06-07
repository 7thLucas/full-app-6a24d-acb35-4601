// ─────────────────────────────────────────────────────────────────────────────
// Hongdae Korean Quest — Core type definitions
//
// Everything here is data-driven so richer pixel-art assets, real audio files,
// and Korean pronunciation clips can be swapped in later without refactoring.
// ─────────────────────────────────────────────────────────────────────────────

export type Direction = "up" | "down" | "left" | "right";

export type PhraseCategory =
  | "Basics"
  | "Cafe"
  | "Food"
  | "Shopping"
  | "Directions"
  | "Friends"
  | "Compliments"
  | "Noraebang"
  | "Signs"
  | "Slang";

export type MasteryStatus = "New" | "Practiced" | "Remembered" | "Confident";

/** A learnable Korean phrase. Hangul-first, always. */
export interface Phrase {
  id: string;
  korean: string;
  romanization: string;
  english: string;
  category: PhraseCategory;
  situation: string;
  usageNote: string;
  /** "polite" forms taught first; "casual" flagged for use with friends. */
  register: "polite" | "casual";
  source: string; // NPC or object name that teaches it
}

export type LessonType =
  | "multiple-choice"
  | "meaning-match"
  | "situation-match"
  | "fill-the-word"
  | "object-vocabulary";

export interface ChallengeOption {
  text: string;
  correct: boolean;
}

/** A single learning challenge inside an NPC conversation or object lesson. */
export interface Challenge {
  id: string;
  type: LessonType;
  /** Real-life scenario framed in plain English. */
  prompt: string;
  /** Optional secondary hint line (e.g. the romanization scaffold). */
  promptKorean?: string;
  options: ChallengeOption[];
  /** Phrase unlocked into the phrasebook upon a correct answer. */
  rewardPhraseId: string;
  xp: number;
  coins: number;
  successFeedback: string;
  hintFeedback: string;
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  /** Sprite palette colors (original art, drawn on canvas). */
  palette: {
    skin: string;
    hair: string;
    top: string;
    bottom: string;
  };
  /** Tile position on the map. */
  tileX: number;
  tileY: number;
  facing: Direction;
  area: AreaId;
  intro: string;
  challengeIds: string[];
  friendshipReward: number;
}

export type ObjectKind =
  | "menu-board"
  | "food-cart"
  | "subway-map"
  | "fridge"
  | "photo-booth"
  | "noraebang-sign"
  | "busking-stage"
  | "poster-wall"
  | "vending-machine"
  | "graffiti-wall";

export interface InteractiveObjectDef {
  id: string;
  kind: ObjectKind;
  name: string;
  tileX: number;
  tileY: number;
  /** Footprint in tiles (for collision + drawing). */
  width: number;
  height: number;
  area: AreaId;
  intro: string;
  culturalNote: string;
  challengeIds: string[];
}

export type AreaId =
  | "subway"
  | "street"
  | "cafe"
  | "store"
  | "busking"
  | "alley";

export interface QuestObjective {
  id: string;
  label: string;
  /** target id (npc/object/challenge) that completes this objective. */
  targetId: string;
}

export interface QuestDef {
  id: string;
  title: string;
  kind: "main" | "side";
  location: string;
  summary: string;
  objectives: QuestObjective[];
  rewardXp: number;
  rewardCoins: number;
  rewardPhraseIds: string[];
  rewardBadgeId?: string;
  /** quest ids that must be completed before this unlocks (main line). */
  requires: string[];
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji-free pixel glyph key
}

export interface LevelDef {
  level: number;
  name: string;
  xpRequired: number; // cumulative XP to reach this level
}

export interface ConfidenceTier {
  min: number;
  name: string;
}

export interface FriendshipTier {
  min: number;
  name: string;
}

// ── Persisted save state ────────────────────────────────────────────────────

export type FriendshipMap = Record<string, number>; // npcId -> points
export type PhraseMasteryMap = Record<string, MasteryStatus>;

export interface SaveState {
  version: number;
  created: boolean;
  playerName: string;
  avatarPalette: AvatarPaletteId;
  level: number;
  xp: number;
  confidence: number; // 0-100
  coins: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  lastPlayedDate: string; // YYYY-MM-DD
  lastDailyPhraseDate: string; // YYYY-MM-DD
  unlockedPhraseIds: string[];
  phraseMastery: PhraseMasteryMap;
  completedChallengeIds: string[];
  activeQuestIds: string[];
  completedQuestIds: string[];
  objectiveProgress: Record<string, string[]>; // questId -> completed objective ids
  friendship: FriendshipMap;
  earnedBadgeIds: string[];
  settings: GameSettings;
  /** last player tile position so returning players resume where they were. */
  playerTile: { x: number; y: number } | null;
}

export interface GameSettings {
  musicOn: boolean;
  sfxOn: boolean;
  showRomanization: boolean;
  showEnglish: boolean;
}

export type AvatarPaletteId = "amber" | "rose" | "mint" | "lilac";

export interface AvatarPalette {
  id: AvatarPaletteId;
  name: string;
  skin: string;
  hair: string;
  top: string;
  bottom: string;
}
