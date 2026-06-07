import type { NPCDef } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Six core NPCs, each with a clear learning purpose. Positions are tile coords
// on the Hongdae map (see map.ts). Palettes are original chibi color schemes.
// ─────────────────────────────────────────────────────────────────────────────

export const NPCS: NPCDef[] = [
  {
    id: "npc_barista",
    name: "Mina the Barista",
    role: "Cafe Barista",
    palette: { skin: "#f1c9a5", hair: "#3a2a26", top: "#7c9e7e", bottom: "#4a4a4a" },
    tileX: 6,
    tileY: 12,
    facing: "down",
    area: "cafe",
    intro:
      "Welcome to our little cafe! Warm light, good coffee. Want to try ordering in Korean?",
    challengeIds: ["c_barista_1", "c_barista_2", "c_barista_3"],
    friendshipReward: 1,
  },
  {
    id: "npc_vendor",
    name: "Mr. Oh the Vendor",
    role: "Street Food Vendor",
    palette: { skin: "#e8b790", hair: "#262022", top: "#d9534f", bottom: "#5a4632" },
    tileX: 20,
    tileY: 17,
    facing: "down",
    area: "street",
    intro:
      "Fresh tteokbokki, hot and spicy! Come try — and let's practice ordering food.",
    challengeIds: ["c_vendor_1", "c_vendor_2", "c_vendor_3"],
    friendshipReward: 1,
  },
  {
    id: "npc_student",
    name: "Jiwoo the Student",
    role: "Korean Student",
    palette: { skin: "#f3cfae", hair: "#1f1a17", top: "#6c8ec4", bottom: "#37436b" },
    tileX: 16,
    tileY: 13,
    facing: "down",
    area: "street",
    intro:
      "Oh hi! You're new here? I love meeting people. Let's chat — I'll go easy on you!",
    challengeIds: ["c_student_1", "c_student_2", "c_student_3"],
    friendshipReward: 1,
  },
  {
    id: "npc_cashier",
    name: "Sora the Cashier",
    role: "Convenience Store Cashier",
    palette: { skin: "#ecc4a0", hair: "#2e2622", top: "#4c8ca0", bottom: "#2f3a42" },
    tileX: 29,
    tileY: 12,
    facing: "down",
    area: "store",
    intro:
      "Welcome! Need snacks or a drink? Let's get you through checkout in Korean.",
    challengeIds: ["c_cashier_1", "c_cashier_2", "c_cashier_3"],
    friendshipReward: 1,
  },
  {
    id: "npc_busker",
    name: "Hana the Busker",
    role: "Busker Musician",
    palette: { skin: "#f0c6a0", hair: "#5a3b2a", top: "#c97fb0", bottom: "#3a2f4a" },
    tileX: 16,
    tileY: 4,
    facing: "down",
    area: "busking",
    intro:
      "Thanks for stopping by my little stage! Music is a language too — wanna learn a few words?",
    challengeIds: ["c_busker_1", "c_busker_2", "c_busker_3"],
    friendshipReward: 1,
  },
  {
    id: "npc_noraebang",
    name: "Tae the Noraebang Host",
    role: "Noraebang Staff",
    palette: { skin: "#e9bd95", hair: "#221d1b", top: "#8a5ec2", bottom: "#2b2536" },
    tileX: 34,
    tileY: 20,
    facing: "down",
    area: "alley",
    intro:
      "Welcome to the noraebang! Ready to book a room and sing? Let's sort out the details.",
    challengeIds: ["c_noraebang_1", "c_noraebang_2", "c_noraebang_3"],
    friendshipReward: 1,
  },
];

export const NPCS_BY_ID: Record<string, NPCDef> = Object.fromEntries(
  NPCS.map((n) => [n.id, n]),
);
