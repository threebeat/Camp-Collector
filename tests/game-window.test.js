import test from "node:test";
import assert from "node:assert/strict";
import { initialGame } from "../web/data.js";
import { seeded } from "../web/engine.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { validateSave } from "../web/progression.js";
import { settleLearning } from "../web/onboarding.js";
import { createHomesteadUi } from "../web/homestead-ui.js";
const now = Date.UTC(2026, 9, 12),
  fresh = () => initialGame(seeded(47), now);
function opened() {
  const sim = new ExpeditionSimulation(fresh(), now);
  sim.action("openingNext", {}, now);
  sim.action("openingNext", {}, now);
  assert.ok(sim.action("finishOpening", { name: "Ember House" }, now).ok);
  return sim;
}
function firstRoad(sim) {
  const id = sim.g.roster[0].id;
  sim.action("learningEvent", { event: "pan" }, now);
  sim.action("dropResident", { id, building: "tent" }, now);
  sim.action("learningEvent", { event: "profile", id }, now);
  sim.action("navigate", { screen: "crossroads" }, now);
  assert.ok(sim.action("lockRoute", {}, now).ok);
  assert.ok(sim.action("launch", {}, now).ok);
}
test("opening beats persist, naming is bounded and cannot bypass the fire dialogue", () => {
  const sim = new ExpeditionSimulation(fresh(), now);
  assert.equal(sim.g.learning.stage, "intro");
  assert.equal(sim.action("finishOpening", {}, now).ok, false);
  sim.action("openingNext", {}, now);
  const restored = new ExpeditionSimulation(sim.snapshot().game, now);
  assert.equal(restored.g.learning.beat, 1);
  restored.action("openingNext", {}, now);
  assert.ok(restored.action("finishOpening", { name: "" }, now).ok);
  assert.equal(restored.g.campName, "Last Light");
  assert.equal(restored.g.learning.stage, "pan");
  assert.equal(restored.g.storyPage, 3);
});
test("learning requires ordered actions and genuine roster identities", () => {
  const sim = opened(),
    id = sim.g.roster[0].id;
  assert.equal(
    sim.action("learningEvent", { event: "profile", id }, now).ok,
    false,
  );
  assert.ok(sim.action("learningEvent", { event: "pan" }, now).ok);
  assert.equal(
    sim.action("dropResident", { id: "missing", building: "tent" }, now).ok,
    false,
  );
  assert.equal(sim.g.learning.stage, "move");
  assert.ok(sim.action("dropResident", { id, building: "tent" }, now).ok);
  assert.equal(sim.g.learning.stage, "profile");
  assert.equal(
    sim.action("learningEvent", { event: "profile", id: "missing" }, now).ok,
    false,
  );
  assert.ok(sim.action("learningEvent", { event: "profile", id }, now).ok);
});
test("the required first journey cannot be skipped, changed to a trial, unstaged or recalled", () => {
  const sim = opened(),
    id = sim.g.roster[0].id;
  assert.equal(
    sim.action("settings", { key: "tutorial", value: false }, now).ok,
    false,
  );
  assert.equal(sim.action("navigate", { screen: "arena" }, now).ok, false);
  assert.equal(
    sim.action("stageTrial", { challengeId: "daily" }, now).ok,
    false,
  );
  sim.action("learningEvent", { event: "pan" }, now);
  sim.action("dropResident", { id, building: "tent" }, now);
  sim.action("learningEvent", { event: "profile", id }, now);
  sim.action("navigate", { screen: "crossroads" }, now);
  assert.equal(sim.g.destination.target, "clearing");
  assert.equal(sim.action("destination", { target: "grove" }, now).ok, false);
  assert.equal(sim.action("destination", { routeIndex: 1 }, now).ok, false);
  sim.action("lockRoute", {}, now);
  assert.equal(sim.action("stage", { id }, now).ok, false);
  sim.action("launch", {}, now);
  const r = sim.g.expeditions[0];
  assert.equal(sim.g.learning.journeyId, r.id);
  assert.equal(r.auto, true);
  assert.equal(sim.action("recall", { id: r.id }, now).ok, false);
  assert.equal(sim.action("launch", {}, now).ok, false);
});
test("a real two-road tutorial gives a win, a loss, free choice, construction and a Fernbridge goal", () => {
  let sim = opened();
  firstRoad(sim);
  sim.advance(now + 600000, Infinity);
  let g = sim.snapshot().game;
  assert.equal(g.expeditions[0].reason, "complete");
  assert.equal(g.learning.stage, "quests");
  sim = new ExpeditionSimulation(g, now + 600000);
  const at = now + 600000;
  const action = (name, args = {}) => {
    const r = sim.action(name, args, at);
    assert.ok(r.ok, name);
    return r;
  };
  action("navigate", { screen: "camp" });
  action("learningEvent", { event: "journal" });
  assert.equal(
    sim.action("learningEvent", { event: "journal-read" }, at).ok,
    false,
  );
  action("quest", { id: "first-road" });
  action("learningEvent", { event: "journal-read" });
  action("navigate", { screen: "crossroads" });
  assert.equal(sim.g.destination.target, "bridge");
  action("lockRoute");
  action("launch");
  sim.advance(at + 600000, Infinity);
  g = sim.snapshot().game;
  assert.equal(g.expeditions[1].reason, "defeat");
  assert.equal(g.learning.stage, "defeat");
  assert.equal(g.journeyClears["greenway:bridge"], undefined);
  assert.equal(g.roster.length, 3);
  assert.equal(g.buildings.tavern, 1);
  action("navigate", { screen: "camp" });
  action("learningEvent", { event: "defeat-read" });
  action("navigate", { screen: "tavern" });
  assert.equal(sim.g.tavern.stock.length, 6);
  assert.ok(sim.g.tavern.stock.every((o) => o.hero.level < 20 && o.gold === 0));
  const chosen = sim.g.tavern.stock[4],
    before = sim.g.gold;
  action("tavernHire", { id: chosen.id });
  assert.equal(sim.g.roster.at(-1).id, chosen.hero.id);
  assert.equal(sim.g.gold, before);
  assert.equal(sim.action("tavernHire", { id: chosen.id }, at).ok, false);
  assert.equal(sim.g.learning.stage, "build");
  action("navigate", { screen: "camp" });
  action("construct", { key: "pantry" });
  assert.equal(sim.g.gold, before - 5);
  action("food", { count: 1 });
  action("learningEvent", { event: "journal" });
  action("learningEvent", { event: "journal-read" });
  assert.equal(sim.g.learning.stage, "complete");
  assert.equal(sim.g.trackedQuest, "bridge");
  assert.ok(validateSave(sim.snapshot().game));
});
test("a defeated tutorial company can recover and retry instead of trapping the save", () => {
  const sim = opened();
  firstRoad(sim);
  const r = sim.g.expeditions[0];
  r.status = "returned";
  r.reason = "defeat";
  settleLearning(sim.g);
  assert.equal(sim.g.learning.stage, "crossroads");
  assert.equal(sim.g.learning.journeyId, null);
});
test("existing Camps and active checkpoints enter directly and old page locations migrate", () => {
  for (const screen of ["camp", "expeditions", "quests"]) {
    const g = fresh();
    g.campNamed = true;
    g.storyPage = 3;
    g.campName = "Kept home";
    g.screen = screen;
    const ids = g.roster.map((h) => h.id),
      sim = new ExpeditionSimulation(g, now);
    assert.equal(sim.g.learning.stage, "complete");
    assert.deepEqual(
      sim.g.roster.map((h) => h.id),
      ids,
    );
    assert.equal(sim.g.campName, "Kept home");
    assert.equal(
      sim.g.screen,
      screen === "expeditions" ? "crossroads" : "camp",
    );
    assert.ok(validateSave(sim.snapshot().game));
  }
  const bad = fresh();
  bad.learning = {
    version: 1,
    stage: "invented",
    beat: 0,
    required: true,
    journeyId: null,
  };
  assert.equal(validateSave(bad), null);
});
test("the camp uses a raster map, three built landmarks and a pantry site; Journal stays in the technical bar", () => {
  const g = fresh(),
    id = g.roster[0].id;
  g.mapPositions.camp[id] = { x: 50, y: 53 };
  const html = createHomesteadUi({
    getGame: () => g,
    esc: (s) => s,
    button: (s, a) => `<button ${a}>${s}</button>`,
  }).campMap();
  assert.doesNotMatch(html, /data-building="questboard"/);
  assert.match(html, /data-prerendered-map="camp"/);
  assert.match(html, /Pantry site/);
  assert.doesNotMatch(html, /Quest Board/);
  assert.match(html, /data-world-x="900" data-world-y="742"/);
});
