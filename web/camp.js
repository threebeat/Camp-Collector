import * as Ever from "./evernight.js?v=17";
import { gatherProfessions } from "./nightfall.js?v=17";
import {
  gatheringFacets,
  CORE_STATS,
  WEAPONS,
  makeItem,
  ITEMS,
  CONSUMABLES,
  CLASSES,
  RARITIES,
  stats,
  uid,
  makeFacet,
  trainingBonus,
  note,
  makeGem,
  gemValue,
  GEM_KINDS,
  GEM_SIZES,
  companionSlots,
  gainItemXp,
  itemRarity,
  allGear,
  TALENTS,
  equipmentSlots,
  classPoints,
  classTree,
  classNodeState,
  transformationOptions,
  WEAPON_MODIFIERS,
  abilities,
  armorRestriction,
  PETS,
  makePet,
  EVOLUTIONS,
} from "./data.js?v=17";
import { BUILDINGS, COOKING, BREWS } from "./world.js?v=17";
export const gemsTotal = (g) =>
  g.gemstones.reduce((sum, v) => sum + gemValue(v), 0);
export function addGems(g, value, kind = "ruby") {
  let left = Math.max(0, Math.floor(value));
  for (let size = 3; size >= 0; size--)
    while (left >= GEM_SIZES[size].value) {
      g.gemstones.push(makeGem(kind, size));
      left -= GEM_SIZES[size].value;
    }
  g.gems = gemsTotal(g);
}
export function spendGems(g, value) {
  if (!Number.isInteger(value) || value < 0 || gemsTotal(g) < value)
    return false;
  let left = value;
  for (const gem of [...g.gemstones].sort((a, b) => a.size - b.size)) {
    if (!left) break;
    g.gemstones = g.gemstones.filter((v) => v.id !== gem.id);
    const used = Math.min(left, gemValue(gem));
    left -= used;
    if (gemValue(gem) > used) addGems(g, gemValue(gem) - used, gem.kind);
  }
  g.gems = gemsTotal(g);
  return true;
}
export function hasCost(g, cost) {
  return Object.entries(cost).every(([key, n]) =>
    key === "gold" ? g.gold >= n : (g.materials[key] || 0) >= n,
  );
}
export function payCost(g, cost) {
  if (!hasCost(g, cost)) return false;
  for (const [key, n] of Object.entries(cost))
    if (key === "gold") g.gold -= n;
    else g.materials[key] -= n;
  return true;
}
export const costText = (cost) =>
  Object.entries(cost)
    .map(([key, n]) => n + " " + (key === "meat" ? "ingredients" : key))
    .join(" · ");
export function heroJob(h) {
  return (
    h.trainingJob || allGear(h).find((i) => i?.sharpenJob)?.sharpenJob || null
  );
}
export function idle(g, h) {
  return (
    !!h &&
    !h.retired &&
    !g.expeditions.some(
      (r) => r.status === "active" && r.party.includes(h.id),
    ) &&
    !(h.recoveryUntil > g.lastClock) &&
    !heroJob(h)
  );
}
export const campCapacity = (g) => 40 + 20 * Math.max(g.buildings.cabins || 0, (g.buildings.tent || 1) - 1);
export const cabinCost = (g) =>
  Object.fromEntries(
    Object.entries(BUILDINGS.cabins.cost).map(([k, v]) => [
      k,
      Math.ceil(v * (1 + (g.buildings.cabins || 0) * 0.6)),
    ]),
  );
export function buildingAllowed(g, def) {
  return (
    !def.expansion ||
    (def.expansion === "any"
      ? g.campExpansions.length > 0
      : g.campExpansions.includes(def.expansion))
  );
}
export function buildCamp(g, key) {
  const def = BUILDINGS[key],
    cost = key === "cabins" ? cabinCost(g) : def?.cost;
  if (
    g.screen !== "camp" ||
    !cost ||
    (def.minCampLevel && Ever.campProgress(g).level < def.minCampLevel) ||
    !buildingAllowed(g, def) ||
    (def.upgradeFrom && !g.buildings[def.upgradeFrom]) ||
    (g.buildings[key] && key !== "cabins") ||
    (def.minRoster && g.roster.length < def.minRoster) ||
    !payCost(g, cost)
  )
    return false;
  g.buildings[key] = (g.buildings[key] || 0) + 1;
  if (key === "cabins") g.buildings.tent = g.buildings.cabins + 1;
  Ever.awardCampXp(
    g,
    def.upgradeFrom ? 250 : key === "cabins" ? 220 : 160,
    "construction",
  );
  if (key === "archaeology")
    g.archaeologyZone =
      g.campZone === "center" ? g.campExpansions[0] : g.campZone;
  if (["farm", "garden"].includes(key)) g[key + "HarvestAt"] = g.lastClock;
  return true;
}
export function nameCamp(g, name) {
  const n = String(name)
    .trim()
    .replace(/[\x00-\x1f]/g, "")
    .slice(0, 36);
  if (!n) return false;
  g.campName = n;
  g.campNamed = true;
  return true;
}
export function sessions(h) {
  return (h.talents || [])
    .filter((a) => a.key.startsWith("training:"))
    .reduce((s, a) => s + a.level, 0);
}
export const trainingCost = (h) => 35 + sessions(h) * 30;
export const trainingDuration = (h) =>
  Math.min(3600, Math.round(30 * Math.pow(1.65, sessions(h))));
export function beginTraining(g, h, key) {
  if (
    g.screen !== "camp" ||
    !g.buildings.training ||
    !idle(g, h) ||
    !CORE_STATS.includes(key) ||
    g.gold < trainingCost(h)
  )
    return false;
  const a = h.talents.find((a) => a.key === "training:" + key);
  if (a?.level >= 100) return false;
  const cost = trainingCost(h),
    seconds = trainingDuration(h);
  g.gold -= cost;
  h.trainingJob = {
    kind: "training",
    stat: key,
    started: g.lastClock,
    ends: g.lastClock + seconds * 1000,
    cost,
  };
  note(
    h,
    "Settled in for " + seconds + " seconds of " + key + " training.",
    g.lastClock,
  );
  return true;
}
export function sharpeningCost(item) {
  return { gold: 25 + (item.rank || 0) * 30, ore: 1 + (item.rank || 0) };
}
export function beginSharpen(g, id) {
  if (g.screen !== "camp" || !g.buildings.blacksmith) return false;
  const owner = g.roster.find((h) => allGear(h).some((i) => i.id === id));
  if (owner && !idle(g, owner)) return false;
  const i =
    allGear(owner || {}).find((i) => i.id === id) ||
    g.inventory.find((i) => i.id === id);
  if (
    !i ||
    !ITEMS[i.key]?.weaponKind ||
    i.unidentified ||
    i.rank >= 5 ||
    i.sharpenJob ||
    !payCost(g, sharpeningCost(i))
  )
    return false;
  i.sharpenJob = {
    kind: "sharpening",
    started: g.lastClock,
    ends: g.lastClock + (20 + i.rank * 20) * 1000,
  };
  return true;
}
export function updateCampClock(g) {
  Ever.consumeMeals(g);
  Ever.collectCampXp(g);
  for (const h of g.roster) {
    if (h.trainingJob && h.trainingJob.ends <= g.lastClock) {
      const key = "training:" + h.trainingJob.stat,
        a = h.talents.find((a) => a.key === key);
      if (a) a.level++;
      else h.talents.push(makeFacet(key));
      note(
        h,
        "Completed " +
          h.trainingJob.stat +
          " training. Permanent training Talent improved.",
        h.trainingJob.ends,
      );
      Ever.awardCampXp(g, 25, "training");
      h.trainingJob = null;
      h.currentHp = stats(h).hp;
    }
    if (h.recoveryUntil) {
      if (!h.recoveryStarted) {
        h.recoveryStarted = Math.min(g.lastClock, h.recoveryUntil - 90000);
        h.recoveryHp = h.currentHp || stats(h).hp * 0.2;
      }
      const progress = Math.min(
        1,
        Math.max(
          0,
          (g.lastClock - h.recoveryStarted) /
            Math.max(1, h.recoveryUntil - h.recoveryStarted),
        ),
      );
      h.currentHp = Math.min(
        stats(h).hp,
        (h.recoveryHp || 0) + (stats(h).hp - (h.recoveryHp || 0)) * progress,
      );
      if (progress >= 1) {
        h.recoveryUntil = 0;
        h.recoveryStarted = 0;
        h.currentHp = stats(h).hp;
      }
    }
  }
  for (const i of [...g.inventory, ...g.roster.flatMap(allGear)])
    if (i.sharpenJob && i.sharpenJob.ends <= g.lastClock) {
      i.rank++;
      i.sharpenJob = null;
      const owner = g.roster.find((h) => allGear(h).includes(i));
      if (owner) owner.currentHp = stats(owner).hp;
    }
}
export function beginRecovery(g, h, now, defeat = false) {
  delete h.runBuff;
  delete h.petBuff;
  const max = stats(h).hp;
  const starting = Math.max(1, Math.min(max, h.currentHp ?? max));
  const fed = Ever.fed(g, h);
  const seconds = (defeat ? 90 : 30) * (fed ? 0.5 : 1);
  h.currentHp = starting;
  h.recoveryHp = starting;
  h.recoveryStarted = now;
  h.recoveryUntil = now + seconds * 1000;
}
export function buyFood(g, count) {
  if (
    g.screen !== "camp" ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 50 ||
    g.gold < count * 4
  )
    return false;
  g.gold -= count * 4;
  g.food += count;
  g.serviceCounts ||= { foodBought: 0, cooked: 0, crafted: 0, guildLessons: 0 };
  g.serviceCounts.foodBought += count;
  return true;
}
export function cook(g, key) {
  const recipe = COOKING[key];
  if (
    g.screen !== "camp" ||
    !g.buildings.kitchen ||
    !recipe ||
    !payCost(g, recipe.cost)
  )
    return false;
  g.serviceCounts ||= { foodBought: 0, cooked: 0, crafted: 0, guildLessons: 0 };
  g.serviceCounts.cooked++;
  if (recipe.output === "food") g.food += recipe.count;
  else
    g.consumables[recipe.output] =
      (g.consumables[recipe.output] || 0) + recipe.count;
  return true;
}
export function brew(g, key) {
  const recipe = BREWS[key];
  if (
    g.screen !== "camp" ||
    !g.buildings.alchemist ||
    !recipe ||
    !hasCost(g, recipe.cost) ||
    g.gems < (recipe.gems || 0)
  )
    return false;
  payCost(g, recipe.cost);
  spendGems(g, recipe.gems || 0);
  g.consumables[key] = (g.consumables[key] || 0) + 1;
  return true;
}
export function fuseGems(g, kind, size) {
  if (
    g.screen !== "camp" ||
    !g.buildings.alchemist ||
    !GEM_KINDS[kind] ||
    !Number.isInteger(size) ||
    size < 0 ||
    size >= 3
  )
    return false;
  const gems = g.gemstones
    .filter((v) => v.kind === kind && v.size === size)
    .slice(0, 3);
  if (gems.length < 3) return false;
  g.gemstones = g.gemstones.filter((v) => !gems.some((a) => a.id === v.id));
  g.gemstones.push(makeGem(kind, size + 1));
  g.gems = gemsTotal(g);
  return true;
}
export function transmuteGem(g, id, material) {
  if (
    g.screen !== "camp" ||
    !g.buildings.alchemist ||
    !["ore", "herbs", "stone"].includes(material)
  )
    return false;
  const gem = g.gemstones.find((v) => v.id === id);
  if (!gem) return false;
  g.gemstones = g.gemstones.filter((v) => v !== gem);
  g.materials[material] += gemValue(gem) * 3;
  g.gems = gemsTotal(g);
  return true;
}
export function socketGem(g, h, id, index) {
  if (
    g.screen !== "camp" ||
    !idle(g, h) ||
    !h.companion ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= companionSlots(h.companion)
  )
    return false;
  const gem = g.gemstones.find((v) => v.id === id);
  if (!gem) return false;
  h.companion.sockets ||= [];
  const previous = h.companion.sockets[index];
  h.companion.sockets[index] = gem;
  g.gemstones = g.gemstones.filter((v) => v !== gem);
  if (previous) g.gemstones.push(previous);
  g.gems = gemsTotal(g);
  h.currentHp = stats(h).hp;
  return true;
}
export function unsocketGem(g, h, index) {
  if (g.screen !== "camp" || !idle(g, h) || !h.companion?.sockets?.[index])
    return false;
  g.gemstones.push(h.companion.sockets[index]);
  h.companion.sockets[index] = null;
  g.gems = gemsTotal(g);
  h.currentHp = stats(h).hp;
  return true;
}
export function pack(g, key) {
  if (
    !["party", "crossroads", "calendar", "arena"].includes(g.screen) ||
    !CONSUMABLES[key] ||
    !(g.consumables[key] > 0)
  )
    return false;
  g.packed ||= [];
  if (g.packed.includes(key)) g.packed = g.packed.filter((v) => v !== key);
  else if (g.packed.length < 3) g.packed.push(key);
  else return false;
  return true;
}
export function applySupplies(g, r, heroes) {
  r.supplies = [];
  r.temporaryParty = [];
  for (const key of g.packed || []) {
    if (!(g.consumables[key] > 0)) continue;
    g.consumables[key]--;
    r.supplies.push(key);
    for (const h of heroes) {
      h.runBuff ||= {};
      if (key === "might") {
        h.runBuff.strength = 4;
        h.runBuff.mind = 3;
      }
      if (key === "stew") {
        h.runBuff.vitality = 4;
        h.runBuff.endurance = 3;
      }
      if (key === "tea") {
        h.runBuff.mind = 4;
        h.runBuff.agility = 2;
      }
      if (key === "warding") {
        h.runBuff.armor = 3;
        h.runBuff.vitality = 3;
      }
      if (key === "treat" && h.companion) {
        gainItemXp(h.companion, 100);
        h.petBuff = 1.25;
      }
    }
  }
  g.packed = [];
}
export function materialDrop(g, r, amount = 1) {
  const key = ["wood", "stone", "herbs", "meat", "ore"][
    (r.stage + r.earned.kills) % 5
  ];
  g.materials[key] += amount;
  r.earned.materials ||= {};
  r.earned.materials[key] = (r.earned.materials[key] || 0) + amount;
}
export function gatherAfterBattle(g, r, heroes) {
  materialDrop(g, r, 2);
  gatherProfessions(g, r, heroes);
}

export function chooseClassNode(g, h, nodeId) {
  if (g.screen !== "camp" || !idle(g, h) || !classPoints(h)) return false;
  const path = classTree(h).find((p) => p.nodes.some((n) => n.id === nodeId)),
    node = path?.nodes.find((n) => n.id === nodeId);
  if (!node || !classNodeState(h, node).available) return false;
  if (node.kind === "subclass") {
    h.classPath = path.id;
    h.specialization = path.id;
  }
  h.classNodes.push(nodeId);
  h.currentHp = stats(h).hp;
  note(
    h,
    "Spent a class point at the Bonfire: " +
      node.name +
      ". Sibling choices are locked.",
  );
  return true;
}
export function teachTalent() {
  return false;
}
export function equipArmor(g, h, itemId, index) {
  if (g.screen !== "camp" || !idle(g, h)) return false;
  const i = g.inventory.find((i) => i.id === itemId);
  if (!i || i.unidentified || i.sharpenJob || armorRestriction(h, i, index))
    return false;
  g.inventory = g.inventory.filter((a) => a !== i);
  if (h.armor[index]) g.inventory.push(h.armor[index]);
  h.armor[index] = i;
  h.currentHp = stats(h).hp;
  return true;
}
export function removeArmor(g, h, index) {
  if (g.screen !== "camp" || !idle(g, h) || !h.armor[index]) return false;
  g.inventory.push(h.armor[index]);
  h.armor[index] = null;
  h.currentHp = stats(h).hp;
  return true;
}
export function evolveObject(g, kind, id, choice = null) {
  if (
    g.screen !== "camp" ||
    !["weapon", "armor", "pet"].includes(kind) ||
    (kind === "weapon" && !g.buildings.blacksmith && !g.buildings.armory) ||
    (kind !== "weapon" && !g.buildings.armory)
  )
    return false;
  const owner = g.roster.find((h) =>
    kind === "pet"
      ? h.companion?.id === id
      : allGear(h).some((i) => i.id === id),
  );
  if (owner && !idle(g, owner)) return false;
  const i =
    kind === "pet"
      ? owner?.companion || g.companions.find((i) => i.id === id)
      : allGear(owner || {}).find((i) => i.id === id) ||
        g.inventory.find((i) => i.id === id);
  if (
    !i ||
    (kind === "armor" && ITEMS[i.key].type !== "armor") ||
    (kind === "weapon" && !ITEMS[i.key].weaponKind)
  )
    return false;
  const { stage, level, cost, material, choices } = transformationOptions(
    i,
    kind,
  );
  if (
    !level ||
    i.level < level ||
    i.sharpenJob ||
    i.unidentified ||
    g.gems < cost ||
    (material && (g.materials[material] || 0) < 5)
  )
    return false;
  const picked = choice
    ? choices.find((c) => c.kind === choice.kind && c.key === choice.key)
    : choices[0];
  if (
    !picked ||
    (picked.kind === "enchantment" &&
      owner &&
      (kind !== "pet" || PETS[i.key].mode === "mount") &&
      abilities(owner).length >= 10)
  )
    return false;
  spendGems(g, cost);
  if (material) g.materials[material] -= 5;
  i.evolution = stage + 1;
  i[picked.kind] = picked.key;
  i.rarityTier = itemRarity(i);
  if (owner) {
    owner.currentHp = stats(owner).hp;
    note(
      owner,
      "A familiar " +
        (kind === "pet"
          ? "friend"
          : kind === "armor"
            ? "armor piece"
            : "weapon") +
        " transformed at " +
        (kind === "weapon" ? "the Blacksmith." : "the Equipment Workshop."),
    );
  }
  return true;
}

export function hatchEgg(g, key) {
  if (
    g.screen !== "camp" ||
    !g.buildings.archaeology ||
    !["raptor", "hadrosaur"].includes(key) ||
    g.eggs < 1 ||
    g.gold < 40
  )
    return false;
  g.eggs--;
  g.gold -= 40;
  g.companions.push(makePet(key, 1));
  return true;
}
export function growFossil(g, key) {
  if (
    g.screen !== "camp" ||
    !g.buildings.archaeology ||
    !PETS[key]?.fossilOnly ||
    !payCost(g, { gold: 55, fossils: PETS[key].fossilCost })
  )
    return false;
  const p = makePet(key, 1);
  g.companions.push(p);
  return p;
}
export function forgeWeapon(g, key) {
  const d = WEAPONS[key];
  if (
    g.screen !== "camp" ||
    !g.buildings.blacksmith ||
    !d ||
    d.mythicalOnly ||
    !payCost(g, { gold: Math.round(d.price * 0.8), wood: 2, ore: 2 })
  )
    return false;
  const item = makeItem(key, 1);
  g.inventory.push(item);
  return item;
}
export const CAMP_EXPANSIONS = {
  east: {
    name: "East meadow",
    purpose: "Farm plots and growing food",
    cost: { gold: 150, wood: 20, stone: 10 },
  },
  west: {
    name: "West grove",
    purpose: "Cabins that increase adventurer capacity",
    cost: { gold: 150, wood: 20, stone: 10 },
  },
  south: {
    name: "South lakeshore",
    purpose: "Waterfront gardens, a dock and the island beyond",
    cost: { gold: 150, wood: 20, stone: 10 },
  },
};
export function expansionCost(g, key) {
  const d = CAMP_EXPANSIONS[key];
  if (!d) return null;
  const scale = 1 + (g.campExpansions?.length || 0) * 0.75;
  return Object.fromEntries(
    Object.entries(d.cost).map(([k, v]) => [k, Math.ceil(v * scale)]),
  );
}
export function expandCamp(g, key) {
  if (
    g.screen !== "camp" ||
    !CAMP_EXPANSIONS[key] ||
    g.campExpansions.includes(key) ||
    !payCost(g, expansionCost(g, key))
  )
    return false;
  Ever.awardCampXp(g, 350, "construction");
  g.campExpansions.push(key);
  g.campZone = key;
  return true;
}
export function setCampZone(g, key) {
  if (
    g.screen !== "camp" ||
    (key !== "center" && !g.campExpansions.includes(key))
  )
    return false;
  g.campZone = key;
  return true;
}
export function harvestCamp(g, key) {
  const d = BUILDINGS[key];
  if (
    g.screen !== "camp" ||
    !g.buildings[key] ||
    !["farm", "garden"].includes(key)
  )
    return false;
  const timer = key + "HarvestAt",
    last = g[timer] ?? g.lastClock,
    cycles = Math.min(12, Math.floor((g.lastClock - last) / 300000));
  if (cycles < 1) return false;
  g[timer] = g.lastClock;
  if (key === "farm") g.food += cycles * 2;
  else g.materials.herbs += cycles;
  return true;
}
export function releaseHero(g, h) {
  if (g.screen !== "camp" || !idle(g, h) || h.favorite || g.roster.length <= 3)
    return false;
  g.inventory.push(...allGear(h));
  if (h.companion) g.companions.push(h.companion);
  const reward = Ever.retirementValue(h);
  g.gold += reward.gold;
  addGems(g, reward.gems);
  g.roster = g.roster.filter((v) => v !== h);
  g.staging = g.staging.filter((id) => id !== h.id);
  g.marketParty = g.marketParty.filter((id) => id !== h.id);
  return true;
}
