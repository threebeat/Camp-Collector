import {
  generateHero,
  PLAYABLE_CLASSES,
  CONSUMABLES,
  heroRarity,
  stats,
} from "./data.js?v=21";
import { campCapacity, payCost } from "./camp.js?v=21";
export const TAVERN_UPGRADES = [
  null,
  { gold: 140, wood: 12, stone: 6 },
  { gold: 360, wood: 28, stone: 16 },
];
export function tavernLevel(g) {
  return Math.min(3, Math.max(1, g.buildings.tavern || 1));
}
export function barStock(g) {
  // Use canonical consumables, in their authored order, with broader menus per upgrade.
  return Object.entries(CONSUMABLES)
    .filter(([, d]) => d.price > 0)
    .slice(0, [0, 2, 4, 99][tavernLevel(g)]);
}
export function normalizeTavern(g) {
  g.tavern ||= {
    stock: [],
    epoch: null,
    tier: null,
    firstHireClaimed: false,
    tutorialStock: null,
  };
  const t = g.tavern;
  const tutorial = !!g.learning?.required && !t.firstHireClaimed;
  const epoch = Math.floor(g.lastClock / 43200000),
    tier = tavernLevel(g);
  if (t.epoch === epoch && t.tier === tier && t.tutorialStock === tutorial)
    return t;
  // The first invitation never rotates while the player is choosing.
  if (tutorial && t.tutorialStock && t.stock.length) return t;
  let seed = (epoch * 97 + tier * 433) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const classes = PLAYABLE_CLASSES;
  const tiers = tutorial
    ? [0, 0, 0, 0, 0, 0]
    : tier === 1
      ? [0, 0, 0, 0, 1, 1]
      : tier === 2
        ? [0, 0, 1, 1, 2, 2]
        : [0, 1, 1, 2, 2, 3];
  t.stock = tiers.map((rarity, i) => {
    const level = [5, 20, 40, 60][rarity];
    const hero = generateHero(
      { classId: classes[(epoch + i * 5) % classes.length], level },
      random,
    );
    return {
      id: `tavern-${epoch}-${tier}-${tutorial ? "welcome" : "stock"}-${i}`,
      hero,
      gold: tutorial ? 0 : [45, 180, 440, 950][heroRarity(hero)],
    };
  });
  Object.assign(t, { epoch, tier, tutorialStock: tutorial });
  return t;
}
export function hireAtTavern(g, id) {
  if (
    g.screen !== "tavern" ||
    !g.buildings.tavern ||
    g.roster.length >= campCapacity(g)
  )
    return false;
  const t = normalizeTavern(g),
    index = t.stock.findIndex((o) => o.id === id),
    offer = t.stock[index];
  if (!offer || g.gold < offer.gold) return false;
  if (
    g.learning?.required &&
    !(
      g.learning.stage === "recovery" &&
      g.learning.lossResolved &&
      !t.firstHireClaimed
    )
  )
    return false;
  g.gold -= offer.gold;
  t.stock.splice(index, 1);
  const hero = offer.hero;
  hero.currentHp = stats(hero).hp;
  g.roster.push(hero);

  if (g.learning?.stage === "recovery") t.firstHireClaimed = true;
  return hero;
}
export function upgradeTavern(g) {
  const level = tavernLevel(g),
    cost = TAVERN_UPGRADES[level];
  if (
    g.screen !== "tavern" ||
    !g.buildings.tavern ||
    !cost ||
    !payCost(g, cost)
  )
    return false;
  g.buildings.tavern++;
  normalizeTavern(g);
  return true;
}
export function buyAtBar(g, key) {
  const entry = barStock(g).find(([k]) => k === key);
  if (
    g.screen !== "tavern" ||
    !g.buildings.tavern ||
    !entry ||
    g.gold < entry[1].price
  )
    return false;
  g.gold -= entry[1].price;
  g.consumables[key] = (g.consumables[key] || 0) + 1;
  return true;
}
