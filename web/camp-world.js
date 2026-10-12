import { campProgress } from "./evernight.js?v=16";
export const CAMP_WORLD = {
  width: 1800,
  height: 1400,
  center: { x: 900, y: 620 },
};
export const CAMP_ANCHORS = {
  bonfire: [900, 650],
  tent: [750, 520],
  storage: [730, 740],
  pantry: [1050, 800],
  kitchen: [1050, 800],
  crossroads: [900, 390],
  blacksmith: [1090, 600],
  training: [1090, 430],
  armory: [700, 390],
  alchemist: [1190, 740],
  market: [1410, 400],
  guildhall: [380, 470],
  tavern: [410, 710],
  clinic: [1190, 900],
  questboard: [1040, 480],
  farm: [1410, 850],
  garden: [620, 1100],
  archaeology: [420, 1040],
  dock: [940, 1120],
};
export const CAMP_PLOTS = {
  west: [380, 650],
  east: [1410, 650],
  south: [900, 1100],
};
export const CAMP_VENDORS = ["forge", "arcane", "night", "menagerie"];
export function revealedCampAreas(g) {
  const built = Object.values(g.buildings).filter(Boolean).length;
  return [
    {
      x: 900,
      y: 640,
      r: Math.min(560, 300 + campProgress(g).level * 22 + built * 9),
    },
    ...g.campExpansions.map((key) => ({
      x: CAMP_PLOTS[key][0],
      y: CAMP_PLOTS[key][1],
      r: 270,
    })),
    ...(g.buildings.market ? [{ x: 1410, y: 400, r: 250 }] : []),
  ];
}
export function normalizeCampWorld(g) {
  g.buildings.tent = Math.max(
    1,
    g.buildings.tent || 1,
    (g.buildings.cabins || 0) + 1,
  );
  g.buildings.cabins = g.buildings.tent - 1;
  for (const key of ["market", "guildhall", "tavern", "clinic", "questboard"])
    g.buildings[key] ??= key === "questboard" ? 1 : 0;
  if (!g.campWorldRevision) {
    // Preserve access to paid legacy services; the new Market itself is constructed.
    if (g.campNamed) {
      g.buildings.guildhall = 1;
      g.buildings.tavern = 1;
      g.buildings.clinic = 1;
    }
    if (g.screen === "market") g.screen = "camp";
    g.campWorldRevision = 1;
  }
  g.campZone = "center";
  return g;
}
