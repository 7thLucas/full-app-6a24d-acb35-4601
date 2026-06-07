## Product: Hongdae Korean Quest

A cozy, web-based, top-down pixel JRPG (React, no backend) that teaches beginner Korean by exploring a pixel-art version of Hongdae, Seoul. The concept: "Duolingo turned into a cozy pixel JRPG world." The player walks the neighborhood, talks to NPCs, interacts with shops and street objects, and learns practical Korean through real-life conversations embedded in the world. ALL progress saves to localStorage under key `hongdaeKoreanQuestSave`.

## Target user
A foreign visitor / exchange student who just arrived in Hongdae and is a REAL beginner. Goal: slowly build confidence by talking to locals, ordering food, asking directions, making friends, shopping, and reading signs — learning because you NEED the language to progress.

## Tone & brand
Warm, cozy, playful, casual, motivating, nostalgic — the feeling of a cute pixel RPG town at golden-hour / early-evening Seoul. Learning feels like a friend helping you survive and enjoy Hongdae. Never academic, never harsh. Wrong answers get encouraging, non-punishing corrections. Never shame the player.

## Core gameplay loop
1. Explore Hongdae. 2. See an NPC/object with a "Press E to interact" prompt. 3. Press E → bottom pixel dialogue box opens. 4. NPC frames a real-life Korean situation in plain English. 5. Player picks (or completes) the correct Korean phrase. 6. Friendly feedback. 7. Earn XP / coins / friendship / phrase unlock. 8. Phrase saved into the Phrasebook. 9. Keep exploring, unlock more.

## What it teaches (practical beginner Korean for Seoul)
Ordering coffee, buying street food, asking prices, asking directions, introducing yourself, making casual friends, convenience-store shopping, asking for a bag, polite thank-yous, complimenting music, asking to take a photo, booking a noraebang, reading basic signs, common casual expressions. Every phrase is shown HANGUL FIRST → romanization → natural English meaning → short practical usage note. Never romanization-only, never long grammar lectures. Polite forms taught first; casual forms flagged "use with friends."

## Lesson types (vary the formats)
Multiple choice, meaning match, situation match, fill-the-missing-word (e.g. 아이스 아메리카노 ___ 주세요), object vocabulary (interact with menu board/vending machine to unlock words). Feedback is casual and encouraging ("Nice! That sounds natural.", "Almost — that's for a different situation.").

## NPCs (>= 6, each with a learning purpose)
1. Cafe Barista (indie cafe) — ordering coffee.
2. Street Food Vendor — buying food, asking price.
3. Korean Student — introductions, casual chat.
4. Convenience Store Cashier — payment, shopping.
5. Busker Musician — compliments, casual expressions.
6. Noraebang Staff — booking, time phrases.

## Interactive objects (>= 8)
Cafe menu board, street food cart, subway map, convenience fridge, photo booth, noraebang sign, busking stage, poster wall, vending machine, graffiti wall. Each teaches a phrase / unlocks vocab / gives a small cultural note / triggers a quest — never random.

## Quests
Main questline (progressive): Arrive in Hongdae → Order Your First Coffee → Buy Street Food → Convenience Store Survival → Find the Noraebang → Make a Korean Friend → Compliment the Busker → Hongdae Night Out. Side quests (object-driven mini-lessons): Read Your First Korean Sign, Vending Machine Practice, Photo Booth Memory, Cafe Menu Reader. At least 8 main + 4 side quests. Compact quest tracker HUD + full Quest Log (active/completed/locked with rewards).

## Progression & motivation
- Player level 1–10, each with a cozy flavor name (Lost in Hongdae → Cafe Beginner → … → Hongdae Local). XP bar; level-up shows a cheerful pixel reward modal + coins.
- Korean Confidence Score 0–100 with tiers (Nervous Beginner → Getting Comfortable → Can Survive Hongdae → Confident Speaker → Hongdae Conversation Hero).
- Coins: soft non-monetary reward (no microtransactions, no real money, no paid store).
- Hearts: start with 5; wrong answer costs one; running out NEVER locks the player out — gently nudges to review; recovers via review/easy practice/next day.
- Daily streak: flame counter; encouraging, never stressful; missing a day = warm welcome back.
- Daily phrase: "Today's Korean Phrase" card (Hangul, romanization, meaning, usage, mini-challenge) → XP + coins + streak once a day.
- NPC friendship: Stranger → Familiar Face → Friendly → Hongdae Buddy; unlocks more casual phrases.
- Badges: First Conversation, Cafe Beginner, Phrase Collector, 3-Day Streak, Korean Conversation Hero, etc.

## Phrasebook & mastery
Player's collection, grouped into categories: Basics, Cafe, Food, Shopping, Directions, Friends, Compliments, Noraebang, Signs, Slang — each with unlock progress. Each entry stores Korean, romanization, English meaning, category, situation, source NPC/object, usage note, and a mastery status: New → Practiced → Remembered → Confident. Light friendly review loop (RPG-style practice cards) grants XP + Confidence.

## First-prototype scope (must ship)
One playable Hongdae map; one controllable player; >=6 NPCs; >=8 interactive objects; WASD + arrow movement; press E to interact; pixel dialogue-box flow (situation → challenge → feedback → reward → save); 6 NPC lessons × 3 challenges = 18 phrase challenges; multiple lesson types; XP, levels 1–10, Korean Confidence, coins, hearts, daily streak + daily phrase; >=8 main + 4 side quests with tracker + log; phrasebook with categories + mastery; NPC friendship + badges; localStorage persistence; cozy pixel RPG visuals.

## Screens
Start screen → simple character setup (name default "Alex", avatar/color picks) → Game screen with HUD → Dialogue modal → Phrasebook → Quest Log → Badge collection → Daily Phrase modal → Settings (audio toggles, show-romanization/show-English toggles, reset progress with confirm).

## Audio
Structured AudioManager with area-based music / ambience / SFX placeholders that DO NOT crash if files are missing. Settings persist to localStorage.

## Strategic guardrails (do NOT violate)
- Top-down orthographic ONLY — never side-scroll, isometric, 3D, cinematic, or first-person.
- Learning embedded in the world — NEVER a quiz app, flashcard screen, or SaaS-dashboard/mobile-quiz layout.
- NOT a farming game (no crops, barns, farm animals, watering cans). Stardew reference = cozy top-down RPG FEELING only.
- No combat, monsters, weapons, dungeons, dark fantasy, or cyberpunk overload.
- No realistic 3D buildings. All art ORIGINAL and clearly Hongdae, Seoul — never copied from any existing game.

## Extensibility
Structure so richer pixel-art assets, real audio files, and Korean pronunciation clips can be swapped in later without refactoring (data-driven NPCs/objects/quests/phrases; an asset/audio manager layer).