import { validLearning } from "./onboarding.js?v=20";
import * as Ever from "./evernight.js?v=20";
import { questById } from "./journeys.js?v=20";
import * as Night from "./nightfall.js?v=20";
import {
  GAME_SEASON,
  MYTHICAL_HEROES,
  MYTHICAL_WEAPONS,
  makeMythicalHero,
  makeMythicalWeapon,
  CLASSES,
  ITEMS,
  RACES,
  CORE_STATS,
  SCHOOLS,
  LINEAGES,
  LOCATIONS,
  ATTRIBUTES,
  MAX_ABILITIES,
  MAX_EQUIPMENT,
  abilities,
  generateHero,
  makeItem,
  stats,
  gainXp,
  equipmentSlots,
  uid,
  makeFacet,
  hasAttribute,
  trainingBonus,
  makePet,
  PETS,
  COSMETICS,
  CONSUMABLES,
  VENDORS,
  DIFFICULTIES,
  CAMPAIGNS,
  EVENTS,
  periodKey,
  itemRarity,
  heroRarity,
  gainItemXp,
  equipmentRestriction,
  makeGem,
  gemValue,
  allGear,
  TALENTS,
  normalizeHero,
  armorSlots,
  armorRestriction,
  evolutionName,
  classTree,
  validClassNodes,
  migrateClassNodes,
  normalizeWeapon,
  rarity,
  WEAPONS,
  PREFIXES,
  AFFIXES,
  ENCHANTMENTS,
  objectModifiers,
  modifierPool,
  modifierFits,
  validModifiers,
  petInfo,
} from "./data.js?v=20";
import * as Camp from "./camp.js?v=20";
import {
  BRANCHES,
  calendarDay,
  calendarMonth,
  CALENDAR_BONUSES,
} from "./world.js?v=20";
import {
  journeyInfo,
  journeyRequirements,
  revealJourney,
  REGIONS,
  REGION_ORDER,
  QUESTS,
  questState,
  trackQuest,
  difficultyAllowed,
  REGION_CHAMPIONS,
} from "./journeys.js?v=20";
import { seeded } from "./engine.js?v=20";
export const SLOT_MILESTONES = [0, 12, 35, 75];
export const activeExpeditions = (g) =>
  g.expeditions.filter((r) => r.status === "active");
export const expeditionSlots = (g) =>
  Math.min(
    4,
    Math.max(
      SLOT_MILESTONES.filter((n) => g.lifetimeEncounters >= n).length,
      1 + Object.values(g.campaign).filter((n) => n >= 5).length,
    ),
  );
export const inCamp = (g) => g.screen === "camp";
export const party = (g, r) => [
  ...g.roster.filter((h) => r.party.includes(h.id)),
  ...(r.status === "active"
    ? [...(r.recruits || []), ...(r.temporaryParty || [])]
    : []),
];
export const assignedTo = (g, h) =>
  activeExpeditions(g).find((r) => r.party.includes(h.id)) || null;
export const available = (g, h) =>
  !h.retired &&
  !assignedTo(g, h) &&
  !(h.recoveryUntil > g.lastClock) &&
  !Camp.heroJob(h);
export function stageCrossroads(g, arena = false) {
  g.screen = arena ? "arena" : "crossroads";
  g.staging = g.staging.filter((id) =>
    g.roster.some((h) => h.id === id && available(g, h)),
  );
  if (!g.staging.length)
    g.staging = g.roster
      .filter((h) => available(g, h))
      .slice(0, 3)
      .map((h) => h.id);
  return true;
}
export function toggleStage(g, id) {
  const h = g.roster.find((h) => h.id === id);
  if (
    !["party", "crossroads", "calendar", "challenges", "arena"].includes(
      g.screen,
    ) ||
    !h ||
    !available(g, h)
  )
    return false;
  if (
    !g.staging.includes(id) &&
    g.staging.length >= (g.screen === "arena" ? 3 : 6)
  )
    return false;
  g.staging = g.staging.includes(id)
    ? g.staging.filter((v) => v !== id)
    : [...g.staging, id];
  return true;
}
export function destinationInfo(g, choice = g.destination) {
  if (choice.mode === "journey") return journeyInfo(g, choice);
  if (choice.mode === "island") return Night.islandInfo(g);
  const { mode, location, node = 0, branch = null, event = "daily" } = choice;
  const difficulty = g.worldDifficulty || "normal";
  const d = DIFFICULTIES[difficulty];
  if (!d) return null;
  if (mode === "arena")
    return {
      ...choice,
      name: Ever.arenaRule(g).name,
      arenaRule: Ever.arenaRule(g).id,
      location: "cinder",
      mode: "arena",
      encounters: 1,
      level: Math.max(
        4,
        Math.floor(
          g.roster
            .filter((h) => g.staging.includes(h.id))
            .reduce((s, h) => s + h.level, 0) / Math.max(1, g.staging.length),
        ),
      ),
      reward: d.reward,
      unlocked: true,
      difficulty,
      route: "main",
    };
  if (mode === "trial") return trialInfo(g, choice);
  if (mode === "calendar") {
    const day = calendarDay(g.lastClock, choice.day);
    if (!day || (choice.month && choice.month !== day.month)) return null;
    return { ...choice, ...day, difficulty, reward: day.reward * d.reward };
  }
  if (mode === "event") {
    const e = EVENTS[event];
    if (!e) return null;
    return {
      ...choice,
      name: e.name,
      location: e.location,
      encounters: e.count,
      level: { daily: 4, weekly: 9, monthly: 15 }[event],
      reward: d.reward,
      unlocked: true,
      difficulty,
      route: "main",
      event,
      period: periodKey(event, g.lastClock),
    };
  }
  const n = CAMPAIGNS[location]?.[node];
  if (!n) return null;
  const side = branch
    ? BRANCHES[location]?.find((b) => b.id === branch && b.node === node)
    : null;
  if (branch && !side) return null;
  return {
    ...choice,
    mode: "campaign",
    name: side?.name || n[0],
    encounters: side?.count || n[1],
    level: side?.level || n[2],
    milestone: side?.reward || n[3],
    reward: d.reward * (side ? 1.3 : 1),
    branch: side?.id || null,
    unlocked: node <= g.campaign[location],
    difficulty,
    route: "main",
  };
}
export function setDestination(g, choice) {
  if (!["crossroads", "calendar", "challenges", "arena"].includes(g.screen))
    return false;
  const next = { ...g.destination, ...choice };
  if (
    next.mode === "journey" &&
    !g.regionUnlocks.includes(next.location || "greenway")
  )
    return false;
  next.difficulty = g.worldDifficulty || "normal";
  const info = destinationInfo(g, next);
  if (!info) return false;
  g.destination = { ...next, location: info.location };
  g.location = info.location;
  g.lockedJourney = null;
  return true;
}
export function lockRoute(g) {
  if (g.screen !== "crossroads" || g.destination.mode !== "journey")
    return false;
  const config = destinationInfo(g);
  if (!config?.unlocked) return false;
  g.lockedJourney = structuredClone(config);
  g.staging = g.staging.filter((id) =>
    g.roster.some((h) => h.id === id && available(g, h)),
  );
  if (!g.staging.length)
    g.staging = g.roster
      .filter((h) => available(g, h))
      .slice(0, 3)
      .map((h) => h.id);
  g.screen = "party";
  return true;
}
export function visitMarket(g, ids) {
  if (
    g.screen !== "camp" ||
    !g.buildings.market ||
    !Array.isArray(ids) ||
    ids.length > 6 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !g.roster.some((h) => h.id === id && available(g, h)))
  )
    return false;
  g.marketParty = [...ids];
  g.marketDistrict = "square";
  g.screen = "market";
  for (const v of VENDORS) marketStock(g, v.id);
  return true;
}
export function moveResident(g, id, x, y) {
  const h = g.roster.find((h) => h.id === id);
  if (
    !h ||
    !available(g, h) ||
    !["camp", "market"].includes(g.screen) ||
    (g.screen === "market" && !g.marketParty.includes(id)) ||
    ![x, y].every(Number.isFinite)
  )
    return false;
  g.mapPositions[g.screen][id] = {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(g.screen === "camp" ? 3 : 16, Math.min(95, y)),
  };
  return true;
}
export function startExpedition(g, options = {}, now = g.lastClock) {
  const config =
    g.screen === "party"
      ? g.lockedJourney
      : destinationInfo(
          g,
          g.screen === "arena"
            ? {
                mode: "arena",
                difficulty: options.difficulty || g.destination.difficulty,
              }
            : g.destination,
        );
  if (
    !["party", "crossroads", "calendar", "challenges", "arena"].includes(
      g.screen,
    ) ||
    (config?.mode === "journey" &&
      (g.screen !== "party" ||
        !difficultyAllowed(g, config.location, config.difficulty))) ||
    !config?.unlocked ||
    activeExpeditions(g).length >= expeditionSlots(g) ||
    g.staging.length < 3 ||
    g.staging.length > (config.mode === "arena" ? 3 : 6)
  )
    return false;
  const heroes = g.roster.filter((h) => g.staging.includes(h.id));
  if (
    heroes.length !== g.staging.length ||
    heroes.some((h) => !available(g, h))
  )
    return false;
  const req = journeyRequirements(g, config, heroes);
  if (req.missing.length) return false;
  const wager = config.mode === "arena" ? Ever.payWager(g) : null;
  if (config.mode === "arena" && !wager) return false;
  g.food -= req.food;
  for (const h of heroes) h.deployed = true;
  g.expeditionCount++;
  const r = {
    ...config,
    wager,
    id: uid("expedition"),
    number: g.expeditionCount,
    foodReserved: req.food,
    stage: 0,
    seed: options.seed ?? Math.floor(Math.random() * 999999),
    party: heroes.map((h) => h.id),
    status: "active",
    auto: false,
    phase: "prepare",
    phaseSeconds: 4,
    startedAt: now,
    elapsedSeconds: 0,
    pendingSeconds: 0,
    history: [],
    captures: [],
    recruits: [],
    earned: { gold: 0, gems: 0, items: 0, essences: 0, kills: 0 },
    waveDefeated: [],
    battleState: null,
    stop: null,
  };
  Camp.applySupplies(g, r, heroes);
  if (r.supplies.includes("helper")) {
    const level = Math.round(
        heroes.reduce((a, h) => a + h.level, 0) / heroes.length,
      ),
      guest = generateHero({
        classId: "guardian",
        race: "Human",
        level,
        name: "Guest wayfarer",
        temporary: true,
      });
    guest.currentHp = stats(guest).hp;
    r.temporaryParty.push(guest);
  }
  for (const h of heroes) h.currentHp = stats(h).hp;
  g.expeditions.push(r);
  g.firstExpedition = false;
  g.screen = "expedition";
  g.selectedExpedition = r.id;
  g.staging = [];
  g.lockedJourney = null;
  return r;
}
function canManage(g, h) {
  return !!h && inCamp(g) && g.roster.includes(h) && available(g, h);
}
function marketManage(g, h) {
  return (
    !!h &&
    ["market", "camp"].includes(g.screen) &&
    g.roster.includes(h) &&
    available(g, h)
  );
}
export function equip(g, h, itemId, slot) {
  if (!canManage(g, h)) return false;
  const index = g.inventory.findIndex((i) => i.id === itemId),
    def = equipmentSlots(h)[slot];
  if (index < 0 || !def) return false;
  const i = g.inventory[index];
  if (
    i.unidentified ||
    i.sharpenJob ||
    !def.types.includes(ITEMS[i.key].type) ||
    equipmentRestriction(h, i, slot)
  )
    return false;
  g.inventory.splice(index, 1);
  if (h.items[slot]) g.inventory.push(h.items[slot]);
  h.items[slot] = i;
  h.currentHp = stats(h).hp;
  return true;
}
export function unequip(g, h, slot) {
  if (!canManage(g, h) || !h.items[slot]) return false;
  g.inventory.push(h.items[slot]);
  h.items[slot] = null;
  h.currentHp = stats(h).hp;
  return true;
}
export function equipPet(g, h, id) {
  if (!canManage(g, h)) return false;
  const index = g.companions.findIndex((i) => i.id === id);
  if (index < 0) return false;
  const pet = g.companions[index];
  if (
    PETS[pet.key].mode === "mount" &&
    petInfo(pet).spell &&
    abilities({ ...h, companion: null }).length >= MAX_ABILITIES
  )
    return false;
  g.companions.splice(index, 1);
  if (h.companion) g.companions.push(h.companion);
  h.companion = pet;

  return true;
}
export function removePet(g, h) {
  if (!canManage(g, h) || !h.companion) return false;
  g.companions.push(h.companion);
  h.companion = null;
  return true;
}
export const trainingCost = Camp.trainingCost;
export const train = Camp.beginTraining;
export const improveItem = Camp.beginSharpen;
export function unlockEquipment(g, h, type) {
  const types = [
    "weapon",
    "focus",
    "offhand",
    "feet",
    "tool",
    "charm",
    "scroll",
  ];
  if (
    (g.screen === "camp" && !g.buildings.armory) ||
    !["market", "camp"].includes(g.screen) ||
    (type === "scroll" && !CLASSES[h.classId].magical) ||
    !marketManage(g, h) ||
    h.level < 10 ||
    equipmentSlots(h).length >= MAX_EQUIPMENT ||
    !types.includes(type) ||
    g.gold < 75 ||
    g.gems < 2
  )
    return false;
  g.gold -= 75;
  Camp.spendGems(g, 2);
  const at = CLASSES[h.classId].slots.length + h.extraSlots.length;
  h.extraSlots.push({
    label: type[0].toUpperCase() + type.slice(1),
    types: [type],
  });
  h.items.splice(at, 0, null);

  return true;
}
export const transformRequirement = () => null;
export const transformationCost = () => 0;
export const transform = () => false;
export function combine(g, h, donor) {
  if (
    (g.screen === "camp" && !g.buildings.alchemist) ||
    !marketManage(g, h) ||
    !marketManage(g, donor) ||
    h.id === donor.id ||
    donor.favorite ||
    g.roster.filter((v) => !v.retired).length <= 3 ||
    g.gems < 3 ||
    g.gold < 80 ||
    h.classId === donor.classId ||
    h.fusion.some((a) => a.classId === donor.classId) ||
    abilities(h).length >= MAX_ABILITIES
  )
    return false;
  h.fusion.push({ classId: donor.classId, name: donor.name });
  h.skills["learned:" + donor.classId] = {
    ...structuredClone(donor.skills["class:" + donor.classId]),
    key: "learned:" + donor.classId,
  };
  g.gold -= 80;
  Camp.spendGems(g, 3);
  returnBelongings(g, donor);
  g.roster = g.roster.filter((a) => a !== donor);

  return true;
}
export function buildHero(g, race, classId, scrollId) {
  const scroll = g.scrolls.find(
    (s) => s.id === scrollId && s.analyzed && s.race === race,
  );
  if (
    (g.screen === "camp" && !g.buildings.alchemist) ||
    !["market", "camp"].includes(g.screen) ||
    g.roster.length >= Camp.campCapacity(g) ||
    !scroll ||
    !RACES[race] ||
    !CLASSES[classId] ||
    ["witch", "stormcaller"].includes(classId) ||
    g.gold < 160 ||
    g.gems < 6
  )
    return false;
  g.gold -= 160;
  Camp.spendGems(g, 6);
  g.scrolls = g.scrolls.filter((s) => s !== scroll);
  const h = generateHero({ race, classId });
  g.roster.push(h);

  return h;
}
export function addAttribute() {
  return false;
}
export function consume(g, h, key) {
  return false;
}
export function renameHero(g, h, name) {
  const text = String(name).trim().slice(0, 32);
  if (!g.roster.includes(h) || !text) return false;
  h.name = text;
  return true;
}
export function favoriteHero(g, h) {
  if (!g.roster.includes(h)) return false;
  h.favorite = !h.favorite;
  return true;
}
export function recover(g, h) {
  return false;
}
export function salvageValue(kind, obj) {
  return kind === "hero"
    ? Ever.retirementValue(obj)
    : {
        gold:
          Math.round(
            (kind === "pet" ? PETS[obj.key].price : ITEMS[obj.key].price) * 0.3,
          ) +
          obj.level * 2,
        gems: obj.level >= 20 ? 1 + Math.floor(obj.level / 40) : 0,
      };
}
function returnBelongings(g, h) {
  g.inventory.push(...allGear(h));
  if (h.companion) g.companions.push(h.companion);
  g.staging = g.staging.filter((id) => id !== h.id);
}
export function recycle(g, kind, id, sell = false) {
  if (sell ? !["market", "camp"].includes(g.screen) : !inCamp(g)) return false;
  const list =
      kind === "hero"
        ? g.roster
        : kind === "pet"
          ? g.companions
          : kind === "item"
            ? g.inventory
            : null,
    obj = list?.find((o) => o.id === id);
  if (
    !obj ||
    (kind === "item" && obj.sharpenJob) ||
    (kind === "hero" &&
      (!available(g, obj) ||
        g.roster.filter((v) => !v.retired).length <= 3 ||
        obj.favorite))
  )
    return false;
  if (kind === "hero") return Camp.releaseHero(g, obj);
  const value = salvageValue(kind, obj);
  if (kind === "hero") returnBelongings(g, obj);
  if (kind === "pet") g.gemstones.push(...(obj.sockets || []).filter(Boolean));
  list.splice(list.indexOf(obj), 1);
  g.gold += sell ? Math.round(value.gold * 1.35) : value.gold;
  if (!sell) Camp.addGems(g, value.gems);
  g.gems = Camp.gemsTotal(g);
  return true;
}
function offer(kind, fields) {
  return { id: uid("offer"), kind, ...fields };
}
export function makeScroll(race, analyzed = false) {
  return { id: uid("scroll"), race, analyzed };
}
export const STOCK_PERIOD = 12 * 60 * 60 * 1000;
export function refreshStock(g) {
  const epoch = Math.floor(g.lastClock / STOCK_PERIOD);
  if (g.marketEpoch !== epoch) {
    g.marketEpoch = epoch;
    g.market = {};
    g.gemShop = null;
  }
  return (epoch + 1) * STOCK_PERIOD;
}
export function stockResetAt(g) {
  return (Math.floor(g.lastClock / STOCK_PERIOD) + 1) * STOCK_PERIOD;
}
function stockedItem(key, level) {
  const i = makeItem(key, level, rarity(level));
  if (ITEMS[key].weaponKind && level >= 20) {
    i.evolution = rarity(level);
    i.prefix = Object.keys(PREFIXES)[level % 6];
    if (level >= 40) i.affix = Object.keys(AFFIXES)[level % 6];
    if (level >= 60) i.enchantment = Object.keys(ENCHANTMENTS)[level % 5];
  }
  return i;
}
function makeStock(vendor, epoch = 0) {
  const random = seeded(epoch * 7919 + vendor.charCodeAt(0) * 101);
  if (vendor === "lights")
    return ["hooded-lantern", "witchlight-lantern"].flatMap((key) =>
      Array.from({ length: 6 }, () =>
        offer("item", { item: makeItem(key), gold: ITEMS[key].price, gems: 0 }),
      ),
    );
  if (vendor === "guild") {
    const classes = Object.keys(CLASSES).filter(
        (k) => !["witch", "stormcaller"].includes(k),
      ),
      races = [
        "Human",
        "Elf",
        "Gnome",
        "Dwarf",
        "Orc",
        "Nereid",
        "Kobold",
        "Owlkin",
        "Bearkin",
      ];
    return classes
      .map((classId, i) => {
        const level = 1 + Math.floor(random() * 8),
          hero = generateHero(
            { classId, race: races[(i + epoch) % races.length], level },
            random,
          );
        if (random() < 0.08) {
          const key = Night.PROFESSION_NAMES[Math.floor(random() * 3)];
          hero.attributes.push(makeFacet(key));
          if (TALENTS[key]?.slot && equipmentSlots(hero).length <= 8)
            hero.items.push(makeItem(key === "Miner" ? "pickaxe" : "axe"));
        }
        return offer("hero", { hero, gold: 240 + level * 8, gems: 0 });
      })
      .concat(
        [22, 42, 62].map((level, i) => {
          const hero = generateHero(
            {
              classId: classes[(epoch + i * 5) % classes.length],
              race: races[(epoch + i * 3) % races.length],
              level,
            },
            random,
          );
          hero.items = hero.items.map((v) =>
            stockedItem(v.key, Math.max(1, level - 8)),
          );
          hero.armor = hero.armor.map((v) =>
            v ? stockedItem(v.key, Math.max(1, level - 8)) : null,
          );
          return offer("hero", { hero, gold: 300 + level * 35, gems: 0 });
        }),
      );
  }
  if (vendor === "forge") {
    const keys = Object.keys(ITEMS).filter(
      (k) => !ITEMS[k].mythicalOnly && !ITEMS[k].guildOnly,
    );
    return keys
      .map((key) =>
        offer("item", {
          item: stockedItem(key, 1 + Math.floor(random() * 12)),
          gold: ITEMS[key].price,
          gems: 0,
        }),
      )
      .concat(
        [24, 44, 64].map((level, i) => {
          const weapons = Object.keys(WEAPONS).filter(
              (k) => !WEAPONS[k].mythicalOnly,
            ),
            key = weapons[(epoch * 3 + i * 13) % weapons.length];
          return offer("item", {
            item: stockedItem(key, level),
            gold: Math.round(ITEMS[key].price * (2 + i * 2)),
            gems: 0,
          });
        }),
      );
  }
  if (vendor === "arcane")
    return [
      "Human",
      "Elf",
      "Dwarf",
      "Drakeling",
      "Automaton",
      "Ent",
      "Celestial",
      "Owlkin",
      "Bearkin",
    ]
      .map((race) =>
        offer("scroll", { scroll: makeScroll(race), gold: 65, gems: 0 }),
      )
      .concat(
        ["ember", "frost", "lens", "tome", "wings"].map((key, i) =>
          offer("item", {
            item: {
              ...stockedItem(key, i === 0 ? 40 : 1 + Math.floor(random() * 10)),
              unidentified: true,
            },
            gold: i === 0 ? 220 : 80,
            gems: 0,
          }),
        ),
      );
  if (vendor === "night")
    return Object.keys(CONSUMABLES)
      .filter((key) => CONSUMABLES[key].price > 0)
      .map((key) =>
        offer("consumable", { key, gold: CONSUMABLES[key].price, gems: 0 }),
      );
  if (vendor === "menagerie")
    return Object.keys(PETS)
      .filter((k) => !PETS[k].eggOnly && !PETS[k].fossilOnly)
      .map((key, i) =>
        offer("pet", {
          pet: makePet(
            key,
            i === epoch % 6 ? 22 : 1 + Math.floor(random() * 10),
          ),
          gold: PETS[key].price * (i === epoch % 6 ? 2 : 1),
          gems: 0,
        }),
      )
      .concat([
        offer("pet", { pet: makePet("sprite", 42), gold: 420, gems: 0 }),
      ]);
  if (vendor === "atelier")
    return Object.keys(COSMETICS)
      .filter((key) => COSMETICS[key].monthly === undefined)
      .map((key) =>
        offer("cosmetic", { key, gold: COSMETICS[key].price, gems: 0 }),
      );
  return [];
}
export function marketStock(g, vendor) {
  refreshStock(g);
  return (g.market[vendor] ||= makeStock(vendor, g.marketEpoch));
}
export function buy(g, input) {
  if (!["market", "camp"].includes(g.screen)) return false;
  let list, index;
  for (const v of VENDORS) {
    const stock = marketStock(g, v.id),
      i = stock.findIndex((o) => o.id === input.id);
    if (i >= 0) {
      list = stock;
      index = i;
      break;
    }
  }
  if (!list) return false;
  const o = list[index];
  if (
    (g.screen === "market" && !g.buildings.market) ||
    (g.screen === "camp" &&
      !(o.kind === "hero" && g.buildings.tavern) &&
      !(g.buildings.tradingpost && (g.market.forge || []).includes(o)))
  )
    return false;
  if (["attribute", "talent"].includes(o.kind)) return false;
  if (
    o.kind === "hero" &&
    heroRarity(o.hero) > Math.min(3, g.buildings.tavern || 1)
  )
    return false;
  if (
    (o.kind === "hero" && g.roster.length >= Camp.campCapacity(g)) ||
    g.gold < o.gold ||
    g.gems < o.gems ||
    (o.kind === "cosmetic" && g.cosmetics.includes(o.key))
  )
    return false;
  g.gold -= o.gold;
  Camp.spendGems(g, o.gems);
  list.splice(index, 1);
  if (o.kind === "hero") {
    g.roster.push(o.hero);
    return o.hero;
  }
  if (o.kind === "item") {
    g.inventory.push(o.item);
    return o.item;
  }
  if (o.kind === "pet") {
    g.companions.push(o.pet);
    return o.pet;
  }
  if (o.kind === "scroll") g.scrolls.push(o.scroll);
  else if (o.kind === "consumable")
    g.consumables[o.key] = (g.consumables[o.key] || 0) + 1;
  else if (o.kind === "cosmetic") g.cosmetics.push(o.key);
  else g.essences[o.key] = (g.essences[o.key] || 0) + 1;
  return o;
}
export function restockMarket() {
  return false;
}
export function gemShopStock(g) {
  refreshStock(g);
  if (g.gemShop) return g.gemShop;
  return (g.gemShop = [
    ...Object.keys(COSMETICS)
      .filter((key) => COSMETICS[key].monthly === undefined)
      .map((key, i) =>
        offer("cosmetic", {
          key,
          gold: 0,
          gems: COSMETICS[key].gems || 3 + i * 2,
        }),
      ),
    ...Object.keys(MYTHICAL_WEAPONS).map((key, i) =>
      offer("item", {
        item: makeMythicalWeapon(key),
        gold: 0,
        gems: 45 + i * 15,
      }),
    ),
    ...Object.entries(MYTHICAL_HEROES).map(([key, d]) =>
      offer("hero", { hero: makeMythicalHero(key), gold: 0, gems: d.price }),
    ),
  ]);
}
export function buyGemShop(g, id) {
  if (g.screen !== "shop") return false;
  const list = gemShopStock(g),
    o = list.find((o) => o.id === id);
  if (
    !o ||
    g.gems < o.gems ||
    (o.kind === "hero" && g.roster.length >= Camp.campCapacity(g)) ||
    (o.kind === "cosmetic" && g.cosmetics.includes(o.key))
  )
    return false;
  Camp.spendGems(g, o.gems);
  if (o.kind === "cosmetic") g.cosmetics.push(o.key);
  else if (o.kind === "hero") g.roster.push(o.hero);
  else g.inventory.push(o.item);
  g.gemShopPurchases.push(o.id);
  list.splice(list.indexOf(o), 1);
  return o;
}
export function trialInfo(g, choice) {
  const m = calendarMonth(g.lastClock),
    kind = choice.challengeId || "daily",
    difficulty = g.worldDifficulty || "normal",
    scale = DIFFICULTIES[difficulty]?.reward;
  if (!scale) return null;
  let out;
  if (kind === "daily") {
    if (choice.day && choice.day !== m.today) return null;
    const d = calendarDay(g.lastClock, m.today);
    out = {
      ...d,
      mode: "trial",
      challengeId: "daily",
      encounters: 1,
      level: Math.max(3, d.level),
      unlocked: true,
      victoryGold: d.bonus,
      victoryGems: d.special === "gem" ? 3 : 0,
    };
  } else if (kind === "night-watch") {
    out = {
      mode: "trial",
      challengeId: kind,
      name: "The Night Watch",
      location: "greenway",
      period: periodKey("daily", g.lastClock),
      encounters: 1,
      level: Math.max(
        5,
        Math.round(g.roster.reduce((n, h) => n + h.level, 0) / g.roster.length),
      ),
      unlocked: true,
      victoryGold: 35,
      victoryGems: 0,
    };
  } else if (kind === "boss") {
    const loc = choice.bossLocation;
    if (!g.regionBossClears[loc]) return null;
    const n = REGIONS[loc].nodes.find((n) => n.kind === "boss");
    out = {
      mode: "trial",
      challengeId: "boss",
      bossLocation: loc,
      name: REGION_CHAMPIONS[loc].boss + " · Champion rematch",
      location: loc,
      period: periodKey("weekly", g.lastClock),
      encounters: 1,
      level: n.level,
      destinationBoss: true,
      target: REGIONS[loc].exit,
      unlocked: true,
      victoryGold: 140 + n.level * 4,
      victoryGems: 4,
    };
  } else if (["weekly", "monthly"].includes(kind)) {
    const weekly = kind === "weekly";
    out = {
      mode: "trial",
      challengeId: kind,
      name: weekly
        ? m.name + " · Weekly champion"
        : m.name + " · Monthly champion",
      location: m.location,
      period: periodKey(kind, g.lastClock),
      encounters: 1,
      level: weekly ? 16 : 30,
      unlocked: true,
      victoryGold: weekly ? 120 : 250,
      victoryGems: weekly ? 3 : 9,
    };
  } else return null;
  return {
    ...out,
    baseVictoryGold: out.victoryGold,
    baseVictoryGems: out.victoryGems,
    difficulty,
    reward: scale,
    victoryGold: Math.round(out.victoryGold * scale),
    victoryGems: Math.round(out.victoryGems * scale),
  };
}
export const trialClaimKey = (r) =>
  r.challengeId === "daily"
    ? r.month + ":" + r.day
    : r.challengeId +
      ":" +
      (r.bossLocation ? r.bossLocation + ":" : "") +
      r.period;
function awardTrial(g, r) {
  const key = trialClaimKey(r),
    previous = g.challengeTiers[key] || 0,
    scale = r.reward;
  if (scale > previous) {
    bank(
      g,
      r,
      Math.max(0, r.victoryGold - Math.round(r.baseVictoryGold * previous)),
      Math.max(0, r.victoryGems - Math.round(r.baseVictoryGems * previous)),
    );
    g.challengeTiers[key] = scale;
  }
  if (r.challengeId === "daily") {
    if (!g.calendarClaims[key]) {
      g.calendarClaims[key] = true;
      if (r.special === "food") {
        g.food += 3;
        r.earned.food = (r.earned.food || 0) + 3;
      } else if (r.special === "supplies") {
        g.consumables.luck = (g.consumables.luck || 0) + 1;
        r.earned.consumables = (r.earned.consumables || 0) + 1;
      }
    }
    const month = calendarMonth(Date.parse(r.month + "-01T00:00:00Z")),
      count = Object.keys(g.calendarClaims).filter((k) =>
        k.startsWith(r.month + ":"),
      ).length;
    for (const b of CALENDAR_BONUSES) {
      const n = b.days === "all" ? month.days : b.days,
        receipt = r.month + ":" + n;
      if (count >= n && !g.calendarBonuses[receipt]) {
        g.calendarBonuses[receipt] = true;
        bank(g, r, b.gold, b.gems || 0);
        g.food += b.food || 0;
        if (b.pet) g.companions.push(makePet(b.pet, 40));
        if (b.cosmetic && !g.cosmetics.includes(b.cosmetic))
          g.cosmetics.push(b.cosmetic);
      }
    }
  } else {
    g.challengeWins[key] = true;
    if (r.challengeId === "monthly" && !g.cosmetics.includes("starlit"))
      g.cosmetics.push("starlit");
  }
  r.completion =
    scale > previous
      ? "VICTORY · Challenge rewards collected."
      : "VICTORY · This difficulty’s reward was already collected. XP kept.";
}
export function stageTrial(g, choice) {
  if (g.screen !== "challenges") return false;
  const config = trialInfo(g, choice);
  if (!config?.unlocked) return false;
  g.destination = config;
  g.staging = g.staging.filter((id) =>
    g.roster.some((h) => h.id === id && available(g, h)),
  );
  if (!g.staging.length)
    g.staging = g.roster
      .filter((h) => available(g, h))
      .slice(0, 3)
      .map((h) => h.id);
  return true;
}
export function analyze(g, id) {
  if (
    !["market", "camp"].includes(g.screen) ||
    (g.screen === "camp" && !g.buildings.alchemist) ||
    g.gold < 25
  )
    return false;
  const s = g.scrolls.find((s) => s.id === id && !s.analyzed),
    i = g.inventory.find((i) => i.id === id && i.unidentified);
  if (!s && !i) return false;
  g.gold -= 25;
  if (s) {
    s.analyzed = true;
    if (!g.recipes.includes(s.race)) g.recipes.push(s.race);
  } else i.unidentified = false;
  return true;
}
export function forge(g, kind, key) {
  if (
    !["market", "camp"].includes(g.screen) ||
    !["item", "pet"].includes(kind) ||
    (kind === "item" && ITEMS[key]?.weaponKind)
  )
    return false;
  const def = kind === "pet" ? PETS[key] : ITEMS[key];
  if (
    !def ||
    def.eggOnly ||
    def.fossilOnly ||
    def.mythicalOnly ||
    def.guildOnly ||
    g.gold < Math.round(def.price * 1.8) ||
    g.gems < 1
  )
    return false;
  g.gold -= Math.round(def.price * 1.8);
  Camp.spendGems(g, 1);
  const made = kind === "pet" ? makePet(key, 1) : makeItem(key, 1);
  (kind === "pet" ? g.companions : g.inventory).push(made);
  return made;
}
export function applyCosmetic(g, h, key, objectId = null) {
  if (!marketManage(g, h) || (key !== "none" && !g.cosmetics.includes(key)))
    return false;
  const d = COSMETICS[key];
  if (objectId) {
    const i = [...allGear(h), h.companion]
      .filter(Boolean)
      .find((i) => i.id === objectId);
    if (!i) return false;
    if (key === "none") {
      i.cosmetic = null;
      return true;
    }
    if (
      (d?.type === "pet" && i === h.companion) ||
      (d?.type === "weapon" && d.kinds.includes(ITEMS[i.key]?.weaponKind))
    ) {
      i.cosmetic = key;
      return true;
    }
    return false;
  }
  if (d?.type === "weapon" || d?.type === "pet") return false;
  h.cosmetic = key === "none" ? null : key;
  return true;
}
export function notify(g, text) {
  g.notifications.unshift({ id: uid("notice"), text, at: g.lastClock });
  g.notifications = g.notifications.slice(0, 10);
}
export function recruitConverted(g, r, captured) {
  if (
    r.mode === "arena" ||
    r.status !== "active" ||
    r.recruits.length >= 2 ||
    g.roster.length +
      activeExpeditions(g).reduce((n, e) => n + e.recruits.length, 0) >=
      Camp.campCapacity(g) ||
    r.recruits.some((h) => h.id === captured.id) ||
    captured.uncharmable ||
    captured.boss
  )
    return false;
  const h = structuredClone(captured);
  h.favorite = false;
  h.bonds = {};
  h.journal = [];
  h.currentHp = Math.max(1, h.currentHp ?? stats(h).hp);
  r.recruits.push(h);
  r.captures.push(h.id);
  r.waveDefeated.push(h.id);
  return h;
}
function bank(g, r, gold = 0, gems = 0) {
  g.gold += gold;
  Camp.addGems(g, gems);
  r.earned.gold += gold;
  r.earned.gems += gems;
}
export function rollItemRarity(random, stage) {
  const n = random();
  return n > 0.975 ? 3 : n > 0.89 ? 2 : n > 0.63 ? 1 : 0;
}
export function recordDefeat(g, r, foe) {
  if (
    r.status !== "active" ||
    r.phase !== "battle" ||
    r.waveDefeated.includes(foe.id)
  )
    return false;
  r.waveDefeated.push(foe.id);
  r.earned.kills++;
  if (["trial", "arena"].includes(r.mode)) return true;
  if (r.earned.kills % 2 === 0) Camp.materialDrop(g, r);
  const luck = r.supplies?.includes("luck");
  if (
    foe.boss ||
    seeded(r.seed + r.stage * 97 + r.earned.kills)() < 0.045 * (luck ? 2 : 1)
  ) {
    const average =
        party(g, r).reduce((sum, h) => sum + h.level, 0) /
        Math.max(1, party(g, r).length),
      size = Math.min(
        3,
        Math.floor(
          Math.max((r.level || 1) + r.stage * 0.6, average * 0.85) / 18,
        ),
      ),
      gem = makeGem(
        ["ruby", "sapphire", "emerald"][(r.stage + r.earned.kills) % 3],
        size,
      );
    g.gemstones.push(gem);
    g.gems = Camp.gemsTotal(g);
    r.earned.gems += gemValue(gem);
  }
  bank(g, r, Math.round((3 + Math.floor((r.level || 1) / 5)) * r.reward));
  if (r.earned.kills % 8 === 0) {
    const random = seeded(r.seed + r.stage * 1997 + r.earned.kills),
      keys = Object.keys(ITEMS).filter(
        (k) => !ITEMS[k].mythicalOnly && !ITEMS[k].guildOnly,
      );
    const key = keys[Math.floor(random() * keys.length)],
      level = Math.max(
        1,
        Math.min(
          100,
          Math.round(
            ((r.level || 1) + r.stage * 0.6) * (0.5 + random() * 0.5) +
              (luck ? 3 : 0),
          ),
        ),
      );
    g.inventory.push(makeItem(key, level, rarity(level)));
    r.earned.items++;
  }
  return true;
}
export function checkpointBattle(g, r, b) {
  if (r.status !== "active" || r.phase !== "battle") return false;
  for (const u of b.units.filter(
    (u) =>
      !u.summon &&
      !u.structure &&
      !u.pet &&
      (u.originTeam === 0 || u.converted),
  )) {
    const h = party(g, r).find((h) => h.id === u.hero.id);
    if (h) {
      for (const k of [
        "level",
        "xp",
        "items",
        "armor",
        "light",
        "totalXp",
        "talents",
        "skills",
        "attributes",
        "companion",
        "journal",
      ])
        h[k] = structuredClone(u.hero[k]);
      h.currentHp = u.hp;
    }
  }
  return true;
}
function milestone(g, r) {
  if (r.mode === "island") {
    r.completion =
      "The Bell Beneath cleared · all 25 floors. The island treasure is awarded once per Camp.";
    return;
  }
  if (r.mode === "trial") {
    awardTrial(g, r);
    return;
  }
  if (r.mode === "journey") {
    const first = !g.journeyClears[r.location + ":" + r.target];
    revealJourney(g, r);
    bank(g, r, Math.round((first ? 40 : 12) * r.reward));
    const reward = r.milestone;
    if (first && PETS[reward]) {
      g.companions.push(makePet(reward, reward === "fox" ? 1 : 40));
      r.earned.companions = (r.earned.companions || 0) + 1;
    } else if (first && ITEMS[reward]) {
      g.inventory.push(makeItem(reward, 40));
      r.earned.items++;
    } else if (first && RACES[reward]) {
      const h = generateHero({
        race: reward,
        classId: reward === "Ent" ? "guardian" : "engineer",
        level: 5,
      });
      if (welcomeHero(g, h))
        r.earned.characters = (r.earned.characters || 0) + 1;
    } else if (first && COSMETICS[reward] && !g.cosmetics.includes(reward))
      g.cosmetics.push(reward);
    if (reward === "eggs") {
      g.eggs += first ? 2 : 1;
      r.earned.eggs = (r.earned.eggs || 0) + (first ? 2 : 1);
    }
    if (
      [
        "wood",
        "stone",
        "ore",
        "herbs",
        "obsidian",
        "relic",
        "fossils",
      ].includes(reward)
    ) {
      const amount = first ? 16 : 8;
      g.materials[reward] = (g.materials[reward] || 0) + amount;
      r.earned.materials ||= {};
      r.earned.materials[reward] = (r.earned.materials[reward] || 0) + amount;
    }
    if (reward === "dragon") {
      g.materials.obsidian = (g.materials.obsidian || 0) + 10;
      r.earned.materials.obsidian = (r.earned.materials.obsidian || 0) + 10;
      g.inventory.push(stockedItem("salamander", 40));
      r.earned.items++;
    }
    r.completion = "Destination reached. Roads discovered and rewards kept.";
    return;
  }

  if (["calendar", "trial"].includes(r.mode)) {
    const key = r.month + ":" + r.day;
    if (!g.calendarClaims[key]) {
      g.calendarClaims[key] = true;
      bank(g, r, r.bonus);
      if (r.special === "food") {
        g.food += 3;
        r.earned.food = (r.earned.food || 0) + 3;
      } else if (r.special === "gem") bank(g, r, 0, 3);
      else {
        g.consumables.luck = (g.consumables.luck || 0) + 1;
        r.earned.consumables = (r.earned.consumables || 0) + 1;
      }
      const m = calendarMonth(Date.parse(r.month + "-01T00:00:00Z")),
        count = Object.keys(g.calendarClaims).filter((k) =>
          k.startsWith(r.month + ":"),
        ).length;
      for (const b of CALENDAR_BONUSES) {
        const threshold = b.days === "all" ? m.days : b.days,
          claim = r.month + ":" + threshold;
        if (count >= threshold && !g.calendarBonuses[claim]) {
          g.calendarBonuses[claim] = true;
          bank(g, r, b.gold, b.gems || 0);
          g.food += b.food || 0;
          r.earned.food = (r.earned.food || 0) + (b.food || 0);
          if (b.pet) {
            g.companions.push(makePet(b.pet, 40));
            r.earned.companions = (r.earned.companions || 0) + 1;
          }
          if (b.cosmetic && !g.cosmetics.includes(b.cosmetic))
            g.cosmetics.push(b.cosmetic);
        }
      }
      r.completion =
        "Day " + r.day + " complete. Challenge reward safely collected.";
    } else r.completion = "Daily challenge revisited. Encounter loot kept.";
    return;
  }
  if (r.branch) {
    const key = r.location + ":" + r.branch;
    if (!g.branchClears[key]) {
      g.branchClears[key] = true;
      bank(g, r, 60);
      if (PETS[r.milestone]) {
        g.companions.push(makePet(r.milestone, 40));
        r.earned.companions = (r.earned.companions || 0) + 1;
      } else if (ITEMS[r.milestone]) {
        g.inventory.push(makeItem(r.milestone, 40));
        r.earned.items++;
      } else if (RACES[r.milestone]) {
        const h = generateHero({
          race: r.milestone,
          classId: r.milestone === "Ent" ? "guardian" : "engineer",
          level: 5,
        });
        if (welcomeHero(g, h))
          r.earned.characters = (r.earned.characters || 0) + 1;
      }
      r.completion = "Optional path cleared. Its special reward joined Camp.";
    } else {
      bank(g, r, 15);
      r.completion = "Optional path revisited. Encounter loot kept.";
    }
    return;
  }
  if (r.mode === "arena") {
    g.arenaWins++;
    bank(g, r, Math.round(170 * r.reward));
    if (!g.cosmetics.includes("golden")) g.cosmetics.push("golden");
    r.completion =
      "Arena victory · 170 base gold and Champion’s gold unlocked.";
    return;
  }
  if (r.mode === "event") {
    const key = r.event + ":" + r.period;
    if (!g.eventClaims[key]) {
      g.eventClaims[key] = true;
      bank(g, r, Math.round(EVENTS[r.event].reward * r.reward));
      if (r.event === "weekly") g.scrolls.push(makeScroll("Automaton"));
      if (r.event === "monthly") {
        if (!g.cosmetics.includes("dusk")) g.cosmetics.push("dusk");
        g.scrolls.push(makeScroll("Ent"));
      }
      r.completion =
        "First " + r.event + " completion this period. Bonus rewards claimed.";
    } else r.completion = "Event replay completed. Encounter rewards kept.";
    return;
  }
  const first = r.node === g.campaign[r.location];
  bank(g, r, Math.round((first ? 35 : 10) * r.reward));
  if (!first) {
    r.completion = "Route revisited. Encounter rewards kept.";
    return;
  }
  g.campaign[r.location]++;
  const reward = r.milestone;
  if (reward === "gold") bank(g, r, 45);
  else if (reward === "pet") {
    g.companions.push(makePet("fox"));
    r.earned.companions = (r.earned.companions || 0) + 1;
  } else if (reward.startsWith("scroll:")) {
    g.scrolls.push(makeScroll(reward.slice(7)));
    r.earned.scrolls = (r.earned.scrolls || 0) + 1;
  } else if (COSMETICS[reward] && !g.cosmetics.includes(reward))
    g.cosmetics.push(reward);
  r.completion =
    "New ground reached: " + r.name + ". Milestone reward claimed.";
  notify(g, r.completion);
}
export function endExpedition(g, r, reason = "recall", now = g.lastClock) {
  if (r.status !== "active") return false;
  r.status = "returned";
  r.reason = reason;
  r.endedAt = now;
  r.phase = "returned";
  r.pendingSeconds = 0;
  r.battleState = null;
  if (r.mode === "arena") Ever.settleWager(g, r);
  else if (reason === "complete") milestone(g, r);
  for (const h of g.roster.filter((h) => r.party.includes(h.id))) {
    if (reason === "defeat")
      h.currentHp = Math.max(1, Math.round(stats(h).hp * 0.2));
    if (h.pendingMealXp) {
      gainXp(h, h.pendingMealXp);
      h.pendingMealXp = 0;
    }
    Camp.beginRecovery(g, h, now, reason === "defeat");
  }
  r.recruited = 0;
  if (reason === "complete")
    for (const h of r.recruits) {
      h.boss = false;
      h.currentHp = stats(h).hp;
      h.recoveryUntil = 0;
      if (!g.roster.some((a) => a.id === h.id) && welcomeHero(g, h))
        r.recruited++;
    }
  r.recruits = [];
  r.temporaryParty = [];
  notify(
    g,
    r.name +
      " returned. " +
      r.earned.gold +
      " gold kept" +
      (r.recruited ? " · " + r.recruited + " new characters joined." : "."),
  );
  return r;
}
export function resolveBattle(g, r, result, now = g.lastClock) {
  if (r.status !== "active" || r.phase !== "battle") return false;
  for (const record of result.heroes || []) {
    const h = party(g, r).find((h) => h.id === record.id);
    if (h) {
      for (const k of [
        "level",
        "xp",
        "items",
        "armor",
        "light",
        "totalXp",
        "talents",
        "skills",
        "attributes",
        "companion",
      ])
        if (record[k] !== undefined) h[k] = structuredClone(record[k]);
      h.currentHp = Math.max(0, Math.min(stats(h).hp, record.hp));
      h.battles++;
    }
  }
  for (const captured of result.converted || []) {
    const h =
      r.recruits.find((h) => h.id === captured.id) ||
      recruitConverted(g, r, captured);
    if (h) {
      Object.assign(h, structuredClone(captured));
      h.currentHp = captured.currentHp;
    }
  }
  const survived = result.winner === 0;
  r.lastResult = { won: survived, stage: r.stage, time: result.time };
  r.history.push({ stage: r.stage, survived, time: result.time });
  if (!survived) {
    endExpedition(g, r, "defeat", now);
    return { survived: false };
  }
  const gold = ["trial", "arena"].includes(r.mode)
      ? 0
      : Math.round((6 + r.stage * 2) * r.reward),
    xp = 18 + r.stage * 3;
  bank(g, r, gold);
  let revived = 0;
  for (const h of party(g, r)) {
    const dead = h.currentHp <= 0;
    gainXp(h, xp);
    if (dead) {
      revived++;
      if (h.currentHp <= 0)
        h.currentHp = Math.max(1, Math.round(stats(h).hp * 0.2));
    }
  }
  if (r.mode !== "arena") Camp.gatherAfterBattle(g, r, party(g, r));
  Ever.awardCampXp(g, 12 * r.reward, "victories");
  if (r.mode === "island") {
    g.islandFloor = Math.max(g.islandFloor || 0, r.stage + 1);
    if (r.stage === 24 && !g.questClaims.includes("island-treasure")) {
      g.questClaims.push("island-treasure");
      const w = CLASSES[party(g, r)[0].classId].armorWeight;
      g.inventory.push({ ...makeItem(w + "-night-boots", 60), mythical: true });
      Camp.addGems(g, 9);
    }
  }
  if (r.supplies?.includes("ration"))
    for (const h of party(g, r))
      h.currentHp = Math.min(stats(h).hp, h.currentHp + stats(h).hp * 0.12);
  const before = expeditionSlots(g);
  g.lifetimeEncounters++;
  g.bestEncounter = Math.max(g.bestEncounter, r.stage + 1);
  if (expeditionSlots(g) > before)
    notify(g, "Another expedition slot unlocked.");
  r.lastAward = { gold, xp, revived };
  if (r.stage + 1 >= r.encounters) {
    endExpedition(g, r, "complete", now);
    return { survived: true, complete: true };
  }
  if (r.mode === "journey" && !r.roadItinerary[r.stage]?.rest) {
    r.phase = "interlude";
    r.phaseSeconds = 5;
    r.stop = {
      type: "road",
      name: "The road ahead",
      done: true,
      message: "The company is ready for the next encounter.",
    };
    return { survived: true, gold, xp, revived };
  }
  if (r.mode === "journey") {
    const seen = new Set(g.exploration[r.location]);
    seen.add(r.roadItinerary[r.stage].to);
    g.exploration[r.location] = [...seen];
  }
  r.phase = "interlude";
  r.phaseSeconds = 12;
  const special =
    r.stage === 1 && (r.branch || r.mode === "event" || r.mode === "calendar");
  r.stop = {
    type:
      r.mode === "journey"
        ? r.roadItinerary[r.stage].rest
        : special
          ? "special"
          : ["chest", "fountain", "cache"][r.stage % 3],
    done: false,
  };
  r.stop.name = LOCATIONS[r.location].events[r.stop.type];
  return { survived: true, gold, xp, revived };
}
export function useStop(g, r) {
  if (r.status !== "active" || r.phase !== "interlude" || r.stop.done)
    return false;
  const s = r.stop,
    random = seeded(r.seed + r.stage * 1337);
  if (s.type === "fountain") {
    for (const h of party(g, r))
      h.currentHp = Math.min(stats(h).hp, h.currentHp + stats(h).hp * 0.4);
    s.message = "The spring restores 40% health.";
  } else if (s.type === "chest") {
    const keys = Object.keys(ITEMS).filter(
      (k) => !ITEMS[k].mythicalOnly && !ITEMS[k].guildOnly,
    );
    s.loot = makeItem(
      keys[Math.floor(random() * keys.length)],
      1,
      rollItemRarity(
        () =>
          Math.min(
            0.9999,
            random() + (r.supplies?.includes("luck") ? 0.13 : 0),
          ),
        r.stage,
      ),
    );
    g.inventory.push(s.loot);
    r.earned.items++;
    bank(g, r, Math.round(8 * r.reward));
    s.message = "Equipment and gold sent safely to Camp.";
  } else if (s.type === "special") {
    const race = {
      greenway: "Ent",
      marsh: "Automaton",
      cinder: "Human",
      volcano: "Drakeling",
      jungle: "Drakeling",
    }[r.location];
    g.scrolls.push(makeScroll(race));
    r.earned.scrolls = (r.earned.scrolls || 0) + 1;
    for (const h of party(g, r))
      h.currentHp = Math.min(stats(h).hp, h.currentHp + stats(h).hp * 0.15);
    s.message =
      "A " + race + " creation scroll is recovered. Analyze it at the Market.";
  } else {
    bank(g, r, Math.round(10 * r.reward));
    for (const h of party(g, r))
      h.currentHp = Math.min(stats(h).hp, h.currentHp + stats(h).hp * 0.2);
    const key = ["Strong", "Swift", "Sturdy", "Strongwill"][
      Math.floor(random() * 4)
    ];
    g.essences[key] = (g.essences[key] || 0) + 1;
    r.earned.essences++;
    s.message = "A sheltered rest and an attribute capsule for Camp.";
  }
  if (r.mode === "journey" && r.supplies.includes("rope"))
    for (const h of party(g, r))
      h.currentHp = Math.min(stats(h).hp, h.currentHp + stats(h).hp * 0.08);
  s.done = true;
  return true;
}
export function nextEncounter(g, r) {
  if (r.status !== "active" || r.phase !== "interlude" || !r.stop.done)
    return false;
  r.stage++;
  if (r.mode === "event" && r.event === "monthly")
    r.location = ["cinder", "marsh", "greenway"][Math.floor(r.stage / 5) % 3];
  r.phase = "prepare";
  r.phaseSeconds = 4;
  r.stop = null;
  r.waveDefeated = [];
  r.battleState = null;
  return true;
}
// Preserve identity, belongings and active clocks while changing the progression vocabulary.
export function migrateSave(saved, now = Date.now()) {
  if (!saved || saved.season !== GAME_SEASON || saved.version !== 12)
    return null;
  const g = structuredClone(saved);
  const oldGems = g.gems;
  g.version = 12;
  g.campName ||= "";
  g.campNamed ||= false;
  g.buildings ||= {
    tent: 1,
    storage: 1,
    pantry: 1,
    training: 0,
    workbench: 0,
    outfitter: 0,
    kitchen: 0,
    alchemist: 0,
  };
  g.buildings.bonfire = 1;
  g.buildings.crossroads = 1;
  g.materials ||= { wood: 0, stone: 0, ore: 0, herbs: 0, meat: 0 };
  g.materials.obsidian ||= 0;
  g.materials.relic ||= 0;
  g.food ??= 6;
  g.eggs ||= 0;
  g.gemstones ||= [];
  if (saved.version === 5) Camp.addGems(g, oldGems);
  g.gems = Camp.gemsTotal(g);
  g.branchClears ||= {};
  g.calendarClaims ||= {};
  g.calendarBonuses ||= {};
  g.packed ||= [];
  g.challengeReceipts ||= [];
  g.challengeDeposits ||= {};
  g.questClaims ||= [];
  if (g.trackedQuest === undefined) g.trackedQuest = "first-road";
  g.journeyClears ||= {};
  g.exploration ||= { greenway: ["camp"] };
  g.regionUnlocks ||= ["greenway"];
  g.campaign ||= {};
  for (const loc of REGION_ORDER) {
    g.campaign[loc] ||= 0;
    if (saved.version < 7 && g.campaign[loc] > 0) {
      if (!g.regionUnlocks.includes(loc)) g.regionUnlocks.push(loc);
      g.exploration[loc] = REGIONS[loc].nodes
        .slice(0, Math.min(8, g.campaign[loc] + 1))
        .map((n) => n.id);
    }
  }
  if (saved.version < 7 && g.campaign.greenway > 0)
    g.journeyClears["greenway:clearing"] ||= 1;
  for (const [i, loc] of REGION_ORDER.entries())
    if (saved.version < 7 && g.campaign[loc] >= 5 && REGION_ORDER[i + 1]) {
      if (!g.regionUnlocks.includes(REGION_ORDER[i + 1]))
        g.regionUnlocks.push(REGION_ORDER[i + 1]);
    }
  if (g.consumables.tonic) {
    g.food += g.consumables.tonic * 3;
    delete g.consumables.tonic;
  }
  for (const key of Object.keys(CONSUMABLES)) g.consumables[key] ||= 0;
  for (const h of g.roster) {
    normalizeHero(h, g.inventory);
    migrateClassNodes(h);
    for (const i of allGear(h))
      if (ITEMS[i.key]?.weaponKind || ITEMS[i.key]?.type === "armor")
        normalizeWeapon(i);
    if (h.companion) {
      h.companion.sockets ||= [];
      normalizeWeapon(h.companion, "pet");
    }
    h.appearance.eyes ??= h.appearance.crest % 5;
    h.appearance.idle ??= h.appearance.hue;
  }
  g.recipes = g.recipes.filter((r) => RACES[r]);
  for (const scroll of g.scrolls)
    if (!RACES[scroll.race])
      scroll.race = scroll.race === "Zombie" ? "Automaton" : "Human";
  if (saved.version < 7) {
    g.market = {};
    g.destination = {
      mode: "journey",
      location: g.location || "greenway",
      target: REGIONS[g.location || "greenway"].first,
      routeIndex: 0,
      difficulty: g.destination?.difficulty || "normal",
    };
  }
  for (const r of g.expeditions) {
    r.auto ??= true;
    if (saved.version < 11 && r.phase === "prepare")
      r.phaseSeconds = Math.min(4, r.phaseSeconds);
    r.supplies ||= [];
    r.temporaryParty ||= [];
    r.earned.materials ||= {};
    for (const h of [...r.recruits, ...r.temporaryParty]) {
      normalizeHero(h, g.inventory);
      migrateClassNodes(h);
      if (h.companion) normalizeWeapon(h.companion, "pet");
      for (const i of allGear(h))
        if (ITEMS[i.key]?.weaponKind || ITEMS[i.key]?.type === "armor")
          normalizeWeapon(i);
    }
    if (r.battleState) {
      for (const u of r.battleState.units) {
        normalizeHero(u.hero, u.originTeam === 0 ? g.inventory : []);
        migrateClassNodes(u.hero);
        if (u.hero.companion) normalizeWeapon(u.hero.companion, "pet");
        for (const i of allGear(u.hero))
          if (ITEMS[i.key]?.weaponKind || ITEMS[i.key]?.type === "armor")
            normalizeWeapon(i);
        u.mana ??= stats(u.hero).maxMana;
        u.maxMana ??= stats(u.hero).maxMana;
      }
    }
  }
  for (const p of g.companions) normalizeWeapon(p, "pet");
  g.inventory = g.inventory.filter(
    (item, index, list) => list.findIndex((v) => v.id === item.id) === index,
  );
  g.waitingRecruits ||= [];
  g.challengeTiers ||= {};
  g.materials.fossils ||= 0;
  g.regionBossClears ||= {};
  for (const [index, loc] of REGION_ORDER.entries())
    if (
      g.journeyClears[loc + ":" + REGIONS[loc].exit] ||
      g.regionUnlocks.includes(REGION_ORDER[index + 1])
    )
      g.regionBossClears[loc] = true;
  g.portalUnlocked = !!g.regionBossClears.greenway;
  g.marketParty ||= [];
  g.mapPositions ||= { camp: {}, market: {} };
  g.mapPositions.camp ||= {};
  g.mapPositions.market ||= {};
  g.lockedJourney ||= null;
  if (
    g.destination.mode === "journey" &&
    !difficultyAllowed(g, g.destination.location, g.destination.difficulty)
  )
    g.destination.difficulty = "normal";
  if (g.screen === "party" && !g.lockedJourney) g.screen = "crossroads";
  g.campExpansions ||= [];
  g.campZone ||= "center";
  g.gemShopPurchases ||= [];
  g.challengeWins ||= {};
  g.marketEpoch = Math.floor(g.lastClock / STOCK_PERIOD);
  if (saved.version < 10) {
    g.market = {};
    g.gemShop = null;
    for (const i of g.inventory)
      if (ITEMS[i.key]?.weaponKind || ITEMS[i.key]?.type === "armor")
        normalizeWeapon(i);
  }
  if (g.screen === "calendar") {
    g.screen = "challenges";
    g.destination = {
      mode: "trial",
      challengeId: "daily",
      day: calendarMonth(g.lastClock).today,
      difficulty: "normal",
    };
  }
  if (
    g.destination.mode === "journey" &&
    !REGIONS[g.destination.location]?.nodes.some(
      (n) => n.id === g.destination.target,
    )
  )
    g.destination.target = REGIONS[g.destination.location]?.first || "clearing";
  Night.normalizeNightfall(g);
  Ever.normalizeEvernight(g);
  return validateSave(g);
}
export function claimQuest(g, id) {
  const q = questById(g, id),
    state = q && questState(g, q);
  if (
    !["camp", "market", "quests"].includes(g.screen) ||
    !state?.unlocked ||
    state.claimed ||
    !state.complete
  )
    return false;
  g.questClaims.push(id);
  Ever.awardCampXp(g, q.category === "Main" ? 100 : 50, "quests");
  if (q.guild) g.guildStanding[q.guild] = (g.guildStanding[q.guild] || 0) + 20;
  for (const [key, value] of Object.entries(q.reward))
    if (key === "gold") g.gold += value;
    else if (key === "food") g.food += value;
    else if (key === "gemValue") Camp.addGems(g, value);
    else g.materials[key] = (g.materials[key] || 0) + value;
  return true;
}
export { trackQuest };

export function validateSave(g) {
  if (g && !validLearning(g.learning)) return null;
  if (
    !g ||
    g.version !== 12 ||
    g.season !== GAME_SEASON ||
    ![
      "camp",
      "crossroads",
      "party",
      "market",
      "expeditions",
      "expedition",
      "tavern",
      "arena",
      "quests",
      "codex",
      "calendar",
      "challenges",
      "shop",
    ].includes(g.screen) ||
    !Number.isFinite(g.gold) ||
    g.gold < 0 ||
    !Number.isFinite(g.gems) ||
    g.gems < 0 ||
    !Array.isArray(g.roster) ||
    !Array.isArray(g.inventory) ||
    !Array.isArray(g.expeditions) ||
    !Array.isArray(g.companions) ||
    !Array.isArray(g.scrolls) ||
    !g.campaign ||
    !g.destination ||
    !g.eventClaims ||
    !g.consumables ||
    !g.essences ||
    !Array.isArray(g.cosmetics) ||
    !Array.isArray(g.recipes) ||
    !Array.isArray(g.staging) ||
    !Array.isArray(g.notifications) ||
    !g.market ||
    !Number.isFinite(g.lastClock) ||
    !Number.isInteger(g.lifetimeEncounters) ||
    g.lifetimeEncounters < 0
  )
    return null;
  if (
    !Array.isArray(g.campExpansions) ||
    g.campExpansions.some((k) => !Camp.CAMP_EXPANSIONS[k]) ||
    !g.challengeWins ||
    !Array.isArray(g.gemShopPurchases)
  )
    return null;
  if (
    !g.regionBossClears ||
    typeof g.portalUnlocked !== "boolean" ||
    !Array.isArray(g.marketParty) ||
    !g.mapPositions?.camp ||
    !g.mapPositions?.market ||
    !g.exploration ||
    !Array.isArray(g.regionUnlocks) ||
    !g.journeyClears ||
    !Array.isArray(g.questClaims) ||
    !g.buildings ||
    !g.materials ||
    !Array.isArray(g.gemstones) ||
    !g.calendarClaims ||
    !g.calendarBonuses ||
    !g.branchClears ||
    !Array.isArray(g.packed) ||
    !Array.isArray(g.challengeReceipts) ||
    !g.challengeDeposits ||
    !Number.isFinite(g.food) ||
    g.food < 0 ||
    g.gemstones.some(
      (v) =>
        !["ruby", "sapphire", "emerald"].includes(v.kind) ||
        !Number.isInteger(v.size) ||
        v.size < 0 ||
        v.size > 3,
    ) ||
    Camp.gemsTotal(g) !== g.gems
  )
    return null;
  if (
    (g.worldDifficulty !== undefined &&
      !["normal", "hard", "nightmare"].includes(g.worldDifficulty)) ||
    (g.campXp !== undefined && (!Number.isFinite(g.campXp) || g.campXp < 0)) ||
    (g.mealAt !== undefined && !Number.isFinite(g.mealAt)) ||
    (g.storyPage !== undefined &&
      (!Number.isInteger(g.storyPage) || g.storyPage < 0 || g.storyPage > 3)) ||
    (g.tutorialStep !== undefined &&
      (!Number.isInteger(g.tutorialStep) ||
        g.tutorialStep < 0 ||
        g.tutorialStep > 5)) ||
    (g.questPins !== undefined &&
      (!Array.isArray(g.questPins) ||
        g.questPins.some((id) => typeof id !== "string"))) ||
    (g.guildStanding !== undefined &&
      (!g.guildStanding ||
        Object.values(g.guildStanding).some(
          (n) => !Number.isFinite(n) || n < 0,
        ))) ||
    (g.materials.bossSigils !== undefined &&
      (!Number.isInteger(g.materials.bossSigils) ||
        g.materials.bossSigils < 0)) ||
    (g.arenaWager !== undefined &&
      (!g.arenaWager ||
        !Number.isInteger(g.arenaWager.gold) ||
        g.arenaWager.gold < 10 ||
        g.arenaWager.gold > 1000 ||
        !Number.isInteger(g.arenaWager.amount) ||
        g.arenaWager.amount < 0 ||
        g.arenaWager.amount > 100 ||
        (g.arenaWager.resource &&
          !["wood", "stone", "ore", "herbs", "meat", "hide"].includes(
            g.arenaWager.resource,
          ))))
  )
    return null;
  const progression = (a) =>
    a &&
    Number.isInteger(a.level) &&
    a.level >= 1 &&
    a.level <= 100 &&
    Number.isFinite(a.xp) &&
    a.xp >= 0 &&
    Number.isInteger(a.rarityTier) &&
    a.rarityTier >= 0 &&
    a.rarityTier <= 4;
  const item = (i) =>
    progression(i) &&
    validModifiers(
      { ...i, armorWeight: ITEMS[i.key]?.weight },
      ITEMS[i.key]?.type === "armor" ? "armor" : "weapon",
    ) &&
    ITEMS[i.key] &&
    typeof i.id === "string" &&
    Number.isInteger(i.rank) &&
    i.rank >= 0 &&
    i.rank <= 5;
  const pet = (i) =>
    progression(i) &&
    validModifiers(i, "pet") &&
    PETS[i.key] &&
    typeof i.id === "string";
  const hero = (h) =>
    h &&
    typeof h.id === "string" &&
    typeof h.name === "string" &&
    RACES[h.race] &&
    CLASSES[h.classId] &&
    progression(h) &&
    Array.isArray(h.items) &&
    h.items.length <= 8 &&
    Array.isArray(h.armor) &&
    h.armor.length <= 4 &&
    h.armor.filter(Boolean).every(item) &&
    (!h.light || (ITEMS[h.light.key]?.type === "light" && item(h.light))) &&
    Array.isArray(h.talents) &&
    h.talents.every(progression) &&
    Array.isArray(h.classNodes) &&
    validClassNodes(h) &&
    h.items.filter(Boolean).every(item) &&
    Array.isArray(h.extraSlots) &&
    h.extraSlots.length +
      CLASSES[h.classId].slots.length +
      [...h.talents, ...h.attributes].filter(
        (t, i, a) =>
          TALENTS[t.key]?.slot && a.findIndex((v) => v.key === t.key) === i,
      ).length <=
      8 &&
    h.skills &&
    Object.values(h.skills).every(progression) &&
    Array.isArray(h.attributes) &&
    h.attributes.every((a) => progression(a) && typeof a.key === "string") &&
    Array.isArray(h.fusion) &&
    h.fusion.every((f) => CLASSES[f.classId]) &&
    abilities(h).length <= 10 &&
    Array.isArray(h.journal) &&
    Array.isArray(h.transformations) &&
    h.bonds &&
    h.bonus &&
    h.appearance &&
    (!h.companion || pet(h.companion));
  if (
    g.roster.length > Camp.campCapacity(g) ||
    !Array.isArray(g.waitingRecruits) ||
    !g.waitingRecruits.every(hero) ||
    !g.challengeTiers ||
    !g.roster.every(hero) ||
    !g.inventory.every(item) ||
    !g.companions.every(pet) ||
    new Set(g.roster.map((h) => h.id)).size !== g.roster.length
  )
    return null;
  const reserved = new Set();
  for (const r of g.expeditions) {
    if (
      !r ||
      !LOCATIONS[r.location] ||
      !DIFFICULTIES[r.difficulty] ||
      !["active", "returned"].includes(r.status) ||
      !["prepare", "battle", "interlude", "returned"].includes(r.phase) ||
      typeof r.auto !== "boolean" ||
      !Number.isInteger(r.stage) ||
      !Number.isInteger(r.encounters) ||
      r.encounters < 1 ||
      !Array.isArray(r.party) ||
      !Array.isArray(r.recruits) ||
      !r.recruits.every(hero) ||
      !Number.isFinite(r.pendingSeconds) ||
      r.pendingSeconds < 0 ||
      !Number.isFinite(r.elapsedSeconds) ||
      !Array.isArray(r.history) ||
      !Array.isArray(r.waveDefeated) ||
      !r.earned
    )
      return null;
    if (r.status === "active")
      for (const id of r.party) {
        if (reserved.has(id) || !g.roster.some((h) => h.id === id)) return null;
        reserved.add(id);
      }
    if (r.phase === "battle" && !r.battleState) return null;
  }
  if (
    g.screen === "expedition" &&
    !g.expeditions.some((r) => r.id === g.selectedExpedition)
  )
    g.screen = "expeditions";
  return g;
}

function welcomeHero(g, h) {
  if (g.roster.length >= Camp.campCapacity(g)) {
    notify(g, "Camp is full. " + h.name + " continued down the road.");
    return false;
  }
  g.roster.push(h);
  return h;
}
export function claimArrival() {
  return false;
}
