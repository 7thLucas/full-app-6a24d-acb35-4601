## Visual identity
Cozy 16-bit / 32-bit top-down pixel-art RPG set in a warm golden-hour / early-evening Hongdae, Seoul. Original pixel tiles, original chibi character sprites (~2 tiles tall, clear and readable). Handcrafted small-pixel aesthetic. The Stardew Valley reference is FEELING only — all assets original. Lively like Hongdae but never visually messy.

## Rendering rules (strict)
- 16×16 px base tiles, nearest-neighbor scaling 3x/4x, `image-rendering: pixelated`. NO anti-aliasing, NO blur, NO smoothing on any pixel-art layer (canvas: `imageSmoothingEnabled = false`).
- Top-down orthographic projection ONLY. Never side-scroll, isometric, 3D, or rotated sprites.
- Camera follows the player smoothly, bounded to map edges, slight lookahead, no zoom / rotation / shake.
- Clear visual distinction between: walkable areas, non-walkable solid objects, interactive objects, and decorative background.

## Color & mood
Warm evening palette: golden-hour ambers, soft sunset oranges, dusty rose, warm browns, with soft pastel accents (mint, lilac, peach) over warm tones. Neon Korean sign accents in the alley/nightlife area. Soft evening glow, light reflections, gentle sign flicker. Cozy and warm, never dark cyberpunk, never corporate-clean.

## Typography
- Korean conversation text: clean, readable sans-serif (high legibility for learners). Hangul rendered large and clear.
- Pixel font ONLY for titles, labels, HUD numbers, badges — never for long Korean phrase bodies (legibility first).

## UI / HUD
Cozy RPG HUD, NOT a corporate dashboard. Pixel-style rounded panels, small icons, soft rounded boxes, readable text.
- Top-left: Level + XP bar.
- Top center/right: Streak (flame), Coins, Hearts.
- Right: compact quest tracker (active quest + objectives).
- Contextual "Press E to interact" pixel prompt near targets.
- Bottom: rounded pixel dialogue panel pinned to bottom — NPC name tag, small avatar, Korean phrase + romanization + meaning, answer buttons (hover / correct / wrong highlight states), small XP reward animation. NEVER covers the whole screen so the player still feels inside Hongdae.
- Menus: Phrasebook (collection/journal style with category progress + mastery tags New/Practiced/Remembered/Confident), Quest Log, Badges, Settings.

## Feedback & juice
Short, satisfying pixel-style floating text and small modal cards: "+30 XP", "Phrase unlocked!", "Friendship increased!", "New badge earned!". Correct = warm praise; wrong = gentle encouraging correction. Level-up = cheerful pixel reward modal.

## Environmental detail
Neon lights, music posters, indie band flyers, cafe chalkboards, street fashion, busking crowd, food steam, soft evening glow, light reflections, gentle sign flickers, small idle NPC animations. Layout: bottom = subway exit + map board + vending machine; center = main pedestrian street; left = indie/study cafe + chalkboard menu; right = convenience store + photo booth + K-fashion boutique; top = busking zone + stage; side alley = neon signs + coin noraebang + graffiti/poster walls.

## Components & states
- Buttons: pixel rounded, clear hover/active/correct/wrong states.
- Dialogue answer buttons: distinct default / hover / correct (warm green glow) / wrong (gentle, non-harsh).
- Progress bars: XP bar, Confidence bar (tiered), category unlock bars — all chunky pixel style.
- Hearts: 5-heart row, gentle empty state.
- Modals: small centered pixel cards with soft shadow, never full-bleed during gameplay.

## Accessibility & toggles
Settings allow toggling romanization and English on/off, and audio toggles. High legibility of Korean text is non-negotiable.