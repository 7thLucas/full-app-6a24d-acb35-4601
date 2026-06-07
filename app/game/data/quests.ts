import type { QuestDef } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// 8 main questline quests (progressive) + 4 side quests.
// Objectives complete when the matching NPC conversation or object lesson is done.
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTS: QuestDef[] = [
  // ── Main questline ────────────────────────────────────────────────────────
  {
    id: "q_arrive",
    title: "Arrive in Hongdae",
    kind: "main",
    location: "Hongdae Subway Exit",
    summary:
      "You just stepped out of the station. Read the signs and learn how to ask where things are.",
    objectives: [
      { id: "o_arrive_map", label: "Read the subway map board", targetId: "obj_subway_map" },
    ],
    rewardXp: 40,
    rewardCoins: 10,
    rewardPhraseIds: ["p_where", "p_hongdae_station", "p_straight"],
    rewardBadgeId: "b_arrived",
    requires: [],
  },
  {
    id: "q_coffee",
    title: "Order Your First Coffee",
    kind: "main",
    location: "Indie Cafe (left)",
    summary: "Time for caffeine. Find the barista and order a drink in Korean.",
    objectives: [
      { id: "o_coffee_barista", label: "Order from Mina the Barista", targetId: "npc_barista" },
    ],
    rewardXp: 50,
    rewardCoins: 12,
    rewardPhraseIds: ["p_iced_americano", "p_one_please"],
    rewardBadgeId: "b_cafe_beginner",
    requires: ["q_arrive"],
  },
  {
    id: "q_streetfood",
    title: "Buy Street Food",
    kind: "main",
    location: "Main Street cart",
    summary: "The cart smells incredible. Order tteokbokki and ask the price.",
    objectives: [
      { id: "o_food_vendor", label: "Order from Mr. Oh the Vendor", targetId: "npc_vendor" },
    ],
    rewardXp: 50,
    rewardCoins: 12,
    rewardPhraseIds: ["p_tteokbokki", "p_how_much"],
    requires: ["q_coffee"],
  },
  {
    id: "q_store",
    title: "Convenience Store Survival",
    kind: "main",
    location: "Convenience Store (right)",
    summary: "Grab snacks and make it through checkout — card, bag, and a polite thank you.",
    objectives: [
      { id: "o_store_cashier", label: "Check out with Sora the Cashier", targetId: "npc_cashier" },
    ],
    rewardXp: 55,
    rewardCoins: 14,
    rewardPhraseIds: ["p_card_ok", "p_bag_please", "p_thanks"],
    requires: ["q_streetfood"],
  },
  {
    id: "q_directions",
    title: "Find the Noraebang",
    kind: "main",
    location: "Side alley (right)",
    summary: "Ask for directions, then follow the neon signs into the alley.",
    objectives: [
      { id: "o_dir_student", label: "Ask Jiwoo for directions", targetId: "npc_student" },
      { id: "o_dir_sign", label: "Find the noraebang sign", targetId: "obj_noraebang_sign" },
    ],
    rewardXp: 55,
    rewardCoins: 14,
    rewardPhraseIds: ["p_left", "p_noraebang_word"],
    requires: ["q_store"],
  },
  {
    id: "q_friend",
    title: "Make a Korean Friend",
    kind: "main",
    location: "Main Street",
    summary: "Introduce yourself to Jiwoo and have a friendly chat.",
    objectives: [
      { id: "o_friend_student", label: "Introduce yourself to Jiwoo", targetId: "npc_student" },
    ],
    rewardXp: 55,
    rewardCoins: 14,
    rewardPhraseIds: ["p_my_name", "p_nice_to_meet", "p_hello"],
    rewardBadgeId: "b_first_friend",
    requires: ["q_directions"],
  },
  {
    id: "q_busker",
    title: "Compliment the Busker",
    kind: "main",
    location: "Busking Zone (top)",
    summary: "Hana's song is beautiful. Compliment it and ask to take a photo.",
    objectives: [
      { id: "o_busker", label: "Talk to Hana the Busker", targetId: "npc_busker" },
    ],
    rewardXp: 60,
    rewardCoins: 16,
    rewardPhraseIds: ["p_good_song", "p_photo_ok", "p_cool"],
    requires: ["q_friend"],
  },
  {
    id: "q_nightout",
    title: "Hongdae Night Out",
    kind: "main",
    location: "Coin Noraebang (alley)",
    summary: "Cap off the night: book a noraebang room with the right time and people.",
    objectives: [
      { id: "o_night_staff", label: "Book a room with Tae", targetId: "npc_noraebang" },
    ],
    rewardXp: 70,
    rewardCoins: 20,
    rewardPhraseIds: ["p_two_people", "p_one_hour", "p_can_reserve"],
    rewardBadgeId: "b_night_out",
    requires: ["q_busker"],
  },

  // ── Side quests (object-driven mini-lessons) ───────────────────────────────
  {
    id: "s_sign",
    title: "Read Your First Korean Sign",
    kind: "side",
    location: "Busking poster wall",
    summary: "Practice reading a simple Korean word from a poster.",
    objectives: [
      { id: "o_sign_poster", label: "Read the poster wall", targetId: "obj_poster_wall" },
    ],
    rewardXp: 25,
    rewardCoins: 6,
    rewardPhraseIds: ["p_thanks"],
    requires: ["q_arrive"],
  },
  {
    id: "s_vending",
    title: "Vending Machine Practice",
    kind: "side",
    location: "Subway plaza",
    summary: "Learn the word for drinks and buy from a vending machine.",
    objectives: [
      { id: "o_vending", label: "Use the vending machine", targetId: "obj_vending_machine" },
    ],
    rewardXp: 25,
    rewardCoins: 6,
    rewardPhraseIds: ["p_drink_word"],
    requires: ["q_arrive"],
  },
  {
    id: "s_photo",
    title: "Photo Booth Memory",
    kind: "side",
    location: "Photo booth (right)",
    summary: "Invite a friend for a casual photo at the booth.",
    objectives: [
      { id: "o_photo", label: "Try the photo booth", targetId: "obj_photo_booth" },
    ],
    rewardXp: 25,
    rewardCoins: 6,
    rewardPhraseIds: ["p_lets_photo"],
    requires: ["q_coffee"],
  },
  {
    id: "s_menu",
    title: "Cafe Menu Reader",
    kind: "side",
    location: "Cafe menu board",
    summary: "Read the chalkboard menu and tell warm from iced.",
    objectives: [
      { id: "o_menu", label: "Read the cafe menu board", targetId: "obj_menu_board" },
    ],
    rewardXp: 25,
    rewardCoins: 6,
    rewardPhraseIds: ["p_hot_latte"],
    requires: ["q_coffee"],
  },
];

export const QUESTS_BY_ID: Record<string, QuestDef> = Object.fromEntries(
  QUESTS.map((q) => [q.id, q]),
);

/** Quests that should be auto-activated when their requirements are met. */
export function unlockedQuestIds(completed: string[]): string[] {
  return QUESTS.filter((q) => q.requires.every((r) => completed.includes(r))).map((q) => q.id);
}
