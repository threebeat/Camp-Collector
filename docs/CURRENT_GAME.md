# Current game behavior

This describes Evernight 0.14.0. Historical release notes explain earlier behavior; the owner's current direction takes precedence.

## Opening and Camp

A new player clicks through three required pages explaining the world of permanent night, their Camp beside the Market, and three volunteers: a level-5 Human Vanguard, Elf Ranger and Nereid Cleric. They name Camp on the last page. Starting resources are 30 gold, six food, one Trail supper and one expedition slot. The circumstances are not repeated across Camp. Named existing Camps skip the new opening.

Desktop navigation is at the top; phone navigation is at the bottom. The optional guide attaches to it on non-expedition management screens. Skip hides it, and the currency-adjacent gear opens settings to restore the guide, choose reduced motion or manage backups. Gold and gems are the global counts; food belongs in Camp.

Camp shows its map and overview. Build sits directly below the editable name. The clickable Camp XP card opens its explanation, followed by four metrics: adventurers/capacity, ready/deployed adventurers, stocked food/next-period demand, and world difficulty. The map's top strip contains basic resources; the overview's resource list also exposes hides, Obsidian, Relic fragments, fossils and Boss Sigils. There is no aggregate resource count or repeated expansion copy.

The initial capacity is **40**, plus **20 per cabin**. Purchases, creation, charm and journey rewards respect it. A full Camp misses character rewards; there is no waiting-arrivals service. Migration admits legacy queued adventurers into available new capacity once, then clears the old queue.

Camp XP has no rarity. Character lifetime XP contributes 25%; equipment and companion lifetime XP contribute 10%. An ID-based ledger prevents equipping/storing the same item or reloading from counting it twice. Victories, quest claims, construction/upgrades, expansions and opening regions also award XP. Level 1 needs 100 XP; each subsequent requirement rises by 60, up to level 100. Existing character/gear levels remain intact; the new Camp progression begins with its own ledger.

Every **12 hours**, the roster consumes one food per adventurer, including deployed adventurers. Each consumed portion gives five base character XP, subject to racial XP modifiers; deployed characters receive it on return so active checkpoints remain consistent. Partial supplies feed only available portions. Settlement is bounded by roster size even after a long absence. A fed company recovers twice as quickly and raises the chance of Camp wanderers (80% versus 35% each visitor cycle). Food is not additionally charged on returning from ordinary battles. Expeditions can still reserve explicitly listed travel supplies.

Retire combines the previous Release and character Recycle actions. It returns all equipment, armor, utility light and companion, pays `floor(8 + 1.5 × level²)` gold and `floor(level / 30)` gem value, and requires an idle, non-favorite adventurer. The last three remain protected. Equipment recycling remains separate.

## Services and districts

| Place | Services |
| --- | --- |
| Character tent | Searchable roster; profiles, gear/light, companions, bonds, memories, growth and retirement |
| Storage | Searchable belongings, compatible equipment/light choices, materials, scrolls, gems and supplies |
| Bonfire | Spend class points and choose unlocked global difficulty |
| Equipment Workshop | Craft armor and transform weapons, armor or companions |
| Blacksmith | Timed weapon improvement, weapon transformations and ordinary weapon crafting |
| Pantry / Kitchen | Buy food; upgrade in place to cook meals and ingredient dishes |
| Training Grounds | Timed permanent stat training; construction and four adventurers required |
| Alchemist / Farm / Garden | Supplies, gem combination/material conversion and renewable harvests |
| Archaeology | Dinosaur eggs and fossil companions, after a Camp expansion |
| Portal Mage | Unlocks after the first regional boss; spends Boss Sigils to open regions |
| Market square | Important shops and entrances to the surrounding districts |
| Guildhall | Two rows of four guild booths: lessons, quests, standing and member shops |
| Lantern Commons | Outfitter equipment-slot additions and Quest Board |
| Tavern | Five hireable visitors, rotating character stock and gathering services |
| Lantern Clinic | Paid removal of eligible non-racial, non-Profession Attributes |
| Arena grounds | Arena entrance and stakes screen |

Residents/companions walk on Camp and Market scenes. Clicking selects a concise allegiance-colored inspector. Profiles show richer information; race and class names open foundations/trees. Pointer dragging repositions characters or drops them on a service; ordinary taps remain an alternative. A fresh Market visit enters the square. Outfitter, Board, guilds, Clinic, Tavern and Arena have their own service maps.

Stonekeepers, Rootwardens and Wildwatch teach Miner, Lumberjack and Hunter Profession Attributes at ranks I–III, retaining class and respecting the eight equipment-slot cap. Promotions cost 35 / 75 / 150 gold, with resources for higher ranks. All eight guilds offer a 35-gold stat lesson, four-encounter patrols and standing: lessons +10, completed guild patrols +20. At 20 standing, a guild-exclusive level-20 signature item becomes available once per twelve-hour stock period. Its 60-gold starting price discounts with standing, up to 40%. Lantern Runner lessons can teach Night vision after reaching 20 standing.

Market equipment stock refreshes every twelve hours and supports filters, comparison sheets and compatible equipping. Attributes cannot be purchased directly. Neutral visitors rotate every three hours; Camp food affects wanderer frequency. Mara's scripted quest and the Night Watch challenger remain. The Workshop, Kitchen and lakeshore systems from 0.13 remain available.

## Light and class development

A utility light is separate from the extensible equipment slots. Every starter and migrated adventurer receives a Hooded lantern. Hooded lanterns illuminate 190 battlefield units; Witchlight lanterns illuminate 275. Both can be bought, stored, swapped or unequipped. They do not currently use fuel.

Ordinary sight is 55 units. Dwarves, Gnomes, Kobolds, Myconids and Shades have 200–280 night sight; Vampire is 300, Werewolf 250, and learned Night vision 190. The strongest source applies. Trees, rocks, houses and ruins cast real geometric shadows. Detection, AI targeting, explored cells and the fog mask use the same visibility rules. Unlit ordinary adventurers search more slowly; hidden enemies cannot be rendered or selected. Terrain previously seen remains dimly visible. Warm carried/fire light and blue night vision communicate the difference. Fog memory survives battle checkpoint reload.

Class points unlock at levels **10, 20, 40, 60 and 80**. The sequence is talent, subclass, talent, advanced subclass, talent. The first point learns Firekeeper discipline; it cannot select a subclass early. Each class has two or three primary callings and named Ascendant/Warden variations, generally six to nine distinct subclass identities. Choices follow parent links and remain permanent. Existing learned calling IDs are preserved by migration. Equipment transformations remain at 20/40/60 and use separate thresholds.

The Codex folds subclass information into class pages and consolidates 216 modifiers into nine complete tables. It retains race foundations, acquisition rules, mechanics, services and lore, with fewer total entries and more detail per page.

## Roads, bosses and world difficulty

Crossroads selects a destination and compares alternate road routes before staging three to six ready adventurers. Greenway begins open. Every region has three marked mini-bosses and a final boss, with regional terrain, resources and rewards. Direct roads and detours retain their route distinctions; detours increase danger and rewards.

Bonfire chooses the global tier: Adventurer initially, Veteran after one distinct regional boss, and Nightmare after three. Tier health/damage/reward modifiers combine with road danger. Challenges and NPC trials use that tier instead of a per-match picker. Active/staged expedition configurations are frozen so a later Camp change cannot modify an underway party. Shared player-offer snapshots retain their existing server battle contract.

Completing a final boss journey grants **one Boss Sigil**, including repeat clears. The first boss also unlocks Eldrin the Portal Mage. Spend one Sigil at Camp to choose any unopened region; this removes automatic linear region unlocks. Farming the first boss is possible, but requires repeating its full itinerary.

The dedicated Quest tab and Camp Quest button open a journal with Main, Side, NPC, Guild and accepted patrol quests. It shows objective progress and rewards, search, active/completed filters, sorting, pins and detailed claim sheets. Accepted generated quests freeze their targets; completed rewards pay once. One ordered Main chain, the two starter Side quests and existing NPC/Board content remain.

## Expeditions and Arena

Automatic combat handles movement, terrain, abilities, projectiles, mana/stamina, shields, summons, companions, charm and long-fight prevention. The visible battle is 1200×480. Victories/defeats and intermediate encounters have distinct feedback. Original characters and equipment remain owned after defeat; surviving earned ordinary loot is retained. Permanent charm and destination rewards require completion. A journey can return at most two recruits if capacity permits.

At observed 1×, AUTO can be off and interludes wait for Continue. Leaving battle, losing focus, reopening or selecting 2×/3× enables AUTO. Unobserved parties progress at 1×. An open-page Web Worker runs them; after browser suspension/closure, missing time reconstructs incrementally at 1×. There is no continuously running expedition server. Fed returning heroes recover in half the ordinary 30-second/defeat 90-second time.

Arena has no main navigation tab. Enter through its Market district, choose a team and stake **10–1,000 gold**, optionally **0–100** wood, stone, ore, herbs, meat or hides. Rule offers vary between team deathmatch, four-team deathmatch, tigers and team deathmatch with explosive mines. Stakes are deducted before launch; defeat or recall loses them. Winning returns 2.2× gold/resources (four-team gold: 4×), scaled by world rewards, once. Arena does not award gems, equipment or cosmetics; combat XP remains. Mines damage either side.

## Calendar, Shop and longer goals

Daily Battle exposes today's UTC trial, alongside a month calendar showing completed dates, missed past dates, the current day and future days. Milestones at five, ten, twenty and all dates retain once-only receipts. Weekly/monthly themed champions and regional rematches remain. Higher world-tier clears pay only the increase over a previously claimed tier.

The gem Shop contains a selectable section for each of twelve monthly themes, with three canonical cosmetics per theme (4/7/10 gems), plus existing cosmetics and authored Mythical heroes/weapons. Monthly ownership purchases cannot repeat. Atelier appearances preserve underlying mechanics.

The south expansion enables the Lantern Dock (400 gold, 50 wood, 25 stone, 10 ore), high-tier ship recruits and The Bell Beneath: 25 frozen floors with five guardians. Sailing reserves three food per adventurer. Floor 25 gives once-only authored Mythical boots and nine gems. Physical-phone performance and economy pacing still require player testing.

## Persistence and trust

The schema remains 12, season `camp-fresh-2026-10-11`, key `camp-collector-v12`. Current-season saves and active checkpoints migrate without deleting progress; database migrations remain unchanged. Backups can be exported/imported with validation. Old seasons remain incompatible.

Personal ownership is browser-local and tied to origin/profile. The hosted authenticated player-challenge API sanitizes teams and resolves matches with transaction/replay guards, but cannot prove client-owned gold or items were earned. Cross-device saves, conflict handling and a server-owned economy are future work.
