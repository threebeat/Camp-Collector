import test from "node:test";
import assert from "node:assert/strict";
import { createCanvas, Image } from "@napi-rs/canvas";
import * as D from "../web/data.js";
import { Battle, seeded } from "../web/engine.js";
import {
  BattleSelection,
  attachBattleGestures,
} from "../web/battle-interaction.js";
import { environmentLights, lightSources, revealed } from "../web/lighting.js";
import { PixelLighting } from "../web/pixel-lighting.js";
import { Renderer } from "../web/renderer.js";
import {
  pixelPortraitSvg,
  pixelItemSvg,
  pixelBuildingSvg,
} from "../web/pixel-art.js";

function field() {
  const g = D.initialGame(seeded(84), Date.UTC(2026, 9, 11));
  const b = new Battle(
    g.roster,
    0,
    47,
    [
      D.generateHero({
        race: "Human",
        classId: "guardian",
        level: 50,
        light: null,
      }),
    ],
    { hazards: false },
  );
  b.map = {
    seed: 47,
    biome: "forest",
    objects: [],
    bridges: [],
    bushes: [],
    grass: [],
  };
  b.units.forEach((u, i) => {
    u.x = 160 + i * 105;
    u.y = 240;
  });
  return b;
}
test("battle inspection requires an explicit selection, stays closed after snapshots, and clears on a new encounter", () => {
  const b = field(),
    selection = new BattleSelection();
  selection.enter("run:0");
  assert.equal(selection.resolve(b), null);
  assert.equal(selection.select(b, b.units[0].uid), b.units[0]);
  selection.clear();
  for (let i = 0; i < 5; i++) {
    selection.enter("run:0");
    assert.equal(selection.resolve(Battle.fromState(b.toState())), null);
  }
  selection.select(b, b.units[0].uid);
  selection.enter("run:1");
  assert.equal(selection.resolve(b), null);
  selection.select(b, b.units[0].uid);
  b.units[0].dead = true;
  assert.equal(selection.resolve(b), null);
});
test("hidden enemies cannot open the battle inspector, even from a stale selected UID", () => {
  const b = field(),
    enemy = b.units.at(-1),
    selection = new BattleSelection();
  b.units
    .filter((u) => u.team === 0)
    .forEach((u) => {
      u.hero.light = null;
      u.hero.race = "Human";
      u.hero.attributes = [];
      u.hero.talents = [];
      u.x = 100;
      u.y = 240;
    });
  enemy.x = 1100;
  enemy.y = 240;
  assert.equal(revealed(b, enemy), false);
  assert.equal(selection.select(b, enemy.uid), null);
});
test("horizontal pan, vertical scroll and canceled gestures cannot inspect a character; a deliberate tap can", () => {
  const handlers = {},
    taps = [],
    renderer = {
      camera: { x: 0, width: 600 },
      panTo(x) {
        this.camera.x = x;
      },
      worldPoint(x, y) {
        return { x, y };
      },
    };
  const canvas = {
    addEventListener(name, fn) {
      handlers[name] = fn;
    },
    setPointerCapture() {},
    getBoundingClientRect() {
      return { width: 390 };
    },
  };
  attachBattleGestures(
    canvas,
    () => renderer,
    (p) => taps.push(p),
  );
  const event = (x, y) => ({ button: 0, pointerId: 1, clientX: x, clientY: y });
  handlers.pointerdown(event(140, 100));
  handlers.pointermove(event(80, 102));
  handlers.pointerup(event(80, 102));
  assert.equal(taps.length, 0);
  assert.ok(renderer.camera.x > 0);
  handlers.pointerdown(event(140, 100));
  handlers.pointermove(event(141, 150));
  handlers.pointerup(event(141, 150));
  assert.equal(taps.length, 0);
  handlers.pointerdown(event(140, 100));
  handlers.pointercancel();
  handlers.pointerup(event(140, 100));
  assert.equal(taps.length, 0);
  handlers.pointerdown(event(140, 100));
  handlers.pointerup(event(142, 102));
  assert.deepEqual(taps, [{ x: 142, y: 102 }]);
});
test("environment sources are deterministic and fire, windows and magic retain different colors", () => {
  const map = {
    biome: "village",
    objects: [{ type: "house", x: 500, y: 200, w: 80, h: 60 }],
  };
  assert.deepEqual(
    environmentLights(map),
    environmentLights(structuredClone(map)),
  );
  assert.equal(environmentLights(map)[0].kind, "window");
  const sources = lightSources({
    map,
    units: [],
    projectiles: [
      { x: 1, y: 2, type: "fire" },
      { x: 4, y: 5, type: "bolt" },
    ],
    zones: [{ x: 50, y: 50, r: 60, element: "gravity", type: "curse" }],
    fires: [],
  });
  assert.notEqual(sources.at(-1).color, sources.at(-2).color);
  assert.ok(sources.some((s) => s.color === "#ad83d5"));
});
test("pixel light bands combine, cast terrain shadows and preserve blue night vision", () => {
  const before = globalThis.document;
  globalThis.document = { createElement: () => createCanvas(1, 1) };
  try {
    const light = new PixelLighting(240, 120, 4),
      source = { x: 55, y: 60, r: 160, color: "#f4c76a", kind: "lamp" };
    light.paint(
      { map: { objects: [{ type: "ruin", x: 100, y: 0, w: 12, h: 120 }] } },
      [source],
      [],
      [],
      0,
    );
    const mask = light.mask.getContext("2d"),
      alpha = (x, y) => mask.getImageData(x / 4, y / 4, 1, 1).data[3];
    assert.ok(
      alpha(60, 60) < alpha(180, 60),
      "the ruin shadows the light behind it",
    );
    const single = alpha(40, 60);
    light.paint(
      { map: { objects: [] } },
      [source, { ...source, x: 25, color: "#ad83d5" }],
      [],
      [],
      1,
    );
    assert.ok(
      alpha(40, 60) <= single,
      "overlapping lights brighten their shared ground",
    );
    light.paint(
      { map: { objects: [] } },
      [],
      [{ x: 55, y: 60, r: 100, kind: "vision", nightVision: true }],
      [],
      2,
    );
    const tint = light.tint
      .getContext("2d")
      .getImageData(55 / 4, 60 / 4, 1, 1).data;
    assert.ok(tint[2] > tint[0]);
  } finally {
    globalThis.document = before;
  }
});
test("characters, armor and building sprites are authored rectangles and expose their canonical identity", () => {
  for (const race of Object.keys(D.RACES)) {
    const h = D.generateHero({ race, classId: "vanguard" }, seeded(37)),
      art = pixelPortraitSvg(h);
    assert.match(art, /shape-rendering="crispEdges"/);
    assert.match(art, /<rect/);
    assert.ok(
      !/<(?:path|circle|ellipse|linearGradient|radialGradient)\b/.test(art),
    );
  }
  for (const key of Object.keys(D.ITEMS))
    assert.match(pixelItemSvg(D.makeItem(key)), /data-pixel-art="item"/);
  assert.match(pixelBuildingSvg("bonfire"), /data-light-source="fire"/);
});
test("phone camera preserves aspect ratio and converts screen taps back into world coordinates", () => {
  const previous = {
    document: globalThis.document,
    window: globalThis.window,
    Image: globalThis.Image,
  };
  globalThis.document = { createElement: () => createCanvas(1, 1) };
  globalThis.window = { devicePixelRatio: 2 };
  globalThis.Image = class extends Image {
    get naturalWidth() {
      return this.width;
    }
  };
  try {
    const canvas = createCanvas(390, 300);
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 390,
      height: 300,
    });
    const renderer = new Renderer(canvas),
      b = field();
    renderer.draw(b, 1);
    assert.ok(renderer.camera.width < 1200);
    assert.ok(renderer.camera.width >= 480);
    renderer.panTo(250);
    const point = renderer.worldPoint(195, 150);
    assert.ok(Math.abs(point.x - (250 + renderer.camera.width / 2)) < 1);
    assert.ok(Math.abs(point.y - 240) < 1);
    const center = canvas.getContext("2d").getImageData(200, 200, 1, 1).data;
    assert.equal(center[3], 255);
    renderer.followCompany();
    assert.equal(renderer.camera.manual, false);
  } finally {
    Object.assign(globalThis, previous);
  }
});
