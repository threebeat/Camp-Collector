# Current game behavior

This is the version-0.13 snapshot. Earlier conversation ideas evolved repeatedly; these notes describe the implemented game rather than treating every historical suggestion as a current requirement.

## Starting and living at Camp

The world has permanently turned to night. New players name a Camp beside a lantern-lit Market. They receive three individually named level-5 adventurers: a Human Vanguard, an Elf Ranger and a Nereid Cleric. All starting gear is Common. They begin with 30 gold, six food, one Trail supper and one expedition slot. A single Main Quest directs the first journey. Two Side Quests invite players to name Camp and stock the Pantry; completing them gives early resources without defeating a boss.

Camp contains walking residents and companions. Clicking selects a character and replaces the Camp bar with the inspector. The character tent opens a searchable roster, then its own detailed profile with equipment, companions, reciprocal friendships, editable memories and growth tables. Those management sections are absent from the smaller character inspector. Mouse, pen and touch pointer dragging can reposition a resident or drop them on a service; ordinary building taps provide an alternative. Market visitors can be selected before walking north to the vendor map.

The Camp bar contains rename, current/max adventurers, ready characters, traveling parties, victories, stocked food and waiting arrivals. The resource strip uses separate Stone and Ore icons and does not list eggs. Camp initially holds **20 adventurers**. Each built cabin adds **20**; repeated cabins have increasing costs. Recruitment/purchases respect capacity before payment. Earned milestone arrivals can wait until there is space. Charm also reserves available capacity across active parties.

There is no retirement service. Release lets an idle, non-favorite adventurer leave and returns equipment/armor/companion to storage, with no currency reward. The last three characters are protected. Recycling is separate: it deliberately consumes a character for gold and scarce gem value, through a confirmation. Favorites and availability constraints apply to destructive actions.

## Camp services

| Service | Purpose |
| --- | --- |
| Character tent | Roster and detailed profiles with gear, companions, friends, memories, growth, recycling and release |
| Storage | Searchable belongings and direct Equip → compatible character/slot choices, plus material, scroll, gem and supply tabs |
| Bonfire | Spend class points; transform armor and companions |
| Crossroads | Open the current regional road map and plan a journey |
| Pantry | Buy food; food reduces returning-character recovery time |
| Training Grounds | Permanently improve one stat with a timed training Talent; requires construction and at least four adventurers |
| Blacksmith | Timed weapon improvement, weapon transformations and crafting Common weapon bases; replaces the Sharpening Bench |
| Equipment Workshop | Craft basic armor; buy/sell through the Market; transform weapons, armor and companions |
| Kitchen | Upgrade the Pantry in place; retains food buying, cooks six meals and ingredient-based Trail supper, stew and tea |
| Alchemist | Brew supplies, combine gems and turn gems into selected materials |
| Farm / Herb garden | Harvest food or herbs after repairing the corresponding Camp extension |
| Cabins | Add twenty adventurer spaces per cabin in the west extension |
| Archaeology Camp | Built after any Camp extension; hatch dinosaur eggs and grow fossil companions |
| Lantern Dock | South lakeshore construction; high-tier arrivals and the 25-floor island expedition |

Unbuilt services stay out of the scene and appear in the Build dialog. East, west and south road repairs cost gold/materials; buying one increases the others' costs. The northern arrow visits the Market. Archaeology is placed in an owned extension. Eggs create a Fern raptor or rideable Saddleback dinosaur for 40 gold. Fossil recipes create an Ammonite, Trilobite or flying Amberwing, each for 55 gold plus its fossil requirement. Nesting valley supplies eggs; Amberwild's fossil sites supply fossils.

Training starts at 35 gold and 30 seconds. Every completed session on that character, even in a different stat, increases the next cost by 30 gold and multiplies duration by 1.65 up to one hour. A stat's training Talent adds 3 points per Talent level, scaled by rarity. The character is unavailable while training. Weapon improvement has ranks up to five, uses gold/ore and takes real time; it is separate from rarity transformations and adding slots.

## Character identities

Race supplies six stat foundations, physiology and a racial Attribute. Class supplies targeted stat additions, an active technique, starting equipment slots and armor weight. Generation adds a name, unique instance ID and varied appearance. Collection decisions, equipment, training, other Attributes and Talents, companions, class choices, bonds and journals make characters increasingly personal.

The six visible stats are Vitality, Armor, Strength, Mind, Agility and Endurance. All increase slightly on level-up using race/class growth tables, and level-up restores full health. Health and XP include numbers on cards; HP is near the top and XP at the bottom. The inspector has compact listings with hover help and persistent click explanations.

| Category | Current rule |
| --- | --- |
| Active abilities | Automatic unit actions; up to ten total; each has levels and rarity |
| Attributes | Passive traits/conditions such as Vampire, Zombie, Werewolf and Angel; any race can have them |
| Professions | Miner, Lumberjack and Hunter Attributes at I/II/III; tool professions add dedicated slots. Legacy gathering Talents remain functional |
| Talents | Timed stat training and retained learned skills |
| Equipment | One to three starting class slots, extensible to eight; compatibility also checks weapon family, class and Strength requirements |
| Armor | Head, Chest, Legs and Boots separately from the equipment cap; class uses light, medium or heavy weight |
| Companion | One equipped companion, with its own level, rarity, forms and optional gem sockets |

Race and class affect height and width. Elves are thinner than Humans; Dwarves and Orcs are wider; Fae are tiny and Ents huge. Celestials have crowns and cannot equip helmets. Orcs, Kobolds and Nereids have sparse marks/single hairs instead of regular hairstyles. Shades use animated dark smoke and Sylphs pale smoke. Feather, insect and mechanical wings visually communicate flight. Full cosmetic guises may deliberately override physiological appearance while keeping its mechanics.

## Rarity, class points and equipment forms

| Rarity | Ordinary levels | Character specialization |
| --- | --- | --- |
| Common | 1–19 | Original class |
| Uncommon | 20–39 | First class point at 20 |
| Rare | 40–59 | Next class point at 40 |
| Legendary | 60–100 | Next class point at 60 |
| Mythical | Authored special identities | No additional ordinary level milestone |

Clicking the class in a profile or inspector opens its foundations, equipment families, armor weight, growth and centered calling tree. The Bonfire also offers exclusive callings. The first choice locks the other callings; subsequent nodes fork again and lock siblings. Characters retain identity, race and core class. There is no standard character transformation action. Levels 80 and 100 currently grant no further class points.

Weapons, armor and companions can transform at levels 20, 40 and 60, preserving identity and XP. Each form adds one missing modifier category: prefix, affix or enchantment. Prefixes usually change element or attack style; affixes modify stats; enchantments grant an activated behavior. There are separate pools for each domain, currently 24 of each category. Compatibility can restrict a modifier. Ordinary rarity rises automatically with level, but modifiers require the service action.

Transform costs are 4 gem value, then 10 gem value plus 5 Obsidian, then 16 gem value plus 5 Relic fragments. The Equipment Workshop transforms all three domains; the Blacksmith also handles weapons and the Bonfire also handles armor and companions. Common weapon bases have simple names and unique silhouettes; modifiers extend their names/art. Rare pets have one gem socket, Legendary two and special Mythicals three. Horses and Saddleback dinosaurs are mounts; other pets accompany the owner as smaller units.

## Local maps and journeys

Only the forest is available initially. The region picker is absent until its final boss is defeated and Eldrin/portal appear by Camp's Crossroads. Subsequent bosses unlock successive maps; only unlocked region names appear in that picker. Camp remains the sole buildable home.

The current order is Mosslight Wood → Hollow March → Emberpeak Mountains → Briarfall Country → Amberwild Jungle. The forest contains eighteen irregular nodes; other maps currently have twenty-four. Every map has three Rare mini-boss nodes and one Rare final boss. Map terrain remains visible; unrevealed nodes are darkened. Castle artwork sits beside the boss marker. Landmarks show rivers/lakes, ruins, mills, fields, volcanic terrain and prehistoric sites.

Selecting a reachable destination produces up to three paths. Each lists combat/non-combat encounters, difficulty, reward multiplier and food per character. **The Direct road always has 1× enemy strength and 1× rewards**, including after the boss. Other routes increase both. Clearing that map's boss unlocks optional difficulty settings for detours. Strong roads are solid and lead to more open combat; wild roads are dotted and use more obstacles. The selected route is bright blue and other roads are black. Water-adjacent forest roads produce river/bridge battlefields.

Locking the route opens the separate party screen. Parties contain three to six ready characters, with equipped primary slots and sufficient provisions. Short opening journeys need no food; longer paths reserve food per adventurer. Up to three supply kinds can be packed. The frozen itinerary then advances through encounters/stops; there are no mid-run directional decisions. More expedition slots unlock through progression, up to four, and each adventurer can serve only one party at a time.

## Battle, rewards and recovery

Units automatically form up at opposite ends of a long battlefield. Every encounter starts with a 3–2–1–Fight countdown. Basic movement, collision, crowding, knockback, props, fire, blood/scorch marks, projectiles and visible abilities provide feedback. Magic ground effects are Blessings or Curses; physical areas are Explosions. Jungle foliage impairs ground movement, reach and many projectiles. Mana refills per encounter and does not regenerate during the fight; healing is limited and prolonged combat has anti-stalemate behavior.

Observed 1× play has OFF/AUTO. With OFF, the player presses Continue between encounters. Leaving the battle/page, reopening it, or choosing 2×/3× enables AUTO. Unobserved parties use 1×. A Web Worker handles open-browser progression; elapsed time is reconstructed after suspension/closure. There is no always-running expedition server yet.

An encounter is lost when the party is defeated. Victory and Defeat have distinct result panels; intermediate wins also show a banner. When at least one adventurer survives, fallen party members return at 20% HP unless leveling has healed them. Earned gold/items/materials are banked during the journey and remain after defeat or recall. Original characters/equipment are preserved. Destination-only rewards and permanently charmed recruits require finishing the journey. Each run can collect at most two recruits; bosses and uncharmable enemies cannot be converted.

Returning characters recover gradually to full HP and become ready when the timer finishes. Normal return is 30 seconds, defeat 90; one stocked food per character halves it. Finishing training/weapon work updates the character's usable state. Further economy/duration tuning is open.

## Challenges, Arena, Market and Shop

Daily Battle is the Challenges default and offers **only today's UTC battle**. Monthly themes and bonuses for five, ten, twenty and all dates remain. Weekly/monthly champion battles follow the theme; each defeated map boss also unlocks a weekly champion rematch. NPC challenges, including Arena, allow difficulty selection immediately. For Daily and champion trials, a harder win pays only the increase over the highest already claimed tier; repeating the same or lower tier does not duplicate its prize. XP still accrues.

Player challenges are consenting, server-resolved three-character teams with matched gold and optional equipment pledges. Only the pledge is at stake; the original party stays owned. Competitive currency ownership is still client-local, so this system is a prototype rather than a cheat-resistant ranked economy.

Arena is a four-team battle royale with a small party; lions and chariots can enter as hazards. Winning awards gold and a cosmetic. Market vendors use gold and offer themed stock plus services for analysis, creation, combination, non-weapon crafting, companion forging and cosmetic application. Its full catalog is searchable/filterable by vendor, type, rarity and text. Ordinary stock remains mostly Common with selected higher-level offers; it refreshes every twelve hours.

The separate gem Shop sells cosmetics and authored Mythical characters/signature weapons. Sol the Sunwarden, Vela the Skyrift and Cairn the Iron Comet are original themed identities with distinct guises and gear. Character guises replace the complete body appearance; weapon skins apply only to compatible families; pet guises replace companion appearance. The Market Atelier previews and applies owned cosmetics without changing mechanics. Gem Shop offers show their visual assets and the twelve-hour stock timer.

Gems have Ruby, Sapphire and Emerald kinds and Chipped/Cut/Flawless/Royal values 1/3/9/27. Three identical smaller gems combine to one larger with equal total value. Socketed gems are excluded from spendable currency and can be removed intact. Alchemy can consume gems for materials. Recycling returns gold and limited gems depending on object level; gaining gems should feel meaningfully slower than ordinary gold income.

## Market districts and neutral characters

Four directional signs link the square to the Guildhall (north), Outfitter (west), Quest Board (east) and Camp (south). The Lantern Clinic is a named Market service. The Outfitter adds equipment slots at level 10 for 75 gold and 2 gem value, within the eight-slot cap.

The Guildhall teaches Miner, Lumberjack and Hunter as Profession Attributes without replacing class. Lessons cost 35 / 75 / 150 gold; promotions also require 6 / 12 of the corresponding stone, wood or meat. The first tool lesson includes a Pickaxe/Axe. Professions progress through XP; lessons can promote directly to levels 21 and 41 (ranks II and III). Miners yield 3 stone and 1 ore per rank; Foresters yield 4 wood per rank; Hunters yield 3 meat per rank, with a chance of crafting hides. Miners can also find gems and Obsidian. Ordinary Market recruits occasionally arrive already trained.

Every three hours, stable neutral arrivals appear. Blue inspection gradients distinguish neutral characters from friendly green and enemy red. Wanderers can be hired at their listed price within Camp capacity. Mara has a scripted lantern quest; a red exclamation point marks the Night Watch challenger. Accepted patrol contracts retain their objective across daily board refreshes and pay once. Up to eight unclaimed Side/NPC quests can be carried, in addition to one Main Quest.

Attributes are absent from purchasable stock; old saved capsules are removed from vendor stock. Generic Attribute granting is disabled. Only the Market Lantern Clinic removes a non-racial, non-Profession Attribute, for 50 gold and 2 herbs. Owned legacy essences remain keepsakes.

Equipment comparison sheets show a candidate against every compatible character's equipped piece and the resulting core/derived stats. Storage equipping uses the same restrictions as the model, including Strength, class and armor weight. A slot's dot indicates newly available compatible inventory instances; opening that slot acknowledges the items it contains. Four armor pieces have distinct icon and worn-art shapes, rarity outlines and modifier effects.

## The south lakeshore and island

The south extension opens a lake scene. The forest local map shows that same southern water and the violet-marked island, visible before the Dock is affordable. Building the Lantern Dock costs 400 gold, 50 wood, 25 stone and 10 ore after acquiring the south extension.

Ships bring level-60 Legendary recruits (1,800 gold) and occasional authored Vela the Skyrift arrivals (4,000 gold, 12% of dock arrival cycles). Dock visitors rotate every three hours and each arrival can be hired once.

The Bell Beneath is a frozen itinerary of 25 combat floors, starting near level 12 and increasing with depth. Every fifth floor is a guardian. Sailing requires three to six ready adventurers with primary gear and reserves 3 food per adventurer. Deepest floor is retained on recall/defeat. Floor 25 awards one authored Mythical Boots piece in the first party member's armor weight, plus 9 gems, once per Camp. It cannot be rolled in normal loot or crafted as basic armor. Original characters, recovery, catch-up and checkpoint rules continue to apply.
