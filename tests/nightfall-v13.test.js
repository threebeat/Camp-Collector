import test from "node:test";
import assert from "node:assert/strict";
import * as D from "../web/data.js";
import * as Night from "../web/nightfall.js";
import * as P from "../web/progression.js";
import * as Camp from "../web/camp.js";
import * as J from "../web/journeys.js";
import { BUILDINGS } from "../web/world.js";
import { seeded } from "../web/engine.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { cleanTeam } from "../worker/api.js";
import { portraitSvg, itemSvg } from "../web/art.js";
const NOW = Date.UTC(2026, 9, 11, 12);
const fresh = () => D.initialGame(seeded(13), NOW);
function funded(guild = false) {
  const g = fresh();
  if (guild)
    g.roster.push(...Array.from({ length: 3 }, () => D.generateHero()));
  g.gold = 10000;
  Camp.addGems(g, 100);
  g.food = 100;
  for (const k in g.materials) g.materials[k] = 100;
  return g;
}

test("a fresh company starts with exactly one Main and two Side quests; rewards cannot replay", () => {
  const g = fresh();
  assert.deepEqual(
    J.activeQuests(g).map((q) => q.category),
    ["Main", "Side", "Side"],
  );
  Camp.nameCamp(g, "Last Light");
  assert.ok(P.claimQuest(g, "settle-in"));
  assert.equal(P.claimQuest(g, "settle-in"), false);
  if (!g.buildings.pantry) {
    g.materials.wood += 5;
    assert.ok(Camp.buildCamp(g, "pantry"));
  }
  assert.ok(Camp.buyFood(g, 1));
  assert.ok(P.claimQuest(g, "stock-pantry"));
  assert.equal(P.claimQuest(g, "bridge"), false);
  const sim = new ExpeditionSimulation(g, NOW);
  sim.g.screen = "market";
  assert.equal(sim.action("acceptQuest", { id: "first-road" }, NOW).ok, false);
  assert.ok(sim.action("acceptQuest", { id: "guild-initiate" }, NOW).ok);
  assert.equal(
    sim.action("acceptQuest", { id: "guild-initiate" }, NOW).ok,
    false,
  );
});
test("accepted generated contracts retain objectives across days and pay once", () => {
  const sim = new ExpeditionSimulation(funded(), NOW);
  sim.g.screen = "market";
  const contract = J.generatedContracts(sim.g)[0];
  assert.ok(sim.action("acceptQuest", { id: contract.id }, NOW).ok);
  sim.g.lifetimeEncounters = contract.targetWins;
  sim.g.lastClock += 86400000;
  const loaded = P.migrateSave(sim.g);
  assert.equal(
    J.questById(loaded, contract.id).targetWins,
    contract.targetWins,
  );
  const before = loaded.gold;
  assert.ok(P.claimQuest(loaded, contract.id));
  assert.equal(loaded.gold, before + contract.reward.gold);
  assert.equal(P.claimQuest(loaded, contract.id), false);
});
test("Guildhall professions preserve class and gear, grant compatible tools and reach rank III", () => {
  const g = funded(true),
    h = g.roster[0],
    old = h.items.map((i) => i.id),
    id = h.id;
  assert.equal(Night.trainProfession(g, h, "Miner"), false);
  g.screen = "market";
  assert.ok(Night.trainProfession(g, h, "Miner"));
  assert.ok(Night.trainProfession(g, h, "Lumberjack"));
  assert.ok(Night.trainProfession(g, h, "Hunter"));
  assert.equal(h.id, id);
  assert.equal(h.classId, "vanguard");
  assert.deepEqual(
    h.items.slice(0, 2).map((i) => i.id),
    old,
  );
  assert.equal(h.items.at(-2).key, "pickaxe");
  assert.equal(h.items.at(-1).key, "axe");
  h.level = 10;
  assert.ok(P.unlockEquipment(g, h, "charm"));
  assert.equal(h.items.at(-2).key, "pickaxe");
  assert.equal(h.items.at(-1).key, "axe");
  for (const key of Night.PROFESSION_NAMES) {
    assert.ok(Night.trainProfession(g, h, key));
    assert.ok(Night.trainProfession(g, h, key));
    assert.equal(
      Night.professionLabel(Night.professions(h).find((a) => a.key === key)),
      key + " III",
    );
    assert.equal(Night.trainProfession(g, h, key), false);
  }
  h.level = 10;
  const clean = cleanTeam(g.roster.slice(0, 3), "profession");
  assert.equal(clean[0].items.at(-2).key, "pickaxe");
  assert.equal(
    clean[0].attributes.filter((a) => D.ATTRIBUTES[a.key]?.profession).length,
    3,
  );
});
test("rank III professions yield bonus stone, ore, wood, ingredients and rare materials deterministically", () => {
  const g = funded(true),
    h = g.roster[0];
  g.screen = "market";
  for (const key of Night.PROFESSION_NAMES)
    for (let n = 0; n < 3; n++) Night.trainProfession(g, h, key);
  const before = structuredClone(g.materials),
    gemBefore = g.gems;
  for (let stage = 0; stage < 40; stage++)
    Night.gatherProfessions(
      g,
      { seed: 13, stage, earned: { kills: stage, gems: 0, materials: {} } },
      [h],
    );
  assert.equal(g.materials.stone - before.stone, 360);
  assert.equal(g.materials.ore - before.ore, 120);
  assert.equal(g.materials.wood - before.wood, 480);
  assert.equal(g.materials.meat - before.meat, 360);
  assert.ok(g.materials.hide > before.hide);
  assert.ok(g.materials.obsidian > before.obsidian);
  assert.ok(g.gems > gemBefore);
});
test("ordinary Attributes cannot be purchased or granted; only the Market clinic lifts them", () => {
  const g = funded(true),
    h = g.roster[0];
  h.attributes.push(D.makeFacet("Cursed"));
  g.essences.Angel = 1;
  assert.equal(P.addAttribute(g, h, "Angel"), false);
  assert.equal(Night.removeAttribute(g, h, "Cursed"), false);
  g.screen = "market";
  const gold = g.gold;
  g.market.night = [
    { id: "old-capsule", kind: "attribute", key: "Angel", gold: 10, gems: 0 },
  ];
  assert.equal(P.buy(g, "old-capsule"), false);
  assert.equal(g.gold, gold);
  assert.ok(Night.removeAttribute(g, h, "Cursed"));
  assert.equal(Night.removeAttribute(g, h, "race:Human"), false);
  assert.ok(Night.trainProfession(g, h, "Hunter"));
  assert.equal(Night.removeAttribute(g, h, "Hunter"), false);
});
test("four armor slots share restrictions, transformation, visible parts and authenticated snapshots", () => {
  const g = funded(),
    h = g.roster[0];
  assert.deepEqual(
    D.armorSlots(h).map((s) => s.key),
    ["head", "chest", "legs", "boots"],
  );
  assert.equal(h.armor.length, 4);
  for (const key of ["head", "chest", "legs", "boots"]) {
    assert.match(portraitSvg(h), new RegExp('data-worn-armor="' + key + '"'));
    assert.match(
      itemSvg(D.makeItem("heavy-" + key)),
      new RegExp('data-armor-art="' + key + '"'),
    );
  }
  g.buildings.armory = 1;
  const boots = Night.craftArmor(g, "heavy-boots");
  assert.ok(boots);
  assert.equal(Night.craftArmor(g, "heavy-night-boots"), false);
  boots.level = 20;
  assert.ok(Camp.evolveObject(g, "armor", boots.id));
  assert.ok(Camp.equipArmor(g, h, boots.id, 3));
  assert.equal(cleanTeam(g.roster, "boots")[0].armor[3].key, "heavy-boots");
  const celestial = D.generateHero({ race: "Celestial", classId: "guardian" });
  assert.equal(
    Night.compatibleSlots(celestial, D.makeItem("heavy-head")).length,
    0,
  );
});
test("storage compatibility and comparisons match actual equip rules and new-item indicators acknowledge per slot", () => {
  const g = funded(),
    h = g.roster[0],
    blade = D.makeItem("ironblade", 30);
  g.inventory.push(blade);
  const targets = Night.compatibleSlots(h, blade);
  assert.deepEqual(
    targets.map((v) => v.index),
    [0],
  );
  assert.ok(Night.comparison(h, blade, 0).some((v) => v.delta > 0));
  assert.ok(Night.equipmentNotice(g, h, 0));
  assert.equal(Night.equipmentNotice(g, h, 1), false);
  Night.markEquipmentSeen(g, h, 0);
  assert.equal(Night.equipmentNotice(g, h, 0), false);
  g.inventory.push(D.makeItem("ironblade"));
  assert.ok(Night.equipmentNotice(g, h, 0));
  assert.ok(P.equip(g, h, blade.id, 0));
});
test("the Kitchen upgrades the Pantry in place, keeps food shopping and makes six meals and special dishes", () => {
  const g = funded();
  assert.equal(BUILDINGS.kitchen.upgradeFrom, "pantry");
  assert.equal(BUILDINGS.kitchen.x, BUILDINGS.pantry.x);
  g.materials.wood += 5;
  assert.ok(Camp.buildCamp(g, "pantry"));
  assert.ok(Camp.buildCamp(g, "kitchen"));
  assert.equal(Camp.buildCamp(g, "kitchen"), false);
  const before = g.food;
  if (!g.buildings.pantry) {
    g.materials.wood += 5;
    assert.ok(Camp.buildCamp(g, "pantry"));
  }
  assert.ok(Camp.buyFood(g, 1));
  assert.ok(Camp.cook(g, "food"));
  assert.equal(g.food, before + 7);
  assert.ok(Camp.cook(g, "stew"));
  assert.ok(Camp.cook(g, "tea"));
  assert.equal(g.consumables.stew, 1);
  assert.equal(g.consumables.tea, 1);
});
test("retired social commands cannot alter characters; legacy records survive migration", () => {
  const g = funded(),
    [h, f] = g.roster;
  h.journal = [{ text: "An old saved memory.", at: NOW }];
  h.bonds[f.id] = 2;
  const sim = new ExpeditionSimulation(g, NOW),
    before = JSON.stringify(sim.g.roster.map((h) => [h.journal, h.bonds]));
  assert.equal(
    sim.action("memory", { id: h.id, text: "New entry" }, NOW).ok,
    false,
  );
  assert.equal(
    sim.action("befriend", { id: h.id, friend: f.id }, NOW).ok,
    false,
  );
  const loaded = P.migrateSave(sim.snapshot().game);
  assert.equal(
    JSON.stringify(loaded.roster.map((h) => [h.journal, h.bonds])),
    before,
  );
  assert.equal(loaded.roster[0].id, h.id);
});
test("neutral arrivals have stable identities, recruit once and dock ships are Legendary or authored Mythical", () => {
  const g = funded();
  Night.refreshVisitors(g);
  const h = g.visitors.find((h) => h.place === "camp") || g.visitors[0];
  g.screen = h.place === "market" ? "market" : "camp";
  assert.ok(Night.hireVisitor(g, h.id));
  assert.equal(Night.hireVisitor(g, h.id), false);
  Night.refreshVisitors(g);
  assert.ok(!g.visitors.some((v) => v.id === h.id));
  g.buildings.dock = 1;
  Night.refreshVisitors(g);
  assert.ok(g.visitors.some((h) => h.place === "dock"));
  let mythical = 0;
  for (let n = 0; n < 60; n++) {
    g.lastClock += 10800000;
    Night.refreshVisitors(g);
    const visitor = g.visitors.find((h) => h.place === "dock");
    assert.ok([3, 4].includes(D.heroRarity(visitor)));
    if (visitor.mythical) mythical++;
  }
  assert.ok(mythical > 0);
});
test("v12 migration preserves identity, collections, checkpoints and paid Outfitter; it adds empty Boots", () => {
  const g = funded(),
    h = g.roster[0];
  Camp.nameCamp(g, "Keep the Fire");
  h.favorite = true;
  h.bonds[g.roster[1].id] = 1;
  h.journal = [{ text: "Remember this.", at: NOW }];
  g.buildings.outfitter = 1;
  P.stageCrossroads(g);
  P.lockRoute(g);
  P.startExpedition(g, { seed: 42 }, NOW);
  const sim = new ExpeditionSimulation(g, NOW);
  sim.advance(NOW + 6000, Infinity);
  const old = sim.snapshot().game;
  for (const hero of [
    ...old.roster,
    ...old.expeditions[0].battleState.units.map((u) => u.hero),
  ])
    hero.armor = hero.armor.slice(0, 3);
  delete old.nightfallRevision;
  delete old.sideQuests;
  delete old.materials.hide;
  const ids = h.items.map((i) => i.id),
    memory = h.journal.map((e) => e.text);
  const loaded = P.migrateSave(old);
  assert.ok(loaded);
  assert.equal(loaded.season, D.GAME_SEASON);
  assert.equal(loaded.roster[0].id, h.id);
  assert.equal(loaded.roster[0].favorite, true);
  assert.deepEqual(
    loaded.roster[0].items.map((i) => i.id),
    ids,
  );
  assert.deepEqual(
    loaded.roster[0].journal.map((e) => e.text),
    memory,
  );
  assert.equal(loaded.roster[0].armor[3], null);
  assert.equal(loaded.buildings.armory, 1);
  assert.equal(loaded.expeditions[0].id, old.expeditions[0].id);
  assert.equal(
    loaded.expeditions[0].battleState.time,
    old.expeditions[0].battleState.time,
  );
});
test("island runs require a dock and provisions, checkpoint all 25 floors and reward authored armor only once", () => {
  const sim = new ExpeditionSimulation(funded(), NOW);
  assert.equal(sim.action("stageIsland", {}, NOW).ok, false);
  sim.g.buildings.dock = 1;
  assert.ok(sim.action("stageIsland", {}, NOW).ok);
  assert.equal(sim.g.lockedJourney.encounters, 25);
  sim.g.food = 0;
  assert.equal(sim.action("launch", {}, NOW).ok, false);
  sim.g.food = 50;
  assert.ok(sim.action("launch", { seed: 47 }, NOW).ok);
  const r = sim.g.expeditions[0];
  assert.equal(r.foodReserved, 9);
  assert.equal(r.roadItinerary.filter((s) => s.boss).length, 5);
  const finish = () => {
    while (r.status === "active") {
      r.phase = "battle";
      P.resolveBattle(
        sim.g,
        r,
        {
          winner: 0,
          time: 20,
          heroes: sim.g.roster.map((h) => ({ id: h.id, hp: D.stats(h).hp })),
        },
        NOW,
      );
      if (r.status === "active") {
        P.useStop(sim.g, r);
        P.nextEncounter(sim.g, r);
      }
    }
  };
  finish();
  assert.equal(sim.g.islandFloor, 25);
  assert.equal(sim.g.inventory.filter((i) => i.mythical).length, 1);
  assert.ok(P.validateSave(sim.g));
  assert.equal(
    cleanTeam(
      [
        {
          ...sim.g.roster[0],
          armor: [
            ...sim.g.roster[0].armor.slice(0, 3),
            sim.g.inventory.find((i) => i.mythical),
          ],
        },
        ...sim.g.roster.slice(1),
      ],
      "mythic",
    )[0].armor[3].mythical,
    true,
  );
  sim.g.screen = "camp";
  sim.g.lastClock += 90001;
  Camp.updateCampClock(sim.g);
  assert.ok(sim.action("stageIsland", {}, sim.g.lastClock).ok);
  assert.ok(sim.action("launch", { seed: 48 }, sim.g.lastClock).ok);
  const again = sim.g.expeditions.at(-1);
  again.stage = 24;
  again.phase = "battle";
  P.resolveBattle(
    sim.g,
    again,
    { winner: 0, time: 20, heroes: [] },
    sim.g.lastClock,
  );
  assert.equal(sim.g.inventory.filter((i) => i.mythical).length, 1);
});
