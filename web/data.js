import { PLAYABLE_RACES, PLAYABLE_CLASSES, installFallenWorld } from "./fallen-world.js?v=21";
export { PLAYABLE_RACES, PLAYABLE_CLASSES };
import {
  WEAPONS,
  WEAPON_KINDS,
  PREFIXES,
  AFFIXES,
  ENCHANTMENTS,
  WEAPON_MODIFIERS,
  weaponModifiers,
} from "./weapons.js?v=21";
export {
  WEAPONS,
  WEAPON_KINDS,
  PREFIXES,
  AFFIXES,
  ENCHANTMENTS,
  WEAPON_MODIFIERS,
  weaponModifiers,
};
import {
  ARMOR_MODIFIERS,
  PET_MODIFIERS,
  modifierPool,
  modifierFits,
  objectModifiers,
  validModifiers,
} from "./modifiers.js?v=21";
export {
  ARMOR_MODIFIERS,
  PET_MODIFIERS,
  modifierPool,
  modifierFits,
  objectModifiers,
  validModifiers,
};
export const GAME_SEASON = "camp-fresh-2026-10-11";
export const W = 1200,
  H = 480,
  CELL = 24;
export const RARITIES = ["Common", "Uncommon", "Rare", "Legendary", "Mythical"];
export const RARITY_COLORS = [
  "#6b8291",
  "#299950",
  "#138be0",
  "#d79936",
  "#b580d6",
];
export const RACES = {
  Human: { text: "Adaptable · earns 20% more experience", xp: 1.2 },
  Dwarf: { text: "Stoneborn · resists knockback", mass: 1.6 },
  Elf: { text: "Keen eyes · +25 ranged reach", range: 25 },
  Orc: {
    text: "Heavy hands · +3 attack, stronger knockback",
    attack: 3,
    force: 1.35,
  },
  Gnome: {
    text: "Quick thinking · abilities recharge 15% faster",
    cooldown: 0.85,
  },
  Shade: { text: "Elusive · 12% chance to evade attacks", dodge: 0.12 },
  Fae: { text: "Winged · flies over water and obstacles", flying: true },
};
export const CLASSES = {
  vanguard: {
    label: "Vanguard",
    role: "Frontline",
    hp: 185,
    attack: 19,
    armor: 3,
    speed: 53,
    range: 32,
    rate: 1.15,
    color: "#d5aa64",
    icon: "sword",
    ability: "Earthshaker",
    cooldown: 7,
    behavior:
      "Leads the charge. Sweeping strikes hit nearby enemies and knock them back.",
    abilityText: "Cleave nearby enemies for 32 damage and push them back.",
    equipment: "sword",
    rank: 0,
  },
  guardian: {
    label: "Guardian",
    role: "Frontline",
    hp: 245,
    attack: 12,
    armor: 6,
    speed: 39,
    range: 31,
    rate: 1.3,
    color: "#92b9bb",
    icon: "shield",
    ability: "Hold the line",
    cooldown: 9,
    behavior:
      "Stays ahead of allies. Its shield intercepts incoming arrows and bolts.",
    abilityText:
      "Grant a 42-point shield to itself and allies within 140 steps.",
    equipment: "shield",
    rank: 0,
  },
  ranger: {
    label: "Ranger",
    role: "Ranged",
    hp: 104,
    attack: 17,
    armor: 1,
    speed: 53,
    range: 215,
    rate: 1.25,
    color: "#afd199",
    icon: "bow",
    ability: "Split shot",
    cooldown: 7,
    behavior:
      "Keeps its distance, uses cover, and fires arrows at visible enemies.",
    abilityText: "Loose arrows at up to three nearby enemies.",
    equipment: "bow",
    rank: 2,
  },
  healer: {
    label: "Cleric",
    role: "Support",
    hp: 118,
    attack: 10,
    armor: 2,
    speed: 44,
    range: 190,
    rate: 1.4,
    color: "#e7d3a2",
    icon: "spark",
    ability: "Sanctuary",
    cooldown: 10,
    behavior: "Follows the company and prioritizes healing injured allies.",
    abilityText:
      "Bless the ground for 7 seconds: heal allies and increase their damage.",
    equipment: "staff",
    rank: 3,
  },
  engineer: {
    label: "Tinker",
    role: "Builder",
    hp: 118,
    attack: 10,
    armor: 2,
    speed: 40,
    range: 160,
    rate: 1.5,
    color: "#ddac78",
    icon: "gear",
    ability: "Fieldworks",
    cooldown: 12,
    behavior:
      "Builds a turret and barricade, then maintains a safe firing position.",
    abilityText:
      "Build a 70-HP turret and a 100-HP barricade. Up to two turrets at once.",
    equipment: "hammer",
    rank: 2,
  },
  assassin: {
    label: "Veilblade",
    role: "Flanker",
    hp: 107,
    attack: 24,
    armor: 1,
    speed: 77,
    range: 28,
    rate: 0.92,
    color: "#b4a3d7",
    icon: "dagger",
    ability: "Shadow step",
    cooldown: 8,
    behavior:
      "Hunts the enemy backline. While invisible, enemy units cannot target it.",
    abilityText:
      "Teleport beside a backline enemy, become invisible for 2 seconds, and strike.",
    equipment: "dagger",
    rank: 1,
  },
  summoner: {
    label: "Summoner",
    role: "Support",
    hp: 109,
    attack: 11,
    armor: 1,
    speed: 42,
    range: 200,
    rate: 1.5,
    color: "#b8cba1",
    icon: "paw",
    ability: "Call the pack",
    cooldown: 10,
    behavior: "Calls spirit wolves to crowd and harass the enemy frontline.",
    abilityText:
      "Summon two spirit wolves for 20 seconds. Up to four wolves at once.",
    equipment: "staff",
    rank: 3,
  },
  mage: {
    label: "Mage",
    role: "Ranged",
    hp: 96,
    attack: 18,
    armor: 0,
    speed: 45,
    range: 200,
    rate: 1.65,
    color: "#e49a7b",
    icon: "flame",
    ability: "Arcane ground",
    cooldown: 8,
    behavior:
      "An unspecialized Mage uses arcane bolts and a damaging ground Curse. Schools open at level 20.",
    abilityText:
      "Create an arcane Curse that damages enemies on the ground for 5 seconds.",
    equipment: "staff",
    rank: 2,
  },
  bard: {
    label: "Bard",
    role: "Support",
    hp: 124,
    attack: 7,
    armor: 1,
    speed: 47,
    range: 165,
    rate: 1.5,
    color: "#d6a6c2",
    icon: "music",
    ability: "Second wind",
    cooldown: 10,
    behavior:
      "Keeps close to companions and uses songs to restore health and quicken attacks.",
    abilityText:
      "Heal nearby allies for 26 HP and make their attacks faster for 6 seconds.",
    equipment: "lute",
    rank: 3,
  },
  witch: {
    label: "Hexweaver",
    role: "Ranged",
    hp: 104,
    attack: 13,
    armor: 1,
    speed: 44,
    range: 195,
    rate: 1.5,
    color: "#b9b180",
    icon: "moon",
    ability: "Withering ground",
    cooldown: 9,
    behavior:
      "Curses enemy clusters, weakening their attacks and slowing movement.",
    abilityText:
      "Curse an area for 7 seconds: slow foes 45%, weaken damage, and deal damage.",
    equipment: "staff",
    rank: 2,
  },
  artillery: {
    label: "Artillerist",
    role: "Artillery",
    hp: 155,
    attack: 24,
    armor: 3,
    speed: 22,
    range: 330,
    rate: 3.4,
    color: "#b9aea0",
    icon: "cannon",
    ability: "Heavy shell",
    cooldown: 11,
    behavior:
      "Moves slowly and lobs explosive shells over obstacles into enemy groups.",
    abilityText:
      "Launch an explosive shell for 48 area damage and powerful knockback.",
    equipment: "cannon",
    rank: 4,
  },
  stormcaller: {
    label: "Stormwing",
    role: "Flying",
    hp: 99,
    attack: 15,
    armor: 1,
    speed: 62,
    range: 150,
    rate: 1.4,
    color: "#a6cdd8",
    icon: "bolt",
    ability: "Chain lightning",
    cooldown: 8,
    behavior:
      "Flies across terrain and zaps enemies. Ground melee units cannot strike flying heroes.",
    abilityText:
      "Arc lightning through up to four nearby enemies, dealing 22 damage each.",
    equipment: "staff",
    rank: 2,
  },
};
export const HEROES = [
  {
    name: "Rowan",
    race: "Human",
    classId: "vanguard",
    title: "The Wayfarer",
    trait: "Steadfast",
    traitText: "+18 maximum health.",
    bonus: { hp: 18 },
  },
  {
    name: "Bryn",
    race: "Dwarf",
    classId: "guardian",
    title: "The Last Door",
    trait: "Ironhearted",
    traitText: "+1 armor.",
    bonus: { armor: 1 },
  },
  {
    name: "Lark",
    race: "Elf",
    classId: "ranger",
    title: "The Far Arrow",
    trait: "Sharpshot",
    traitText: "+3 attack.",
    bonus: { attack: 3 },
  },
  {
    name: "Mira",
    race: "Human",
    classId: "healer",
    title: "The Dawnkeeper",
    trait: "Kindred",
    traitText: "Healing is 20% stronger.",
    bonus: { healing: 1.2 },
  },
  {
    name: "Pip",
    race: "Gnome",
    classId: "engineer",
    title: "The Improviser",
    trait: "Overclocked",
    traitText: "Abilities recharge 10% faster.",
    bonus: { cooldown: 0.9 },
  },
  {
    name: "Nyx",
    race: "Shade",
    classId: "assassin",
    title: "The Quiet Knife",
    trait: "Fleetfoot",
    traitText: "+8 movement speed.",
    bonus: { speed: 8 },
  },
  {
    name: "Fern",
    race: "Elf",
    classId: "summoner",
    title: "The Wild Friend",
    trait: "Deep roots",
    traitText: "+20 maximum health.",
    bonus: { hp: 20 },
  },
  {
    name: "Ash",
    race: "Orc",
    classId: "mage",
    title: "The Gentle Flame",
    trait: "Hotheaded",
    traitText: "+4 attack.",
    bonus: { attack: 4 },
  },
  {
    name: "Ollie",
    race: "Gnome",
    classId: "bard",
    title: "The Roadsong",
    trait: "Encore",
    traitText: "Abilities recharge 15% faster.",
    bonus: { cooldown: 0.85 },
  },
  {
    name: "Sable",
    race: "Shade",
    classId: "mage",
    title: "The Dusk Thread",
    trait: "Patient",
    traitText: "+30 ranged reach.",
    bonus: { range: 30 },
  },
  {
    name: "Brass",
    race: "Dwarf",
    classId: "artillery",
    title: "The Big Idea",
    trait: "Reinforced",
    traitText: "+35 maximum health.",
    bonus: { hp: 35 },
  },
  {
    name: "Wisp",
    race: "Fae",
    classId: "mage",
    title: "The Weatherling",
    trait: "Restless",
    traitText: "+10 movement speed.",
    bonus: { speed: 10 },
  },
];
export const ITEMS = {
  ironblade: {
    name: "Ironleaf blade",
    icon: "sword",
    desc: "+7 physical attack. Push enemies back.",
    attack: 7,
    knock: 25,
  },
  longbow: {
    name: "Farwood charm",
    icon: "bow",
    desc: "+70 ranged reach. Melee heroes learn to throw spectral blades.",
    range: 70,
    ranged: true,
  },
  ward: {
    name: "Warden plate",
    icon: "shield",
    desc: "+40 health and +3 armor. Takes 15% less knockback.",
    hp: 40,
    armor: 3,
    mass: 1.15,
  },
  frost: {
    name: "Winterglass",
    icon: "snow",
    desc: "Attacks slow enemies by 40% for 2 seconds.",
    slow: true,
  },
  wings: {
    name: "Mothwing cloak",
    icon: "wing",
    desc: "Fly over rivers, barricades, and trees. Immune to ground melee attacks.",
    flying: true,
  },
  ember: {
    name: "Emberstone",
    icon: "flame",
    desc: "+4 attack. Attacks scorch a small area around their target.",
    attack: 4,
    splash: 30,
  },
  bell: {
    name: "Pilgrim bell",
    icon: "music",
    desc: "Heal yourself and nearby allies for 3 HP each second.",
    regen: 3,
  },
  haste: {
    name: "Clockwork heart",
    icon: "gear",
    desc: "Abilities recharge 25% faster. +7 movement speed.",
    cooldown: 0.75,
    speed: 7,
  },
};
CLASSES.mage.color = "#b8add9";
CLASSES.mage.icon = "spark";
CLASSES.envoy = {
  label: "Envoy",
  role: "Support",
  hp: 119,
  attack: 9,
  armor: 1,
  speed: 45,
  range: 205,
  rate: 1.5,
  color: "#d6ba96",
  icon: "heart",
  ability: "Change of heart",
  cooldown: 10,
  behavior:
    "Weakens foes, then persuades wounded enemies to join your side permanently. Bosses cannot be converted.",
  abilityText:
    "Convert a non-boss enemy below 45% health within range. Mind must overcome their resolve.",
  equipment: "staff",
  rank: 3,
};
HEROES.push(
  {
    name: "Vale",
    race: "Human",
    classId: "envoy",
    title: "The Open Hand",
    trait: "Silver tongue",
    traitText: "+3 Mind.",
    bonus: { mind: 3 },
  },
  {
    name: "Iona",
    race: "Human",
    classId: "mage",
    title: "The Falling Star",
    trait: "Weight of worlds",
    traitText: "+3 Mind.",
    bonus: { mind: 3 },
  },
);
CLASSES.bard.ability = "Heartstring";
CLASSES.bard.abilityText =
  "Charm a wounded, susceptible opponent. Complete the expedition to recruit them permanently.";
CLASSES.bard.behavior =
  "Plays from the backline, softening enemy resolve before asking them to join.";
CLASSES.bard.cooldown = 12;
export const CORE_STATS = [
  "vitality",
  "armor",
  "strength",
  "mind",
  "agility",
  "endurance",
];
const slot = (label, ...types) => ({ label, types });
const hand = () => slot("Hand", "weapon", "focus"),
  body = () => slot("Body", "body"),
  charm = () => slot("Charm", "charm"),
  focus = () => slot("Focus", "focus"),
  tool = () => slot("Tool", "tool");
// Race controls physiology and its passive; the class controls equipment.
Object.assign(RACES, {
  Sylph: {
    text: "Slipstream · +8 speed and 8% evasion",
    speed: 8,
    dodge: 0.08,
    base: { vitality: -1, mind: 5, agility: 18, endurance: 1 },
    growth: { vitality: 0.09, mind: 0.17, agility: 0.15, endurance: 0.07 },
    color: "#b9edff",
  },
  Automaton: {
    text: "Alloy body · 40% heavier",
    mass: 1.4,
    base: {
      vitality: 4,
      armor: 3,
      strength: 3,
      mind: 2,
      agility: 7,
      endurance: 7,
    },
    growth: { vitality: 0.16, strength: 0.14, mind: 0.1, endurance: 0.2 },
    color: "#9bc7d7",
  },
  Nereid: {
    text: "Tidal memory · regenerates 1 HP per second",
    regenSelf: 1,
    base: { vitality: 1, mind: 6, agility: 13, endurance: 3 },
    growth: { vitality: 0.11, mind: 0.2, agility: 0.08, endurance: 0.12 },
    color: "#8fdce4",
  },
  Kobold: {
    text: "Nimble hands · abilities recharge 10% faster",
    cooldown: 0.9,
    base: { vitality: 0, strength: 2, mind: 1, agility: 16, endurance: 2 },
    growth: { vitality: 0.1, strength: 0.13, mind: 0.06, agility: 0.12 },
    color: "#deb174",
  },
  Myconid: {
    text: "Spore shelter · nearby allies regenerate 1 HP per second",
    regen: 1,
    base: { vitality: 3, armor: 2, mind: 4, agility: 6, endurance: 5 },
    growth: { vitality: 0.17, mind: 0.14, endurance: 0.14 },
    color: "#d4badf",
  },
  Drakeling: {
    text: "Dragon spark · +3 attack and stronger pushes",
    attack: 3,
    force: 1.2,
    base: { vitality: 3, strength: 4, mind: 2, agility: 10, endurance: 4 },
    growth: { vitality: 0.15, strength: 0.16, mind: 0.1, endurance: 0.13 },
    color: "#aecb77",
  },
  Celestial: {
    text: "Starlight · 15% stronger healing",
    healing: 1.15,
    base: { vitality: 0, mind: 8, agility: 11, endurance: 3 },
    growth: { vitality: 0.1, mind: 0.23, endurance: 0.1 },
    color: "#f5df99",
  },
});
Object.assign(RACES, {
  Zombie: {
    text: "Undying memory · regenerates 0.8 HP each second",
    regenSelf: 0.8,
    color: "#a5af83",
  },
  Vampire: {
    text: "Night hunger · restores health with every strike",
    lifesteal: 0.1,
    color: "#d4bcc6",
  },
  Ent: {
    text: "Old roots · heavy body resists knockback",
    mass: 2.2,
    color: "#a6ac76",
    uncharmable: true,
  },
});
const raceColors = {
  Human: "#e8b393",
  Dwarf: "#d7a885",
  Elf: "#ead3b2",
  Orc: "#89bf77",
  Gnome: "#e9caa5",
  Shade: "#bd9dde",
  Fae: "#bce7ca",
};
for (const [id, r] of Object.entries(RACES)) r.color ||= raceColors[id];
const extended = {
  trapper: [
    "ranger",
    "Trapper",
    "Snare field",
    "Sets two snares before combat. Activates a scatter shot during the wave.",
  ],
  minelayer: [
    "engineer",
    "Minelayer",
    "Remote blast",
    "Places blast mines before combat; triggers a physical Explosion in battle.",
  ],
  alchemist: [
    "artillery",
    "Alchemist",
    "Volatile flask",
    "Throws physical explosions into crowded groups.",
  ],
  druid: [
    "healer",
    "Druid",
    "Living spring",
    "Creates a healing Blessing under an injured ally.",
  ],
  paladin: [
    "guardian",
    "Paladin",
    "Aegis",
    "Protects nearby allies with a durable shield.",
  ],
  necromancer: [
    "summoner",
    "Necromancer",
    "Echo legion",
    "Summons spectral companions to hold the frontline.",
  ],
  psion: [
    "mage",
    "Psion",
    "Gravity well",
    "Crushes groups with a Gravity Curse that pulls units together.",
  ],
  duelist: [
    "vanguard",
    "Duelist",
    "Crescent strike",
    "Sweeps nearby enemies with a physical Explosion.",
  ],
};
for (const [id, [recipe, label, ability, text]] of Object.entries(extended))
  CLASSES[id] = {
    ...CLASSES[recipe],
    label,
    ability,
    abilityText: text,
    behavior: text,
    recipe,
  };
CLASSES.psion.innateElement = "gravity";
CLASSES.trapper.preBattle = "snare";
CLASSES.minelayer.preBattle = "mine";
CLASSES.engineer.preBattle = "wall";
for (const [id, c] of Object.entries(CLASSES))
  c.magical = [
    "mage",
    "healer",
    "summoner",
    "envoy",
    "witch",
    "stormcaller",
    "bard",
    "druid",
    "necromancer",
    "psion",
  ].includes(id);
export const SCHOOLS = {
  mage: [
    {
      id: "ember",
      name: "Embermage",
      icon: "flame",
      text: "Ember Curses burn larger enemy clusters.",
      bonus: { mind: 5 },
      ability: "Ember Curse",
    },
    {
      id: "gravity",
      name: "Gravitist",
      icon: "moon",
      text: "Gravity Curses pull opponents into a crushing well.",
      bonus: { mind: 5, endurance: 3 },
      ability: "Gravity well",
    },
    {
      id: "frost",
      name: "Frostweaver",
      icon: "snow",
      text: "Frost Curses slow enemies and sap their strength.",
      bonus: { mind: 4, armor: 2 },
      ability: "Winter Curse",
    },
    {
      id: "hex",
      name: "Hexweaver",
      icon: "moon",
      text: "Lingering Curses weaken and slow opponents.",
      bonus: { mind: 6 },
      ability: "Withering Curse",
    },
    {
      id: "storm",
      name: "Stormcaller",
      icon: "bolt",
      text: "Chain lightning jumps through up to four foes.",
      bonus: { mind: 5, agility: 3 },
      ability: "Chain lightning",
    },
  ],
  vanguard: [
    {
      id: "breaker",
      name: "Earthbreaker",
      text: "Stronger physical Explosions and knockback.",
      bonus: { strength: 6 },
      power: 1.25,
    },
    {
      id: "duelist",
      name: "Duelist",
      text: "Faster attacks and heavier single-target hits.",
      bonus: { strength: 3, agility: 6 },
    },
  ],
  guardian: [
    {
      id: "warden",
      name: "Warden",
      text: "Larger Blessings and stronger shields.",
      bonus: { vitality: 5, armor: 3 },
      power: 1.25,
    },
    {
      id: "bulwark",
      name: "Bulwark",
      text: "Exceptional armor and endurance.",
      bonus: { armor: 5, endurance: 7 },
    },
  ],
  ranger: [
    {
      id: "deadeye",
      name: "Deadeye",
      text: "Longer reach and a heavy single-target precision shot.",
      bonus: { strength: 6 },
      range: 45,
    },
    {
      id: "outrider",
      name: "Outrider",
      text: "Agile ranged skirmisher.",
      bonus: { agility: 7, endurance: 3 },
    },
  ],
  healer: [
    {
      id: "dawn",
      name: "Dawnkeeper",
      text: "Stronger healing Blessings.",
      bonus: { mind: 6 },
      power: 1.3,
    },
    {
      id: "protector",
      name: "Lightwarden",
      text: "Enduring support with heavier armor.",
      bonus: { mind: 3, armor: 5 },
    },
  ],
  engineer: [
    {
      id: "machinist",
      name: "Machinist",
      text: "Stronger turrets and fieldworks.",
      bonus: { mind: 5, endurance: 3 },
      power: 1.3,
    },
    {
      id: "siege",
      name: "Siegewright",
      text: "Offensive inventions and stronger explosions.",
      bonus: { strength: 6, mind: 3 },
      power: 1.2,
    },
  ],
  assassin: [
    {
      id: "night",
      name: "Nightblade",
      text: "Faster, stronger shadow strikes.",
      bonus: { strength: 6, agility: 3 },
      power: 1.25,
    },
    {
      id: "phantom",
      name: "Phantom",
      text: "Exceptional mobility and Mind.",
      bonus: { agility: 7, mind: 4 },
    },
  ],
  summoner: [
    {
      id: "pack",
      name: "Packkeeper",
      text: "Stronger spirit wolves.",
      bonus: { mind: 6 },
      power: 1.3,
    },
    {
      id: "grove",
      name: "Grovecaller",
      text: "Hardier summoned allies.",
      bonus: { mind: 4, vitality: 5 },
      power: 1.2,
    },
  ],
  bard: [
    {
      id: "anthem",
      name: "Anthemist",
      text: "Stronger Heartstring persuasion and supporting songs.",
      bonus: { mind: 6 },
      power: 1.3,
    },
    {
      id: "skald",
      name: "Battle Skald",
      text: "A tougher battle musician.",
      bonus: { strength: 5, armor: 3, mind: 2 },
    },
  ],
  artillery: [
    {
      id: "bombard",
      name: "Bombardier",
      text: "Larger and stronger physical Explosions.",
      bonus: { strength: 7 },
      power: 1.3,
    },
    {
      id: "longshot",
      name: "Longshot",
      text: "Longer range and faster positioning.",
      bonus: { strength: 4, agility: 5 },
      range: 60,
    },
  ],
  envoy: [
    {
      id: "diplomat",
      name: "Diplomat",
      text: "Stronger Mind overcomes enemy resolve.",
      bonus: { mind: 8 },
    },
    {
      id: "heartbinder",
      name: "Heartbinder",
      text: "Persuasion works on enemies below 60% health.",
      bonus: { mind: 5, endurance: 3 },
    },
  ],
};
export const LINEAGES = {
  Human: [
    { id: "wayfarer", name: "Wayfarer", bonus: { endurance: 4, agility: 3 } },
    { id: "aetherborn", name: "Aetherborn", bonus: { mind: 6 } },
  ],
  Dwarf: [
    { id: "stonekin", name: "Stonekin", bonus: { armor: 4, vitality: 3 } },
    { id: "runeborn", name: "Runeborn", bonus: { mind: 6, endurance: 2 } },
  ],
  Elf: [
    { id: "wood", name: "Wood Elf", bonus: { agility: 5, strength: 2 } },
    { id: "high", name: "High Elf", bonus: { mind: 7 } },
  ],
  Orc: [
    { id: "iron", name: "Ironhide", bonus: { armor: 4, endurance: 4 } },
    { id: "blood", name: "Bloodfang", bonus: { strength: 7 } },
  ],
  Gnome: [
    { id: "clock", name: "Clockborn", bonus: { mind: 5, endurance: 4 } },
    { id: "wild", name: "Wild Gnome", bonus: { agility: 5, vitality: 3 } },
  ],
  Shade: [
    { id: "dusk", name: "Duskbound", bonus: { agility: 6 } },
    { id: "void", name: "Voidborn", bonus: { mind: 7 } },
  ],
  Fae: [
    { id: "sun", name: "Sun Fae", bonus: { mind: 5, vitality: 2 } },
    { id: "moon", name: "Moon Fae", bonus: { mind: 3, agility: 6 } },
  ],
};
for (const [id, c] of Object.entries(CLASSES)) {
  if (!SCHOOLS[id])
    SCHOOLS[id] = [
      {
        id: "adept",
        name: c.label + " Adept",
        text: "A stronger signature ability.",
        bonus: c.magical ? { mind: 6 } : { strength: 6 },
        power: 1.25,
      },
      {
        id: "sentinel",
        name: c.label + " Sentinel",
        text: "A hardier, more enduring form.",
        bonus: { vitality: 5, endurance: 5 },
      },
    ];
  c.attributes =
    {
      guardian: ["Shieldbearer"],
      paladin: ["Shieldbearer"],
      engineer: ["Inventive"],
      minelayer: ["Inventive"],
      envoy: ["Empath"],
      psion: ["Strongwill"],
    }[id] || [];
}
for (const [id, r] of Object.entries(RACES))
  if (!LINEAGES[id])
    LINEAGES[id] = [
      {
        id: "primal",
        name: id + " Primal",
        bonus: { vitality: 4, strength: 4 },
      },
      { id: "lucent", name: id + " Lucent", bonus: { mind: 6, agility: 3 } },
    ];
export const ATTRIBUTES = {
  Volunteer: { text: "Unproven: core stats are 10% lower before level 10." },
  Vampire: { text: "Heals for 12% of damage dealt. +2 Mind." },
  Werewolf: {
    text: "+3 Strength. Below half health, attacks and movement are 20% faster.",
  },
  Blessed: { text: "+2 Mind and +2 Endurance." },
  Cursed: { text: "+4 Mind, −1 Armor." },
  Converted: { text: "Rescued from an opposing company. +1 Endurance." },
  Strong: { text: "+3 Strength." },
  Swift: { text: "+3 Agility." },
  Sturdy: { text: "+3 Vitality." },
  Strongwill: { text: "+3 Mind." },
  Inventive: { text: "+2 Mind and +2 Endurance." },
  Shieldbearer: { text: "+2 Armor." },
  Empath: { text: "+2 Mind; better at overcoming enemy resolve." },
};
export const ATTRIBUTE_BONUSES = {
  Vampire: { mind: 2 },
  Werewolf: { strength: 3 },
  Blessed: { mind: 2, endurance: 2 },
  Cursed: { mind: 4, armor: -1 },
  Converted: { endurance: 1 },
  Strong: { strength: 3 },
  Swift: { agility: 3 },
  Sturdy: { vitality: 3 },
  Strongwill: { mind: 3 },
  Inventive: { mind: 2, endurance: 2 },
  Shieldbearer: { armor: 2 },
  Empath: { mind: 2 },
};
const itemData = {
  ironblade: ["weapon", 35],
  longbow: ["weapon", 40],
  ward: ["body", 45],
  frost: ["focus", 55],
  wings: ["charm", 75],
  ember: ["focus", 45],
  bell: ["charm", 50],
  haste: ["tool", 60],
};
for (const [id, [type, price]] of Object.entries(itemData))
  Object.assign(ITEMS[id], { type, price });
ITEMS.wings.name = "Slipstream cloak";
ITEMS.wings.agility = 3;
ITEMS.wings.desc = "+3 Agility. Fly over water and obstacles.";
ITEMS.frost.mind = 2;
Object.assign(ITEMS, {
  lens: {
    name: "Aether lens",
    icon: "spark",
    desc: "+5 Mind. Strengthens magic and healing.",
    mind: 5,
    type: "focus",
    price: 40,
  },
  boots: {
    name: "Cloudstep boots",
    icon: "wing",
    desc: "+4 Agility and +3 Endurance.",
    agility: 4,
    endurance: 3,
    type: "feet",
    price: 30,
  },
  aegis: {
    name: "Bubble shield",
    icon: "shield",
    desc: "+3 Armor and +2 Endurance.",
    armor: 3,
    endurance: 2,
    type: "offhand",
    price: 38,
  },
  tome: {
    name: "Lucent codex",
    icon: "book",
    desc: "+4 Mind and +20 ranged reach.",
    mind: 4,
    range: 20,
    type: "offhand",
    price: 35,
  },
  quiver: {
    name: "Skyglass quiver",
    icon: "bow",
    desc: "+3 Strength and +25 reach.",
    strength: 3,
    range: 25,
    type: "offhand",
    price: 32,
  },
  dagger: {
    name: "Ripple dagger",
    icon: "dagger",
    desc: "+5 attack and +2 Agility.",
    attack: 5,
    agility: 2,
    type: "weapon",
    price: 30,
  },
  hammer: {
    name: "Chrome hammer",
    icon: "gear",
    desc: "+4 Strength; stronger knockback.",
    strength: 4,
    knock: 35,
    type: "weapon",
    price: 38,
  },
  cannon: {
    name: "Aqua cannon",
    icon: "cannon",
    desc: "+8 attack and +35 range.",
    attack: 8,
    range: 35,
    type: "weapon",
    price: 50,
  },
  robe: {
    name: "Tidal robe",
    icon: "snow",
    desc: "+3 Mind and +2 Armor.",
    mind: 3,
    armor: 2,
    type: "body",
    price: 35,
  },
  lute: {
    name: "Crystal chimes",
    icon: "music",
    desc: "+3 Mind and +1 nearby regeneration.",
    mind: 3,
    regen: 1,
    type: "tool",
    price: 40,
  },
  spring: {
    name: "Bubble coil",
    icon: "gear",
    desc: "+3 Endurance and +4 speed.",
    endurance: 3,
    speed: 4,
    type: "tool",
    price: 32,
  },
});
export const LOCATIONS = {
  greenway: {
    name: "Mosslight Wood",
    icon: "leaf",
    biome: "forest",
    text: "Elven footpaths disappear into a kingdom of mushrooms.",
    lore: "The forest remembers every footstep. Its keepers are curious about travelers who listen.",
    races: ["Elf", "Myconid", "Fae", "Ent"],
    classes: ["ranger", "druid", "trapper", "vanguard"],
    color: "#829977",
    events: {
      fountain: "Mosslight spring",
      chest: "A rootswept chest",
      cache: "The mushroom circle",
      special: "A woodland pact",
    },
  },
  marsh: {
    name: "The Hollow March",
    icon: "skull",
    biome: "river",
    text: "Zombies and lost souls gather around the flooded abbey.",
    lore: "The old bell still rings beneath the water. Some of the dead remember their names.",
    races: ["Zombie", "Shade", "Automaton"],
    classes: ["vanguard", "necromancer", "guardian", "mage"],
    color: "#929ba1",
    events: {
      fountain: "Silverfen spring",
      chest: "A sunken coffer",
      cache: "The ferryman’s shelter",
      special: "The abbey bell",
    },
  },
  cinder: {
    name: "Briarfall Country",
    icon: "moon",
    biome: "village",
    text: "Bandit roads, ancient Ents, and vampire estates.",
    lore: "Behind its red roofs and golden fields, the countryside keeps a long list of secrets.",
    races: ["Human", "Vampire", "Ent", "Dwarf"],
    classes: ["assassin", "vanguard", "bard", "ranger"],
    color: "#ba967f",
    events: {
      fountain: "The village well",
      chest: "A caravan trunk",
      cache: "A roadside inn",
      special: "The midnight orchard",
    },
  },
};
export const VENDORS = [
  {
    id: "guild",
    name: "The Tavern",
    icon: "army",
    tag: "Characters",
    text: "A new name. A lasting place in your company.",
  },
  {
    id: "forge",
    name: "The Forge",
    icon: "sword",
    tag: "Equipment",
    text: "Weapons, armor, tools, and fieldwork.",
  },
  {
    id: "arcane",
    name: "The Curiosity Shop",
    icon: "moon",
    tag: "Scrolls & magic",
    text: "Unidentified relics and recipes waiting to be understood.",
  },
  {
    id: "night",
    name: "The Apothecary",
    icon: "spark",
    tag: "Attributes & supplies",
    text: "Permanent discoveries and small comforts.",
  },
  {
    id: "menagerie",
    name: "The Menagerie",
    icon: "paw",
    tag: "Companions",
    text: "Small friends with a big part to play.",
  },
  {
    id: "atelier",
    name: "The Atelier",
    icon: "wing",
    tag: "Cosmetics",
    text: "Wear a little of your story.",
  },
];
export const DIFFICULTIES = {
  story: {
    name: "Wanderer",
    health: 0.8,
    damage: 0.75,
    reward: 0.8,
    text: "A gentler road",
  },
  normal: {
    name: "Adventurer",
    health: 1,
    damage: 1,
    reward: 1,
    text: "The intended challenge",
  },
  hard: {
    name: "Veteran",
    health: 1.4,
    damage: 1.25,
    reward: 1.5,
    text: "Stronger foes, richer purses",
  },
  nightmare: {
    name: "Nightmare",
    health: 2,
    damage: 1.65,
    reward: 2.2,
    text: "A demanding test of your company",
  },
};
export const PETS = {
  fox: {
    name: "Bramble fox",
    icon: "paw",
    color: "#c59065",
    mode: "attack",
    text: "Follows its owner and nips nearby enemies.",
    price: 95,
  },
  sprite: {
    name: "Lantern sprite",
    icon: "spark",
    color: "#d9c98e",
    mode: "heal",
    text: "Flits beside its owner, restoring a little health.",
    price: 120,
  },
  mote: {
    name: "Moon apparition",
    icon: "moon",
    color: "#b5a4d7",
    mode: "shield",
    text: "Orbits its owner and periodically grants a small shield.",
    price: 140,
  },
  beetle: {
    name: "Clockwork beetle",
    icon: "gear",
    color: "#91a9ad",
    mode: "attack",
    text: "A tiny mechanical guard with a ranged bolt.",
    price: 110,
  },
};
export const COSMETICS = {
  moss: {
    name: "Mosslight mantle",
    hue: 115,
    price: 90,
    text: "Earned at Mosslight’s third milestone.",
  },
  dusk: {
    name: "Duskweave",
    hue: 275,
    price: 110,
    text: "A coat the color of the evening sky.",
  },
  crimson: {
    name: "Crimson traveler",
    hue: 355,
    price: 100,
    text: "A red coat for long roads.",
  },
  golden: {
    name: "Champion’s gold",
    hue: 42,
    price: 160,
    text: "Arena champions wear the sunlight.",
  },
};
export const MONTHLY_COLLECTIONS = [
  "Winter lanterns",
  "The silver thaw",
  "Seed and song",
  "Rainwood mysteries",
  "The bloom court",
  "Lantern caravans",
  "Ember festival",
  "Starfall trails",
  "The amber harvest",
  "Harvest of shadows",
  "The drowned vigil",
  "The long night",
];
const monthHues = [200, 220, 140, 175, 295, 42, 20, 260, 38, 280, 190, 240];
for (let month = 0; month < MONTHLY_COLLECTIONS.length; month++) {
  for (let variant = 0; variant < 3; variant++) {
    const hue = (monthHues[month] + variant * 18) % 360;
    COSMETICS["monthly-" + month + "-" + variant] = {
      name:
        MONTHLY_COLLECTIONS[month] +
        " · " +
        ["mantle", "colors", "regalia"][variant],
      hue,
      color: `hsl(${hue} 50% 68%)`,
      type: "character",
      monthly: month,
      gems: [4, 7, 10][variant],
      price: 0,
      text:
        ["A traveling mantle", "Company colors", "Ceremonial regalia"][
          variant
        ] +
        " inspired by " +
        MONTHLY_COLLECTIONS[month].toLowerCase() +
        ". Changes appearance; grants no combat bonuses.",
    };
  }
}
export const CONSUMABLES = {
  tonic: {
    name: "Travel tonic",
    icon: "heart",
    price: 18,
    text: "Fully restores one character and ends recovery at Camp.",
  },
  treat: {
    name: "Companion treat",
    icon: "paw",
    price: 25,
    text: "Gives an equipped companion 80 XP at Camp.",
  },
};
export const CAMPAIGNS = {
  greenway: [
    ["The first clearing", 3, 1, "gold"],
    ["Fernbridge", 4, 3, "pet"],
    ["The mushroom court", 5, 5, "moss"],
    ["Rootbound ruins", 6, 8, "scroll:Ent"],
    ["The elder grove", 8, 12, "slot"],
  ],
  marsh: [
    ["The silent quay", 4, 3, "gold"],
    ["Graves in the reeds", 6, 6, "scroll:Zombie"],
    ["The drowned cloister", 7, 9, "dusk"],
    ["The bell below", 9, 13, "scroll:Automaton"],
    ["The last ferryman", 10, 18, "slot"],
  ],
  cinder: [
    ["The orchard road", 5, 5, "gold"],
    ["Red-roof hamlet", 7, 8, "scroll:Vampire"],
    ["A bandit’s bargain", 8, 12, "crimson"],
    ["The old estate", 10, 17, "scroll:Ent"],
    ["The thorn crown", 12, 24, "gold"],
  ],
};
export const EVENTS = {
  daily: {
    name: "The lantern trail",
    count: 6,
    location: "greenway",
    reward: 90,
    text: "An evening rescue and a hidden supply cache.",
  },
  weekly: {
    name: "The long vigil",
    count: 12,
    location: "marsh",
    reward: 220,
    text: "A flooded abbey, restless dead, and a rare creation scroll.",
  },
  monthly: {
    name: "The wandering eclipse",
    count: 20,
    location: "cinder",
    reward: 450,
    text: "A long crossing through changing locales with a cosmetic milestone.",
  },
};
export function periodKey(kind, now = Date.now()) {
  const d = new Date(now);
  if (kind === "monthly") return d.toISOString().slice(0, 7);
  if (kind === "weekly") {
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}
export function makePet(key, level = 1, rarityTier = 0) {
  return {
    id: uid("pet"),
    key,
    level,
    xp: 0,
    rank: 0,
    rarityTier,
    sockets: [],
    modifierDomain: "pet",
  };
}
export function makeFacet(key, level = 1, rarityTier = 0) {
  return { key, level, xp: 0, rarityTier };
}
export function facetRarity(a) {
  return rarity(a.level);
}
export function facetScale(a) {
  return (1 + (a.level - 1) * 0.04) * (1 + facetRarity(a) * 0.12);
}
export function facetXpNeeded(a) {
  return 35 + a.level * 15;
}
export function gainFacetXp(a, xp) {
  a.xp += xp;
  while (a.level < 100 && a.xp >= facetXpNeeded(a)) {
    a.xp -= facetXpNeeded(a);
    a.level++;
  }
  if (a.level >= 100) a.xp = 0;
}
export function hasAttribute(h, key) {
  return h.attributes.some((a) => a.key === key);
}
export function attributeInfo(a) {
  if (a.key.startsWith("race:")) {
    const r = RACES[a.key.slice(5)];
    return {
      name: r.passive,
      text: r.text + " · potency improves with level.",
      kind: "Racial attribute",
    };
  }
  if (a.key.startsWith("training:")) {
    const k = a.key.slice(9);
    return {
      name: k[0].toUpperCase() + k.slice(1) + " training",
      text:
        "+" +
        trainingBonus(a) +
        " " +
        k +
        " from " +
        a.level +
        " training sessions.",
      kind: "Training attribute",
    };
  }
  if (a.key.startsWith("lineage:"))
    return {
      name: a.name || a.key.slice(8),
      text: a.text || "A transformed racial lineage.",
      kind: "Lineage attribute",
    };
  return {
    name: ATTRIBUTES[a.key]?.profession
      ? a.key +
        " " +
        ["I", "II", "III"][Math.min(2, Math.floor((a.level - 1) / 20))]
      : a.key,
    text: ATTRIBUTES[a.key]?.text || "",
    kind: ATTRIBUTES[a.key]?.profession ? "Profession" : "Attribute",
  };
}
export function trainingBonus(a) {
  return Math.round(3 * a.level * (1 + facetRarity(a) * 0.12));
}
export function characterAttributes(h) {
  const list = h.attributes.map((a) => ({ ...a, ...attributeInfo(a) }));
  for (const i of h.items.filter(Boolean)) {
    const d = itemInfo(i);
    if (d.flying || d.slow || d.splash || d.regen || d.cooldown)
      list.push({
        ...i,
        name: d.name,
        text: d.desc,
        kind: "Equipment attribute",
      });
  }
  return list;
}
export function dialogue(h, context = "camp", tick = 0) {
  const lines =
    context === "battle"
      ? [
          "Stay close.",
          "This one is ours!",
          "A little help?",
          "We get home together.",
        ]
      : [
          "Save me a seat.",
          "What is past the trees?",
          "Time to sharpen my gear.",
          "Good to see you.",
          "I remembered the way.",
        ];
  return lines[(h.appearance.crest + Math.floor(tick)) % lines.length];
}
export const MAX_ABILITIES = 10,
  MAX_EQUIPMENT = 8;
const bases = {
  Human: [12, 1, 8, 8, 10, 8],
  Dwarf: [16, 3, 10, 6, 6, 12],
  Elf: [10, 1, 7, 11, 14, 7],
  Orc: [16, 2, 13, 4, 9, 11],
  Gnome: [9, 1, 6, 12, 12, 8],
  Shade: [10, 0, 8, 11, 16, 6],
  Fae: [8, 0, 5, 14, 17, 5],
  Sylph: [9, 0, 6, 12, 17, 6],
  Automaton: [17, 3, 11, 7, 6, 14],
  Nereid: [11, 1, 7, 12, 12, 9],
  Kobold: [10, 1, 9, 6, 15, 8],
  Myconid: [15, 2, 7, 10, 6, 12],
  Drakeling: [15, 2, 12, 8, 10, 10],
  Celestial: [10, 1, 6, 15, 11, 8],
  Zombie: [17, 1, 9, 4, 5, 12],
  Vampire: [12, 1, 10, 13, 13, 8],
  Ent: [20, 4, 12, 7, 4, 15],
};
const modifiers = {
  vanguard: { vitality: 3, strength: 5 },
  guardian: { vitality: 6, armor: 3 },
  ranger: { strength: 4, agility: 3 },
  healer: { mind: 6, endurance: 2 },
  engineer: { mind: 3, endurance: 4 },
  assassin: { strength: 3, agility: 5 },
  summoner: { mind: 7 },
  mage: { mind: 7 },
  bard: { mind: 4, endurance: 3 },
  artillery: { strength: 7 },
  envoy: { mind: 6 },
  trapper: { agility: 4, strength: 3 },
  minelayer: { strength: 4, endurance: 3 },
  alchemist: { strength: 4, mind: 3 },
  druid: { mind: 5, vitality: 2 },
  paladin: { armor: 3, mind: 3 },
  necromancer: { mind: 7 },
  psion: { mind: 7 },
  duelist: { strength: 5, agility: 3 },
  witch: { mind: 7 },
  stormcaller: { mind: 7 },
};
function growthTable(growth) {
  return [1, 20, 40, 60].map((from, i) => ({
    from,
    values: Object.fromEntries(
      CORE_STATS.map((k) => [k, (growth[k] || 0) * (1 + i * 0.22)]),
    ),
  }));
}
for (const [id, r] of Object.entries(RACES)) {
  r.base = Object.fromEntries(CORE_STATS.map((k, i) => [k, bases[id][i]]));
  r.passive = r.text.split(" · ")[0];
  r.growthTable = growthTable({
    vitality: 0.19 + r.base.vitality * 0.008,
    armor: 0.1 + r.base.armor * 0.006,
    strength: 0.08 + r.base.strength * 0.012,
    mind: 0.08 + r.base.mind * 0.012,
    agility: 0.06 + r.base.agility * 0.006,
    endurance: 0.1 + r.base.endurance * 0.009,
  });
}
for (const [id, c] of Object.entries(CLASSES)) {
  c.base = modifiers[id];
  c.attributes = [];
  c.growthTable = growthTable(
    Object.fromEntries(Object.entries(c.base).map(([k, v]) => [k, v * 0.095])),
  );
}
RACES.Dwarf.text = "Stoneborn · resists knockback";
RACES.Automaton.text = "Alloy body · 40% heavier";
RACES.Myconid.text = "Spore shelter · nearby allies regenerate 1 HP per second";
const startingLayouts = {
  vanguard: [slot("Weapon", "weapon"), body(), slot("Boots", "feet")],
  guardian: [
    slot("Weapon", "weapon"),
    slot("Shield", "offhand"),
    body(),
    charm(),
  ],
  ranger: [
    slot("Weapon", "weapon"),
    slot("Quiver", "offhand"),
    slot("Boots", "feet"),
  ],
  healer: [focus(), body()],
  engineer: [slot("Weapon", "weapon"), body(), tool(), tool()],
  assassin: [slot("Main hand", "weapon"), slot("Off hand", "weapon")],
  summoner: [focus()],
  mage: [focus()],
  bard: [tool(), body()],
  artillery: [slot("Weapon", "weapon"), body(), tool()],
  envoy: [focus()],
  trapper: [slot("Weapon", "weapon"), slot("Quiver", "offhand"), tool()],
  minelayer: [slot("Weapon", "weapon"), tool(), body()],
  alchemist: [tool(), body()],
  druid: [focus(), body()],
  paladin: [
    slot("Weapon", "weapon"),
    slot("Shield", "offhand"),
    body(),
    charm(),
  ],
  necromancer: [focus()],
  psion: [focus()],
  duelist: [slot("Main hand", "weapon"), slot("Off hand", "weapon")],
};
for (const [id, c] of Object.entries(CLASSES))
  c.slots = startingLayouts[id] || startingLayouts.mage;
Object.assign(ITEMS, {
  pendant: {
    name: "Traveler’s pendant",
    icon: "leaf",
    desc: "+2 Vitality and +2 Endurance.",
    vitality: 2,
    endurance: 2,
    type: "charm",
    price: 30,
  },
  kit: {
    name: "Field kit",
    icon: "gear",
    desc: "+3 Endurance. A dependable tool for fieldwork.",
    endurance: 3,
    type: "tool",
    price: 28,
  },
});
const itemNames = {
  longbow: "Farwood bow",
  wings: "Mothwing cloak",
  boots: "Trail boots",
  aegis: "Warden shield",
  dagger: "Traveler’s dagger",
  hammer: "Ironleaf hammer",
  cannon: "Field cannon",
  robe: "Apprentice robe",
  lute: "Pilgrim chimes",
  spring: "Clockwork coil",
};
for (const [key, name] of Object.entries(itemNames)) ITEMS[key].name = name;
ITEMS.lute.regen = 0;
ITEMS.lute.desc = "+3 Mind. An instrument for support abilities.";
ATTRIBUTES.Volunteer.text = "Joined the company from the volunteer list.";
ATTRIBUTES.Converted.text =
  "An opposing companion who chose to join your company.";
ATTRIBUTE_BONUSES.Converted = {};
export const EQUIPMENT_TYPES = {
  weapon: "Physical damage, reach, and knockback.",
  focus: "Mind, magic, and elemental effects.",
  body: "Health and damage protection.",
  offhand: "Defense, ranged support, or spell support.",
  feet: "Movement, Agility, and Endurance.",
  tool: "Stamina, fieldwork, or ability recharge.",
  charm: "Utility, recovery, and special passives.",
};
let serial = 0;
const seenNames = new Set();
export function uid(prefix = "hero") {
  return `${prefix}-${Date.now().toString(36)}-${++serial}-${Math.floor(Math.random() * 0xffffff).toString(36)}`;
}
const pick = (array, random) => array[Math.floor(random() * array.length)];
const starts = [
  "Ae",
  "Al",
  "Ar",
  "Bel",
  "Ca",
  "Cel",
  "Da",
  "El",
  "Fa",
  "Fi",
  "Ga",
  "Io",
  "Ja",
  "Ka",
  "La",
  "Li",
  "Ma",
  "Na",
  "No",
  "Or",
  "Pa",
  "Ra",
  "Sa",
  "Se",
  "Ta",
  "Va",
  "Ve",
  "Wi",
  "Xa",
  "Ze",
];
const middles = [
  "",
  "la",
  "ri",
  "lo",
  "na",
  "vi",
  "en",
  "mi",
  "ro",
  "sa",
  "ae",
  "ti",
  "da",
  "ra",
  "qui",
  "le",
  "ni",
  "ven",
  "sha",
  "li",
];
const ends = [
  "n",
  "ra",
  "en",
  "a",
  "is",
  "o",
  "el",
  "ia",
  "an",
  "yn",
  "in",
  "or",
  "as",
  "elle",
  "us",
  "eth",
  "ya",
  "iel",
];
const familyA = [
  "Dew",
  "Sky",
  "Cloud",
  "Glass",
  "Moon",
  "Sun",
  "Fern",
  "Tide",
  "Star",
  "Moss",
  "Rain",
  "Prism",
  "Ripple",
  "Silver",
  "Bright",
  "Aqua",
  "Bloom",
  "River",
  "Mist",
  "Glow",
];
const familyB = [
  "song",
  "brook",
  "fall",
  "crest",
  "vale",
  "stone",
  "glade",
  "leaf",
  "wind",
  "lark",
  "bell",
  "spark",
  "shore",
  "light",
  "well",
  "bloom",
  "whisper",
  "shade",
  "spring",
  "wave",
];
export function generatedName(random = Math.random, reserve = true) {
  let n;
  for (let tries = 0; tries < 100; tries++) {
    n =
      pick(starts, random) +
      pick(middles, random) +
      pick(ends, random) +
      " " +
      pick(familyA, random) +
      pick(familyB, random);
    if (!reserve || !seenNames.has(n)) {
      if (reserve) seenNames.add(n);
      return n;
    }
  }
  return n + " " + ++serial;
}
export function makeItem(key, level = 1, rarityTier = 0) {
  if (!ITEMS[key]) throw Error("Unknown item");
  return {
    id: uid("item"),
    key,
    level: Math.max(1, level),
    xp: 0,
    rank: 0,
    rarityTier,
    ...(ITEMS[key].type === "armor"
      ? { modifierDomain: "armor", armorWeight: ITEMS[key].weight }
      : {}),
  };
}
export function itemXpNeeded(level) {
  return 35 + level * 10;
}
export function itemRarity(i) {
  return i?.mythical ? 4 : rarity(i?.level || 1);
}
export function itemInfo(item) {
  const key = typeof item === "string" ? item : item?.key,
    base = ITEMS[key];
  if (!base) return null;
  const level = typeof item === "string" ? 1 : item.level || 1,
    tier = itemRarity(item),
    scale =
      (1 + (level - 1) * 0.035) *
      (1 + (item.rank || 0) * 0.2) *
      (1 + [0, 0.12, 0.28, 0.48, 0.75][tier]),
    out = {
      ...base,
      name:
        typeof item === "string" ? base.name : evolutionName(item, "weapon"),
      improveLevel: item.rank || 0,
      rarityTier: tier,
      scale,
    };
  for (const mod of objectModifiers(
    item,
    base.type === "armor" ? "armor" : "weapon",
  )) {
    for (const k of [
      ...CORE_STATS,
      "attack",
      "hp",
      "speed",
      "knock",
      "range",
      "splash",
    ])
      out[k] = (out[k] || 0) + (mod[k] || 0);
    for (const k of [
      "element",
      "slow",
      "ranged",
      "scatter",
      "chain",
      "flying",
      "wingType",
    ])
      if (mod[k]) out[k] = mod[k];
    if (mod.kind === "enchantment") {
      out.spell = mod.spell;
      out.enchantment = mod.key;
      out.spellCooldown = mod.cooldown;
      out.spellPower = mod.power;
    }
    if (mod.dodge) out.dodge = (out.dodge || 0) + mod.dodge;
    if (mod.force) out.force = (out.force || 1) * mod.force;
    if (mod.color) out.aura = mod.color;
  }
  for (const k of [
    ...CORE_STATS,
    "attack",
    "hp",
    "speed",
    "regen",
    "knock",
    "range",
    "splash",
  ])
    if (out[k]) out[k] *= scale;
  out.desc =
    base.desc +
    " " +
    objectModifiers(item, base.type === "armor" ? "armor" : "weapon")
      .map((m) => m.text)
      .join(" ");
  return out;
}
export function gainItemXp(item, amount) {
  item.totalXp = (item.totalXp || 0) + Math.round(amount);
  item.xp = (item.xp || 0) + Math.round(amount);
  let levels = 0;
  while (item.level < 100 && item.xp >= itemXpNeeded(item.level)) {
    item.xp -= itemXpNeeded(item.level);
    item.level++;
    levels++;
  }
  if (item.level >= 100) item.xp = 0;
  return levels;
}
function starterKey(h, def) {
  if (def.types.includes("mining")) return "pickaxe";
  if (def.types.includes("woodcutting")) return "axe";
  if (def.types.includes("weapon") && CLASSES[h.classId].starter)
    return CLASSES[h.classId].starter;
  if (def.types.includes("weapon"))
    return h.classId === "ranger" || h.classId === "trapper"
      ? "longbow"
      : h.classId === "assassin" || h.classId === "duelist"
        ? "dagger"
        : h.classId === "artillery"
          ? "cannon"
          : h.classId === "engineer" || h.classId === "minelayer"
            ? "hammer"
            : "ironblade";
  if (def.types.includes("focus")) return "lens";
  if (def.types.includes("body"))
    return CLASSES[h.classId].magical ? "robe" : "ward";
  if (def.types.includes("offhand"))
    return h.classId === "ranger" || h.classId === "trapper"
      ? "quiver"
      : "aegis";
  if (def.types.includes("feet")) return "boots";
  if (def.types.includes("tool")) return h.classId === "bard" ? "lute" : "kit";
  return "pendant";
}
export function generateHero(options = {}, random = Math.random) {
  const playable = PLAYABLE_CLASSES,
    race = options.race || pick(PLAYABLE_RACES, random),
    classId = options.classId || pick(playable, random);
  const h = {
    schema: 7,
    id: uid(),
    name:
      options.name || generatedName(random, !options.id?.startsWith("foe-")),
    race,
    classId,
    level: 1,
    xp: 0,
    items: [],
    extraSlots: [],
    deployed: true,
    fusion: [],
    talents: [],
    armor: [],
    classPath: null,
    classNodes: [],
    attributes: [],
    training: {},
    bonus: {},
    tier: 0,
    specialization: null,
    lineage: null,
    currentHp: null,
    battles: 0,
    rarityTier: 0,
    appearance: {
      hue: Math.floor(random() * 360),
      hair: Math.floor(random() * 6),
      crest: Math.floor(random() * 5),
      eyes: Math.floor(random() * 5),
      idle: Math.floor(random() * 500),
    },
    favorite: false,
    // Inert legacy fields remain readable in version-12 backups.
    bonds: {},
    journal: [],
    transformations: [],
    ...options,
  };
  if (h.light === undefined) h.light = makeItem("hooded-lantern");
  h.totalXp ??= 0;
  h.skills ||= {};
  h.companion ||= null;
  h.cosmetic ||= null;
  h.attributes = h.attributes.map((a) =>
    typeof a === "string" ? makeFacet(a) : a,
  );
  if (!h.attributes.some((a) => a.key === "race:" + h.race))
    h.attributes.unshift(makeFacet("race:" + h.race));
  h.skills["class:" + h.classId] ||= makeFacet("class:" + h.classId);
  h.uncharmable ||= !!RACES[h.race].uncharmable;
  h.items = options.items
    ? options.items.map((i) => (typeof i === "string" ? makeItem(i) : i))
    : equipmentSlots(h).map((def) => makeItem(starterKey(h, def)));
  if (options.id?.startsWith("foe-"))
    h.items.forEach((item, i) => {
      item.id = h.id + "-gear-" + i;
    });
  if (options.id?.startsWith("foe-") && h.light) h.light.id = h.id + "-light";
  h.appearance.height ??= 0.92 + random() * 0.16;
  h.appearance.width ??= 0.9 + random() * 0.2;
  h.appearance.crown ??= Math.floor(random() * 4);
  if (!options.armor)
    h.armor = armorSlots(h).map((slot) =>
      slot.allowed ? makeItem(starterArmor(h, slot.key)) : null,
    );
  return h;
}
export function makeHero(index = 0, options = {}) {
  const base = HEROES[index] || HEROES[0];
  return generateHero({
    race: base.race,
    classId: base.classId,
    template: index,
    ...options,
  });
}
export function school(h) {
  return (
    SCHOOLS[h.classId]?.find(
      (s) => s.id === (h.classPath || h.specialization),
    ) || null
  );
}
export function lineage(h) {
  return LINEAGES[h.race]?.find((s) => s.id === h.lineage) || null;
}
export function className(h) {
  const advanced = (h.classNodes || []).find((n) =>
    /:(surge|shelter)$/.test(n),
  );
  return advanced
    ? school(h)?.name + (advanced.endsWith(":surge") ? " Ascendant" : " Warden")
    : school(h)?.name || CLASSES[h.classId].label;
}
export function combatClass(h) {
  const id = h.classId;
  if (id === "minelayer") return "minelayer";
  return CLASSES[id].recipe || id;
}
export function schoolCombatClass(h) {
  const path = h.classPath || h.specialization;
  if (h.classId === "mage" && path === "hex") return "witch";
  if (h.classId === "mage" && path === "storm") return "stormcaller";
  return combatClass(h);
}
export function abilityName(h) {
  return (
    school(h)?.ability ||
    (school(h)
      ? school(h).name + " · " + CLASSES[h.classId].ability
      : CLASSES[h.classId].ability)
  );
}
export function equipmentSlots(h) {
  return [
    ...CLASSES[h.classId].slots,
    ...(h.extraSlots || []),
    ...gatheringFacets(h)
      .filter((t) => TALENTS[t.key]?.slot)
      .map((t) => ({
        label: TALENTS[t.key].name,
        types: [TALENTS[t.key].slot],
        talent: t.key,
      })),
  ].slice(0, MAX_EQUIPMENT);
}
export function abilities(h) {
  const result = [
    {
      id: "class:" + h.classId,
      name: CLASSES[h.classId].ability,
      text: CLASSES[h.classId].abilityText,
    },
  ];
  if (school(h)) {
    result[0].name = abilityName(h);
    result[0].text = school(h).text;
  }
  for (const f of h.fusion || [])
    result.push({
      id: "learned:" + f.classId,
      name: CLASSES[f.classId].ability,
      text: "Inherited from " + f.name + ". Cast at 60% power.",
    });
  for (const item of spellObjects(h)) {
    const d = spellObjectInfo(item);
    if (d.spell)
      result.push({
        id: "scroll:" + item.id,
        name: d.enchantment
          ? modifierPool(item)["enchantment"][d.enchantment].name
          : d.name,
        text: d.enchantment
          ? modifierPool(item)["enchantment"][d.enchantment].text
          : d.desc,
        scroll: item,
        spell: d.spell,
      });
  }
  return result.map((a) => ({
    ...a,
    kind: "Active",
    ...(h.skills?.[a.id] ||
      (a.scroll
        ? {
            key: a.id,
            level: a.scroll.level,
            xp: a.scroll.xp,
            rarityTier: itemRarity(a.scroll),
          }
        : makeFacet(a.id))),
  }));
}
export function abilityScale(h, id) {
  return facetScale(h.skills?.[id] || makeFacet(id));
}
export function rarity(level) {
  return level >= 60 ? 3 : level >= 40 ? 2 : level >= 20 ? 1 : 0;
}
export function heroRarity(h) {
  return h.boss ? 2 : h.mythical ? 4 : rarity(h.level);
}
export function xpNeeded(level) {
  return 100 + level * 24;
}
export function growthFor(table, level) {
  return [...table].reverse().find((row) => level >= row.from).values;
}
export function baseStats(h, level = h.level) {
  const r = RACES[h.race],
    c = CLASSES[h.classId],
    core = Object.fromEntries(
      CORE_STATS.map((k) => [k, (r.base[k] || 0) + (c.base[k] || 0)]),
    );
  for (let lv = 2; lv <= level; lv++) {
    const a = growthFor(r.growthTable, lv),
      b = growthFor(c.growthTable, lv);
    for (const k of CORE_STATS) core[k] += a[k] + b[k];
  }
  return Object.fromEntries(
    CORE_STATS.map((k) => [k, Math.round(core[k] * 100) / 100]),
  );
}
export function stats(h) {
  const c = CLASSES[h.classId],
    race = RACES[h.race],
    core = baseStats(h),
    apply = (source) => {
      for (const k of CORE_STATS) core[k] += source?.[k] || 0;
    };
  apply(h.bonus);
  apply(h.runBuff);
  if (h.companion) apply(petInfo(h.companion));
  if (h.companion)
    for (const gem of (h.companion.sockets || []).filter(Boolean))
      apply({ [GEM_KINDS[gem.kind]?.stat]: GEM_SIZES[gem.size]?.value || 0 });
  apply(school(h)?.bonus);
  apply(classEffects(h).bonus);
  const lineageScale = facetScale(
    h.attributes.find((a) => a.key === "lineage:" + h.lineage) ||
      makeFacet("lineage"),
  );
  apply(
    Object.fromEntries(
      Object.entries(lineage(h)?.bonus || {}).map(([k, v]) => [
        k,
        v * lineageScale,
      ]),
    ),
  );
  for (const i of allGear(h)) apply(itemInfo(i));
  for (const t of h.talents || [])
    if (t.key.startsWith("training:"))
      apply({ [t.key.slice(9)]: trainingBonus(t) });
  for (const a of h.attributes || []) {
    if (a.key.startsWith("training:"))
      apply({ [a.key.slice(9)]: trainingBonus(a) });
    else if (ATTRIBUTE_BONUSES[a.key])
      apply(
        Object.fromEntries(
          Object.entries(ATTRIBUTE_BONUSES[a.key]).map(([k, v]) => [
            k,
            v * facetScale(a),
          ]),
        ),
      );
  }
  for (const k of CORE_STATS)
    core[k] = Math.max(
      k === "armor" ? 0 : 1,
      Math.round(core[k] * (1 + (h.rarityTier || 0) * 0.025) * 100) / 100,
    );
  const racial = h.attributes.find((a) => a.key === "race:" + h.race),
    rs = racial ? facetScale(racial) : 1,
    raceEffects = { ...race };
  for (const k of ["regenSelf", "regen", "attack", "speed", "range", "dodge"])
    if (raceEffects[k]) raceEffects[k] *= rs;
  for (const k of ["mass", "force", "healing"])
    if (raceEffects[k]) raceEffects[k] = 1 + (raceEffects[k] - 1) * rs;
  if (raceEffects.cooldown)
    raceEffects.cooldown = Math.max(0.5, 1 - (1 - raceEffects.cooldown) * rs);
  const magical =
      c.magical &&
      !(h.classId === "bard" && (h.classPath || h.specialization) === "skald"),
    s = {
      ...core,
      hp: core.vitality * 10,
      attack: Math.round(magical ? core.mind * 1.2 : core.strength * 1.4),
      speed: Math.round(Math.max(20, 21 + core.agility * 2.2)),
      range: c.range + (school(h)?.range || 0),
      rate: c.rate / (1 + Math.max(0, core.agility - 10) * 0.012),
      cooldown: c.cooldown / (1 + core.endurance * 0.008),
      mass: 1 + core.endurance * 0.016,
      force: 1,
      healing: 1 + core.mind * 0.013,
      dodge: 0,
      flying: false,
      ranged: c.range > 80,
      regen: 0,
      regenSelf: raceEffects.regenSelf || 0,
      knock: 0,
      splash: 0,
      element: null,
      scatter: 1,
      chain: false,
      slow: false,
      slowDuration: 2,
      magical,
      maxStamina: 35 + core.endurance * 3,
      maxMana: 45 + core.mind * 1.6,
      power: 1,
    };
  if (PETS[h.companion?.key]?.mode === "mount") {
    s.speed += 18;
    s.mass *= 1.35;
  }
  for (const source of [
    raceEffects,
    h.bonus,
    ...allGear(h).map(itemInfo),
    h.companion ? petInfo(h.companion) : null,
    ...h.attributes.map((a) => ATTRIBUTES[a.key]),
  ]) {
    for (const k of ["hp", "attack", "speed", "regen", "knock", "splash"])
      s[k] += source?.[k] || 0;
    if (source?.range && (s.ranged || source.ranged)) s.range += source.range;
    for (const k of ["mass", "force", "healing"]) s[k] *= source?.[k] || 1;
    if (source?.cooldown) s.cooldown *= source.cooldown;
    if (source?.flying) s.flying = true;
    if (source?.ranged) s.ranged = true;
    if (source?.slow) {
      s.slow = true;
      s.slowDuration = 2 + (source.improveLevel || 0) * 0.4;
    }
    if (source?.dodge) s.dodge += source.dodge;
    if (source?.element) s.element = source.element;
    if (source?.scatter) s.scatter = Math.max(s.scatter, source.scatter);
    if (source?.chain) s.chain = true;
  }
  const fx = classEffects(h);
  s.power = fx.power;
  s.cooldown *= fx.cooldown;
  s.range += fx.range;
  s.summonCount = fx.summonCount;
  s.zoneScale = fx.zoneScale;
  s.charmThreshold = fx.charmThreshold;
  s.shieldScale = fx.shieldScale;
  if (h.classId === "bard" && (h.classPath || h.specialization) === "skald") {
    s.ranged = false;
    s.range = 45;
    s.rate *= 0.8;
  }
  if (hasAttribute(h, "Zombie")) {
    s.speed *= 0.72;
    s.regenSelf +=
      0.45 * facetScale(h.attributes.find((a) => a.key === "Zombie"));
    s.mass *= 1.25;
  }
  for (const k of ["hp", "attack", "speed", "range", "maxMana"])
    s[k] = Math.round(s[k]);
  return s;
}
export function gainXp(h, amount) {
  const xp = Math.round(amount * (RACES[h.race].xp || 1));
  h.totalXp = (h.totalXp || 0) + xp;
  h.xp += xp;
  for (const item of allGear(h))
    gainItemXp(item, Math.max(1, Math.round(amount * 0.65)));
  if (h.companion) gainItemXp(h.companion, Math.round(amount * 0.7));
  for (const a of h.attributes)
    if (!a.key.startsWith("training:"))
      gainFacetXp(a, Math.max(1, Math.round(amount * 0.25)));
  let levels = 0;
  while (h.level < 100 && h.xp >= xpNeeded(h.level)) {
    h.xp -= xpNeeded(h.level);
    h.level++;
    levels++;
  }
  if (h.level >= 100) h.xp = 0;
  if (levels) {
    h.currentHp = stats(h).hp;
  }
  return levels;
}
export function encounterFor(r) {
  const wave = r.stage + 1,
    l = LOCATIONS[r.location],
    road = r.roadItinerary?.[r.stage],
    mini = r.mode === "journey" && road?.champion === "miniboss",
    boss =
      r.mode === "arena"
        ? false
        : r.mode === "island"
          ? !!road?.boss
          : r.mode === "journey"
            ? !!((r.destinationBoss && wave === r.encounters) || mini)
            : wave === r.encounters || wave % 4 === 0;
  return {
    name:
      r.mode === "arena"
        ? "The four banners"
        : l.name + " · Encounter " + wave + " / " + r.encounters,
    biome: road?.water ? "river" : l.biome,
    kind: mini ? "Mini-boss encounter" : boss ? "Boss encounter" : "Encounter",
    boss,
    mini,
    subtitle: mini
      ? "A Rare road guardian challenges your company."
      : boss
        ? "A Rare champion bars the road."
        : "One more step into a larger world.",
  };
}
function seededLocal(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function enemyCompany(stage = 0, run = null) {
  const r = run || {
      stage,
      location: "greenway",
      difficulty: "normal",
      seed: 1,
      level: 1,
      encounters: 3,
    },
    random = seededLocal(r.seed + stage * 997),
    l = LOCATIONS[r.location],
    enc = encounterFor({ ...r, stage }),
    count =
      r.mode === "arena"
        ? 3
        : Math.min(8, 2 + Math.floor((r.level || 1) / 8) + (stage > 2 ? 1 : 0)),
    base = Math.max(1, Math.round((r.level || 1) + stage * 0.35)),
    baseDifficulty = DIFFICULTIES[r.difficulty] || DIFFICULTIES.normal,
    d = {
      ...baseDifficulty,
      health: baseDifficulty.health * (r.routeDanger || 1) * 0.85,
      damage: baseDifficulty.damage * (r.routeDanger || 1),
    };
  return Array.from({ length: count }, (_, i) => {
    const boss = i === 0 && enc.boss,
      roll = random(),
      rarityTier = boss ? 2 : roll < 0.78 ? 0 : roll < 0.95 ? 1 : 2;
    const classId =
      i === 0 && count === 2
        ? l.classes.find(
            (k) => !["druid", "healer", "bard", "necromancer"].includes(k),
          )
        : pick(l.classes, random);
    const early =
      r.location === "greenway" &&
      ((r.mode === "journey" && r.target === "clearing") ||
        (r.mode === "campaign" && r.node === 0));
    const race = pick(early ? ["Elf", "Myconoid"] : l.races, random);
    const h = generateHero(
      {
        id: `foe-${r.id || r.seed}-${stage}-${i}`,
        race,
        classId,
        level: Math.min(100, base),
        boss,
        rarityTier: early ? 0 : rarityTier,
      },
      random,
    );
    if (early) h.armor = [null, h.armor[1], null];
    h.bonus.damageScale = d.damage * (early ? 0.5 : 1);
    if (l.attributes && random() < 0.65)
      h.attributes.push(makeFacet(l.attributes[0]));
    if (r.location === "jungle") {
      h.creature =
        boss && !enc.mini
          ? "tyrant"
          : ["raptor", "triceratops", "pterosaur"][Math.floor(random() * 3)];
      if (h.creature === "pterosaur") h.bonus.flying = true;
      h.name = {
        raptor: "Fernveil raptor",
        triceratops: "Amberhorn triceratops",
        pterosaur: "Canopy pterosaur",
        tyrant: "The ancient tyrant",
      }[h.creature];
      h.uncharmable = true;
      h.bonus.vitality =
        h.creature === "tyrant" ? 18 : h.creature === "triceratops" ? 8 : 2;
      h.bonus.strength = h.creature === "tyrant" ? 10 : 3;
    }
    if (
      r.location === "volcano" &&
      r.target === "caldera" &&
      boss &&
      !enc.mini
    ) {
      h.creature = "dragon";
      h.name = "Emberpeak dragon";
      h.uncharmable = true;
      h.bonus.vitality = 24;
      h.bonus.strength = 12;
      h.bonus.flying = true;
    }
    if (boss) {
      if (r.challengeId === "boss") h.name = r.name.split(" · ")[0];
      if (enc.mini) h.name = "Guardian of " + r.roadItinerary[stage].to;
      h.bonus.hp = (h.bonus.hp || 0) + 45 + stage * 4;
      h.bonus.strength = (h.bonus.strength || 0) + 2;
    }
    h.bonus.hp = (h.bonus.hp || 0) + Math.round(stats(h).hp * (d.health - 1));
    if (early) h.bonus.hp -= Math.round(stats(h).hp * 0.12);
    return h;
  });
}
export function initialGame(random = Math.random, now = Date.now()) {
  const roster = [
    ["Human", "vanguard"],
    ["Elf", "ranger"],
    ["Nereid", "healer"],
  ].map(([race, classId]) => generateHero({ race, classId, level: 5 }, random));
  for (const h of roster) {
    h.currentHp = stats(h).hp;
  }
  return {
    version: 12,
    season: GAME_SEASON,
    evernightRevision: 1,
    campXp: 0,
    campXpLedger: {},
    campXpSources: {},
    worldDifficulty: "normal",
    mealAt: now,
    mealsServed: 0,
    settings: { tutorial: true, reducedMotion: false },
    storyPage: 0,
    tutorialStep: 0,
    questPins: [],
    questSort: "progress",
    guildStanding: {},
    guildPurchases: [],
    arenaWager: { gold: 10, resource: null, amount: 0 },
    waitingRecruits: [],
    challengeTiers: {},
    campWorldRevision: 1,
    campExpansions: [],
    campZone: "center",
    farmReadyAt: 0,
    gemShopPurchases: [],
    challengeWins: {},
    marketEpoch: Math.floor(now / 43200000),
    regionBossClears: {},
    portalUnlocked: false,
    lockedJourney: null,
    marketParty: [],
    mapPositions: { camp: {}, market: {} },
    exploration: { greenway: ["camp"] },
    regionUnlocks: ["greenway"],
    journeyClears: {},
    questClaims: [],
    sideQuests: ["settle-in", "stock-pantry"],
    questContracts: [],
    serviceCounts: { foodBought: 0, cooked: 0, crafted: 0, guildLessons: 0 },
    visitorReceipts: [],
    visitors: [],
    marketDistrict: "square",
    islandFloor: 0,
    equipmentSeen: {},
    nightfallRevision: 1,
    trackedQuest: "first-road",
    eggs: 0,
    campName: "",
    campNamed: false,
    buildings: {
      market: 0,
      guildhall: 0,
      tavern: 0,
      clinic: 0,
      questboard: 1,
      cabins: 0,
      bonfire: 1,
      crossroads: 1,
      tent: 1,
      storage: 1,
      pantry: 0,
      training: 0,
      blacksmith: 0,
      archaeology: 0,
      armory: 0,
      dock: 0,
      kitchen: 0,
      alchemist: 0,
    },
    materials: {
      wood: 0,
      stone: 0,
      ore: 0,
      herbs: 0,
      meat: 0,
      obsidian: 0,
      relic: 0,
      fossils: 0,
      hide: 0,
      bossSigils: 0,
    },
    food: 6,
    gemstones: [],
    calendarClaims: {},
    calendarBonuses: {},
    branchClears: {},
    packed: [],
    challengeReceipts: [],
    challengeDeposits: {},
    screen: "camp",
    gold: 30,
    gems: 0,
    roster,
    inventory: [],
    companions: [],
    scrolls: [],
    recipes: [...PLAYABLE_RACES],
    cosmetics: [],
    consumables: {
      ration: 1,
      might: 0,
      warding: 0,
      luck: 0,
      treat: 0,
      helper: 0,
    },
    essences: {},
    staging: [],
    location: "greenway",
    destination: {
      mode: "journey",
      location: "greenway",
      target: "clearing",
      routeIndex: 0,
      difficulty: "normal",
    },
    campaign: { greenway: 0, marsh: 0, volcano: 0, cinder: 0, jungle: 0 },
    eventClaims: {},
    arenaWins: 0,
    expeditions: [],
    expeditionCount: 0,
    lifetimeEncounters: 0,
    bestEncounter: 0,
    firstExpedition: true,
    selectedExpedition: null,
    market: {},
    lastClock: now,
    notifications: [],
  };
}

// Camp resources and equipment all use the same public definitions as the simulation.
export const GEM_KINDS = {
  ruby: { name: "Ruby", color: "#c75b69", stat: "strength" },
  sapphire: { name: "Sapphire", color: "#648ec7", stat: "mind" },
  emerald: { name: "Emerald", color: "#61a782", stat: "vitality" },
};
export const GEM_SIZES = [
  { name: "Chipped", value: 1 },
  { name: "Cut", value: 3 },
  { name: "Flawless", value: 9 },
  { name: "Royal", value: 27 },
];
export function makeGem(kind = "ruby", size = 0) {
  return { id: uid("gem"), kind, size };
}
export function gemValue(gem) {
  return GEM_SIZES[gem.size]?.value || 0;
}
export function companionSlots(pet) {
  return Math.max(0, Math.min(3, itemRarity(pet) - 1));
}
export function equipmentRestriction(h, item, slotIndex = -1) {
  const d = ITEMS[item.key],
    slotDef = equipmentSlots(h)[slotIndex];
  if (
    d.weaponKind &&
    slotDef?.weaponKinds &&
    !slotDef.weaponKinds.includes(d.weaponKind)
  )
    return (
      "Requires " +
      slotDef.label +
      " (" +
      slotDef.weaponKinds.map((k) => WEAPON_KINDS[k]).join(", ") +
      ")"
    );
  if (d.onlyClasses && !d.onlyClasses.includes(h.classId))
    return "Only " + d.onlyClasses.map((k) => CLASSES[k].label).join(", ");
  if (d.magicalOnly && !CLASSES[h.classId].magical) return "Magic classes only";
  if (d.minStrength) {
    const copy = {
      ...h,
      items: h.items.map((v, i) => (i === slotIndex ? null : v)),
    };
    if (stats(copy).strength < d.minStrength)
      return "Requires " + d.minStrength + " Strength";
  }
  if (
    itemInfo(item).spell &&
    !allGear(h).some((i) => i?.id === item.id) &&
    abilities({
      ...h,
      items: h.items.map((v, i) => (i === slotIndex ? null : v)),
    }).length >= MAX_ABILITIES
  )
    return "Ten active abilities already known";
  return "";
}
Object.assign(ITEMS, {
  trailLeather: {
    name: "Patchwork trail leathers",
    icon: "shield",
    type: "body",
    price: 60,
    armor: 2,
    agility: 3,
    endurance: 2,
    desc: "+2 Armor, +3 Agility, +2 Endurance. Light stitched leather.",
  },
  scaleMail: {
    name: "Verdant scale mail",
    icon: "shield",
    type: "body",
    price: 100,
    armor: 5,
    vitality: 3,
    desc: "+5 Armor and +3 Vitality. Layered green scales.",
  },
  starRobe: {
    name: "Star-sewn robe",
    icon: "moon",
    type: "body",
    price: 125,
    mind: 6,
    endurance: 3,
    aura: "#bca8e0",
    desc: "+6 Mind and +3 Endurance. A mantle sewn with little stars.",
  },
  ironPlate: {
    name: "Citadel plate",
    icon: "shield",
    type: "body",
    price: 160,
    armor: 9,
    vitality: 4,
    minStrength: 22,
    desc: "+9 Armor and +4 Vitality. Requires 22 Strength.",
  },
  greatblade: {
    name: "Colossus greatsword",
    icon: "sword",
    type: "weapon",
    price: 150,
    attack: 20,
    knock: 55,
    minStrength: 24,
    desc: "+20 attack, +55 knockback. Requires 24 Strength.",
    aura: "#e8c380",
  },
  monkmaul: {
    name: "Quiet thunder mace",
    icon: "gear",
    type: "weapon",
    price: 115,
    strength: 7,
    knock: 38,
    onlyClasses: ["monk"],
    desc: "+7 Strength, +38 knockback. Only Monks can wield it.",
    aura: "#e0c78e",
  },
  pickaxe: {
    name: "Deepstone pickaxe",
    icon: "gear",
    type: "weapon",
    price: 45,
    strength: 4,
    endurance: 2,
    desc: "+4 Strength and +2 Endurance. A miner’s trusted pick.",
  },
  axe: {
    name: "Coppice axe",
    icon: "sword",
    type: "weapon",
    price: 45,
    strength: 5,
    desc: "+5 Strength. A woodcutter’s axe.",
  },
  salamander: {
    name: "Salamander saber",
    icon: "flame",
    type: "weapon",
    price: 125,
    attack: 9,
    splash: 24,
    aura: "#eb975f",
    element: "fire",
    desc: "+9 attack. Fire strikes scorch enemies and nearby wooden props.",
  },
  glacier: {
    name: "Glacier coat",
    icon: "snow",
    type: "body",
    price: 110,
    armor: 5,
    mind: 4,
    aura: "#93d8e2",
    desc: "+5 Armor and +4 Mind. Crystalline frost trim.",
  },
  stormbow: {
    name: "Stormthread bow",
    icon: "bolt",
    type: "weapon",
    price: 140,
    range: 75,
    attack: 6,
    ranged: true,
    aura: "#bba6ed",
    element: "storm",
    desc: "+75 reach and +6 attack. A bow laced with stormlight.",
  },
  scrollEmber: {
    name: "Scroll of cinders",
    icon: "flame",
    type: "scroll",
    price: 85,
    mind: 2,
    magicalOnly: true,
    spell: "ember",
    aura: "#ec955f",
    desc: "Adds an active Ember Curse. Costs 12 stamina; 13 second base cooldown. Magic classes only.",
  },
  scrollGravity: {
    name: "Scroll of falling stars",
    icon: "moon",
    type: "scroll",
    price: 105,
    mind: 2,
    magicalOnly: true,
    spell: "gravity",
    aura: "#baa6e8",
    desc: "Adds an active Gravity well that pulls foes together. Costs 12 stamina; 13 second base cooldown.",
  },
  scrollFrost: {
    name: "Scroll of winter",
    icon: "snow",
    type: "scroll",
    price: 90,
    mind: 2,
    magicalOnly: true,
    spell: "frost",
    aura: "#9ad5df",
    desc: "Adds an active slowing Frost Curse. Costs 12 stamina; 13 second base cooldown.",
  },
  scrollSpring: {
    name: "Scroll of renewal",
    icon: "heart",
    type: "scroll",
    price: 90,
    mind: 2,
    magicalOnly: true,
    spell: "heal",
    aura: "#a7d6a0",
    desc: "Adds an active healing Blessing. Costs 12 stamina; 13 second base cooldown.",
  },
});
ITEMS.ember.aura = "#ed9562";
ITEMS.ember.element = "fire";
ITEMS.frost.aura = "#91d5df";
ITEMS.frost.element = "frost";
ITEMS.lens.aura = "#bea7df";
ITEMS.wings.aura = "#abdabf";
ITEMS.bell.aura = "#ded19b";
EQUIPMENT_TYPES.scroll =
  "Equippable spell scrolls grant an additional automatic active ability to magic users. Unlock a Scroll slot at the Outfitter.";
for (const [id, label, mods, equipment, gather] of [
  ["miner", "Miner", { strength: 4, endurance: 4 }, "pickaxe", "stone"],
  ["lumberjack", "Lumberjack", { strength: 5, vitality: 2 }, "axe", "wood"],
  ["monk", "Monk", { strength: 4, mind: 3 }, "monkmaul", null],
]) {
  const c = (CLASSES[id] = {
    ...CLASSES.vanguard,
    label,
    role: gather ? "Gatherer" : "Frontline",
    recipe: "vanguard",
    base: mods,
    growthTable: growthTable(
      Object.fromEntries(Object.entries(mods).map(([k, v]) => [k, v * 0.095])),
    ),
    slots: [slot("Weapon", "weapon"), body(), tool()],
    magical: false,
    starter: equipment,
    gather,
    attributes: [],
    ability: gather ? "Clearing strike" : "Quiet thunder",
    abilityText: gather
      ? "Sweeps nearby foes. After each cleared encounter, gathers 3 extra " +
        gather +
        "."
      : "Strikes nearby opponents with a physical Explosion and strong knockback.",
    behavior: gather
      ? "A sturdy fighter who gathers materials after combat."
      : "A disciplined close fighter with a unique mace.",
    icon: gather ? "gear" : "bolt",
  });
  SCHOOLS[id] = [
    {
      id: "master",
      name: label + " Master",
      text: "Stronger signature strikes.",
      bonus: { strength: 6 },
      power: 1.3,
    },
    {
      id: "keeper",
      name: label + " Keeper",
      text: "Hardier fieldwork.",
      bonus: { vitality: 5, endurance: 5 },
    },
  ];
}
PETS.horse = {
  name: "Trail horse",
  icon: "paw",
  color: "#b78968",
  mode: "mount",
  price: 180,
  text: "Its owner rides into battle. +18 movement speed and 35% more mass.",
};
delete CONSUMABLES.tonic;
Object.assign(CONSUMABLES, {
  ration: {
    name: "Trail supper",
    icon: "heart",
    price: 22,
    text: "Pack for an expedition. The whole party heals an extra 12% between encounters.",
    effect: "rest",
  },
  might: {
    name: "Ironroot draught",
    icon: "sword",
    price: 35,
    text: "The whole party gains +4 Strength and +3 Mind for one expedition.",
    effect: "power",
  },
  warding: {
    name: "Barkskin flask",
    icon: "shield",
    price: 35,
    text: "The whole party gains +3 Armor and +3 Vitality for one expedition.",
    effect: "guard",
  },
  luck: {
    name: "Lucky clover potion",
    icon: "spark",
    price: 45,
    text: "Improves equipment rarity rolls and doubles gemstone discovery chance for one expedition.",
    effect: "luck",
  },
  treat: {
    name: "Companion picnic",
    icon: "paw",
    price: 30,
    text: "Every party companion gains 100 XP at departure and fights at +25% potency for one expedition.",
    effect: "pets",
  },
  helper: {
    name: "Wayfarer’s invitation",
    icon: "army",
    price: 75,
    text: "A level-matched guest Guardian joins one expedition. The guest does not become a permanent character.",
    effect: "guest",
  },
});

// Version 7: identity, specialization and learned Talents are distinct systems.
delete RACES.Vampire;
delete RACES.Zombie;
delete CLASSES.miner;
delete CLASSES.lumberjack;
delete SCHOOLS.miner;
delete SCHOOLS.lumberjack;
delete LINEAGES.Vampire;
delete LINEAGES.Zombie;
ATTRIBUTES.Vampire = {
  text: "Vampiric hunger: restores 6% of damage dealt as health. +2 Mind. Any race can be a Vampire.",
};
ATTRIBUTES.Zombie = {
  text: "Undead body: +4 Vitality, +3 Endurance, 28% slower movement, 25% heavier, and slow self-regeneration. Keeps its original race.",
};
ATTRIBUTE_BONUSES.Zombie = { vitality: 4, endurance: 3 };
export const TALENTS = {
  Miner: {
    name: "Miner",
    text: "Unlocks a Mining tool slot. With a pickaxe equipped, gathers 3 extra stone and 1 ore after every victory.",
    slot: "mining",
  },
  Lumberjack: {
    name: "Lumberjack",
    text: "Unlocks a Woodcutting tool slot. With an axe equipped, gathers 4 extra wood after every victory.",
    slot: "woodcutting",
  },
};
export function gatheringFacets(h) {
  return [...(h.talents || []), ...(h.attributes || [])].filter(
    (t, i, all) =>
      TALENTS[t.key]?.slot && all.findIndex((v) => v.key === t.key) === i,
  );
}
ATTRIBUTES.Miner = {
  profession: true,
  text: "Mining guild profession. Equip a pickaxe to gather extra stone and ore; occasionally find gems and Obsidian. Ranks I, II and III improve yields.",
};
ATTRIBUTES.Lumberjack = {
  profession: true,
  text: "Foresters guild profession. Equip an axe to gather extra wood. Ranks I, II and III improve yields.",
};
ATTRIBUTES.Hunter = {
  profession: true,
  text: "Hunters guild profession. Gather extra ingredients and occasionally hides for crafting armor. Ranks I, II and III improve yields.",
};
export function talentInfo(t) {
  if (t.key.startsWith("training:")) {
    const stat = t.key.slice(9);
    return {
      name: stat[0].toUpperCase() + stat.slice(1) + " training",
      text:
        "+" +
        trainingBonus(t) +
        " " +
        stat +
        ". Improved only by timed Training Grounds sessions.",
      kind: "Talent",
    };
  }
  return { ...TALENTS[t.key], kind: "Talent" };
}
export function allGear(h) {
  return [...(h.items || []), ...(h.armor || []), h.light].filter(Boolean);
}
export const ARMOR_WEIGHTS = {
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};
const weights = {
  guardian: "heavy",
  paladin: "heavy",
  vanguard: "heavy",
  artillery: "heavy",
  engineer: "medium",
  minelayer: "medium",
  ranger: "medium",
  trapper: "medium",
  duelist: "medium",
};
export const LEGACY_LAYOUTS = Object.fromEntries(
  Object.entries(CLASSES).map(([id, c]) => [id, structuredClone(c.slots)]),
);
for (const [id, c] of Object.entries(CLASSES)) {
  c.armorWeight = weights[id] || "light";
  c.slots = c.slots.filter((s) => !s.types.includes("body"));
}
export function armorSlots(h) {
  return ["head", "chest", "legs", "boots"].map((key) => ({
    key,
    label: { head: "Head", chest: "Chest", legs: "Legs", boots: "Boots" }[key],
    weight: CLASSES[h.classId].armorWeight,
    allowed: !(key === "head" && h.race === "Celestial"),
  }));
}
export function starterArmor(h, key) {
  return CLASSES[h.classId].armorWeight + "-" + key;
}
for (const [key, d] of Object.entries(ITEMS))
  if (d.type === "body") {
    d.type = "armor";
    d.armorSlot = "chest";
    d.weight = ["ward", "ironPlate"].includes(key)
      ? "heavy"
      : ["scaleMail", "trailLeather", "glacier"].includes(key)
        ? "medium"
        : "light";
  }
for (const [weight, bonus] of Object.entries({ light: 1, medium: 2, heavy: 3 }))
  for (const key of ["head", "chest", "legs", "boots"])
    ITEMS[weight + "-" + key] = {
      name:
        ARMOR_WEIGHTS[weight] +
        " " +
        { head: "hood", chest: "vest", legs: "greaves", boots: "boots" }[key],
      icon: "shield",
      type: "armor",
      armorSlot: key,
      weight,
      price: 25 + bonus * 12,
      armor: bonus,
      desc:
        "+" +
        bonus +
        " Armor. " +
        ARMOR_WEIGHTS[weight] +
        " " +
        key +
        " protection.",
    };
ITEMS.pickaxe.type = "mining";
ITEMS.axe.type = "woodcutting";
EQUIPMENT_TYPES.mining = "Dedicated tools unlocked by the Miner Talent.";
EQUIPMENT_TYPES.woodcutting =
  "Dedicated tools unlocked by the Lumberjack Talent.";
delete EQUIPMENT_TYPES.body;
EQUIPMENT_TYPES.armor =
  "Four separate Head, Chest, Legs and Boots slots. The class determines the allowed armor weight; Celestials cannot wear helmets.";
export function armorRestriction(h, item, index) {
  const slot = armorSlots(h)[index],
    d = ITEMS[item.key];
  if (!slot?.allowed) return "Celestials wear a crown and cannot equip helmets";
  if (d.type !== "armor" || d.armorSlot !== slot.key)
    return "Requires " + slot?.label;
  if (d.weight !== slot.weight)
    return "This class uses " + slot.weight + " armor";
  return equipmentRestriction(
    { ...h, armor: h.armor.map((v, i) => (i === index ? null : v)) },
    item,
  );
}
export const RACE_SIZES = {
  Human: [1, 1],
  Elf: [1, 0.86],
  Dwarf: [0.73, 1.3],
  Orc: [1.3, 1.35],
  Gnome: [0.68, 0.9],
  Shade: [1, 0.85],
  Fae: [0.49, 0.7],
  Sylph: [0.83, 0.78],
  Automaton: [1.1, 1.13],
  Nereid: [1, 0.9],
  Kobold: [0.68, 0.75],
  Myconid: [0.8, 1.14],
  Drakeling: [1.08, 1.08],
  Celestial: [1.16, 1],
  Ent: [1.75, 1.5],
};
export const CLASS_WIDTHS = {
  vanguard: 1.07,
  berserker: 1.16,
  guardian: 1.22,
  ranger: 0.89,
  mage: 0.93,
  healer: 0.96,
  bard: 0.96,
  rogue: 0.88,
  assassin: 0.88,
  monk: 1.02,
  paladin: 1.17,
  engineer: 1.08,
  artillery: 1.1,
  druid: 1,
  summoner: 0.95,
  necromancer: 0.92,
  psion: 0.92,
  trapper: 0.94,
  envoy: 0.96,
  witch: 0.93,
  stormcaller: 0.94,
};
export function characterSize(h) {
  if (h.creature)
    return h.creature === "dragon"
      ? [2.45, 2.7]
      : h.creature === "triceratops"
        ? [1.7, 2.1]
        : h.creature === "tyrant"
          ? [2.2, 2.3]
          : h.creature === "pterosaur"
            ? [1.3, 1.5]
            : [1.04, 1.3];
  const s = RACE_SIZES[h.race] || [1, 1];
  return [
    s[0] * (h.appearance?.height || 1),
    s[1] * (h.appearance?.width || 1) * (CLASS_WIDTHS[h.classId] || 1),
  ];
}
export const CLASS_LEVELS = [10, 20, 40, 60, 80];
export function classPoints(h) {
  return Math.max(
    0,
    CLASS_LEVELS.filter((l) => h.level >= l).length -
      (h.classNodes || []).length,
  );
}
export function classTree(h) {
  const foundation = {
    id: h.classId + ":foundation",
    parent: "root",
    level: 10,
    kind: "talent",
    name: "Firekeeper discipline",
    text: "+2 Vitality and +2 Endurance. Your first point learns a talent.",
  };
  const paths = (SCHOOLS[h.classId] || []).map((path) => {
    const root = path.id + ":0",
      nodes = [
        {
          id: root,
          parent: foundation.id,
          level: 20,
          kind: "subclass",
          path: path.id,
          name: path.name,
          text: path.text,
        },
      ];
    for (const style of ["power", "control"]) {
      const parent = path.id + ":" + style;
      nodes.push({
        id: parent,
        parent: root,
        level: 40,
        kind: "talent",
        path: path.id,
        name: style === "power" ? "Forceful technique" : "Measured technique",
        text:
          style === "power"
            ? "+25% ability potency and +4 attacking stat."
            : "15% shorter cooldowns, +25 reach and +4 Endurance.",
      });
      for (const finish of ["surge", "shelter"]) {
        const id = parent + ":" + finish;
        nodes.push({
          id,
          parent,
          level: 60,
          kind: "subclass",
          path: path.id,
          name: path.name + (finish === "surge" ? " Ascendant" : " Warden"),
          text:
            finish === "surge"
              ? "Larger effects, stronger summons, +6 Mind / Strength."
              : "Stronger shields, easier persuasion, +6 Vitality / Endurance.",
        });
        nodes.push({
          id: id + ":mastery",
          parent: id,
          level: 80,
          kind: "talent",
          path: path.id,
          name: "Evernight mastery",
          text: "+8 Vitality, +8 Endurance and +15% ability potency.",
        });
      }
    }
    return { ...path, nodes };
  });
  return [
    { id: "foundation", name: CLASSES[h.classId].label, nodes: [foundation] },
    ...paths,
  ].map((p) => ({
    ...p,
    nodes: p.nodes.map((n) => ({ ...n, locked: classNodeState(h, n).locked })),
  }));
}
function classTreeDefinitions(h) {
  const defs = [{ id: h.classId + ":foundation", parent: "root", level: 10 }];
  for (const p of SCHOOLS[h.classId] || []) {
    defs.push({
      id: p.id + ":0",
      parent: h.classId + ":foundation",
      level: 20,
    });
    for (const style of ["power", "control"]) {
      const id = p.id + ":" + style;
      defs.push({ id, parent: p.id + ":0", level: 40 });
      for (const f of ["surge", "shelter"])
        defs.push(
          { id: id + ":" + f, parent: id, level: 60 },
          { id: id + ":" + f + ":mastery", parent: id + ":" + f, level: 80 },
        );
    }
  }
  return defs;
}
export function classNodeState(h, n) {
  const c = h.classNodes || [],
    defs = classTreeDefinitions(h),
    learned = c.includes(n.id),
    sibling = c.some(
      (id) => id !== n.id && defs.find((v) => v.id === id)?.level === n.level,
    ),
    path = !!n.path && !!h.classPath && n.path !== h.classPath;
  return {
    learned,
    locked: sibling || path,
    available:
      (n.parent === "root" || c.includes(n.parent)) &&
      !sibling &&
      !path &&
      !learned &&
      h.level >= n.level &&
      classPoints(h) > 0,
  };
}
export function validClassNodes(h) {
  const nodes = h.classNodes || [],
    defs = classTreeDefinitions(h);
  return (
    nodes.length <= CLASS_LEVELS.filter((l) => h.level >= l).length &&
    nodes.every((id, i) => {
      const n = defs.find((n) => n.id === id);
      return (
        n &&
        n.level === CLASS_LEVELS[i] &&
        n.parent === (i ? nodes[i - 1] : "root") &&
        (!i || id.startsWith(h.classPath + ":"))
      );
    })
  );
}
export function migrateClassNodes(h) {
  let old = h.classNodes || [];
  if (old.some((id) => /:\d+$/.test(id) && !id.endsWith(":0"))) {
    const n = old.length;
    old = [h.classPath + ":0"];
    if (n >= 2) old.push(h.classPath + ":power");
    if (n >= 3) old.push(h.classPath + ":power:surge");
    h.legacyClassMastery = Math.max(h.legacyClassMastery || 0, n - 3);
  }
  if (old.length && old[0] !== h.classId + ":foundation")
    old = [h.classId + ":foundation", ...old];
  h.classNodes = old.slice(0, CLASS_LEVELS.filter((l) => h.level >= l).length);
}
export function classEffects(h) {
  const path = school(h),
    depth =
      (h.classNodes || []).length -
      (h.classNodes?.includes(h.classId + ":foundation") ? 1 : 0),
    power = h.classNodes?.some((n) => n.endsWith(":power")),
    control = h.classNodes?.some((n) => n.endsWith(":control")),
    surge = h.classNodes?.some((n) => n.endsWith(":surge")),
    shelter = h.classNodes?.some((n) => n.endsWith(":shelter")),
    legacy = h.legacyClassMastery || 0;
  return {
    power: depth
      ? 1 +
        (path?.power ? path.power - 1 : 0.15) +
        (power ? 0.25 : 0) +
        (surge ? 0.2 : 0) +
        legacy * 0.08 +
        (h.classNodes?.some((n) => n.endsWith(":mastery")) ? 0.15 : 0)
      : 1,
    cooldown: control ? 0.85 : 1,
    range: control ? 25 : 0,
    summonCount: surge ? 4 : depth >= 2 ? 3 : 2,
    zoneScale: surge ? 1.45 : depth >= 2 ? 1.2 : 1,
    charmThreshold: shelter ? 0.7 : depth >= 2 ? 0.65 : 0.55,
    shieldScale: shelter ? 1.8 : depth >= 2 ? 1.35 : 1,
    bonus: {
      vitality:
        (h.classNodes?.includes(h.classId + ":foundation") ? 2 : 0) +
        (h.classNodes?.some((n) => n.endsWith(":mastery")) ? 8 : 0) +
        (shelter ? 6 : 0),
      endurance:
        (h.classNodes?.includes(h.classId + ":foundation") ? 2 : 0) +
        (h.classNodes?.some((n) => n.endsWith(":mastery")) ? 8 : 0) +
        (control ? 4 : 0) +
        (shelter ? 6 : 0),
      ...(power
        ? { [CLASSES[h.classId].magical ? "mind" : "strength"]: 4 }
        : {}),
      ...(surge
        ? {
            strength: 6 + (power && !CLASSES[h.classId].magical ? 4 : 0),
            mind: 6 + (power && CLASSES[h.classId].magical ? 4 : 0),
          }
        : {}),
    },
  };
}
export const EVOLUTIONS = {
  weapon: { level: 20, name: "Awakened", cost: 4 },
  pet: { level: 20, name: "Elder", cost: 4 },
};
export function evolutionName(obj, kind) {
  const base = kind === "pet" ? PETS[obj.key].name : ITEMS[obj.key].name,
    pool = modifierPool(
      obj,
      kind === "pet"
        ? "pet"
        : ITEMS[obj.key]?.type === "armor"
          ? "armor"
          : "weapon",
    ),
    mods = objectModifiers(
      obj,
      kind === "pet"
        ? "pet"
        : ITEMS[obj.key]?.type === "armor"
          ? "armor"
          : "weapon",
    );
  if (mods.length)
    return [
      pool.prefix[obj.prefix]?.name,
      base,
      pool.affix[obj.affix]?.name,
      obj.enchantment ? "· " + pool.enchantment[obj.enchantment]?.name : null,
    ]
      .filter(Boolean)
      .join(" ");
  return kind === "pet" && obj.evolution
    ? ["", "Elder", "Ancestral", "Legendary"][obj.evolution] + " " + base
    : base;
}
export function transformationOptions(obj, kind = "weapon") {
  const stage = obj.evolution || 0,
    level = [20, 40, 60][stage],
    cost = 4 + stage * 6,
    domain =
      kind === "pet"
        ? "pet"
        : ITEMS[obj.key]?.type === "armor"
          ? "armor"
          : "weapon",
    prepared = { ...obj, armorWeight: ITEMS[obj.key]?.weight };
  return {
    stage,
    level,
    cost,
    material: stage === 1 ? "obsidian" : stage === 2 ? "relic" : null,
    choices: Object.entries(modifierPool(obj, domain))
      .filter(([k]) => !obj[k])
      .flatMap(([kind, defs]) =>
        Object.entries(defs)
          .filter(([, d]) => modifierFits(prepared, d))
          .map(([key, d]) => ({ kind, key, ...d })),
      ),
  };
}
export function normalizeWeapon(i, kind = "weapon") {
  if (!i || !(kind === "pet" ? PETS[i.key] : ITEMS[i.key])) return;
  const domain =
    kind === "pet"
      ? "pet"
      : ITEMS[i.key]?.type === "armor"
        ? "armor"
        : "weapon";
  if (domain !== "weapon") {
    i.modifierDomain = domain;
    if (domain === "armor") i.armorWeight = ITEMS[i.key].weight;
  }
  i.evolution = Math.min(3, i.evolution || 0);
  if (i.evolution) {
    let remaining = i.evolution - objectModifiers(i, domain).length;
    for (const type of ["prefix", "affix", "enchantment"])
      if (remaining > 0 && !i[type]) {
        const choices = transformationOptions(
          { ...i, evolution: 0 },
          domain,
        ).choices.filter((d) => d.kind === type);
        i[type] = choices[0]?.key;
        remaining--;
      }
  }
  if (!i.mythical) i.rarityTier = rarity(i.level);
}
export function petInfo(p) {
  const out = {
    name: evolutionName(p, "pet"),
    desc: PETS[p.key].text,
    flying: !!PETS[p.key].flying,
    wingType: PETS[p.key].wingType,
  };
  for (const m of objectModifiers(p, "pet")) {
    for (const k of [
      ...CORE_STATS,
      "attack",
      "speed",
      "range",
      "knock",
      "splash",
    ])
      out[k] = (out[k] || 0) + (m[k] || 0);
    for (const k of [
      "flying",
      "wingType",
      "slow",
      "element",
      "ranged",
      "scatter",
      "chain",
      "dodge",
      "force",
    ])
      if (m[k]) out[k] = m[k];
    if (m.kind === "enchantment") {
      out.spell = m.spell;
      out.enchantment = m.key;
      out.spellCooldown = m.cooldown;
      out.spellPower = m.power;
    }
    out.aura = m.color || m.visual?.color;
  }
  out.desc +=
    " " +
    objectModifiers(p, "pet")
      .map((m) => m.text)
      .join(" ");
  return out;
}
export function spellObjects(h) {
  return [
    ...allGear(h),
    ...(PETS[h.companion?.key]?.mode === "mount" ? [h.companion] : []),
  ];
}
export function spellObjectInfo(i) {
  return i.modifierDomain === "pet" ? petInfo(i) : itemInfo(i);
}
export function flightType(h) {
  if (hasAttribute(h, "Angel")) return "feather";
  const gear = allGear(h)
    .map(itemInfo)
    .find((d) => d.flying);
  if (gear)
    return (
      gear.wingType || (gear.name.includes("Mothwing") ? "moth" : "mechanical")
    );
  if (h.companion && petInfo(h.companion).flying)
    return petInfo(h.companion).wingType || "feather";
  if (RACES[h.race].flying) return h.race === "Owlkin" ? "feather" : "insect";
  if (h.bonus?.flying || CLASSES[h.classId]?.flying)
    return h.creature ? "leather" : "arcane";
  return null;
}
ATTRIBUTES.Angel = {
  text: "Feathered wings grant flight over water, barricades, and ground obstacles. Ground melee units cannot reach this adventurer.",
  flying: true,
  wingType: "feather",
};
ATTRIBUTE_BONUSES.Angel = { mind: 2, endurance: 1 };

PETS.raptor = {
  name: "Fern raptor",
  color: "#8baf75",
  icon: "paw",
  mode: "attack",
  price: 240,
  eggOnly: true,
  text: "A quick dinosaur that bites nearby opponents. Hatched from an Amberwild egg.",
};
PETS.hadrosaur = {
  name: "Saddleback dinosaur",
  color: "#bd9b65",
  icon: "paw",
  mode: "mount",
  price: 360,
  eggOnly: true,
  text: "A rideable dinosaur. +18 speed, +35% mass. Hatched from an Amberwild egg.",
};
CONSUMABLES.rope = {
  name: "Trail rope",
  icon: "gear",
  price: 24,
  text: "Journey equipment. The party recovers another 8% health at road rests.",
  effect: "rope",
};
CONSUMABLES.lantern = {
  name: "Survey lantern",
  icon: "spark",
  price: 28,
  text: "Journey equipment. Halves the range penalty from jungle grass for one expedition.",
  effect: "lantern",
};
LOCATIONS.marsh.races = ["Human", "Shade", "Dwarf", "Automaton"];
LOCATIONS.marsh.attributes = ["Zombie"];
LOCATIONS.cinder.races = ["Human", "Elf", "Ent", "Dwarf"];
LOCATIONS.cinder.attributes = ["Vampire"];
LOCATIONS.volcano = {
  name: "Emberpeak Mountains",
  icon: "flame",
  biome: "volcano",
  text: "Climb black basalt slopes to a dragon’s burning caldera.",
  lore: "Glass-black roads wind between old watchtowers. The dragon guards the pass to Briarfall.",
  races: ["Drakeling", "Orc", "Automaton"],
  classes: ["vanguard", "mage", "guardian"],
  color: "#ad806c",
  events: {
    fountain: "A warm mineral spring",
    chest: "A scorched strongbox",
    cache: "A climber’s refuge",
    special: "The obsidian altar",
  },
};
LOCATIONS.jungle = {
  name: "Amberwild Jungle",
  icon: "paw",
  biome: "jungle",
  text: "Deep grass, lost ruins, and enormous dinosaurs.",
  lore: "The road ends beneath ancient leaves. Warm eggs lie hidden in a nesting valley.",
  races: ["Drakeling"],
  classes: ["vanguard", "ranger"],
  color: "#78995f",
  events: {
    fountain: "The canopy spring",
    chest: "A vine-covered reliquary",
    cache: "A ruined courtyard",
    special: "The nesting grounds",
  },
};
CAMPAIGNS.volcano = [
  ["Basalt foothills", 5, 10, "gold"],
  ["The obsidian quarry", 6, 13, "gold"],
  ["Ashen watch", 7, 16, "gold"],
  ["The fire stair", 8, 20, "gold"],
  ["Dragon caldera", 10, 24, "slot"],
];
CAMPAIGNS.jungle = [
  ["Fernveil verge", 6, 24, "gold"],
  ["Broken sun temple", 8, 28, "gold"],
  ["Nesting valley", 8, 30, "gold"],
  ["Thunderplain", 10, 34, "gold"],
  ["The ancient tyrant", 12, 38, "gold"],
];
CLASSES.healer.cooldown = 19;
CLASSES.druid.cooldown = 21;
CLASSES.bard.cooldown = 16;
CLASSES.healer.abilityText =
  "Spend mana to create a modest healing Blessing. Healing is limited by each encounter’s mana pool.";
export function normalizeHero(h, stash = []) {
  if (h.schema === 7) return h;
  const oldClass = h.classId,
    oldRace = h.race,
    oldItems = (h.items || []).filter(Boolean);
  h.talents ||= [];
  h.classNodes ||= [];
  h.classPath ||= h.specialization || null;
  if (["Vampire", "Zombie"].includes(oldRace)) {
    h.race = RACES[h.originalRace] ? h.originalRace : "Human";
    h.attributes = (h.attributes || []).filter(
      (a) => a.key !== "race:" + oldRace,
    );
    if (!h.attributes.some((a) => a.key === oldRace))
      h.attributes.push(makeFacet(oldRace));
  }
  if (["miner", "lumberjack"].includes(oldClass)) {
    h.classId = "vanguard";
    h.talents.push(makeFacet(oldClass === "miner" ? "Miner" : "Lumberjack"));
    h.skills["class:vanguard"] ||= makeFacet("class:vanguard");
    h.classPath = null;
    h.specialization = null;
  }
  for (const a of (h.attributes || []).filter((a) =>
    a.key.startsWith("training:"),
  ))
    if (!h.talents.some((t) => t.key === a.key)) h.talents.push(a);
  h.attributes = (h.attributes || []).filter(
    (a) => !a.key.startsWith("training:"),
  );
  if (!h.attributes.some((a) => a.key === "race:" + h.race))
    h.attributes.unshift(makeFacet("race:" + h.race));
  h.appearance ||= {};
  h.appearance.height ??= 0.92 + ((h.appearance.hue || 0) % 17) / 100;
  h.appearance.width ??= 0.9 + ((h.appearance.hue || 0) % 21) / 100;
  h.appearance.crown ??= (h.appearance.crest || 0) % 4;
  h.extraSlots = (h.extraSlots || [])
    .filter((s) => !s.types.includes("body"))
    .slice(
      0,
      8 -
        CLASSES[h.classId].slots.length -
        h.talents.filter((t) => TALENTS[t.key]?.slot).length,
    );
  h.armor ||= [null, null, null];
  const slots = equipmentSlots(h);
  h.items = slots.map(() => null);
  for (const i of oldItems) {
    if (ITEMS[i.key]?.type === "armor") {
      if (!h.armor[1] && !armorRestriction(h, i, 1)) h.armor[1] = i;
      else stash.push(i);
    } else {
      const at = slots.findIndex(
        (s, n) => !h.items[n] && s.types.includes(ITEMS[i.key]?.type),
      );
      if (at >= 0) h.items[at] = i;
      else stash.push(i);
    }
  }
  for (let n = 0; n < 3; n++)
    if (armorSlots(h)[n].allowed && !h.armor[n])
      h.armor[n] = makeItem(starterArmor(h, armorSlots(h)[n].key));
  if (h.race === "Celestial" && h.armor[0]) {
    stash.push(h.armor[0]);
    h.armor[0] = null;
  }
  if (
    h.classPath &&
    SCHOOLS[h.classId]?.some((p) => p.id === h.classPath) &&
    h.level >= 20 &&
    !h.classNodes.length
  )
    h.classNodes = [h.classPath + ":0"];
  h.transformations ||= [];
  h.schema = 7;
  return h;
}

// Every calling changes the signature action, including the specialist base classes.
const callingDetails = {
  trapper: [
    [
      "Snarewright",
      "Scatter five arrows and set a wider opening snare field.",
      "Briar scatter",
    ],
    [
      "Trailwarden",
      "Pin nearby opponents with a slowing trap and protect yourself.",
      "Holding snare",
    ],
  ],
  minelayer: [
    [
      "Demolitionist",
      "Detonate a broad chain explosion around your target.",
      "Chain detonation",
    ],
    [
      "Sapper",
      "Raise a defensive field while blasting nearby enemies.",
      "Defensive charge",
    ],
  ],
  alchemist: [
    [
      "Pyrochemist",
      "Throw an incendiary flask that ignites the ground.",
      "Incendiary flask",
    ],
    [
      "Wardchemist",
      "Throw a protective flask to shield the injured ally.",
      "Warding flask",
    ],
  ],
  druid: [
    [
      "Thornkeeper",
      "A spring of thorns heals allies and curses nearby foes.",
      "Thorn spring",
    ],
    [
      "Vinewarden",
      "Summon one enduring vine spirit to hold the front.",
      "Vine guardian",
    ],
  ],
  paladin: [
    [
      "Dawnblade",
      "Shield nearby allies and strike surrounding foes.",
      "Dawn strike",
    ],
    [
      "Beacon",
      "Cast a large, stronger shield around your party.",
      "Beacon aegis",
    ],
  ],
  necromancer: [
    ["Echo caller", "Summon a legion of fragile echoes.", "Echo legion"],
    ["Gravewarden", "Summon one durable spectral defender.", "Wraith guardian"],
  ],
  psion: [
    [
      "Singularist",
      "Create a larger, stronger gravitational well.",
      "Singularity",
    ],
    [
      "Repulsor",
      "Push nearby foes away and brace yourself with a shield.",
      "Repulsion wave",
    ],
  ],
  duelist: [
    [
      "Bladedancer",
      "A broad blade flourish strikes and scatters multiple enemies.",
      "Blade flourish",
    ],
    [
      "Riposter",
      "Counter one enemy with a heavy hit and personal shield.",
      "Measured riposte",
    ],
  ],
};
for (const [id, details] of Object.entries(callingDetails))
  SCHOOLS[id].forEach((p, i) =>
    Object.assign(p, {
      name: details[i][0],
      text: details[i][1],
      ability: details[i][2],
    }),
  );
Object.assign(SCHOOLS.monk[0], {
  text: "A powerful palm strike knocks one opponent back.",
  ability: "Thunder palm",
});
Object.assign(SCHOOLS.monk[1], {
  text: "Protect nearby allies with a circle of shields.",
  ability: "Stillness circle",
});
Object.assign(SCHOOLS.bard[1], {
  text: "Trades persuasion for a battle refrain that boosts allies and strikes nearby foes.",
  ability: "Battle refrain",
});
Object.assign(SCHOOLS.artillery[0], {
  text: "Broad physical Explosions strike large clusters.",
  ability: "Bombardment",
});
Object.assign(SCHOOLS.artillery[1], {
  text: "A heavy precision shell hits one distant target.",
  ability: "Siege shot",
});
Object.assign(SCHOOLS.assassin[0], {
  text: "A heavy shadow strike hits harder against a wounded target.",
  ability: "Night strike",
});
Object.assign(SCHOOLS.assassin[1], {
  text: "Blink behind a foe and disappear longer under a protective veil.",
  ability: "Phantom step",
});

Object.assign(ITEMS, WEAPONS);
export const CLASS_WEAPONS = {
  vanguard: ["blade", "heavy", "blunt", "polearm"],
  guardian: ["blade", "blunt", "polearm"],
  paladin: ["blade", "blunt", "polearm"],
  ranger: ["bow", "crossbow", "longarm", "sidearm"],
  trapper: ["bow", "crossbow", "sidearm"],
  assassin: ["blade", "sidearm"],
  duelist: ["blade", "sidearm"],
  engineer: ["blunt", "sidearm", "longarm"],
  minelayer: ["blunt", "sidearm", "longarm"],
  artillery: ["artillery", "longarm", "crossbow"],
  monk: ["blunt", "polearm"],
};
for (const [id, c] of Object.entries(CLASSES))
  for (const s of c.slots)
    if (s.types.includes("weapon")) {
      s.weaponKinds = CLASS_WEAPONS[id] || ["blade", "blunt"];
      s.label =
        id === "artillery"
          ? "Artillery"
          : id === "ranger" || id === "trapper"
            ? "Ranged weapon"
            : "Weapon";
    } else if (s.types.includes("focus")) s.weaponKinds = ["wand", "staff"];
const newRaceData = {
  Owlkin: {
    text: "Watchful wings · +35 ranged reach and 6% evasion",
    range: 35,
    dodge: 0.06,
    color: "#bba587",
    base: {
      vitality: 11,
      armor: 1,
      strength: 8,
      mind: 14,
      agility: 14,
      endurance: 8,
    },
    growth: {
      vitality: 0.13,
      armor: 0.04,
      strength: 0.08,
      mind: 0.19,
      agility: 0.16,
      endurance: 0.1,
    },
  },
  Bearkin: {
    text: "Hibernal heart · 65% heavier; a sturdy natural constitution",
    mass: 1.65,
    color: "#a88463",
    base: {
      vitality: 19,
      armor: 3,
      strength: 16,
      mind: 7,
      agility: 6,
      endurance: 15,
    },
    growth: {
      vitality: 0.22,
      armor: 0.08,
      strength: 0.2,
      mind: 0.07,
      agility: 0.07,
      endurance: 0.18,
    },
  },
};
for (const [id, r] of Object.entries(newRaceData)) {
  RACES[id] = {
    ...r,
    passive: r.text.split("·")[0].trim(),
    growthTable: growthTable(r.growth),
  };
  LINEAGES[id] = [
    { id: "wild", name: id + " Wildheart", bonus: { strength: 5 } },
    { id: "sage", name: id + " Sage", bonus: { mind: 5 } },
  ];
}
RACE_SIZES.Owlkin = [0.97, 1.03];
RACE_SIZES.Bearkin = [1.42, 1.45];
LOCATIONS.greenway.races.push("Owlkin", "Bearkin");
COSMETICS.starlit = {
  name: "Starlit mantle",
  color: "#9fa7db",
  hue: 265,
  price: 300,
  text: "A silver-star cape with a soft violet aura.",
};
COSMETICS.roseguard = {
  name: "Roseguard colors",
  color: "#c28792",
  hue: 342,
  price: 260,
  text: "Rose cloth, copper trim, and dancing petals.",
};

RACES.Owlkin.flying = true;
RACES.Owlkin.text += " Feather wings carry them over ground obstacles.";

// Authored collectibles sit alongside generated content, sharing the same mechanics.
export const MYTHICAL_WEAPONS = {
  dawncore: {
    name: "Dawncore",
    theme: "solar",
    prefix: "flaming",
    affix: "bastion",
    enchantment: "sanctuary",
    text: "A sun-forged mace that lays a healing Blessing. A warm copper core and orbiting light identify it.",
  },
  riftfocus: {
    name: "Riftfocus",
    theme: "storm",
    prefix: "spectral",
    affix: "insight",
    enchantment: "gravity",
    text: "A violet star-metal focus casting a Gravity Curse. An orbiting rift reveals its identity.",
  },
  riftlance: {
    name: "Riftlance",
    theme: "storm",
    prefix: "stormbound",
    affix: "swiftness",
    enchantment: "gravity",
    text: "A star-metal spear wrapped in violet rifts. Storm strikes and a Gravity Curse bring distant enemies together.",
  },
  cometarm: {
    name: "Cometarm",
    theme: "iron",
    prefix: "scattershot",
    affix: "impact",
    enchantment: "meteor",
    text: "A compact engine of brass and blue fire. Scatter rounds and meteor explosions break crowded formations.",
  },
};
export function makeMythicalWeapon(key) {
  const d = MYTHICAL_WEAPONS[key];
  if (!d) return null;
  return {
    ...makeItem(key, 60),
    mythical: true,
    rarityTier: 4,
    evolution: 3,
    prefix: d.prefix,
    affix: d.affix,
    enchantment: d.enchantment,
  };
}
export const MYTHICAL_HEROES = {
  sunwarden: {
    name: "Sol, the Sunwarden",
    race: "Human",
    classId: "guardian",
    weapon: "dawncore",
    skin: "sunplate",
    theme: "solar",
    text: "A copper-armored defender carrying the last ember of a fallen sun. Shields allies and plants restorative light.",
    attributes: ["Angel", "Sturdy"],
    price: 90,
  },
  skyrift: {
    name: "Vela, the Skyrift",
    race: "Owlkin",
    classId: "mage",
    weapon: "riftfocus",
    skin: "tempest",
    theme: "storm",
    text: "A masked storm navigator who stitches torn skies together. A star-metal focus casts pulling gravity wells.",
    attributes: ["Angel", "Strongwill"],
    price: 105,
  },
  ironcomet: {
    name: "Cairn, the Iron Comet",
    race: "Automaton",
    classId: "artillery",
    weapon: "cometarm",
    skin: "clockwork",
    theme: "iron",
    text: "A rescued observatory engine, rebuilt as a wandering protector. Blue vents, brass plates, and explosive comet rounds.",
    attributes: ["Inventive", "Sturdy"],
    price: 120,
  },
};
export function makeMythicalHero(key) {
  const d = MYTHICAL_HEROES[key];
  if (!d) return null;
  const h = generateHero({
    name: d.name,
    race: d.race,
    classId: d.classId,
    level: 60,
    mythical: true,
    mythicKey: key,
    rarityTier: 4,
  });
  h.attributes.push(...d.attributes.map((k) => makeFacet(k, 1, 4)));
  const weapon = makeMythicalWeapon(d.weapon);
  h.items[0] = weapon;
  h.currentHp = stats(h).hp;

  return h;
}
Object.assign(COSMETICS, {
  sunplate: {
    name: "Sunplate guise",
    type: "character",
    skin: "sunplate",
    price: 320,
    gems: 12,
    color: "#dcb45a",
    text: "Replace the entire character silhouette with a masked copper sentinel and a sun shield. Mechanics and identity stay the same.",
  },
  clockwork: {
    name: "Clockwork guise",
    type: "character",
    skin: "clockwork",
    price: 360,
    gems: 14,
    color: "#7ecddd",
    text: "A complete brass automaton silhouette, luminous eyes and blue reactor. Works on any race or class.",
  },
  moonwraith: {
    name: "Moonwraith guise",
    type: "character",
    skin: "moonwraith",
    price: 340,
    gems: 13,
    color: "#baa9df",
    text: "A complete floating moon spirit with a crescent crown. Works on any character.",
  },
  crystaledge: {
    name: "Crystal weapon skins",
    type: "weapon",
    skin: "crystal",
    kinds: ["blade", "heavy", "polearm", "wand", "staff"],
    price: 220,
    gems: 8,
    color: "#91d9dc",
    text: "Faceted turquoise crystal replaces the finish of blades, heavy weapons, polearms, wands and staves. The base silhouette remains recognizable.",
  },
  brassworks: {
    name: "Brassworks weapon skins",
    type: "weapon",
    skin: "brass",
    kinds: ["longarm", "sidearm", "artillery", "crossbow", "blunt"],
    price: 230,
    gems: 8,
    color: "#d6ae64",
    text: "Brass housings, copper accents and a blue power cell for firearms, artillery, crossbows and blunt weapons.",
  },
  moonfox: {
    name: "Moonfox companion guise",
    type: "pet",
    skin: "moonfox",
    price: 240,
    gems: 9,
    color: "#b4a6dc",
    text: "Give any companion a little violet moonfox appearance. Mounts keep their riding behavior.",
  },
  tinpet: {
    name: "Tin companion guise",
    type: "pet",
    skin: "tinpet",
    price: 240,
    gems: 9,
    color: "#8ec1c4",
    text: "Give any companion a tiny mechanical creature appearance, with glowing eyes and a winding key.",
  },
});
Object.assign(PETS, {
  ammonite: {
    name: "Pearl ammonite",
    icon: "paw",
    color: "#ccb696",
    mode: "shield",
    price: 150,
    fossilOnly: true,
    fossilCost: 5,
    text: "A floating fossil shell that lends its owner a small shield.",
  },
  trilobite: {
    name: "Stone trilobite",
    icon: "paw",
    color: "#99a59b",
    mode: "attack",
    price: 145,
    fossilOnly: true,
    fossilCost: 4,
    text: "A little plated companion that nips nearby enemies.",
  },
  pterosaur: {
    name: "Amberwing",
    icon: "wing",
    color: "#b59b70",
    mode: "attack",
    flying: true,
    wingType: "insect",
    price: 175,
    fossilOnly: true,
    fossilCost: 7,
    text: "A small prehistoric flier that keeps close to its owner.",
  },
});
for (const [key, def] of Object.entries(WEAPONS)) {
  if (!def.mythicalOnly) {
    delete ITEMS[key].aura;
    delete ITEMS[key].element;
  }
}
ITEMS.pickaxe.name = "Pickaxe";
ITEMS.axe.name = "Axe";

LOCATIONS.island = {
  name: "The Bell Beneath",
  icon: "moon",
  biome: "ruins",
  color: "#677e91",
  text: "Twenty-five floors under the island's impossible bell.",
  lore: "Every camp hears it. No one admits to ringing it.",
  races: ["Shade", "Automaton", "Dwarf"],
  classes: ["guardian", "mage", "assassin"],
  attributes: ["Zombie"],
  events: {
    fountain: "A silent spring",
    chest: "A drowned reliquary",
    cache: "A keeper's refuge",
    special: "The bell chamber",
  },
};
for (const weight of ["light", "medium", "heavy"])
  ITEMS[weight + "-night-boots"] = {
    ...ITEMS[weight + "-boots"],
    name: "Steps of the Unrung Bell",
    mythicalOnly: true,
    armor: 6,
    agility: 4,
    desc: "Authored Mythical boots from floor 25. +6 Armor, +4 Agility; the bell-shaped soles glow violet.",
    visualColor: "#aa80d7",
  };
CONSUMABLES.stew = {
  name: "Hunter's stew",
  icon: "heart",
  price: 0,
  text: "A rich meal. +4 Vitality and +3 Endurance for one expedition.",
};
CONSUMABLES.tea = {
  name: "Lantern tea",
  icon: "spark",
  price: 0,
  text: "A chosen herb dish. +4 Mind and +2 Agility for one expedition.",
};

ITEMS["hooded-lantern"] = {
  name: "Hooded lantern",
  type: "light",
  price: 8,
  icon: "flame",
  lightRadius: 190,
  lightColor: "#ffc36a",
  desc: "Equipped utility light. Reveals a 190-unit radius to nearby allies and enemies.",
};
ITEMS["witchlight-lantern"] = {
  name: "Witchlight lantern",
  type: "light",
  price: 60,
  icon: "spark",
  lightRadius: 275,
  lightColor: "#b3a0ff",
  desc: "Equipped utility light. Reveals a 275-unit radius without consuming supplies.",
};
TALENTS["Night vision"] = {
  name: "Night vision",
  text: "See 190 units through unlit terrain. Learn from the Lantern Runners after two lessons.",
};
ATTRIBUTES.Vampire.text += " Sees 300 units in darkness.";
ATTRIBUTES.Werewolf.text += " Sees 250 units in darkness.";
for (const [race, n] of Object.entries({
  Dwarf: 220,
  Gnome: 200,
  Kobold: 240,
  Myconid: 210,
  Shade: 280,
}))
  RACES[race].text += " Sees " + n + " units in darkness.";
VENDORS.push({
  id: "lights",
  name: "The Lanternwright",
  icon: "flame",
  tag: "Lights",
  text: "Equip a light before walking into Evernight.",
});
export const GUILD_EQUIPMENT = {
  miners: ["pickaxe", "Stonekeeper pick", "armor"],
  foresters: ["axe", "Rootwarden axe", "endurance"],
  hunters: ["longbow", "Wildwatch longbow", "strength"],
  arcanists: ["sunstaff", "Veil scholar staff", "mind"],
  guardians: ["aegis", "Oathbearer aegis", "vitality"],
  scouts: ["witchlight-lantern", "Runner witchlight", "agility"],
  artisans: ["ironblade", "Ironhand sword", "armor"],
  healers: ["lens", "Mercy focus", "vitality"],
};
for (const [guild, [base, name, stat]] of Object.entries(GUILD_EQUIPMENT)) {
  ITEMS["guild-" + guild] = {
    ...ITEMS[base],
    name,
    guildOnly: guild,
    price: 60,
    [stat]: (ITEMS[base][stat] || 0) + 2,
    desc:
      ITEMS[base].desc +
      " Guild signature: +2 " +
      stat +
      ". Available only to guild members.",
  };
}

// Current roster is installed after compatibility tables have been initialized.
installFallenWorld({ RACES, CLASSES, SCHOOLS, LINEAGES, RACE_SIZES, CLASS_WEAPONS, LOCATIONS, growthTable });
