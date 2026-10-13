// Modifier families share one canonical definition with combat, art, the Codex and Camp.
import {
  WEAPON_MODIFIERS,
  PREFIXES,
  AFFIXES,
  ENCHANTMENTS,
  WEAPONS,
} from "./weapons.js?v=20";
const mod = (name, text, stats, style, color, only = {}) => ({
  name,
  text,
  ...stats,
  visual: { style, color },
  color,
  ...only,
});
PREFIXES.flaming.visual = { style: "flames", color: "#ed9360" };
PREFIXES.glacial.visual = { style: "snow", color: "#92d5df" };
PREFIXES.stormbound.visual = { style: "lightning", color: "#b7a4ee" };
PREFIXES.weightless.visual = { style: "rings", color: "#a396d5" };
PREFIXES.scattershot.visual = { style: "shards", color: "#d5bb7b" };
PREFIXES.spectral.visual = { style: "smoke", color: "#99c5bf" };
AFFIXES.might.visual = { style: "claws", color: "#c7a073" };
AFFIXES.insight.visual = { style: "eyes", color: "#b7a2d2" };
AFFIXES.swiftness.visual = { style: "ribbons", color: "#95c2c1" };
AFFIXES.bastion.visual = { style: "shield", color: "#b5bd9a" };
AFFIXES.impact.visual = { style: "cracks", color: "#c5a487" };
AFFIXES.resolve.visual = { style: "banner", color: "#a3af99" };
ENCHANTMENTS.meteor.visual = { style: "stars", color: "#eea065" };
ENCHANTMENTS.gravity.visual = { style: "spiral", color: "#aa91d2" };
ENCHANTMENTS.sanctuary.visual = { style: "cross", color: "#e8d28d" };
ENCHANTMENTS.winter.visual = { style: "snow", color: "#9fdbe0" };
ENCHANTMENTS.tempest.visual = { style: "cloud", color: "#bbabf0" };
PREFIXES.venomous = mod(
  "Venomous",
  "Venom attacks splash nearby foes.",
  { element: "venom", splash: 15 },
  "droplets",
  "#80af6a",
  {},
);
PREFIXES.barbed = mod(
  "Barbed",
  "Barbed strikes deal +5 attack.",
  { attack: 5 },
  "thorns",
  "#a97770",
  {},
);
PREFIXES.crushing = mod(
  "Crushing",
  "Heavy strikes add +45 knockback.",
  { knock: 45 },
  "chevrons",
  "#b59877",
  {},
);
PREFIXES.echoing = mod(
  "Echoing",
  "Echoing attacks arc to a nearby foe.",
  { chain: true },
  "echo",
  "#93b8c6",
  {},
);
PREFIXES.sundering = mod(
  "Sundering",
  "Broad strikes add +25 splash radius.",
  { splash: 25 },
  "cracks",
  "#d0ab78",
  {},
);
PREFIXES.hunting = mod(
  "Hunting",
  "Projectiles gain +45 range.",
  { range: 45 },
  "feathers",
  "#8eaa75",
  { weaponKinds: ["bow", "crossbow", "longarm"] },
);
PREFIXES.razorwind = mod(
  "Razorwind",
  "Wind turns attacks into ranged strikes.",
  { ranged: true, range: 40 },
  "ribbons",
  "#a2cac3",
  {},
);
PREFIXES.rootbound = mod(
  "Rootbound",
  "Entangling strikes slow opponents.",
  { slow: true },
  "vines",
  "#6d9b67",
  {},
);
PREFIXES.radiant = mod(
  "Radiant",
  "Radiant strikes add +4 Mind and +3 attack.",
  { mind: 4, attack: 3, element: "holy" },
  "sun",
  "#e2c77d",
  {},
);
PREFIXES.umbral = mod(
  "Umbral",
  "Shadow strikes add +6 attack.",
  { attack: 6, element: "shadow" },
  "smoke",
  "#9279af",
  {},
);
PREFIXES.resonant = mod(
  "Resonant",
  "Resonance adds +5 Mind.",
  { mind: 5 },
  "rings",
  "#90bac2",
  { weaponKinds: ["wand", "staff"] },
);
PREFIXES.clockwork = mod(
  "Clockwork",
  "Clockwork mechanisms add +4 Agility.",
  { agility: 4 },
  "gears",
  "#a7a58e",
  {},
);
PREFIXES.tidal = mod(
  "Tidal",
  "Water strikes push opponents +25 and slow them.",
  { knock: 25, slow: true, element: "water" },
  "waves",
  "#82b8c7",
  {},
);
PREFIXES.thorned = mod(
  "Thorned",
  "Thorned attacks add +3 attack and +12 splash.",
  { attack: 3, splash: 12 },
  "thorns",
  "#81946a",
  {},
);
PREFIXES.searing = mod(
  "Searing",
  "Fire strikes gain +30 knockback.",
  { element: "fire", knock: 30 },
  "embers",
  "#dcab5c",
  {},
);
PREFIXES.shardshot = mod(
  "Shardshot",
  "Crossbows and guns split strikes across two foes.",
  { scatter: 2 },
  "shards",
  "#92b5b9",
  { weaponKinds: ["crossbow", "longarm", "sidearm", "artillery"] },
);
PREFIXES.runic = mod(
  "Runic",
  "Runes add +4 Mind and +3 Endurance.",
  { mind: 4, endurance: 3 },
  "runes",
  "#b9a2d1",
  {},
);
PREFIXES.quicksilver = mod(
  "Quicksilver",
  "Quick handling grants +5 Agility and +5 speed.",
  { agility: 5, speed: 5 },
  "stars",
  "#b8c6c8",
  {},
);
AFFIXES.precision = mod(
  "of Precision",
  "+4 agility; +25 range.",
  { agility: 4, range: 25 },
  "target",
  "#93b8a7",
);
AFFIXES.fortitude = mod(
  "of Fortitude",
  "+5 vitality; +4 endurance.",
  { vitality: 5, endurance: 4 },
  "shield",
  "#aab58b",
);
AFFIXES.wisdom = mod("of Wisdom", "+8 mind.", { mind: 8 }, "runes", "#a49abc");
AFFIXES.reach = mod(
  "of Reach",
  "+55 range.",
  { range: 55 },
  "ribbons",
  "#a7c0b3",
);
AFFIXES.ferocity = mod(
  "of Ferocity",
  "+5 strength; +3 attack.",
  { strength: 5, attack: 3 },
  "claws",
  "#ae8972",
);
AFFIXES.balance = mod(
  "of Balance",
  "+3 strength; +3 mind; +3 agility.",
  { strength: 3, mind: 3, agility: 3 },
  "scales",
  "#b5b291",
);
AFFIXES.vigor = mod(
  "of Vigor",
  "+7 vitality.",
  { vitality: 7 },
  "leaves",
  "#9bab70",
);
AFFIXES.patience = mod(
  "of Patience",
  "+6 endurance; +15 range.",
  { endurance: 6, range: 15 },
  "hourglass",
  "#b9a981",
);
AFFIXES.celerity = mod(
  "of Celerity",
  "+7 agility.",
  { agility: 7 },
  "chevrons",
  "#87b2bd",
);
AFFIXES.stalwart = mod(
  "of the Stalwart",
  "+5 armor; +3 endurance.",
  { armor: 5, endurance: 3 },
  "shield",
  "#99a5a5",
);
AFFIXES.cunning = mod(
  "of Cunning",
  "+4 mind; +4 agility.",
  { mind: 4, agility: 4 },
  "eyes",
  "#9d99b8",
);
AFFIXES.giants = mod(
  "of Giants",
  "+7 strength; +20 knock.",
  { strength: 7, knock: 20 },
  "mountains",
  "#b09d77",
);
AFFIXES.emberheart = mod(
  "of the Emberheart",
  "+5 attack; +3 vitality.",
  { attack: 5, vitality: 3 },
  "sun",
  "#cead86",
);
AFFIXES.longwatch = mod(
  "of the Long Watch",
  "+30 range; +4 endurance.",
  { range: 30, endurance: 4 },
  "target",
  "#a3b6a3",
);
AFFIXES.scholar = mod(
  "of the Scholar",
  "+5 mind; +3 vitality.",
  { mind: 5, vitality: 3 },
  "pages",
  "#beb79d",
);
AFFIXES.nimble = mod(
  "of Nimble Hands",
  "+4 agility; +9 speed.",
  { agility: 4, speed: 9 },
  "feathers",
  "#a8c0ae",
);
AFFIXES.sentinel = mod(
  "of the Sentinel",
  "+3 armor; +20 range; +3 endurance.",
  { armor: 3, range: 20, endurance: 3 },
  "shield",
  "#a7b7b3",
);
AFFIXES.valor = mod(
  "of Valor",
  "+4 strength; +4 vitality.",
  { strength: 4, vitality: 4 },
  "banner",
  "#c3997c",
);
ENCHANTMENTS.maelstrom = mod(
  "Maelstrom",
  "Active: casts gravity every 21s, spending 16 mana.",
  { spell: "gravity", cooldown: 21, power: 1.3 },
  "spiral",
  "#96a1ce",
);
ENCHANTMENTS.cinderwake = mod(
  "Cinderwake",
  "Active: casts ember every 22s, spending 16 mana.",
  { spell: "ember", cooldown: 22, power: 1.4 },
  "embers",
  "#d77f54",
);
ENCHANTMENTS.hailstorm = mod(
  "Hailstorm",
  "Active: casts frost every 23s, spending 16 mana.",
  { spell: "frost", cooldown: 23, power: 1.3 },
  "shards",
  "#b7d9de",
);
ENCHANTMENTS.thunderhead = mod(
  "Thunderhead",
  "Active: casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 1.4 },
  "cloud",
  "#a7a5cf",
);
ENCHANTMENTS.mending = mod(
  "Mending Light",
  "Active: casts heal every 28s, spending 16 mana.",
  { spell: "heal", cooldown: 28, power: 0.65 },
  "cross",
  "#d6c797",
);
ENCHANTMENTS.voidbell = mod(
  "Void Bell",
  "Active: casts gravity every 27s, spending 16 mana.",
  { spell: "gravity", cooldown: 27, power: 1.5 },
  "rings",
  "#8c7aa9",
);
ENCHANTMENTS.sunburst = mod(
  "Sunburst",
  "Active: casts arcane every 20s, spending 16 mana.",
  { spell: "arcane", cooldown: 20, power: 1.1 },
  "sun",
  "#ddbd67",
);
ENCHANTMENTS.thornveil = mod(
  "Thornveil",
  "Active: casts hex every 23s, spending 16 mana.",
  { spell: "hex", cooldown: 23, power: 1.1 },
  "vines",
  "#819966",
);
ENCHANTMENTS.soulflare = mod(
  "Soulflare",
  "Active: casts arcane every 25s, spending 16 mana.",
  { spell: "arcane", cooldown: 25, power: 1.4 },
  "smoke",
  "#b69fc7",
);
ENCHANTMENTS.frostbite = mod(
  "Frostbite",
  "Active: casts frost every 17s, spending 16 mana.",
  { spell: "frost", cooldown: 17, power: 0.8 },
  "snow",
  "#b6dad3",
);
ENCHANTMENTS.wildfire = mod(
  "Wildfire",
  "Active: casts ember every 26s, spending 16 mana.",
  { spell: "ember", cooldown: 26, power: 1.6 },
  "flames",
  "#e4a568",
);
ENCHANTMENTS.staticfield = mod(
  "Static Field",
  "Active: casts storm every 16s, spending 16 mana.",
  { spell: "storm", cooldown: 16, power: 0.8 },
  "lightning",
  "#b1b8d6",
);
ENCHANTMENTS.moonwell = mod(
  "Moonwell",
  "Active: casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.8 },
  "moon",
  "#c2bee1",
);
ENCHANTMENTS.earthshaker = mod(
  "Earthshaker",
  "Active: casts gravity every 29s, spending 16 mana.",
  { spell: "gravity", cooldown: 29, power: 1.7 },
  "mountains",
  "#a39379",
);
ENCHANTMENTS.brightward = mod(
  "Brightward",
  "Active: casts heal every 26s, spending 16 mana.",
  { spell: "heal", cooldown: 26, power: 0.6 },
  "shield",
  "#d9c882",
);
ENCHANTMENTS.rimecircle = mod(
  "Rime Circle",
  "Active: casts frost every 25s, spending 16 mana.",
  { spell: "frost", cooldown: 25, power: 1.5 },
  "rings",
  "#9dcac9",
);
ENCHANTMENTS.stormeye = mod(
  "Storm Eye",
  "Active: casts storm every 28s, spending 16 mana.",
  { spell: "storm", cooldown: 28, power: 1.6 },
  "eyes",
  "#aaa3d7",
);
ENCHANTMENTS.nightbloom = mod(
  "Nightbloom",
  "Active: casts hex every 24s, spending 16 mana.",
  { spell: "hex", cooldown: 24, power: 1.25 },
  "leaves",
  "#9e88ae",
);
ENCHANTMENTS.starbridge = mod(
  "Starbridge",
  "Active: casts arcane every 18s, spending 16 mana.",
  { spell: "arcane", cooldown: 18, power: 0.9 },
  "stars",
  "#baa6d5",
);
export const ARMOR_MODIFIERS = { prefix: {}, affix: {}, enchantment: {} };
ARMOR_MODIFIERS.prefix.armorp1 = mod(
  "Cinderwoven",
  "+3 vitality; +4% dodge.",
  { vitality: 3, dodge: 0.035 },
  "flames",
  "#de9869",
  {},
);
ARMOR_MODIFIERS.prefix.armorp2 = mod(
  "Rimeplated",
  "+4 armor; +6 speed.",
  { armor: 4, speed: 6 },
  "snow",
  "#a5d5dc",
  {},
);
ARMOR_MODIFIERS.prefix.armorp3 = mod(
  "Stormstitched",
  "+5 strength; +15 range.",
  { strength: 5, range: 15 },
  "lightning",
  "#b2a2d3",
  {},
);
ARMOR_MODIFIERS.prefix.armorp4 = mod(
  "Gravestone",
  "+3 mind; +10% force.",
  { mind: 3, force: 1.1 },
  "rings",
  "#a899cf",
  {},
);
ARMOR_MODIFIERS.prefix.armorp5 = mod(
  "Rootguard",
  "+4 agility; +4% dodge.",
  { agility: 4, dodge: 0.035 },
  "vines",
  "#80a67b",
  {},
);
ARMOR_MODIFIERS.prefix.armorp6 = mod(
  "Sunblessed",
  "+5 endurance; +6 speed.",
  { endurance: 5, speed: 6 },
  "sun",
  "#ddc789",
  {},
);
ARMOR_MODIFIERS.prefix.armorp7 = mod(
  "Nightweave",
  "+3 vitality; +15 range.",
  { vitality: 3, range: 15 },
  "smoke",
  "#9b83aa",
  {},
);
ARMOR_MODIFIERS.prefix.armorp8 = mod(
  "Tidewashed",
  "+4 armor; +10% force.",
  { armor: 4, force: 1.1 },
  "waves",
  "#87bcc6",
  {},
);
ARMOR_MODIFIERS.prefix.armorp9 = mod(
  "Featherlight",
  "+5 strength; +4% dodge; Flight with mechanical wings.",
  { strength: 5, dodge: 0.035, flying: true, wingType: "mechanical" },
  "feathers",
  "#c9bd93",
  {},
);
ARMOR_MODIFIERS.prefix.armorp10 = mod(
  "Clockplated",
  "+3 mind; +6 speed.",
  { mind: 3, speed: 6 },
  "gears",
  "#a9ac9e",
  {},
);
ARMOR_MODIFIERS.prefix.armorp11 = mod(
  "Runebound",
  "+4 agility; +15 range.",
  { agility: 4, range: 15 },
  "runes",
  "#b9a5ce",
  {},
);
ARMOR_MODIFIERS.prefix.armorp12 = mod(
  "Starlaced",
  "+5 endurance; +10% force.",
  { endurance: 5, force: 1.1 },
  "stars",
  "#c8b4d8",
  {},
);
ARMOR_MODIFIERS.prefix.armorp13 = mod(
  "Briarsteel",
  "+3 vitality; +4% dodge.",
  { vitality: 3, dodge: 0.035 },
  "thorns",
  "#a6997c",
  {},
);
ARMOR_MODIFIERS.prefix.armorp14 = mod(
  "Mosssealed",
  "+4 armor; +6 speed.",
  { armor: 4, speed: 6 },
  "droplets",
  "#8fab7b",
  {},
);
ARMOR_MODIFIERS.prefix.armorp15 = mod(
  "Shardguard",
  "+5 strength; +15 range.",
  { strength: 5, range: 15 },
  "shards",
  "#aec3c7",
  {},
);
ARMOR_MODIFIERS.prefix.armorp16 = mod(
  "Echoshell",
  "+3 mind; +10% force.",
  { mind: 3, force: 1.1 },
  "echo",
  "#9dbfc9",
  {},
);
ARMOR_MODIFIERS.prefix.armorp17 = mod(
  "Windborne",
  "+4 agility; +4% dodge.",
  { agility: 4, dodge: 0.035 },
  "chevrons",
  "#b7be9c",
  {},
);
ARMOR_MODIFIERS.prefix.armorp18 = mod(
  "Ironward",
  "+5 endurance; +6 speed.",
  { endurance: 5, speed: 6 },
  "shield",
  "#b7c4bd",
  {},
);
ARMOR_MODIFIERS.prefix.armorp19 = mod(
  "Mountainhide",
  "+3 vitality; +15 range.",
  { vitality: 3, range: 15 },
  "mountains",
  "#ae9d81",
  { armorWeights: ["heavy"] },
);
ARMOR_MODIFIERS.prefix.armorp20 = mod(
  "Leafmail",
  "+4 armor; +10% force.",
  { armor: 4, force: 1.1 },
  "leaves",
  "#a0b485",
  {},
);
ARMOR_MODIFIERS.prefix.armorp21 = mod(
  "Oculus",
  "+5 strength; +4% dodge.",
  { strength: 5, dodge: 0.035 },
  "eyes",
  "#b5a4bb",
  {},
);
ARMOR_MODIFIERS.prefix.armorp22 = mod(
  "Mistweave",
  "+3 mind; +6 speed.",
  { mind: 3, speed: 6 },
  "ribbons",
  "#a5c8bc",
  {},
);
ARMOR_MODIFIERS.prefix.armorp23 = mod(
  "Cloudspun",
  "+4 agility; +15 range.",
  { agility: 4, range: 15 },
  "cloud",
  "#a8b4ce",
  {},
);
ARMOR_MODIFIERS.prefix.armorp24 = mod(
  "Bannered",
  "+5 endurance; +10% force.",
  { endurance: 5, force: 1.1 },
  "banner",
  "#c6a78b",
  {},
);
ARMOR_MODIFIERS.affix.armora1 = mod(
  "of Shelter",
  "+5 vitality.",
  { vitality: 5 },
  "waves",
  "#87bcc6",
);
ARMOR_MODIFIERS.affix.armora2 = mod(
  "of the Rampart",
  "+6 armor; +3 mind.",
  { armor: 6, mind: 3 },
  "feathers",
  "#c9bd93",
);
ARMOR_MODIFIERS.affix.armora3 = mod(
  "of Clear Thought",
  "+7 strength; +3 agility; +2 vitality.",
  { strength: 7, agility: 3, vitality: 2 },
  "gears",
  "#a9ac9e",
);
ARMOR_MODIFIERS.affix.armora4 = mod(
  "of Fleet Steps",
  "+5 mind.",
  { mind: 5 },
  "runes",
  "#b9a5ce",
);
ARMOR_MODIFIERS.affix.armora5 = mod(
  "of Deep Breath",
  "+6 agility; +3 vitality.",
  { agility: 6, vitality: 3 },
  "stars",
  "#c8b4d8",
);
ARMOR_MODIFIERS.affix.armora6 = mod(
  "of Heartwood",
  "+7 endurance; +3 armor; +2 mind.",
  { endurance: 7, armor: 3, mind: 2 },
  "thorns",
  "#a6997c",
);
ARMOR_MODIFIERS.affix.armora7 = mod(
  "of Iron Resolve",
  "+5 vitality.",
  { vitality: 5 },
  "droplets",
  "#8fab7b",
);
ARMOR_MODIFIERS.affix.armora8 = mod(
  "of the Watch",
  "+6 armor; +3 mind.",
  { armor: 6, mind: 3 },
  "shards",
  "#aec3c7",
);
ARMOR_MODIFIERS.affix.armora9 = mod(
  "of Quiet Focus",
  "+7 strength; +3 agility; +2 vitality.",
  { strength: 7, agility: 3, vitality: 2 },
  "echo",
  "#9dbfc9",
);
ARMOR_MODIFIERS.affix.armora10 = mod(
  "of the Bulwark",
  "+5 mind.",
  { mind: 5 },
  "chevrons",
  "#b7be9c",
);
ARMOR_MODIFIERS.affix.armora11 = mod(
  "of Silver Grace",
  "+6 agility; +3 vitality.",
  { agility: 6, vitality: 3 },
  "shield",
  "#b7c4bd",
);
ARMOR_MODIFIERS.affix.armora12 = mod(
  "of the Scholar",
  "+7 endurance; +3 armor; +2 mind.",
  { endurance: 7, armor: 3, mind: 2 },
  "mountains",
  "#ae9d81",
);
ARMOR_MODIFIERS.affix.armora13 = mod(
  "of Courage",
  "+5 vitality.",
  { vitality: 5 },
  "leaves",
  "#a0b485",
);
ARMOR_MODIFIERS.affix.armora14 = mod(
  "of Nimble Feet",
  "+6 armor; +3 mind.",
  { armor: 6, mind: 3 },
  "eyes",
  "#b5a4bb",
);
ARMOR_MODIFIERS.affix.armora15 = mod(
  "of Endurance",
  "+7 strength; +3 agility; +2 vitality.",
  { strength: 7, agility: 3, vitality: 2 },
  "ribbons",
  "#a5c8bc",
);
ARMOR_MODIFIERS.affix.armora16 = mod(
  "of the Oak",
  "+5 mind.",
  { mind: 5 },
  "cloud",
  "#a8b4ce",
);
ARMOR_MODIFIERS.affix.armora17 = mod(
  "of Insightful Guard",
  "+6 agility; +3 vitality.",
  { agility: 6, vitality: 3 },
  "banner",
  "#c6a78b",
);
ARMOR_MODIFIERS.affix.armora18 = mod(
  "of the Runner",
  "+7 endurance; +3 armor; +2 mind.",
  { endurance: 7, armor: 3, mind: 2 },
  "flames",
  "#de9869",
);
ARMOR_MODIFIERS.affix.armora19 = mod(
  "of Solace",
  "+5 vitality.",
  { vitality: 5 },
  "snow",
  "#a5d5dc",
);
ARMOR_MODIFIERS.affix.armora20 = mod(
  "of the Fortress",
  "+6 armor; +3 mind.",
  { armor: 6, mind: 3 },
  "lightning",
  "#b2a2d3",
);
ARMOR_MODIFIERS.affix.armora21 = mod(
  "of the Pathfinder",
  "+7 strength; +3 agility; +2 vitality.",
  { strength: 7, agility: 3, vitality: 2 },
  "rings",
  "#a899cf",
);
ARMOR_MODIFIERS.affix.armora22 = mod(
  "of Strong Shoulders",
  "+5 mind.",
  { mind: 5 },
  "vines",
  "#80a67b",
);
ARMOR_MODIFIERS.affix.armora23 = mod(
  "of Steady Hands",
  "+6 agility; +3 vitality.",
  { agility: 6, vitality: 3 },
  "sun",
  "#ddc789",
);
ARMOR_MODIFIERS.affix.armora24 = mod(
  "of the Hearth",
  "+7 endurance; +3 armor; +2 mind.",
  { endurance: 7, armor: 3, mind: 2 },
  "smoke",
  "#9b83aa",
);
ARMOR_MODIFIERS.enchantment.armore1 = mod(
  "Ashen Shelter",
  "Active: the wearer casts ember every 20s, spending 16 mana.",
  { spell: "ember", cooldown: 20, power: 0.8 },
  "droplets",
  "#8fab7b",
);
ARMOR_MODIFIERS.enchantment.armore2 = mod(
  "Winter Dome",
  "Active: the wearer casts frost every 22s, spending 16 mana.",
  { spell: "frost", cooldown: 22, power: 0.9500000000000001 },
  "shards",
  "#aec3c7",
);
ARMOR_MODIFIERS.enchantment.armore3 = mod(
  "Thunder Ward",
  "Active: the wearer casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 1.1 },
  "echo",
  "#9dbfc9",
);
ARMOR_MODIFIERS.enchantment.armore4 = mod(
  "Gravity Mantle",
  "Active: the wearer casts gravity every 26s, spending 16 mana.",
  { spell: "gravity", cooldown: 26, power: 0.8 },
  "chevrons",
  "#b7be9c",
);
ARMOR_MODIFIERS.enchantment.armore5 = mod(
  "Briar Curse",
  "Active: the wearer casts hex every 28s, spending 16 mana.",
  { spell: "hex", cooldown: 28, power: 0.9500000000000001 },
  "shield",
  "#b7c4bd",
);
ARMOR_MODIFIERS.enchantment.armore6 = mod(
  "Daybreak",
  "Active: the wearer casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.7 },
  "mountains",
  "#ae9d81",
);
ARMOR_MODIFIERS.enchantment.armore7 = mod(
  "Night Shroud",
  "Active: the wearer casts arcane every 32s, spending 16 mana.",
  { spell: "arcane", cooldown: 32, power: 0.8 },
  "leaves",
  "#a0b485",
);
ARMOR_MODIFIERS.enchantment.armore8 = mod(
  "Tidal Sanctuary",
  "Active: the wearer casts heal every 34s, spending 16 mana.",
  { spell: "heal", cooldown: 34, power: 0.7 },
  "eyes",
  "#b5a4bb",
);
ARMOR_MODIFIERS.enchantment.armore9 = mod(
  "Zephyr Ward",
  "Active: the wearer casts ember every 20s, spending 16 mana.",
  { spell: "ember", cooldown: 20, power: 1.1 },
  "ribbons",
  "#a5c8bc",
);
ARMOR_MODIFIERS.enchantment.armore10 = mod(
  "Gearstorm",
  "Active: the wearer casts frost every 22s, spending 16 mana.",
  { spell: "frost", cooldown: 22, power: 0.8 },
  "cloud",
  "#a8b4ce",
);
ARMOR_MODIFIERS.enchantment.armore11 = mod(
  "Runic Eclipse",
  "Active: the wearer casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 0.9500000000000001 },
  "banner",
  "#c6a78b",
);
ARMOR_MODIFIERS.enchantment.armore12 = mod(
  "Celestial Beacon",
  "Active: the wearer casts gravity every 26s, spending 16 mana.",
  { spell: "gravity", cooldown: 26, power: 1.1 },
  "flames",
  "#de9869",
);
ARMOR_MODIFIERS.enchantment.armore13 = mod(
  "Thorn Chapel",
  "Active: the wearer casts hex every 28s, spending 16 mana.",
  { spell: "hex", cooldown: 28, power: 0.8 },
  "snow",
  "#a5d5dc",
);
ARMOR_MODIFIERS.enchantment.armore14 = mod(
  "Verdant Mercy",
  "Active: the wearer casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.7 },
  "lightning",
  "#b2a2d3",
);
ARMOR_MODIFIERS.enchantment.armore15 = mod(
  "Crystal Tempest",
  "Active: the wearer casts arcane every 32s, spending 16 mana.",
  { spell: "arcane", cooldown: 32, power: 1.1 },
  "rings",
  "#a899cf",
);
ARMOR_MODIFIERS.enchantment.armore16 = mod(
  "Echo Sanctuary",
  "Active: the wearer casts heal every 34s, spending 16 mana.",
  { spell: "heal", cooldown: 34, power: 0.7 },
  "vines",
  "#80a67b",
);
ARMOR_MODIFIERS.enchantment.armore17 = mod(
  "Gale Circle",
  "Active: the wearer casts ember every 20s, spending 16 mana.",
  { spell: "ember", cooldown: 20, power: 0.9500000000000001 },
  "sun",
  "#ddc789",
);
ARMOR_MODIFIERS.enchantment.armore18 = mod(
  "Guardian Light",
  "Active: the wearer casts frost every 22s, spending 16 mana.",
  { spell: "frost", cooldown: 22, power: 1.1 },
  "smoke",
  "#9b83aa",
);
ARMOR_MODIFIERS.enchantment.armore19 = mod(
  "Mountain Heart",
  "Active: the wearer casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 0.8 },
  "waves",
  "#87bcc6",
);
ARMOR_MODIFIERS.enchantment.armore20 = mod(
  "Leaf Blessing",
  "Active: the wearer casts gravity every 26s, spending 16 mana.",
  { spell: "gravity", cooldown: 26, power: 0.9500000000000001 },
  "feathers",
  "#c9bd93",
);
ARMOR_MODIFIERS.enchantment.armore21 = mod(
  "Oracle Eye",
  "Active: the wearer casts hex every 28s, spending 16 mana.",
  { spell: "hex", cooldown: 28, power: 1.1 },
  "gears",
  "#a9ac9e",
);
ARMOR_MODIFIERS.enchantment.armore22 = mod(
  "Mist Refuge",
  "Active: the wearer casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.7 },
  "runes",
  "#b9a5ce",
);
ARMOR_MODIFIERS.enchantment.armore23 = mod(
  "Cloud Crown",
  "Active: the wearer casts arcane every 32s, spending 16 mana.",
  { spell: "arcane", cooldown: 32, power: 0.9500000000000001 },
  "stars",
  "#c8b4d8",
);
ARMOR_MODIFIERS.enchantment.armore24 = mod(
  "Banner of Dawn",
  "Active: the wearer casts heal every 34s, spending 16 mana.",
  { spell: "heal", cooldown: 34, power: 0.7 },
  "thorns",
  "#a6997c",
);
export const PET_MODIFIERS = { prefix: {}, affix: {}, enchantment: {} };
PET_MODIFIERS.prefix.petp1 = mod(
  "Emberfur",
  "+3 vitality; +4% dodge. Companion bonuses improve its owner and combat body.",
  { vitality: 3, dodge: 0.035 },
  "flames",
  "#de9869",
  {},
);
PET_MODIFIERS.prefix.petp2 = mod(
  "Frostwhisker",
  "+4 armor; +6 speed. Companion bonuses improve its owner and combat body.",
  { armor: 4, speed: 6 },
  "snow",
  "#a5d5dc",
  {},
);
PET_MODIFIERS.prefix.petp3 = mod(
  "Stormtail",
  "+5 strength; +15 range. Companion bonuses improve its owner and combat body.",
  { strength: 5, range: 15 },
  "lightning",
  "#b2a2d3",
  {},
);
PET_MODIFIERS.prefix.petp4 = mod(
  "Moonbound",
  "+3 mind; +10% force. Companion bonuses improve its owner and combat body.",
  { mind: 3, force: 1.1 },
  "rings",
  "#a899cf",
  {},
);
PET_MODIFIERS.prefix.petp5 = mod(
  "Vinefriend",
  "+4 agility; +4% dodge. Companion bonuses improve its owner and combat body.",
  { agility: 4, dodge: 0.035 },
  "vines",
  "#80a67b",
  {},
);
PET_MODIFIERS.prefix.petp6 = mod(
  "Dawnmarked",
  "+5 endurance; +6 speed. Companion bonuses improve its owner and combat body.",
  { endurance: 5, speed: 6 },
  "sun",
  "#ddc789",
  {},
);
PET_MODIFIERS.prefix.petp7 = mod(
  "Duskcoat",
  "+3 vitality; +15 range. Companion bonuses improve its owner and combat body.",
  { vitality: 3, range: 15 },
  "smoke",
  "#9b83aa",
  {},
);
PET_MODIFIERS.prefix.petp8 = mod(
  "Riverborn",
  "+4 armor; +10% force. Companion bonuses improve its owner and combat body.",
  { armor: 4, force: 1.1 },
  "waves",
  "#87bcc6",
  {},
);
PET_MODIFIERS.prefix.petp9 = mod(
  "Skyfeather",
  "+5 strength; +4% dodge; Flight with feather wings. Companion bonuses improve its owner and combat body.",
  { strength: 5, dodge: 0.035, flying: true, wingType: "feather" },
  "feathers",
  "#c9bd93",
  {},
);
PET_MODIFIERS.prefix.petp10 = mod(
  "Clockheart",
  "+3 mind; +6 speed. Companion bonuses improve its owner and combat body.",
  { mind: 3, speed: 6 },
  "gears",
  "#a9ac9e",
  {},
);
PET_MODIFIERS.prefix.petp11 = mod(
  "Runeclad",
  "+4 agility; +15 range. Companion bonuses improve its owner and combat body.",
  { agility: 4, range: 15 },
  "runes",
  "#b9a5ce",
  {},
);
PET_MODIFIERS.prefix.petp12 = mod(
  "Starry",
  "+5 endurance; +10% force. Companion bonuses improve its owner and combat body.",
  { endurance: 5, force: 1.1 },
  "stars",
  "#c8b4d8",
  {},
);
PET_MODIFIERS.prefix.petp13 = mod(
  "Briarback",
  "+3 vitality; +4% dodge. Companion bonuses improve its owner and combat body.",
  { vitality: 3, dodge: 0.035 },
  "thorns",
  "#a6997c",
  {},
);
PET_MODIFIERS.prefix.petp14 = mod(
  "Mossfoot",
  "+4 armor; +6 speed. Companion bonuses improve its owner and combat body.",
  { armor: 4, speed: 6 },
  "droplets",
  "#8fab7b",
  {},
);
PET_MODIFIERS.prefix.petp15 = mod(
  "Crystalspine",
  "+5 strength; +15 range. Companion bonuses improve its owner and combat body.",
  { strength: 5, range: 15 },
  "shards",
  "#aec3c7",
  {},
);
PET_MODIFIERS.prefix.petp16 = mod(
  "Echocall",
  "+3 mind; +10% force. Companion bonuses improve its owner and combat body.",
  { mind: 3, force: 1.1 },
  "echo",
  "#9dbfc9",
  {},
);
PET_MODIFIERS.prefix.petp17 = mod(
  "Galestride",
  "+4 agility; +4% dodge. Companion bonuses improve its owner and combat body.",
  { agility: 4, dodge: 0.035 },
  "chevrons",
  "#b7be9c",
  {},
);
PET_MODIFIERS.prefix.petp18 = mod(
  "Shieldfriend",
  "+5 endurance; +6 speed. Companion bonuses improve its owner and combat body.",
  { endurance: 5, speed: 6 },
  "shield",
  "#b7c4bd",
  {},
);
PET_MODIFIERS.prefix.petp19 = mod(
  "Stonepaw",
  "+3 vitality; +15 range. Companion bonuses improve its owner and combat body.",
  { vitality: 3, range: 15 },
  "mountains",
  "#ae9d81",
  { petKeys: ["horse", "hadrosaur"] },
);
PET_MODIFIERS.prefix.petp20 = mod(
  "Leafkin",
  "+4 armor; +10% force. Companion bonuses improve its owner and combat body.",
  { armor: 4, force: 1.1 },
  "leaves",
  "#a0b485",
  {},
);
PET_MODIFIERS.prefix.petp21 = mod(
  "Watchful",
  "+5 strength; +4% dodge. Companion bonuses improve its owner and combat body.",
  { strength: 5, dodge: 0.035 },
  "eyes",
  "#b5a4bb",
  {},
);
PET_MODIFIERS.prefix.petp22 = mod(
  "Miststep",
  "+3 mind; +6 speed. Companion bonuses improve its owner and combat body.",
  { mind: 3, speed: 6 },
  "ribbons",
  "#a5c8bc",
  {},
);
PET_MODIFIERS.prefix.petp23 = mod(
  "Cloudtuft",
  "+4 agility; +15 range. Companion bonuses improve its owner and combat body.",
  { agility: 4, range: 15 },
  "cloud",
  "#a8b4ce",
  {},
);
PET_MODIFIERS.prefix.petp24 = mod(
  "Lionhearted",
  "+5 endurance; +10% force. Companion bonuses improve its owner and combat body.",
  { endurance: 5, force: 1.1 },
  "banner",
  "#c6a78b",
  {},
);
PET_MODIFIERS.affix.peta1 = mod(
  "of Loyalty",
  "+5 vitality. Companion bonuses improve its owner and combat body.",
  { vitality: 5 },
  "waves",
  "#87bcc6",
);
PET_MODIFIERS.affix.peta2 = mod(
  "of Keen Senses",
  "+6 armor; +3 mind. Companion bonuses improve its owner and combat body.",
  { armor: 6, mind: 3 },
  "feathers",
  "#c9bd93",
);
PET_MODIFIERS.affix.peta3 = mod(
  "of Brave Paws",
  "+7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body.",
  { strength: 7, agility: 3, vitality: 2 },
  "gears",
  "#a9ac9e",
);
PET_MODIFIERS.affix.peta4 = mod(
  "of Clever Tricks",
  "+5 mind. Companion bonuses improve its owner and combat body.",
  { mind: 5 },
  "runes",
  "#b9a5ce",
);
PET_MODIFIERS.affix.peta5 = mod(
  "of Enduring Bonds",
  "+6 agility; +3 vitality. Companion bonuses improve its owner and combat body.",
  { agility: 6, vitality: 3 },
  "stars",
  "#c8b4d8",
);
PET_MODIFIERS.affix.peta6 = mod(
  "of Bright Spirits",
  "+7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body.",
  { endurance: 7, armor: 3, mind: 2 },
  "thorns",
  "#a6997c",
);
PET_MODIFIERS.affix.peta7 = mod(
  "of Swift Wings",
  "+5 vitality. Companion bonuses improve its owner and combat body.",
  { vitality: 5 },
  "droplets",
  "#8fab7b",
);
PET_MODIFIERS.affix.peta8 = mod(
  "of the Guardian",
  "+6 armor; +3 mind. Companion bonuses improve its owner and combat body.",
  { armor: 6, mind: 3 },
  "shards",
  "#aec3c7",
);
PET_MODIFIERS.affix.peta9 = mod(
  "of Daring",
  "+7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body.",
  { strength: 7, agility: 3, vitality: 2 },
  "echo",
  "#9dbfc9",
);
PET_MODIFIERS.affix.peta10 = mod(
  "of Comfort",
  "+5 mind. Companion bonuses improve its owner and combat body.",
  { mind: 5 },
  "chevrons",
  "#b7be9c",
);
PET_MODIFIERS.affix.peta11 = mod(
  "of the Watcher",
  "+6 agility; +3 vitality. Companion bonuses improve its owner and combat body.",
  { agility: 6, vitality: 3 },
  "shield",
  "#b7c4bd",
);
PET_MODIFIERS.affix.peta12 = mod(
  "of the Wanderer",
  "+7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body.",
  { endurance: 7, armor: 3, mind: 2 },
  "mountains",
  "#ae9d81",
);
PET_MODIFIERS.affix.peta13 = mod(
  "of Resilience",
  "+5 vitality. Companion bonuses improve its owner and combat body.",
  { vitality: 5 },
  "leaves",
  "#a0b485",
);
PET_MODIFIERS.affix.peta14 = mod(
  "of Quick Feet",
  "+6 armor; +3 mind. Companion bonuses improve its owner and combat body.",
  { armor: 6, mind: 3 },
  "eyes",
  "#b5a4bb",
);
PET_MODIFIERS.affix.peta15 = mod(
  "of Deep Trust",
  "+7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body.",
  { strength: 7, agility: 3, vitality: 2 },
  "ribbons",
  "#a5c8bc",
);
PET_MODIFIERS.affix.peta16 = mod(
  "of Shared Wisdom",
  "+5 mind. Companion bonuses improve its owner and combat body.",
  { mind: 5 },
  "cloud",
  "#a8b4ce",
);
PET_MODIFIERS.affix.peta17 = mod(
  "of Quiet Strength",
  "+6 agility; +3 vitality. Companion bonuses improve its owner and combat body.",
  { agility: 6, vitality: 3 },
  "banner",
  "#c6a78b",
);
PET_MODIFIERS.affix.peta18 = mod(
  "of the Scout",
  "+7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body.",
  { endurance: 7, armor: 3, mind: 2 },
  "flames",
  "#de9869",
);
PET_MODIFIERS.affix.peta19 = mod(
  "of the Keeper",
  "+5 vitality. Companion bonuses improve its owner and combat body.",
  { vitality: 5 },
  "snow",
  "#a5d5dc",
);
PET_MODIFIERS.affix.peta20 = mod(
  "of Kind Hearts",
  "+6 armor; +3 mind. Companion bonuses improve its owner and combat body.",
  { armor: 6, mind: 3 },
  "lightning",
  "#b2a2d3",
);
PET_MODIFIERS.affix.peta21 = mod(
  "of Sharp Claws",
  "+7 strength; +3 agility; +2 vitality. Companion bonuses improve its owner and combat body.",
  { strength: 7, agility: 3, vitality: 2 },
  "rings",
  "#a899cf",
);
PET_MODIFIERS.affix.peta22 = mod(
  "of the Guide",
  "+5 mind. Companion bonuses improve its owner and combat body.",
  { mind: 5 },
  "vines",
  "#80a67b",
);
PET_MODIFIERS.affix.peta23 = mod(
  "of Strong Bonds",
  "+6 agility; +3 vitality. Companion bonuses improve its owner and combat body.",
  { agility: 6, vitality: 3 },
  "sun",
  "#ddc789",
);
PET_MODIFIERS.affix.peta24 = mod(
  "of Gentle Courage",
  "+7 endurance; +3 armor; +2 mind. Companion bonuses improve its owner and combat body.",
  { endurance: 7, armor: 3, mind: 2 },
  "smoke",
  "#9b83aa",
);
PET_MODIFIERS.enchantment.pete1 = mod(
  "Phoenix Call",
  "Active: the companion casts ember every 20s, spending 16 mana.",
  { spell: "ember", cooldown: 20, power: 0.8 },
  "droplets",
  "#8fab7b",
);
PET_MODIFIERS.enchantment.pete2 = mod(
  "Winter Song",
  "Active: the companion casts frost every 22s, spending 16 mana.",
  { spell: "frost", cooldown: 22, power: 0.9500000000000001 },
  "shards",
  "#aec3c7",
);
PET_MODIFIERS.enchantment.pete3 = mod(
  "Thunder Chirp",
  "Active: the companion casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 1.1 },
  "echo",
  "#9dbfc9",
);
PET_MODIFIERS.enchantment.pete4 = mod(
  "Moon Pull",
  "Active: the companion casts gravity every 26s, spending 16 mana.",
  { spell: "gravity", cooldown: 26, power: 0.8 },
  "chevrons",
  "#b7be9c",
);
PET_MODIFIERS.enchantment.pete5 = mod(
  "Briar Howl",
  "Active: the companion casts hex every 28s, spending 16 mana.",
  { spell: "hex", cooldown: 28, power: 0.9500000000000001 },
  "shield",
  "#b7c4bd",
);
PET_MODIFIERS.enchantment.pete6 = mod(
  "Morning Light",
  "Active: the companion casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.7 },
  "mountains",
  "#ae9d81",
);
PET_MODIFIERS.enchantment.pete7 = mod(
  "Shadow Purr",
  "Active: the companion casts arcane every 32s, spending 16 mana.",
  { spell: "arcane", cooldown: 32, power: 0.8 },
  "leaves",
  "#a0b485",
);
PET_MODIFIERS.enchantment.pete8 = mod(
  "River Song",
  "Active: the companion casts heal every 34s, spending 16 mana.",
  { spell: "heal", cooldown: 34, power: 0.7 },
  "eyes",
  "#b5a4bb",
);
PET_MODIFIERS.enchantment.pete9 = mod(
  "Skycall",
  "Active: the companion casts ember every 20s, spending 16 mana.",
  { spell: "ember", cooldown: 20, power: 1.1 },
  "ribbons",
  "#a5c8bc",
);
PET_MODIFIERS.enchantment.pete10 = mod(
  "Clockwork Pulse",
  "Active: the companion casts frost every 22s, spending 16 mana.",
  { spell: "frost", cooldown: 22, power: 0.8 },
  "cloud",
  "#a8b4ce",
);
PET_MODIFIERS.enchantment.pete11 = mod(
  "Rune Song",
  "Active: the companion casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 0.9500000000000001 },
  "banner",
  "#c6a78b",
);
PET_MODIFIERS.enchantment.pete12 = mod(
  "Star Leap",
  "Active: the companion casts gravity every 26s, spending 16 mana.",
  { spell: "gravity", cooldown: 26, power: 1.1 },
  "flames",
  "#de9869",
);
PET_MODIFIERS.enchantment.pete13 = mod(
  "Thorn Dance",
  "Active: the companion casts hex every 28s, spending 16 mana.",
  { spell: "hex", cooldown: 28, power: 0.8 },
  "snow",
  "#a5d5dc",
);
PET_MODIFIERS.enchantment.pete14 = mod(
  "Moss Mending",
  "Active: the companion casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.7 },
  "lightning",
  "#b2a2d3",
);
PET_MODIFIERS.enchantment.pete15 = mod(
  "Crystal Call",
  "Active: the companion casts arcane every 32s, spending 16 mana.",
  { spell: "arcane", cooldown: 32, power: 1.1 },
  "rings",
  "#a899cf",
);
PET_MODIFIERS.enchantment.pete16 = mod(
  "Echo Howl",
  "Active: the companion casts heal every 34s, spending 16 mana.",
  { spell: "heal", cooldown: 34, power: 0.7 },
  "vines",
  "#80a67b",
);
PET_MODIFIERS.enchantment.pete17 = mod(
  "Gale Cry",
  "Active: the companion casts ember every 20s, spending 16 mana.",
  { spell: "ember", cooldown: 20, power: 0.9500000000000001 },
  "sun",
  "#ddc789",
);
PET_MODIFIERS.enchantment.pete18 = mod(
  "Guardian Purr",
  "Active: the companion casts frost every 22s, spending 16 mana.",
  { spell: "frost", cooldown: 22, power: 1.1 },
  "smoke",
  "#9b83aa",
);
PET_MODIFIERS.enchantment.pete19 = mod(
  "Stone Roar",
  "Active: the companion casts storm every 24s, spending 16 mana.",
  { spell: "storm", cooldown: 24, power: 0.8 },
  "waves",
  "#87bcc6",
);
PET_MODIFIERS.enchantment.pete20 = mod(
  "Leafsong",
  "Active: the companion casts gravity every 26s, spending 16 mana.",
  { spell: "gravity", cooldown: 26, power: 0.9500000000000001 },
  "feathers",
  "#c9bd93",
);
PET_MODIFIERS.enchantment.pete21 = mod(
  "Oracle Whisper",
  "Active: the companion casts hex every 28s, spending 16 mana.",
  { spell: "hex", cooldown: 28, power: 1.1 },
  "gears",
  "#a9ac9e",
);
PET_MODIFIERS.enchantment.pete22 = mod(
  "Mist Call",
  "Active: the companion casts heal every 30s, spending 16 mana.",
  { spell: "heal", cooldown: 30, power: 0.7 },
  "runes",
  "#b9a5ce",
);
PET_MODIFIERS.enchantment.pete23 = mod(
  "Cloudsong",
  "Active: the companion casts arcane every 32s, spending 16 mana.",
  { spell: "arcane", cooldown: 32, power: 0.9500000000000001 },
  "stars",
  "#c8b4d8",
);
PET_MODIFIERS.enchantment.pete24 = mod(
  "Valiant Call",
  "Active: the companion casts heal every 34s, spending 16 mana.",
  { spell: "heal", cooldown: 34, power: 0.7 },
  "thorns",
  "#a6997c",
);

export function modifierPool(obj, kind) {
  if (
    kind === "pet" ||
    (obj && !WEAPONS[obj.key] && obj.modifierDomain === "pet")
  )
    return PET_MODIFIERS;
  if (kind === "armor" || obj?.modifierDomain === "armor")
    return ARMOR_MODIFIERS;
  return WEAPON_MODIFIERS;
}
export function modifierFits(obj, definition) {
  return (
    (!definition.weaponKinds ||
      definition.weaponKinds.includes(WEAPONS[obj.key]?.weaponKind)) &&
    (!definition.armorWeights ||
      definition.armorWeights.includes(obj.armorWeight)) &&
    (!definition.petKeys || definition.petKeys.includes(obj.key))
  );
}
export function objectModifiers(obj, kind) {
  return Object.entries(modifierPool(obj, kind)).flatMap(([type, defs]) =>
    defs[obj?.[type]]
      ? [{ kind: type, key: obj[type], ...defs[obj[type]] }]
      : [],
  );
}
export function validModifiers(obj, kind) {
  return ["prefix", "affix", "enchantment"].every(
    (k) =>
      !obj[k] ||
      (modifierPool(obj, kind)[k][obj[k]] &&
        modifierFits(obj, modifierPool(obj, kind)[k][obj[k]])),
  );
}
