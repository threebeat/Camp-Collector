// Canonical weapon identities. Art and combat share these definitions.
const weapon = (name, kind, attack, shape, extra = {}) => ({
  name,
  weaponKind: kind,
  type: ["wand", "staff"].includes(kind) ? "focus" : "weapon",
  icon: ["bow", "crossbow"].includes(kind)
    ? "bow"
    : ["longarm", "sidearm", "artillery"].includes(kind)
      ? "cannon"
      : kind === "blunt"
        ? "gear"
        : "sword",
  attack,
  price: 30 + attack * 6,
  desc: name + ". " + kind + " slot; +" + attack + " attack.",
  shape,
  ...extra,
});
export const WEAPONS = {
  ironblade: weapon(
    "Sword",
    "blade",
    7,
    "m45 66-3-42 8-13 8 13-4 42Z|M29 68h41m-20 0v19",
  ),
  dagger: weapon(
    "Dagger",
    "blade",
    5,
    "M43 69 35 30 50 18l10 15-9 36Z|M33 70h31m-16 0-2 18",
    { agility: 2 },
  ),
  greatblade: weapon(
    "Greatsword",
    "heavy",
    20,
    "M38 66V20l12-12 13 12v46Z|M23 68h55M50 69v21",
    { minStrength: 24, knock: 55 },
  ),
  salamander: weapon(
    "Saber",
    "blade",
    9,
    "M43 72Q62 47 77 12 44 30 38 66Z|M29 70q16 9 29 0m-14 5-5 15",
    { knock: 10 },
  ),
  rapier: weapon(
    "Rapier",
    "blade",
    8,
    "m48 67 6-58 3 58Z|M31 69q17 17 36 0M50 73v16",
    { agility: 3 },
  ),
  cutlass: weapon(
    "Cutlass",
    "blade",
    10,
    "M42 68Q70 51 69 14L60 21Q53 52 35 61Z|M29 66q-8 27 16 22M41 71l-7 18",
  ),
  falchion: weapon(
    "Falchion",
    "blade",
    11,
    "M42 70 37 22l24-12-7 17 9 36Z|M28 71h38m-19 1v18",
  ),
  kukri: weapon(
    "Kukri",
    "blade",
    7,
    "M40 70 30 40 49 13l15 16-16 20 5 19Z|M31 73l25-5m-13 6 3 15",
    { agility: 2 },
  ),
  estoc: weapon(
    "Estoc",
    "blade",
    9,
    "m47 66-1-40 5-17 5 17-1 40Z|M29 69h42m-20 1v19m-5-6h11",
    { range: 12 },
  ),
  twinblade: weapon(
    "Twinblade",
    "blade",
    12,
    "M43 41 37 16l15-9 6 12-7 25Zm0 18 11 2 7 24-13 8-8-12Z|M33 49h38M50 41v22",
  ),
  flamberge: weapon(
    "Flamberge",
    "heavy",
    15,
    "M43 67Q59 58 45 47T54 26L56 9 66 24Q53 36 66 47T55 68Z|M27 71h45M49 72v18",
    { minStrength: 18 },
  ),
  executioner: weapon(
    "Cleaver",
    "heavy",
    18,
    "M39 67V14h25v53Z|M24 72h55M51 73v17m-7-70h14",
    { minStrength: 22, knock: 30 },
  ),
  hatchet: weapon("Hatchet", "blunt", 7, "M48 20Q74 17 77 43L49 48Z|M46 25v63"),
  waraxe: weapon(
    "Greataxe",
    "heavy",
    14,
    "M45 24Q12 12 14 48l31 3 13-1 26-6Q88 13 57 24Z|M50 20v70",
    { minStrength: 18, knock: 25 },
  ),
  crescentaxe: weapon(
    "Bardiche",
    "polearm",
    12,
    "M49 15Q91 22 77 59L63 52Q72 28 49 27Z|M46 17v76",
    { range: 18 },
  ),
  hammer: weapon("Hammer", "blunt", 8, "M21 20h57v23H21Z|M50 43v47", {
    knock: 35,
  }),
  monkmaul: weapon(
    "Monk mace",
    "blunt",
    11,
    "m50 12 17 11-4 19-13 10-14-10-4-19Z|M50 50v40",
    { onlyClasses: ["monk"], knock: 38 },
  ),
  flail: weapon(
    "Flail",
    "blunt",
    10,
    "m66 14 14 7-2 17-16 4-10-12Z|M64 41q-26 9-30 26m0-5v28",
    { knock: 24 },
  ),
  morningstar: weapon(
    "Morningstar",
    "blunt",
    12,
    "m50 10 5 10 11-4-2 11 10 7-11 5 1 11-11-3-5 11-5-10-12 2 3-11-10-6 11-7-1-10 10 3Z|M50 54v36",
  ),
  club: weapon(
    "Club",
    "blunt",
    6,
    "M38 55 31 25Q40 9 56 15l10 36-12 10 2 29H44Z|M42 27l11-3m-9 14 11-2",
    { knock: 18 },
  ),
  spear: weapon("Spear", "polearm", 8, "m50 6-12 25 12 11 12-11Z|M50 42v51", {
    range: 24,
  }),
  glaive: weapon(
    "Glaive",
    "polearm",
    11,
    "M43 45Q63 25 53 9 80 25 55 46Z|M46 39v54",
    { range: 22 },
  ),
  halberd: weapon(
    "Halberd",
    "polearm",
    14,
    "M49 10 42 29h-9l-13-8v25l17-4h10l21 6-4-22-19 5Z|M47 24v69",
    { range: 18, minStrength: 17 },
  ),
  trident: weapon(
    "Trident",
    "polearm",
    10,
    "M28 11v23l21 12 22-12V11l-8 8v11l-10 6V7l-7 1v29L35 29V18Z|M50 45v48",
    { range: 20 },
  ),
  scythe: weapon(
    "Scythe",
    "polearm",
    12,
    "M39 19Q78 7 88 46 64 26 39 30Z|M37 17v75",
    { range: 21 },
  ),
  longbow: weapon(
    "Longbow",
    "bow",
    8,
    "M37 10Q86 49 37 88L37 10Z|M19 49h55m-4-5 7 5-7 5",
    { ranged: true, range: 70 },
  ),
  shortbow: weapon(
    "Shortbow",
    "bow",
    7,
    "M42 21Q73 50 42 77V21Z|M24 50h38m0 0-6-5m6 5-6 5",
    { ranged: true, agility: 3, range: 30 },
  ),
  recurved: weapon(
    "Recurve",
    "bow",
    10,
    "M40 10Q20 24 44 34T43 66Q22 78 42 90M42 12v76|M23 50h47m-5-4 7 4-7 4",
    { ranged: true, range: 55 },
  ),
  stormbow: weapon(
    "Compound bow",
    "bow",
    12,
    "M35 9 54 20 44 33 70 50 46 65 55 80 35 91V9Z|M19 50h61m-7-5 8 5-8 5",
    { ranged: true, range: 75 },
  ),
  bonebow: weapon(
    "Bone bow",
    "bow",
    9,
    "M38 12Q79 48 38 86V12m4 9-13-8m25 24 15-7m-15 34 13 7m-24 10-14 6|M23 49h52",
    { ranged: true, range: 45 },
  ),
  crossbow: weapon(
    "Crossbow",
    "crossbow",
    11,
    "M17 38Q50 15 83 38L50 44Zm26 3h14v44H43Z|M16 38l34 13 34-13M50 22v45",
    { ranged: true, range: 65 },
  ),
  arbalest: weapon(
    "Arbalest",
    "crossbow",
    16,
    "m12 35 14-17 24 15 24-15 14 17-17 11H29Zm29 7h18v46H41Z|M13 35l37 21 37-21M50 17v48",
    { ranged: true, range: 85, minStrength: 18 },
  ),
  repeatingbow: weapon(
    "Repeater",
    "crossbow",
    10,
    "M20 43Q50 23 80 43L50 51Zm22 7h16v37H42ZM37 25h26v17H37Z|M20 43l30 13 30-13M46 27v11m8-11v11",
    { ranged: true, range: 45, agility: 4 },
  ),
  musket: weapon(
    "Musket",
    "longarm",
    14,
    "m38 90 3-32 5-5V12h12v52l-11 8-1 18Z|M47 15h13M51 21v28m-8 23h12",
    { ranged: true, range: 90 },
  ),
  revolver: weapon(
    "Revolver",
    "sidearm",
    10,
    "M22 30h53v13H46l6 11-3 28H32V50L20 42Zm10 3h17v17H32Z|M53 34h27m-41 24v15",
    { ranged: true, range: 35, agility: 2 },
  ),
  blunderbuss: weapon(
    "Blunderbuss",
    "longarm",
    16,
    "M34 85 36 63l10-13-3-26 18-13 11 10-14 13 4 23-15 16-1 15Z|M42 29l20-7m-23 43 13 1",
    { ranged: true, range: 25, scatter: 3 },
  ),
  handcannon: weapon(
    "Hand cannon",
    "sidearm",
    15,
    "M20 28h61v25H42l4 12-7 19H23l4-28-7-9Z|M28 29v24m6-17h40M31 64v13",
    { ranged: true, range: 25, knock: 25 },
  ),
  cannon: weapon(
    "Cannon",
    "artillery",
    18,
    "m19 23 54 5v36l-54 4Z|M17 22v47m10 1-6 14m43-20 13 20M15 84h68",
    { ranged: true, range: 80, splash: 25 },
  ),
  arquebus: weapon(
    "Arquebus",
    "longarm",
    12,
    "M27 85 33 61l11-8 5-43h9v47L42 69l-3 19Z|M48 32h17l-2 8h-8m-22 29 13 5",
    { ranged: true, range: 75 },
  ),
  pepperbox: weapon(
    "Pepperbox",
    "sidearm",
    11,
    "M31 21h38v31H47l7 10-3 22H32l3-24-8-13Z|M38 25v24m9-24v24m9-24v24m9-24v24M40 63v13",
    { ranged: true, range: 30, scatter: 2 },
  ),
  mortar: weapon(
    "Mortar",
    "artillery",
    20,
    "m22 33 47-12 10 26-47 15Z|M20 32l12 31M43 61v18M19 82h62m-59 0 14-15m36 0 8 15",
    { ranged: true, range: 95, splash: 35, minStrength: 18 },
  ),
  longrifle: weapon(
    "Rifle",
    "longarm",
    17,
    "M34 91 38 61l10-10V7h9v51l-12 17v16Z|M46 22h19v7H46m2 1h6m-13 35h15",
    { ranged: true, range: 115 },
  ),
  duelpistol: weapon(
    "Pistol",
    "sidearm",
    12,
    "M18 34h61v9H49l-3 11q14 11 5 28H30V59L18 46Z|M26 37h56M39 54q23 1 19 15m-21-9v16",
    { ranged: true, range: 50 },
  ),
  lens: weapon(
    "Focus",
    "wand",
    2,
    "m50 12 22 19-8 22H37L27 31Zm-6 42h13v36H44Z|M37 32h27M50 20v25",
    { mind: 5, attack: 0 },
  ),
  ember: weapon(
    "Wand",
    "wand",
    2,
    "m48 28-9-13 11-8 13 10-10 13Z|M49 28v60m0-44 9-8m-9 22-8-9",
    { mind: 3, attack: 2 },
  ),
  frost: weapon(
    "Rod",
    "wand",
    2,
    "m50 9 13 15-13 16-13-16Z|M50 40v48m-7-41h14m-14 11h14",
    { mind: 3, attack: 2 },
  ),
  willowstaff: weapon(
    "Crook",
    "staff",
    3,
    "M47 35Q19 13 48 10q28-2 17 26L51 48Z|M48 35v58m-2-20 12-8",
    { mind: 4, range: 12 },
  ),
  crystalstaff: weapon(
    "Staff",
    "staff",
    4,
    "m49 5-11 20 12 16 13-16Z|M50 39v53m-12-48h25m-20 10h15",
    { mind: 5 },
  ),
  sunstaff: weapon(
    "Scepter",
    "staff",
    3,
    "m50 9 6 9 10-2-3 12 8 7-12 3-4 11-7-10-11 1 4-12-7-8 12-2Z|M50 50v42",
    { mind: 4, endurance: 1 },
  ),
  bonewand: weapon(
    "Bone wand",
    "wand",
    3,
    "M36 20q-7-15 4-13l10 7L60 7q11-2 4 13L53 31H45Z|M49 31v55m-5-9h10",
    { mind: 4 },
  ),
  forkedrod: weapon(
    "Tuning rod",
    "wand",
    2,
    "M33 9v23l17 15 17-15V9h-8v21l-9 8-9-8V9Z|M50 47v44m-8-27h16",
    { mind: 3, agility: 2 },
  ),
};

// Mythicals are authored identities, never random drops or mundane crafting recipes.
WEAPONS.katana = weapon(
  "Katana",
  "blade",
  11,
  "M42 73Q62 45 64 10L70 11Q69 54 49 78Z|M33 75l24 8M43 80l-8 12",
  { agility: 2 },
);
WEAPONS.dawncore = weapon(
  "Dawncore",
  "blunt",
  15,
  "m50 8 7 13 14 3-4 16-17 10-17-10-4-16 14-3Z|M50 50v42",
  { mythicalOnly: true, mythicTheme: "solar", mind: 5 },
);
WEAPONS.riftlance = weapon(
  "Riftlance",
  "polearm",
  17,
  "m50 3 8 16 18 7-18 9-8 19-8-19-18-9 18-7Z|M50 54v39",
  { mythicalOnly: true, mythicTheme: "storm", range: 28 },
);
WEAPONS.riftfocus = weapon(
  "Riftfocus",
  "wand",
  4,
  "m50 7 21 14-8 20-13 8-13-8-8-20Z|M50 48v43",
  { mythicalOnly: true, mythicTheme: "storm", mind: 6 },
);
WEAPONS.cometarm = weapon(
  "Cometarm",
  "artillery",
  19,
  "m18 20 61 9-7 36-52 3Z|M16 18l-2 51M26 72l-9 15m48-18 15 18M17 87h66",
  {
    mythicalOnly: true,
    mythicTheme: "iron",
    ranged: true,
    range: 80,
    splash: 20,
  },
);

export const WEAPON_KINDS = {
  blade: "Blade",
  heavy: "Heavy weapon",
  blunt: "Mace / hammer",
  polearm: "Polearm",
  bow: "Bow",
  crossbow: "Crossbow",
  longarm: "Long gun",
  sidearm: "Sidearm",
  artillery: "Artillery",
  wand: "Wand / focus",
  staff: "Staff",
};
export const PREFIXES = {
  flaming: {
    name: "Flaming",
    text: "Fire attacks ignite the ground and deal splash damage.",
    element: "fire",
    splash: 18,
    color: "#ed9360",
  },
  glacial: {
    name: "Glacial",
    text: "Frost strikes slow opponents.",
    element: "frost",
    slow: true,
    color: "#92d5df",
  },
  stormbound: {
    name: "Stormbound",
    text: "Storm attacks arc to a second nearby opponent.",
    element: "storm",
    chain: true,
    color: "#b7a4ee",
  },
  weightless: {
    name: "Weightless",
    text: "Gravity attacks push enemies harder and form pulling wells.",
    element: "gravity",
    knock: 30,
    color: "#a396d5",
  },
  scattershot: {
    name: "Scattershot",
    text: "Attacks split among three nearby targets at reduced power.",
    scatter: 3,
    color: "#d5bb7b",
  },
  spectral: {
    name: "Spectral",
    text: "A spectral ranged attack reaches over ground obstacles.",
    ranged: true,
    range: 65,
    element: "arcane",
    color: "#99c5bf",
  },
};
export const AFFIXES = {
  might: {
    name: "of Might",
    text: "+6 Strength and +4 attack.",
    strength: 6,
    attack: 4,
  },
  insight: {
    name: "of Insight",
    text: "+6 Mind and +3 Endurance.",
    mind: 6,
    endurance: 3,
  },
  swiftness: {
    name: "of Swiftness",
    text: "+5 Agility, +8 speed, +20 range.",
    agility: 5,
    speed: 8,
    range: 20,
  },
  bastion: {
    name: "of the Bastion",
    text: "+4 Armor and +4 Vitality.",
    armor: 4,
    vitality: 4,
  },
  impact: {
    name: "of Impact",
    text: "+7 attack, +30 knockback.",
    attack: 7,
    knock: 30,
  },
  resolve: {
    name: "of Resolve",
    text: "+7 Endurance and +3 Mind.",
    endurance: 7,
    mind: 3,
  },
};
export const ENCHANTMENTS = {
  meteor: {
    name: "Starfall",
    text: "Active: spends 16 mana to cast an explosive fire meteor every 18s.",
    spell: "ember",
    cooldown: 18,
    power: 1.2,
    color: "#eea065",
  },
  gravity: {
    name: "Singularity",
    text: "Active: spends 16 mana on a pulling Gravity Curse every 20s.",
    spell: "gravity",
    cooldown: 20,
    power: 1.1,
    color: "#aa91d2",
  },
  sanctuary: {
    name: "Hearthguard",
    text: "Active: spends 16 mana to place a modest healing Blessing every 24s.",
    spell: "heal",
    cooldown: 24,
    power: 0.7,
    color: "#e8d28d",
  },
  winter: {
    name: "Whiteout",
    text: "Active: spends 16 mana to cast a wide slowing Frost Curse every 19s.",
    spell: "frost",
    cooldown: 19,
    power: 1.1,
    color: "#9fdbe0",
  },
  tempest: {
    name: "Tempest",
    text: "Active: spends 16 mana on a storm burst every 17s.",
    spell: "storm",
    cooldown: 17,
    power: 1.15,
    color: "#bbabf0",
  },
};
export const WEAPON_MODIFIERS = {
  prefix: PREFIXES,
  affix: AFFIXES,
  enchantment: ENCHANTMENTS,
};
export function weaponModifiers(item) {
  return Object.entries(WEAPON_MODIFIERS).flatMap(([kind, defs]) =>
    item?.[kind] && defs[item[kind]]
      ? [{ kind, key: item[kind], ...defs[item[kind]] }]
      : [],
  );
}
const FINISHES = {
  ironblade: ["#a8bdb2", "#997947"],
  dagger: ["#b9c9cb", "#78988c"],
  greatblade: ["#8b9b9e", "#bca064"],
  salamander: ["#bdb19b", "#986b48"],
  rapier: ["#d2d7ca", "#ad9778"],
  cutlass: ["#a1b7b7", "#aa8860"],
  falchion: ["#9cabb7", "#b3a18b"],
  kukri: ["#8daba1", "#7a6547"],
  estoc: ["#bdcad2", "#8f8d70"],
  twinblade: ["#a9c1a1", "#947b58"],
  flamberge: ["#abb2a0", "#9e7954"],
  executioner: ["#7d9190", "#ba9958"],
  hatchet: ["#99afa3", "#926743"],
  waraxe: ["#9caaa0", "#b79861"],
  crescentaxe: ["#aebdb3", "#778a64"],
  hammer: ["#c4d0c9", "#90714e"],
  monkmaul: ["#a4acaa", "#b3a485"],
  flail: ["#a1afb1", "#977a51"],
  morningstar: ["#8f9c87", "#9b815d"],
  club: ["#977348", "#c3a376"],
  longbow: ["#9b7049", "#d9be89"],
  shortbow: ["#aa926c", "#c8aa75"],
  recurved: ["#a27c56", "#d6c395"],
  stormbow: ["#738c91", "#c0a97b"],
  bonebow: ["#d3c9ad", "#927b59"],
  crossbow: ["#8b9a90", "#b29a67"],
  arbalest: ["#76888a", "#a18a5f"],
  repeatingbow: ["#a19c7b", "#c5af78"],
  musket: ["#647d7a", "#b39a75"],
  revolver: ["#869998", "#c19b65"],
  blunderbuss: ["#ac9a73", "#c7ad77"],
  handcannon: ["#8e9584", "#c6a174"],
  cannon: ["#758b7c", "#b3956d"],
  arquebus: ["#8c9f9b", "#977955"],
  pepperbox: ["#87979b", "#ccac70"],
  mortar: ["#9b967b", "#a38557"],
  longrifle: ["#70868a", "#b4a27a"],
  duelpistol: ["#afbbb5", "#e2d2a5"],
  lens: ["#97b7bf", "#c5b281"],
  ember: ["#b78c6c", "#917557"],
  frost: ["#b0d0d0", "#a7ad99"],
  willowstaff: ["#8ba77d", "#8f704b"],
  crystalstaff: ["#c3adc6", "#b79f72"],
  sunstaff: ["#d2b271", "#927647"],
  bonewand: ["#ded3b5", "#aaa083"],
  forkedrod: ["#b5a387", "#b99464"],
};
const ENGRAVINGS = {
  ironblade: '<path d="M50 25v31m0-11-5-5m5-7 4-5"/>',
  dagger: '<path d="M45 37q9 4 3 10t2 11"/>',
  greatblade: '<path d="M50 25v30m-5-27h10"/>',
  salamander: '<path d="m48 50 6-3-2-7 7-4"/>',
  rapier: '<path d="M50 82h7"/>',
  twinblade: '<path d="m46 21 5 7m-5 49 6 4"/>',
  executioner: '<path d="M46 32h11m-11 9h11m-11 10h11"/>',
  waraxe: '<path d="m24 29 10 4-2 10m38-14-9 4 2 10"/>',
  monkmaul: '<path d="m50 24 6 7-6 7-6-7Z"/>',
  hammer: '<path d="M30 26h36m-36 9h36"/>',
  club: '<path d="M44 48v9m4 18v6"/>',
  crossbow: '<path d="M47 59h6m-6 8h6"/>',
  arbalest: '<path d="M46 69h9m-9 8h9"/>',
  revolver: '<circle cx="38" cy="39" r="3"/><circle cx="44" cy="39" r="3"/>',
  pepperbox: '<path d="M31 52h17"/>',
  duelpistol: '<path d="m36 65 6 5-3 6"/>',
  sunstaff: '<circle cx="50" cy="29" r="5"/>',
  frost: '<path d="M50 17v14m-5-9 10 6m-10 0 10-6"/>',
  lens: '<circle cx="51" cy="32" r="6"/>',
};
export function weaponShape(key) {
  const d = WEAPONS[key];
  if (!d) return "";
  const [blade, trim] = d.shape.split("|"),
    [metal, handle] = FINISHES[key] || ["#b9c4bd", "#b89b66"];
  return `<g data-weapon-art="${key}" stroke-linejoin="round" stroke-linecap="round"><path d="${blade}" fill="${metal}" stroke="#50685e" stroke-width="2.5"/><path d="${blade}" fill="none" stroke="#ece8cf" stroke-width=".7" opacity=".5" transform="translate(-.5 -.5)"/><path d="${trim}" fill="none" stroke="${handle}" stroke-width="5"/><g fill="none" stroke="#f0e6c5" stroke-width="1.6" opacity=".75">${ENGRAVINGS[key] || ""}</g>${["sidearm", "longarm", "artillery"].includes(d.weaponKind) ? '<path d="M45 59q-11 8 0 14" fill="none" stroke="#536b61" stroke-width="2"/>' : ""}</g>`;
}

for (const d of Object.values(WEAPONS)) {
  const nums = [
    "attack",
    "strength",
    "mind",
    "agility",
    "endurance",
    "armor",
    "range",
    "knock",
    "splash",
  ]
    .filter((k) => d[k])
    .map((k) => "+" + d[k] + " " + k);
  d.desc =
    nums.join(", ") +
    ". Fits " +
    WEAPON_KINDS[d.weaponKind] +
    "." +
    (d.minStrength ? " Requires " + d.minStrength + " Strength." : "") +
    (d.onlyClasses ? " Restricted to Monks." : "") +
    (d.scatter ? " Scatter attack hits " + d.scatter + " targets." : "");
}
