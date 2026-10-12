import {
  ITEMS,
  COSMETICS,
  gainXp,
  makeItem,
  makeFacet,
  allGear,
  stats,
  migrateClassNodes,
} from "./data.js?v=16";
import { spendGems } from "./camp.js?v=16";
export const MEAL_PERIOD = 43200000;
export const CAMP_XP_TEXT =
  "Character XP contributes 25%; equipment and companion XP contributes 10%. Victories, quests, construction and expansions also grow your Camp. Camps have levels, never rarities.";
export function campProgress(g) {
  let level = 1,
    xp = Math.floor(g.campXp || 0),
    needed = 100;
  while (level < 100 && xp >= needed) {
    xp -= needed;
    level++;
    needed = 100 + 60 * (level - 1);
  }
  return {
    level,
    xp: level === 100 ? 0 : xp,
    needed,
    total: Math.floor(g.campXp || 0),
  };
}
export function awardCampXp(g, n, source = "progress") {
  if (!Number.isFinite(n) || n <= 0) return;
  g.campXp = (g.campXp || 0) + n;
  g.campXpSources ||= {};
  g.campXpSources[source] = (g.campXpSources[source] || 0) + n;
}
export function collectCampXp(g) {
  g.campXpLedger ||= {};
  const records = g.roster.flatMap((h) => [
    { id: "hero:" + h.id, total: h.totalXp || 0, scale: 0.25 },
    ...[...allGear(h), h.companion]
      .filter(Boolean)
      .map((i) => ({ id: "gear:" + i.id, total: i.totalXp || 0, scale: 0.1 })),
  ]);
  records.push(
    ...[...g.inventory, ...g.companions].map((i) => ({
      id: "gear:" + i.id,
      total: i.totalXp || 0,
      scale: 0.1,
    })),
  );
  for (const r of records) {
    const p = g.campXpLedger[r.id] || 0;
    if (r.total > p) {
      awardCampXp(
        g,
        (r.total - p) * r.scale,
        r.id.startsWith("hero:") ? "characters" : "equipment",
      );
      g.campXpLedger[r.id] = r.total;
    }
  }
}
export function normalizeEvernight(g) {
  g.campXp ??= 0;
  g.campXpLedger ||= {};
  g.campXpSources ||= {};
  g.worldDifficulty ||= "normal";
  g.mealAt ??= g.lastClock;
  g.mealsServed ??= 0;
  g.questPins ||= [];
  g.questSort ||= "progress";
  g.guildStanding ||= {};
  g.guildPurchases ||= [];
  g.settings ||= { tutorial: true, reducedMotion: false };
  g.storyPage ??= g.campNamed ? 3 : 0;
  g.tutorialStep ??= 0;
  g.arenaWager ||= { gold: 10, resource: null, amount: 0 };
  g.materials.bossSigils ??= 0;
  if (!g.evernightRevision) {
    g.roster.push(
      ...(g.waitingRecruits || []).slice(
        0,
        Math.max(0, 40 + 20 * (g.buildings.cabins || 0) - g.roster.length),
      ),
    );
    g.evernightRevision = 1;
    if (g.portalUnlocked && g.regionUnlocks.length === 1)
      g.materials.bossSigils++;
    if (["board", "outfitter"].includes(g.marketDistrict))
      g.marketDistrict = "commons";
  }
  g.waitingRecruits = [];
  for (const h of [
    ...g.roster,
    ...(g.visitors || []),
    ...g.expeditions.flatMap((r) => [
      ...(r.recruits || []),
      ...(r.temporaryParty || []),
      ...(r.battleState?.units || []).map((u) => u.hero),
    ]),
  ]) {
    if (!h) continue;
    h.totalXp ??= 0;
    migrateClassNodes(h);
    if (h.light === undefined) h.light = makeItem("hooded-lantern");
  }
  return g;
}
export function consumeMeals(g) {
  const periods = Math.floor((g.lastClock - g.mealAt) / MEAL_PERIOD),
    n = g.roster.length;
  if (periods <= 0 || !n) return false;
  const start = g.mealAt,
    full = Math.min(periods, Math.floor(g.food / n)),
    partial = full < periods ? Math.min(n, g.food - full * n) : 0;
  g.food -= full * n + partial;
  g.roster.forEach((h, i) => {
    const meals = full + (i < partial ? 1 : 0);
    if (!meals) return;
    h.nourishedUntil = start + (meals + 1) * MEAL_PERIOD;
    const xp = meals * 5;
    if (
      g.expeditions.some((r) => r.status === "active" && r.party.includes(h.id))
    )
      h.pendingMealXp = (h.pendingMealXp || 0) + xp;
    else gainXp(h, xp);
  });
  g.mealAt = start + periods * MEAL_PERIOD;
  g.mealsServed += full * n + partial;
  return true;
}
export function fed(g, h) {
  return (h?.nourishedUntil || 0) > g.lastClock || g.food >= g.roster.length;
}
export function foodPlan(g) {
  return {
    demand: g.roster.length,
    next: g.mealAt + MEAL_PERIOD,
    supplied: g.roster.filter((h) => fed(g, h)).length,
  };
}
export const DIFFICULTY_GATES = { normal: 0, hard: 1, nightmare: 3 };
export function difficultyUnlocked(g, key) {
  return (
    Object.hasOwn(DIFFICULTY_GATES, key) &&
    Object.values(g.regionBossClears || {}).filter(Boolean).length >=
      DIFFICULTY_GATES[key]
  );
}
export function setWorldDifficulty(g, key) {
  if (
    g.screen !== "camp" ||
    !g.buildings.bonfire ||
    !difficultyUnlocked(g, key)
  )
    return false;
  g.worldDifficulty = key;
  g.lockedJourney = null;
  return true;
}
export function openPortal(g, loc) {
  if (
    g.screen !== "camp" ||
    !g.portalUnlocked ||
    !["marsh", "volcano", "cinder", "jungle"].includes(loc) ||
    g.regionUnlocks.includes(loc) ||
    g.materials.bossSigils < 1
  )
    return false;
  g.materials.bossSigils--;
  g.regionUnlocks.push(loc);
  g.exploration[loc] = ["camp"];
  awardCampXp(g, 150, "exploration");
  return true;
}
export function equipLight(g, h, id) {
  if (
    g.screen !== "camp" ||
    !h ||
    g.expeditions.some(
      (r) => r.status === "active" && r.party.includes(h.id),
    ) ||
    h.recoveryUntil > g.lastClock ||
    h.trainingJob
  )
    return false;
  if (!id) {
    if (h.light) g.inventory.push(h.light);
    h.light = null;
    return true;
  }
  const i = g.inventory.find(
    (i) =>
      i.id === id &&
      ITEMS[i.key]?.type === "light" &&
      !i.unidentified &&
      !i.sharpenJob,
  );
  if (!i) return false;
  if (h.light) g.inventory.push(h.light);
  h.light = i;
  g.inventory = g.inventory.filter((v) => v !== i);
  return true;
}
export const retirementValue = (h) => ({
  gold: Math.floor(8 + h.level * h.level * 1.5),
  gems: Math.floor(h.level / 30),
});
export const GUILDS = [
  {
    id: "miners",
    name: "Stonekeepers",
    profession: "Miner",
    stat: "armor",
    item: "pickaxe",
    resource: "ore",
    color: "#8da1bc",
  },
  {
    id: "foresters",
    name: "Rootwardens",
    profession: "Lumberjack",
    stat: "endurance",
    item: "axe",
    resource: "wood",
    color: "#78ae91",
  },
  {
    id: "hunters",
    name: "Wildwatch",
    profession: "Hunter",
    stat: "strength",
    item: "longbow",
    resource: "hide",
    color: "#cf9c73",
  },
  {
    id: "arcanists",
    name: "Veil Scholars",
    stat: "mind",
    item: "sunstaff",
    resource: "herbs",
    color: "#ac99dc",
  },
  {
    id: "guardians",
    name: "Oathbearers",
    stat: "vitality",
    item: "aegis",
    resource: "stone",
    color: "#dfba7a",
  },
  {
    id: "scouts",
    name: "Lantern Runners",
    stat: "agility",
    item: "witchlight-lantern",
    resource: "wood",
    color: "#80baca",
  },
  {
    id: "artisans",
    name: "Ironhands",
    stat: "armor",
    item: "ironblade",
    resource: "ore",
    color: "#c49888",
  },
  {
    id: "healers",
    name: "Quiet Mercy",
    stat: "vitality",
    item: "lens",
    resource: "herbs",
    color: "#a4c9ae",
  },
];
export function standing(g, id) {
  return g.guildStanding[id] || 0;
}
export function guildLesson(g, h, id) {
  const d = GUILDS.find((d) => d.id === id);
  if (
    !d ||
    !h ||
    !((g.screen === "camp" && g.buildings.guildhall) || (g.screen === "market" && g.marketDistrict === "guildhall")) ||
    g.gold < 35 ||
    h.trainingJob ||
    h.recoveryUntil > g.lastClock ||
    g.expeditions.some((r) => r.status === "active" && r.party.includes(h.id))
  )
    return false;
  g.gold -= 35;
  const key = "training:" + d.stat,
    a = h.talents.find((a) => a.key === key);
  if (a) a.level = Math.min(100, a.level + 1);
  else h.talents.push(makeFacet(key));
  g.guildStanding[id] = standing(g, id) + 10;
  if (
    id === "scouts" &&
    standing(g, id) >= 20 &&
    !h.talents.some((a) => a.key === "Night vision")
  )
    h.talents.push(makeFacet("Night vision"));
  h.currentHp = stats(h).hp;
  g.serviceCounts.guildLessons++;
  return true;
}
export function guildQuest(g, id) {
  const d = GUILDS.find((d) => d.id === id),
    epoch = Math.floor(g.lastClock / 86400000),
    key = "guild-" + id + "-" + epoch;
  if (
    !d ||
    !((g.screen === "camp" && g.buildings.guildhall) || (g.screen === "market" && g.marketDistrict === "guildhall")) ||
    g.sideQuests.includes(key) ||
    g.questClaims.includes(key)
  )
    return false;
  g.questContracts.push({
    id: key,
    name: d.name + " patrol",
    text: "Win four encounters for " + d.name + ".",
    category: "Guild",
    guild: id,
    contract: true,
    targetWins: g.lifetimeEncounters + 4,
    acceptedWins: g.lifetimeEncounters,
    reward: { gold: 65, [d.resource]: 4 },
  });
  g.sideQuests.push(key);
  return true;
}
export function guildOffer(g, id) {
  const d = GUILDS.find((d) => d.id === id);
  return d
    ? {
        key: "guild-" + d.id,
        gold: Math.ceil(60 * (1 - Math.min(0.4, standing(g, id) / 500))),
        level: 20,
      }
    : null;
}
export function guildBuy(g, id) {
  const o = guildOffer(g, id),
    receipt = id + ":" + Math.floor(g.lastClock / 43200000);
  if (
    !((g.screen === "camp" && g.buildings.guildhall) || (g.screen === "market" && g.marketDistrict === "guildhall")) ||
    !o ||
    standing(g, id) < 20 ||
    g.gold < o.gold ||
    g.guildPurchases.includes(receipt)
  )
    return false;
  g.gold -= o.gold;
  g.guildPurchases.push(receipt);
  g.inventory.push(makeItem(o.key, o.level));
  return true;
}
export const ARENA_RULES = [
  {
    id: "duel",
    name: "Two banners",
    text: "Team deathmatch against one rival company.",
  },
  {
    id: "four",
    name: "Four banners",
    text: "Four companies fight until one remains.",
  },
  {
    id: "tigers",
    name: "The tiger gate",
    text: "Your company faces a pack of arena tigers.",
  },
  {
    id: "mines",
    name: "Powder floor",
    text: "Team deathmatch with explosive mines that hurt either team.",
  },
];
export function arenaRule(g) {
  let n = (g.expeditionCount + 1) ^ Math.floor(g.lastClock / 43200000);
  for (const c of g.campName || "Evernight")
    n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ARENA_RULES[((n ^ (n >>> 16)) >>> 0) % 4];
}
export function setWager(g, gold, resource = null, amount = 0) {
  if (
    g.screen !== "arena" ||
    !Number.isInteger(gold) ||
    gold < 10 ||
    gold > 1000 ||
    !Number.isInteger(amount) ||
    amount < 0 ||
    amount > 100 ||
    (resource &&
      !["wood", "stone", "ore", "herbs", "meat", "hide"].includes(resource))
  )
    return false;
  g.arenaWager = { gold, resource, amount: resource ? amount : 0 };
  return true;
}
export function payWager(g) {
  const w = g.arenaWager || { gold: 10 };
  if (
    g.gold < w.gold ||
    (w.resource && (g.materials[w.resource] || 0) < w.amount)
  )
    return false;
  g.gold -= w.gold;
  if (w.resource) g.materials[w.resource] -= w.amount;
  return structuredClone(w);
}
export function settleWager(g, r) {
  if (!r.wager || r.wagerSettled) return false;
  r.wagerSettled = true;
  if (r.reason === "complete") {
    const n = Math.floor(
      r.wager.gold * (r.arenaRule === "four" ? 4 : 2.2) * r.reward,
    );
    g.gold += n;
    r.earned.gold += n;
    if (r.wager.resource) {
      const n = Math.ceil(r.wager.amount * 2.2 * r.reward);
      g.materials[r.wager.resource] += n;
      r.earned.materials ||= {};
      r.earned.materials[r.wager.resource] = n;
    }
    g.arenaWins++;
    r.completion = "Wager won. Gold and resources returned to Camp.";
  } else r.completion = "Wager lost. Your company returns to Camp.";
  return true;
}
export function monthlyOffers(g, month) {
  if (!Number.isInteger(month) || month < 0 || month > 11) return [];
  return [0, 1, 2].map((i) => {
    const key = "monthly-" + month + "-" + i;
    return { id: key, key, ...COSMETICS[key] };
  });
}
export function monthlyBuy(g, id) {
  const d = COSMETICS[id];
  if (
    g.screen !== "shop" ||
    d?.monthly === undefined ||
    g.cosmetics.includes(id) ||
    !spendGems(g, d.gems)
  )
    return false;
  g.cosmetics.push(id);
  return true;
}
