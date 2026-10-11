# Current content reference

Generated with `node scripts/generate-content-reference.mjs` for version 0.14.0. These tables describe current content; all names, counts, balance and progression choices may change. Stable IDs are useful save references, not a requirement to keep every design forever.

## Races

Race foundation values precede class, levels and equipment. Growth tables are in `web/data.js`.

| Race | Vitality | Armor | Strength | Mind | Agility | Endurance | Racial trait |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Human | 12 | 1 | 8 | 8 | 10 | 8 | Adaptable · earns 20% more experience |
| Dwarf | 16 | 3 | 10 | 6 | 6 | 12 | Stoneborn · resists knockback Sees 220 units in darkness. |
| Elf | 10 | 1 | 7 | 11 | 14 | 7 | Keen eyes · +25 ranged reach |
| Orc | 16 | 2 | 13 | 4 | 9 | 11 | Heavy hands · +3 attack, stronger knockback |
| Gnome | 9 | 1 | 6 | 12 | 12 | 8 | Quick thinking · abilities recharge 15% faster Sees 200 units in darkness. |
| Shade | 10 | 0 | 8 | 11 | 16 | 6 | Elusive · 12% chance to evade attacks Sees 280 units in darkness. |
| Fae | 8 | 0 | 5 | 14 | 17 | 5 | Winged · flies over water and obstacles |
| Sylph | 9 | 0 | 6 | 12 | 17 | 6 | Slipstream · +8 speed and 8% evasion |
| Automaton | 17 | 3 | 11 | 7 | 6 | 14 | Alloy body · 40% heavier |
| Nereid | 11 | 1 | 7 | 12 | 12 | 9 | Tidal memory · regenerates 1 HP per second |
| Kobold | 10 | 1 | 9 | 6 | 15 | 8 | Nimble hands · abilities recharge 10% faster Sees 240 units in darkness. |
| Myconid | 15 | 2 | 7 | 10 | 6 | 12 | Spore shelter · nearby allies regenerate 1 HP per second Sees 210 units in darkness. |
| Drakeling | 15 | 2 | 12 | 8 | 10 | 10 | Dragon spark · +3 attack and stronger pushes |
| Celestial | 10 | 1 | 6 | 15 | 11 | 8 | Starlight · 15% stronger healing |
| Ent | 20 | 4 | 12 | 7 | 4 | 15 | Old roots · heavy body resists knockback |
| Owlkin | 11 | 1 | 8 | 14 | 14 | 8 | Watchful wings · +35 ranged reach and 6% evasion Feather wings carry them over ground obstacles. |
| Bearkin | 19 | 3 | 16 | 7 | 6 | 15 | Hibernal heart · 65% heavier; a sturdy natural constitution |

## Playable classes

Internal IDs can differ from player-facing names. Hexweaver (`witch`) and Stormwing (`stormcaller`) are retained internally as technique definitions, not separately generated playable classes.

| ID / name | Starting stat additions | Armor | Equipment slots | Active technique |
| --- | --- | --- | --- | --- |
| vanguard / Vanguard | vitality +3, strength +5 | heavy | Weapon (blade, heavy, blunt, polearm); Boots (feet) | Earthshaker — Cleave nearby enemies for 32 damage and push them back. |
| guardian / Guardian | vitality +6, armor +3 | heavy | Weapon (blade, blunt, polearm); Shield (offhand); Charm (charm) | Hold the line — Grant a 42-point shield to itself and allies within 140 steps. |
| ranger / Ranger | strength +4, agility +3 | medium | Ranged weapon (bow, crossbow, longarm, sidearm); Quiver (offhand); Boots (feet) | Split shot — Loose arrows at up to three nearby enemies. |
| healer / Cleric | mind +6, endurance +2 | light | Focus (wand, staff) | Sanctuary — Spend mana to create a modest healing Blessing. Healing is limited by each encounter’s mana pool. |
| engineer / Tinker | mind +3, endurance +4 | medium | Weapon (blunt, sidearm, longarm); Tool (tool); Tool (tool) | Fieldworks — Build a 70-HP turret and a 100-HP barricade. Up to two turrets at once. |
| assassin / Veilblade | strength +3, agility +5 | light | Weapon (blade, sidearm); Weapon (blade, sidearm) | Shadow step — Teleport beside a backline enemy, become invisible for 2 seconds, and strike. |
| summoner / Summoner | mind +7 | light | Focus (wand, staff) | Call the pack — Summon two spirit wolves for 20 seconds. Up to four wolves at once. |
| mage / Mage | mind +7 | light | Focus (wand, staff) | Arcane ground — Create an arcane Curse that damages enemies on the ground for 5 seconds. |
| bard / Bard | mind +4, endurance +3 | light | Tool (tool) | Heartstring — Charm a wounded, susceptible opponent. Complete the expedition to recruit them permanently. |
| artillery / Artillerist | strength +7 | heavy | Artillery (artillery, longarm, crossbow); Tool (tool) | Heavy shell — Launch an explosive shell for 48 area damage and powerful knockback. |
| envoy / Envoy | mind +6 | light | Focus (wand, staff) | Change of heart — Convert a non-boss enemy below 45% health within range. Mind must overcome their resolve. |
| trapper / Trapper | agility +4, strength +3 | medium | Ranged weapon (bow, crossbow, sidearm); Quiver (offhand); Tool (tool) | Snare field — Sets two snares before combat. Activates a scatter shot during the wave. |
| minelayer / Minelayer | strength +4, endurance +3 | medium | Weapon (blunt, sidearm, longarm); Tool (tool) | Remote blast — Places blast mines before combat; triggers a physical Explosion in battle. |
| alchemist / Alchemist | strength +4, mind +3 | light | Tool (tool) | Volatile flask — Throws physical explosions into crowded groups. |
| druid / Druid | mind +5, vitality +2 | light | Focus (wand, staff) | Living spring — Creates a healing Blessing under an injured ally. |
| paladin / Paladin | armor +3, mind +3 | heavy | Weapon (blade, blunt, polearm); Shield (offhand); Charm (charm) | Aegis — Protects nearby allies with a durable shield. |
| necromancer / Necromancer | mind +7 | light | Focus (wand, staff) | Echo legion — Summons spectral companions to hold the frontline. |
| psion / Psion | mind +7 | light | Focus (wand, staff) | Gravity well — Crushes groups with a Gravity Curse that pulls units together. |
| duelist / Duelist | strength +5, agility +3 | medium | Weapon (blade, sidearm); Weapon (blade, sidearm) | Crescent strike — Sweeps nearby enemies with a physical Explosion. |
| monk / Monk | strength +4, mind +3 | light | Weapon (blunt, polearm); Tool (tool) | Quiet thunder — Strikes nearby opponents with a physical Explosion and strong knockback. |

## Class point sequence and subclasses

Points at 10 / 20 / 40 / 60 / 80 alternate talent, subclass, talent, advanced subclass and talent. Every path begins with Firekeeper discipline; Forceful or Measured technique follows the first subclass, with Evernight mastery after the advanced subclass. This is separate from equipment transformations at 20 / 40 / 60.

| Class | First subclasses (20) | Advanced subclasses (60) |
| --- | --- | --- |
| Vanguard | Earthbreaker; Duelist | Earthbreaker Ascendant; Earthbreaker Warden; Duelist Ascendant; Duelist Warden |
| Guardian | Warden; Bulwark | Warden Ascendant; Warden Warden; Bulwark Ascendant; Bulwark Warden |
| Ranger | Deadeye; Outrider | Deadeye Ascendant; Deadeye Warden; Outrider Ascendant; Outrider Warden |
| Cleric | Dawnkeeper; Lightwarden | Dawnkeeper Ascendant; Dawnkeeper Warden; Lightwarden Ascendant; Lightwarden Warden |
| Tinker | Machinist; Siegewright | Machinist Ascendant; Machinist Warden; Siegewright Ascendant; Siegewright Warden |
| Veilblade | Nightblade; Phantom | Nightblade Ascendant; Nightblade Warden; Phantom Ascendant; Phantom Warden |
| Summoner | Packkeeper; Grovecaller | Packkeeper Ascendant; Packkeeper Warden; Grovecaller Ascendant; Grovecaller Warden |
| Mage | Embermage; Gravitist; Frostweaver; Hexweaver; Stormcaller | Embermage Ascendant; Embermage Warden; Gravitist Ascendant; Gravitist Warden; Frostweaver Ascendant; Frostweaver Warden; Hexweaver Ascendant; Hexweaver Warden; Stormcaller Ascendant; Stormcaller Warden |
| Bard | Anthemist; Battle Skald | Anthemist Ascendant; Anthemist Warden; Battle Skald Ascendant; Battle Skald Warden |
| Artillerist | Bombardier; Longshot | Bombardier Ascendant; Bombardier Warden; Longshot Ascendant; Longshot Warden |
| Envoy | Diplomat; Heartbinder | Diplomat Ascendant; Diplomat Warden; Heartbinder Ascendant; Heartbinder Warden |
| Trapper | Snarewright; Trailwarden | Snarewright Ascendant; Snarewright Warden; Trailwarden Ascendant; Trailwarden Warden |
| Minelayer | Demolitionist; Sapper | Demolitionist Ascendant; Demolitionist Warden; Sapper Ascendant; Sapper Warden |
| Alchemist | Pyrochemist; Wardchemist | Pyrochemist Ascendant; Pyrochemist Warden; Wardchemist Ascendant; Wardchemist Warden |
| Druid | Thornkeeper; Vinewarden | Thornkeeper Ascendant; Thornkeeper Warden; Vinewarden Ascendant; Vinewarden Warden |
| Paladin | Dawnblade; Beacon | Dawnblade Ascendant; Dawnblade Warden; Beacon Ascendant; Beacon Warden |
| Necromancer | Echo caller; Gravewarden | Echo caller Ascendant; Echo caller Warden; Gravewarden Ascendant; Gravewarden Warden |
| Psion | Singularist; Repulsor | Singularist Ascendant; Singularist Warden; Repulsor Ascendant; Repulsor Warden |
| Duelist | Bladedancer; Riposter | Bladedancer Ascendant; Bladedancer Warden; Riposter Ascendant; Riposter Warden |
| Monk | Monk Master; Monk Keeper | Monk Master Ascendant; Monk Master Warden; Monk Keeper Ascendant; Monk Keeper Warden |

## Camp, food and world tiers

Character XP contributes 25%; equipment and companion XP contributes 10%. Victories, quests, construction and expansions also grow your Camp. Camps have levels, never rarities. Level 1 requires 100 XP; each next requirement increases by 60. Camps stop at level 100. Capacity begins at 40 and gains 20 per cabin; full Camps miss character rewards. Food consumes one portion per adventurer every twelve hours; each portion grants five base XP, with racial modifiers. Fed recovery is twice as fast and visitor-cycle wanderer chance rises to 80% from 35%. Final boss journeys give one Boss Sigil; one Sigil opens any chosen unopened map.

| World tier | Distinct bosses required | Foe health | Foe damage | Reward multiplier |
| --- | --- | --- | --- | --- |
| Adventurer | 0 | 1 | 1 | 1 |
| Veteran | 1 | 1.4 | 1.25 | 1.5 |
| Nightmare | 3 | 2 | 1.65 | 2.2 |

## Light and night vision

Utility lights are separate from the eight general equipment slots. Terrain occludes detection and fog consistently. Ordinary sight is 55; Elf/Nereid sight is 95. Vampire sight is 300, Werewolf 250 and learned Night vision 190. The strongest sight applies.

| Race | Night sight radius |
| --- | --- |
| Dwarf | 220 |
| Gnome | 200 |
| Kobold | 240 |
| Myconid | 210 |
| Shade | 280 |
| Elf | 95 |
| Nereid | 95 |

| Light ID | Name | Radius |
| --- | --- | --- |
| hooded-lantern | Hooded lantern | 190 |
| witchlight-lantern | Witchlight lantern | 275 |
| guild-scouts | Runner witchlight | 275 |

## Guilds

Lessons add ten standing and claimed guild patrols add twenty. At twenty standing, the level-20 member item unlocks once per twelve hours; its base 60-gold price discounts by standing / 500 up to 40%. All eight booths offer a 35-gold stat lesson.

| ID / guild | Profession / stat | Patrol resource | Exclusive item |
| --- | --- | --- | --- |
| miners / Stonekeepers | Miner | ore | Stonekeeper pick |
| foresters / Rootwardens | Lumberjack | wood | Rootwarden axe |
| hunters / Wildwatch | Hunter | hide | Wildwatch longbow |
| arcanists / Veil Scholars | mind | herbs | Veil scholar staff |
| guardians / Oathbearers | vitality | stone | Oathbearer aegis |
| scouts / Lantern Runners | agility | wood | Runner witchlight |
| artisans / Ironhands | armor | ore | Ironhand sword |
| healers / Quiet Mercy | vitality | herbs | Mercy focus |

## Weapon bases

Each of these keys has its own SVG silhouette. `weaponKind` controls slot compatibility. More restrictions may apply. The four authored Mythical weapons are separately marked.

| ID | Base name | Family | Attack | Restrictions / identity |
| --- | --- | --- | --- | --- |
| ironblade | Sword | blade | 7 | Ordinary base |
| dagger | Dagger | blade | 5 | Ordinary base |
| greatblade | Greatsword | heavy | 20 | Strength 24+ |
| salamander | Saber | blade | 9 | Ordinary base |
| rapier | Rapier | blade | 8 | Ordinary base |
| cutlass | Cutlass | blade | 10 | Ordinary base |
| falchion | Falchion | blade | 11 | Ordinary base |
| kukri | Kukri | blade | 7 | Ordinary base |
| estoc | Estoc | blade | 9 | Ordinary base |
| twinblade | Twinblade | blade | 12 | Ordinary base |
| flamberge | Flamberge | heavy | 15 | Strength 18+ |
| executioner | Cleaver | heavy | 18 | Strength 22+ |
| hatchet | Hatchet | blunt | 7 | Ordinary base |
| waraxe | Greataxe | heavy | 14 | Strength 18+ |
| crescentaxe | Bardiche | polearm | 12 | Ordinary base |
| hammer | Hammer | blunt | 8 | Ordinary base |
| monkmaul | Monk mace | blunt | 11 | Classes: monk |
| flail | Flail | blunt | 10 | Ordinary base |
| morningstar | Morningstar | blunt | 12 | Ordinary base |
| club | Club | blunt | 6 | Ordinary base |
| spear | Spear | polearm | 8 | Ordinary base |
| glaive | Glaive | polearm | 11 | Ordinary base |
| halberd | Halberd | polearm | 14 | Strength 17+ |
| trident | Trident | polearm | 10 | Ordinary base |
| scythe | Scythe | polearm | 12 | Ordinary base |
| longbow | Longbow | bow | 8 | Ordinary base |
| shortbow | Shortbow | bow | 7 | Ordinary base |
| recurved | Recurve | bow | 10 | Ordinary base |
| stormbow | Compound bow | bow | 12 | Ordinary base |
| bonebow | Bone bow | bow | 9 | Ordinary base |
| crossbow | Crossbow | crossbow | 11 | Ordinary base |
| arbalest | Arbalest | crossbow | 16 | Strength 18+ |
| repeatingbow | Repeater | crossbow | 10 | Ordinary base |
| musket | Musket | longarm | 14 | Ordinary base |
| revolver | Revolver | sidearm | 10 | Ordinary base |
| blunderbuss | Blunderbuss | longarm | 16 | Ordinary base |
| handcannon | Hand cannon | sidearm | 15 | Ordinary base |
| cannon | Cannon | artillery | 18 | Ordinary base |
| arquebus | Arquebus | longarm | 12 | Ordinary base |
| pepperbox | Pepperbox | sidearm | 11 | Ordinary base |
| mortar | Mortar | artillery | 20 | Strength 18+ |
| longrifle | Rifle | longarm | 17 | Ordinary base |
| duelpistol | Pistol | sidearm | 12 | Ordinary base |
| lens | Focus | wand | 0 | Ordinary base |
| ember | Wand | wand | 2 | Ordinary base |
| frost | Rod | wand | 2 | Ordinary base |
| willowstaff | Crook | staff | 3 | Ordinary base |
| crystalstaff | Staff | staff | 4 | Ordinary base |
| sunstaff | Scepter | staff | 3 | Ordinary base |
| bonewand | Bone wand | wand | 3 | Ordinary base |
| forkedrod | Tuning rod | wand | 2 | Ordinary base |
| katana | Katana | blade | 11 | Ordinary base |
| dawncore | Dawncore | blunt | 15 | Authored Mythical / solar |
| riftlance | Riftlance | polearm | 17 | Authored Mythical / storm |
| riftfocus | Riftfocus | wand | 4 | Authored Mythical / storm |
| cometarm | Cometarm | artillery | 19 | Authored Mythical / iron |

## Other equipment

Armor occupies separate Head, Chest, Legs and Boots slots. Accessory and tool compatibility is checked against each character.

| ID | Name | Type / weight / position | Effect |
| --- | --- | --- | --- |
| ward | Warden plate | armor / heavy / chest | +40 health and +3 armor. Takes 15% less knockback. |
| wings | Mothwing cloak | charm | +3 Agility. Fly over water and obstacles. |
| bell | Pilgrim bell | charm | Heal yourself and nearby allies for 3 HP each second. |
| haste | Clockwork heart | tool | Abilities recharge 25% faster. +7 movement speed. |
| boots | Trail boots | feet | +4 Agility and +3 Endurance. |
| aegis | Warden shield | offhand | +3 Armor and +2 Endurance. |
| tome | Lucent codex | offhand | +4 Mind and +20 ranged reach. |
| quiver | Skyglass quiver | offhand | +3 Strength and +25 reach. |
| robe | Apprentice robe | armor / light / chest | +3 Mind and +2 Armor. |
| lute | Pilgrim chimes | tool | +3 Mind. An instrument for support abilities. |
| spring | Clockwork coil | tool | +3 Endurance and +4 speed. |
| pendant | Traveler’s pendant | charm | +2 Vitality and +2 Endurance. |
| kit | Field kit | tool | +3 Endurance. A dependable tool for fieldwork. |
| trailLeather | Patchwork trail leathers | armor / medium / chest | +2 Armor, +3 Agility, +2 Endurance. Light stitched leather. |
| scaleMail | Verdant scale mail | armor / medium / chest | +5 Armor and +3 Vitality. Layered green scales. |
| starRobe | Star-sewn robe | armor / light / chest | +6 Mind and +3 Endurance. A mantle sewn with little stars. |
| ironPlate | Citadel plate | armor / heavy / chest | +9 Armor and +4 Vitality. Requires 22 Strength. |
| pickaxe | Pickaxe | mining | +4 Strength and +2 Endurance. A miner’s trusted pick. |
| axe | Axe | woodcutting | +5 Strength. A woodcutter’s axe. |
| glacier | Glacier coat | armor / medium / chest | +5 Armor and +4 Mind. Crystalline frost trim. |
| scrollEmber | Scroll of cinders | scroll | Adds an active Ember Curse. Costs 12 stamina; 13 second base cooldown. Magic classes only. |
| scrollGravity | Scroll of falling stars | scroll | Adds an active Gravity well that pulls foes together. Costs 12 stamina; 13 second base cooldown. |
| scrollFrost | Scroll of winter | scroll | Adds an active slowing Frost Curse. Costs 12 stamina; 13 second base cooldown. |
| scrollSpring | Scroll of renewal | scroll | Adds an active healing Blessing. Costs 12 stamina; 13 second base cooldown. |
| light-head | Light hood | armor / light / head | +1 Armor. Light head protection. |
| light-chest | Light vest | armor / light / chest | +1 Armor. Light chest protection. |
| light-legs | Light greaves | armor / light / legs | +1 Armor. Light legs protection. |
| light-boots | Light boots | armor / light / boots | +1 Armor. Light boots protection. |
| medium-head | Medium hood | armor / medium / head | +2 Armor. Medium head protection. |
| medium-chest | Medium vest | armor / medium / chest | +2 Armor. Medium chest protection. |
| medium-legs | Medium greaves | armor / medium / legs | +2 Armor. Medium legs protection. |
| medium-boots | Medium boots | armor / medium / boots | +2 Armor. Medium boots protection. |
| heavy-head | Heavy hood | armor / heavy / head | +3 Armor. Heavy head protection. |
| heavy-chest | Heavy vest | armor / heavy / chest | +3 Armor. Heavy chest protection. |
| heavy-legs | Heavy greaves | armor / heavy / legs | +3 Armor. Heavy legs protection. |
| heavy-boots | Heavy boots | armor / heavy / boots | +3 Armor. Heavy boots protection. |
| light-night-boots | Steps of the Unrung Bell | armor / light / boots | Authored Mythical boots from floor 25. +6 Armor, +4 Agility; the bell-shaped soles glow violet. |
| medium-night-boots | Steps of the Unrung Bell | armor / medium / boots | Authored Mythical boots from floor 25. +6 Armor, +4 Agility; the bell-shaped soles glow violet. |
| heavy-night-boots | Steps of the Unrung Bell | armor / heavy / boots | Authored Mythical boots from floor 25. +6 Armor, +4 Agility; the bell-shaped soles glow violet. |
| hooded-lantern | Hooded lantern | light | Equipped utility light. Reveals a 190-unit radius to nearby allies and enemies. |
| witchlight-lantern | Witchlight lantern | light | Equipped utility light. Reveals a 275-unit radius without consuming supplies. |
| guild-miners | Stonekeeper pick | mining | +4 Strength and +2 Endurance. A miner’s trusted pick. Guild signature: +2 armor. Available only to guild members. |
| guild-foresters | Rootwarden axe | woodcutting | +5 Strength. A woodcutter’s axe. Guild signature: +2 endurance. Available only to guild members. |
| guild-hunters | Wildwatch longbow | weapon | +8 attack, +70 range. Fits Bow. Guild signature: +2 strength. Available only to guild members. |
| guild-arcanists | Veil scholar staff | focus | +3 attack, +4 mind, +1 endurance. Fits Staff. Guild signature: +2 mind. Available only to guild members. |
| guild-guardians | Oathbearer aegis | offhand | +3 Armor and +2 Endurance. Guild signature: +2 vitality. Available only to guild members. |
| guild-scouts | Runner witchlight | light | Equipped utility light. Reveals a 275-unit radius without consuming supplies. Guild signature: +2 agility. Available only to guild members. |
| guild-artisans | Ironhand sword | weapon | +7 attack. Fits Blade. Guild signature: +2 armor. Available only to guild members. |
| guild-healers | Mercy focus | focus | +5 mind. Fits Wand / focus. Guild signature: +2 vitality. Available only to guild members. |

## Attributes and Talents

Attributes are passive conditions or traits; Miner, Lumberjack and Hunter are Guildhall Professions. Talents include timed stat training and legacy learned skills. Both have levels and rarities. Every race also contributes its own racial Attribute, and each trained stat gets a separate training Talent.

| Attribute | Effect |
| --- | --- |
| Vampire | Vampiric hunger: restores 6% of damage dealt as health. +2 Mind. Any race can be a Vampire. Sees 300 units in darkness. |
| Werewolf | +3 Strength. Below half health, attacks and movement are 20% faster. Sees 250 units in darkness. |
| Blessed | +2 Mind and +2 Endurance. |
| Cursed | +4 Mind, −1 Armor. |
| Strong | +3 Strength. |
| Swift | +3 Agility. |
| Sturdy | +3 Vitality. |
| Strongwill | +3 Mind. |
| Inventive | +2 Mind and +2 Endurance. |
| Shieldbearer | +2 Armor. |
| Empath | +2 Mind; better at overcoming enemy resolve. |
| Zombie | Undead body: +4 Vitality, +3 Endurance, 28% slower movement, 25% heavier, and slow self-regeneration. Keeps its original race. |
| Miner | Mining guild profession. Equip a pickaxe to gather extra stone and ore; occasionally find gems and Obsidian. Ranks I, II and III improve yields. |
| Lumberjack | Foresters guild profession. Equip an axe to gather extra wood. Ranks I, II and III improve yields. |
| Hunter | Hunters guild profession. Gather extra ingredients and occasionally hides for crafting armor. Ranks I, II and III improve yields. |
| Angel | Feathered wings grant flight over water, barricades, and ground obstacles. Ground melee units cannot reach this adventurer. |

| Talent | Effect |
| --- | --- |
| Miner | Unlocks a Mining tool slot. With a pickaxe equipped, gathers 3 extra stone and 1 ore after every victory. |
| Lumberjack | Unlocks a Woodcutting tool slot. With an axe equipped, gathers 4 extra wood after every victory. |
| Night vision | See 190 units through unlit terrain. Learn from the Lantern Runners after two lessons. |
| training:vitality | Permanent vitality bonus, increased by repeated timed training. |
| training:armor | Permanent armor bonus, increased by repeated timed training. |
| training:strength | Permanent strength bonus, increased by repeated timed training. |
| training:mind | Permanent mind bonus, increased by repeated timed training. |
| training:agility | Permanent agility bonus, increased by repeated timed training. |
| training:endurance | Permanent endurance bonus, increased by repeated timed training. |

## Companions

| ID | Name | Behavior | Acquisition | Effect |
| --- | --- | --- | --- | --- |
| fox | Bramble fox | attack | Market or milestone | Follows its owner and nips nearby enemies. |
| sprite | Lantern sprite | heal | Market or milestone | Flits beside its owner, restoring a little health. |
| mote | Moon apparition | shield | Market or milestone | Orbits its owner and periodically grants a small shield. |
| beetle | Clockwork beetle | attack | Market or milestone | A tiny mechanical guard with a ranged bolt. |
| horse | Trail horse | mount | Market or milestone | Its owner rides into battle. +18 movement speed and 35% more mass. |
| raptor | Fern raptor | attack | Archaeology / dinosaur egg | A quick dinosaur that bites nearby opponents. Hatched from an Amberwild egg. |
| hadrosaur | Saddleback dinosaur | mount | Archaeology / dinosaur egg | A rideable dinosaur. +18 speed, +35% mass. Hatched from an Amberwild egg. |
| ammonite | Pearl ammonite | shield | Archaeology / 5 fossils | A floating fossil shell that lends its owner a small shield. |
| trilobite | Stone trilobite | attack | Archaeology / 4 fossils | A little plated companion that nips nearby enemies. |
| pterosaur | Amberwing | attack | Archaeology / 7 fossils | A small prehistoric flier that keeps close to its owner. |

## Cosmetic inventory

Appearance overrides preserve mechanical race, class, stats, slots and pet behavior.

| ID | Name | Scope | Gem price | Description |
| --- | --- | --- | --- | --- |
| moss | Mosslight mantle | Character palette | 3 | Earned at Mosslight’s third milestone. |
| dusk | Duskweave | Character palette | 5 | A coat the color of the evening sky. |
| crimson | Crimson traveler | Character palette | 7 | A red coat for long roads. |
| golden | Champion’s gold | Character palette | 9 | Arena champions wear the sunlight. |
| monthly-0-0 | Winter lanterns · mantle | character | 4 | A traveling mantle inspired by winter lanterns. Changes appearance; grants no combat bonuses. |
| monthly-0-1 | Winter lanterns · colors | character | 7 | Company colors inspired by winter lanterns. Changes appearance; grants no combat bonuses. |
| monthly-0-2 | Winter lanterns · regalia | character | 10 | Ceremonial regalia inspired by winter lanterns. Changes appearance; grants no combat bonuses. |
| monthly-1-0 | The silver thaw · mantle | character | 4 | A traveling mantle inspired by the silver thaw. Changes appearance; grants no combat bonuses. |
| monthly-1-1 | The silver thaw · colors | character | 7 | Company colors inspired by the silver thaw. Changes appearance; grants no combat bonuses. |
| monthly-1-2 | The silver thaw · regalia | character | 10 | Ceremonial regalia inspired by the silver thaw. Changes appearance; grants no combat bonuses. |
| monthly-2-0 | Seed and song · mantle | character | 4 | A traveling mantle inspired by seed and song. Changes appearance; grants no combat bonuses. |
| monthly-2-1 | Seed and song · colors | character | 7 | Company colors inspired by seed and song. Changes appearance; grants no combat bonuses. |
| monthly-2-2 | Seed and song · regalia | character | 10 | Ceremonial regalia inspired by seed and song. Changes appearance; grants no combat bonuses. |
| monthly-3-0 | Rainwood mysteries · mantle | character | 4 | A traveling mantle inspired by rainwood mysteries. Changes appearance; grants no combat bonuses. |
| monthly-3-1 | Rainwood mysteries · colors | character | 7 | Company colors inspired by rainwood mysteries. Changes appearance; grants no combat bonuses. |
| monthly-3-2 | Rainwood mysteries · regalia | character | 10 | Ceremonial regalia inspired by rainwood mysteries. Changes appearance; grants no combat bonuses. |
| monthly-4-0 | The bloom court · mantle | character | 4 | A traveling mantle inspired by the bloom court. Changes appearance; grants no combat bonuses. |
| monthly-4-1 | The bloom court · colors | character | 7 | Company colors inspired by the bloom court. Changes appearance; grants no combat bonuses. |
| monthly-4-2 | The bloom court · regalia | character | 10 | Ceremonial regalia inspired by the bloom court. Changes appearance; grants no combat bonuses. |
| monthly-5-0 | Lantern caravans · mantle | character | 4 | A traveling mantle inspired by lantern caravans. Changes appearance; grants no combat bonuses. |
| monthly-5-1 | Lantern caravans · colors | character | 7 | Company colors inspired by lantern caravans. Changes appearance; grants no combat bonuses. |
| monthly-5-2 | Lantern caravans · regalia | character | 10 | Ceremonial regalia inspired by lantern caravans. Changes appearance; grants no combat bonuses. |
| monthly-6-0 | Ember festival · mantle | character | 4 | A traveling mantle inspired by ember festival. Changes appearance; grants no combat bonuses. |
| monthly-6-1 | Ember festival · colors | character | 7 | Company colors inspired by ember festival. Changes appearance; grants no combat bonuses. |
| monthly-6-2 | Ember festival · regalia | character | 10 | Ceremonial regalia inspired by ember festival. Changes appearance; grants no combat bonuses. |
| monthly-7-0 | Starfall trails · mantle | character | 4 | A traveling mantle inspired by starfall trails. Changes appearance; grants no combat bonuses. |
| monthly-7-1 | Starfall trails · colors | character | 7 | Company colors inspired by starfall trails. Changes appearance; grants no combat bonuses. |
| monthly-7-2 | Starfall trails · regalia | character | 10 | Ceremonial regalia inspired by starfall trails. Changes appearance; grants no combat bonuses. |
| monthly-8-0 | The amber harvest · mantle | character | 4 | A traveling mantle inspired by the amber harvest. Changes appearance; grants no combat bonuses. |
| monthly-8-1 | The amber harvest · colors | character | 7 | Company colors inspired by the amber harvest. Changes appearance; grants no combat bonuses. |
| monthly-8-2 | The amber harvest · regalia | character | 10 | Ceremonial regalia inspired by the amber harvest. Changes appearance; grants no combat bonuses. |
| monthly-9-0 | Harvest of shadows · mantle | character | 4 | A traveling mantle inspired by harvest of shadows. Changes appearance; grants no combat bonuses. |
| monthly-9-1 | Harvest of shadows · colors | character | 7 | Company colors inspired by harvest of shadows. Changes appearance; grants no combat bonuses. |
| monthly-9-2 | Harvest of shadows · regalia | character | 10 | Ceremonial regalia inspired by harvest of shadows. Changes appearance; grants no combat bonuses. |
| monthly-10-0 | The drowned vigil · mantle | character | 4 | A traveling mantle inspired by the drowned vigil. Changes appearance; grants no combat bonuses. |
| monthly-10-1 | The drowned vigil · colors | character | 7 | Company colors inspired by the drowned vigil. Changes appearance; grants no combat bonuses. |
| monthly-10-2 | The drowned vigil · regalia | character | 10 | Ceremonial regalia inspired by the drowned vigil. Changes appearance; grants no combat bonuses. |
| monthly-11-0 | The long night · mantle | character | 4 | A traveling mantle inspired by the long night. Changes appearance; grants no combat bonuses. |
| monthly-11-1 | The long night · colors | character | 7 | Company colors inspired by the long night. Changes appearance; grants no combat bonuses. |
| monthly-11-2 | The long night · regalia | character | 10 | Ceremonial regalia inspired by the long night. Changes appearance; grants no combat bonuses. |
| starlit | Starlit mantle | Character palette | 83 | A silver-star cape with a soft violet aura. |
| roseguard | Roseguard colors | Character palette | 85 | Rose cloth, copper trim, and dancing petals. |
| sunplate | Sunplate guise | character | 12 | Replace the entire character silhouette with a masked copper sentinel and a sun shield. Mechanics and identity stay the same. |
| clockwork | Clockwork guise | character | 14 | A complete brass automaton silhouette, luminous eyes and blue reactor. Works on any race or class. |
| moonwraith | Moonwraith guise | character | 13 | A complete floating moon spirit with a crescent crown. Works on any character. |
| crystaledge | Crystal weapon skins | weapon | 8 | Faceted turquoise crystal replaces the finish of blades, heavy weapons, polearms, wands and staves. The base silhouette remains recognizable. |
| brassworks | Brassworks weapon skins | weapon | 8 | Brass housings, copper accents and a blue power cell for firearms, artillery, crossbows and blunt weapons. |
| moonfox | Moonfox companion guise | pet | 9 | Give any companion a little violet moonfox appearance. Mounts keep their riding behavior. |
| tinpet | Tin companion guise | pet | 9 | Give any companion a tiny mechanical creature appearance, with glowing eyes and a winding key. |

## Authored Mythical characters

These are original in-game identities. Normal generation does not roll them.

| ID | Name | Race / class | Signature weapon | Gem price | Theme |
| --- | --- | --- | --- | --- | --- |
| sunwarden | Sol, the Sunwarden | Human / Guardian | dawncore | 90 | A copper-armored defender carrying the last ember of a fallen sun. Shields allies and plants restorative light. |
| skyrift | Vela, the Skyrift | Owlkin / Mage | riftfocus | 105 | A masked storm navigator who stitches torn skies together. A star-metal focus casts pulling gravity wells. |
| ironcomet | Cairn, the Iron Comet | Automaton / Artillerist | cometarm | 120 | A rescued observatory engine, rebuilt as a wandering protector. Blue vents, brass plates, and explosive comet rounds. |

## Maps

Later region names appear here for developers; the Crossroads picker only reveals unlocked maps after the portal wizard is unlocked.

| ID | Name | Nodes / roads | Mini-boss node IDs | Final champion |
| --- | --- | --- | --- | --- |
| greenway | Mosslight Wood | 18 / 26 | court, ruins, gatehouse | The Thornwatch regent |
| marsh | The Hollow March | 24 / 35 | reeds, cloister, bell | The last ferryman |
| volcano | Emberpeak Mountains | 24 / 35 | watch, altar, stair | Emberpeak dragon |
| cinder | Briarfall Country | 24 / 36 | bandit, crypt, estate | The thorn-crowned sovereign |
| jungle | Amberwild Jungle | 24 / 34 | canopy, temple, thunder | The ancient tyrant |

## Camp buildings

| ID | Name | Purpose | Build cost / requirement |
| --- | --- | --- | --- |
| tent | Character tent | Meet, equip, teach Talents, or recycle your characters. | Available initially |
| storage | Storage | Equipment, companions, scrolls, consumables, gems, and materials in one chest. | Available initially |
| pantry | Pantry | Stock food to halve recovery time after expeditions. | Available initially |
| training | Training Grounds | Learn a permanent training Talent for one stat. The character stays here until their timed session ends. | 90 gold, 18 wood, 10 stone; roster 4+ |
| blacksmith | Blacksmith | Improve weapons, choose transformative modifiers, or craft a new Common weapon. | 65 gold, 12 wood, 8 stone |
| kitchen | Kitchen | Upgrade the Pantry into a Kitchen. Stock food, cook six meals efficiently, and choose ingredients for expedition dishes. | 90 gold, 18 wood, 12 stone |
| alchemist | Alchemist | Combine gems, transmute them, and brew consumables. | 160 gold, 20 wood, 24 stone, 8 ore |
| bonfire | Bonfire | Spend class points and set world difficulty. | Available initially |
| crossroads | Crossroads | Open the regional road map and plan a journey. | Available initially |
| farm | Farm plots | Harvest 2 food every five minutes, up to 24 stored food. | 110 gold, 18 wood, 8 stone; expansion: east |
| cabins | Cabins | Each cabin adds room for 20 adventurers. Your Camp starts with capacity for 40. | 140 gold, 24 wood, 12 stone; expansion: west |
| garden | Herb garden | Harvest herbs for your Kitchen and Alchemist every five minutes, up to 12 stored herbs. | 100 gold, 16 wood, 8 stone; expansion: south |
| archaeology | Archaeology Camp | Hatch dinosaur eggs and grow companions from fossils. Requires any repaired Camp expansion. | 180 gold, 20 wood, 30 stone, 6 ore; expansion: any |
| armory | Equipment Workshop | Buy, craft, sell and transform armor and equipment. Weapon work is also available at the Blacksmith. | 90 gold, 15 wood, 12 stone |
| dock | Lantern Dock | Meet Legendary travelers, with occasional Mythicals, and sail to the island's 25-floor dungeon. | 400 gold, 50 wood, 25 stone, 10 ore; expansion: south |

## Weapon modifiers

There are currently 24 prefixes, 24 affixes and 24 enchantments in this domain. Each has a visual signature. Compatibility filters can narrow its pool.

### prefix

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| flaming | Flaming | Fire attacks ignite the ground and deal splash damage. | flames |
| glacial | Glacial | Frost strikes slow opponents. | snow |
| stormbound | Stormbound | Storm attacks arc to a second nearby opponent. | lightning |
| weightless | Weightless | Gravity attacks push enemies harder and form pulling wells. | rings |
| scattershot | Scattershot | Attacks split among three nearby targets at reduced power. | shards |
| spectral | Spectral | A spectral ranged attack reaches over ground obstacles. | smoke |
| venomous | Venomous | Venom attacks splash nearby foes. | droplets |
| barbed | Barbed | Barbed strikes deal +5 attack. | thorns |
| crushing | Crushing | Heavy strikes add +45 knockback. | chevrons |
| echoing | Echoing | Echoing attacks arc to a nearby foe. | echo |
| sundering | Sundering | Broad strikes add +25 splash radius. | cracks |
| hunting | Hunting | Projectiles gain +45 range. | feathers / bow, crossbow, longarm |
| razorwind | Razorwind | Wind turns attacks into ranged strikes. | ribbons |
| rootbound | Rootbound | Entangling strikes slow opponents. | vines |
| radiant | Radiant | Radiant strikes add +4 Mind and +3 attack. | sun |
| umbral | Umbral | Shadow strikes add +6 attack. | smoke |
| resonant | Resonant | Resonance adds +5 Mind. | rings / wand, staff |
| clockwork | Clockwork | Clockwork mechanisms add +4 Agility. | gears |
| tidal | Tidal | Water strikes push opponents +25 and slow them. | waves |
| thorned | Thorned | Thorned attacks add +3 attack and +12 splash. | thorns |
| searing | Searing | Fire strikes gain +30 knockback. | embers |
| shardshot | Shardshot | Crossbows and guns split strikes across two foes. | shards / crossbow, longarm, sidearm, artillery |
| runic | Runic | Runes add +4 Mind and +3 Endurance. | runes |
| quicksilver | Quicksilver | Quick handling grants +5 Agility and +5 speed. | stars |

### affix

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| might | of Might | +6 Strength and +4 attack. | claws |
| insight | of Insight | +6 Mind and +3 Endurance. | eyes |
| swiftness | of Swiftness | +5 Agility, +8 speed, +20 range. | ribbons |
| bastion | of the Bastion | +4 Armor and +4 Vitality. | shield |
| impact | of Impact | +7 attack, +30 knockback. | cracks |
| resolve | of Resolve | +7 Endurance and +3 Mind. | banner |
| precision | of Precision | +4 agility; +25 range. | target |
| fortitude | of Fortitude | +5 vitality; +4 endurance. | shield |
| wisdom | of Wisdom | +8 mind. | runes |
| reach | of Reach | +55 range. | ribbons |
| ferocity | of Ferocity | +5 strength; +3 attack. | claws |
| balance | of Balance | +3 strength; +3 mind; +3 agility. | scales |
| vigor | of Vigor | +7 vitality. | leaves |
| patience | of Patience | +6 endurance; +15 range. | hourglass |
| celerity | of Celerity | +7 agility. | chevrons |
| stalwart | of the Stalwart | +5 armor; +3 endurance. | shield |
| cunning | of Cunning | +4 mind; +4 agility. | eyes |
| giants | of Giants | +7 strength; +20 knock. | mountains |
| emberheart | of the Emberheart | +5 attack; +3 vitality. | sun |
| longwatch | of the Long Watch | +30 range; +4 endurance. | target |
| scholar | of the Scholar | +5 mind; +3 vitality. | pages |
| nimble | of Nimble Hands | +4 agility; +9 speed. | feathers |
| sentinel | of the Sentinel | +3 armor; +20 range; +3 endurance. | shield |
| valor | of Valor | +4 strength; +4 vitality. | banner |

### enchantment

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| meteor | Starfall | Active: spends 16 mana to cast an explosive fire meteor every 18s. | stars |
| gravity | Singularity | Active: spends 16 mana on a pulling Gravity Curse every 20s. | spiral |
| sanctuary | Hearthguard | Active: spends 16 mana to place a modest healing Blessing every 24s. | cross |
| winter | Whiteout | Active: spends 16 mana to cast a wide slowing Frost Curse every 19s. | snow |
| tempest | Tempest | Active: spends 16 mana on a storm burst every 17s. | cloud |
| maelstrom | Maelstrom | Active: casts gravity every 21s, spending 16 mana. | spiral |
| cinderwake | Cinderwake | Active: casts ember every 22s, spending 16 mana. | embers |
| hailstorm | Hailstorm | Active: casts frost every 23s, spending 16 mana. | shards |
| thunderhead | Thunderhead | Active: casts storm every 24s, spending 16 mana. | cloud |
| mending | Mending Light | Active: casts heal every 28s, spending 16 mana. | cross |
| voidbell | Void Bell | Active: casts gravity every 27s, spending 16 mana. | rings |
| sunburst | Sunburst | Active: casts arcane every 20s, spending 16 mana. | sun |
| thornveil | Thornveil | Active: casts hex every 23s, spending 16 mana. | vines |
| soulflare | Soulflare | Active: casts arcane every 25s, spending 16 mana. | smoke |
| frostbite | Frostbite | Active: casts frost every 17s, spending 16 mana. | snow |
| wildfire | Wildfire | Active: casts ember every 26s, spending 16 mana. | flames |
| staticfield | Static Field | Active: casts storm every 16s, spending 16 mana. | lightning |
| moonwell | Moonwell | Active: casts heal every 30s, spending 16 mana. | moon |
| earthshaker | Earthshaker | Active: casts gravity every 29s, spending 16 mana. | mountains |
| brightward | Brightward | Active: casts heal every 26s, spending 16 mana. | shield |
| rimecircle | Rime Circle | Active: casts frost every 25s, spending 16 mana. | rings |
| stormeye | Storm Eye | Active: casts storm every 28s, spending 16 mana. | eyes |
| nightbloom | Nightbloom | Active: casts hex every 24s, spending 16 mana. | leaves |
| starbridge | Starbridge | Active: casts arcane every 18s, spending 16 mana. | stars |


## Armor modifiers

There are currently 24 prefixes, 24 affixes and 24 enchantments in this domain. Each has a visual signature. Compatibility filters can narrow its pool.

### prefix

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| armorp1 | Cinderwoven | +3 vitality; +4% dodge. | flames |
| armorp2 | Rimeplated | +4 armor; +6 speed. | snow |
| armorp3 | Stormstitched | +5 strength; +15 range. | lightning |
| armorp4 | Gravestone | +3 mind; +10% force. | rings |
| armorp5 | Rootguard | +4 agility; +4% dodge. | vines |
| armorp6 | Sunblessed | +5 endurance; +6 speed. | sun |
| armorp7 | Nightweave | +3 vitality; +15 range. | smoke |
| armorp8 | Tidewashed | +4 armor; +10% force. | waves |
| armorp9 | Featherlight | +5 strength; +4% dodge; Flight with mechanical wings. | feathers |
| armorp10 | Clockplated | +3 mind; +6 speed. | gears |
| armorp11 | Runebound | +4 agility; +15 range. | runes |
| armorp12 | Starlaced | +5 endurance; +10% force. | stars |
| armorp13 | Briarsteel | +3 vitality; +4% dodge. | thorns |
| armorp14 | Mosssealed | +4 armor; +6 speed. | droplets |
| armorp15 | Shardguard | +5 strength; +15 range. | shards |
| armorp16 | Echoshell | +3 mind; +10% force. | echo |
| armorp17 | Windborne | +4 agility; +4% dodge. | chevrons |
| armorp18 | Ironward | +5 endurance; +6 speed. | shield |
| armorp19 | Mountainhide | +3 vitality; +15 range. | mountains / heavy |
| armorp20 | Leafmail | +4 armor; +10% force. | leaves |
| armorp21 | Oculus | +5 strength; +4% dodge. | eyes |
| armorp22 | Mistweave | +3 mind; +6 speed. | ribbons |
| armorp23 | Cloudspun | +4 agility; +15 range. | cloud |
| armorp24 | Bannered | +5 endurance; +10% force. | banner |

### affix

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| armora1 | of Shelter | +5 vitality. | waves |
| armora2 | of the Rampart | +6 armor; +3 mind. | feathers |
| armora3 | of Clear Thought | +7 strength; +3 agility; +2 vitality. | gears |
| armora4 | of Fleet Steps | +5 mind. | runes |
| armora5 | of Deep Breath | +6 agility; +3 vitality. | stars |
| armora6 | of Heartwood | +7 endurance; +3 armor; +2 mind. | thorns |
| armora7 | of Iron Resolve | +5 vitality. | droplets |
| armora8 | of the Watch | +6 armor; +3 mind. | shards |
| armora9 | of Quiet Focus | +7 strength; +3 agility; +2 vitality. | echo |
| armora10 | of the Bulwark | +5 mind. | chevrons |
| armora11 | of Silver Grace | +6 agility; +3 vitality. | shield |
| armora12 | of the Scholar | +7 endurance; +3 armor; +2 mind. | mountains |
| armora13 | of Courage | +5 vitality. | leaves |
| armora14 | of Nimble Feet | +6 armor; +3 mind. | eyes |
| armora15 | of Endurance | +7 strength; +3 agility; +2 vitality. | ribbons |
| armora16 | of the Oak | +5 mind. | cloud |
| armora17 | of Insightful Guard | +6 agility; +3 vitality. | banner |
| armora18 | of the Runner | +7 endurance; +3 armor; +2 mind. | flames |
| armora19 | of Solace | +5 vitality. | snow |
| armora20 | of the Fortress | +6 armor; +3 mind. | lightning |
| armora21 | of the Pathfinder | +7 strength; +3 agility; +2 vitality. | rings |
| armora22 | of Strong Shoulders | +5 mind. | vines |
| armora23 | of Steady Hands | +6 agility; +3 vitality. | sun |
| armora24 | of the Hearth | +7 endurance; +3 armor; +2 mind. | smoke |

### enchantment

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| armore1 | Ashen Shelter | Active: the wearer casts ember every 20s, spending 16 mana. | droplets |
| armore2 | Winter Dome | Active: the wearer casts frost every 22s, spending 16 mana. | shards |
| armore3 | Thunder Ward | Active: the wearer casts storm every 24s, spending 16 mana. | echo |
| armore4 | Gravity Mantle | Active: the wearer casts gravity every 26s, spending 16 mana. | chevrons |
| armore5 | Briar Curse | Active: the wearer casts hex every 28s, spending 16 mana. | shield |
| armore6 | Daybreak | Active: the wearer casts heal every 30s, spending 16 mana. | mountains |
| armore7 | Night Shroud | Active: the wearer casts arcane every 32s, spending 16 mana. | leaves |
| armore8 | Tidal Sanctuary | Active: the wearer casts heal every 34s, spending 16 mana. | eyes |
| armore9 | Zephyr Ward | Active: the wearer casts ember every 20s, spending 16 mana. | ribbons |
| armore10 | Gearstorm | Active: the wearer casts frost every 22s, spending 16 mana. | cloud |
| armore11 | Runic Eclipse | Active: the wearer casts storm every 24s, spending 16 mana. | banner |
| armore12 | Celestial Beacon | Active: the wearer casts gravity every 26s, spending 16 mana. | flames |
| armore13 | Thorn Chapel | Active: the wearer casts hex every 28s, spending 16 mana. | snow |
| armore14 | Verdant Mercy | Active: the wearer casts heal every 30s, spending 16 mana. | lightning |
| armore15 | Crystal Tempest | Active: the wearer casts arcane every 32s, spending 16 mana. | rings |
| armore16 | Echo Sanctuary | Active: the wearer casts heal every 34s, spending 16 mana. | vines |
| armore17 | Gale Circle | Active: the wearer casts ember every 20s, spending 16 mana. | sun |
| armore18 | Guardian Light | Active: the wearer casts frost every 22s, spending 16 mana. | smoke |
| armore19 | Mountain Heart | Active: the wearer casts storm every 24s, spending 16 mana. | waves |
| armore20 | Leaf Blessing | Active: the wearer casts gravity every 26s, spending 16 mana. | feathers |
| armore21 | Oracle Eye | Active: the wearer casts hex every 28s, spending 16 mana. | gears |
| armore22 | Mist Refuge | Active: the wearer casts heal every 30s, spending 16 mana. | runes |
| armore23 | Cloud Crown | Active: the wearer casts arcane every 32s, spending 16 mana. | stars |
| armore24 | Banner of Dawn | Active: the wearer casts heal every 34s, spending 16 mana. | thorns |


## Companion modifiers

There are currently 24 prefixes, 24 affixes and 24 enchantments in this domain. Each has a visual signature. Compatibility filters can narrow its pool.

### prefix

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| petp1 | Emberfur | +3 vitality; +4% dodge. Companion bonuses improve its owner and combat body. | flames |
| petp2 | Frostwhisker | +4 armor; +6 speed. Companion bonuses improve its owner and combat body. | snow |
| petp3 | Stormtail | +5 strength; +15 range. Companion bonuses improve its owner and combat body. | lightning |
| petp4 | Moonbound | +3 mind; +10% force. Companion bonuses improve its owner and combat body. | rings |
| petp5 | Vinefriend | +4 agility; +4% dodge. Companion bonuses improve its owner and combat body. | vines |
| petp6 | Dawnmarked | +5 endurance; +6 speed. Companion bonuses improve its owner and combat body. | sun |
| petp7 | Duskcoat | +3 vitality; +15 range. Companion bonuses improve its owner and combat body. | smoke |
| petp8 | Riverborn | +4 armor; +10% force. Companion bonuses improve its owner and combat body. | waves |
| petp9 | Skyfeather | +5 strength; +4% dodge; Flight with feather wings. Companion bonuses improve its owner and combat body. | feathers |
| petp10 | Clockheart | +3 mind; +6 speed. Companion bonuses improve its owner and combat body. | gears |
| petp11 | Runeclad | +4 agility; +15 range. Companion bonuses improve its owner and combat body. | runes |
| petp12 | Starry | +5 endurance; +10% force. Companion bonuses improve its owner and combat body. | stars |
| petp13 | Briarback | +3 vitality; +4% dodge. Companion bonuses improve its owner and combat body. | thorns |
| petp14 | Mossfoot | +4 armor; +6 speed. Companion bonuses improve its owner and combat body. | droplets |
| petp15 | Crystalspine | +5 strength; +15 range. Companion bonuses improve its owner and combat body. | shards |
| petp16 | Echocall | +3 mind; +10% force. Companion bonuses improve its owner and combat body. | echo |
| petp17 | Galestride | +4 agility; +4% dodge. Companion bonuses improve its owner and combat body. | chevrons |
| petp18 | Shieldfriend | +5 endurance; +6 speed. Companion bonuses improve its owner and combat body. | shield |
| petp19 | Stonepaw | +3 vitality; +15 range. Companion bonuses improve its owner and combat body. | mountains / horse, hadrosaur |
| petp20 | Leafkin | +4 armor; +10% force. Companion bonuses improve its owner and combat body. | leaves |
| petp21 | Watchful | +5 strength; +4% dodge. Companion bonuses improve its owner and combat body. | eyes |
| petp22 | Miststep | +3 mind; +6 speed. Companion bonuses improve its owner and combat body. | ribbons |
| petp23 | Cloudtuft | +4 agility; +15 range. Companion bonuses improve its owner and combat body. | cloud |
| petp24 | Lionhearted | +5 endurance; +10% force. Companion bonuses improve its owner and combat body. | banner |

### affix

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| peta1 | of Loyalty | +5 vitality. Companion bonuses improve its owner and combat body. | waves |
| peta2 | of Keen Senses | +6 armor; +3 mind. Companion bonuses improve its owner and combat body. | feathers |
| peta3 | of Brave Paws | +7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body. | gears |
| peta4 | of Clever Tricks | +5 mind. Companion bonuses improve its owner and combat body. | runes |
| peta5 | of Enduring Bonds | +6 agility; +3 vitality. Companion bonuses improve its owner and combat body. | stars |
| peta6 | of Bright Spirits | +7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body. | thorns |
| peta7 | of Swift Wings | +5 vitality. Companion bonuses improve its owner and combat body. | droplets |
| peta8 | of the Guardian | +6 armor; +3 mind. Companion bonuses improve its owner and combat body. | shards |
| peta9 | of Daring | +7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body. | echo |
| peta10 | of Comfort | +5 mind. Companion bonuses improve its owner and combat body. | chevrons |
| peta11 | of the Watcher | +6 agility; +3 vitality. Companion bonuses improve its owner and combat body. | shield |
| peta12 | of the Wanderer | +7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body. | mountains |
| peta13 | of Resilience | +5 vitality. Companion bonuses improve its owner and combat body. | leaves |
| peta14 | of Quick Feet | +6 armor; +3 mind. Companion bonuses improve its owner and combat body. | eyes |
| peta15 | of Deep Trust | +7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body. | ribbons |
| peta16 | of Shared Wisdom | +5 mind. Companion bonuses improve its owner and combat body. | cloud |
| peta17 | of Quiet Strength | +6 agility; +3 vitality. Companion bonuses improve its owner and combat body. | banner |
| peta18 | of the Scout | +7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body. | flames |
| peta19 | of the Keeper | +5 vitality. Companion bonuses improve its owner and combat body. | snow |
| peta20 | of Kind Hearts | +6 armor; +3 mind. Companion bonuses improve its owner and combat body. | lightning |
| peta21 | of Sharp Claws | +7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body. | rings |
| peta22 | of the Guide | +5 mind. Companion bonuses improve its owner and combat body. | vines |
| peta23 | of Strong Bonds | +6 agility; +3 vitality. Companion bonuses improve its owner and combat body. | sun |
| peta24 | of Gentle Courage | +7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body. | smoke |

### enchantment

| ID | Name | Mechanical effect | Visual / restriction |
| --- | --- | --- | --- |
| pete1 | Phoenix Call | Active: the companion casts ember every 20s, spending 16 mana. | droplets |
| pete2 | Winter Song | Active: the companion casts frost every 22s, spending 16 mana. | shards |
| pete3 | Thunder Chirp | Active: the companion casts storm every 24s, spending 16 mana. | echo |
| pete4 | Moon Pull | Active: the companion casts gravity every 26s, spending 16 mana. | chevrons |
| pete5 | Briar Howl | Active: the companion casts hex every 28s, spending 16 mana. | shield |
| pete6 | Morning Light | Active: the companion casts heal every 30s, spending 16 mana. | mountains |
| pete7 | Shadow Purr | Active: the companion casts arcane every 32s, spending 16 mana. | leaves |
| pete8 | River Song | Active: the companion casts heal every 34s, spending 16 mana. | eyes |
| pete9 | Skycall | Active: the companion casts ember every 20s, spending 16 mana. | ribbons |
| pete10 | Clockwork Pulse | Active: the companion casts frost every 22s, spending 16 mana. | cloud |
| pete11 | Rune Song | Active: the companion casts storm every 24s, spending 16 mana. | banner |
| pete12 | Star Leap | Active: the companion casts gravity every 26s, spending 16 mana. | flames |
| pete13 | Thorn Dance | Active: the companion casts hex every 28s, spending 16 mana. | snow |
| pete14 | Moss Mending | Active: the companion casts heal every 30s, spending 16 mana. | lightning |
| pete15 | Crystal Call | Active: the companion casts arcane every 32s, spending 16 mana. | rings |
| pete16 | Echo Howl | Active: the companion casts heal every 34s, spending 16 mana. | vines |
| pete17 | Gale Cry | Active: the companion casts ember every 20s, spending 16 mana. | sun |
| pete18 | Guardian Purr | Active: the companion casts frost every 22s, spending 16 mana. | smoke |
| pete19 | Stone Roar | Active: the companion casts storm every 24s, spending 16 mana. | waves |
| pete20 | Leafsong | Active: the companion casts gravity every 26s, spending 16 mana. | feathers |
| pete21 | Oracle Whisper | Active: the companion casts hex every 28s, spending 16 mana. | gears |
| pete22 | Mist Call | Active: the companion casts heal every 30s, spending 16 mana. | runes |
| pete23 | Cloudsong | Active: the companion casts arcane every 32s, spending 16 mana. | stars |
| pete24 | Valiant Call | Active: the companion casts heal every 34s, spending 16 mana. | thorns |

