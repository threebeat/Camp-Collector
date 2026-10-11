import { weaponShape } from "./weapons.js?v=14";
import {
  MYTHICAL_HEROES,
  CLASSES,
  RACES,
  combatClass,
  ITEMS,
  itemInfo,
  COSMETICS,
  PETS,
  itemRarity,
  RARITY_COLORS,
  heroRarity,
  hasAttribute,
  GEM_KINDS,
  characterSize,
  objectModifiers,
  flightType,
  petInfo,
} from "./data.js?v=14";
const paths = {
  stone:
    '<path d="m3 17 2-9 7-4 8 5 2 9-10 3Z"/><path d="m5 8 7 5 8-4m-8 4v8"/>',
  ore: '<path d="m3 18 3-10 7-5 7 8 1 9-10 1Z"/><path d="m8 14 4-6 5 7-5 3Zm-3 3h3"/>',
  bone: '<path d="M7 5c-4-5-8 0-4 4l5 1 6 6 1 5c4 4 9 0 4-4l-5-1-6-6Z"/>',
  hammer: '<path d="m3 5 10-3 5 8-11 3Zm9 7 8 10"/>',
  sword: '<path d="m6 18 9-9 3-6 3 3-6 3-9 9m-3-6 6 6m-7 1 3-3"/>',
  shield:
    '<path d="M12 3 4 6v5c0 5 8 10 8 10s8-5 8-10V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>',
  bow: '<path d="M5 3c17 1 17 17 0 18L5 3Z"/><path d="M2 12h19m-4-4 4 4-4 4"/>',
  spark:
    '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z"/>',
  gear: '<path d="m10 3 4 0 .8 3 2.6 1.5 3-.8 2 3.5-2.2 2.3v3l2.2 2.3-2 3.5-3-.8-2.6 1.5-.8 3h-4l-.8-3-2.6-1.5-3 .8-2-3.5 2.2-2.3v-3L1.6 9.2l2-3.5 3 .8L9.2 5 10 3Z" transform="translate(1 -1) scale(.9)"/><circle cx="12" cy="12" r="3"/>',
  dagger: '<path d="m8 16 3-10 8-3-3 8-8 5Zm-3-3 6 6m-7 1 4-4"/>',
  paw: '<ellipse cx="12" cy="16" rx="6" ry="5"/><ellipse cx="4" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="21" cy="12" rx="2" ry="3"/>',
  flame:
    '<path d="M13 2c3 7-3 7 1 11 2-1 4-3 4-5 6 8 2 14-6 14S1 14 6 8c-1 6 3 6 4 4-2-4 0-7 3-10Z"/>',
  music:
    '<path d="M9 17V6l11-3v11M9 10l11-3"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="15" rx="3" ry="3"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/><path d="m18 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/>',
  cannon:
    '<path d="M4 15h16M6 12l12-7 3 5-13 5-2-3Zm0 7h14"/><circle cx="7" cy="18" r="3"/><circle cx="17" cy="18" r="3"/>',
  bolt: '<path d="m14 2-10 12h7l-1 8 10-12h-7l1-8Z"/>',
  snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4 1-1-4M18 17l-1-4 4 1M3 14l4-1-1 4M18 7l-1 4 4-1"/>',
  wing: '<path d="M12 19C1 16 1 3 4 3c3 0 6 7 8 10 2-3 5-10 8-10 3 0 3 13-8 16Zm0 0v3"/>',
  flag: '<path d="M5 22V3m0 1h13l-3 5 3 5H5"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 7h-4c-5 0-4 5 0 5h2c4 0 5 5 0 5H9m3-12v14"/>',
  heart: '<path d="M12 21 3.5 12.5C-2 6 7 0 12 7c5-7 14-1 8.5 5.5L12 21Z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  play: '<path d="m8 4 13 8-13 8V4Z"/>',
  pause: '<path d="M7 4v16M17 4v16"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  settings:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  book: '<path d="M12 5c-4-3-9-2-10-1v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v15"/>',
  camp: '<path d="m12 3-10 17h20L12 3Zm0 8-5 9m5-9 5 9"/>',
  skull:
    '<path d="M7 17c-7-4-4-14 5-14s12 10 5 14v4H7v-4Z"/><circle cx="8" cy="11" r="2"/><circle cx="16" cy="11" r="2"/><path d="M10 17h4m-4 0v4m4-4v4"/>',
  shuffle:
    '<path d="M3 6h3l12 12h3m-4-4 4 4-4 4M3 18h3l4-4m4-4 4-4h3m-4-4 4 4-4 4"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  leaf: '<path d="M4 20C-2 4 12 6 20 2c2 10-2 21-12 16L4 20Zm0 0L15 9"/>',
  army: '<circle cx="12" cy="6" r="3"/><path d="M7 16v-3a5 5 0 0 1 10 0v3M2 20v-4m20 4v-4M5 4a3 3 0 0 0 0 6m14-6a3 3 0 0 1 0 6M8 21v-4h8v4"/>',
};
export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}
let portraitSerial = 0;
function hueColor(hue) {
  const s = 0.28,
    l = 0.62,
    c = (1 - Math.abs(2 * l - 1)) * s,
    h = (((hue % 360) + 360) % 360) / 60,
    x = c * (1 - Math.abs((h % 2) - 1)),
    m = l - c / 2;
  const rgb =
    h < 1
      ? [c, x, 0]
      : h < 2
        ? [x, c, 0]
        : h < 3
          ? [0, c, x]
          : h < 4
            ? [0, x, c]
            : h < 5
              ? [x, 0, c]
              : [c, 0, x];
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round((v + m) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
function armorColor(item) {
  return (
    ITEMS[item.key].visualColor ||
    { light: "#8e8ba8", medium: "#81927e", heavy: "#96aab2" }[
      ITEMS[item.key].weight
    ] ||
    "#a4a797"
  );
}
function wornArmorArt(hero) {
  return (hero.armor || [])
    .map((item, index) => {
      if (!item) return "";
      const color = armorColor(item),
        stroke = RARITY_COLORS[itemRarity(item)];
      const paths = [
        ITEMS[item.key].weight === "heavy"
          ? "M31 28Q30 8 50 9T69 28L66 38l-6-7H40l-6 7Z"
          : "M28 31Q25 7 50 9T73 31L67 44l-6-17H39l-7 17Z",
        "M32 58 50 65 69 58 70 78 50 89 30 78Z",
        "M34 82h31l6 14-14 1-6-10-5 10H30Z",
        "M31 94h15v8H25v-5Zm24 0h15l6 5v3H55Z",
      ];
      return `<g data-worn-armor="${["head", "chest", "legs", "boots"][index]}" fill="${color}" stroke="${stroke}" stroke-width="1.8"><path d="${paths[index]}"/>${item.mythical ? '<path d="m32 96 4-5 4 5m20 0 4-5 4 5" fill="#f1dcff" stroke="#b48be0"/>' : ""}${item.evolution ? '<path d="m49 ' + [15, 70, 85, 97][index] + ' 3-3 3 3-3 3Z" fill="#ffe5a0"/>' : ""}</g>`;
    })
    .join("");
}

export function portraitSvg(hero, small = false) {
  const guise =
    COSMETICS[hero.cosmetic]?.type === "character"
      ? COSMETICS[hero.cosmetic].skin
      : MYTHICAL_HEROES[hero.mythicKey]?.skin;
  if (guise) return guiseSvg(guise, hero);
  if (hero.creature) return creatureSvg(hero);
  if (["Shade", "Sylph"].includes(hero.race)) return smokeCharacterSvg(hero);
  const gradientId = "coat-" + ++portraitSerial;
  hero = { ...hero, classId: combatClass(hero) };
  const base = CLASSES[hero.classId],
    c = {
      ...base,
      color:
        hero.specialization === "gravity"
          ? "#b1a5d7"
          : hero.specialization === "frost"
            ? "#acd0d7"
            : hero.specialization === "ember"
              ? "#e49a7b"
              : hueColor(
                  COSMETICS[hero.cosmetic]?.hue ?? hero.appearance?.hue ?? 185,
                ),
    },
    skin = RACES[hero.race].color,
    hair = ["#644c40", "#c79858", "#626f7d", "#493d63", "#8f4852", "#dae6ef"][
      hero.appearance?.hair || 0
    ];
  const gid =
    "coat-" + String(hero.id || hero.classId).replace(/[^a-zA-Z0-9_-]/g, "");
  let hat = "",
    weapon = "",
    extras = "";
  const gear = hero.items?.filter(Boolean) || [],
    held = gear.find((i) =>
      ["weapon", "focus", "tool"].includes(ITEMS[i.key].type),
    ),
    armor = hero.armor?.[1] || gear.find((i) => ITEMS[i.key].type === "armor");
  c.equipment = held
    ? {
        greatblade: "greatsword",
        salamander: "sword",
        stormbow: "bow",
        axe: "axe",
        pickaxe: "pick",
        monkmaul: "mace",
        ironblade: "sword",
        longbow: "bow",
        dagger: "dagger",
        hammer: "hammer",
        cannon: "cannon",
        lute: "lute",
        lens: "staff",
        ember: "staff",
        frost: "staff",
      }[held.key] || "hammer"
    : "";
  if (!held && gear.some((i) => i.key === "aegis")) c.equipment = "shield";
  if (hero.classId === "guardian")
    hat =
      '<path d="M31 31Q32 10 50 10T69 31L63 38H37Z" fill="#7f9996"/><path d="M34 29h32M50 13v13" stroke="#c5d3c8" stroke-width="3"/>';
  else if (hero.classId === "ranger")
    hat =
      '<path d="M27 34Q29 5 51 9Q74 12 73 35L60 24 48 27 37 34Z" fill="#577849"/><path d="M59 16 78 5" stroke="#d1dcb4" stroke-width="4"/>';
  else if (["mage", "witch"].includes(hero.classId))
    hat = `<path d="M20 31 78 31 66 24 51 0 33 24Z" fill="${hero.classId === "mage" ? "#8d6656" : "#626755"}"/><path d="m38 23 28 1" stroke="${c.color}" stroke-width="4"/>`;
  else if (hero.classId === "assassin")
    hat =
      '<path d="M27 43Q21 7 50 7T74 44L64 28 49 24 34 30Z" fill="#68617f"/><path d="m30 39 38 1-4 16H34Z" fill="#68617f"/>';
  else if (hero.classId === "engineer")
    hat =
      '<path d="M26 29Q27 10 49 11T74 30H26Z" fill="#ae8156"/><path d="M28 25h43" stroke="#e3c080" stroke-width="5"/><rect x="32" y="20" width="14" height="10" rx="4" fill="#9ca9a1" stroke="#654f3f" stroke-width="2"/><rect x="49" y="20" width="14" height="10" rx="4" fill="#9ca9a1" stroke="#654f3f" stroke-width="2"/>';
  else if (hero.classId === "bard")
    hat =
      '<path d="M24 27 72 27 63 10 36 12Z" fill="#a07884"/><path d="m58 13 13-12" stroke="#e4ceba" stroke-width="4"/>';
  else if (hero.classId === "artillery")
    hat =
      '<path d="M25 31Q27 9 50 9T73 31Z" fill="#777b73"/><path d="M32 30h36" stroke="#b6bbac" stroke-width="4"/>';
  if (flightType(hero))
    extras += wingArt(flightType(hero), hero.appearance?.wingPose || 0);
  if (
    hero.classId === "vanguard" &&
    ["miner", "lumberjack"].includes(arguments[0].classId)
  )
    hat =
      '<path d="M25 29Q28 8 50 9T75 29Z" fill="#b29b66"/><rect x="45" y="17" width="11" height="9" rx="2" fill="#e7daa0"/>';
  if (hero.race === "Elf")
    extras +=
      '<path d="m31 33-14-5 12 18m38-13 14-5-12 18" fill="' + skin + '"/>';
  if (c.equipment === "sword")
    weapon =
      '<path d="m19 80 5-40 5 40Z" fill="#dbe0cf" stroke="#687770" stroke-width="2"/><path d="M13 78h22m-11 0v14" stroke="#c6a365" stroke-width="4"/>';
  if (c.equipment === "greatsword")
    weapon =
      '<path d="m12 88 3-66 9-13 7 16-12 65Z" fill="#d6d7c3" stroke="#747d71" stroke-width="2"/><path d="m4 80 30 4m-16-3-2 16" stroke="#caa362" stroke-width="5"/>';
  if (c.equipment === "axe" || c.equipment === "pick")
    weapon =
      '<path d="M18 92 25 41" stroke="#926c49" stroke-width="5"/><path d="M9 42q14-18 30 0l-4 14-15-6Z" fill="#a6b4b0" stroke="#646f69" stroke-width="2"/>';
  if (c.equipment === "mace")
    weapon =
      '<path d="M17 92 21 42" stroke="#98825b" stroke-width="5"/><path d="m21 27 12 10-5 14H14L9 37Z" fill="#bcb597" stroke="#e6d4a3" stroke-width="3"/>';
  if (c.equipment === "shield")
    weapon =
      '<path d="M9 52 31 48 44 57 39 80 24 91 9 79Z" fill="#819c9b" stroke="#d6dabf" stroke-width="3"/><path d="M24 57v25m-10-13h21" stroke="#c4d4c3" stroke-width="3"/>';
  if (c.equipment === "bow")
    weapon =
      '<path d="M19 36Q-5 65 19 95L19 36Z" fill="none" stroke="#cfad79" stroke-width="3"/><path d="m11 65 31-8" stroke="#ece3bb" stroke-width="2"/>';
  if (c.equipment === "staff")
    weapon = `<path d="M17 91 13 34" stroke="#b59467" stroke-width="4"/><circle cx="13" cy="30" r="8" fill="${c.color}" stroke="#f0e4b9" stroke-width="2"/><path d="m13 19 2 7-2 7-2-7Z" fill="#ffffd5"/>`;
  if (c.equipment === "hammer")
    weapon =
      '<path d="M17 89 22 49" stroke="#a78151" stroke-width="5"/><rect x="8" y="40" width="26" height="15" rx="3" fill="#a6aaa0" stroke="#e5dbbc" stroke-width="2"/>';
  if (c.equipment === "dagger")
    weapon =
      '<path d="m18 81-5-23 13 19Z" fill="#e4e0d5" stroke="#6e657d" stroke-width="2"/><path d="m15 81 13-7m-10 5 4 10" stroke="#c9b4db" stroke-width="3"/>';
  if (c.equipment === "lute")
    weapon =
      '<ellipse cx="22" cy="74" rx="15" ry="19" fill="#c7a176" stroke="#705a42" stroke-width="2"/><path d="m24 66 10-25" stroke="#b4a080" stroke-width="7"/><ellipse cx="22" cy="72" rx="6" ry="8" fill="#705a42"/><path d="m19 84 16-37m-12 40 16-38" stroke="#e7d9b4" stroke-width="1"/>';
  if (c.equipment === "cannon")
    weapon =
      '<path d="m4 77 4-21 31 6-1 17Z" fill="#7c867d" stroke="#c4c8af" stroke-width="2"/><ellipse cx="6" cy="66" rx="6" ry="12" fill="#464f48"/><circle cx="18" cy="87" r="10" fill="#6f634d" stroke="#c0ad89" stroke-width="3"/>';
  if (!hero.armor?.[0] && ["guardian", "artillery"].includes(hero.classId))
    hat = "";
  const helmet = hero.armor?.[0];
  if (helmet && ITEMS[helmet.key].weight === "heavy")
    hat =
      '<path d="M31 29Q29 9 50 9T69 29L66 38l-6-7H40l-6 7Z" fill="#99a6a0" stroke="' +
      RARITY_COLORS[itemRarity(helmet)] +
      '" stroke-width="2"/><path d="M35 26h30M50 11v12" stroke="#d5d8bb" stroke-width="3"/>';
  if (hero.race === "Celestial") {
    const crowns = [
      '<path d="m31 23 3-18 9 10 7-14 7 14 10-10 3 18Z"/>',
      '<path d="M30 20h40m-35-4 3-12 6 11 6-16 6 16 7-11 3 12" fill="none" stroke-width="4"/>',
      '<path d="m50 0 8 10-8 10-8-10Z"/><ellipse cx="50" cy="23" rx="20" ry="4" fill="none" stroke-width="3"/>',
      '<path d="M31 25q-6-18 7-23m31 23q6-18-7-23" fill="none" stroke-width="4"/><path d="m33 20-6-8 9 2m-1-8-3-6 8 4m27 16 6-8-9 2m1-8 3-6-8 4"/>',
    ];
    hat =
      '<g fill="#e8cd78" stroke="#b89348" class="celestial-crown">' +
      crowns[hero.appearance?.crown || 0] +
      "</g>";
  }
  if (hero.race === "Myconid")
    hat =
      '<path d="M13 31Q18 0 50 0T87 31Z" fill="#a77991" stroke="#785670" stroke-width="2"/><g fill="#e8d8c5"><circle cx="31" cy="16" r="5"/><circle cx="59" cy="11" r="4"/><circle cx="72" cy="24" r="5"/></g>';
  if (hero.race === "Ent")
    hat =
      '<path d="M31 25 27 6 18 0m10 10 10-8m24 23 8-19 11-4m-12 7-7-8" stroke="#6d7950" stroke-width="7"/><path d="M24 9Q2 9 11 0Q24-7 24 9M72 7Q93 18 91 2Q80-8 72 7" fill="#78955c"/>';
  const faceMark = hasAttribute(hero, "Zombie")
    ? '<path d="m35 38 7 3m-5-7-2 9m22 5 8-2" stroke="#6f7762" stroke-width="2"/>'
    : hasAttribute(hero, "Vampire")
      ? '<path d="m44 44 3 6 2-6m4 0 2 6 3-6" fill="#f8eadb"/>'
      : "";
  const equipmentMark = armor
    ? '<path d="M32 58 50 67 69 58 70 78 50 89 30 78Z" fill="' +
      ({
        ward: "#7e9490",
        glacier: "#a8ccd5",
        trailLeather: "#a78362",
        scaleMail: "#749479",
        starRobe: "#968ab3",
        ironPlate: "#8c9aa2",
        "heavy-chest": "#859a96",
        "medium-chest": "#8d9e75",
        "light-chest": c.color,
      }[armor.key] || "#c9b393") +
      '" fill-opacity=".62" stroke="' +
      RARITY_COLORS[itemRarity(armor)] +
      '" stroke-width="3"/>'
    : "";
  const beard =
    hero.race === "Dwarf"
      ? '<path d="M33 42 36 60 50 69 64 57 66 42 58 48 43 48Z" fill="' +
        hair +
        '"/>'
      : "";
  if (held && weaponShape(held.key))
    weapon =
      '<g transform="translate(-3 23) scale(.4 .7)">' +
      weaponPresentation(held) +
      weaponEffectArt(held) +
      "</g>";
  const tier = held ? itemRarity(held) : 0,
    aura =
      held &&
      (itemInfo(held).aura ||
        (held.evolution ? "#e3bd65" : null) ||
        (tier >= 2 ? RARITY_COLORS[tier] : null)),
    glowId = "glow-" + gradientId;
  if (aura)
    weapon = `<g class="weapon-aura" filter="url(#${glowId})">${weapon}</g><g class="rarity-sparks" fill="${aura}">${[0, 1, 2, 3].map((n) => `<circle cx="${7 + n * 5}" cy="${25 + n * 13}" r="${1.2 + (n % 2)}"/>`).join("")}</g>`;
  let eyes = "";
  const eyeColor =
    hasAttribute(hero, "Vampire") || hasAttribute(hero, "Zombie")
      ? "#b25361"
      : ["Shade", "Fae", "Sylph", "Celestial"].includes(hero.race)
        ? "#f6edb8"
        : hero.race === "Myconid"
          ? "#6a476d"
          : ["#485c54", "#706890", "#698d88", "#8a6e4b", "#495163"][
              hero.appearance?.eyes || 0
            ];
  if (hero.race === "Automaton")
    eyes =
      '<rect x="37" y="31" width="8" height="7" rx="2" fill="#eacb7f"/><rect x="54" y="31" width="8" height="7" rx="2" fill="#eacb7f"/><path d="M47 40h6" stroke="#7a8d8b" stroke-width="2"/>';
  else if (hero.race === "Drakeling")
    eyes =
      '<ellipse cx="41" cy="35" rx="5" ry="3" fill="#e9c477"/><ellipse cx="58" cy="35" rx="5" ry="3" fill="#e9c477"/><path d="M41 32v6m17-6v6" stroke="#455044" stroke-width="2"/>';
  else
    eyes = `<ellipse cx="41" cy="35" rx="${hero.race === "Elf" ? 4.8 : 3.5}" ry="${hero.race === "Elf" ? 2.1 : 3.7}" fill="${eyeColor}"/><ellipse cx="58" cy="35" rx="${hero.race === "Elf" ? 4.8 : 3.5}" ry="${hero.race === "Elf" ? 2.1 : 3.7}" fill="${eyeColor}"/><circle cx="40" cy="34" r="1" fill="#fff6dd"/><circle cx="57" cy="34" r="1" fill="#fff6dd"/>`;
  if (["Fae", "Sylph", "Celestial"].includes(hero.race))
    eyes =
      '<path d="m41 30 1 3 4 2-4 1-1 4-1-4-4-1 4-2Zm17 0 1 3 4 2-4 1-1 4-1-4-4-1 4-2Z" fill="#fff0b3"/>';
  if (hero.race === "Shade")
    eyes =
      '<ellipse cx="41" cy="35" rx="5" ry="4" fill="#654978"/><ellipse cx="58" cy="35" rx="5" ry="4" fill="#654978"/><circle cx="41" cy="35" r="2" fill="#e9dbff"/><circle cx="58" cy="35" r="2" fill="#e9dbff"/>';
  if (hero.race === "Ent")
    eyes =
      '<path d="M36 34h10m7 0h10" stroke="#6b754d" stroke-width="6"/><path d="M39 34h3m14 0h3" stroke="#e8d093" stroke-width="3"/>';
  if (hero.race === "Myconid")
    eyes =
      '<ellipse cx="41" cy="35" rx="4" ry="5" fill="#604367"/><ellipse cx="58" cy="35" rx="4" ry="5" fill="#604367"/><circle cx="40" cy="33" r="1.5" fill="#ffead5"/><circle cx="57" cy="33" r="1.5" fill="#ffead5"/>';
  if (hero.race === "Owlkin")
    eyes =
      '<g fill="#e3d6b5" stroke="#8d795d" stroke-width="2"><ellipse cx="40" cy="34" rx="11" ry="12"/><ellipse cx="59" cy="34" rx="11" ry="12"/></g><g fill="#d8ae58"><circle cx="40" cy="34" r="7"/><circle cx="59" cy="34" r="7"/></g><g fill="#35463b"><circle cx="40" cy="34" r="4"/><circle cx="59" cy="34" r="4"/></g><path d="m49 38-4 4 5 7 5-7Z" fill="#b5965c"/>';
  if (hero.race === "Bearkin")
    eyes =
      '<g fill="#3c473c"><circle cx="40" cy="33" r="3"/><circle cx="59" cy="33" r="3"/></g><ellipse cx="50" cy="43" rx="12" ry="9" fill="#c5ae8a"/><path d="m45 40 10 0-5 6Z" fill="#3c473c"/>';
  if (hasAttribute(hero, "Zombie"))
    eyes += '<path d="m55 32 6 5m-6 0 6-5" stroke="#72784e" stroke-width="2"/>';
  let attributeArt = "";
  if (hasAttribute(hero, "Blessed") || hero.race === "Celestial")
    attributeArt +=
      '<ellipse class="attribute-halo" cx="50" cy="6" rx="16" ry="4" fill="none" stroke="#e8d692" stroke-width="2"/>';
  if (hasAttribute(hero, "Werewolf"))
    attributeArt +=
      '<path d="m28 27 2-15 12 11m17 0 12-11 2 15" fill="' + hair + '"/>';
  if (hasAttribute(hero, "Cursed"))
    attributeArt +=
      '<g class="rarity-sparks" fill="#846d9e" opacity=".65"><circle cx="82" cy="64" r="3"/><circle cx="76" cy="49" r="2"/><circle cx="84" cy="86" r="2"/></g>';
  if (hasAttribute(hero, "Shieldbearer"))
    attributeArt +=
      '<path d="m73 65 9 2-1 9-6 5-6-7Z" fill="#abbcb9" stroke="#697b72"/>';
  if (hasAttribute(hero, "Strong"))
    attributeArt +=
      '<path d="m17 69 7 1m51-2 7 1" stroke="#b77866" stroke-width="3"/>';
  if (hasAttribute(hero, "Sturdy"))
    attributeArt +=
      '<path d="M27 60h13v7H27m35-7h12v7H62" fill="#8b9c84" stroke="#bec5a9"/>';
  if (hasAttribute(hero, "Swift"))
    attributeArt +=
      '<path class="rarity-sparks" d="M74 84q15 7 10 14m-10-12q-13 9-7 14" stroke="#a1bcad" stroke-width="2" fill="none"/>';
  if (hasAttribute(hero, "Strongwill") || hasAttribute(hero, "Empath"))
    attributeArt += '<path d="m53 58 3-4 3 4-3 4Z" fill="#d7b9de"/>';
  if (hasAttribute(hero, "Inventive"))
    attributeArt +=
      '<path d="M66 18q15 1 13 10h-7" stroke="#ab996e" stroke-width="3" fill="none"/><circle cx="76" cy="17" r="4" fill="#b9cac3" stroke="#796b51"/>';
  if (armor?.key === "glacier")
    attributeArt +=
      '<path d="m34 69 5-9 4 9m14 0 6-9 4 9" fill="#d1e7e6" stroke="#89b7c1"/>';
  if (armor?.key === "scaleMail")
    attributeArt +=
      '<path d="M36 72q5 9 10 0t10 0t10 0M36 79q5 9 10 0t10 0t10 0" stroke="#aec8a0" stroke-width="2" fill="none"/>';
  if (armor?.key === "starRobe")
    attributeArt +=
      '<g class="rarity-sparks" fill="#e7d7a6"><path d="m36 76 2-5 2 5-2 2m23-6 2-5 2 5-2 3"/><circle cx="50" cy="83" r="2"/></g>';
  if (armor?.key === "trailLeather")
    attributeArt +=
      '<path d="m31 72 13 2-1 9-12-3m26-7 14-1-1 9-12 2" stroke="#d5b589" stroke-width="2" fill="#927452"/>';
  if (armor?.key === "ironPlate")
    attributeArt +=
      '<path d="m27 61 15-6 4 10-18 2m28-2 4-10 16 6-1 6Z" fill="#a9b4b2" stroke="#687c79" stroke-width="2"/>';
  if (hero.race === "Owlkin") {
    hat =
      '<path d="m28 25 2-17 14 11m11 0 16-11 2 17" fill="#967c5d"/><path d="M33 17 42 24m16 0 10-7" stroke="#d8caa7" stroke-width="3"/>';
    extras +=
      '<path d="M29 62q-20 10-17 24l22-9m33-15q20 10 17 24L63 77" fill="#978366" stroke="#c7b797" stroke-width="2"/>';
  }
  if (hero.race === "Bearkin")
    hat =
      '<circle cx="30" cy="18" r="9" fill="#987553"/><circle cx="70" cy="18" r="9" fill="#987553"/><g fill="#d1ad85"><circle cx="30" cy="18" r="5"/><circle cx="70" cy="18" r="5"/></g>';
  attributeArt += (hero.armor || [])
    .map((i, n) =>
      i
        ? `<g transform="translate(20 ${n === 0 ? -6 : n === 1 ? 35 : 59}) scale(.6)">${modifiersArt(i, "armor")}</g>`
        : "",
    )
    .join("");
  const auraArt =
    heroRarity(hero) >= 2
      ? `<ellipse class="character-aura" cx="50" cy="86" rx="36" ry="13" fill="${RARITY_COLORS[heroRarity(hero)]}" opacity=".13"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104" preserveAspectRatio="none"><defs><filter id="${glowId}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2" result="blur"/><feFlood flood-color="${aura || "#ffffff"}"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="${gradientId}" x2="0" y2="1"><stop stop-color="${c.color}"/><stop offset=".45" stop-color="${c.color}"/><stop offset="1" stop-color="${c.color}"/></linearGradient></defs><ellipse cx="50" cy="98" rx="29" ry="5" fill="#203a2c" opacity=".18"/>${auraArt}${wingStyles()}<g class="portrait-body">${extras}<path d="M33 84 30 98h16l3-13m5-1 2 14h16l-6-17" fill="#5b5746"/><path d="M31 58Q50 45 69 58L77 88Q51 102 23 88Z" fill="url(#${gradientId})" stroke="#59604d" stroke-width="2"/><path d="M34 57 47 73 41 94M66 57 53 73l7 21" fill="none" stroke="#445948" stroke-opacity=".4" stroke-width="4"/><path d="M33 59 21 78m46-19 12 20" stroke="${c.color}" stroke-width="12" stroke-linecap="round"/><circle cx="21" cy="78" r="5" fill="${skin}"/><circle cx="79" cy="79" r="5" fill="${skin}"/>${["Orc", "Kobold", "Nereid", "Drakeling", "Automaton", "Ent", "Owlkin", "Bearkin"].includes(hero.race) ? "" : `<path d="M29 26Q30 8 50 9T71 27L67 44H33Z" fill="${hair}"/>`}<ellipse cx="50" cy="35" rx="${hero.race === "Elf" ? 16 : hero.race === "Dwarf" ? 22 : 19}" ry="${hero.race === "Dwarf" ? 18 : 20}" fill="${skin}"/>${["Orc", "Kobold", "Nereid", "Drakeling", "Automaton", "Ent", "Owlkin", "Bearkin"].includes(hero.race) ? '<g fill="' + hair + '"><circle cx="41" cy="22" r="1.5"/><circle cx="55" cy="19" r="1.4"/><circle cx="62" cy="24" r="1"/>' + ((hero.appearance?.crest || 0) % 2 ? '<path d="m47 20 2-9 4 9"/>' : '<path d="M50 19q-5-12 2-10" stroke="' + hair + '" fill="none"/>') + "</g>" : `<path d="M31 29Q29 7 50 9T70 30L59 19 41 25Z" fill="${hair}"/>`}<path d="M32 33h-5m45 0h-5" stroke="${skin}" stroke-width="7" stroke-linecap="round"/><g class="portrait-eyes" transform="translate(${hero.appearance?.look || 0} 0)">${eyes}</g><path d="m47 44 6 0" stroke="#9c7860" stroke-width="2" stroke-linecap="round"/>${faceMark}${beard}${hat}${equipmentMark}${wornArmorArt(hero)}${hero.light ? lanternArt(hero.light, true) : ""}${attributeArt}<g class="portrait-weapon" transform="rotate(${hero.appearance?.weaponPose || 0} 21 78)">${weapon}${held?.evolution ? '<path d="m18 56 4-5 4 5-4 5m-9 7 18-4" fill="#f3dc93" stroke="#e8d494" stroke-width="2"/>' : ""}</g><path d="M38 61Q47 54 60 61" fill="none" stroke="#a39f75" stroke-width="2" stroke-opacity=".35"/><circle cx="${42 + (hero.appearance?.crest || 0) * 3}" cy="70" r="3" fill="#e2d7b7" stroke="#897656"/>${gear
    .filter((i) => ["charm", "offhand"].includes(ITEMS[i.key].type))
    .slice(0, 3)
    .map(
      (i, n) =>
        '<circle cx="' +
        (63 + n * 7) +
        '" cy="82" r="4" fill="' +
        RARITY_COLORS[itemRarity(i)] +
        '" stroke="#f4e6ba"/>',
    )
    .join(
      "",
    )}<path d="M37 82h27" stroke="#786443" stroke-width="5"/><rect x="47" y="79" width="7" height="7" rx="1" fill="#ecce85"/></g></svg>`;
}

export function petSvg(pet) {
  const skin = COSMETICS[pet.cosmetic];
  if (skin?.type === "pet")
    return petSvg({
      ...pet,
      cosmetic: null,
      key: skin.skin === "moonfox" ? "fox" : "beetle",
      visualColor: skin.color,
    });
  const d = { ...PETS[pet.key], color: pet.visualColor || PETS[pet.key].color },
    tier = itemRarity(pet),
    color = d.color,
    mods = petInfo(pet);
  let body = "";
  if (["ammonite", "trilobite", "pterosaur"].includes(pet.key))
    body = fossilShape(pet.key, color);
  else if (["raptor", "hadrosaur"].includes(pet.key))
    body = dinosaurShape(
      pet.key === "hadrosaur" ? "triceratops" : "raptor",
      color,
      pet.evolution || 0,
      true,
    );
  else if (pet.key === "horse")
    body = `<path d="M14 42 9 54m14-11-1 12m23-17 4 18m-7-13-3 12" stroke="${color}" stroke-width="5"/><ellipse cx="30" cy="37" rx="20" ry="11" fill="${color}"/><path d="M42 37 40 18 43 8 48 18 55 22 57 31 46 34Z" fill="${color}"/><path d="M41 15q-9 6-4 24" stroke="#655247" stroke-width="6"/><path d="M11 34q-12 10-6 16" fill="none" stroke="#655247" stroke-width="5"/><circle cx="49" cy="23" r="2" fill="#34433a"/><path d="M21 28h18v13H21Z" fill="${tier >= 2 ? RARITY_COLORS[tier] : "#8c7055"}" stroke="#e0c69a" stroke-width="2"/>`;
  else if (pet.key === "fox")
    body = `<path d="M17 36Q1 12 6 11Q25 10 29 32" fill="${color}"/><ellipse cx="31" cy="39" rx="17" ry="11" fill="${color}"/><path d="M31 33 29 14 39 19 50 10 53 32Z" fill="${color}"/><path d="M31 31 42 39 52 29 46 39 36 42Z" fill="#efe1c4"/><path d="M20 45v8m21-7v7" stroke="${color}" stroke-width="6"/><circle cx="38" cy="27" r="2" fill="#293b35"/><circle cx="48" cy="25" r="2" fill="#293b35"/>`;
  else if (pet.key === "beetle")
    body = `<path d="m19 25-9-6m9 17-11 1m35-12 10-8m-9 20 11 2m-36 7-8 9m32-9 10 8" stroke="#697d7c" stroke-width="3"/><ellipse cx="31" cy="33" rx="17" ry="20" fill="${color}" stroke="#647a7c" stroke-width="2"/><path d="M31 17v34" stroke="#d5cfad" stroke-width="3"/><circle cx="25" cy="22" r="3" fill="#f7d68e"/><circle cx="38" cy="22" r="3" fill="#f7d68e"/>`;
  else
    body = `<path d="M23 24Q1 4 7 35L24 40M40 24Q62 4 57 35L40 40" fill="${color}" opacity=".45"/><path d="M18 35Q17 12 32 12T47 35L53 52 37 47 29 54 20 47 12 50Z" fill="${color}"/><circle cx="26" cy="29" r="2" fill="#354449"/><circle cx="38" cy="29" r="2" fill="#354449"/><path d="m28 36 6 0" stroke="#fff2bd" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">${wingStyles()}<ellipse cx="32" cy="57" rx="22" ry="4" fill="#26382e" opacity=".15"/>${tier >= 2 ? `<ellipse class="character-aura" cx="32" cy="48" rx="26" ry="10" fill="${RARITY_COLORS[tier]}" opacity=".15"/>` : ""}<g class="companion-body">${mods.flying ? `<g transform="scale(.64)">${wingArt(mods.wingType || "feather", pet.wingPose || 0)}</g>` : ""}${body}${pet.evolution ? '<path d="m20 16 5-10 5 10m8 0 5-10 5 10" fill="#e3d194"/><path d="M17 42h30" stroke="#e9d4a0" stroke-width="3"/>' : ""}</g>${tier >= 1 ? `<path d="m18 41 14 4 13-5" stroke="${RARITY_COLORS[tier]}" stroke-width="${tier >= 3 ? 4 : 2}" fill="none"/>` : ""}${tier >= 2 ? `<g class="rarity-sparks" fill="${RARITY_COLORS[tier]}"><circle cx="10" cy="22" r="1.8"/><circle cx="55" cy="11" r="1.8"/><circle cx="6" cy="40" r="1.4"/></g>` : ""}<g transform="scale(.64)">${modifiersArt(pet, "pet")}</g>${(
    pet.sockets || []
  )
    .filter(Boolean)
    .map(
      (g, i) =>
        `<path d="m${23 + i * 7} 38 3-4 3 4-3 4Z" fill="${GEM_KINDS[g.kind].color}"/>`,
    )
    .join("")}</svg>`;
}

export function itemSvg(item) {
  const d = itemInfo(item),
    tier = itemRarity(item),
    color = d.aura || (tier >= 2 ? RARITY_COLORS[tier] : "#a7b2a9"),
    id = "item-glow-" + ++portraitSerial;
  let shape =
    d.type === "weapon"
      ? d.icon === "bow"
        ? '<path d="M33 15q43 34 0 69V15Zm0 0v69M20 49h52" fill="none" stroke="#ac9369" stroke-width="5"/>'
        : d.icon === "gear"
          ? '<path d="M48 86V31" stroke="#9f8159" stroke-width="6"/><path d="M26 22h43v23H26Z" fill="#a7b0aa" stroke="#e2cf9e" stroke-width="3"/>'
          : '<path d="m46 70-5-47 9-12 10 12-5 47Z" fill="#bfcac4" stroke="#667a70" stroke-width="2"/><path d="M30 70h38m-19 0v18" stroke="#c3a06a" stroke-width="5"/>'
      : d.type === "armor"
        ? '<path d="m29 20 13-5h17l15 6 10 23-13 6-6-8v42H34V42l-8 9-12-9Z" fill="#9aaba0" stroke="' +
          RARITY_COLORS[tier] +
          '" stroke-width="3"/>'
        : d.type === "scroll"
          ? '<path d="M29 18h46v65H24V28q-7-12 5-10Z" fill="#e7d8b4" stroke="#9b835e" stroke-width="3"/><path d="M31 36h29m-29 11h23m-23 11h29m-20 12h15" stroke="' +
            color +
            '" stroke-width="3"/>'
          : '<path d="m50 19 22 22-8 32-14 14-15-14-7-32Z" fill="' +
            color +
            '" stroke="#e3d4b5" stroke-width="3"/>';
  if (d.type === "light") shape = lanternArt(item, false);
  else if (weaponShape(item.key))
    shape = weaponPresentation(item) + weaponEffectArt(item);
  else if (d.type === "armor") {
    const shapes = {
      head: "M23 44Q23 14 50 14T77 44L69 60 60 43H40L31 60Z",
      chest: "M29 20 42 15h17l15 6 10 23-13 6-6-8v42H34V42l-8 9-12-9Z",
      legs: "M28 19h44l9 65H58l-8-43-9 43H19Z",
      boots: "M25 24h20v45l-17 9H13V67l12-9Zm30 0h20v34l12 9v11H72l-17-9Z",
    };
    shape =
      '<g data-armor-art="' +
      d.armorSlot +
      '" fill="' +
      armorColor(item) +
      '" stroke="' +
      RARITY_COLORS[tier] +
      '" stroke-width="3"><path d="' +
      shapes[d.armorSlot] +
      '"/></g>' +
      modifiersArt(item, "armor");
    if (item.mythical)
      shape +=
        '<path d="m29 69 5-8 5 8m22 0 5-8 5 8" fill="#eedbff" stroke="#b790dc" stroke-width="3"/>';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><defs><filter id="${id}"><feGaussianBlur stdDeviation="3"/></filter></defs><ellipse cx="50" cy="90" rx="30" ry="5" fill="#3b5143" opacity=".12"/>${d.aura || tier >= 2 ? `<g fill="${color}" opacity=".35" filter="url(#${id})"><circle cx="50" cy="50" r="28"/></g>` : ""}<g class="weapon-aura" transform="translate(${item.evolution ? -3 : 0} 0) scale(${item.evolution ? 1.06 : 1})">${shape}${item.evolution ? '<path d="m50 27 6 8-6 8-6-8Zm0 20 6 8-6 8-6-8" fill="#f3d78e" stroke="#ead395" stroke-width="2"/>' : ""}</g>${d.aura || tier >= 2 ? `<g class="rarity-sparks" fill="${color}"><circle cx="17" cy="21" r="2"/><circle cx="82" cy="42" r="2.5"/><circle cx="23" cy="72" r="1.8"/></g>` : ""}</svg>`;
}
function dinosaurShape(kind, color, evolution = 0, small = false) {
  const scale = small ? ".6" : ".92",
    dragon = kind === "dragon",
    tri = kind === "triceratops",
    fly = kind === "pterosaur";
  return `<g transform="translate(${small ? 1 : 5} ${small ? 0 : 10}) scale(${scale})">${dragon || fly ? `<path d="M43 47 7 4 2 43l20-8 21 22m13-10L90 4l8 38-24-8-18 22" fill="${dragon ? "#b56950" : "#879c67"}" stroke="#5f6f52" stroke-width="2"/>` : ""}<path d="M24 65Q-7 49 1 33Q12 53 37 52" fill="${color}" stroke="#586e4a" stroke-width="2"/><ellipse cx="48" cy="60" rx="${tri ? 31 : 23}" ry="17" fill="${color}" stroke="#586e4a" stroke-width="2"/><path d="m35 71-8 22h13l7-19m14-4 12 21h13L72 65" fill="${color}" stroke="#586e4a" stroke-width="3"/><path d="M58 57 57 31 71 18l17 13 6 17-23 11Z" fill="${color}" stroke="#586e4a" stroke-width="2"/>${tri ? '<path d="M61 22 51 18l-7 23 17 10" fill="#aa9c62" stroke="#6e7952" stroke-width="2"/><path d="m72 27 5-17 4 20m5 7 12-7-7 17" fill="#ead7a4"/>' : dragon ? '<path d="m62 23-1-15 10 13m8 0 5-15 3 23" fill="#e5c69a"/>' : '<path d="m61 26 5-14 5 10" fill="#9bb978"/>'}<g fill="#3e573e"><ellipse cx="75" cy="32" rx="4" ry="2"/><circle cx="89" cy="43" r="1.4"/></g><path d="M75 46h17m-15 0 2 4 3-4m2 0 2 4 3-4" stroke="#eef0c6" stroke-width="2"/>${small && tri ? '<path d="M30 43h28v19H30Z" fill="#8a6f53" stroke="#e7cf95" stroke-width="3"/>' : ""}${evolution ? '<path d="m24 49 5-12 7 11m4-4 5-12 7 11m-14 17 16 3" fill="#d8ca91" stroke="#eee0b0"/>' : ""}<circle cx="42" cy="52" r="3" fill="#657d49"/><circle cx="52" cy="66" r="3" fill="#657d49"/></g>`;
}
export function creatureSvg(h) {
  const color =
    h.creature === "dragon"
      ? "#bf8059"
      : h.creature === "tyrant"
        ? "#8f9060"
        : h.creature === "triceratops"
          ? "#b2a374"
          : "#8fad6f";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104"><ellipse cx="50" cy="98" rx="36" ry="5" fill="#243d2a" opacity=".2"/><g class="portrait-body">${dinosaurShape(h.creature, color, h.boss ? 1 : 0)}</g></svg>`;
}

function weaponEffectArt(i) {
  return modifiersArt(i, "weapon");
}
const MODIFIER_GLYPHS = {
  flames: "M12 3q5 5 2 9l4-5q7 13-6 14C-1 20 3 12 7 7l1 7q5-2 4-11Z",
  snow: "M12 2v20M3 7l18 10M3 17 21 7M8 4l4 3 4-3M8 20l4-3 4 3",
  lightning: "m14 2-9 12h6l-1 8 10-13h-7Z",
  rings:
    "M2 12a10 6 0 1 0 20 0 10 6 0 1 0-20 0M12 2a6 10 0 1 0 0 20 6 10 0 1 0 0-20",
  vines: "M5 22Q20 8 9 2m0 5Q-1 3 4 12m9-2q13-4 7 5m-11 4q-10-2-5-8",
  sun: "M12 6a6 6 0 1 0 0 12 6 6 0 1 0 0-12M12 1v3m0 16v3M1 12h3m16 0h3M4 4l3 3m10 10 3 3m0-16-3 3M7 17l-3 3",
  smoke: "M6 22q-9-7 2-11T10 1m6 22q10-9-1-14t4-7",
  waves: "M2 6q5-5 10 0t10 0M2 12q5-5 10 0t10 0M2 18q5-5 10 0t10 0",
  feathers: "M5 22 18 3Q25 9 16 17L5 22Zm1-2 11-8m-5 7-1-6m6 2-1-8",
  gears:
    "m8 3 2 3h4l2-3 4 4-3 3v4l3 2-4 4-2-3h-4l-2 3-4-4 3-2v-4L4 7Zm4 6a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
  runes: "M5 3v18l8-8-8-4m8-6v18m0-10 6-7m-6 10 6 7",
  stars: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z",
  thorns: "M4 22 20 2M6 18l-4-8 8 3m3-3-2-8 8 3",
  droplets: "M12 2Q-1 14 12 22 25 14 12 2Zm-6 14q1 3 4 3",
  shards: "m5 4 5 2-2 8-4-2Zm10-2 5 6-5 7-2-6Zm-4 14 5 2-5 5-2-3Z",
  echo: "M8 5q-9 7 0 14m3-18q-15 11 0 22m5-18q9 7 0 14m-3-18q15 11 0 22",
  chevrons: "m4 3 8 6 8-6M4 10l8 6 8-6M4 17l8 6 8-6",
  shield: "m12 2 9 4v7q-2 7-9 9-7-2-9-9V6Z",
  mountains: "m1 21 7-16 5 10 4-12 6 18Zm5-12 3 4 2-3",
  leaves: "M4 20Q-1 4 21 2q3 20-17 18Zm0 0L17 7",
  eyes: "M1 12q11-16 22 0-11 16-22 0Zm11-4a4 4 0 1 0 0 8 4 4 0 1 0 0-8",
  ribbons: "M3 2q18 8 3 13t15 7M3 7q20 8 3 12",
  cloud: "M5 18Q-3 12 5 9q2-12 11-5 11 0 5 13Z",
  banner: "M6 23V2h15l-4 6 4 6H6",
  claws: "m3 20 5-17 1 10Zm7 0 4-18 2 10Zm7 0 4-16 1 9Z",
  cracks: "m10 1 4 6-5 3 7 6-5 7M9 10l-7-2m14 8 6-4",
  spiral: "M12 12q6-6 7 1t-11 6Q-5 11 6 4q15-9 18 8",
  cross: "M9 2h6v7h7v6h-7v7H9v-7H2V9h7Z",
  moon: "M20 18Q3 20 9 3Q-5 9 5 21q8 6 15-3Z",
  target:
    "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20m0 5a5 5 0 1 0 0 10 5 5 0 1 0 0-10M12 9v6m-3-3h6",
  scales: "M12 3v18M5 6h14M5 6l-4 8h8Zm14 0-4 8h8Z",
  hourglass: "M5 2h14q0 6-7 10 7 4 7 10H5q0-6 7-10Q5 8 5 2Z",
  pages: "M2 4q6-3 10 1 4-4 10-1v17q-7-4-10 0-4-4-10 0Zm10 1v16",
  embers: "m5 18 2-4 2 4-2 3m5-16 3 6-3 4-3-4m10 5 2 4-2 3-2-3",
};
export function modifiersArt(obj, kind) {
  return objectModifiers(obj, kind)
    .map((m) => {
      const v = m.visual || { style: "runes", color: m.color || "#cbb580" },
        glyph = MODIFIER_GLYPHS[v.style] || MODIFIER_GLYPHS.runes,
        xy =
          m.kind === "prefix"
            ? [50, 40, 46]
            : m.kind === "affix"
              ? [52, 75, 15]
              : [50, 17, 21],
        color = v.color;
      return `<g data-modifier-art="${kind}:${m.kind}:${m.key}" class="modifier-flare ${m.kind === "enchantment" ? "rarity-sparks" : ""}" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">${m.kind === "enchantment" ? '<ellipse cx="50" cy="48" rx="36" ry="37" stroke-width="1.6" stroke-dasharray="3 7" opacity=".75"/>' : ""}<g transform="translate(${xy[0] - xy[2] / 2} ${xy[1] - xy[2] / 2}) scale(${xy[2] / 24})" stroke-width="${m.kind === "affix" ? 2.2 : 1.3}" fill="${color}" fill-opacity="${m.kind === "prefix" ? 0.18 : 0.24}" opacity="${m.kind === "prefix" ? 0.6 : 1}"><path d="${glyph}"/></g></g>`;
    })
    .join("");
}
export function wingArt(type, pose = 0) {
  const shape =
    type === "feather"
      ? '<path d="M34 59Q12 48 5 14Q-6 44 8 65l5-18q-4 23 7 29l2-20q2 22 13 27Z" fill="#efe8d3" stroke="#b7ac8a" stroke-width="1.5"/><path d="M8 28q7 21 22 31M9 44l12 13m-8 4 11 4" fill="none" stroke="#d3c7a8" stroke-width="1.6"/>'
      : type === "mechanical"
        ? '<path d="m33 58-6-27-22-17 3 25 16 12-21-2 7 21 23 7Z" fill="#91a7a2" stroke="#536e68" stroke-width="2"/><path d="m11 24 12 13m-11 20 13 6" stroke="#d9b981" stroke-width="4"/><circle cx="31" cy="58" r="4" fill="#d9b981"/>'
        : type === "leather"
          ? '<path d="M33 58 4 14l-2 30 12-5 3 19 9-4 5 23Z" fill="#a694b3" stroke="#73617f" stroke-width="2"/><path d="m4 14 23 40M4 14l13 43" stroke="#d4bfd5" stroke-width="1.4"/>'
          : type === "arcane"
            ? '<path d="M33 61Q-3 19 7 43q-14 15 13 28-17 14 15 10" fill="#bcb2d9" opacity=".65" stroke="#927eaf" stroke-width="2"/><path d="M8 46q2 12 21 20" fill="none" stroke="#eee3fa" stroke-dasharray="3 3"/>'
            : '<path d="M33 57Q-9 3 6 42L30 65M32 65Q-7 42 10 72l24 8" fill="' +
              (type === "moth" ? "#d6c5a0" : "#bcd7c5") +
              '" fill-opacity=".8" stroke="#839a7f" stroke-width="1.4"/><path d="M8 31 30 58M13 66l17 5" stroke="#eef1db" fill="none"/>';
  return `<g data-wing-type="${type}" class="flight-wings"><g class="wing-left" transform="rotate(${pose} 33 59)">${shape}</g><g class="wing-right" transform="rotate(${-pose} 67 59)"><g transform="translate(100 0) scale(-1 1)">${shape}</g></g></g>`;
}
function wingStyles() {
  return "<style>@keyframes feather-left{from{transform:rotate(-4deg)}to{transform:rotate(5deg)}}@keyframes feather-right{from{transform:rotate(4deg)}to{transform:rotate(-5deg)}}.wing-left{transform-origin:33px 59px;animation:feather-left 3.8s ease-in-out infinite alternate}.wing-right{transform-origin:67px 59px;animation:feather-right 3.8s ease-in-out infinite alternate}@media(prefers-reduced-motion:reduce){.wing-left,.wing-right{animation:none}}</style>";
}

// Shared previews are used in cards, the Atelier, and the battlefield.
export function weaponPresentation(item) {
  let art = weaponShape(item.key);
  const skin = COSMETICS[item.cosmetic],
    theme = ITEMS[item.key]?.mythicTheme;
  if (skin?.type === "weapon") {
    const color = skin.skin === "crystal" ? "#9cdfdf" : "#d1ad69";
    art = art.replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="' + color + '"');
    art +=
      '<path d="m49 43 6-8 6 8-6 8Z" fill="#a4e8f0" stroke="#f3eed6" stroke-width="2"/>';
  }
  if (theme) {
    const c = { solar: "#f0c96f", storm: "#ba9dec", iron: "#8edbe5" }[theme];
    art += `<g class="rarity-sparks" fill="${c}"><circle cx="50" cy="30" r="6"/><path d="m24 17 3-6 3 6-3 5m48 38 3-6 3 6-3 5"/></g><ellipse class="character-aura" cx="50" cy="37" rx="29" ry="31" fill="none" stroke="${c}" stroke-width="2" opacity=".65"/>`;
  }
  return art;
}
export function guiseSvg(key, hero = {}) {
  hero = { race: "Human", attributes: [], ...hero };
  const solar = key === "sunplate",
    iron = key === "clockwork",
    storm = key === "tempest",
    color = solar
      ? "#cfaa63"
      : iron
        ? "#98bec1"
        : storm
          ? "#a0aedb"
          : "#bca8dc",
    dark = solar ? "#735843" : iron ? "#566c73" : storm ? "#455b87" : "#6b577e";
  const body = iron
    ? `<path d="M30 53h40l7 36H23Z" fill="${dark}" stroke="${color}" stroke-width="3"/><path d="M35 62h30v20H35Z" fill="${color}"/><circle cx="50" cy="71" r="8" fill="#a1edf0"/><path d="M25 60 17 87m58-27 8 27M36 89l-3 10m31-10 3 10" stroke="${color}" stroke-width="10"/><rect x="31" y="17" width="38" height="31" rx="8" fill="${color}" stroke="${dark}" stroke-width="3"/><path d="M37 29h9m8 0h9" stroke="#e6ffff" stroke-width="5"/><path d="M50 12V5m-8 36h16" stroke="${dark}" stroke-width="4"/>`
    : key === "moonwraith"
      ? `<path d="M21 85Q36 70 32 47 22 20 50 15 81 21 69 49Q70 73 80 85l-18-1-10 15-10-12-18 3Z" fill="${color}" opacity=".85"/><path d="M34 28q16-15 31 0l-3 22H38Z" fill="${dark}"/><path d="M40 34h5m10 0h5" stroke="#efffff" stroke-width="4"/><path d="M67 8Q42 14 57 0 24 7 43 24" fill="#e5d7ff"/>`
      : `<path d="M30 52 20 96l25-6 9 10 26-4-9-43Z" fill="${dark}"/><path d="M32 56 49 49l20 10-2 29H33Z" fill="${color}" stroke="${dark}" stroke-width="2"/><path d="m49 57 10 11-10 12-9-12Z" fill="${solar ? "#ffe7a0" : "#e2ecff"}"/><path d="M33 58 20 82m48-24 13 24M36 85l-3 13m31-13 3 13" stroke="${color}" stroke-width="10"/><path d="M29 23Q32 8 50 8t21 16l-7 24H36Z" fill="${color}" stroke="${dark}" stroke-width="2"/><path d="M33 27h34l-6 12H39Z" fill="${dark}"/><path d="M38 31h9m6 0h9" stroke="#fff3bf" stroke-width="3"/>${solar ? '<circle cx="20" cy="75" r="15" fill="#d7b563" stroke="#ffe6a2" stroke-width="3"/><path d="m20 63 4 8 7 4-7 4-4 8-4-8-7-4 7-4Z" fill="#fff1b9"/>' : '<path d="M76 34 89 46 77 53 86 69" stroke="#c8dcff" stroke-width="4" fill="none"/>'}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104" data-character-skin="${key}">${wingStyles()}<ellipse cx="50" cy="98" rx="30" ry="5" fill="#31443b" opacity=".17"/><ellipse class="character-aura" cx="50" cy="68" rx="38" ry="32" fill="${color}" opacity=".14"/><g class="portrait-body">${flightType(hero) ? wingArt(iron ? "mechanical" : "feather", hero.appearance?.wingPose || 0) : ""}${body}</g><g class="rarity-sparks" fill="${color}"><circle cx="9" cy="32" r="2"/><circle cx="88" cy="17" r="2"/><circle cx="87" cy="86" r="2"/></g></svg>`;
}
export function smokeCharacterSvg(hero) {
  const white = hero.race === "Sylph",
    color = white ? "#edf3ec" : "#30313c",
    edge = white ? "#9baea9" : "#656174",
    phase = hero.appearance?.smokePose || 0,
    weapon = hero.items?.find((i) => ITEMS[i.key]?.weaponKind),
    helmet = hero.armor?.[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104" data-smoke-race="${hero.race}">${wingStyles()}<style>@keyframes smoke-drift{0%,100%{transform:translate(0,0);opacity:.55}50%{transform:translate(3px,-5px);opacity:.8}}.smoke-wisp{animation:smoke-drift 5.7s ease-in-out infinite;transform-origin:50px 75px}.smoke-wisp:nth-child(2n){animation-delay:-2.6s}</style><ellipse cx="50" cy="98" rx="27" ry="5" fill="#2c4139" opacity=".15"/><g class="portrait-body">${flightType(hero) ? wingArt(flightType(hero), hero.appearance?.wingPose || 0) : ""}<g fill="${color}" stroke="${edge}" stroke-width=".7">${Array.from({ length: 9 }, (_, i) => `<ellipse class="smoke-wisp" cx="${32 + (i % 3) * 17 + Math.sin(phase + i) * 3}" cy="${55 + Math.floor(i / 3) * 14}" rx="${12 + (i % 3) * 2}" ry="13" opacity="${0.45 + (i % 3) * 0.15}"/>`).join("")}<path d="M33 60Q21 40 30 23 47 5 67 22 79 42 67 58 77 70 68 87Q60 96 68 101 48 98 41 89 29 96 23 88 39 81 31 68Z" fill-opacity=".78"/><path class="smoke-wisp" d="M40 79Q25 90 18 76 23 105 51 92 59 106 79 92 63 92 61 75Z" stroke="none" opacity=".65"/></g><g class="portrait-eyes" transform="translate(${hero.appearance?.look || 0} 0)" fill="${white ? "#699797" : "#e6c9ff"}"><ellipse cx="40" cy="35" rx="5" ry="3"/><ellipse cx="59" cy="35" rx="5" ry="3"/></g>${hero.armor?.[1] ? '<path d="m34 61 16-7 17 7-4 19-13 8-13-8Z" fill="' + (white ? "#b6cacc" : "#746582") + '" fill-opacity=".7" stroke="' + edge + '"/>' : ""}${helmet ? '<path d="M30 25q20-32 40 0l-3 7-9-8H41l-8 8Z" fill="' + edge + '"/>' : ""}${wornArmorArt(hero)}${hero.light ? lanternArt(hero.light, true) : ""}${weapon ? '<g class="portrait-weapon" transform="translate(-3 23) scale(.4 .7)">' + weaponPresentation(weapon) + weaponEffectArt(weapon) + "</g>" : ""}</g></svg>`;
}
function fossilShape(key, c) {
  if (key === "ammonite")
    return `<path d="M20 40q-17 9-12 18m19-12q-5 11 7 11m7-12q10 5 18-1" fill="none" stroke="${c}" stroke-width="4"/><circle cx="33" cy="29" r="21" fill="${c}" stroke="#7d887b" stroke-width="2"/><path d="M40 39q-23 5-20-14 4-15 19-10 12 6 6 18-8 10-14 2-5-8 2-10 7-1 5 5" stroke="#f1e4c5" stroke-width="3" fill="none"/>`;
  if (key === "trilobite")
    return `<g fill="${c}" stroke="#667e77" stroke-width="2">${Array.from({ length: 7 }, (_, i) => '<ellipse cx="32" cy="' + (15 + i * 5) + '" rx="' + (10 + Math.sin((i / 7) * 3) * 10) + '" ry="6"/>').join("")}</g><path d="M32 9v44" stroke="#d7dfc5" stroke-width="3"/><circle cx="26" cy="14" r="2" fill="#2e514c"/><circle cx="38" cy="14" r="2" fill="#2e514c"/>`;
  return `<g class="character-wings" fill="${c}"><path d="m30 31-25-19 3 32 17-4 7 12 7-13 16 5 5-30-26 17Z"/><ellipse cx="32" cy="34" rx="8" ry="17"/><path d="m29 20 1-11 15 9-11 6Z"/></g><circle cx="34" cy="15" r="2" fill="#394a39"/>`;
}
export function cosmeticSvg(key) {
  const d = COSMETICS[key];
  if (!d) return icon("wing", 48);
  if (d.type === "character") return guiseSvg(d.skin);
  if (d.type === "weapon")
    return itemSvg({
      key: d.kinds[0] === "longarm" ? "musket" : "ironblade",
      level: 1,
      rank: 0,
      cosmetic: key,
    });
  if (d.type === "pet") return petSvg({ key: "fox", level: 1, cosmetic: key });
  return portraitSvg({
    id: "cosmetic-preview",
    race: "Human",
    classId: "vanguard",
    level: 1,
    attributes: [],
    items: [],
    armor: [],
    talents: [],
    appearance: { hue: 185 },
    cosmetic: key,
  });
}

function lanternArt(item, held = false) {
  const color = ITEMS[item.key]?.lightColor || "#ffc36a";
  return `<g data-light-art="${item.key}" transform="${held ? "translate(66 70) scale(.27)" : "translate(16 4) scale(.7)"}"><circle cx="48" cy="58" r="35" fill="${color}" opacity=".12"/><path d="M35 30v-9q13-17 26 0v9M27 35h42l-5 48H32Z" fill="#354052" stroke="#ab9467" stroke-width="4"/><path d="M35 42h26v34H35Z" fill="${color}"/><path d="m30 35 18-13 18 13m-18 5v38M29 82h38" stroke="#cfb886" stroke-width="4" fill="none"/></g>`;
}
