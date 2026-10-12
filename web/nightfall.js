import { fed } from "./evernight.js?v=16";
// Evernight's night-world services. Commands own mutations; views only dispatch.
import {
  ATTRIBUTES,
  TALENTS,
  ITEMS,
  CLASSES,
  DIFFICULTIES,
  CORE_STATS,
  generateHero,
  makeItem,
  makeFacet,
  makeMythicalHero,
  equipmentSlots,
  armorSlots,
  armorRestriction,
  equipmentRestriction,
  stats,
  note,
  uid,
  gainFacetXp,
  makeGem,
  heroRarity,
} from "./data.js?v=16";
import { idle, campCapacity, payCost, addGems } from "./camp.js?v=16";
import { seeded } from "./engine.js?v=16";

export const PROFESSION_NAMES = ["Miner", "Lumberjack", "Hunter"];
export const professionRank = (a) =>
  Math.min(3, 1 + Math.floor((a.level - 1) / 20));
export const professionLabel = (a) =>
  a.key + " " + ["I", "II", "III"][professionRank(a) - 1];
export function professions(h) {
  return [...(h.attributes || []), ...(h.talents || [])].filter(
    (a, i, all) =>
      PROFESSION_NAMES.includes(a.key) &&
      all.findIndex((v) => v.key === a.key) === i,
  );
}
export function normalizeNightfall(g) {
  g.materials.hide ??= 0;
  g.sideQuests ||= ["settle-in", "stock-pantry"];
  g.questContracts ||= [];
  g.serviceCounts ||= { foodBought: 0, cooked: 0, crafted: 0, guildLessons: 0 };
  g.visitorReceipts ||= [];
  g.visitors ||= [];
  g.marketDistrict ||= "square";
  g.islandFloor ||= 0;
  g.equipmentSeen ||= {};
  // The old Outfitter's paid construction becomes the new equipment workshop.
  if (!g.nightfallRevision) {
    if (g.buildings.outfitter) g.buildings.armory ||= g.buildings.outfitter;
    g.nightfallRevision = 1;
  }
  const heroes = [
    ...g.roster,
    ...(g.waitingRecruits || []),
    ...g.expeditions.flatMap((r) => [
      ...(r.recruits || []),
      ...(r.temporaryParty || []),
      ...(r.battleState?.units || []).map((u) => u.hero),
    ]),
  ];
  for (const h of heroes) {
    if (!h) continue;
    h.armor ||= [];
    while (h.armor.length < 4) h.armor.push(null);
  }
  // Old stock could still contain directly purchased attribute capsules.
  for (const key of Object.keys(g.market || {}))
    if (Array.isArray(g.market[key]))
      g.market[key] = g.market[key].filter(
        (o) => !["attribute", "talent"].includes(o.kind),
      );
  return g;
}
export function guildCost(h, key) {
  const a = professions(h).find((a) => a.key === key),
    rank = a ? professionRank(a) : 0;
  return {
    gold: [35, 75, 150][rank] || 0,
    ...(rank
      ? {
          [key === "Miner" ? "stone" : key === "Lumberjack" ? "wood" : "meat"]:
            rank * 6,
        }
      : {}),
  };
}
export function trainProfession(g, h, key) {
  if (
    (g.screen === "camp" && !g.buildings.guildhall) ||
    !["market", "camp"].includes(g.screen) ||
    !g.roster.includes(h) ||
    !idle(g, h) ||
    !PROFESSION_NAMES.includes(key)
  )
    return false;
  const a = professions(h).find((a) => a.key === key),
    rank = a ? professionRank(a) : 0;
  if (
    rank >= 3 ||
    (!a && TALENTS[key]?.slot && equipmentSlots(h).length >= 8) ||
    !payCost(g, guildCost(h, key))
  )
    return false;
  if (a) {
    a.level = Math.max(a.level, rank * 20 + 1);
    a.xp = 0;
  } else {
    h.attributes.push(makeFacet(key));
    if (TALENTS[key]?.slot)
      h.items.push(makeItem(key === "Miner" ? "pickaxe" : "axe"));
  }
  g.serviceCounts.guildLessons++;
  const guild = { Miner: "miners", Lumberjack: "foresters", Hunter: "hunters" }[
    key
  ];
  g.guildStanding ||= {};
  g.guildStanding[guild] = (g.guildStanding[guild] || 0) + 10;
  note(
    h,
    "Learned " +
      professionLabel(professions(h).find((a) => a.key === key)) +
      " at the Guildhall.",
    g.lastClock,
  );
  return true;
}
export function gatherProfessions(g, r, heroes) {
  const random = seeded(r.seed + r.stage * 107 + r.earned.kills * 31);
  for (const h of heroes)
    for (const a of professions(h)) {
      const rank = professionRank(a);
      if (
        a.key !== "Hunter" &&
        !h.items.some((i) => i?.key === (a.key === "Miner" ? "pickaxe" : "axe"))
      )
        continue;
      const key =
        a.key === "Miner" ? "stone" : a.key === "Lumberjack" ? "wood" : "meat";
      const count = (a.key === "Lumberjack" ? 4 : 3) * rank;
      const award = (material, n) => {
        g.materials[material] = (g.materials[material] || 0) + n;
        r.earned.materials ||= {};
        r.earned.materials[material] = (r.earned.materials[material] || 0) + n;
      };
      award(key, count);
      if (a.key === "Miner") {
        award("ore", rank);
        if (random() < 0.12 * rank) {
          const gem = makeGem(
            ["ruby", "sapphire", "emerald"][Math.floor(random() * 3)],
            0,
          );
          g.gemstones.push(gem);
          g.gems++;
          r.earned.gems++;
        }
        if (random() < 0.1 * rank) award("obsidian", 1);
      }
      if (a.key === "Hunter" && random() < 0.2 * rank) award("hide", rank);
      gainFacetXp(a, 5);
    }
}
export function craftArmor(g, key) {
  if (
    g.screen !== "camp" ||
    !g.buildings.armory ||
    !/^(light|medium|heavy)-(head|chest|legs|boots)$/.test(key)
  )
    return false;
  const weight = ITEMS[key].weight;
  if (
    !payCost(g, {
      gold: 20,
      [weight === "heavy" ? "ore" : "hide"]: weight === "light" ? 2 : 3,
      wood: 2,
    })
  )
    return false;
  const item = makeItem(key);
  g.inventory.push(item);
  g.serviceCounts.crafted++;
  return item;
}
export function removeAttribute(g, h, key) {
  const a = h?.attributes.find((a) => a.key === key);
  if (
    (g.screen === "camp" && !g.buildings.clinic) ||
    !["market", "camp"].includes(g.screen) ||
    !g.roster.includes(h) ||
    !idle(g, h) ||
    !a ||
    !ATTRIBUTES[key] ||
    PROFESSION_NAMES.includes(key) ||
    !payCost(g, { gold: 50, herbs: 2 })
  )
    return false;
  h.attributes = h.attributes.filter((v) => v !== a);
  h.currentHp = Math.min(h.currentHp, stats(h).hp);
  note(h, "The Lantern Clinic lifted " + key + ".", g.lastClock);
  return true;
}
export function addMemory(g, h, text) {
  const value = String(text || "")
    .trim()
    .replace(/[\x00-\x1f]/g, "")
    .slice(0, 180);
  if (g.screen !== "camp" || !g.roster.includes(h) || !value) return false;
  note(h, value, g.lastClock);
  return true;
}
export function befriend(g, h, id) {
  const friend = g.roster.find((v) => v.id === id);
  if (
    g.screen !== "camp" ||
    !g.roster.includes(h) ||
    !idle(g, h) ||
    !friend ||
    friend === h ||
    !idle(g, friend) ||
    h.bonds[id]
  )
    return false;
  h.bonds[id] = 1;
  friend.bonds[h.id] = Math.max(1, friend.bonds[h.id] || 0);
  note(
    h,
    "Shared a first story with " + friend.name + " by the fire.",
    g.lastClock,
  );
  return true;
}
export function refreshVisitors(g) {
  const epoch = Math.floor(g.lastClock / 10800000);
  if (g.visitorEpoch === epoch && g.visitorDock === !!g.buildings.dock) return;
  g.visitorDock = !!g.buildings.dock;
  const random = seeded(epoch * 541 + 13);
  g.visitorEpoch = epoch;
  const make = (index, fields) => ({
    ...generateHero(
      {
        id: "visitor-" + epoch + "-" + index,
        race: ["Human", "Dwarf", "Elf", "Shade"][index % 4],
        classId: ["vanguard", "ranger", "mage", "guardian"][index % 4],
        level: fields.level || 5,
      },
      random,
    ),
    ...fields,
  });
  g.visitors = [
    make(0, { npcType: "wanderer", place: "market", price: 70 }),
    make(1, {
      npcType: "quest",
      place: "market",
      name: "Mara, the lantern keeper",
      quest: "lantern-keeper",
    }),
    make(2, {
      npcType: "challenger",
      place: "market",
      name: "The Night Watch",
    }),
  ];
  if (random() < (g.roster.some((h) => fed(g, h)) ? 0.8 : 0.35))
    g.visitors.push(make(3, { npcType: "wanderer", place: "camp", price: 90 }));
  for (let i = 5; i < 10; i++)
    g.visitors.push(
      make(i, {
        npcType: "wanderer",
        place: "tavern",
        price: 45 + (i - 5) * 15,
        level: 3 + (i - 5) * 2,
      }),
    );
  if (g.buildings.dock) {
    const mythical = random() < 0.12;
    const h = mythical ? makeMythicalHero("skyrift") : make(4, { level: 60 });
    if (!mythical) h.rarityTier = 3;
    g.visitors.push({
      ...h,
      id: "visitor-dock-" + epoch,
      npcType: "wanderer",
      place: "dock",
      price: mythical ? 4000 : 1800,
    });
  }
  g.visitors = g.visitors.filter((h) => !g.visitorReceipts.includes(h.id));
  g.visitorReceipts = g.visitorReceipts.filter(
    (id) =>
      id.endsWith(String(epoch)) || id.startsWith("visitor-" + epoch + "-"),
  );
}
export function hireVisitor(g, id) {
  const h = g.visitors.find((h) => h.id === id);
  if (
    !h ||
    h.npcType !== "wanderer" ||
    g.visitorReceipts.includes(id) ||
    !["camp", "market"].includes(g.screen) ||
    (g.screen === "market"
      ? !["market", "tavern"].includes(h.place)
      : !["camp", "dock"].includes(h.place)) ||
    g.roster.length >= campCapacity(g) ||
    g.gold < h.price
  )
    return false;
  g.gold -= h.price;
  g.visitorReceipts.push(id);
  g.visitors = g.visitors.filter((v) => v !== h);
  delete h.npcType;
  delete h.place;
  delete h.price;
  g.roster.push(h);
  note(
    h,
    "Followed the lanterns to " + (g.campName || "your camp") + ".",
    g.lastClock,
  );
  return h;
}
export function compatibleSlots(h, item) {
  if (item.unidentified || item.sharpenJob) return [];
  if (ITEMS[item.key]?.type === "light")
    return [
      {
        s: { label: "Light", types: ["light"] },
        index: 0,
        armor: false,
        light: true,
      },
    ];
  const armor = ITEMS[item.key]?.type === "armor";
  return (armor ? armorSlots(h) : equipmentSlots(h))
    .map((s, index) => ({ s, index, armor }))
    .filter((v) =>
      armor
        ? !armorRestriction(h, item, v.index)
        : v.s.types.includes(ITEMS[item.key]?.type) &&
          !equipmentRestriction(h, item, v.index),
    );
}
export function equipmentNotice(g, h, index, armor = false) {
  const key = h.id + ":" + (armor ? "armor" : "gear") + ":" + index,
    seen = g.equipmentSeen?.[key] || [];
  return g.inventory.some(
    (i) =>
      !seen.includes(i.id) &&
      compatibleSlots(h, i).some(
        (v) => !v.light && v.armor === armor && v.index === index,
      ),
  );
}
export function markEquipmentSeen(g, h, index, armor = false) {
  if (!g.roster.includes(h)) return false;
  g.equipmentSeen[h.id + ":" + (armor ? "armor" : "gear") + ":" + index] =
    g.inventory
      .filter((i) =>
        compatibleSlots(h, i).some(
          (v) => !v.light && v.armor === armor && v.index === index,
        ),
      )
      .map((i) => i.id);
  return true;
}
export function comparison(h, item, index, armor = false) {
  const before = stats(h),
    copy = structuredClone(h);
  if (ITEMS[item.key]?.type === "light") copy.light = item;
  else copy[armor ? "armor" : "items"][index] = item;
  const after = stats(copy);
  return [...CORE_STATS, "hp", "attack", "speed", "range", "maxMana"].map(
    (key) => ({
      key,
      before: before[key],
      after: after[key],
      delta: after[key] - before[key],
    }),
  );
}
export function islandInfo(g) {
  return {
    mode: "island",
    location: "island",
    name: "The Bell Beneath · 25 floors",
    encounters: 25,
    otherEncounters: 0,
    level: 12,
    reward: 1.4 * DIFFICULTIES[g.worldDifficulty || "normal"].reward,
    difficulty: g.worldDifficulty || "normal",
    route: "main",
    food: 3,
    unlocked: !!g.buildings.dock,
    roadItinerary: Array.from({ length: 25 }, (_, n) => ({
      kind: "battle",
      name: "Floor " + (n + 1),
      level: 12 + n * 2,
      boss: (n + 1) % 5 === 0,
      water: false,
      danger: 1,
      rest: false,
      terrain: "wild",
    })),
  };
}
