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
  sim.action("moveResident", { id, x: 50, y: 53 }, now);
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
    sim.action("moveResident", { id: "missing", x: 50, y: 50 }, now).ok,
    false,
  );
  assert.equal(sim.g.learning.stage, "move");
  assert.ok(sim.action("moveResident", { id, x: 50, y: 53 }, now).ok);
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
  sim.action("moveResident", { id, x: 50, y: 53 }, now);
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
test("a real first expedition settles into Pantry and Journal lessons without replay rewards", () => {
  const sim = opened();
  firstRoad(sim);
  sim.observe({ id: sim.g.learning.journeyId, visible: false }, now);
  sim.advance(now + 600000, Infinity);
  const g = sim.snapshot().game;
  assert.equal(g.expeditions[0].reason, "complete");
  assert.equal(g.learning.stage, "pantry");
  const resumed = new ExpeditionSimulation(g, now + 600000);
  assert.ok(resumed.action("navigate", { screen: "camp" }, now + 600000).ok);
  assert.ok(resumed.action("food", { count: 1 }, now + 600000).ok);
  assert.equal(resumed.g.learning.stage, "journal");
  assert.equal(
    resumed.action("learningEvent", { event: "journal-read" }, now + 600000).ok,
    false,
  );
  resumed.action("learningEvent", { event: "journal" }, now + 600000);
  const before = resumed.g.gold;
  assert.ok(
    resumed.action("learningEvent", { event: "journal-read" }, now + 600000).ok,
  );
  assert.equal(resumed.g.learning.stage, "complete");
  assert.equal(resumed.g.gold, before);
  assert.equal(
    resumed.action("learningEvent", { event: "journal-read" }, now + 600000).ok,
    false,
  );
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
test("the Camp Journal replaces the notice board and residents render saved walk targets", () => {
  const g = fresh(),
    id = g.roster[0].id;
  g.mapPositions.camp[id] = { x: 50, y: 53 };
  const html = createHomesteadUi({
    getGame: () => g,
    esc: (s) => s,
    button: (s, a) => `<button ${a}>${s}</button>`,
  }).campMap();
  assert.match(html, />Journal<\/strong>/);
  assert.doesNotMatch(html, /Quest Board/);
  assert.match(html, /data-world-x="900" data-world-y="742"/);
});
