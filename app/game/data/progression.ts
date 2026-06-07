import type {
  AvatarPalette,
  AvatarPaletteId,
  BadgeDef,
  ConfidenceTier,
  FriendshipTier,
  LevelDef,
  PhraseCategory,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Levels 1–10 with cozy flavour names. xpRequired is cumulative.
// ─────────────────────────────────────────────────────────────────────────────

export const LEVELS: LevelDef[] = [
  { level: 1, name: "Lost in Hongdae", xpRequired: 0 },
  { level: 2, name: "First Steps", xpRequired: 60 },
  { level: 3, name: "Cafe Beginner", xpRequired: 150 },
  { level: 4, name: "Street Snacker", xpRequired: 270 },
  { level: 5, name: "Corner Shop Regular", xpRequired: 420 },
  { level: 6, name: "Map Reader", xpRequired: 600 },
  { level: 7, name: "Friendly Face", xpRequired: 810 },
  { level: 8, name: "Stage Side Fan", xpRequired: 1050 },
  { level: 9, name: "Night Owl", xpRequired: 1320 },
  { level: 10, name: "Hongdae Local", xpRequired: 1620 },
];

export function levelForXp(xp: number): LevelDef {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) current = l;
  }
  return current;
}

export function nextLevel(level: number): LevelDef | null {
  return LEVELS.find((l) => l.level === level + 1) ?? null;
}

/** Progress (0..1) toward the next level. Maxed at level 10. */
export function levelProgress(xp: number, level: number): number {
  const cur = LEVELS.find((l) => l.level === level)!;
  const nxt = nextLevel(level);
  if (!nxt) return 1;
  const span = nxt.xpRequired - cur.xpRequired;
  return Math.min(1, Math.max(0, (xp - cur.xpRequired) / span));
}

// ── Korean Confidence Score tiers ──────────────────────────────────────────

export const CONFIDENCE_TIERS: ConfidenceTier[] = [
  { min: 0, name: "Nervous Beginner" },
  { min: 25, name: "Getting Comfortable" },
  { min: 50, name: "Can Survive Hongdae" },
  { min: 75, name: "Confident Speaker" },
  { min: 95, name: "Hongdae Conversation Hero" },
];

export function confidenceTier(score: number): string {
  let name = CONFIDENCE_TIERS[0].name;
  for (const t of CONFIDENCE_TIERS) if (score >= t.min) name = t.name;
  return name;
}

// ── NPC friendship tiers ────────────────────────────────────────────────────

export const FRIENDSHIP_TIERS: FriendshipTier[] = [
  { min: 0, name: "Stranger" },
  { min: 1, name: "Familiar Face" },
  { min: 2, name: "Friendly" },
  { min: 3, name: "Hongdae Buddy" },
];

export function friendshipTier(points: number): string {
  let name = FRIENDSHIP_TIERS[0].name;
  for (const t of FRIENDSHIP_TIERS) if (points >= t.min) name = t.name;
  return name;
}

// ── Badges ──────────────────────────────────────────────────────────────────

export const BADGES: BadgeDef[] = [
  { id: "b_first_convo", name: "First Conversation", description: "Completed your very first Korean conversation.", icon: "speech" },
  { id: "b_arrived", name: "Welcome to Hongdae", description: "Arrived and read your first signs.", icon: "train" },
  { id: "b_cafe_beginner", name: "Cafe Beginner", description: "Ordered your first coffee in Korean.", icon: "coffee" },
  { id: "b_first_friend", name: "New Friend", description: "Made your first Korean friend.", icon: "heart" },
  { id: "b_phrase_collector", name: "Phrase Collector", description: "Collected 10 phrases.", icon: "book" },
  { id: "b_streak3", name: "3-Day Streak", description: "Practiced 3 days in a row.", icon: "flame" },
  { id: "b_night_out", name: "Hongdae Night Out", description: "Booked a noraebang room.", icon: "mic" },
  { id: "b_hero", name: "Conversation Hero", description: "Reached the highest confidence tier.", icon: "star" },
];

export const BADGES_BY_ID: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);

// ── Avatar palettes (character setup) ───────────────────────────────────────

export const AVATAR_PALETTES: AvatarPalette[] = [
  { id: "amber", name: "Golden", skin: "#f1c9a5", hair: "#5a3b28", top: "#e8964a", bottom: "#5a4632" },
  { id: "rose", name: "Rosy", skin: "#f3cfae", hair: "#3a2a30", top: "#d98aa8", bottom: "#5a3a4a" },
  { id: "mint", name: "Minty", skin: "#ecc4a0", hair: "#2a3a34", top: "#7fb7a6", bottom: "#3a4a46" },
  { id: "lilac", name: "Lilac", skin: "#f0c6a0", hair: "#3a2e4a", top: "#a890d4", bottom: "#3e3458" },
];

export const AVATAR_BY_ID: Record<AvatarPaletteId, AvatarPalette> = Object.fromEntries(
  AVATAR_PALETTES.map((a) => [a.id, a]),
) as Record<AvatarPaletteId, AvatarPalette>;

// ── Phrase category list & colors (phrasebook) ─────────────────────────────

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  "Basics",
  "Cafe",
  "Food",
  "Shopping",
  "Directions",
  "Friends",
  "Compliments",
  "Noraebang",
  "Signs",
  "Slang",
];

export const CATEGORY_COLORS: Record<PhraseCategory, string> = {
  Basics: "#e8964a",
  Cafe: "#b07a4a",
  Food: "#d9534f",
  Shopping: "#4c8ca0",
  Directions: "#5a8f6a",
  Friends: "#d98aa8",
  Compliments: "#c97fb0",
  Noraebang: "#8a5ec2",
  Signs: "#7a6a4a",
  Slang: "#cf8a3a",
};

// ── Daily phrase pool ───────────────────────────────────────────────────────

export const DAILY_PHRASE_IDS = [
  "p_hello",
  "p_thanks",
  "p_how_much",
  "p_where",
  "p_one_please",
  "p_card_ok",
  "p_good_song",
  "p_cool",
];
