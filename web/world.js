import { LOCATIONS, periodKey } from "./data.js?v=21";
export const MATERIALS = {
  wood: {
    name: "Wood",
    icon: "leaf",
    text: "Builds Camp structures. The Lumberjack Profession gathers extra wood with an axe.",
  },
  stone: {
    name: "Stone",
    icon: "stone",
    text: "Foundations and Camp construction. The Miner Profession gathers extra stone with a pickaxe.",
  },
  ore: { name: "Ore", icon: "ore", text: "Sharpening and advanced metalwork." },
  herbs: {
    name: "Herbs",
    icon: "leaf",
    text: "Cooking and alchemy ingredients.",
  },
  meat: {
    name: "Ingredients",
    icon: "heart",
    text: "Gathered food ingredients for the Kitchen.",
  },
};
export const BUILDINGS = {
  tent: {
    name: "Character tent",
    icon: "camp",
    text: "Meet, equip, teach Talents, or recycle your characters.",
    x: 28,
    y: 41,
    service: "characters",
  },
  storage: {
    name: "Storage",
    icon: "book",
    text: "Equipment, companions, scrolls, consumables, gems, and materials in one chest.",
    x: 13,
    y: 70,
    service: "storage",
  },
  pantry: {
    name: "Pantry",
    cost: { gold: 5, wood: 5 },
    icon: "heart",
    text: "Stock food to halve recovery time after expeditions.",
    x: 47,
    y: 76,
    service: "pantry",
  },
  training: {
    name: "Training Grounds",
    icon: "sword",
    text: "Learn a permanent training Talent for one stat. The character stays here until their timed session ends.",
    x: 75,
    y: 31,
    cost: { gold: 90, wood: 18, stone: 10 },
    minRoster: 4,
    service: "training",
  },
  blacksmith: {
    name: "Blacksmith",
    icon: "hammer",
    text: "Improve weapons, choose transformative modifiers, or craft a new Common weapon.",
    x: 71,
    y: 67,
    cost: { gold: 65, wood: 12, stone: 8 },
    service: "blacksmith",
  },
  outfitter: {
    name: "Outfitter",
    icon: "shield",
    text: "Unlock more equipment slots, up to eight per character.",
    x: 46,
    y: 24,
    cost: { gold: 90, wood: 15, stone: 12 },
    service: "slots",
  },
  kitchen: {
    name: "Kitchen",
    icon: "flame",
    text: "Cook gathered ingredients into food or expedition supplies.",
    x: 88,
    y: 76,
    cost: { gold: 120, wood: 22, stone: 16 },
    service: "kitchen",
  },
  alchemist: {
    name: "Alchemist",
    icon: "spark",
    text: "Combine gems, transmute them, and brew consumables.",
    x: 88,
    y: 47,
    cost: { gold: 160, wood: 20, stone: 24, ore: 8 },
    service: "alchemy",
  },
};
export const BRANCHES = {
  greenway: [
    {
      id: "firefly",
      node: 1,
      name: "Firefly hollow",
      count: 5,
      level: 5,
      text: "Leave Fernbridge for a hidden glade. A Rare lantern sprite awaits.",
      reward: "sprite",
      x: 29,
      y: 79,
    },
    {
      id: "elder",
      node: 3,
      name: "The elder’s refuge",
      count: 8,
      level: 12,
      text: "Climb the root stair. An Ent keeper may make your camp home.",
      reward: "Ent",
      x: 65,
      y: 69,
    },
  ],
  marsh: [
    {
      id: "quarry",
      node: 0,
      name: "The forgotten quarry",
      count: 5,
      level: 5,
      text: "A stony detour full of ore and a Rare greatsword.",
      reward: "greatblade",
      x: 12,
      y: 26,
    },
    {
      id: "belltower",
      node: 2,
      name: "The leaning bell tower",
      count: 9,
      level: 13,
      text: "Cross a broken causeway for an Automaton companion character.",
      reward: "Automaton",
      x: 50,
      y: 20,
    },
  ],
  cinder: [
    {
      id: "stable",
      node: 1,
      name: "The moonlit stable",
      count: 8,
      level: 11,
      text: "A country lane leads to a Rare rideable horse.",
      reward: "horse",
      x: 32,
      y: 77,
    },
    {
      id: "crypt",
      node: 3,
      name: "The glass crypt",
      count: 12,
      level: 22,
      text: "A descent under the estate yields a Rare spell scroll.",
      reward: "scrollGravity",
      x: 67,
      y: 74,
    },
  ],
};
export const MONTH_THEMES = [
  ["Winter lanterns", "marsh", "A winter watch beneath the abbey bells."],
  ["The silver thaw", "marsh", "Melting ice reveals forgotten paths."],
  ["Seed and song", "greenway", "Young groves awaken to a traveling chorus."],
  [
    "Rainwood mysteries",
    "greenway",
    "Follow the rain to hidden forest shrines.",
  ],
  ["The bloom court", "greenway", "The mushroom court opens its gates."],
  ["Lantern caravans", "cinder", "Keep watch over the long country roads."],
  ["Ember festival", "cinder", "Lanterns and firelight fill the fields."],
  ["Starfall trails", "greenway", "Seek the paths beneath falling stars."],
  ["The amber harvest", "cinder", "Gather the year’s final golden crop."],
  ["Harvest of shadows", "cinder", "Follow lanterns through haunted orchards."],
  ["The drowned vigil", "marsh", "Answer the bells across the mist."],
  ["The long night", "marsh", "Bring a little light to the flooded abbey."],
];
export function calendarMonth(now) {
  const date = new Date(now),
    year = date.getUTCFullYear(),
    month = date.getUTCMonth(),
    days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
    theme = MONTH_THEMES[month];
  return {
    key: periodKey("monthly", now),
    year,
    month,
    days,
    today: date.getUTCDate(),
    firstDay: new Date(Date.UTC(year, month, 1)).getUTCDay(),
    name: theme[0],
    location: theme[1],
    text: theme[2],
  };
}
const dailyPlaces = [
  "The lantern crossing",
  "A keeper’s request",
  "The old watch road",
  "The hidden orchard",
  "A wandering caravan",
  "The silent shrine",
  "The fox’s footpath",
];
export function calendarDay(now, day) {
  const m = calendarMonth(now);
  if (!Number.isInteger(day) || day < 1 || day > m.days) return null;
  return {
    mode: "calendar",
    location: m.location,
    day,
    month: m.key,
    name:
      m.name +
      " · " +
      dailyPlaces[(day + m.month) % dailyPlaces.length] +
      " " +
      day,
    encounters: 3 + ((day + m.month) % 5),
    level: 2 + Math.floor((day - 1) / 5),
    reward: 1.15,
    bonus: 25 + day * 2,
    unlocked: day <= m.today,
    seed: Date.UTC(m.year, m.month, day) / 86400000,
    special: day % 3 === 0 ? "gem" : day % 3 === 1 ? "food" : "supplies",
  };
}
export const CALENDAR_BONUSES = [
  { days: 5, gold: 80, food: 5, text: "80 gold + 5 food" },
  { days: 10, gold: 120, gems: 3, text: "120 gold + 3 gem value" },
  {
    days: 20,
    gold: 180,
    pet: "sprite",
    text: "180 gold + Rare lantern sprite",
  },
  {
    days: "all",
    gold: 250,
    cosmetic: "dusk",
    text: "250 gold + Duskweave cosmetic",
  },
];
export const COOKING = {
  food: {
    name: "Camp supper",
    cost: { meat: 2, herbs: 1 },
    output: "food",
    count: 4,
  },
  ration: {
    name: "Trail supper",
    cost: { meat: 2, herbs: 2 },
    output: "ration",
    count: 1,
  },
};
export const BREWS = {
  might: { cost: { herbs: 3, ore: 1 } },
  warding: { cost: { herbs: 3, stone: 2 } },
  luck: { cost: { herbs: 4 }, gems: 1 },
  treat: { cost: { herbs: 2, meat: 2 } },
};
export const CONTEXT = {
  vitality: "Each Vitality gives 10 maximum HP. Leveling restores full health.",
  armor:
    "Armor subtracts its value from physical hits (minimum 1), and reduces magic hits by 35 / (35 + Armor). Training and gear both improve it.",
  strength:
    "Physical classes use Strength: base attack = Strength × 1.4. Heavy weapons have Strength requirements.",
  mind: "Magic classes use Mind: base attack = Mind × 1.2. Mind also improves healing and helps Bards charm wounded opponents.",
  agility:
    "Movement speed = 21 + Agility × 2.2. Above 10, each point also makes basic attacks about 1.2% faster.",
  endurance:
    "Stamina = 35 + Endurance × 3. Endurance speeds active cooldowns and makes knockback less effective.",
  training:
    "Training adds a permanent Talent: 3 points per level, increased by Talent rarity. All sessions on this character increase the next cost and duration. Timers use real time.",
  recovery:
    "Every returning adventurer rests and gradually heals to full. Food is consumed every twelve hours: supplied characters recover twice as quickly. Everyone is ready when it reaches zero.",
  gems: "Gem value is the spendable currency. Chipped = 1, Cut = 3, Flawless = 9, Royal = 27. Gems in companion sockets are excluded from your purse.",
  calendar:
    "One single-encounter Challenge per UTC date. Only today’s battle is available; a new one arrives each UTC date. First victories pay clear rewards. Bonuses count different days, not replays.",
  challenges:
    "Only consenting players post teams and pledged gold. Only the pledge is at risk. Results are computed on the server from a team snapshot; original characters always remain safe.",
  sharpen:
    "A sharpening rank adds 20% of the item’s base potency. Rarity and levels multiply this gain. Sharpening uses gold, ore, and real time.",
  slots:
    "The Outfitter adds one selected slot at level 10 or later, up to eight. This does not sharpen gear. Spell scrolls require a Scroll slot and a magic class.",
};

MATERIALS.obsidian = {
  name: "Obsidian",
  icon: "moon",
  text: "Volcanic glass gathered at the Obsidian quarry. Used in advanced transformations.",
};
MATERIALS.relic = {
  name: "Relic fragments",
  icon: "book",
  text: "Found at Amberwild ruins. Used to transform high-level companions.",
};
BUILDINGS.bonfire = {
  name: "Bonfire",
  icon: "flame",
  text: "Spend class points and set world difficulty.",
  x: 46,
  y: 55,
  service: "bonfire",
};
BUILDINGS.crossroads = {
  name: "Crossroads",
  icon: "flag",
  text: "Open the regional road map and plan a journey.",
  x: 10,
  y: 34,
  service: "crossroads",
};
CONTEXT.mana =
  "Mana starts full each encounter and does not regenerate in combat. Active abilities use mana and stamina. Healing spells cost more mana; exhausted healers keep fighting with basic attacks.";
CONTEXT.classPoints =
  "One class point when you reach Uncommon (20), Rare (40), and Legendary (60). Spend points at the Bonfire. Each tree node locks its sibling alternatives; choose again at every fork. Characters keep their race and identity.";
CONTEXT.talents =
  "Talents are learned skills: gathering and training. Attributes describe traits and states such as Vampire, Zombie and your racial passive. Both have levels and rarities.";
CONTEXT.armor =
  "Helmet, Chest and Leg armor have separate slots and do not count toward eight equipment slots. Your class selects a weight; Celestials cannot equip a helmet.";

BUILDINGS.farm = {
  name: "Farm plots",
  icon: "leaf",
  text: "Harvest 2 food every five minutes, up to 24 stored food.",
  x: 48,
  y: 48,
  expansion: "east",
  cost: { gold: 110, wood: 18, stone: 8 },
  service: "farm",
};
BUILDINGS.cabins = {
  name: "Cabins",
  icon: "camp",
  text: "Each cabin adds room for 20 adventurers. Your Camp starts with capacity for 40.",
  x: 48,
  y: 48,
  expansion: "west",
  cost: { gold: 140, wood: 24, stone: 12 },
  service: "cabins",
};
BUILDINGS.garden = {
  name: "Herb garden",
  icon: "leaf",
  text: "Harvest herbs for your Kitchen and Alchemist every five minutes, up to 12 stored herbs.",
  x: 48,
  y: 48,
  expansion: "south",
  cost: { gold: 100, wood: 16, stone: 8 },
  service: "garden",
};
CONTEXT.weaponForms =
  "Weapons, armor and companions each have separate pools of 24 prefixes, 24 affixes and 24 enchantments. Transform at levels 20, 40 and 60 to choose one missing modifier type, once per threshold. Compatibility filters prevent mismatched bases. Prefixes change properties or attacks, affixes add one to three stats, and enchantments add automatic active spells using finite mana. Each named modifier has a consistent visual signature. Armor spells count toward the wearer’s ten abilities; unmounted companions cast their own spell, while mount spells are used by their rider.";
CONTEXT.rarity =
  "Common: levels 1–19. Uncommon: 20–39. Rare: 40–59. Legendary: 60–100. Mythical is special gem-Shop gear and is not earned by leveling. Bosses are always Rare.";
CONTEXT.expansions =
  "Only your Camp can expand. East, west and south plots start at 150 gold, 20 wood and 10 stone. Every purchase raises remaining expansion costs by 75% of their base cost.";
CONTEXT.calendar =
  "Daily challenges are single battles. Only today’s battle is available; a new theme arrives monthly. Monthly bonuses count different victorious days, not replays.";

MATERIALS.fossils = {
  name: "Fossils",
  icon: "bone",
  text: "Excavated in Amberwild. Grow prehistoric companions at the Archaeology Camp.",
};
BUILDINGS.archaeology = {
  name: "Archaeology Camp",
  icon: "bone",
  text: "Hatch dinosaur eggs and grow companions from fossils. Requires any repaired Camp expansion.",
  x: 73,
  y: 30,
  expansion: "any",
  cost: { gold: 180, wood: 20, stone: 30, ore: 6 },
  service: "archaeology",
};
CONTEXT.capacity =
  "Your Camp holds 40 adventurers, plus 20 for each cabin. A full Camp misses character rewards. Retiring an idle adventurer returns equipment, light and companion plus gold and a small gem reward that grows with level. Favorites and your last three adventurers are protected.";
CONTEXT.calendar =
  "Today’s Daily Battle is the only daily challenge available. The calendar marks completed and missed dates; monthly bonuses count different victorious dates. Global difficulty is chosen at the Bonfire. Higher-tier clears pay only the increase over already claimed rewards for that period.";
CONTEXT.weaponForms +=
  " Weapon transforms require a built Blacksmith; armor and companion forms require a built Equipment Workshop. Dinosaur eggs and fossils belong at Archaeology.";

// Current night-world services. Older building flags are retained only for save migration.
delete BUILDINGS.outfitter;
Object.assign(BUILDINGS.kitchen, {
  x: BUILDINGS.pantry.x,
  y: BUILDINGS.pantry.y,
  upgradeFrom: "pantry",
  cost: { gold: 90, wood: 18, stone: 12 },
  text: "Upgrade the Pantry into a Kitchen. Stock food, cook six meals efficiently, and choose ingredients for expedition dishes.",
});
BUILDINGS.armory = {
  name: "Equipment Workshop",
  icon: "shield",
  text: "Buy, craft, sell and transform armor and equipment. Weapon work is also available at the Blacksmith.",
  x: 46,
  y: 24,
  cost: { gold: 90, wood: 15, stone: 12 },
  service: "armory",
};
BUILDINGS.dock = {
  name: "Lantern Dock",
  icon: "flag",
  text: "Meet Legendary travelers, with occasional Mythicals, and sail to the island's 25-floor dungeon.",
  x: 70,
  y: 74,
  expansion: "south",
  cost: { gold: 400, wood: 50, stone: 25, ore: 10 },
  service: "dock",
};
MATERIALS.hide = {
  name: "Hides",
  icon: "shield",
  text: "Hunters occasionally find these crafting parts after a victory. Craft light or medium armor at the Equipment Workshop.",
};
COOKING.food.count = 6;
COOKING.stew = {
  name: "Hunter's stew",
  cost: { meat: 4, herbs: 1 },
  output: "stew",
  count: 1,
};
COOKING.tea = {
  name: "Lantern tea",
  cost: { herbs: 4 },
  output: "tea",
  count: 1,
};
CONTEXT.armor =
  "Head, Chest, Legs and Boots have four separate armor slots. Each has class weight, rarity, modifiers and visible art. Celestials wear crowns instead of helmets.";
CONTEXT.talents =
  "Professions are Attributes taught at the Guildhall. Training remains a Talent. Found supernatural Attributes cannot be bought; the Lantern Clinic alone can remove them.";
CONTEXT.slots =
  "The Market Outfitter adds equipment slots from level 10, up to eight. Armor has its own four slots.";
CONTEXT.weaponForms +=
  " The Equipment Workshop also transforms all equipment and companions.";
CONTEXT.lore =
  "The sun never returned. Campfires keep the roads and their travelers alive. Beyond their glow, familiar things wear unfamiliar faces. A little camp comfort; a little camp horror.";

MATERIALS.hide = {
  name: "Hides",
  icon: "paw",
  text: "Hunters gather hides for light and medium armor.",
};
MATERIALS.bossSigils = {
  name: "Boss sigils",
  icon: "moon",
  text: "Final bosses drop these on successful regional journeys. Spend one at Eldrin to open a chosen map.",
};
CONTEXT.capacity =
  "Camp starts with 40 spaces. Each cabin adds 20. Full Camps cannot hire or keep loot recruits. Retiring returns belongings and pays a reward that grows with level.";
CONTEXT.classPoints =
  "Levels 10, 20, 40, 60 and 80 grant class points: talent, subclass, talent, subclass, talent.";

// Services now belong to the growing Camp, not a neighboring town.
BUILDINGS.market = {
  name: "Camp Market",
  icon: "coin",
  text: "Invite four merchants: equipment, curiosities, supplies and companions. Available at Camp level 2.",
  x: 78,
  y: 29,
  cost: { gold: 80, wood: 24, stone: 12 },
  minCampLevel: 2,
  service: "market",
};
BUILDINGS.guildhall = {
  name: "Guild lodge",
  minRoster: 6,
  icon: "shield",
  text: "Eight guilds offer training, quests and member shops here at Camp.",
  x: 21,
  y: 34,
  expansion: "west",
  cost: { gold: 120, wood: 24, stone: 18 },
  service: "guildhall",
};
BUILDINGS.tavern = {
  name: "Last Lantern Tavern",
  icon: "army",
  text: "Hire travelers and meet visiting adventurers at Camp.",
  x: 23,
  y: 51,
  cost: { gold: 100, wood: 20, stone: 10 },
  service: "tavern",
};
BUILDINGS.clinic = {
  name: "Lantern Clinic",
  icon: "heart",
  text: "Lift eligible Attributes at Camp.",
  x: 66,
  y: 64,
  cost: { gold: 90, wood: 12, stone: 12, herbs: 8 },
  service: "clinic",
};
BUILDINGS.questboard = {
  name: "Journal",
  icon: "book",
  text: "Take quests and organize the company’s goals.",
  x: 58,
  y: 34,
  service: "questboard",
};
BUILDINGS.cabins.expansion = null;
BUILDINGS.cabins.name = "Upgrade home";
BUILDINGS.cabins.text =
  "Upgrade the Character tent to a Cabin in place. Each further home upgrade adds twenty spaces.";
BUILDINGS.cabins.legacy = true;
CONTEXT.expansions =
  "Pan or zoom out to see shadowed land. Clear a plot to make room; buildings and Camp levels reveal more of the surrounding night.";

BUILDINGS.tradingpost = {
  name: "Trading Post",
  icon: "coin",
  service: "tradingpost",
  text: "Basic weapons, armor and travel gear. Bring a hero to compare their equipment.",
  cost: { gold: 65, wood: 12, stone: 6 },
};
BUILDINGS.arena = {
  name: "Arena",
  icon: "sword",
  service: "arena",
  minCampLevel: 4,
  text: "A fighting ground beyond the village. Revealed at Camp level 4.",
  cost: { gold: 180, wood: 24, stone: 30 },
};
