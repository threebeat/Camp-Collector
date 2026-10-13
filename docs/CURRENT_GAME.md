# Current game behavior

This describes Evernight 0.5.0, the persistent Camp, generated-map and guided-planning release. Historical release notes explain earlier behavior; the owner's current direction takes precedence.

## Pixel world and phone battles

Characters use original 32×34 pixel grids; equipment, companions, props and buildings use matching authored grids. Art is shared across cards, profiles, stores, maps and combat, including armor weights, race anatomy, mounts, guises and Mythicals. No external sprite packs are bundled. Pixelated darkness uses overlapping light bands, ordered dithering and shared terrain shadows. Forest torches, bridge lamps, village windows, volcanic seams and jungle mushrooms join carried lamps, fires and colored spells; natural fixtures participate in actual target detection. Night vision keeps its blue tint and existing racial/Attribute advantages.

Rendering uses animation frames, cached visual sprite identities, interpolated unit/projectile positions and reusable lighting masks. View snapshots reuse the current terrain and hydrate visual state without regenerating its map on every update. Observation, pause and speed responses update controls without rebuilding the screen. Deterministic combat remains at thirty fixed steps per second with observed snapshots approximately every 100ms; this is not a promise of sixty frames per second on every phone.

Combat Focus eases position and zoom to contain the alive party. Drag in either axis, use arrow keys, zoom buttons, wheel or pinch to enter free view. Focus toggles tracking back on. Camera state survives pause, speed and ordinary screen refreshes for the same expedition. Names begin hidden on phones; the party strip and journal remain compact. The browser page contains one retro game window with an in-window HUD and menu. Camp overview opens from its name, and secondary menus/services scroll within the window. Crossroads and party assembly have no character inspector. Fullscreen uses the native browser API where available; unsupported or denied requests expand the game to the available viewport without promising to hide browser controls.

Inspection is explicit player intent. Launching, watching, loading or advancing an encounter does not select a character. A deliberate tap opens a small inline HP card; Details opens a profile dialog. Closing inspection stays closed through snapshots. Dead, missing and newly hidden selections clear. A pan, vertical scroll or canceled touch cannot open a character. The mobile inspector occupies ordinary layout space and never becomes the old floating profile overlay.

## Opening and Camp

Every page open or restored browser session begins on a black main menu. An empty bonfire fades into view over 3.2 seconds; Continue Game and Start New Game appear beneath it. Only the fullscreen control appears in the camp menu. Continue fades into the saved Camp, retaining the roster, construction and active checkpoints. A new game uses the existing three narrative beats and requires confirmation before replacing an existing local Camp. Camp fades in with a camera pullback. Reduced motion removes decorative waiting. The three level-5 Human Vanguard, Elf Ranger and Nereid Cleric, 30 starting gold, six food, Trail supper and one expedition slot are retained.

The required saved tutorial teaches panning, dragging a hero onto the tent and reading their profile, then the Crossroads and party preparation. The first direct journey to the clearing always succeeds. The Journal explains quest progress, tracking and claiming rewards. After claiming the first-road quest, the next journey goes to Fernbridge and always fails. The defeat lesson explains that permanent heroes, equipment and earned rewards are safe and the company recovers. The Tavern opens with six Common heroes: the player can choose any one for free, once. Every lesson remains until its green Continue is pressed and pays three gold once. The Fernbridge journey, defeat and free recruit form one combined lesson. Its Continue also gives five wood. Next, construct the Pantry for five gold and five wood, buy food, and finish with an immediately available Continue; no Journal footer action is required. The player is then free to pursue the tracked Fernbridge quest. Subsequent expeditions use ordinary combat outcomes. Generated enemy HP is 15% lower overall; player stats are unchanged.

Tutorial outcomes are saved with their journey and battle checkpoints; reload cannot reroll them. Required learning prevents alternate destinations, trials, unstaging, recall and skipping the guide. Existing completed Camps retain completed learning, with every session still entering through the menu. Legacy incomplete first-road checkpoints migrate into the new lesson sequence.

Camp is one 3000×2200 world. Its initial clearing contains the bonfire, Crossroads, Character tent and the Pantry site. Journal, Build, Stock, Codex and Shop are direct technical-bar actions. The Tavern, neighboring Guild lodge and Trading Post open after the tutorial defeat; the Guild stays locked until six heroes are owned. Other construction and cleared west/east/south plots widen the world. Paths lead to service sites and a southern lake. Drag the ground, pinch, use the wheel, arrow keys or zoom controls to explore.

Drag an available hero onto a built service to open it for that character. Tap a hero and then a building is an accessible alternative. Character Info opens a right-side panel on desktop and a full-screen panel on phones; the manual Walk action is removed. A lantern, supply crate and water barrel can be dragged around the revealed Camp. Tapping the lantern toggles its light. Positions and light state persist. Services and Camp overview open inside the game window.

The initial capacity is **40**. Upgrade the Character tent into a Cabin in place for 140 gold, 24 wood and 12 stone; every further home upgrade adds **20** spaces and raises that cost by 60% of the base per prior upgrade. The stable tent service key remains; the legacy cabins counter mirrors its upgrades. Existing cabin counts migrate into the upgraded home, preserving all capacity, owned records and checkpoints. Purchases, creation, charm and journey rewards respect capacity; full Camps miss recruits without a waiting queue.

Camp, Tavern and every expedition biome use checked-in raster backgrounds. Camp now uses generated detailed terrain, trees, paths and static environmental shadows. Building tiles and their static shadows are composited into the ground when construction changes, leaving transparent interaction targets above. Actor and prop movement never replaces the scene. Five generated regional terrain images support route-map overlays. Live light and character/prop shadows with soft transparent ends occupy a ground layer below the sprites; the reveal mask is separate. The bonfire flickers and emits sparks. Equipped lanterns/torches and light-bearing spells emit dynamic light; ordinary sight and racial night vision do not become light auras. Expedition camera bounds stay inside the extended 2400×1440 scenery around the 1200×480 combat area. Camp revelation remains separate from expedition detection and fog memory.

Camp XP has no rarity. Character lifetime XP contributes 25%; equipment and companion lifetime XP contribute 10%. An ID-based ledger prevents equipping/storing the same item or reloading from counting it twice. Victories, quest claims, construction/upgrades, expansions and opening regions also award XP. Level 1 needs 100 XP; each subsequent requirement rises by 60, up to level 100. Existing character/gear levels remain intact; the new Camp progression begins with its own ledger.

Every **12 hours**, the roster consumes one food per adventurer, including deployed adventurers. Each consumed portion gives five base character XP, subject to racial XP modifiers; deployed characters receive it on return so active checkpoints remain consistent. Partial supplies feed only available portions. Settlement is bounded by roster size even after a long absence. A fed company recovers twice as quickly and raises the chance of Camp wanderers (80% versus 35% each visitor cycle). Food is not additionally charged on returning from ordinary battles. Expeditions can still reserve explicitly listed travel supplies.

Retire combines the previous Release and character Recycle actions. It returns all equipment, armor, utility light and companion, pays `floor(8 + 1.5 × level²)` gold and `floor(level / 30)` gem value, and requires an idle, non-favorite adventurer. The last three remain protected. Equipment recycling remains separate.

## Services and districts

| Place | Services |
| --- | --- |
| Character tent | Searchable roster; profiles, gear/light, companions, bonds, memories, growth and retirement |
| Storage | Searchable belongings, compatible equipment/light choices, materials, scrolls, gems and supplies |
| Bonfire | Connected RPG class tree with branches, level gates, learned/available states and global difficulty |
| Equipment Workshop | Craft armor and transform weapons, armor or companions |
| Blacksmith | Timed weapon improvement, weapon transformations and ordinary weapon crafting |
| Pantry / Kitchen | Buy food; upgrade in place to cook meals and ingredient dishes |
| Training Grounds | Timed permanent stat training; construction and four adventurers required |
| Alchemist / Farm / Garden | Supplies, gem combination/material conversion and renewable harvests |
| Archaeology | Dinosaur eggs and fossil companions, after a Camp expansion |
| Portal Mage | Unlocks after the first regional boss; spends Boss Sigils to open regions |
| Camp Market | Construct at Camp level 2 for 80 gold, 24 wood and 12 stone; four vendors offer equipment, curiosities, supplies/lights and companions |
| Guild lodge | Beside the Tavern; requires six owned heroes; eight guilds offer lessons, quests, standing and member shops |
| Workshop / Journal | Equipment-slot additions at the Workshop; quests in the Camp Journal |
| Last Lantern Tavern | Full-window interior, wandering recruits, quest NPCs, bartender with supplies and legacy daily/monthly/player challenges, two upgrades |
| Trading Post | Village equipment shop; drag a hero to filter goods and compare only that hero’s equipped gear |
| Lantern Clinic | Paid removal of eligible non-racial, non-Profession Attributes |
| Arena | Separate northwest building, initially dark; Camp level four, 180 gold, 24 wood and 30 stone to construct |

Camp residents idle at saved positions. Deliberate taps inspect them; dragging a character uses a building, and dragging the ground pans the camera. The old neighboring Market and district maps no longer form the current navigation flow. Guilds, recruiting, Clinic, Journal, slot additions and transformations are accessible at Camp. The Alchemist handles gem work, relic analysis, creation scrolls and combining adventurers; the tent handles owned appearances. Legacy paid-service access is preserved for migrated named Camps, but the new Market is constructed separately. The old vendor definitions/stock IDs remain for compatibility and owned purchases are untouched.

Stonekeepers, Rootwardens and Wildwatch teach Miner, Lumberjack and Hunter Profession Attributes at ranks I–III, retaining class and respecting the eight equipment-slot cap. Promotions cost 35 / 75 / 150 gold, with resources for higher ranks. All eight guilds offer a 35-gold stat lesson, four-encounter patrols and standing: lessons +10, completed guild patrols +20. At 20 standing, a guild-exclusive level-20 signature item becomes available once per twelve-hour stock period. Its 60-gold starting price discounts with standing, up to 40%. Lantern Runner lessons can teach Night vision after reaching 20 standing.

Tavern heroes refresh every twelve hours, except the free tutorial selection stays fixed while the player chooses. Ordinary level-1 Tavern stock includes Common and Uncommon heroes. Upgrade to level 2 for 140 gold, 12 wood and six stone to add Rare heroes and two more bar options; upgrade to level 3 for 360 gold, 28 wood and 16 stone to add Legendary heroes and the full bar menu. Hiring respects Camp capacity and cannot replay a purchased offer.

Market equipment stock refreshes every twelve hours and supports filters, comparison sheets and compatible equipping. Attributes cannot be purchased directly. Neutral visitors rotate every three hours; Camp food affects wanderer frequency. Mara's scripted quest and the Night Watch challenger remain. The Workshop, Kitchen and lakeshore systems from 0.13 remain available.

## Light and class development

A utility light is separate from the extensible equipment slots. Every starter and migrated adventurer receives a Hooded lantern. Hooded lanterns illuminate 190 battlefield units; Witchlight lanterns illuminate 275. Both can be bought, stored, swapped or unequipped. They do not currently use fuel.

Ordinary sight is 55 units. Dwarves, Gnomes, Kobolds, Myconids and Shades have 200–280 night sight; Vampire is 300, Werewolf 250, and learned Night vision 190. The strongest source applies. Trees, rocks, houses and ruins cast real geometric shadows. Detection, AI targeting, explored cells and the fog mask use the same visibility rules. Unlit ordinary adventurers search more slowly; hidden enemies cannot be rendered or selected. Terrain previously seen remains dimly visible. Warm carried/fire light and blue night vision communicate the difference. Fog memory survives battle checkpoint reload.

Class points unlock at levels **10, 20, 40, 60 and 80**. The sequence is talent, subclass, talent, advanced subclass, talent. The first point learns Firekeeper discipline; it cannot select a subclass early. Each class has two or three primary callings and named Ascendant/Warden variations, generally six to nine distinct subclass identities. Choices follow parent links and remain permanent. Existing learned calling IDs are preserved by migration. Equipment transformations remain at 20/40/60 and use separate thresholds.

The Codex folds subclass information into class pages and consolidates 216 modifiers into nine complete tables. It retains race foundations, acquisition rules, mechanics, services and lore, with fewer total entries and more detail per page.

## Roads, bosses and world difficulty

Crossroads first shows traveling and recently returned companies. Start an expedition opens a fixed planning screen: detailed generated map on one side, route options on the other. Only the map/panels scroll; the page stays fixed. A second fixed screen selects three to six adventurers and optional supplies. Greenway begins open. Every region has three marked mini-bosses and a final boss, with regional terrain, resources and rewards. Direct roads and detours retain their route distinctions; detours increase danger and rewards.

Bonfire chooses the global tier: Adventurer initially, Veteran after one distinct regional boss, and Nightmare after three. Tier health/damage/reward modifiers combine with road danger. Challenges and NPC trials use that tier instead of a per-match picker. Active/staged expedition configurations are frozen so a later Camp change cannot modify an underway party. Shared player-offer snapshots retain their existing server battle contract.

Completing a final boss journey grants **one Boss Sigil**, including repeat clears. The first boss also unlocks Eldrin the Portal Mage. Spend one Sigil at Camp to choose any unopened region; this removes automatic linear region unlocks. Farming the first boss is possible, but requires repeating its full itinerary.

The Camp Journal opens an in-window quest panel with Main, Side, NPC, Guild and accepted patrol quests. It includes progress/rewards, search, active/completed filters, sorting, pins and claims, only for accepted Side/NPC/Guild/patrol quests and reached Main quests. No unaccepted quest catalog, tutorial-completion footer or duplicate Camp button appears. It replaces the notice board and standalone Quest page while retaining the stable `questboard` service/save key. Accepted generated quests freeze their targets and completed rewards pay once. Tavern NPCs Mara and Orin outside and Iris inside display question marks when an offer is available; offers rotate every three hours and accepted patrol objectives remain frozen. Tracked and pinned quest destinations receive gold ◆ markers on Crossroads. There is no standalone Expeditions navigation page.

## Expeditions and Arena

Automatic combat handles movement, terrain, abilities, projectiles, mana/stamina, shields, summons, companions, charm and long-fight prevention. The visible battle is 1200×480. Victories/defeats and intermediate encounters have distinct feedback. Original characters and equipment remain owned after defeat; surviving earned ordinary loot is retained. Permanent charm and destination rewards require completion. A journey can return at most two recruits if capacity permits.

All non-combat encounters take healing/loot automatically and remain for five seconds before the next countdown. Observed interludes stay at real-time 1× regardless of the combat speed. Pause still pauses. Props, decals and their ground shadows are drawn below the expedition fog mask. Unobserved parties progress at 1×. An open-page Web Worker runs them; after browser suspension/closure, missing time reconstructs incrementally at 1×. There is no continuously running expedition server. Fed returning heroes recover in half the ordinary 30-second/defeat 90-second time.

Arena has no main navigation tab. Build the separate Arena at Camp level four, choose a team and stake **10–1,000 gold**, optionally **0–100** wood, stone, ore, herbs, meat or hides. Rule offers vary between team deathmatch, four-team deathmatch, tigers and team deathmatch with explosive mines. Stakes are deducted before launch; defeat or recall loses them. Winning returns 2.2× gold/resources (four-team gold: 4×), scaled by world rewards, once. Arena does not award gems, equipment or cosmetics; combat XP remains. Mines damage either side.

## Calendar, Shop and longer goals

Bram’s Tavern bar opens the legacy challenge board, including issuing or joining player challenges. Daily Battle exposes today's UTC trial, alongside a month calendar showing completed dates, missed past dates, the current day and future days. Milestones at five, ten, twenty and all dates retain once-only receipts. Weekly/monthly themed champions and regional rematches remain. Higher world-tier clears pay only the increase over a previously claimed tier.

The gem Shop contains a selectable section for each of twelve monthly themes, with three canonical cosmetics per theme (4/7/10 gems), plus existing cosmetics and authored Mythical heroes/weapons. Monthly ownership purchases cannot repeat. Atelier appearances preserve underlying mechanics.

The south expansion enables the Lantern Dock (400 gold, 50 wood, 25 stone, 10 ore), high-tier ship recruits and The Bell Beneath: 25 frozen floors with five guardians. Sailing reserves three food per adventurer. Floor 25 gives once-only authored Mythical boots and nine gems. Physical-phone performance and economy pacing still require player testing.

## Persistence and trust

The schema remains 12, season `camp-fresh-2026-10-11`, key `camp-collector-v12`. Current-season saves and active checkpoints migrate without deleting progress; database migrations remain unchanged. Backups can be exported/imported with validation. Old seasons remain incompatible.

Personal ownership is browser-local and tied to origin/profile. The hosted authenticated player-challenge API sanitizes teams and resolves matches with transaction/replay guards, but cannot prove client-owned gold or items were earned. Cross-device saves, conflict handling and a server-owned economy are future work.
