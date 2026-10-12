import test from "node:test";
import assert from "node:assert/strict";
import {
  initialGame,
  generateHero,
  stats,
  heroRarity,
  enemyCompany,
} from "../web/data.js";
import { Battle, seeded } from "../web/engine.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { groundShadow } from "../web/scene-lighting.js";
import { barStock } from "../web/tavern.js";
const now = Date.UTC(2026, 9, 12);
function established() {
  const g = initialGame(seeded(47), now);
  g.campNamed = true;
  g.storyPage = 3;
  g.buildings.tavern = g.buildings.guildhall = 1;
  g.gold = 5000;
  g.materials.wood = g.materials.stone = 100;
  return new ExpeditionSimulation(g, now);
}
test("tavern upgrades gate rarity and actual bar purchases, preserving stock across reload", () => {
  let sim = established();
  const act = (name, args = {}) => sim.action(name, args, now);
  assert.ok(act("navigate", { screen: "tavern" }).ok);
  assert.deepEqual(
    sim.g.tavern.stock.map((o) => heroRarity(o.hero)),
    [0, 0, 0, 0, 1, 1],
  );
  assert.equal(barStock(sim.g).length, 2);
  const chosen = sim.g.tavern.stock[5],
    gold = sim.g.gold;
  assert.ok(act("tavernHire", { id: chosen.id }).ok);
  assert.equal(sim.g.roster.at(-1).id, chosen.hero.id);
  assert.equal(sim.g.gold, gold - chosen.gold);
  sim = new ExpeditionSimulation(sim.snapshot().game, now);
  assert.equal(act("tavernHire", { id: chosen.id }).ok, false);
  assert.ok(act("tavernUpgrade").ok);
  assert.deepEqual(
    sim.g.tavern.stock.map((o) => heroRarity(o.hero)),
    [0, 0, 1, 1, 2, 2],
  );
  assert.equal(barStock(sim.g).length, 4);
  const [key, def] = barStock(sim.g)[3],
    before = sim.g.gold,
    owned = sim.g.consumables[key] || 0;
  assert.ok(act("tavernBuy", { key }).ok);
  assert.equal(sim.g.consumables[key], owned + 1);
  assert.equal(sim.g.gold, before - def.price);
  assert.ok(act("tavernUpgrade").ok);
  assert.equal(
    Math.max(...sim.g.tavern.stock.map((o) => heroRarity(o.hero))),
    3,
  );
  assert.equal(act("tavernUpgrade").ok, false);
});
test("Guild services and drops require six owned heroes at the simulation boundary", () => {
  const sim = established(),
    id = sim.g.roster[0].id;
  const act = (name, args) => sim.action(name, args, now).ok;
  for (const n of [3, 4, 5]) {
    while (sim.g.roster.length < n) sim.g.roster.push(generateHero());
    assert.equal(act("dropResident", { id, building: "guildhall" }), false);
    assert.equal(act("guildLesson", { id, guild: "miners" }), false);
    assert.equal(act("guildQuest", { guild: "miners" }), false);
    assert.equal(act("profession", { id, key: "Miner" }), false);
  }
  sim.g.roster.push(generateHero());
  assert.ok(act("dropResident", { id, building: "guildhall" }));
  assert.ok(act("guildLesson", { id, guild: "miners" }));
});
test("movable props retain light state and valid coordinates; inaccessible drops leave saves intact", () => {
  let sim = established();
  assert.ok(
    sim.action("moveProp", { id: "supply-crate", x: 935, y: 700 }, now).ok,
  );
  assert.equal(
    sim.action("moveProp", { id: "supply-crate", x: NaN, y: 1 }, now).ok,
    false,
  );
  assert.equal(
    sim.action("moveProp", { id: "supply-crate", x: 25, y: 25 }, now).ok,
    false,
  );
  assert.ok(sim.action("toggleProp", { id: "lantern" }, now).ok);
  sim = new ExpeditionSimulation(sim.snapshot().game, now);
  assert.deepEqual(
    sim.g.campProps.find((p) => p.id === "supply-crate"),
    { id: "supply-crate", kind: "crate", x: 935, y: 700 },
  );
  assert.equal(sim.g.campProps.find((p) => p.id === "lantern").lit, false);
});
test("ground shadows project away from each light and exclude the owner's own lamp", () => {
  const caster = { id: "hero", x: 200, y: 200, r: 10 };
  for (const source of [
    { x: 80, y: 200, r: 400 },
    { x: 200, y: 80, r: 400 },
    { x: 330, y: 310, r: 400 },
  ]) {
    const poly = groundShadow(source, caster),
      dx = caster.x - source.x,
      dy = caster.y - source.y;
    assert.equal(poly.length, 4);
    for (const p of poly.slice(2))
      assert.ok((p.x - caster.x) * dx + (p.y - caster.y) * dy > 0);
  }
  assert.equal(
    groundShadow({ owner: "hero", x: 210, y: 180, r: 300 }, caster),
    null,
  );
  assert.equal(groundShadow({ x: 900, y: 200, r: 100 }, caster), null);
});
test("scripted battle outcomes survive a mid-battle checkpoint across seeds without changing player max HP", () => {
  for (let seed = 1; seed <= 8; seed++)
    for (const outcome of ["victory", "defeat"]) {
      const party = initialGame(seeded(seed), now).roster,
        hp = party.map((h) => stats(h).hp);
      let b = new Battle(party, 0, seed, null, { tutorialOutcome: outcome });
      b.autoPrepare();
      for (let i = 0; i < 200 && !b.result; i++) b.update(1 / 30);
      b = Battle.fromState(b.toState());
      assert.equal(b.tutorialOutcome, outcome);
      for (let i = 0; i < 800 && !b.result; i++) b.update(1 / 30);
      assert.equal(b.result?.winner, outcome === "victory" ? 0 : 1);
      assert.deepEqual(
        b.units
          .filter(
            (u) => u.originTeam === 0 && !u.summon && !u.pet && !u.structure,
          )
          .map((u) => u.maxHp),
        hp,
      );
    }
});
test("enemy HP reduction applies only to generated opponents", () => {
  const g = initialGame(seeded(47), now),
    before = g.roster.map((h) => stats(h).hp);
  for (const h of enemyCompany(0, {
    seed: 47,
    location: "greenway",
    difficulty: "normal",
    level: 10,
    encounters: 3,
    target: "bridge",
    mode: "journey",
  })) {
    const reduced = stats(h).hp,
      unchanged = stats({ ...h, bonus: { ...h.bonus, hp: 0 } }).hp;
    assert.ok(Math.abs(reduced - unchanged * 0.85) <= 1);
  }
  assert.deepEqual(
    g.roster.map((h) => stats(h).hp),
    before,
  );
});
