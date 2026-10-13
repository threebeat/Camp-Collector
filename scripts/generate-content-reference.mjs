// Rebuild a readable inventory from current definitions; values are a snapshot, not design promises.
import { mkdir, writeFile } from "node:fs/promises";
import * as D from "../web/data.js";
import { REGIONS, REGION_ORDER, REGION_CHAMPIONS } from "../web/journeys.js";
import { BUILDINGS } from "../web/world.js";
import { GUILDS, DIFFICULTY_GATES, CAMP_XP_TEXT } from "../web/evernight.js";
import { NIGHT_SIGHT } from "../web/lighting.js";
const text = (v) =>
  String(v ?? "—")
    .replace(/\|/g, "/")
    .replace(/\n/g, " ");
const table = (headers, rows) =>
  "| " +
  headers.join(" | ") +
  " |\n| " +
  headers.map(() => "---").join(" | ") +
  " |\n" +
  rows.map((row) => "| " + row.map(text).join(" | ") + " |").join("\n") +
  "\n";
const stats = (obj) =>
  Object.entries(obj || {})
    .map(([key, value]) => `${key} +${value}`)
    .join(", ") || "—";
let out =
  "# Current content reference\n\nGenerated with `node scripts/generate-content-reference.mjs` for version 0.6.0. These tables describe current content; all names, counts, balance and progression choices may change. Stable IDs are useful save references, not a requirement to keep every design forever.\n\n";
out +=
  "## Races\n\nRace foundation values precede class, levels and equipment. Growth tables are in `web/data.js`.\n\n" +
  table(
    [
      "Race",
      "Vitality",
      "Armor",
      "Strength",
      "Mind",
      "Agility",
      "Endurance",
      "Racial trait",
    ],
    Object.entries(D.RACES).map(([name, r]) => [
      name,
      ...D.CORE_STATS.map((k) => r.base[k]),
      r.text,
    ]),
  );
out +=
  "\n## Playable classes\n\nInternal IDs can differ from player-facing names. Hexweaver (`witch`) and Stormwing (`stormcaller`) are retained internally as technique definitions, not separately generated playable classes.\n\n" +
  table(
    [
      "ID / name",
      "Starting stat additions",
      "Armor",
      "Equipment slots",
      "Active technique",
    ],
    Object.entries(D.CLASSES)
      .filter(([key]) => !["witch", "stormcaller"].includes(key))
      .map(([key, c]) => [
        key + " / " + c.label,
        stats(c.base),
        c.armorWeight,
        c.slots
          .map(
            (s) => s.label + " (" + (s.weaponKinds || s.types).join(", ") + ")",
          )
          .join("; "),
        c.ability + " — " + c.abilityText,
      ]),
  );
out +=
  "\n## Class point sequence and subclasses\n\nPoints at 10 / 20 / 40 / 60 / 80 alternate talent, subclass, talent, advanced subclass and talent. Every path begins with Firekeeper discipline; Forceful or Measured technique follows the first subclass, with Evernight mastery after the advanced subclass. This is separate from equipment transformations at 20 / 40 / 60.\n\n" +
  table(
    ["Class", "First subclasses (20)", "Advanced subclasses (60)"],
    Object.entries(D.CLASSES)
      .filter(([key]) => !["witch", "stormcaller"].includes(key))
      .map(([key, c]) => {
        const nodes = D.classTree({
          classId: key,
          level: 100,
          classNodes: [],
        }).flatMap((p) => p.nodes);
        return [
          c.label,
          nodes
            .filter((n) => n.level === 20)
            .map((n) => n.name)
            .join("; "),
          [
            ...new Set(nodes.filter((n) => n.level === 60).map((n) => n.name)),
          ].join("; "),
        ];
      }),
  );
out +=
  "\n## Camp, food and world tiers\n\n" +
  CAMP_XP_TEXT +
  " Level 1 requires 100 XP; each next requirement increases by 60. Camps stop at level 100. Capacity begins at 40 and gains 20 per cabin; full Camps miss character rewards. Food consumes one portion per adventurer every twelve hours; each portion grants five base XP, with racial modifiers. Fed recovery is twice as fast and visitor-cycle wanderer chance rises to 80% from 35%. Final boss journeys give one Boss Sigil; one Sigil opens any chosen unopened map.\n\n" +
  table(
    [
      "World tier",
      "Distinct bosses required",
      "Foe health",
      "Foe damage",
      "Reward multiplier",
    ],
    Object.entries(DIFFICULTY_GATES).map(([key, gate]) => [
      D.DIFFICULTIES[key].name,
      gate,
      D.DIFFICULTIES[key].health,
      D.DIFFICULTIES[key].damage,
      D.DIFFICULTIES[key].reward,
    ]),
  );
out +=
  "\n## Light and night vision\n\nUtility lights are separate from the eight general equipment slots. Terrain occludes detection and fog consistently. Ordinary sight is 55; Elf/Nereid sight is 95. Vampire sight is 300, Werewolf 250 and learned Night vision 190. The strongest sight applies.\n\n" +
  table(["Race", "Night sight radius"], Object.entries(NIGHT_SIGHT)) +
  "\n" +
  table(
    ["Light ID", "Name", "Radius"],
    Object.entries(D.ITEMS)
      .filter(([, d]) => d.lightRadius)
      .map(([key, d]) => [key, d.name, d.lightRadius]),
  );
out +=
  "\n## Guilds\n\nLessons add ten standing and claimed guild patrols add twenty. At twenty standing, the level-20 member item unlocks once per twelve hours; its base 60-gold price discounts by standing / 500 up to 40%. All eight booths offer a 35-gold stat lesson.\n\n" +
  table(
    ["ID / guild", "Profession / stat", "Patrol resource", "Exclusive item"],
    GUILDS.map((d) => [
      d.id + " / " + d.name,
      d.profession || d.stat,
      d.resource,
      D.ITEMS["guild-" + d.id].name,
    ]),
  );
out +=
  "\n## Weapon bases\n\nEach of these keys has its own SVG silhouette. `weaponKind` controls slot compatibility. More restrictions may apply. The four authored Mythical weapons are separately marked.\n\n" +
  table(
    ["ID", "Base name", "Family", "Attack", "Restrictions / identity"],
    Object.entries(D.WEAPONS).map(([key, w]) => [
      key,
      w.name,
      w.weaponKind,
      w.attack,
      [
        w.minStrength ? "Strength " + w.minStrength + "+" : "",
        w.onlyClasses ? "Classes: " + w.onlyClasses.join(", ") : "",
        w.mythicalOnly ? "Authored Mythical / " + w.mythicTheme : "",
      ]
        .filter(Boolean)
        .join("; ") || "Ordinary base",
    ]),
  );
out +=
  "\n## Other equipment\n\nArmor occupies separate Head, Chest, Legs and Boots slots. Accessory and tool compatibility is checked against each character.\n\n" +
  table(
    ["ID", "Name", "Type / weight / position", "Effect"],
    Object.entries(D.ITEMS)
      .filter(([key]) => !D.WEAPONS[key])
      .map(([key, d]) => [
        key,
        d.name,
        [d.type, d.weight, d.armorSlot].filter(Boolean).join(" / "),
        d.desc,
      ]),
  );
out +=
  "\n## Attributes and Talents\n\nAttributes are passive conditions or traits; Miner, Lumberjack and Hunter are Guildhall Professions. Talents include timed stat training and legacy learned skills. Both have levels and rarities. Every race also contributes its own racial Attribute, and each trained stat gets a separate training Talent.\n\n" +
  table(
    ["Attribute", "Effect"],
    Object.entries(D.ATTRIBUTES)
      .filter(([key]) => !["Volunteer", "Converted"].includes(key))
      .map(([key, d]) => [key, d.text]),
  );
out +=
  "\n" +
  table(
    ["Talent", "Effect"],
    [
      ...Object.entries(D.TALENTS).map(([key, d]) => [key, d.text]),
      ...D.CORE_STATS.map((k) => [
        "training:" + k,
        "Permanent " + k + " bonus, increased by repeated timed training.",
      ]),
    ],
  );
out +=
  "\n## Companions\n\n" +
  table(
    ["ID", "Name", "Behavior", "Acquisition", "Effect"],
    Object.entries(D.PETS).map(([key, d]) => [
      key,
      d.name,
      d.mode,
      d.eggOnly
        ? "Archaeology / dinosaur egg"
        : d.fossilOnly
          ? "Archaeology / " + d.fossilCost + " fossils"
          : "Market or milestone",
      d.text,
    ]),
  );
out +=
  "\n## Cosmetic inventory\n\nAppearance overrides preserve mechanical race, class, stats, slots and pet behavior.\n\n" +
  table(
    ["ID", "Name", "Scope", "Gem price", "Description"],
    Object.entries(D.COSMETICS).map(([key, d], i) => [
      key,
      d.name,
      d.type || "Character palette",
      d.gems || 3 + i * 2,
      d.text,
    ]),
  );
out +=
  "\n## Authored Mythical characters\n\nThese are original in-game identities. Normal generation does not roll them.\n\n" +
  table(
    ["ID", "Name", "Race / class", "Signature weapon", "Gem price", "Theme"],
    Object.entries(D.MYTHICAL_HEROES).map(([key, d]) => [
      key,
      d.name,
      d.race + " / " + D.CLASSES[d.classId].label,
      d.weapon,
      d.price,
      d.text,
    ]),
  );
out +=
  "\n## Maps\n\nLater region names appear here for developers; the Crossroads picker only reveals unlocked maps after the portal wizard is unlocked.\n\n" +
  table(
    ["ID", "Name", "Nodes / roads", "Mini-boss node IDs", "Final champion"],
    REGION_ORDER.map((key) => [
      key,
      D.LOCATIONS[key].name,
      REGIONS[key].nodes.length + " / " + REGIONS[key].roads.length,
      REGION_CHAMPIONS[key].minis.join(", "),
      REGION_CHAMPIONS[key].boss,
    ]),
  );
out +=
  "\n## Camp buildings\n\n" +
  table(
    ["ID", "Name", "Purpose", "Build cost / requirement"],
    Object.entries(BUILDINGS).map(([key, d]) => [
      key,
      d.name,
      d.text,
      d.cost
        ? Object.entries(d.cost)
            .map(([k, v]) => v + " " + k)
            .join(", ") +
          (d.expansion ? "; expansion: " + d.expansion : "") +
          (d.minRoster ? "; roster " + d.minRoster + "+" : "")
        : "Available initially",
    ]),
  );
for (const [domain, pool] of [
  ["Weapon", D.WEAPON_MODIFIERS],
  ["Armor", D.ARMOR_MODIFIERS],
  ["Companion", D.PET_MODIFIERS],
]) {
  out +=
    "\n## " +
    domain +
    " modifiers\n\nThere are currently 24 prefixes, 24 affixes and 24 enchantments in this domain. Each has a visual signature. Compatibility filters can narrow its pool.\n\n";
  for (const [type, defs] of Object.entries(pool))
    out +=
      "### " +
      type +
      "\n\n" +
      table(
        ["ID", "Name", "Mechanical effect", "Visual / restriction"],
        Object.entries(defs).map(([key, d]) => [
          key,
          d.name,
          d.text,
          [
            d.visual?.style,
            d.weaponKinds?.join(", "),
            d.armorWeights?.join(", "),
            d.petKeys?.join(", "),
          ]
            .filter(Boolean)
            .join(" / ") || "Universal in this domain",
        ]),
      ) +
      "\n";
}
await mkdir(new URL("../docs/", import.meta.url), { recursive: true });
await writeFile(new URL("../docs/CONTENT_REFERENCE.md", import.meta.url), out);
console.log(
  "Updated docs/CONTENT_REFERENCE.md from the current content definitions.",
);
