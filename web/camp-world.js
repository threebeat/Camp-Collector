import { campProgress } from "./evernight.js?v=20";
export const CAMP_WORLD = {
  width: 3000,
  height: 2200,
  center: { x: 1700, y: 1100 },
};
export const CAMP_ANCHORS = {
  bonfire: [1700, 1100],
  tent: [1530, 970],
  storage: [1500, 1240],
  pantry: [1850, 1250],
  kitchen: [1850, 1250],
  crossroads: [1600, 790],
  blacksmith: [2020, 990],
  training: [2100, 780],
  armory: [1360, 820],
  alchemist: [2160, 1180],
  market: [2480, 700],
  guildhall: [580, 540],
  tavern: [580, 850],
  tradingpost: [880, 690],
  arena: [300, 280],
  clinic: [2080, 1390],
  questboard: [1830, 920],
  farm: [2500, 980],
  garden: [2630, 1450],
  archaeology: [1000, 1470],
  dock: [1720, 1660],
};
export const CAMP_PLOTS = {
  west: [580, 700],
  east: [2510, 1150],
  south: [1710, 1620],
};
export const CAMP_VENDORS = ["forge", "arcane", "night", "menagerie"];
export function revealedCampAreas(g) {
  const built = Object.values(g.buildings).filter(Boolean).length;
  const town = g.buildings.tavern || g.buildings.guildhall;
  return [
    {
      x: 1700,
      y: 1100,
      r: Math.min(640, 360 + campProgress(g).level * 22 + built * 9),
    },
    ...g.campExpansions.map((key) => ({
      x: CAMP_PLOTS[key][0],
      y: CAMP_PLOTS[key][1],
      r: 330,
    })),
    ...(town
      ? [
          { x: 680, y: 740, r: 400 },
          { x: 1100, y: 950, r: 210 },
          { x: 1370, y: 1070, r: 210 },
        ]
      : []),
    ...(g.buildings.market ? [{ x: 2480, y: 700, r: 280 }] : []),
    ...(campProgress(g).level >= 4 || g.buildings.arena
      ? [
          { x: 300, y: 280, r: 240 },
          { x: 420, y: 430, r: 210 },
        ]
      : []),
  ];
}
export function normalizeCampWorld(g) {
  g.buildings.tent = Math.max(
    1,
    g.buildings.tent || 1,
    (g.buildings.cabins || 0) + 1,
  );
  g.buildings.cabins = g.buildings.tent - 1;
  for (const key of [
    "market",
    "guildhall",
    "tavern",
    "clinic",
    "questboard",
    "tradingpost",
    "arena",
  ])
    g.buildings[key] ??= key === "questboard" ? 1 : 0;
  if (!g.campWorldRevision && g.campNamed) {
    g.buildings.guildhall = 1;
    g.buildings.tavern = 1;
    g.buildings.clinic = 1;
  }
  if ((g.campWorldRevision || 0) < 2) {
    // Translate the original clearing into the enlarged world once. Saves retain
    // the relative arrangement of every resident and movable prop.
    for (const p of Object.values(g.mapPositions?.camp || {})) {
      p.x = (p.x * 18 + 800) / 30;
      p.y = (p.y * 14 + 450) / 22;
    }
    for (const p of g.campProps || []) {
      p.x += 800;
      p.y += 450;
    }
    if (g.buildings.tavern) g.buildings.tradingpost = 1;
    if (g.screen === "market") g.screen = "camp";
    g.campWorldRevision = 2;
  }
  g.campZone = "center";
  return g;
}
