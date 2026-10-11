import { LOCATIONS, DIFFICULTIES, allGear } from "./data.js?v=15";
export const REGION_ORDER = [
  "greenway",
  "marsh",
  "volcano",
  "cinder",
  "jungle",
];
const node = (id, name, x, y, level, kind = "place", reward = null) => ({
  id,
  name,
  x,
  y,
  level,
  kind,
  reward,
});
const road = (a, b, combat, stop = "cache", danger = 1) => ({
  a,
  b,
  combat,
  stop,
  danger,
});
// A sparse regional network keeps roads readable and destinations varied.
// Existing destination IDs stay stable so saved parties and discoveries remain valid.
const BLUEPRINTS = {
  greenway: {
    exit: "grove",
    next: "marsh",
    core: [
      ["camp", "Your Camp", 1, "camp"],
      ["clearing", "The first clearing", 1],
      ["bridge", "Fernbridge", 3, "place", "fox"],
      ["court", "Mushroom court", 6, "place", "moss"],
      ["ruins", "Rootbound ruins", 8, "resource", "wood"],
      ["firefly", "Firefly hollow", 5, "special", "sprite"],
      ["elder", "Elder refuge", 10, "special", "Ent"],
      ["grove", "Thornwatch Castle", 12, "boss", "gate"],
    ],
    sides: [
      ["waystone", "Mossy waystone", "place"],
      ["brook", "Little brook", "resource", "herbs"],
      ["copse", "Acorn copse", "resource", "wood"],
      ["pond", "Stillwater pond", "place"],
      ["mill", "The abandoned mill", "resource", "stone"],
      ["hedge", "Foxglove hedge", "place"],
      ["outpost", "Ranger’s outpost", "place"],
      ["burrow", "Hare burrow", "special", "herbs"],
      ["shrine", "The leaf shrine", "place"],
      ["weald", "Silverleaf weald", "resource", "wood"],
      ["falls", "Moonlit falls", "place"],
      ["root", "The root arch", "resource", "stone"],
      ["tower", "Briar watchtower", "place"],
      ["orchard", "Wild apple orchard", "resource", "herbs"],
      ["gatehouse", "Castle gatehouse", "place"],
      ["vault", "The green vault", "special", "ore"],
    ],
    wave: [1, 0, 1, 2, 1, 0, 1, 2],
    tint: "#6f8860",
  },
  marsh: {
    exit: "ferryman",
    next: "volcano",
    core: [
      ["camp", "Marsh arrival", 4, "crossroads"],
      ["quay", "The silent quay", 5],
      ["quarry", "Forgotten quarry", 7, "resource", "ore"],
      ["reeds", "Graves in the reeds", 8],
      ["cloister", "Drowned cloister", 10],
      ["tower", "Leaning bell tower", 12, "special", "Automaton"],
      ["bell", "The bell below", 13, "resource", "stone"],
      ["ferryman", "The last ferryman", 15, "boss", "gate"],
    ],
    sides: [
      ["boardwalk", "Sinking boardwalk"],
      ["pool", "Glasswater pool", "resource", "herbs"],
      ["ferry", "Old ferry landing"],
      ["willow", "The hollow willow", "resource", "wood"],
      ["causeway", "Lost causeway"],
      ["jetty", "The broken jetty", "resource", "stone"],
      ["crypt", "Flooded crypt"],
      ["mire", "Whispering mire"],
      ["sluice", "The rusted sluice", "resource", "ore"],
      ["lily", "Waterlily shrine"],
      ["barrow", "The sunken barrow"],
      ["islet", "Lantern islet", "special", "sprite"],
      ["weir", "Blackwater weir"],
      ["chapel", "The drifting chapel"],
      ["harbor", "The last harbor"],
      ["cairn", "Ferryman’s cairn", "resource", "stone"],
    ],
    wave: [0, 1, 2, 1, 0, 1, 2, 1],
    tint: "#718f87",
  },
  volcano: {
    exit: "caldera",
    next: "cinder",
    core: [
      ["camp", "Mountain arrival", 12, "crossroads"],
      ["basalt", "Basalt foothills", 13],
      ["obsidian", "Obsidian quarry", 15, "resource", "obsidian"],
      ["watch", "Ashen watch", 17],
      ["spring", "Mineral terraces", 18, "resource", "ore"],
      ["altar", "Obsidian altar", 20, "special", "salamander"],
      ["stair", "The fire stair", 22],
      ["caldera", "Dragon caldera", 24, "boss", "dragon"],
    ],
    sides: [
      ["cindertrail", "Cinder trail"],
      ["vent", "Warmstone vent", "resource", "ore"],
      ["ravine", "The split ravine"],
      ["shelter", "Climber’s shelter"],
      ["glass", "Blackglass ridge", "resource", "obsidian"],
      ["embers", "The ember fields"],
      ["forge", "Forgotten forge", "resource", "ore"],
      ["ridge", "Razorback ridge"],
      ["hotpool", "The hot spring"],
      ["mine", "Sulfur mine", "resource", "stone"],
      ["lava", "Lava overlook"],
      ["bridge", "The red bridge"],
      ["crater", "Little crater", "resource", "obsidian"],
      ["sanctum", "A flame sanctum"],
      ["aerie", "Dragon’s aerie"],
      ["hoard", "The outer hoard", "special", "relic"],
    ],
    wave: [2, 1, 0, 1, 2, 1, 0, 1],
    tint: "#9d7866",
  },
  cinder: {
    exit: "crown",
    next: "jungle",
    core: [
      ["camp", "Country arrival", 20, "crossroads"],
      ["orchard", "Orchard road", 21],
      ["hamlet", "Red-roof hamlet", 23],
      ["stable", "Moonlit stable", 24, "special", "horse"],
      ["bandit", "A bandit’s bargain", 26],
      ["crypt", "The glass crypt", 28, "special", "scrollGravity"],
      ["estate", "The old estate", 30, "resource", "herbs"],
      ["crown", "The thorn crown", 32, "boss", "gate"],
    ],
    sides: [
      ["hayfield", "Golden hayfield"],
      ["windmill", "The crooked windmill", "resource", "wood"],
      ["lane", "Hedgerow lane"],
      ["well", "The wishing well"],
      ["marketroad", "Caravan shelter"],
      ["granary", "The locked granary", "resource", "herbs"],
      ["cross", "The three-way cross"],
      ["inn", "The empty inn"],
      ["toll", "A bandit tollgate"],
      ["vineyard", "Bloodvine vineyard"],
      ["chase", "The hunting chase", "resource", "wood"],
      ["cemetery", "Mistbound cemetery"],
      ["garden", "The old rose garden", "resource", "herbs"],
      ["manor", "The white manor"],
      ["thornwall", "Thornwall breach"],
      ["cellar", "The king’s cellar", "special", "ore"],
    ],
    wave: [1, 2, 1, 0, 1, 2, 1, 0],
    tint: "#a08c68",
  },
  jungle: {
    exit: "tyrant",
    next: null,
    core: [
      ["camp", "Jungle arrival", 30, "crossroads"],
      ["verge", "Fernveil verge", 31],
      ["ruins", "Broken sun temple", 33, "resource", "relic"],
      ["canopy", "Canopy spring", 34],
      ["nest", "Nesting valley", 35, "special", "eggs"],
      ["temple", "The vine altar", 36, "resource", "herbs"],
      ["thunder", "Thunderplain", 38],
      ["tyrant", "The ancient tyrant", 40, "boss", "gate"],
    ],
    sides: [
      ["tangle", "The green tangle"],
      ["creek", "Amber creek", "resource", "herbs"],
      ["bamboo", "Bamboo maze", "resource", "wood"],
      ["tracks", "Giant tracks"],
      ["idol", "The buried idol", "resource", "relic"],
      ["ravine", "Raptor ravine"],
      ["lagoon", "The ancient lagoon"],
      ["bones", "The bone bed", "resource", "fossils"],
      ["hatchery", "An empty hatchery", "resource", "fossils"],
      ["garden", "The fern garden", "resource", "herbs"],
      ["stairs", "The vine stair"],
      ["pool", "Jadewater pool"],
      ["obelisk", "Broken obelisk", "resource", "relic"],
      ["aerie", "Pterosaur aerie"],
      ["footprints", "Tyrant’s footprints"],
      ["sunvault", "The sun vault", "special", "relic"],
    ],
    wave: [0, 1, 2, 1, 0, 1, 2, 1],
    tint: "#678652",
  },
};
function buildRegion(key, b) {
  if (key === "greenway") return forestRegion(b);
  const nodes = [],
    rows = [],
    roads = [],
    seed = REGION_ORDER.indexOf(key);
  for (let row = 0; row < 8; row++) {
    const core = b.core[row],
      side = b.sides.slice(row * 2, row * 2 + 2),
      band = [];
    let at = 0;
    for (let col = 0; col < 3; col++) {
      const isCore = col === b.wave[row],
        v = isCore ? core : side[at++],
        x = 18 + col * 31 + Math.sin((row + seed) * 1.7 + col) * 3,
        y = 91 - row * 11.6 + Math.sin((col + seed) * 1.4 + row) * 1.5;
      band.push(
        node(
          v[0],
          v[1],
          x,
          y,
          isCore ? core[2] : Math.max(1, core[2] + (col === 2 ? 1 : 0)),
          isCore ? core[3] || "place" : v[2] || "place",
          isCore ? core[4] : v[3],
        ),
      );
    }
    rows.push(band);
    nodes.push(...band);
    for (let col = 0; col < 2; col++)
      roads.push(
        road(
          band[col].id,
          band[col + 1].id,
          1,
          ["cache", "fountain", "chest"][(row + col + seed) % 3],
          row < 2 && key === "greenway" ? 1 : 1.05 + (row % 3) * 0.05,
        ),
      );
    if (row % 3 === 0)
      roads.push(
        road(
          band[0].id,
          band[2].id,
          1,
          ["fountain", "cache", "chest"][(row + seed) % 3],
          row === 0 && key === "greenway" ? 1.08 : 1.18,
        ),
      );
    if (row) {
      const before = rows[row - 1],
        previous = b.core[row - 1][0];
      roads.push(
        road(
          previous,
          core[0],
          2,
          ["fountain", "chest", "cache"][(row + seed) % 3],
          1,
        ),
      );
      const col = (row + seed) % 3;
      roads.push(
        road(
          before[col].id,
          band[(col + 1) % 3].id,
          row === 1 ? 1 : 2,
          ["cache", "chest", "fountain"][(row + 1) % 3],
          key === "greenway" && row === 1 ? 1 : 1.15,
        ),
      );
    }
  }
  // Preserve the short tutorial and old distinctive shortcuts in the expanded network.
  const shortcuts = {
    greenway: [
      ["clearing", "bridge"],
      ["clearing", "firefly"],
      ["bridge", "court"],
      ["bridge", "ruins"],
      ["court", "elder"],
      ["elder", "grove"],
      ["ruins", "grove"],
    ],
    marsh: [
      ["quay", "reeds"],
      ["reeds", "tower"],
      ["cloister", "ferryman"],
    ],
    volcano: [
      ["basalt", "watch"],
      ["watch", "stair"],
      ["altar", "caldera"],
    ],
    cinder: [
      ["orchard", "stable"],
      ["hamlet", "crypt"],
      ["bandit", "crown"],
    ],
    jungle: [
      ["verge", "canopy"],
      ["canopy", "nest"],
      ["temple", "tyrant"],
    ],
  };
  for (const [a, c] of shortcuts[key])
    if (
      !roads.some((e) => (e.a === a && e.b === c) || (e.a === c && e.b === a))
    )
      roads.push(road(a, c, 3, "chest", 1.2));
  // There are two routes to the opening destination even before exploration.
  const firstSide = rows[0].find((n) => n.id !== "camp");
  if (!roads.some((e) => e.a === firstSide.id && e.b === b.core[1][0]))
    roads.push(road(firstSide.id, b.core[1][0], 2, "fountain", 1.08));
  const ordered = [
    ...b.core.map((v) => nodes.find((n) => n.id === v[0])),
    ...nodes.filter((n) => !b.core.some((v) => v[0] === n.id)),
  ];
  return {
    entry: "camp",
    exit: b.exit,
    next: b.next,
    nodes: ordered,
    roads: roads.filter(
      (e, i, list) =>
        list.findIndex(
          (x) => [x.a, x.b].sort().join(":") === [e.a, e.b].sort().join(":"),
        ) === i,
    ),
    tint: b.tint,
    first: b.core[1][0],
  };
}
function forestRegion(b) {
  const positions = {
    camp: [50, 91],
    clearing: [47, 77],
    bridge: [24, 63],
    court: [70, 64],
    ruins: [17, 42],
    firefly: [79, 45],
    elder: [44, 29],
    grove: [58, 8],
    waystone: [22, 85],
    brook: [75, 87],
    copse: [12, 72],
    pond: [85, 72],
    mill: [47, 57],
    shrine: [56, 43],
    falls: [88, 27],
    tower: [19, 23],
    gatehouse: [69, 23],
    vault: [36, 12],
  };
  const core = b.core.map((v) =>
      node(v[0], v[1], ...positions[v[0]], v[2], v[3] || "place", v[4]),
    ),
    side = b.sides
      .filter((v) => positions[v[0]])
      .map((v, i) =>
        node(
          v[0],
          v[1],
          ...positions[v[0]],
          Math.max(2, Math.round((100 - positions[v[0]][1]) / 8)),
          v[2] || "place",
          v[3],
        ),
      );
  const pairs = [
    ["camp", "clearing", 2],
    ["camp", "waystone", 2],
    ["camp", "brook", 2],
    ["waystone", "clearing", 2],
    ["brook", "clearing", 2],
    ["waystone", "copse", 1],
    ["copse", "bridge", 2],
    ["brook", "pond", 1],
    ["pond", "court", 2],
    ["clearing", "bridge", 2],
    ["clearing", "mill", 2],
    ["bridge", "mill", 1],
    ["mill", "court", 2],
    ["bridge", "ruins", 2],
    ["court", "firefly", 2],
    ["mill", "shrine", 2],
    ["ruins", "shrine", 1],
    ["ruins", "tower", 2],
    ["shrine", "elder", 2],
    ["firefly", "falls", 2],
    ["falls", "gatehouse", 2],
    ["elder", "gatehouse", 2],
    ["tower", "vault", 2],
    ["vault", "grove", 2],
    ["gatehouse", "grove", 2],
    ["elder", "vault", 2],
  ];
  return {
    entry: "camp",
    exit: b.exit,
    next: b.next,
    first: "clearing",
    nodes: [...core, ...side],
    roads: pairs.map(([a, c, n], i) =>
      road(
        a,
        c,
        n,
        ["fountain", "cache", "chest"][i % 3],
        i === 0 ? 1 : i < 5 ? 1.06 : 1 + (i % 3) * 0.08,
      ),
    ),
    tint: b.tint,
  };
}
export const REGIONS = Object.fromEntries(
  Object.entries(BLUEPRINTS).map(([key, b]) => [key, buildRegion(key, b)]),
);

export const REGION_CHAMPIONS = {
  greenway: {
    minis: ["court", "ruins", "gatehouse"],
    boss: "The Thornwatch regent",
  },
  marsh: { minis: ["reeds", "cloister", "bell"], boss: "The last ferryman" },
  volcano: { minis: ["watch", "altar", "stair"], boss: "Emberpeak dragon" },
  cinder: {
    minis: ["bandit", "crypt", "estate"],
    boss: "The thorn-crowned sovereign",
  },
  jungle: {
    minis: ["canopy", "temple", "thunder"],
    boss: "The ancient tyrant",
  },
};
for (const [key, region] of Object.entries(REGIONS)) {
  for (const n of region.nodes)
    if (REGION_CHAMPIONS[key].minis.includes(n.id)) n.kind = "miniboss";
  for (const e of region.roads) {
    e.style = e.danger >= 1.08 ? "wild" : "strong";
    e.water =
      key === "marsh" ||
      (key === "greenway" &&
        [e.a, e.b].some((id) =>
          ["bridge", "brook", "pond", "falls"].includes(id),
        ));
  }
}

export function bossDefeated(g, location) {
  return !!g.regionBossClears?.[location];
}
export function difficultyAllowed(g, location, difficulty) {
  return (
    !!DIFFICULTIES[difficulty] &&
    (difficulty === (g.worldDifficulty || "normal") ||
      difficulty === "normal" ||
      (difficulty === "hard" && !!g.regionBossClears.greenway) ||
      (difficulty === "nightmare" &&
        Object.values(g.regionBossClears).filter(Boolean).length >= 3))
  );
}
export function explored(g, location) {
  return new Set(g.exploration?.[location] || ["camp"]);
}
export function visibleNodes(g, location) {
  const seen = explored(g, location),
    visible = new Set(seen);
  for (const edge of REGIONS[location]?.roads || []) {
    if (seen.has(edge.a)) visible.add(edge.b);
    if (seen.has(edge.b)) visible.add(edge.a);
  }
  return visible;
}
const edgeKey = (a, b) => [a, b].sort().join(":");
const routeCost = (p) =>
  p.edges.reduce((sum, e) => sum + e.combat * e.danger + 0.2, 0);
function shortest(
  region,
  visible,
  start,
  target,
  blockedEdges = new Set(),
  blockedNodes = new Set(),
) {
  const queue = [{ ids: [start], edges: [], cost: 0 }],
    best = new Map();
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const p = queue.shift(),
      id = p.ids.at(-1);
    if (id === target) return p;
    if (best.has(id) && best.get(id) <= p.cost) continue;
    best.set(id, p.cost);
    for (const e of region.roads) {
      const next = e.a === id ? e.b : e.b === id ? e.a : null;
      if (
        !next ||
        !visible.has(next) ||
        blockedNodes.has(next) ||
        blockedEdges.has(edgeKey(id, next)) ||
        p.ids.includes(next)
      )
        continue;
      queue.push({
        ids: [...p.ids, next],
        edges: [...p.edges, e],
        cost: p.cost + e.combat * e.danger + 0.2,
      });
    }
  }
  return null;
}
// Yen's bounded k-shortest simple paths: predictable work on a larger, loopy map.
export function regionalRoutes(g, location, target) {
  const region = REGIONS[location];
  if (
    !region ||
    !g.regionUnlocks?.includes(location) ||
    target === region.entry
  )
    return [];
  const visible = visibleNodes(g, location);
  if (!visible.has(target)) return [];
  const first = shortest(region, visible, region.entry, target);
  if (!first) return [];
  const selected = [first],
    candidates = [];
  for (let k = 1; k < 3; k++) {
    const previous = selected[k - 1];
    for (let i = 0; i < previous.ids.length - 1; i++) {
      const root = previous.ids.slice(0, i + 1),
        blocked = new Set();
      for (const p of selected)
        if (p.ids.slice(0, i + 1).join() === root.join())
          blocked.add(edgeKey(p.ids[i], p.ids[i + 1]));
      const spur = shortest(
        region,
        visible,
        root.at(-1),
        target,
        blocked,
        new Set(root.slice(0, -1)),
      );
      if (!spur) continue;
      const ids = [...root.slice(0, -1), ...spur.ids],
        edges = [...previous.edges.slice(0, i), ...spur.edges];
      if (
        ![...selected, ...candidates].some((p) => p.ids.join() === ids.join())
      )
        candidates.push({ ids, edges, cost: routeCost({ edges }) });
    }
    candidates.sort((a, b) => a.cost - b.cost);
    if (!candidates.length) break;
    selected.push(candidates.shift());
  }
  return selected.map((p, index) => {
    const combats = p.edges.reduce((sum, e) => sum + e.combat, 0),
      danger =
        index === 0
          ? 1
          : Math.max(
              1.15 + (index - 1) * 0.1,
              p.edges.reduce((sum, e) => sum + e.danger * e.combat, 0) /
                combats,
            );
    return {
      ...p,
      index,
      label: ["Direct road", "Scenic detour", "Outer trail"][index],
      combats,
      events: Math.max(0, p.edges.length - 1),
      danger,
      foodPerHero: Math.max(0, Math.floor((combats - 2) / 4)),
      itinerary: p.edges.flatMap((edge, i) =>
        Array.from({ length: edge.combat }, (_, j) => ({
          road: i,
          from: p.ids[i],
          to: p.ids[i + 1],
          style: edge.style,
          water: edge.water,
          champion:
            j === edge.combat - 1
              ? region.nodes.find((n) => n.id === p.ids[i + 1])?.kind
              : null,
          rest: j === edge.combat - 1 ? edge.stop : null,
        })),
      ),
    };
  });
}
export function journeyInfo(g, choice) {
  const location = choice.location || "greenway",
    region = REGIONS[location],
    target = choice.target || region?.first,
    n = region?.nodes.find((n) => n.id === target),
    routes = regionalRoutes(g, location, target),
    route = routes[choice.routeIndex || 0],
    difficulty = g.worldDifficulty || "normal",
    d = DIFFICULTIES[difficulty];
  if (!n || !d) return null;
  return {
    ...choice,
    mode: "journey",
    location,
    target,
    name: n.name,
    routeIndex: route?.index || 0,
    routeIds: route?.ids || [],
    roadItinerary: route?.itinerary || [],
    routeDanger: route?.danger || 1,
    encounters: route?.combats || 0,
    otherEncounters: route?.events || 0,
    foodPerHero: route?.foodPerHero || 0,
    level: n.level,
    milestone: n.reward,
    targetKind: n.kind,
    destinationBoss: n.kind === "boss",
    reward: d.reward * (route?.danger || 1),
    unlocked: !!route && difficultyAllowed(g, location, difficulty),
    difficulty,
    route: "roads",
  };
}
export function journeyRequirements(g, config, heroes) {
  if (!["journey", "island"].includes(config.mode))
    return { food: 0, missing: [] };
  const food =
      (config.mode === "island" ? 3 : config.foodPerHero) * heroes.length,
    missing = [];
  if (g.food < food)
    missing.push(
      "Stock " + food + " food for this route (" + g.food + " available).",
    );
  for (const h of heroes)
    if (!h.items[0])
      missing.push(
        "Equip " +
          h.name +
          "’s " +
          (h.classId === "bard" ? "instrument" : "primary slot") +
          ".",
      );
  return { food, missing };
}
export function revealJourney(g, r) {
  const region = REGIONS[r.location];
  if (!region) return;
  const seen = explored(g, r.location);
  for (const id of r.routeIds || []) seen.add(id);
  g.exploration[r.location] = [...seen];
  g.journeyClears[r.location + ":" + r.target] =
    (g.journeyClears[r.location + ":" + r.target] || 0) + 1;
  g.campaign[r.location] = Math.min(
    5,
    [...seen].filter((id) => id !== region.entry).length,
  );
  if (r.target === region.exit && r.destinationBoss !== false) {
    g.regionBossClears[r.location] = true;
    if (r.location === "greenway") g.portalUnlocked = true;
    g.materials.bossSigils = (g.materials.bossSigils || 0) + 1;
    r.earned ||= {};
    r.earned.materials ||= {};
    r.earned.materials.bossSigils = (r.earned.materials.bossSigils || 0) + 1;
  }
}
export const QUESTS = [
  {
    id: "first-road",
    name: "A first road together",
    text: "Send your three adventurers to the first clearing.",
    location: "greenway",
    target: "clearing",
    check: (g) => !!g.journeyClears["greenway:clearing"],
    reward: { gold: 45, wood: 6, stone: 4 },
  },
  {
    id: "bridge",
    name: "Beyond the bridge",
    text: "Reach Fernbridge and meet a little traveling friend.",
    after: "first-road",
    location: "greenway",
    target: "bridge",
    check: (g) => !!g.journeyClears["greenway:bridge"],
    reward: { gold: 70, food: 6 },
  },
  {
    id: "hire",
    name: "One more place at the fire",
    text: "Recruit or hire a fourth adventurer near the Market.",
    after: "bridge",
    check: (g) => g.roster.length >= 4,
    reward: { gold: 60, wood: 15, stone: 10 },
  },
  {
    id: "training",
    name: "Practice makes a home",
    text: "Build the Training Grounds, then finish a timed training session.",
    after: "hire",
    check: (g) =>
      g.roster.some((h) =>
        (h.talents || []).some((t) => t.key.startsWith("training:")),
      ),
    reward: { gold: 60, ore: 4 },
  },
  {
    id: "gather",
    name: "Hands for the work",
    text: "Teach a Miner or Lumberjack Talent and equip its dedicated tool.",
    after: "bridge",
    check: (g) =>
      g.roster.some(
        (h) =>
          (h.talents || []).some((t) =>
            ["Miner", "Lumberjack"].includes(t.key),
          ) && h.items.some((i) => i && ["pickaxe", "axe"].includes(i.key)),
      ),
    reward: { gold: 45, wood: 8, stone: 8 },
  },
  {
    id: "grove",
    name: "The forest opens",
    text: "Defeat the boss at Thornwatch Castle. A portalkeeper will open a new road from your Camp.",
    after: "bridge",
    location: "greenway",
    target: "grove",
    check: (g) => !!g.journeyClears["greenway:grove"],
    reward: { gold: 90, food: 9 },
  },
  {
    id: "bonfire",
    name: "Choose a calling",
    text: "Earn a level-20 class point and choose a branch at the Bonfire.",
    after: "hire",
    check: (g) => g.roster.some((h) => h.classNodes?.length),
    reward: { gold: 100, gemValue: 3 },
  },
  {
    id: "mountain",
    name: "Road to the mountains",
    text: "Reach the last ferryman to open Emberpeak.",
    after: "grove",
    location: "marsh",
    target: "ferryman",
    check: (g) => !!g.journeyClears["marsh:ferryman"],
    reward: { gold: 120, food: 12 },
  },
  {
    id: "dragon",
    name: "The caldera guardian",
    text: "Defeat the Emberpeak dragon and open the pass to Briarfall.",
    after: "mountain",
    location: "volcano",
    target: "caldera",
    check: (g) => !!g.journeyClears["volcano:caldera"],
    reward: { gold: 180, gemValue: 9 },
  },
  {
    id: "jungle",
    name: "Beyond the thorn crown",
    text: "Reach Briarfall’s final boss to discover Amberwild.",
    after: "dragon",
    location: "cinder",
    target: "crown",
    check: (g) => !!g.journeyClears["cinder:crown"],
    reward: { gold: 180, food: 15 },
  },
  {
    id: "eggs",
    name: "A prehistoric friend",
    text: "Find eggs in the Nesting valley and build Archaeology in a Camp expansion and hatch a dinosaur.",
    after: "jungle",
    location: "jungle",
    target: "nest",
    check: (g) =>
      [
        ...g.companions,
        ...g.roster.map((h) => h.companion).filter(Boolean),
      ].some((p) => ["raptor", "hadrosaur"].includes(p.key)),
    reward: { gold: 160, gemValue: 9 },
  },
  {
    id: "awaken",
    name: "A familiar thing, changed",
    text: "Transform a level-20 weapon at the Blacksmith, or armor or a companion at the Equipment Workshop.",
    after: "bonfire",
    check: (g) =>
      [
        ...g.inventory,
        ...g.companions,
        ...g.roster.flatMap((h) =>
          [...allGear(h), h.companion].filter(Boolean),
        ),
      ].some((i) => i.evolution),
    reward: { gold: 120, gemValue: 4 },
  },
];
export function questState(g, q) {
  const claimed = g.questClaims.includes(q.id),
    side = q.category && q.category !== "Main";
  let unlocked = side
    ? (g.sideQuests || []).includes(q.id)
    : !q.after || g.questClaims.includes(q.after);
  if (!side && unlocked && !claimed) unlocked = currentMain(g)?.id === q.id;
  return {
    claimed,
    unlocked,
    complete: q.contract ? g.lifetimeEncounters >= q.targetWins : q.check(g),
  };
}
export function questProgress(g, q) {
  if (q.contract) {
    const start = q.acceptedWins ?? q.targetWins - 4,
      total = q.targetWins - start;
    return {
      done: Math.min(total, Math.max(0, g.lifetimeEncounters - start)),
      total,
      label: "encounters",
    };
  }
  const totals = {
    hire: [g.roster.length, 4, "adventurers"],
    training: [
      Number(!!g.buildings.training) +
        Number(
          g.roster.some((h) =>
            h.talents.some((t) => t.key.startsWith("training:")),
          ),
        ),
      2,
      "steps",
    ],
    bonfire: [
      Number(
        g.roster.some((h) => h.classNodes.some((id) => id.endsWith(":0"))),
      ),
      1,
      "subclass",
    ],
    mountain: [Math.max(0, g.regionUnlocks.length - 1), 1, "new region"],
    dragon: [
      Object.values(g.regionBossClears).filter(Boolean).length,
      2,
      "regional bosses",
    ],
    island: [g.islandFloor || 0, 1, "floors"],
  };
  const a = totals[q.id];
  return a
    ? { done: Math.min(a[0], a[1]), total: a[1], label: a[2] }
    : { done: q.check(g) ? 1 : 0, total: 1, label: "objective" };
}
export function activeQuests(g) {
  return allQuests(g).filter((q) => {
    const s = questState(g, q);
    return s.unlocked && !s.claimed;
  });
}
export function trackQuest(g, id) {
  if (!allQuests(g).some((q) => q.id === id && questState(g, q).unlocked))
    return false;
  g.trackedQuest = g.trackedQuest === id ? null : id;
  return true;
}

const MAIN_IDS = [
  "first-road",
  "bridge",
  "hire",
  "grove",
  "mountain",
  "dragon",
  "jungle",
  "eggs",
];
for (const q of QUESTS) q.category = MAIN_IDS.includes(q.id) ? "Main" : "Side";
for (let i = 0; i < MAIN_IDS.length; i++)
  QUESTS.find((q) => q.id === MAIN_IDS[i]).after = i
    ? MAIN_IDS[i - 1]
    : undefined;
QUESTS.push(
  {
    id: "settle-in",
    category: "Side",
    name: "Names by the fire",
    text: "Name your Camp. A small reward for giving your company a home.",
    check: (g) => g.campNamed,
    reward: { gold: 15, wood: 2 },
  },
  {
    id: "stock-pantry",
    category: "Side",
    name: "Keep a meal waiting",
    text: "Buy at least one food from the Pantry. Returning travelers deserve a warm meal.",
    check: (g) => g.serviceCounts?.foodBought >= 1,
    reward: { gold: 20, meat: 2, herbs: 1 },
  },
  {
    id: "lantern-keeper",
    category: "NPC",
    name: "Mara’s missing lantern",
    text: "Mara saw a light at the first clearing. Reach it and bring her news.",
    location: "greenway",
    target: "clearing",
    check: (g) => !!g.journeyClears["greenway:clearing"],
    reward: { gold: 35, herbs: 3 },
  },
  {
    id: "guild-initiate",
    category: "Side",
    name: "A trade for the long night",
    text: "Learn a Profession at the Guildhall.",
    check: (g) =>
      g.roster.some((h) =>
        h.attributes.some((a) =>
          ["Miner", "Lumberjack", "Hunter"].includes(a.key),
        ),
      ),
    reward: { gold: 35, meat: 2 },
  },
  {
    id: "workshop",
    category: "Side",
    name: "Armor with a story",
    text: "Craft a piece of armor at the Equipment Workshop.",
    check: (g) => g.serviceCounts?.crafted > 0,
    reward: { gold: 50, ore: 3 },
  },
  {
    id: "warm-meal",
    category: "Side",
    name: "Something warm",
    text: "Upgrade the Pantry into a Kitchen and cook a meal.",
    check: (g) => g.serviceCounts?.cooked > 0,
    reward: { gold: 40, food: 3 },
  },
  {
    id: "island",
    category: "Side",
    name: "The bell across the water",
    text: "Build the Lantern Dock, sail across the lake and clear the first island floor.",
    check: (g) => g.islandFloor >= 1,
    reward: { gold: 120, food: 6 },
  },
);
export function currentMain(g) {
  return (
    MAIN_IDS.map((id) => QUESTS.find((q) => q.id === id)).find(
      (q) => !g.questClaims.includes(q.id),
    ) || null
  );
}
export function generatedContracts(g) {
  const epoch = Math.floor(g.lastClock / 86400000);
  return [2, 4, 6].map((n, i) => ({
    id: "contract-" + epoch + "-" + i,
    contract: true,
    category: "Side",
    name: ["Road watch", "Keep the roads open", "The long patrol"][i],
    text: "Win " + n + " more encounters after accepting this contract.",
    targetWins: g.lifetimeEncounters + n,
    acceptedWins: g.lifetimeEncounters,
    reward: { gold: n * 12, meat: n },
    epoch,
  }));
}
export function allQuests(g) {
  return [...QUESTS, ...(g.questContracts || [])];
}
export function questById(g, id) {
  return (
    allQuests(g).find((q) => q.id === id) ||
    generatedContracts(g).find((q) => q.id === id)
  );
}

// Main objectives support the player's chosen portal order.
Object.assign(
  QUESTS.find((q) => q.id === "mountain"),
  {
    name: "Another road through Evernight",
    text: "Spend a Boss Sigil with Eldrin to open any new region.",
    location: null,
    target: null,
    check: (g) => g.regionUnlocks.length >= 2,
  },
);
Object.assign(
  QUESTS.find((q) => q.id === "dragon"),
  {
    name: "Two fallen champions",
    text: "Defeat final bosses in two different regions.",
    location: null,
    target: null,
    check: (g) => Object.values(g.regionBossClears).filter(Boolean).length >= 2,
  },
);
Object.assign(
  QUESTS.find((q) => q.id === "jungle"),
  {
    text: "Spend a Boss Sigil to open Amberwild, whenever you choose.",
    location: null,
    target: null,
    check: (g) => g.regionUnlocks.includes("jungle"),
  },
);
Object.assign(
  QUESTS.find((q) => q.id === "gather"),
  {
    text: "Learn the Miner or Lumberjack Profession and equip its dedicated tool.",
  },
);
QUESTS.find((q) => q.id === "bonfire").check = (g) =>
  g.roster.some((h) => h.classNodes.some((id) => id.endsWith(":0")));
