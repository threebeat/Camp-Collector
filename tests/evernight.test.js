import test from "node:test";
import assert from "node:assert/strict";
import * as D from "../web/data.js";
import * as E from "../web/evernight.js";
import * as P from "../web/progression.js";
import * as C from "../web/camp.js";
import * as J from "../web/journeys.js";
import * as L from "../web/lighting.js";
import { Battle, seeded } from "../web/engine.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { cleanTeam } from "../worker/api.js";
import { CODEX } from "../web/codex.js";
const NOW = Date.UTC(2026, 9, 11, 12);
function fresh() {
  return D.initialGame(seeded(89), NOW);
}
function funded() {
  const g = fresh();
  g.gold = 50000;
  g.food = 200;
  C.addGems(g, 100);
  for (const k in g.materials) g.materials[k] = 200;
  g.materials.bossSigils = 0;
  return g;
}
function field(h) {
  const b = new Battle(
    [h],
    0,
    43,
    [
      D.generateHero({
        race: "Human",
        classId: "guardian",
        level: 60,
        light: null,
      }),
    ],
    { hazards: false },
  );
  b.map.objects = [];
  b.units.forEach((u, i) => {
    u.x = 400 + i * 140;
    u.y = 220;
    u.speed = 0;
    u.attackAt = Infinity;
    u.abilityAt = Infinity;
  });
  return b;
}

test("meals settle twelve-hour boundaries and reloads cannot charge or award XP twice", () => {
  const g = fresh();
  g.food = 20;
  const before = g.roster.map((h) => h.totalXp);
  g.lastClock = NOW + E.MEAL_PERIOD - 1;
  assert.equal(E.consumeMeals(g), false);
  g.lastClock++;
  assert.ok(E.consumeMeals(g));
  assert.equal(g.food, 17);
  assert.ok(
    g.roster.every(
      (h, i) =>
        h.totalXp === before[i] + Math.round(5 * (D.RACES[h.race].xp || 1)),
    ),
  );
  const loaded = new ExpeditionSimulation(structuredClone(g), g.lastClock);
  assert.equal(loaded.g.food, 17);
  assert.ok(
    loaded.g.roster.every(
      (h, i) =>
        h.totalXp === before[i] + Math.round(5 * (D.RACES[h.race].xp || 1)),
    ),
  );
  loaded.g.lastClock += 2 * E.MEAL_PERIOD;
  E.consumeMeals(loaded.g);
  assert.equal(loaded.g.food, 11);
  assert.equal(loaded.g.mealsServed, 9);
  assert.equal(loaded.g.mealAt, NOW + 3 * E.MEAL_PERIOD);
});
test("long absences exhaust finite food in bounded work and never invent meal XP", () => {
  const g = fresh();
  g.food = 4;
  g.lastClock += E.MEAL_PERIOD * 10000;
  const start = performance.now();
  E.consumeMeals(g);
  assert.ok(performance.now() - start < 100);
  assert.equal(g.food, 0);
  assert.equal(g.mealsServed, 4);
  assert.deepEqual(
    g.roster.map((h) => h.totalXp),
    [12, 5, 5],
  );
  assert.ok(g.roster.every((h) => !E.fed(g, h)));
  assert.equal(E.consumeMeals(g), false);
});
test("deployed meal XP is deferred through a combat checkpoint and awarded once on return", () => {
  const s = new ExpeditionSimulation(fresh(), NOW);
  s.action("navigate", { screen: "crossroads" }, NOW);
  s.action("lockRoute", {}, NOW);
  s.action("launch", { seed: 17 }, NOW);
  const r = s.g.expeditions[0];
  s.g.lastClock += E.MEAL_PERIOD;
  E.consumeMeals(s.g);
  assert.ok(s.g.roster.every((h) => h.totalXp === 0 && h.pendingMealXp === 5));
  const saved = s.snapshot().game,
    copy = new ExpeditionSimulation(saved, NOW);
  const run = copy.g.expeditions[0];
  P.endExpedition(copy.g, run, "recall", copy.g.lastClock);
  assert.ok(
    copy.g.roster.every(
      (h) =>
        h.totalXp === Math.round(5 * (D.RACES[h.race].xp || 1)) &&
        h.pendingMealXp === 0,
    ),
  );
  assert.equal(P.endExpedition(copy.g, run, "recall"), false);
  assert.ok(
    copy.g.roster.every(
      (h) => h.totalXp === Math.round(5 * (D.RACES[h.race].xp || 1)),
    ),
  );
});
test("Camp XP follows earned character and gear XP through swaps and reloads", () => {
  const g = funded(),
    h = g.roster[0],
    gear = h.items[0];
  D.gainXp(h, 100);
  D.gainItemXp(gear, 100);
  E.collectCampXp(g);
  const xp = g.campXp;
  assert.ok(xp >= 35);
  E.collectCampXp(g);
  assert.equal(g.campXp, xp);
  g.inventory.push(gear);
  h.items[0] = null;
  const s = new ExpeditionSimulation(structuredClone(g), NOW);
  assert.equal(s.snapshot().game.campXp, xp);
  D.gainItemXp(s.g.inventory.at(-1), 50);
  assert.equal(s.snapshot().game.campXp, xp + 5);
  const before = s.g.campXp;
  assert.ok(C.buildCamp(s.g, "blacksmith"));
  assert.ok(s.g.campXp >= before + 160);
  assert.ok(E.campProgress(s.g).level > 1);
});
test("equipping a lantern changes real target detection; losing it does not reveal hidden foes", () => {
  const h = D.generateHero({ race: "Human", classId: "ranger", light: null }),
    b = field(h),
    u = b.units[0],
    enemy = b.units[1];
  assert.equal(b.pickTarget(u), null);
  assert.equal(L.revealed(b, enemy), false);
  u.hero.light = D.makeItem("hooded-lantern");
  assert.equal(b.pickTarget(u), enemy);
  assert.equal(L.revealed(b, enemy), true);
  u.hero.light = null;
  assert.equal(b.pickTarget(u), null);
  u.hero.race = "Dwarf";
  assert.equal(b.pickTarget(u), enemy);
  u.hero.race = "Human";
  u.hero.attributes.push(D.makeFacet("Vampire"));
  assert.ok(L.vision(u.hero).sight >= 300);
  assert.equal(b.pickTarget(u), enemy);
});
test("light and night vision respect terrain shadows and fog memory survives restore", () => {
  const b = field(D.generateHero({ race: "Dwarf", classId: "ranger" })),
    enemy = b.units[1];
  b.map.objects = [{ type: "ruin", x: 460, y: 180, w: 20, h: 80 }];
  assert.equal(L.revealed(b, enemy), false);
  assert.equal(b.pickTarget(b.units[0]), null);
  b.map.objects = [];
  b.update(1 / 30);
  assert.ok(b.fogSeen.length > 0);
  const copy = Battle.fromState(b.toState());
  assert.deepEqual(copy.fogSeen, b.fogSeen);
  b.units[0].hero.light = null;
  b.units[0].hero.race = "Human";
  assert.equal(L.revealed(b, enemy), false);
  assert.ok(b.fogSeen.length > 0);
});
test("utility light swaps conserve belongings and are blocked for deployed characters", () => {
  const g = funded(),
    h = g.roster[0],
    old = h.light,
    lantern = D.makeItem("witchlight-lantern");
  g.inventory.push(lantern);
  const slots = h.items.map((i) => i.id);
  assert.ok(E.equipLight(g, h, lantern.id));
  assert.ok(g.inventory.includes(old));
  assert.deepEqual(
    h.items.map((i) => i.id),
    slots,
  );
  assert.ok(E.equipLight(g, h, null));
  assert.ok(g.inventory.includes(lantern));
  assert.equal(h.light, null);
  assert.ok(E.equipLight(g, h, old.id));
  P.stageCrossroads(g);
  P.lockRoute(g);
  P.startExpedition(g);
  g.screen = "camp";
  assert.equal(E.equipLight(g, h, lantern.id), false);
  assert.equal(h.light.id, old.id);
  const snapshot = cleanTeam(g.roster, "lamp");
  assert.equal(snapshot[0].light.key, "hooded-lantern");
  assert.equal(snapshot[0].light.lightRadius, undefined);
});
test("global difficulty is boss-gated, combines with routes and leaves departed parties unchanged", () => {
  const g = funded();
  assert.equal(E.setWorldDifficulty(g, "hard"), false);
  g.regionBossClears.greenway = true;
  assert.ok(E.setWorldDifficulty(g, "hard"));
  P.stageCrossroads(g);
  P.setDestination(g, { routeIndex: 1, difficulty: "normal" });
  const d = P.destinationInfo(g);
  assert.equal(d.difficulty, "hard");
  assert.equal(d.reward, 1.5 * d.routeDanger);
  P.lockRoute(g);
  const r = P.startExpedition(g);
  g.screen = "camp";
  assert.ok(E.setWorldDifficulty(g, "normal"));
  assert.equal(r.difficulty, "hard");
  assert.equal(r.reward, d.reward);
  assert.equal(
    P.trialInfo(g, { challengeId: "daily", difficulty: "nightmare" })
      .difficulty,
    "normal",
  );
  assert.equal(E.setWorldDifficulty(g, "nightmare"), false);
  g.regionBossClears.marsh = g.regionBossClears.jungle = true;
  assert.ok(E.setWorldDifficulty(g, "nightmare"));
});
test("each completed boss journey awards one Sigil and portal spending chooses any unopened map", () => {
  const g = funded();
  g.exploration.greenway = J.REGIONS.greenway.nodes.map((n) => n.id);
  P.stageCrossroads(g);
  P.setDestination(g, { target: "grove" });
  P.lockRoute(g);
  let r = P.startExpedition(g);
  P.endExpedition(g, r, "complete");
  assert.equal(g.materials.bossSigils, 1);
  assert.deepEqual(g.regionUnlocks, ["greenway"]);
  assert.equal(P.endExpedition(g, r, "complete"), false);
  g.screen = "camp";
  assert.ok(E.openPortal(g, "jungle"));
  assert.equal(g.materials.bossSigils, 0);
  assert.equal(E.openPortal(g, "jungle"), false);
  assert.equal(E.openPortal(g, "marsh"), false);
  assert.deepEqual(g.exploration.jungle, ["camp"]);
  g.lastClock += 100000;
  C.updateCampClock(g);
  P.stageCrossroads(g);
  P.setDestination(g, { location: "greenway", target: "grove" });
  P.lockRoute(g);
  r = P.startExpedition(g);
  assert.ok(r.encounters > 10);
  P.endExpedition(g, r, "complete");
  assert.equal(g.materials.bossSigils, 1);
  assert.ok(g.portalUnlocked);
});
test("guild lessons and claimed patrols build standing; member goods are exclusive and receipts survive reload", () => {
  const g = funded(),
    h = g.roster[0];
  g.screen = "market";
  g.marketDistrict = "guildhall";
  assert.equal(E.guildBuy(g, "scouts"), false);
  assert.ok(E.guildQuest(g, "scouts"));
  const q = g.questContracts.at(-1);
  assert.equal(E.guildQuest(g, "scouts"), false);
  assert.ok(E.guildLesson(g, h, "scouts"));
  assert.ok(E.guildLesson(g, h, "scouts"));
  assert.ok(h.talents.some((t) => t.key === "Night vision"));
  const offer = E.guildOffer(g, "scouts"),
    gold = g.gold;
  assert.ok(E.guildBuy(g, "scouts"));
  assert.equal(g.gold, gold - offer.gold);
  assert.equal(g.inventory.at(-1).key, "guild-scouts");
  assert.equal(E.guildBuy(g, "scouts"), false);
  assert.ok(
    !P.marketStock(g, "forge").some((o) => D.ITEMS[o.item.key].guildOnly),
  );
  g.lifetimeEncounters += 4;
  g.screen = "quests";
  assert.ok(P.claimQuest(g, q.id));
  assert.equal(E.standing(g, "scouts"), 40);
  assert.equal(P.claimQuest(g, q.id), false);
  const s = new ExpeditionSimulation(structuredClone(g), NOW);
  s.g.screen = "market";
  s.g.marketDistrict = "guildhall";
  assert.equal(E.guildBuy(s.g, "scouts"), false);
  assert.equal(s.g.questContracts.at(-1).acceptedWins, 0);
});
test("all Arena rule variants have their own topology, and neutral mines damage both teams", () => {
  const g = funded(),
    foes = [D.generateHero({ classId: "guardian", race: "Human", level: 60 })];
  for (const id of ["duel", "four", "tigers", "mines"]) {
    const b = new Battle(g.roster, 0, 39, foes, {
      mode: "arena",
      arenaRule: id,
      hazards: false,
    });
    assert.equal(
      new Set(b.units.map((u) => u.team)).size,
      id === "four" ? 4 : 2,
    );
    assert.equal(Battle.fromState(b.toState()).arenaRule, id);
    if (id === "tigers")
      assert.ok(
        b.units
          .filter((u) => u.team === 1)
          .every((u) => u.hazard === "tiger" && u.hero.uncharmable),
      );
    if (id === "mines") {
      assert.equal(b.traps.length, 12);
      b.map.objects = [];
      b.props = [];
      const trap = b.traps[0],
        a = b.units[0],
        enemy = b.units.find((u) => u.team === 1);
      for (const u of [a, enemy]) {
        u.x = trap.x;
        u.y = trap.y;
        u.speed = 0;
        u.attackAt = Infinity;
        u.abilityAt = Infinity;
      }
      const hp = [a.hp, enemy.hp];
      b.update(1 / 30);
      assert.ok(trap.triggered);
      assert.ok(a.hp < hp[0] && enemy.hp < hp[1]);
    }
  }
  const rules = new Set();
  for (let i = 0; i < 40; i++) {
    g.expeditionCount = i;
    rules.add(E.arenaRule(g).id);
  }
  assert.equal(rules.size, 4);
});
test("Arena wagers debit before launch, pay once on victory, and are lost on defeat or recall", () => {
  for (const reason of ["complete", "defeat", "recall"]) {
    const g = funded();
    g.screen = "arena";
    g.staging = g.roster.map((h) => h.id);
    assert.ok(E.setWager(g, 25, "wood", 5));
    const gold = g.gold,
      wood = g.materials.wood,
      r = P.startExpedition(g);
    assert.equal(g.gold, gold - 25);
    assert.equal(g.materials.wood, wood - 5);
    r.phase = "battle";
    assert.equal(P.recordDefeat(g, r, { id: "arena-foe" }), true);
    assert.equal(r.earned.gold, 0);
    assert.ok(P.endExpedition(g, r, reason));
    assert.ok(r.wagerSettled);
    assert.equal(
      g.gold,
      gold -
        25 +
        (reason === "complete"
          ? Math.floor(25 * (r.arenaRule === "four" ? 4 : 2.2))
          : 0),
    );
    assert.equal(g.materials.wood, wood - 5 + (reason === "complete" ? 11 : 0));
    const paid = g.gold;
    assert.equal(P.endExpedition(g, r, reason), false);
    assert.equal(g.gold, paid);
    assert.equal(r.earned.gems, 0);
    assert.equal(g.cosmetics.length, 0);
  }
  const g = fresh();
  g.screen = "arena";
  g.staging = g.roster.map((h) => h.id);
  E.setWager(g, 100);
  assert.equal(P.startExpedition(g), false);
  assert.equal(g.gold, 30);
  assert.equal(g.expeditions.length, 0);
});
test("all twelve monthly collections buy exact canonical cosmetics once and preserve gold and character stats", () => {
  const g = funded();
  g.screen = "shop";
  assert.equal(
    new Set(
      Array.from({ length: 12 }, (_, m) => E.monthlyOffers(g, m))
        .flat()
        .map((o) => o.key),
    ).size,
    36,
  );
  const offer = E.monthlyOffers(g, 9)[0],
    gold = g.gold,
    gems = g.gems,
    stats = D.stats(g.roster[0]);
  assert.ok(E.monthlyBuy(g, offer.id));
  assert.equal(g.gems, gems - offer.gems);
  assert.equal(g.gold, gold);
  assert.equal(E.monthlyBuy(g, offer.id), false);
  assert.equal(E.monthlyBuy(g, "invented"), false);
  g.screen = "market";
  assert.ok(P.applyCosmetic(g, g.roster[0], offer.key));
  assert.deepEqual(D.stats(g.roster[0]), stats);
  assert.equal(cleanTeam(g.roster, "collection")[0].cosmetic, offer.key);
});
test("older current-season camps retain identity, learned branches and checkpoints while gaining Evernight fields", () => {
  const g = funded(),
    h = g.roster[0];
  h.level = 60;
  h.classPath = "breaker";
  h.classNodes = ["breaker:0", "breaker:power", "breaker:power:surge"];
  delete g.evernightRevision;
  delete g.campXp;
  delete g.storyPage;
  g.campNamed = true;
  g.regionBossClears.greenway = true;
  g.portalUnlocked = true;
  h.light = undefined;
  g.waitingRecruits = [D.generateHero({ race: "Dwarf" })];
  const id = h.id,
    s = new ExpeditionSimulation(structuredClone(g), NOW);
  assert.equal(s.g.roster[0].id, id);
  assert.deepEqual(s.g.roster[0].classNodes, [
    "vanguard:foundation",
    ...h.classNodes,
  ]);
  assert.ok(D.validClassNodes(s.g.roster[0]));
  assert.equal(s.g.storyPage, 3);
  assert.equal(s.g.roster.length, 4);
  assert.equal(s.g.waitingRecruits.length, 0);
  assert.equal(s.g.materials.bossSigils, 1);
  assert.ok(s.g.roster[0].light);
  const again = new ExpeditionSimulation(s.snapshot().game, NOW);
  assert.equal(again.g.materials.bossSigils, 1);
  assert.equal(again.g.roster.length, 4);
});
test("Codex groups complete modifier and subclass details into fewer entries", () => {
  const guides = CODEX.filter((e) => e.category.endsWith(" modifiers"));
  assert.equal(guides.length, 9);
  assert.equal(
    guides.reduce((n, e) => n + e.details.length, 0),
    216,
  );
  assert.equal(CODEX.filter((e) => e.category === "Class callings").length, 0);
  assert.ok(
    CODEX.find(
      (e) => e.category === "Classes" && e.key === "bard",
    ).text.includes("Heartstring"),
  );
  assert.ok(CODEX.some((e) => e.name === "Camp level and XP"));
  assert.ok(CODEX.length < 300);
});
