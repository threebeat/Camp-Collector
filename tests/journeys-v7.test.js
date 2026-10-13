import * as Night from "../web/nightfall.js";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  initialGame,
  generateHero,
  makeItem,
  makePet,
  makeFacet,
  stats,
  equipmentSlots,
  armorSlots,
  classPoints,
  classTree,
  characterSize,
  heroRarity,
  allGear,
  RACES,
  CLASSES,
  PETS,
  ITEMS,
} from "../web/data.js";
import { Battle, seeded, distance } from "../web/engine.js";
import * as Camp from "../web/camp.js";
import * as P from "../web/progression.js";
import {
  REGIONS,
  REGION_ORDER,
  visibleNodes,
  regionalRoutes,
  journeyRequirements,
  revealJourney,
} from "../web/journeys.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { portraitSvg, petSvg, itemSvg } from "../web/art.js";
import { loadGame } from "../web/client.js";
import { cleanTeam } from "../worker/api.js";
function launch(g, options = {}, now = g.lastClock) {
  if (g.screen === "crossroads" && g.destination.mode === "journey")
    P.lockRoute(g);
  return P.startExpedition(g, options, now);
}
const NOW = Date.UTC(2026, 9, 9, 12),
  fresh = () => initialGame(seeded(41), NOW);
const fighter = (classId = "vanguard", opts = {}) =>
  generateHero({ classId, race: "Human", ...opts }, seeded(19));
const funded = () => {
  const g = fresh();
  g.buildings.blacksmith = 1;
  g.buildings.armory = 1;
  g.buildings.archaeology = 1;
  g.gold = 5000;
  Camp.addGems(g, 100);
  for (const key of Object.keys(g.materials)) g.materials[key] = 100;
  return g;
};
const clear = (g, r) => {
  while (r.status === "active") {
    r.phase = "battle";
    P.resolveBattle(g, r, { winner: 0, time: 30, heroes: [] }, NOW);
    if (r.status === "active" && r.phase === "interlude") {
      P.useStop(g, r);
      P.nextEncounter(g, r);
    }
  }
};
const openMap = (g, loc) => {
  g.regionUnlocks = [...REGION_ORDER];
  g.exploration[loc] = REGIONS[loc].nodes.map((n) => n.id);
};
function nearBattle(h) {
  const b = new Battle([h], 0, 23, [
    fighter("guardian", { level: 40 }),
    fighter("guardian", { level: 40 }),
  ]);
  b.map.objects = [];
  b.props = [];
  b.units.forEach((u, i) => {
    u.x = 500 + i * 22;
    u.y = 220;
  });
  return b;
}

test("class points alternate talents and subclasses at five milestones and lock sibling choices", () => {
  const g = funded(),
    h = fighter("mage", { level: 9 });
  g.roster.push(h);
  const identity = [h.id, h.name, h.race, h.items[0].id];
  assert.equal(classPoints(h), 0);
  assert.equal(Camp.chooseClassNode(g, h, "gravity:0"), false);
  const nodes = [
    "mage:foundation",
    "gravity:0",
    "gravity:control",
    "gravity:control:shelter",
    "gravity:control:shelter:mastery",
  ];
  for (const [i, level] of [10, 20, 40, 60, 80].entries()) {
    h.level = level;
    assert.equal(classPoints(h), 1);
    assert.ok(Camp.chooseClassNode(g, h, nodes[i]));
    assert.equal(Camp.chooseClassNode(g, h, "ember:0"), false);
    assert.equal(classPoints(h), 0);
  }
  assert.equal(h.classNodes.length, 5);
  h.level = 100;
  assert.equal(classPoints(h), 0);
  assert.equal(Camp.chooseClassNode(g, h, "gravity:power"), false);
  assert.equal(Camp.chooseClassNode(g, h, "gravity:control:surge"), false);
  assert.deepEqual([h.id, h.name, h.race, h.items[0].id], identity);
  assert.equal(g.gems, 100);
  assert.ok(
    classTree(h)
      .filter((p) => !["gravity", "foundation"].includes(p.id))
      .every((p) => p.nodes.every((n) => n.locked)),
  );
});

test("class branches change actual spells, shielding, summons, and single-target versus area combat", () => {
  for (const path of ["breaker", "duelist"]) {
    const h = fighter("vanguard", {
        level: 20,
        classPath: path,
        classNodes: [path + ":0"],
      }),
      b = nearBattle(h);
    b.cast(b.units[0], "vanguard");
    const damage = b.units.slice(1).map((u) => u.maxHp - u.hp);
    assert.ok(damage[0] > 0);
    assert.equal(damage[1] > 0, path === "breaker");
  }
  const h = fighter("healer", {
      level: 20,
      classPath: "protector",
      classNodes: ["protector:0"],
    }),
    b = nearBattle(h);
  b.cast(b.units[0], "healer");
  assert.ok(b.units[0].shield > 0);
  assert.equal(b.zones.length, 0);
  for (const path of ["pack", "grove"]) {
    const b = nearBattle(
      fighter("summoner", {
        level: 20,
        classPath: path,
        classNodes: [path + ":0"],
      }),
    );
    b.cast(b.units[0], "summoner");
    const summons = b.units.filter((u) => u.summon);
    assert.equal(summons.length, path === "grove" ? 1 : 2);
    assert.ok(summons.every((u) => u.maxHp > 50));
  }
  const gravity = nearBattle(
    fighter("mage", {
      level: 20,
      classPath: "gravity",
      classNodes: ["gravity:0"],
    }),
  );
  gravity.cast(gravity.units[0], "mage");
  assert.equal(gravity.zones[0].element, "gravity");
  const ward = nearBattle(
    fighter("alchemist", {
      level: 20,
      classPath: "sentinel",
      classNodes: ["sentinel:0"],
    }),
  );
  ward.cast(ward.units[0], "artillery");
  assert.ok(ward.units[0].shield > 0);
  assert.equal(ward.projectiles.length, 0);
  const pyre = nearBattle(
    fighter("alchemist", {
      level: 20,
      classPath: "adept",
      classNodes: ["adept:0"],
    }),
  );
  pyre.cast(pyre.units[0], "artillery");
  assert.ok(pyre.fires.length > 0);
  const phantom = nearBattle(
    fighter("assassin", {
      level: 20,
      classPath: "phantom",
      classNodes: ["phantom:0"],
    }),
  );
  phantom.cast(phantom.units[0], "assassin");
  assert.equal(phantom.units[0].stealthUntil, 5);
});
test("weapons and companions transform through three forms without replacing their identity or XP", () => {
  const g = funded(),
    h = g.roster[0],
    w = h.items[0];
  w.level = 19;
  assert.equal(Camp.evolveObject(g, "weapon", w.id), false);
  w.level = 20;
  w.xp = 11;
  const before = ITEMS[w.key].attack,
    original = itemSvg(w),
    id = w.id;
  assert.ok(Camp.evolveObject(g, "weapon", id));
  assert.equal(w.evolution, 1);
  assert.equal(w.id, id);
  assert.equal(w.xp, 11);
  assert.notEqual(itemSvg(w), original);
  assert.equal(g.gems, 96);
  assert.equal(Camp.evolveObject(g, "weapon", id), false);
  w.level = 50;
  g.materials.obsidian = 4;
  assert.equal(Camp.evolveObject(g, "weapon", id), false);
  g.materials.obsidian = 5;
  assert.ok(Camp.evolveObject(g, "weapon", id));
  assert.equal(g.materials.obsidian, 0);
  w.level = 80;
  assert.ok(Camp.evolveObject(g, "weapon", id));
  assert.equal(w.evolution, 3);
  assert.equal(Camp.evolveObject(g, "weapon", id), false);
  const pet = makePet("fox", 20),
    art = petSvg(pet);
  h.companion = pet;
  assert.ok(Camp.evolveObject(g, "pet", pet.id));
  assert.notEqual(petSvg(pet), art);
  assert.equal(pet.key, "fox");
  assert.equal(Camp.evolveObject(g, "weapon", h.armor[0].id), false);
});
test("armor has separate class-weight slots, Celestial crowns replace helmets, and race dictates size", () => {
  const g = funded(),
    h = fighter("mage", { race: "Celestial" });
  g.roster.push(h);
  assert.equal(h.armor[0], null);
  assert.equal(armorSlots(h)[0].allowed, false);
  const helmet = makeItem("light-head"),
    heavy = makeItem("heavy-chest"),
    robe = makeItem("starRobe");
  g.inventory.push(helmet, heavy, robe);
  assert.equal(Camp.equipArmor(g, h, helmet.id, 0), false);
  assert.equal(Camp.equipArmor(g, h, heavy.id, 1), false);
  const previous = h.armor[1],
    slots = equipmentSlots(h).length;
  assert.ok(Camp.equipArmor(g, h, robe.id, 1));
  assert.ok(g.inventory.includes(previous));
  assert.equal(equipmentSlots(h).length, slots);
  assert.ok(
    portraitSvg(h).includes("Celestial") ||
      portraitSvg(h).includes("portrait-body"),
  );
  const sizes = ["Fae", "Kobold", "Human", "Orc", "Ent"].map(
    (race) =>
      characterSize(
        fighter("vanguard", { race, appearance: { height: 1, width: 1 } }),
      )[0],
  );
  assert.ok(sizes.every((s, i) => !i || s > sizes[i - 1]));
});
test("Vampire and Zombie are Attributes of any race; professions are Attributes and training remains a Talent", () => {
  assert.equal(RACES.Vampire, undefined);
  assert.equal(RACES.Zombie, undefined);
  assert.equal(CLASSES.miner, undefined);
  assert.equal(CLASSES.lumberjack, undefined);
  for (const race of ["Elf", "Orc", "Fae"]) {
    const plain = fighter("vanguard", { race }),
      h = fighter("vanguard", { race, attributes: ["Zombie", "Vampire"] });
    assert.equal(h.race, race);
    assert.ok(stats(h).speed < stats(plain).speed);
    assert.ok(stats(h).vitality > stats(plain).vitality);
  }
  const g = funded(),
    h = g.roster[0];
  g.screen = "market";
  while (g.roster.length < 6) g.roster.push(generateHero());
  assert.ok(Night.trainProfession(g, h, "Miner"));
  g.screen = "camp";
  assert.equal(h.classId, "vanguard");
  assert.equal(equipmentSlots(h).at(-1).types[0], "mining");
  const r = { seed: 7, stage: 0, earned: { kills: 0, gems: 0, materials: {} } };
  h.items[h.items.length - 1] = null;
  g.materials.stone = 0;
  g.materials.ore = 0;
  Night.gatherProfessions(g, r, [h]);
  assert.equal(g.materials.stone, 0);
  const tool = makeItem("pickaxe");
  g.inventory.push(tool);
  assert.ok(P.equip(g, h, tool.id, h.items.length - 1));
  Night.gatherProfessions(g, r, [h]);
  assert.equal(g.materials.stone, 3);
  assert.equal(g.materials.ore, 1);
  assert.equal(
    h.attributes.some((a) => a.key === "Miner"),
    true,
  );
});
test("local maps expose adjacent locations through fog, offer multiple road routes, and keep exploration after reload", () => {
  const g = fresh();
  assert.ok(visibleNodes(g, "greenway").has("clearing"));
  assert.ok(visibleNodes(g, "greenway").size >= 4);
  assert.ok(!visibleNodes(g, "greenway").has("grove"));
  assert.equal(regionalRoutes(g, "greenway", "grove").length, 0);
  assert.deepEqual(REGION_ORDER, [
    "greenway",
    "marsh",
    "volcano",
    "cinder",
    "jungle",
  ]);
  assert.equal(
    new Set(
      REGION_ORDER.map((loc) =>
        JSON.stringify(REGIONS[loc].nodes.map((n) => [n.x, n.y])),
      ),
    ).size,
    5,
  );
  openMap(g, "greenway");
  const routes = regionalRoutes(g, "greenway", "grove");
  assert.equal(routes.length, 3);
  for (const r of routes) {
    assert.equal(r.itinerary.length, r.combats);
    assert.equal(r.events, r.edges.length - 1);
    assert.equal(
      r.combats,
      r.edges.reduce((n, e) => n + e.combat, 0),
    );
  }
  g.exploration.greenway = ["camp", "clearing", "bridge", "ruins"];
  g.campaign.greenway = 3;
  g.trackedQuest = null;
  const loaded = P.migrateSave(g);
  assert.deepEqual(loaded.exploration, g.exploration);
  assert.equal(loaded.trackedQuest, null);
});
test("journeys require primary gear and food for long roads, while the first road is provision-free", () => {
  const g = fresh();
  P.stageCrossroads(g);
  let d = P.destinationInfo(g);
  assert.equal(journeyRequirements(g, d, g.roster).food, 0);
  openMap(g, "greenway");
  P.setDestination(g, {
    mode: "journey",
    location: "greenway",
    target: "grove",
    routeIndex: 2,
  });
  d = P.destinationInfo(g);
  const req = journeyRequirements(g, d, g.roster);
  assert.ok(req.food >= 3);
  g.food = 0;
  assert.equal(launch(g), false);
  g.food = req.food;
  const item = g.roster[0].items[0];
  g.roster[0].items[0] = null;
  assert.equal(launch(g), false);
  g.roster[0].items[0] = item;
  const r = launch(g);
  assert.ok(r);
  assert.equal(g.food, 0);
  assert.equal(r.foodReserved, req.food);
});
test("road encounter schedules visit exactly their mapped stops and unlock regions only by reaching their exit", () => {
  const g = funded();
  openMap(g, "greenway");
  P.stageCrossroads(g);
  P.setDestination(g, { mode: "journey", target: "bridge" });
  const r = launch(g);
  assert.equal(r.encounters, 4);
  r.phase = "battle";
  P.resolveBattle(g, r, { winner: 0, time: 30, heroes: [] });
  assert.equal(r.phase, "interlude");
  assert.equal(r.stop.type, "road");
  assert.ok(P.nextEncounter(g, r));
  assert.equal(r.stage, 1);
  r.phase = "battle";
  P.resolveBattle(g, r, { winner: 0, time: 30, heroes: [] });
  assert.equal(r.phase, "interlude");
  assert.equal(r.stop.type, r.roadItinerary[1].rest);
  assert.ok(P.useStop(g, r));
  assert.ok(P.nextEncounter(g, r));
  clear(g, r);
  assert.equal(g.journeyClears["greenway:bridge"], 1);
  assert.equal(g.companions[0].key, "fox");
  const map = fresh();
  map.exploration.greenway = [
    "camp",
    "clearing",
    "bridge",
    "firefly",
    "court",
    "ruins",
  ];
  map.campaign.greenway = 5;
  assert.deepEqual(P.migrateSave(map).regionUnlocks, ["greenway"]);
  revealJourney(map, {
    location: "greenway",
    target: "grove",
    routeIds: ["camp", "clearing", "bridge", "court", "grove"],
  });
  assert.deepEqual(map.regionUnlocks, ["greenway"]);
  assert.equal(map.materials.bossSigils, 1);
  assert.ok(map.portalUnlocked);
});
test("quests award progression resources once and tracked destinations persist", () => {
  const g = fresh();
  assert.equal(P.claimQuest(g, "bridge"), false);
  assert.equal(P.claimQuest(g, "first-road"), false);
  g.journeyClears["greenway:clearing"] = 1;
  const gold = g.gold;
  assert.ok(P.claimQuest(g, "first-road"));
  assert.equal(g.gold, gold + 45);
  assert.equal(g.materials.wood, 0);
  assert.equal(P.claimQuest(g, "first-road"), false);
  assert.ok(P.trackQuest(g, "bridge"));
  assert.equal(g.trackedQuest, "bridge");
  assert.equal(P.migrateSave(g).trackedQuest, "bridge");
});
test("the jungle has obstructive grass and ruins, its dinosaur foes and the volcanic dragon have distinct sizes", () => {
  const g = funded();
  openMap(g, "jungle");
  P.stageCrossroads(g);
  P.setDestination(g, { mode: "journey", location: "jungle", target: "nest" });
  const r = launch(g);
  const sim = new ExpeditionSimulation(g, NOW),
    b = sim.battle(sim.g.expeditions[0]);
  assert.ok(b.map.grass.length >= 10);
  assert.ok(b.map.objects.some((p) => p.type === "ruin"));
  assert.ok(b.units.filter((u) => u.team === 1).every((u) => u.hero.creature));
  const u = b.units[0],
    patch = b.map.grass[0];
  u.x = patch.x;
  u.y = patch.y;
  assert.ok(b.effectiveRange({ ...u, flying: false }) < u.range);
  assert.equal(b.effectiveRange({ ...u, flying: true }), u.range);
  const v = funded();
  openMap(v, "volcano");
  P.stageCrossroads(v);
  P.setDestination(v, {
    mode: "journey",
    location: "volcano",
    target: "caldera",
  });
  const dragonRun = launch(v);
  dragonRun.stage = dragonRun.encounters - 1;
  const vs = new ExpeditionSimulation(v, NOW),
    dragon = vs
      .battle(vs.g.expeditions[0])
      .units.find((u) => u.creature === "dragon");
  assert.ok(dragon);
  assert.equal(heroRarity(dragon.hero), 2);
  assert.ok(characterSize(dragon.hero)[0] > 2);
  assert.ok(dragon.hero.bonus.strength >= 12);
});
test("nesting destinations yield eggs; two dinosaur companions hatch with one rideable and neither can be forged", () => {
  const g = funded();
  openMap(g, "jungle");
  P.stageCrossroads(g);
  P.setDestination(g, { mode: "journey", location: "jungle", target: "nest" });
  clear(g, launch(g));
  assert.equal(g.eggs, 2);
  g.screen = "camp";
  assert.ok(Camp.hatchEgg(g, "raptor"));
  assert.ok(Camp.hatchEgg(g, "hadrosaur"));
  assert.equal(g.eggs, 0);
  assert.equal(g.companions.length, 2);
  assert.equal(Camp.hatchEgg(g, "raptor"), false);
  const h = fighter("vanguard", { companion: g.companions[1] }),
    b = nearBattle(h);
  assert.ok(b.units[0].mounted);
  assert.equal(PETS.raptor.mode, "attack");
  assert.equal(PETS.hadrosaur.mode, "mount");
  g.screen = "market";
  assert.equal(P.forge(g, "pet", "raptor"), false);
  assert.ok(
    P.marketStock(g, "menagerie").every(
      (o) => !["raptor", "hadrosaur"].includes(o.pet?.key),
    ),
  );
});
test("finite mana limits healing casts and healer teams resolve without an endless healing stalemate", () => {
  const h = fighter("healer", { race: "Celestial", level: 30 }),
    b = nearBattle(h),
    u = b.units[0];
  u.hp = u.maxHp * 0.3;
  let casts = 0;
  while (b.cast(u, "healer")) casts++;
  assert.ok(casts > 0 && casts < 20);
  assert.ok(u.mana < 16);
  const saved = Battle.fromState(b.toState());
  assert.equal(saved.units[0].mana, u.mana);
  const duel = new Battle([h, h], 0, 24, [
    fighter("healer", { race: "Nereid", level: 30 }),
    fighter("healer", { race: "Myconid", level: 30 }),
  ]);
  duel.autoPrepare();
  for (let i = 0; i < 10800 && !duel.result; i++) duel.update(1 / 30);
  assert.ok(duel.result);
  assert.ok(duel.result.time < 360);
  assert.ok(duel.units.every((u) => u.mana >= 0));
});
test("historical v6 fixture cannot restore a previous season", () => {
  const old = JSON.parse(
    readFileSync(new URL("./fixtures/v6-save.json", import.meta.url)),
  );
  assert.equal(P.migrateSave(old), null);
  const sim = new ExpeditionSimulation(old, NOW);
  assert.equal(sim.g.roster.length, 3);
  assert.equal(sim.g.gold, 30);
  assert.equal(sim.g.expeditions.length, 0);
});

test("shared challenge snapshots carry valid armor, Talents, class nodes and evolved companions", () => {
  const g = funded(),
    h = g.roster[0];
  h.level = 40;
  Camp.chooseClassNode(g, h, "vanguard:foundation");
  Camp.chooseClassNode(g, h, "breaker:0");
  Camp.chooseClassNode(g, h, "breaker:power");
  g.screen = "market";
  while (g.roster.length < 6) g.roster.push(generateHero());
  assert.ok(Night.trainProfession(g, h, "Miner"));
  g.screen = "camp";
  h.items.at(-1);
  h.items[h.items.length - 1] = makeItem("pickaxe", 10, 1);
  h.companion = makePet("raptor", 20, 2);
  Camp.evolveObject(g, "pet", h.companion.id);
  const cleaned = cleanTeam(g.roster.slice(0, 3), "test-snapshot");
  assert.equal(cleaned[0].classNodes.length, 3);
  assert.equal(cleaned[0].classPath, "breaker");
  assert.equal(
    cleaned[0].attributes.find((a) => a.key === "Miner").key,
    "Miner",
  );
  assert.equal(cleaned[0].items.at(-1).key, "pickaxe");
  assert.equal(cleaned[0].armor.length, 4);
  assert.equal(cleaned[0].companion.evolution, 1);
  const bad = structuredClone(g.roster.slice(0, 3));
  bad[0].classNodes = ["breaker:0", "duelist:1"];
  assert.throws(() => cleanTeam(bad, "invalid"), /Invalid class branch/);
});
test("starting trio succeeds on the opening road across varied seeded battles", () => {
  let wins = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const sim = new ExpeditionSimulation(fresh(), NOW);
    sim.action("navigate", { screen: "camp" }, NOW);
    sim.action("navigate", { screen: "crossroads" }, NOW);
    sim.action("lockRoute", {}, NOW);
    assert.ok(sim.action("launch", { seed }, NOW).ok);
    sim.advance(NOW + 600000, Infinity);
    if (sim.g.expeditions[0].reason === "complete") wins++;
  }
  assert.ok(
    wins >= 18,
    "Expected at least 90% tutorial success, got " + wins + "/20.",
  );
});

test("browser loading removes a historical v6 save and starts fresh", () => {
  const values = new Map([
    [
      "camp-collector-v6",
      readFileSync(new URL("./fixtures/v6-save.json", import.meta.url), "utf8"),
    ],
  ]);
  assert.equal(
    loadGame({
      getItem: (k) => values.get(k),
      removeItem: (k) => values.delete(k),
    }),
    null,
  );
  assert.equal(values.size, 0);
});
