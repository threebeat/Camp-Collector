import { generateHero } from "./data.js?v=20";
import { seeded } from "./engine.js?v=20";
import { QUESTS, generatedContracts } from "./journeys.js?v=20";
export const TOWN_NPCS = [
  {
    id: "mara",
    name: "Mara",
    role: "Lantern keeper",
    race: "Human",
    classId: "ranger",
    map: "camp",
    x: 700,
    y: 985,
    quests: ["lantern-keeper", "settle-in"],
  },
  {
    id: "orin",
    name: "Orin",
    role: "Road courier",
    race: "Dwarf",
    classId: "vanguard",
    map: "camp",
    x: 1000,
    y: 790,
    quests: ["guild-initiate", "workshop"],
  },
  {
    id: "iris",
    name: "Iris",
    role: "Traveling cook",
    race: "Elf",
    classId: "healer",
    map: "tavern",
    x: 930,
    y: 625,
    quests: ["stock-pantry", "warm-meal", "island"],
  },
];
const portraits = new Map();
export function npcHero(npc) {
  if (!portraits.has(npc.id))
    portraits.set(
      npc.id,
      generateHero(
        { name: npc.name, race: npc.race, classId: npc.classId },
        seeded(npc.id.split("").reduce((s, c) => s + c.charCodeAt(0), 54)),
      ),
    );
  return portraits.get(npc.id);
}
export const BARTENDER = {
  id: "bram",
  name: "Bram",
  role: "Bartender",
  race: "Dwarf",
  classId: "vanguard",
};
export function npcQuestOffers(g, id) {
  const npc = TOWN_NPCS.find((n) => n.id === id);
  if (!npc || !g.buildings.tavern || g.learning?.required) return [];
  const index = TOWN_NPCS.indexOf(npc),
    epoch = Math.floor(g.lastClock / 10800000);
  const pool = [
    ...npc.quests.map((id) => QUESTS.find((q) => q.id === id)),
    generatedContracts(g)[index],
  ].filter(
    (q) =>
      q &&
      !g.sideQuests.includes(q.id) &&
      !g.questClaims.includes(q.id) &&
      (!q.after || g.questClaims.includes(q.after)) &&
      (!q.location || g.regionUnlocks.includes(q.location)) &&
      (q.id !== "guild-initiate" || g.roster.length >= 6) &&
      (q.id !== "island" || g.buildings.dock),
  );
  if (!pool.length) return [];
  return [pool[(epoch + index) % pool.length]];
}
export function acceptNpcQuest(g, npcId, questId) {
  const npc = TOWN_NPCS.find((n) => n.id === npcId);
  if (
    !npc ||
    g.screen !== npc.map ||
    g.sideQuests.filter((id) => !g.questClaims.includes(id)).length >= 100
  )
    return false;
  const q = npcQuestOffers(g, npcId).find((q) => q.id === questId);
  if (!q) return false;
  g.sideQuests.push(q.id);
  if (q.contract) g.questContracts.push(q);
  g.trackedQuest = q.id;
  return true;
}
