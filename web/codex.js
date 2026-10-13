import {
  RACES,
  CLASSES,
  ITEMS,
  CORE_STATS,
  SCHOOLS,
  ATTRIBUTES,
  TALENTS,
  PETS,
  LOCATIONS,
  COSMETICS,
  DIFFICULTIES,
  EQUIPMENT_TYPES,
  CONSUMABLES,
  WEAPON_KINDS,
  PREFIXES,
  AFFIXES,
  ENCHANTMENTS,
  WEAPON_MODIFIERS,
  ARMOR_MODIFIERS,
  PET_MODIFIERS,
} from "./data.js?v=20";
import { CONTEXT, BUILDINGS, MATERIALS } from "./world.js?v=20";
const mechanics = [
  [
    "Living Camp and Market",
    "Camp",
    "Select an adventurer walking around Camp or the Market. Drag with a mouse, pen, or finger to pick them up and reposition them. Drop on a Camp service to open it with that character selected; drop on a Market stall to see goods compatible with their equipment slots, class armor weight, and weapon restrictions. The Camp arrow opens a visitor picker. Bring up to six ready characters, or browse alone. Companions follow the heroes you bring. Camp buildings, vendor buttons, and the Character tent provide tap and click alternatives to dragging. Crossroads is reached only from Camp; the navigation bar lists your active Expeditions instead.",
  ],
  [
    "The six stats",
    "Characters",
    "Vitality gives 10 maximum HP per point. Armor subtracts from physical hits and reduces magic damage. Strength powers physical attacks; Mind powers magic, healing, and persuasion. Agility increases movement and attack speed. Endurance improves stamina, active recharge, and resistance to knockback. All six grow a little on every level.",
  ],
  [
    "A level is a small step",
    "Progression",
    "Race and class growth tables increase all six stats on every level. A level-up restores full health. Equipped equipment, armor and companions also earn XP. Characters keep their names, race, equipment and class choices as they grow. Class points are earned at levels 10, 20, 40, 60 and 80, independently of rarity.",
  ],
  [
    "Talents and Attributes",
    "Characters",
    "Talents include each stat’s Training Grounds improvement. Miner, Lumberjack and Hunter are Profession Attributes taught at the Guildhall, with ranks I, II and III. Attributes describe traits and states, including racial passives, Vampire, Zombie, and Werewolf. A character can be a Human Vampire, a Dwarf Zombie, or any other combination. Both Talents and Attributes have levels and rarities, and share one section of the character bar. Hover for a short explanation; click for a visual explanation. Training Talents improve only through completed training sessions.",
  ],
  [
    "Active abilities and finite mana",
    "Combat",
    "All abilities are actively used by their unit automatically. Each encounter starts with a full, finite mana pool: 45 + Mind × 1.6, rounded. Mana does not regenerate in battle. Class magic uses 12 mana, physical techniques use 6, healing Blessings and spell scrolls use 16, and a Cleric’s targeted healing uses 6. Stamina regenerates separately and cooldowns still apply. A unit with no mana can keep moving and using ordinary attacks.",
  ],
  [
    "Healing has a limit",
    "Combat",
    "Healing is reduced to 35% of listed raw power, multiplied by the caster’s healing factor (capped at 2.5). Cleric targeted healing has a minimum 3.5-second interval and consumes mana. Healing ground lasts four seconds. Healing companions act every six seconds. After 75 seconds, all healing gradually weakens, reaching zero at 180 seconds. Combat damage strengthens in overtime, then chips away at remaining characters until a team is eliminated.",
  ],
  [
    "Class trees at the Bonfire",
    "Progression",
    "Spend one class point on a class-tree node at the Bonfire. The first point at level 10 grants Firekeeper discipline. At level 20 select a subclass; level 40 adds a talent; level 60 selects an advanced subclass; level 80 grants a final talent. Each choice requires its ancestor and locks its alternatives. Most classes have six to nine distinct subclasses across the two forks. Your active class technique changes with that calling. Forceful techniques add power; measured techniques add reach and shorter cooldowns. Legendary surge improves offense and coverage; Legendary shelter improves shields, persuasion, and survival. Your character is not transformed and keeps their identity. Unspent points remain available.",
  ],
  [
    "Weapon, armor and companion transformations",
    "Progression",
    "Transform weapons at a built Blacksmith, and armor and companions at the Equipment Workshop. A built Equipment Workshop also transforms all three domains at levels 20, 40 and 60. Weapons add a chosen prefix, affix or enchantment once per stage, keeping XP and identity. The first costs 4 gem value. The second costs 10 gem value and 5 Obsidian; the final costs 16 gem value and 5 Relic fragments. Prefixes change elements or attack styles, affixes add one to three stats, and enchantments grant an active spell with finite mana. A Legendary weapon can have all three. Each companion form adds 40% power. Armor has its own modifier pool; characters use class points instead. Unmounted companions have 48 encounter mana and cast their own enchantment. Mount enchantments are cast by their rider and count toward the ten active abilities limit.",
  ],
  [
    "Armor and equipment",
    "Equipment rules",
    "Every adventurer has separate Head, Chest, Legs and Boots armor positions. The class fixes the permitted weight: light, medium or heavy. Celestials cannot equip helmets; they have distinctive crowns instead. Armor positions do not count toward the eight equipment-slot maximum. Physical weapons, Focuses, Offhands, Boots, Tools, Charms, and Spell scrolls have their own equipment types. Heavy weapons can require Strength; the Monk mace is Monk-only.",
  ],
  [
    "Guildhall Professions",
    "Characters",
    "Learn Miner, Lumberjack and Hunter at the Market Guildhall, without replacing your battle class. Lessons grant rank I, II and III at levels 1, 21 and 41. Tool professions include a Pickaxe or Axe in a dedicated slot. Per rank, victory grants 3 stone plus 1 ore for Miners, 4 wood for Lumberjacks or 3 meat for Hunters. Miners occasionally find gems and Obsidian; Hunters find crafting hides. Work grants Profession XP. Legacy gathering Talents remain functional.",
  ],
  [
    "Training and sharpening",
    "Progression",
    "Build Training Grounds after recruiting a fourth adventurer. The first training costs 35 gold and takes 30 seconds. Each completed session increases the next cost by 30 gold and duration by 1.65×, capped at one hour, regardless of which stat you train. Each stat has its own permanent training Talent. Training bonus = rounded 3 × Talent level × (1 + rarity tier × 0.12). A sharpening rank adds 20% base potency to gear, up to five ranks, and requires a built Blacksmith, gold, ore and real time. An adventurer stays unavailable during their training or while equipped gear is sharpened.",
  ],
  [
    "Regional roads and supplies",
    "World",
    "Your Camp is the only buildable location. Choose among five regions: Mosslight Wood, Hollow March, Emberpeak Mountains, Briarfall Country, and Amberwild Jungle. Camp is marked with a star on the forest map. Visiting destinations reveals connected roads through the fog. Click a discovered place to calculate up to three routes. The forest has 18 irregularly placed destinations and 26 roads; later regions have 24 locations with distinct routes. The map opens fully zoomed out. Terrain stays visible; only inaccessible nodes are blacked out. Compare up to three routes; only the selected route is bright blue: combat count, non-combat count, enemy health, rewards and food per adventurer are shown before selection. Lock the route to open a separate party screen; selecting characters does not change the locked road. Each road has a combat count and a rest, chest or cache at its end, except that the final road ends at your destination. The shortest journeys need no food. Each adventurer needs floor((combat count − 2) / 4) food, with a minimum of zero; the journey consumes those provisions on departure. Each adventurer must have their primary equipment. The forest ends at Thornwatch Castle. Its boss unlocks Eldrin and a portal beside the Crossroads at Camp. Every final regional boss drops one Boss Sigil per completed journey. Spend one with the portal mage to select any unopened region. World difficulty is controlled at the Bonfire: one regional boss unlocks Veteran and three different bosses unlock Nightmare. Active journeys keep their departure tier. Route danger multiplies enemy HP and damage as well as reward value. Pack up to three additional consumables or journey tools.",
  ],
  [
    "Journal",
    "Camp",
    "Quests guide the first journeys, recruitment, Camp construction, gathering, specialization, regional bosses and dinosaur hatching. Track a quest to highlight its destination on the map. Start with one Main and two Side quests. Accept additional Side quests and daily patrol contracts at the Market Board or a scripted story from a question-mark NPC. Claim finished quest rewards at Camp or the Market. A quest reward can be claimed only once. Revisit resource locations for repeatable materials; special companions and equipment rewards are normally awarded on the first arrival.",
  ],
  [
    "Dinosaurs and deep grass",
    "World",
    "Amberwild’s thick grass slows ground movement by 35% and reduces reach by 35%. A packed Survey lantern halves the reach penalty. Ordinary projectiles slow in the foliage and have a 20% chance of being lost the first time they enter it. Flying units ignore movement and reach penalties; artillery shells ignore projectile interference. Lost ruins block movement and sight. The Nesting valley grants two eggs on first arrival and one on repeat visits. Hatch an egg for 40 gold at a built Archaeology Camp in an expanded Camp plot: a Fern raptor attacks alongside its owner; a Saddleback dinosaur can be ridden.",
  ],
  [
    "The mountain dragon",
    "World",
    "The Emberpeak caldera ends in a Rare dragon boss. It flies, breathes fire, ignites terrain and creates a damaging ground Curse. Defeating it opens Briarfall and awards a Rare Salamander saber and Obsidian. The final available region, Amberwild, ends against the ancient tyrant.",
  ],
  [
    "The company comes home",
    "Expeditions",
    "Three to six adventurers travel together. If at least one survives a fight, the others revive at 20% HP. Your permanent adventurers, equipment and earned loot return safely on defeat or recall. Complete the destination to keep charmed recruits. Recovery gradually restores full health over 30 seconds after a normal return, or 90 seconds after defeat. Stocked food halves this timer. Each adventurer instead consumes one food every 12 hours and earns five XP per meal, including travelers; their meal XP is applied when they return.",
  ],
  [
    "Background time",
    "Expeditions",
    "Expeditions continue independently at 1× when you leave the battle page. A visible, focused battle allows 2× and 3×. AUTO starts off for a new watched expedition: each victory waits for Continue, which collects any stop before the next 3–2–1–Fight countdown. Leaving the view or selecting fast speed enables AUTO. Turn it off to return to manual 1× play. A dedicated worker handles open-page simulation. If the browser suspends or closes, expeditions catch up at 1× when you return. Camp training and sharpening use real time. Saves remain local to this browser and address; use Export Camp and Import Camp in the game guide to move a backup. Challenges use a shared player board.",
  ],
  [
    "A song worth following",
    "Recruitment",
    "Bards and Envoys can persuade wounded, susceptible opponents. Mind must overcome their resolve. Up to two recruits can accompany an expedition; they become permanent when you finish the entire destination. Bosses, Ents, dinosaurs, dragons and Arena entrants cannot be charmed. Vampire and Zombie are Attributes; their original race remains intact when recruited.",
  ],
  [
    "Scrolls and creation",
    "Recruitment",
    "Analyze a sealed creation scroll at the Market for 25 gold. Consume the matching analyzed scroll, 160 gold and 6 gem value to create a uniquely named level-1 adventurer of that race and a selected class. Equippable spell scrolls are a different item: magical classes can unlock a Scroll slot at the Outfitter and equip one to gain an additional active spell.",
  ],
  [
    "Recycling and selling",
    "Economy",
    "Retire characters at Camp for floor(8 + 1.5 × level²) gold and floor(level / 30) gem value. Equipment, armor and companions return to storage. Recycling equipment and companions grants gem value only at level 20 or higher. Favorites are protected, and at least three characters must remain. Equipment and companion sales pay 35% more gold and no gems. Characters use the unified retirement action. Socketed gems return intact when a companion is sold or recycled.",
  ],
  [
    "Combining stories",
    "Economy",
    "At the Market, combining costs 80 gold and 3 gem value. The receiver inherits the donor’s active class ability at 60% power, including its level and rarity. The donor is consumed; their equipment, armor and companion return to storage. The receiver keeps their identity. At least three characters must remain, and the ten-ability limit applies.",
  ],
  [
    "The Four Banners",
    "Arena",
    "Send exactly three characters against three AI teams in a simultaneous battle royale. Lions and chariots sometimes enter after 35 seconds. Be the last team standing to earn 170 base gold, combat rewards and the Champion’s gold cosmetic. Permanent characters recover after defeat.",
  ],
  [
    "A living battlefield",
    "Combat",
    "Race determines height and width: Humans and Elves share a height, Elves are slimmer, and Dwarves and Orcs are broad. Class further adjusts width; Guardians are wider than Rangers of the same race. Sizes range from tiny Fae to huge Ents. Bodies crowd and push one another. Barrels and crates can be moved and destroyed. Fire spreads between nearby props and burns ground units on either side. Blood, rubble and scorch marks remain for the encounter and survive saved checkpoints. Invisible units remain visible to players but cannot be targeted by enemies.",
  ],
  [
    "Three kinds of area effect",
    "Combat",
    "Blessings are pale gold healing or support circles. Curses are violet or elemental ground effects; gravity pulls enemies inward. Physical Explosions flash orange and cause knockback. Each has its own visual language.",
  ],
  [
    "Daily Challenges",
    "Challenges",
    "A single themed battle unlocks for each UTC date of the month. Only today’s battle can be started. Completing different dates awards bonuses at 5, 10, 20 and every day of the month. Rewards are paid on a first victory for each date. Replays grant XP without repeating the prize. Themes change monthly.",
  ],
];
export const CODEX = [
  ...mechanics.map(([name, category, text]) => ({ name, category, text })),
  ...Object.entries(RACES).map(([name, r]) => ({
    name,
    category: "Races",
    text:
      r.text +
      ". Base stats: " +
      CORE_STATS.map((k) => k + " " + r.base[k]).join(", ") +
      (r.uncharmable
        ? ". Cannot be charmed."
        : ". Any class may belong to this race.") +
      (name === "Celestial" ? ". Crowns replace the Helmet position." : ""),
  })),
  ...Object.entries(CLASSES)
    .filter(([k]) => !["witch", "stormcaller"].includes(k))
    .map(([key, c]) => ({
      name: c.label,
      category: "Classes",
      key,
      text:
        c.behavior +
        " " +
        c.ability +
        ": " +
        c.abilityText +
        " Uses " +
        c.armorWeight +
        " armor and starts with " +
        c.slots.length +
        " separate equipment slots. Class bonuses: " +
        Object.entries(c.base)
          .map(([k, v]) => "+" + v + " " + k)
          .join(", ") +
        ". Class tree: " +
        (SCHOOLS[key] || [])
          .map(
            (p) =>
              p.name +
              " — " +
              p.text +
              " Advanced choices: " +
              p.name +
              " Ascendant / " +
              p.name +
              " Warden.",
          )
          .join(" ") +
        " Points alternate talent, subclass, talent, subclass, talent at levels 10, 20, 40, 60 and 80.",
    })),
  ...Object.values(ITEMS).map((i) => ({
    name: i.name,
    category: "Equipment",
    text:
      i.desc +
      " " +
      (EQUIPMENT_TYPES[i.type] || "") +
      (i.type === "armor"
        ? " Weight: " + i.weight + ". Position: " + i.armorSlot + "."
        : "") +
      " Levels, rarity and transformations improve numeric bonuses; weapons can also be improved at the Blacksmith.",
  })),
  ...Object.entries(ATTRIBUTES)
    .filter(([k]) => !["Volunteer", "Converted"].includes(k))
    .map(([name, a]) => ({
      name,
      category: "Attributes",
      text: a.text + " A passive trait with its own level and rarity.",
    })),
  ...Object.entries(TALENTS).map(([name, t]) => ({
    name,
    category: "Talents",
    text: t.text + " Teach at the Character tent using a Market capsule.",
  })),
  ...CORE_STATS.map((k) => ({
    name: k[0].toUpperCase() + k.slice(1) + " training",
    category: "Talents",
    text:
      "A permanent Talent earned through " +
      k +
      " training. +3 points per Talent level, scaled by its rarity. Each completed session increases the next session’s cost and time on this character.",
  })),
  ...Object.values(PETS).map((p) => ({
    name: p.name,
    category: "Companions",
    text:
      p.text +
      " Rare companions have one gem socket, Legendary two, and special Mythical companions can have three. Level, rarity and transformation improve appearance and potency.",
  })),
  ...Object.values(LOCATIONS).map((l) => ({
    name: l.name,
    category: "World",
    text:
      l.lore +
      " Found here: " +
      (l.biome === "jungle"
        ? "raptors, triceratops, pterosaurs and a tyrant"
        : l.races.join(", ")) +
      ".",
  })),
  {
    name: "Cosmetic collections",
    category: "Cosmetics",
    text:
      "Apply owned appearances at the Market Atelier. The gem Shop includes a section for each of the twelve monthly themes. Cosmetics change appearance and grant no combat stats.\n\n" +
      Object.values(COSMETICS)
        .map((c) => c.name)
        .join(" · "),
    details: Object.values(COSMETICS).map((c) => ({
      name: c.name,
      text: c.text,
    })),
  },
  ...Object.values(DIFFICULTIES).map((d) => ({
    name: d.name,
    category: "Difficulty",
    text:
      d.text +
      ". Enemy health " +
      d.health +
      "×, damage " +
      d.damage +
      "×, gold " +
      d.reward +
      "×. One regional boss unlocks Veteran, three different bosses unlock Nightmare. Choose the global tier at the Bonfire; route danger multiplies it. NPC Challenges use the same world tier.",
  })),
  ...Object.entries(CONTEXT).map(([key, text]) => ({
    name:
      key === "gems"
        ? "Gem sizes and sockets"
        : key === "challenges"
          ? "Player challenges"
          : key[0].toUpperCase() + key.slice(1) + " formulas",
    category: "Rules & formulas",
    text,
  })),
  {
    name: "Camp buildings & services",
    category: "Camp buildings",
    text: "Your Camp expands through construction and home upgrades. Pan to the shadowed plots; build a four-vendor Market after Camp level 2.",
    details: Object.values(BUILDINGS)
      .filter((b) => !b.legacy)
      .map((b) => ({
        name: b.name,
        text:
          b.text +
          (b.cost
            ? " Cost: " +
              Object.entries(b.cost)
                .map(([k, n]) => n + " " + k)
                .join(", ")
            : " Available from the beginning."),
      })),
  },
  ...Object.values(MATERIALS).map((m) => ({
    name: m.name,
    category: "Materials",
    text: m.text,
  })),
  ...Object.values(CONSUMABLES).map((c) => ({
    name: c.name,
    category: "Consumables",
    text: c.text + " Pack before departure. Consumed once for that expedition.",
  })),
];
CODEX.push({
  name: "Building a stronger team",
  category: "Rules & formulas",
  text: "Core stats = race + class + per-level growth + gear + armor + Talents + Attributes + class calling + companion sockets + temporary supplies.\n\nItem numeric potency = (1 + (level − 1) × 0.035) × (1 + sharpening rank × 0.20) × rarity multiplier. Rarity multipliers: Common 1.00, Uncommon 1.12, Rare 1.28, Legendary 1.48, Mythical 1.75.\n\nOrdinary facets scale by (1 + (level − 1) × 0.04) × (1 + rarity tier × 0.12). Automatic rarity milestones occur at levels 20, 40 and 60. Training Talents increase only by training, and class-tree points come at 10, 20, 40, 60 and 80.\n\nGems in companion sockets are excluded from spendable gem value. Removal returns them intact. Spending returns exact change; fusion preserves total value; transmutation consumes a gem to create materials.",
});

CODEX.push(
  {
    name: "The gem Shop",
    category: "Economy",
    text: "Separate from Market vendors. Spend gem value on owned cosmetics or special Mythical adventurers and signature equipment. Cosmetic application happens at the Market Atelier. Offers rotate on a visible 12-hour UTC clock. Mythical is a special purchase tier, not a normal level milestone.",
  },
  {
    name: "Rotating Market stock",
    category: "Economy",
    text: "Vendors restock every 12 hours. Most recruits and equipment remain Common, with a few level-20, level-40 and level-60 goods. High-level transformed weapons carry real modifiers. The catalog filters by vendor, type, rarity, name and effect. Prices are canonical and purchases cannot be repeated.",
  },
  {
    name: "Expanding home",
    category: "Camp",
    text:
      CONTEXT.expansions +
      " Buy the east meadow to construct Farm plots, the west grove for capacity cabins, or the south garden for herbs. Farms produce two food per five minutes, storing up to 24. Herb gardens store up to 12 herbs. Camp houses forty adventurers initially. Each cabin adds twenty spaces, and additional cabins cost more. Retirement returns all equipment, the lantern and companion. Gold reward = floor(8 + 1.5 × level²), plus floor(level / 30) gem value. Full Camps miss recruits; there is no arrival queue. Favorites and the last three adventurers are protected.",
  },
);

for (const [domain, pool] of [
  ["Weapon", WEAPON_MODIFIERS],
  ["Armor", ARMOR_MODIFIERS],
  ["Companion", PET_MODIFIERS],
])
  for (const [type, defs] of Object.entries(pool)) {
    const details = Object.values(defs).map((d) => ({
      name: d.name,
      text:
        d.text +
        " Visual signature: " +
        d.visual.style +
        ". " +
        (d.weaponKinds
          ? "Compatible weapon families: " +
            d.weaponKinds.map((k) => WEAPON_KINDS[k]).join(", ")
          : d.armorWeights
            ? "Compatible armor weights: " + d.armorWeights.join(", ")
            : d.petKeys
              ? "Compatible companions: " +
                d.petKeys.map((k) => PETS[k].name).join(", ")
              : "Universal within this modifier category."),
    }));
    CODEX.push({
      name: domain + " " + type + " guide",
      category: domain + " modifiers",
      text:
        "Choose one modifier at each equipment transformation milestone. This page includes every " +
        type +
        " in this domain, with its effect, visual signature and compatibility.\n\n" +
        details.map((d) => d.name).join(" · "),
      details,
    });
  }
CODEX.push({
  name: "Wings and flight",
  category: "Combat",
  text: "Angel is an Attribute that any race can learn, granting feather wings and flight. Fae and Sylph use translucent insect wings; Owlkin use feather wings. Mothwing cloaks, mechanical armor wings, and magical flight have distinct silhouettes. Flying units cross ground obstacles and cannot be targeted by grounded melee units. Wings sway with the unit; reduced-motion settings disable their CSS animation.",
});

CODEX.push({
  name: "Camp capacity and Archaeology",
  category: "Camp",
  text:
    CONTEXT.capacity +
    " Repair any Camp expansion to unlock Archaeology in the Build menu. It hatches dinosaur eggs for 40 gold and grows an Ammonite, Trilobite or Amberwing from fossils. Find fossils in Amberwild’s Bone bed or empty Hatchery.",
});
CODEX.push({
  name: "Direct roads and wild trails",
  category: "World",
  text: "Direct roads have 1× route danger, multiplied by the world tier. Detours have greater difficulty and rewards, even before you clear a region boss. The Bonfire changes world difficulty after regional boss victories. Every map has three Rare mini-boss nodes and one final Rare boss. Strong roads use solid black or selected blue lines and have open terrain. Wild roads remain dotted black or selected blue and have extra obstacles. Forest roads near the lake, brook, falls or bridge have river combat with crossings. Landmarks hint at ruins, water, settlements and prehistoric finds.",
});
CODEX.push({
  name: "Original Mythical identities",
  category: "Characters",
  text: "The gem Shop sells Sol the Sunwarden, Vela the Skyrift and Cairn the Iron Comet: original themed adventurers with distinct full-body artwork and signature gear. Their rarity is authored, not earned by leveling. Full character guises override race and class visuals without changing mechanics; weapon-family and companion cosmetics are applied separately at the Market Atelier.",
});
CODEX.push({
  name: "Challenge reward tiers",
  category: "Challenges",
  text: "Today’s daily challenge and themed weekly and monthly champions use the global difficulty set at the Bonfire. Cleared region bosses become weekly champion rematches. A higher tier pays only the extra gold and gems above the highest tier already rewarded that period. Replays retain character XP. Player challenges are fixed team snapshots and do not have NPC difficulty controls.",
});

CODEX.push(
  {
    name: "Evernight: the long night",
    category: "World",
    text:
      CONTEXT.nightfall ||
      "The sun never returned. Campfires keep a company alive. Beyond their glow, familiar things wear unfamiliar faces.",
  },
  {
    name: "The tent and neutral travelers",
    category: "Camp",
    text: "Click a character inside the tent to open their detailed life: companions, friends, memories and growth. The smaller inspector is green for friends, red for enemies and blue for neutral arrivals. Plus markers are recruitable wanderers; question marks are scripted quests; red exclamation marks are challengers. Arrivals rotate every three hours.",
  },
  {
    name: "The Bell Beneath",
    category: "World",
    text: "The forest local map reveals the violet-marked island south of Camp. Acquire the south lakeshore and build a Lantern Dock for 400 gold, 50 wood, 25 stone and 10 ore. Ships bring Legendary travelers and occasional authored Mythicals. Sail a 25-floor descent with guardians every fifth floor, 3 food per adventurer and equipped primary slots. Deepest floor persists. Floor 25 awards authored Mythical Boots and 9 gems once per Camp.",
  },
  {
    name: "Pantry to Kitchen",
    category: "Camp",
    text: "Upgrade the Pantry in place for 90 gold, 18 wood and 12 stone. The Kitchen still sells food, cooks six meals efficiently, and makes ingredient-based Trail supper, Hunter stew and Moonleaf tea. Pack special dishes for temporary expedition buffs.",
  },
  {
    name: "Attributes and the Lantern Clinic",
    category: "Characters",
    text: "Attributes cannot be purchased or granted through generic management. The Market Lantern Clinic lifts an ordinary Attribute for 50 gold and 2 herbs. Racial Attributes and Professions cannot be removed there.",
  },
  {
    name: "Equipment Workshop and comparisons",
    category: "Equipment rules",
    text: "Build the Equipment Workshop to craft basic armor from gold, wood and hides or ore, and transform weapons, armor and companions. Buy and sell through the Market. Compare shopping items against compatible equipped characters. Storage Equip lists ready compatible heroes and slots. A slot dot means a new compatible inventory instance is available.",
  },
);

CODEX.push(
  {
    name: "Camp level and XP",
    category: "Progression",
    text: "Camps have levels and no rarity. The level bar opens a breakdown. Level 1 needs 100 XP; each following level costs 60 more. Character XP contributes 25%; equipment and companion XP contribute 10%. Victories and quests add XP. Construction grants 160–250 XP; each expansion grants 350. Contributions are recorded once per owned object and survive reloads.",
  },
  {
    name: "Food every twelve hours",
    category: "Camp",
    text: "Each adventurer uses one food every 12 hours and receives five character XP. The Camp food card shows stock, the next meal and total demand. Stocked food halves recovery and improves wanderer chances. Long absences settle whole meal periods in one bounded operation; no food means no meal bonus. Expedition meals defer XP until return to preserve active battles.",
  },
  {
    name: "Light and night vision",
    category: "Combat",
    text: "Every character has a separate Light slot; unequip or replace it while ready at Camp. A Hooded lantern casts 190 units of warm light; Witchlight casts 275 units. Ordinary unaided sight is 55 units. Dwarves, Gnomes, Kobolds, Myconids and Shades see 200–280 units in darkness; Vampire grants 300 and Werewolf 250. Lantern Runner lessons can grant the 190-unit Night vision talent. Characters without enough sight search more slowly. Moving lanterns, fire and magic expose terrain and foes; trees, rocks and ruins cast shadows. Explored terrain stays dimly remembered, while unseen enemies remain concealed.",
  },
  {
    name: "Eight guilds and Market districts",
    category: "Economy",
    text: "The Guild lodge opens after collecting six heroes and has eight booths in two rows of four. Each guild offers 35-gold lessons, a four-encounter patrol quest and member goods. Lessons add ten standing; claimed guild quests add twenty. At twenty standing the shop opens. Each additional standing reduces its price, up to 40%; a member item can be bought once per 12-hour restock. Lessons preserve class and can teach professions. The Last Lantern Tavern has its own interior with wandering heroes, a bartender with supplies and daily, monthly and player challenges. Its first tutorial invitation is a free choice of common hero. Later stock includes Common and Uncommon heroes; the first upgrade adds Rare heroes and the second adds Legendary heroes. Upgrades also expand the bar menu. The separate Arena opens at Camp level four. The village Trading Post sells gear and supports dragged-hero comparisons. The camp menu’s Journal holds accepted quests, and the Workshop adds equipment slots.",
  },
  {
    name: "Arena wagers",
    category: "Combat",
    text: "Enter through the Market Arena grounds. Stage exactly three ready characters and stake 10–1000 gold, optionally 0–100 basic resources. Rules rotate randomly between two teams, four teams, tigers and an explosive floor. Win returns 2.2 times the gold stake, or four times for four-team matches, scaled by world rewards. Staked resources return 2.2 times, scaled by world rewards. Defeat and recall lose the wager. Payouts happen once. Arena prizes contain no gems, cosmetics or recruits.",
  },
);
