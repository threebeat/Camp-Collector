# Content guide

The content model should support experimentation. This guide explains how to make a new idea function throughout the current game; it does not require future content to fit the same lists, progression or combat forever.

## Current inventory and source of truth

There are seventeen races, twenty playable classes, fifty-two ordinary weapon bases plus four authored Mythical weapons, ten companion bases, forty-nine cosmetics (including thirty-six monthly appearances) and three authored Mythical adventurers. Weapon, armor and companion domains each have 24 prefixes, 24 affixes and 24 enchantments: 216 modifiers overall. `ITEMS` also includes armor, tools, accessories and equipable spell scrolls. Some historical definitions are retained internally and should not be mistaken for the active generator pool.

Use [CONTENT_REFERENCE.md](CONTENT_REFERENCE.md) for the complete current lists and baseline values. It is generated from code:

```bash
node scripts/generate-content-reference.mjs
```

Changes belong in their canonical definitions and behavior first. Regenerate this reference after adding content and update the Codex/context explanations if a rule changes. Prefer stable IDs for existing owned objects, but do not treat an ID as a promise that its mechanics can never improve.

## Races

Race definitions in `web/data.js` include all six foundations, a racial trait, color/physiology and a growth table. `generateHero()` pairs a race with a class rather than authoring every combination. A race can have Vampire, Zombie or Angel independently; those are Attributes, not species.

When adding a race, define its stat foundations/growth, racial Attribute and actual mechanical effect in `stats()` or the combat engine as needed. Add its generator/recipe availability, regional enemy pools and Market/scroll acquisition. Decide height, width, eyes, skin/material, hair/mark style, wings, equipment constraints and charmability. Update `characterSize()`, `flightType()` and `portraitSvg()` when its physiology needs distinct rendering. The Codex reads most race data automatically, but unusual drawbacks need explanatory text.

A visual skin must not silently change the mechanical race. Full character guises deliberately override appearance; the inspector should still explain the underlying race/traits.

## Classes, techniques and trees

A class supplies targeted stat additions, growth, an active technique, starter equipment, slot definitions, allowed weapon families and armor weight. The internal key can differ from its visible label (`healer` is Cleric, `engineer` is Tinker). Adding only a label is insufficient: the engine must implement targeting, costs/cooldown and useful behavior for that action.

Active techniques are used automatically by the unit, consume encounter resources and appear in `abilities()`. Passive consequences belong in Attributes or Talents. Keep the ten-active-ability cap enforced in equipment, combination, transformations and sanitized challenge snapshots. A companion's separate active action is distinct from an owner action; mount enchantments may apply to the owner.

Class trees are built from the class callings and shared node helpers. Points at levels 10/20/40/60/80 alternate talent, subclass, talent, advanced subclass and talent. The foundation must precede a calling; each calling has Forceful/Measured techniques, Ascendant/Warden subclasses and final mastery. Keep equipment transformations on their separate 20/40/60 thresholds. Update the mechanical effects in `combatClass()`, `classEffects()`, `stats()` and `Battle.cast()` as appropriate, not just the tree card. Make locks clear before confirming a permanent choice. No new character transformation system is required by the current design.

## Attributes and Talents

`ATTRIBUTES` describe passive conditions, racial flavor or supernatural changes. `TALENTS` describe learned skills; stat training creates `training:<stat>` Talents. Every facet stores a key, level and XP, with rarity derived from progression. Mechanical scaling is implemented by `facetScale()`, `trainingBonus()` and the relevant engine/stat helpers.

For a new Attribute, consider both its numeric behavior and visible effect: wings, eye shapes, aura, smoke, colors or silhouette changes can make the collection readable. Miner, Lumberjack and Hunter are Profession Attributes taught at the Guildhall. Legacy gathering Talents are preserved for compatibility. Tool-slot metadata is shared, deduplicated and checked against the eight-slot cap. A new profession needs lesson costs/ranks, gathering behavior, tool acquisition if relevant, UI text and snapshot validation; do not reintroduce purchasable Attribute capsules. Professions preserve the battle class.

## Weapons and other equipment

`web/weapons.js` contains base weapon identities, their slot family, stats, restrictions and a unique path. Keep ordinary names compact: Sword, Katana, Spear, Musket or Hand cannon leave room for modifier names. The code keys can retain older names without making those names visible. Mythical signature names are intentionally special.

`weaponShape()` uses the base path, finish and optional engraving. `weaponPresentation()` adds cosmetic finish and authored theme; `modifiersArt()` adds shared modifier signatures. The resulting art is used on item cards and in the character's hand. Add the identity to the stat/item model and both rendering paths through shared helpers rather than adding a disconnected thumbnail.

Weapon compatibility combines equipment `type`, `weaponKind`, the slot's permitted families, minimum Strength, restricted classes and any magical-only rule. Spell scrolls require a Scroll slot and a magic class. Armor uses separate `armorSlot`/`weight` checks; Celestials have no Head slot. Four armor slots are Head, Chest, Legs and Boots; implement distinct icon and worn-art shapes together. Basic armor remains distinct from the eight extensible equipment slots.

Level raises numeric potency/rarity. The timed Blacksmith improvement rank is another multiplier. A transformation unlocks a modifier category and changes presentation; it does not replace identity or discard XP. Never use an authored Mythical base in ordinary loot/Market/forge pools unless that is an intentional new acquisition decision.

## Modifier domains

Weapon modifiers start in `web/weapons.js` and are expanded in `web/modifiers.js`; armor and pet pools are separate. Each definition has a name, description, stats/behavior, visual signature/color and optional family/weight/base restrictions. `modifierFits()` filters the service choices, `validModifiers()` validates records, and `objectModifiers()` resolves canonical definitions.

Prefixes usually alter elements or attack style, affixes modify one to three stats, and enchantments add an automatic active behavior. Those are current conventions, not restrictions on future design. Any new property must be consumed by the stat model or engine; a name and visual flare alone do not create the promised mechanical effect.

Transformation UI previews legal choices and checks level, available category, cost, availability and ability capacity. Add effects to item/armor/pet resolution and challenge sanitization together. A checkpoint test should verify an active modifier survives reconstruction and behaves consistently. Visual signatures should be readable at both icon and battlefield scales.

## Companions, eggs and fossils

`PETS` defines behavior, color, base presentation and acquisition flags. Most pets spawn a smaller follower in `Battle.addCompanion()`. Mounts modify their owner and render as a ridden creature. `petInfo()` resolves stats, sockets and modifiers; `petSvg()` renders the same identity used by cards and the battlefield.

Egg-only and fossil-only companions bypass normal Market/forging pools. Archaeology recipes belong in `web/camp.js`, their UI in `showArchaeology()`, and acquisition rewards in map content. Dinosaur eggs produce Fern raptors or Saddlebacks; fossils produce Ammonites, Trilobites and Amberwings. A new flying pet needs both a flight mechanic and appropriate wing/creature art, not a ground follower with a flight label.

Cosmetic pet guises preserve the mechanical companion key, including mount behavior. Rarity, forms, modifiers, gems and cosmetics should compose visually rather than overwrite a player's progress.

## Authored Mythicals and cosmetics

`MYTHICAL_HEROES` and `MYTHICAL_WEAPONS` define specific themed identities. Their factories construct legal canonical equipment/attributes. The gem Shop references these factories; challenge sanitization checks their allowed identity. Current themes are a solar sentinel, a storm traveler and a brass reactor guardian, with original names/art rather than copied commercial characters.

For a Mythical, author a coherent silhouette, colors, signature gear and meaningful play style. A numeric rarity flag on a random ordinary character is not the intended experience. The island now awards authored Mythical bell-themed Boots in each armor weight, once per Camp. These bases must stay out of ordinary loot, Market and crafting pools.

Cosmetic definitions distinguish character palettes, full-body `character` guises, `weapon` skins with allowed families and `pet` guises. Provide `cosmeticSvg()`/Atelier previews and a clear description before purchase. `applyCosmetic()` validates ownership, target identity and compatibility. Cosmetics currently remain local-owned; server-proof ownership is future economy work.

## Regions, roads and encounters

`web/journeys.js` defines map blueprints with stable node IDs, positions, level, kind/reward and unique road edges. Every current map has three marked mini-boss nodes and one final boss. The route planner computes bounded alternate simple paths through discovered/reachable roads. It freezes per-road combat and stop data into a journey itinerary.

Each road has style, danger and optional water metadata. Solid strong roads select more open terrain; dotted wild roads select denser obstacles. Water-adjacent forest roads and marsh roads can use river encounters. `journeyInfo()` keeps direct roads at 1× route danger and gives detours increased route danger/rewards, then combines the selected global world tier. Do not reintroduce per-match difficulty selection. Preview, staged configuration, engine enemy scaling and rewards must agree.

`web/landmarks.js` draws decorative geography below roads. Nodes, roads, off-node landmarks, enemy pools, biome terrain and rewards should suggest the same place. A lake graphic alone does not make battles watery: wire the road metadata too. Crossroads lists unlocked regions; the unlocked Portal Mage deliberately shows all unopened choices. Final bosses grant one Boss Sigil per completed journey, including repeats, and one Sigil opens a chosen region.

For a new destination, choose a meaningful resource, boss, recruit, companion, equipment or cosmetic reward. Tie quests to its node ID and region. Respect 40 starting spaces plus 20 per cabin: full Camps miss character rewards. There is no waiting-arrivals queue. Check space before charging for purchases and report accepted recruit counts accurately. Repeated-resource rewards and first-clear receipts must be intentional.

## Challenges and lore

Daily trials use today's UTC date, weekly/monthly champions use themed periods, and defeated regional bosses become champion rematches. The Daily calendar records complete/missed/current dates; monthly Shop appearances use twelve themes. Global Bonfire difficulty supplies the trial tier. Clear reward descriptors and highest-tier receipts avoid paying the same prize repeatedly. Player challenge teams come from real posted offers; do not fill that screen with invented users.

`CODEX` combines authored explanations and canonical inventories. `CONTEXT` powers information icons near services/stats. Describe what affects a decision: cost, timing, restrictions, formulas, targeting and rewards. Correct both when behavior changes. Light lore is welcome, but should not make promised functionality that the model does not implement.

## A practical content check

For new content, verify generation/acquisition, legal equipment, real combat behavior, checkpoint reload, service spending/caps, challenge snapshot sanitization, art at icon and unit scales, and in-game explanation. Run the existing checks and add targeted tests where a new interaction has meaningful failure modes. Generate native asset sheets, then inspect actual desktop and phone layouts in a supported browser environment before claiming layout validation.

## Light, guild and restricted stock

Racial/Attribute/Talent sight and light radii belong in the canonical definitions and `lighting.js`. Use shared geometry for AI, fog and selection. A new lamp needs utility-slot equipping/storage, worn art, loot/vendor policy, snapshot validation and checkpoint coverage. Utility lights do not consume the eight general equipment slots.

Eight guild definitions live in `evernight.js`; exclusive `guild-*` items are canonical `ITEMS` entries marked `guildOnly`. Lessons/quests produce standing and member receipts control purchases. Ordinary loot, shops and recipes exclude guild-only and authored-only equipment. Monthly cosmetics are canonical `monthly-*` definitions with `monthlyTheme`; the dedicated Shop collection owns their acquisition and receipt rules. Do not accidentally offer these through generic rotating stock.

The Codex groups all subclass detail into class entries and modifier definitions into nine domain/category tables. Add useful costs, effects, restrictions and acquisition details to those pages instead of recreating hundreds of thin entries. Camp XP, twelve-hour food and global difficulty explanations must match the model.

## Pixel sprite coverage

Read [PIXEL_ART.md](PIXEL_ART.md). All canonical bases have original authored pixel artwork. `art.js` forwards to `pixel-art.js` for every visual surface; adding content requires a corresponding grid silhouette/layer and a native rendering check. Preserve race anatomy, visible equipment, modifiers, mounts and authored Mythicals. Asset cache URLs are v15. Free asset packs were considered during exploration; this release bundles original sprites and has no external art attribution dependency.
