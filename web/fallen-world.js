// The current collection canon. Compatibility definitions remain in data.js;
// these ordered pools alone drive new ordinary recruits and creation choices.
export const PLAYABLE_RACES = Object.freeze([
  "Human", "Elf", "Dwarf", "Nereid", "Fae", "Chitin", "Gnome",
  "Gnoll", "Naga", "Myconoid", "Automaton", "Ent", "Celestial", "Voidborn",
]);
export const PLAYABLE_CLASSES = Object.freeze([
  "vanguard", "ranger", "assassin", "mage", "healer", "berserker",
  "paladin", "bard", "monk", "necromancer", "alchemist", "psion",
]);
export const RACE_LORE = Object.freeze({
  Human: "Scavengers, soldiers and firekeepers. They build tomorrow from whatever the old world left behind.",
  Elf: "Wardens of forests growing through the bones of silent cities. Their bows outlasted the machines.",
  Dwarf: "The last tunnel clans know which ancient engines can still be woken, and which must remain buried.",
  Nereid: "Amphibious descendants of the flooded districts, carrying songs older than the drowned power stations.",
  Fae: "Moth-winged wanderers drawn to the Eternal Bonfire. Small lights endure even after the stars go out.",
  Chitin: "Armored insect folk who reclaimed the buried transit hives. Four arms, patient hands, unbroken shells.",
  Gnome: "Goggle-eyed salvagers who turn broken relics into working tools, with varying regard for explosions.",
  Gnoll: "Hyena folk of the scrap roads. Their caravans find a way through places the old maps call impassable.",
  Naga: "Serpentine keepers of the flooded underways, coiling through shattered aqueducts and forgotten shrines.",
  Myconoid: "Walking colonies born in the dark. Their violet caps shelter new life among the ruins.",
  Automaton: "Awakened bronze survivors of the lost civilization. Some remember their purpose. None remember the sun.",
  Ent: "Ancient walking trees rooting through concrete and steel, slowly taking the ruined world back.",
  Celestial: "Winged remnants of a vanished radiance. Their halos are memories of a light the curse could not erase.",
  Voidborn: "Figures shaped by the darkness itself, choosing the warmth of the fire over the silence beyond it.",
});

export function installFallenWorld({ RACES, CLASSES, SCHOOLS, LINEAGES, RACE_SIZES, CLASS_WEAPONS, LOCATIONS, growthTable }) {
  const additions = {
    Chitin: { source: "Dwarf", color: "#a77552", base: [15, 4, 10, 6, 8, 13], mass: 1.45,
      text: "Carapace · armored foundation, 45% more mass and 200-range night sight", passive: "Carapace" },
    Gnoll: { source: "Human", color: "#af946b", base: [13, 1, 12, 5, 14, 10], speed: 7,
      text: "Scrap runner · +7 movement speed", passive: "Scrap runner" },
    Naga: { source: "Human", color: "#8f9b63", base: [14, 2, 10, 9, 10, 11], mass: 1.3, dodge: .05,
      text: "Coiled guard · 30% more mass and 5% evasion", passive: "Coiled guard" },
  };
  const statKeys = ["vitality", "armor", "strength", "mind", "agility", "endurance"];
  for (const [key, { source, base, ...def }] of Object.entries(additions)) {
    // Do not inherit a source race's hidden mechanics (for example Human XP).
    const stats = Object.fromEntries(statKeys.map((k, i) => [k, base[i]]));
    RACES[key] = { ...def, base: stats, growthTable: growthTable({
      vitality: .19 + stats.vitality * .008, armor: .1 + stats.armor * .006,
      strength: .08 + stats.strength * .012, mind: .08 + stats.mind * .012,
      agility: .06 + stats.agility * .006, endurance: .1 + stats.endurance * .009,
    }) };
    LINEAGES[key] = structuredClone(LINEAGES[source]);
  }
  for (const [name, previous] of [["Myconoid", "Myconid"], ["Voidborn", "Shade"]]) {
    RACES[name] = structuredClone(RACES[previous]);
    LINEAGES[name] = structuredClone(LINEAGES[previous]);
    RACE_SIZES[name] = [...RACE_SIZES[previous]];
  }
  Object.assign(RACE_SIZES, { Chitin: [1.08, 1.12], Gnoll: [1.08, 1.08], Naga: [1.05, 1.25] });
  RACES.Automaton.color = "#af805b";
  CLASSES.vanguard.label = "Fighter";
  CLASSES.assassin.label = "Rogue";
  CLASSES.mage.label = "Wizard";
  CLASSES.berserker = {
    ...structuredClone(CLASSES.vanguard), label: "Barbarian", recipe: "vanguard",
    role: "Frontline", color: "#b9946c", armorWeight: "medium", speed: 49,
    base: { vitality: 4, strength: 7 },
    growthTable: growthTable({ vitality: .38, strength: .57, endurance: .19 }),
    slots: [{ label: "Weapon", types: ["weapon"], weaponKinds: ["heavy", "blunt", "polearm", "blade"] },
      { label: "Charm", types: ["charm"] }],
    ability: "Ruin cleaver", cooldown: 8, equipment: "sword", starter: "hatchet",
    behavior: "A hard-hitting survivor in hides and scavenged plate. High Strength and Vitality trade away Armor.",
    abilityText: "Sweep nearby grounded enemies for 32 base damage and heavy knockback; Strength and class growth amplify the strike.",
  };
  CLASS_WEAPONS.berserker = ["heavy", "blunt", "polearm", "blade"];
  SCHOOLS.berserker = [
    { id: "scrapbreaker", name: "Scrapbreaker", text: "Break the old world's defenses. +6 Strength and 30% stronger signature strikes.", bonus: { strength: 6 }, power: 1.3 },
    { id: "ashguard", name: "Ashguard", text: "Endure where others fall. +6 Vitality and +5 Endurance.", bonus: { vitality: 6, endurance: 5 } },
  ];
  for (const [key, def] of Object.entries(RACES)) {
    def.legacy = !PLAYABLE_RACES.includes(key);
    if (RACE_LORE[key]) def.lore = RACE_LORE[key];
  }
  for (const [key, def] of Object.entries(CLASSES)) def.legacy = !PLAYABLE_CLASSES.includes(key);
  const raceReplacements = { Orc: "Gnoll", Kobold: "Chitin", Shade: "Voidborn", Myconid: "Myconoid", Sylph: "Fae", Drakeling: "Naga", Owlkin: "Celestial", Bearkin: "Gnoll" };
  const classReplacements = { guardian: "paladin", engineer: "alchemist", summoner: "necromancer", artillery: "alchemist", envoy: "bard", trapper: "ranger", minelayer: "alchemist", druid: "healer", duelist: "berserker" };
  for (const loc of Object.values(LOCATIONS)) {
    loc.races = [...new Set(loc.races.map(r => raceReplacements[r] || r))];
    loc.classes = [...new Set(loc.classes.map(c => classReplacements[c] || c))];
  }
  LOCATIONS.greenway.lore = "The forest has swallowed the old transit lines. A broken relay still pulses beyond Fernbridge.";
  LOCATIONS.marsh.lore = "Floodwater carries faint light through the conduits of a drowned civilization.";
  LOCATIONS.volcano.lore = "The mountain forges burn without masters. Something still feeds their ancient furnaces.";
  LOCATIONS.cinder.lore = "Homes cling to the shells of forgotten towers. The old roads lead below them.";
  LOCATIONS.jungle.lore = "Roots tear through observatories and sleeping engines. The forest remembers what the ruins forget.";
}
