import test from "node:test";
import assert from "node:assert/strict";
import { createCanvas } from "@napi-rs/canvas";
import { initialGame, makeFacet, gainXp } from "../web/data.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { createNightfallUi } from "../web/nightfall-ui.js";
import {
  campScenery,
  changedScenery,
  paintSceneryRegion,
  paintNightRegion,
  paintFirelight,
  bonfireLight,
  fireFlicker,
} from "../web/camp-background.js";
import { paintCampWater } from "../web/camp-water.js";
import { groundShadow, paintGroundShadow } from "../web/scene-lighting.js";
const now = 1791840000000;
test("removing the duplicate profile lesson migrates old saves once without inventing rewards", () => {
  for (const version of [1, 2, 3]) {
    const g = initialGame();
    g.learning = {
      version,
      stage: "profile",
      beat: 2,
      required: true,
      journeyId: null,
      done: true,
      claimedStages: ["pan", "move"],
    };
    const gold = g.gold,
      sim = new ExpeditionSimulation(g, now);
    assert.equal(sim.g.learning.stage, "crossroads");
    assert.equal(sim.g.learning.version, 4);
    assert.equal(sim.g.learning.done, false);
    assert.equal(sim.g.gold, gold);
    assert.deepEqual(sim.g.learning.claimedStages, ["pan", "move"]);
    assert.equal(
      sim.action("learningContinue", { stage: "profile" }, now).ok,
      false,
    );
    assert.equal(
      new ExpeditionSimulation(sim.snapshot().game, now).g.gold,
      gold,
    );
  }
});
test("profiles present attributes and learned talents separately, without social controls", () => {
  const g = initialGame(),
    h = g.roster[0];
  h.talents.push(makeFacet("training:mind"));
  h.journal = [{ text: "old record", at: now }];
  let html = "";
  const original = globalThis.document;
  globalThis.document = { getElementById: () => ({ dataset: {} }) };
  try {
    createNightfallUi({
      getGame: () => g,
      select: () => {},
      characterSize: () => [1, 1],
      esc: String,
      button: (text, attrs) => `<button ${attrs}>${text}</button>`,
      openModal: (_title, _subtitle, body) => (html = body),
    }).showProfile(h);
    const attributes = html.match(
        /<section class="profile-attributes"[\s\S]*?<\/section>/,
      )[0],
      talents = html.match(
        /<section class="profile-talents"[\s\S]*?<\/section>/,
      )[0];
    assert.match(attributes, /Adaptable/);
    assert.doesNotMatch(attributes, /Mind training/);
    assert.match(talents, /Mind training/);
    assert.doesNotMatch(
      html,
      /Friends|Memories|data-memory|data-befriend|old record/,
    );
    gainXp(h, 1000);
    assert.deepEqual(h.journal, [{ text: "old record", at: now }]);
    assert.deepEqual(h.bonds, {});
  } finally {
    globalThis.document = original;
  }
});
test("construction restores just its local terrain and cached night pixels elsewhere remain unchanged", () => {
  const g = initialGame(),
    before = campScenery(g);
  assert.ok(before.some((t) => t.key === "bonfire"));
  const base = createCanvas(30, 22);
  base.getContext("2d").fillStyle = "#888888";
  base.getContext("2d").fillRect(0, 0, 30, 22);
  const surface = createCanvas(3000, 2200),
    night = createCanvas(3000, 2200),
    rect = { x: 0, y: 0, w: 3000, h: 2200 },
    art = new Map();
  const red = createCanvas(20, 20);
  red.getContext("2d").fillStyle = "#c83b28";
  red.getContext("2d").fillRect(0, 0, 20, 20);
  art.set("tent", red);
  art.set("pantry", red);
  art.set("cabins", red);
  paintSceneryRegion(surface.getContext("2d"), base, before, art, rect);
  paintNightRegion(night.getContext("2d"), surface, rect);
  const far = Buffer.from(
    night.getContext("2d").getImageData(300, 300, 40, 40).data,
  );
  g.buildings.pantry = 1;
  const after = campScenery(g),
    dirty = changedScenery(before, after);
  assert.ok(dirty.length && dirty.every((r) => r.w < 400 && r.h < 400));
  for (const r of dirty) {
    paintSceneryRegion(surface.getContext("2d"), base, after, art, r);
    paintNightRegion(night.getContext("2d"), surface, r);
  }
  assert.deepEqual(
    Buffer.from(night.getContext("2d").getImageData(300, 300, 40, 40).data),
    far,
  );
  assert.ok(
    night.getContext("2d").getImageData(300, 300, 1, 1).data[0] < 60,
    "night ground is substantially darker",
  );
  const light = bonfireLight(g),
    r = Math.ceil(light.r),
    patch = createCanvas(r * 2, r * 2);
  paintFirelight(patch.getContext("2d"), surface, light);
  assert.ok(patch.getContext("2d").getImageData(r, r, 1, 1).data[3] > 180);
  assert.equal(patch.getContext("2d").getImageData(0, 0, 1, 1).data[3], 0);
  const prev = light.r;
  g.campXp = 1000;
  assert.ok(bonfireLight(g).r > prev);
});
test("water moves inside painted banks, avoids the island and pauses for reduced motion", () => {
  const c = createCanvas(1468, 1071),
    ctx = c.getContext("2d");
  paintCampWater(ctx, 1);
  const first = Buffer.from(ctx.getImageData(0, 0, 1468, 1071).data);
  const empty = (x, y, w, h) =>
    assert.ok(ctx.getImageData(x, y, w, h).data.every((v) => v === 0));
  empty(800, 470, 100, 100);
  empty(768, 840, 52, 48);
  empty(5, 5, 200, 200);
  assert.ok(ctx.getImageData(615, 740, 85, 85).data.some((v) => v > 0));
  paintCampWater(ctx, 3);
  assert.notDeepEqual(
    Buffer.from(ctx.getImageData(0, 0, 1468, 1071).data),
    first,
  );
  paintCampWater(ctx, 1, true);
  const paused = Buffer.from(ctx.getImageData(0, 0, 1468, 1071).data);
  paintCampWater(ctx, 3, true);
  assert.deepEqual(
    Buffer.from(ctx.getImageData(0, 0, 1468, 1071).data),
    paused,
  );
});
test("bonfire shadows begin at characters' feet, point away, and fade before their tip", () => {
  const c = createCanvas(700, 700),
    ctx = c.getContext("2d"),
    light = { x: 300, y: 300, r: 430, height: 65 },
    h = { x: 340, y: 410, r: 12, height: 40, id: "hero" };
  const shape = groundShadow(light, h),
    tip = {
      x: (shape[2].x + shape[3].x) / 2,
      y: (shape[2].y + shape[3].y) / 2,
    };
  assert.ok(tip.x > h.x && tip.y > h.y);
  paintGroundShadow(ctx, light, h, 0.64);
  const alpha = (f) =>
    ctx.getImageData(
      Math.round(h.x + (tip.x - h.x) * f),
      Math.round(h.y + (tip.y - h.y) * f),
      1,
      1,
    ).data[3];
  assert.ok(alpha(0.1) > 100);
  assert.ok(alpha(0.1) > alpha(0.6));
  assert.ok(alpha(0.96) < 12);
  assert.equal(groundShadow({ ...light, owner: "hero" }, h), null);
  assert.equal(fireFlicker(1, true), 1);
  assert.notEqual(fireFlicker(1), fireFlicker(2));
});
