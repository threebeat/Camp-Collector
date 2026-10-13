import test from "node:test";
import assert from "node:assert/strict";
import { initialGame } from "../web/data.js";
import { seeded } from "../web/engine.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import * as Camp from "../web/camp.js";
import * as P from "../web/progression.js";
import {
  CAMP_VENDORS,
  normalizeCampWorld,
  revealedCampAreas,
} from "../web/camp-world.js";
import { WorldCamera, attachCameraInput } from "../web/camera.js";
import { createHomesteadUi } from "../web/homestead-ui.js";
import { SceneLighting } from "../web/scene-lighting.js";
import { createCanvas } from "@napi-rs/canvas";
const now = Date.UTC(2026, 9, 12),
  fresh = () => initialGame(seeded(47), now);
test("a new Market requires level, materials and construction; failed visits or builds spend nothing", () => {
  const g = fresh(),
    gold = g.gold;
  assert.equal(P.visitMarket(g, []), false);
  assert.equal(Camp.buildCamp(g, "market"), false);
  assert.equal(g.gold, gold);
  g.gold = 10000;
  for (const k in g.materials) g.materials[k] = 500;
  assert.equal(Camp.buildCamp(g, "market"), false);
  g.campXp = 100;
  assert.ok(Camp.buildCamp(g, "market"));
  assert.ok(P.visitMarket(g, []));
  assert.equal(g.buildings.market, 1);
  assert.deepEqual(CAMP_VENDORS, ["forge", "arcane", "night", "menagerie"]);
  const html = createHomesteadUi({
    getGame: () => g,
    esc: (s) => s,
    button: (s, a) => `<button ${a}>${s}</button>`,
  }).marketMap();
  assert.equal((html.match(/data-vendor-map=/g) || []).length, 4);
  assert.doesNotMatch(html, /market-direction|market-district/);
});
test("the tent becomes a cabin in place and repeat upgrades retain all capacity", () => {
  const g = fresh();
  g.gold = 10000;
  for (const k in g.materials) g.materials[k] = 500;
  assert.equal(Camp.campCapacity(g), 40);
  assert.ok(Camp.buildCamp(g, "cabins"));
  assert.equal(g.buildings.tent, 2);
  assert.equal(Camp.campCapacity(g), 60);
  assert.ok(Camp.buildCamp(g, "cabins"));
  assert.equal(g.buildings.tent, 3);
  assert.equal(Camp.campCapacity(g), 80);
  const html = createHomesteadUi({
    getGame: () => g,
    esc: (s) => s,
    button: (s, a) => `<button ${a}>${s}</button>`,
  }).campMap();
  assert.equal((html.match(/data-building="tent"/g) || []).length, 1);
  assert.doesNotMatch(html, /data-building="cabins"/);
});
test("legacy Camp migration preserves owned records, capacity and running checkpoints", () => {
  const g = fresh();
  g.campNamed = true;
  delete g.campWorldRevision;
  g.buildings.cabins = 3;
  const ids = g.roster.map((h) => h.id),
    inventory = structuredClone(g.inventory);
  const sim = new ExpeditionSimulation(g, now);
  assert.equal(sim.g.buildings.tent, 4);
  assert.equal(Camp.campCapacity(sim.g), 100);
  assert.deepEqual(
    sim.g.roster.map((h) => h.id),
    ids,
  );
  assert.deepEqual(sim.g.inventory, inventory);
  assert.equal(sim.g.buildings.market, 0);
  assert.equal(sim.g.buildings.guildhall, 1);
  assert.ok(P.validateSave(sim.snapshot().game));
  normalizeCampWorld(sim.g);
  assert.equal(Camp.campCapacity(sim.g), 100);
});
test("Camp construction and cleared land expand revealed areas without opening every plot", () => {
  const g = fresh(),
    before = revealedCampAreas(g);
  assert.equal(before.length, 1);
  g.campXp = 1000;
  g.buildings.blacksmith = 1;
  assert.ok(revealedCampAreas(g)[0].r > before[0].r);
  g.campExpansions.push("south");
  assert.ok(revealedCampAreas(g).length >= 2);
  assert.equal(revealedCampAreas(g)[1].y, 1620);
});
test("focused camera eases zoom to fit dispersed characters and manual movement disables tracking", () => {
  const camera = new WorldCamera(1200, 480, { span: 480, min: 360 });
  camera.viewport(390, 300);
  camera.focus(
    [
      { x: 260, y: 200 },
      { x: 350, y: 220 },
    ],
    480,
  );
  camera.update(0);
  const tight = camera.target.width;
  camera.focus(
    [
      { x: 150, y: 70 },
      { x: 1000, y: 400 },
    ],
    480,
  );
  assert.ok(camera.target.width > tight);
  assert.equal(camera.manual, false);
  const old = camera.width;
  camera.update(0.1);
  assert.ok(camera.width > old);
  assert.ok(camera.width < camera.target.width);
  camera.move(15, 20);
  const x = camera.cx;
  camera.update(0.2);
  assert.equal(camera.manual, true);
  assert.equal(camera.cx, x);
  camera.focus([{ x: 400, y: 240 }], 480);
  camera.update(0.3);
  assert.equal(camera.manual, false);
  const r = { left: 10, top: 20, width: 390, height: 300 },
    p = camera.point(r, 205, 170);
  assert.ok(Math.abs(p.x - camera.cx) < 1e-8);
  assert.ok(Math.abs(p.y - camera.cy) < 1e-8);
});
test("a map drag suppresses service activation, arrow keys pan, and wheel zoom uses the cursor anchor", () => {
  const handlers = {},
    el = {
      addEventListener: (k, fn) => {
        handlers[k] = fn;
      },
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 400,
        height: 400,
      }),
      focus() {},
      setPointerCapture() {},
      releasePointerCapture() {},
    };
  const camera = new WorldCamera(1800, 1400, { x: 900, y: 700, span: 720 }),
    event = (x, y) => ({
      pointerId: 1,
      button: 0,
      clientX: x,
      clientY: y,
      preventDefault() {},
      stopImmediatePropagation() {
        this.stopped = true;
      },
    });
  handlers.x = null;
  attachCameraInput(el, camera);
  handlers.pointerdown(event(200, 200));
  handlers.pointermove(event(260, 250));
  handlers.pointerup(event(260, 250));
  assert.equal(camera.manual, true);
  const click = event(260, 250);
  handlers.click(click);
  assert.equal(click.stopped, true);
  const before = camera.cx;
  handlers.keydown({ target: el, key: "ArrowRight", preventDefault() {} });
  assert.ok(camera.cx > before);
  const width = camera.width;
  handlers.wheel({ ...event(200, 200), deltaY: -100 });
  assert.ok(camera.width < width);
});
test("Camp residents cast shadows and emit light only with a light item; the bonfire is the dominant source", () => {
  const original = globalThis.document;
  globalThis.document = {
    createElement: () => {
      const c = createCanvas(1, 1);
      c.setAttribute = () => {};
      return c;
    },
  };
  try {
    const fire = {
        dataset: { sceneKey: "bonfire", worldX: "900", worldY: "650" },
      },
      hero = {
        dataset: { lightRadius: "0" },
        style: { left: "820px", top: "780px" },
      };
    const el = {
      dataset: { worldWidth: "1800", worldHeight: "1400", localMap: "camp" },
      appendChild() {},
      querySelectorAll: (q) => (q.includes("scene-key") ? [fire] : [hero]),
    };
    const light = new SceneLighting(el, fresh());
    light.draw(1);
    assert.equal(light.staticLights.length, 1);
    assert.ok(light.staticLights[0].r >= 420);
    assert.equal(light.scene.map.objects.filter((o) => o.r === 9).length, 1);
    const dark = light.light.mask.getContext("2d").getImageData(102, 97, 1, 1)
      .data[3];
    hero.dataset.lightRadius = "190";
    light.draw(2);
    const lit = light.light.mask.getContext("2d").getImageData(102, 97, 1, 1)
      .data[3];
    assert.ok(lit <= dark);
  } finally {
    globalThis.document = original;
  }
});

test("a constructed Travelers lodge offers recruits immediately and refreshes without a town visit", () => {
  const g = fresh();
  g.buildings.tavern = 1;
  const sim = new ExpeditionSimulation(g, now);
  assert.ok(sim.g.market.guild.some((o) => o.kind === "hero"));
  const ids = sim.g.market.guild.map((o) => o.id);
  sim.advance(now + 43200000, Infinity);
  assert.ok(sim.g.market.guild.length);
  assert.notDeepEqual(
    sim.g.market.guild.map((o) => o.id),
    ids,
  );
  assert.equal(sim.g.screen, "camp");
});
