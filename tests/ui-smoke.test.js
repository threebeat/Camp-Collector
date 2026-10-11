// DOM emulation tests interactions without claiming a live browser/layout test.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const require = createRequire(import.meta.url);
let native;
try {
  native = require("@napi-rs/canvas");
} catch {
  try {
    native = require(
      process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + "/@napi-rs/canvas",
    );
  } catch {}
}
const decode = (s) =>
  String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
class Element {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.style = {};
    this._text = "";
    this._value = undefined;
    this.dataset = Object.fromEntries(
      Object.entries(attrs)
        .filter(([k]) => k.startsWith("data-"))
        .map(([k, v]) => [
          k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
          v,
        ]),
    );
    this.classList = {
      add: (...v) =>
        (this.attrs.class = [
          ...new Set([...(this.attrs.class || "").split(" "), ...v]),
        ].join(" ")),
      remove: (...v) =>
        (this.attrs.class = (this.attrs.class || "")
          .split(" ")
          .filter((c) => !v.includes(c))
          .join(" ")),
      toggle: (v, force) => {
        const has = (this.attrs.class || "").split(" ").includes(v);
        const add = force === undefined ? !has : force;
        if (add) this.classList.add(v);
        else this.classList.remove(v);
      },
    };
    if (tag === "canvas") this.canvas = native.createCanvas(1000, 400);
  }
  get open() {
    return "open" in this.attrs;
  }
  set open(v) {
    if (v) this.attrs.open = "";
    else delete this.attrs.open;
  }
  scrollIntoView() {}
  get id() {
    return this.attrs.id;
  }
  get disabled() {
    return "disabled" in this.attrs;
  }
  set disabled(v) {
    if (v) this.attrs.disabled = "";
    else delete this.attrs.disabled;
  }
  get hidden() {
    return "hidden" in this.attrs;
  }
  set hidden(v) {
    if (v) this.attrs.hidden = "";
    else delete this.attrs.hidden;
  }
  get value() {
    if (this._value !== undefined) return this._value;
    const options = this.querySelectorAll("option");
    return (
      options.find((o) => "selected" in o.attrs)?.attrs.value ||
      options[0]?.attrs.value ||
      this.attrs.value ||
      ""
    );
  }
  set value(v) {
    this._value = v;
  }
  set innerHTML(html) {
    this._html = html;
    this.children = parse(html);
    this.children.forEach((c) => (c.parent = this));
  }
  get innerHTML() {
    return this._html || "";
  }
  set textContent(s) {
    this._text = String(s);
    this.children = [];
  }
  get textContent() {
    return this._text || decode((this._html || "").replace(/<[^>]+>/g, ""));
  }
  get width() {
    return this.canvas?.width || 0;
  }
  set width(v) {
    if (this.canvas) this.canvas.width = v;
  }
  get height() {
    return this.canvas?.height || 0;
  }
  set height(v) {
    if (this.canvas) this.canvas.height = v;
  }
  getContext(type) {
    return this.canvas.getContext(type);
  }
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: 1000,
      height: 400,
      right: 1000,
      bottom: 400,
    };
  }
  setAttribute(k, v) {
    this.attrs[k] = v;
  }
  setPointerCapture(id) {
    this.captured = id;
  }
  releasePointerCapture(id) {
    if (this.captured === id) this.captured = null;
  }
  async dispatch(type, props = {}) {
    const e = {
      target: this,
      pointerId: 1,
      pointerType: "touch",
      button: 0,
      clientX: 10,
      clientY: 10,
      preventDefault() {},
      ...props,
    };
    for (const fn of this.listeners[type] || []) await fn(e);
  }
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  }
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  matches(selector) {
    if (selector.includes(" ") && !selector.startsWith("[")) {
      const parts = selector.split(" ");
      return (
        this.matches(parts.at(-1)) &&
        !!this.parent?.closest(parts.slice(0, -1).join(" "))
      );
    }
    const compound = selector.match(/^([a-zA-Z]+)(\[[^\]]+\])$/);
    if (compound)
      return (
        this.tagName === compound[1].toUpperCase() && this.matches(compound[2])
      );
    if (selector.startsWith("#")) return this.id === selector.slice(1);
    if (selector.startsWith("."))
      return (this.attrs.class || "").split(" ").includes(selector.slice(1));
    if (selector.startsWith("[")) {
      const m = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      return (
        !!m &&
        m[1] in this.attrs &&
        (m[2] === undefined || this.attrs[m[1]] === m[2])
      );
    }
    return this.tagName === selector.toUpperCase();
  }
  querySelectorAll(selector) {
    const result = [];
    const walk = (n) => {
      for (const c of n.children) {
        if (c.matches(selector)) result.push(c);
        walk(c);
      }
    };
    walk(this);
    return result;
  }
  querySelector(s) {
    return this.querySelectorAll(s)[0] || null;
  }
  closest(s) {
    return this.matches(s) ? this : this.parent?.closest(s) || null;
  }
  async click() {
    if (this.disabled) return;
    const e = { target: this, clientX: 0, clientY: 0, preventDefault() {} };
    await this.onclick?.(e);
    for (const fn of this.listeners.click || []) await fn(e);
  }
  focus() {
    document.activeElement = this;
  }
  setSelectionRange() {}
}
function parse(html) {
  const root = new Element("root"),
    stack = [root],
    re = /<\/?([a-zA-Z][\w:-]*)([^>]*)>/g;
  let match;
  while ((match = re.exec(html))) {
    const closing = match[0].startsWith("</"),
      tag = match[1].toLowerCase();
    if (closing) {
      let i = stack.length - 1;
      while (i > 0 && stack[i].tagName !== tag.toUpperCase()) i--;
      if (i > 0) {
        const node = stack[i];
        node._html = html.slice(node.openEnd, match.index);
        stack.length = i;
      }
      continue;
    }
    const attrs = {};
    const ar = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    while ((a = ar.exec(match[2])))
      attrs[a[1]] = decode(a[2] ?? a[3] ?? a[4] ?? "");
    const el = new Element(tag, attrs);
    el.openEnd = re.lastIndex;
    const parent = stack.at(-1);
    parent.children.push(el);
    el.parent = parent;
    if (
      !["meta", "link", "input", "br", "img", "hr", "source"].includes(tag) &&
      !match[0].endsWith("/>")
    )
      stack.push(el);
  }
  return root.children;
}
class BrowserImage extends (native?.Image || class {}) {
  get naturalWidth() {
    return this.width;
  }
  set src(v) {
    super.src = v.startsWith("data:image/svg+xml")
      ? Buffer.from(decodeURIComponent(v.slice(v.indexOf(",") + 1)))
      : v;
  }
  get src() {
    return super.src;
  }
}
test(
  "connected Crossroads interface covers departure, background play, Market services, Camp care, Codex and Arena",
  { skip: !native },
  async () => {
    const { addGems } = await import("../web/camp.js");
    const { generateHero, makePet } = await import("../web/data.js");
    const { ExpeditionSimulation } = await import("../web/simulation.js");
    const { seeded } = await import("../web/engine.js");
    const { SAVE_KEY } = await import("../web/client.js");
    const originalRandom = Math.random,
      originalNow = Date.now,
      originalInterval = globalThis.setInterval;
    const intervals = new Set();
    globalThis.setInterval = (...args) => {
      const timer = originalInterval(...args);
      intervals.add(timer);
      return timer;
    };
    Math.random = seeded(411);
    let clock = 1000000;
    Date.now = () => clock;
    const root = new Element("root");
    root.innerHTML = readFileSync(
      new URL("../web/index.html", import.meta.url),
      "utf8",
    );
    const values = new Map(),
      docListeners = {},
      windowListeners = {};
    let nextFrame,
      worker,
      dropHit = null;
    class FakeWorker {
      constructor() {
        worker = this;
      }
      postMessage({ type, args, now, requestId }) {
        let data;
        if (type === "init") {
          this.sim = new ExpeditionSimulation(args.saved, now);
          data = this.sim.snapshot();
        } else if (type === "observe") data = this.sim.observe(args, now);
        else if (type === "checkpoint") {
          this.sim.advance(now, Infinity);
          data = this.sim.snapshot();
        } else data = this.sim.action(type, args, now);
        queueMicrotask(() => this.onmessage({ data: { requestId, ...data } }));
      }
      advance(ms) {
        const end = clock + ms;
        while (clock < end) {
          clock = Math.min(end, clock + 100);
          this.sim.advance(clock, Infinity);
        }
        this.onmessage({ data: this.sim.snapshot() });
      }
      terminate() {}
    }
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ offers: [], payouts: [], matches: [] }),
    });
    globalThis.Worker = FakeWorker;
    globalThis.document = {
      body: root.querySelector("body"),
      elementFromPoint: () => dropHit,
      hidden: false,
      activeElement: { tagName: "BODY" },
      getElementById: (id) => root.querySelector("#" + id),
      querySelector: (s) => root.querySelector(s),
      querySelectorAll: (s) => root.querySelectorAll(s),
      createElement: (tag) =>
        tag === "canvas" ? native.createCanvas(1200, 480) : new Element(tag),
      addEventListener: (event, fn) => {
        (docListeners[event] ||= []).push(fn);
      },
      title: "",
    };
    globalThis.window = {
      innerWidth: 390,
      innerHeight: 844,
      matchMedia: (q) => ({ matches: q.includes("max-width") }),
      devicePixelRatio: 1,
      addEventListener: (event, fn) => {
        (windowListeners[event] ||= []).push(fn);
      },
    };
    globalThis.Image = BrowserImage;
    globalThis.localStorage = {
      getItem: (k) => values.get(k) || null,
      setItem: (k, v) => values.set(k, v),
      removeItem: (k) => values.delete(k),
    };
    globalThis.requestAnimationFrame = (fn) => {
      nextFrame = fn;
    };
    const get = (s) => {
        const e = root.querySelector(s);
        assert.ok(e, `UI control ${s} exists`);
        return e;
      },
      click = async (s) => {
        await get(s).click();
        await new Promise((resolve) => queueMicrotask(resolve));
      },
      state = () => JSON.parse(values.get(SAVE_KEY));
    try {
      await import("../web/app.js?camp-ui-smoke");
      assert.equal(state().screen, "camp");
      assert.equal(state().roster.length, 3);
      assert.match(document.title, /Your Camp/);
      assert.equal(state().storyPage, 0);
      await click("[data-story-next]");
      assert.equal(state().storyPage, 1);
      await click("[data-story-next]");
      assert.equal(state().storyPage, 2);
      get("#camp-name-input").value = "Willow Rest";
      await click("#confirm-camp-name");
      assert.equal(state().campName, "Willow Rest");
      assert.match(document.title, /Willow Rest/);
      assert.ok(state().roster.every((h) => h.level === 5));
      assert.ok(get(".quest-summary"));
      assert.ok(get(".camp-detail"));
      assert.equal(root.querySelector(".company-section"), null);
      assert.equal(root.querySelector("[data-card-hp]"), null);
      nextFrame(performance.now());
      assert.ok(get("[data-camp-walker]"));
      await click('[data-building="tent"]');
      const first = state().roster[0].id;
      assert.match(get('[data-card-hp="' + first + '"]').textContent, /HP/);
      await click('[data-profile="' + first + '"]');
      assert.match(get("#modal-content").innerHTML, /Add a memory/);
      await click("[data-close]");
      const detail = get("#hero-detail").innerHTML;
      assert.ok(
        detail.indexOf("character-xp") > detail.indexOf("hero-detail-header"),
      );
      assert.ok(
        detail.indexOf("Active abilities") < detail.indexOf("Attributes"),
      );
      assert.ok(!root.querySelector('[data-nav="barracks"]'));
      assert.ok(root.querySelector('#main-nav [data-nav="expeditions"]'));
      assert.ok(!root.querySelector('#main-nav [data-nav="crossroads"]'));
      assert.ok(!root.querySelector('#main-nav [data-nav="market"]'));
      await click('[data-explain="ability"]');
      const description = get("#modal-content").innerHTML;
      if (!root.querySelector('[data-favorite="' + first + '"]'))
        await click('[data-hero="' + first + '"]');
      await click('[data-favorite="' + first + '"]');
      worker.advance(1000);
      assert.ok(get("#modal").open);
      assert.equal(get("#modal-content").innerHTML, description);
      await click("[data-close]");
      await click("[data-deselect]");
      assert.ok(get(".camp-detail"));
      const second = state().roster[1].id,
        dragged = get('[data-hero="' + second + '"]');
      dropHit = get('[data-building="bonfire"]');
      await dragged.dispatch("pointerdown", { pointerType: "mouse" });
      await dragged.dispatch("pointermove", {
        pointerType: "mouse",
        clientX: 600,
        clientY: 220,
      });
      await dragged.dispatch("pointerup", {
        pointerType: "mouse",
        clientX: 600,
        clientY: 220,
      });
      await new Promise((resolve) => queueMicrotask(resolve));
      assert.ok(get("#modal").open);
      assert.equal(get("#service-hero").value, second);
      assert.ok(state().mapPositions.camp[second]);
      await click("[data-close]");
      await click('[data-hero="' + first + '"]');
      await click('[data-building="crossroads"]');
      assert.equal(state().screen, "crossroads");
      assert.equal(state().staging.length, 0);
      assert.ok(get('[data-destination="grove"]').disabled);
      assert.equal(root.querySelector("[data-region]"), null);
      await click('[data-destination="clearing"]');
      assert.ok(!root.querySelector('[data-difficulty="hard"]'));
      assert.equal(state().destination.difficulty, "normal");
      await click('[data-nav="challenges"]');
      assert.ok(get(".trial-grid"));
      assert.equal(root.querySelector('[data-nav="calendar"]'), null);
      assert.equal(root.querySelector('[data-day="2"]'), null);
      await click('[data-day="1"]');
      assert.equal(state().destination.day, 1);
      await click("[data-close]");
      await click('[data-nav="camp"]');
      await click('[data-building="crossroads"]');
      assert.equal(state().destination.mode, "journey");
      await click("[data-lock-route]");
      assert.equal(state().screen, "party");
      assert.equal(state().staging.length, 3);
      await click("#launch-btn");
      assert.equal(state().expeditions[0].phase, "prepare");
      assert.equal(state().expeditions[0].auto, false);
      assert.equal(get("#fight-countdown").textContent, "3");
      assert.ok(get("[data-auto]").textContent.includes("OFF"));
      assert.equal(state().expeditions[0].encounters, 2);
      await click('[data-speed="3"]');
      worker.advance(5000);
      let elapsed = state().expeditions[0].elapsedSeconds;
      assert.ok(Math.abs(elapsed - 15) < 0.1);
      nextFrame(performance.now());
      writeFileSync(
        join(tmpdir(), "camp-battle.png"),
        get("#battlefield").canvas.toBuffer("image/png"),
      );
      for (const fn of windowListeners.blur) fn();
      await new Promise((resolve) => queueMicrotask(resolve));
      assert.equal(worker.sim.rate(worker.sim.g.expeditions[0]), 1);
      for (const fn of windowListeners.focus) fn();
      await new Promise((resolve) => queueMicrotask(resolve));
      await click("#pause-btn");
      assert.equal(worker.sim.observation.paused, true);
      await click('[data-nav="camp"]');
      worker.advance(10000);
      assert.ok(
        Math.abs(state().expeditions[0].elapsedSeconds - elapsed - 10) < 0.1,
      );
      await click('[data-building="tent"]');
      await click('[data-profile="' + first + '"]');
      await click('[data-profile-slot="0"]');
      assert.ok(get("#modal").open);
      assert.ok(!root.querySelector("[data-unequip]"));
      await click("[data-close]");
      worker.advance(600000);
      assert.equal(state().expeditions[0].status, "returned");
      assert.equal(state().journeyClears["greenway:clearing"], 1);
      await click('[data-nav="camp"]');
      await click('[data-nav="quests"]');
      await click('[data-quest="first-road"]');
      await click('[data-nav="camp"]');
      assert.ok(state().gold > 100);
      await click('[data-hero="' + first + '"]');
      worker.sim.g.gold = 1000;
      worker.sim.g.materials.wood = 40;
      worker.sim.g.materials.stone = 40;
      worker.sim.g.roster.push(
        generateHero({ classId: "bard", race: "Human" }),
      );
      worker.advance(100);
      assert.equal(root.querySelector('[data-building="training"]'), null);
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click('[data-building="training"]');
      await click('[data-construct="training"]');
      await click('[data-building="training"]');
      const before = state().gold;
      await click('[data-train="mind"]');
      assert.ok(state().gold < before);
      assert.ok(state().roster[0].trainingJob);
      worker.advance(31000);
      assert.equal(
        state().roster[0].talents.find((a) => a.key === "training:mind").level,
        1,
      );
      await click("[data-close]");
      if (!root.querySelector('[data-favorite="' + first + '"]'))
        await click('[data-hero="' + first + '"]');
      await click('[data-favorite="' + first + '"]');
      assert.equal(state().roster[0].favorite, false);
      await click('[data-rename="' + first + '"]');
      get("#hero-name-input").value = "Old friend";
      await click("#confirm-name");
      assert.equal(state().roster[0].name, "Old friend");
      await click('[data-building="bonfire"]');
      assert.ok(get('[data-class-node="breaker:0"]').disabled);
      await click("[data-close]");
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click('[data-building="blacksmith"]');
      assert.ok(get("#modal").open);
      await click("[data-close]");
      await click('[data-building="storage"]');
      assert.ok(get("#storage-search"));
      await click("[data-close]");
      worker.sim.g.gold = 10000;
      worker.sim.g.materials.wood = 200;
      worker.sim.g.materials.stone = 200;
      addGems(worker.sim.g, 100);
      worker.advance(100);
      await click('[data-nav="shop"]');
      assert.deepEqual(
        get("#main-nav")
          .querySelectorAll("[data-nav]")
          .map((b) => b.dataset.nav),
        ["camp", "expeditions", "challenges", "quests", "shop", "codex"],
      );
      assert.ok(get(".gem-shop-grid"));
      assert.ok(get("[data-stock-timer]"));
      const gemOffer = state().gemShop.find((o) => o.kind === "cosmetic"),
        shopGold = state().gold;
      await click('[data-gem-buy="' + gemOffer.id + '"]');
      assert.equal(state().gold, shopGold);
      assert.ok(state().cosmetics.includes(gemOffer.key));
      await click('[data-nav="camp"]');
      await click('[data-expand-camp="east"]');
      await click("#confirm-expansion");
      assert.equal(state().campZone, "east");
      assert.equal(root.querySelector('[data-building="farm"]'), null);
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click('[data-building="farm"]');
      await click('[data-construct="farm"]');
      worker.advance(300001);
      await click('[data-building="farm"]');
      const harvestFood = state().food;
      await click('[data-harvest="farm"]');
      assert.equal(state().food, harvestFood + 2);
      await click("[data-close]");
      await click('[data-camp-zone="center"]');
      await click("[data-market-visit]");
      await click('[data-market-pick="' + first + '"]');
      await click('[data-market-pick="' + second + '"]');
      await click("#confirm-market-visit");
      assert.ok(get(".market-map"));
      assert.equal(state().marketParty.length, 2);
      assert.equal(root.querySelectorAll("[data-resident]").length, 2);
      const visitor = get('[data-hero="' + second + '"]');
      dropHit = get('[data-vendor-map="forge"]');
      await visitor.dispatch("pointerdown");
      await visitor.dispatch("pointermove", { clientX: 780, clientY: 100 });
      await visitor.dispatch("pointerup", { clientX: 780, clientY: 100 });
      await new Promise((resolve) => queueMicrotask(resolve));
      assert.ok(get("#modal").open);
      assert.match(get("#modal-content").innerHTML, /Compatible|compatible/);
      assert.match(
        get("#modal-content").innerHTML,
        new RegExp(state().roster[1].name),
      );
      assert.ok(state().mapPositions.market[second]);
      assert.ok(!get("#modal-content").innerHTML.includes("Really heavy"));
      await click("[data-close]");
      await click('[data-market-mode="catalog"]');
      assert.ok(get("#market-search"));
      get("#market-search").value = "Bard";
      await get("#market-search").oninput({ target: get("#market-search") });
      const bard = state().market.guild.find((o) => o.hero.classId === "bard");
      await click('[data-buy="' + bard.id + '"]');
      assert.equal(state().roster.length, 5);
      get("#market-search").value = "";
      await get("#market-search").oninput({ target: get("#market-search") });
      await click('[data-market-mode="vendors"]');
      await click('[data-vendor-map="menagerie"]');
      const pet = state().market.menagerie[0];
      await click('[data-buy="' + pet.id + '"]');
      assert.equal(state().companions.length, 1);
      await click("[data-close]");
      await click('[data-market-mode="vendors"]');
      await click('[data-vendor-map="arcane"]');
      const scroll = state().market.arcane.find((o) => o.kind === "scroll");
      await click('[data-buy="' + scroll.id + '"]');
      await click("[data-close]");
      await click('[data-service="analyze"]');
      await click('[data-analyze="' + scroll.scroll.id + '"]');
      assert.ok(state().scrolls[0].analyzed);
      await click('[data-service="create"]');
      await click("#confirm-create");
      assert.equal(state().roster.length, 6);
      assert.equal(state().scrolls.length, 0);
      await click('[data-nav="camp"]');
      worker.sim.g.buildings.blacksmith = 1;
      worker.sim.g.materials.ore = 20;
      worker.advance(100);
      await click('[data-building="blacksmith"]');
      await click('[data-blacksmith-tab="forge"]');
      await click('[data-forge-weapon="ironblade"]');
      assert.ok(
        state().inventory.some((i) => i.key === "ironblade" && i.level === 1),
      );
      await click("[data-close]");
      await click('[data-nav="camp"]');
      await click('[data-building="tent"]');
      await click('[data-profile="' + first + '"]');
      await click('[data-service="pet"]');
      await click('[data-pet="' + pet.pet.id + '"]');
      assert.equal(state().roster[0].companion.id, pet.pet.id);
      await click("[data-close]");
      await click('[data-slot="0"]');
      const blade = state().inventory.find((i) => i.key === "ironblade");
      await click('[data-equip="' + blade.id + '"]');
      assert.equal(state().roster[0].items[0].id, blade.id);
      worker.sim.g.materials = {
        wood: 200,
        stone: 200,
        ore: 200,
        herbs: 200,
        meat: 200,
        obsidian: 200,
        relic: 200,
      };
      worker.sim.g.roster[0].level = 10;
      const horse = makePet("horse", 60);
      worker.sim.g.companions.push(horse);
      worker.advance(100);
      await click("[data-market-visit]");
      await click("#confirm-market-visit");
      await click('[data-service="slots"]');
      await click('[data-district-open="outfitter"]');
      const oldSlots = state().roster[0].items.length;
      await click('[data-unlock="charm"]');
      assert.equal(state().roster[0].items.length, oldSlots + 1);
      await click("[data-close]");
      await click('[data-nav="camp"]');
      await click('[data-building="tent"]');
      await click('[data-profile="' + first + '"]');
      await click('[data-service="pet"]');
      await click('[data-pet="' + horse.id + '"]');
      await click('[data-sockets="' + first + '"]');
      const gem = state().gemstones[0],
        gemValueBefore = state().gems;
      await click('[data-socket="' + gem.id + '"]');
      assert.ok(state().gems < gemValueBefore);
      assert.equal(state().roster[0].companion.sockets[0].id, gem.id);
      await click('[data-unsocket="0"]');
      assert.equal(state().gems, gemValueBefore);
      await click("[data-close]");
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click("[data-close]");
      await click('[data-building="blacksmith"]');
      await click('[data-blacksmith-tab="improve"]');
      await click('[data-improve="' + blade.id + '"]');
      assert.ok(state().roster[0].items[0].sharpenJob);
      worker.advance(21000);
      assert.equal(state().roster[0].items[0].rank, 1);
      await click("[data-close]");
      await click('[data-building="pantry"]');
      await click('[data-food="5"]');
      await click("[data-close]");
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click('[data-building="kitchen"]');
      await click('[data-construct="kitchen"]');
      await click('[data-building="kitchen"]');
      const foodBefore = state().food;
      await click('[data-cook="food"]');
      assert.equal(state().food, foodBefore + 6);
      await click("[data-close]");
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click('[data-building="alchemist"]');
      await click('[data-construct="alchemist"]');
      await click('[data-building="alchemist"]');
      await click('[data-brew="luck"]');
      assert.ok(state().consumables.luck);
      await click("[data-close]");
      await click('[data-building="storage"]');
      await click('[data-storage-tab="gems"]');
      assert.match(get("#modal-content").innerHTML, /gem value/);
      await click('[data-storage-tab="consumables"]');
      assert.match(get("#modal-content").innerHTML, /Lucky clover/);
      await click("[data-close]");
      worker.sim.g.roster[0].level = 20;
      worker.sim.g.roster[0].items[0].level = 20;
      worker.sim.g.eggs = 2;
      worker.advance(100);
      await click('[data-building="bonfire"]');
      await click('[data-class-node="vanguard:foundation"]');
      await click("#confirm-class-node");
      await click('[data-class-node="breaker:0"]');
      assert.match(get("#modal-content").innerHTML, /locks every other branch/);
      await click("#confirm-class-node");
      assert.equal(state().roster[0].classPath, "breaker");
      assert.match(get(".evernight-tree").innerHTML, /Earthbreaker/);
      assert.ok(get(".evernight-tree"));
      await click("[data-close]");
      await click('[data-building="blacksmith"]');
      await click('[data-blacksmith-tab="transform"]');
      get("#form-" + blade.id).value = "prefix:glacial";
      await click('[data-evolve="' + blade.id + '"]');
      assert.equal(state().roster[0].items[0].prefix, "glacial");
      assert.equal(state().roster[0].items[0].evolution, 1);
      worker.sim.g.roster[0].armor[1].level = 20;
      worker.advance(100);
      await click("[data-close]");
      worker.sim.g.buildings.armory = 1;
      worker.advance(100);
      await click('[data-building="armory"]');
      await click('[data-workshop-transform="armor"]');
      const armorId = state().roster[0].armor[1].id;
      get("#form-" + armorId).value = "enchantment:armore4";
      await click('[data-evolve="' + armorId + '"]');
      assert.equal(state().roster[0].armor[1].enchantment, "armore4");
      await click('[data-building="armory"]');
      await click('[data-workshop-transform="pet"]');
      get("#form-" + horse.id).value = "prefix:petp9";
      await click('[data-evolve="' + horse.id + '"]');
      assert.equal(state().roster[0].companion.prefix, "petp9");
      assert.match(get("#modal-content").innerHTML, /Skyfeather/);
      await click("[data-close]");
      if (root.querySelector("[data-deselect]")) await click("[data-deselect]");
      await click("[data-build-sites]");
      await click('[data-building="archaeology"]');
      await click('[data-construct="archaeology"]');
      await click('[data-camp-zone="east"]');
      await click('[data-building="archaeology"]');
      await click('[data-hatch="raptor"]');
      await click('[data-hatch="hadrosaur"]');
      assert.equal(state().eggs, 0);
      await click("[data-close]");
      await click('[data-camp-zone="center"]');
      await click("[data-market-visit]");
      await click("#confirm-market-visit");
      await click('[data-service="combine"]');
      await click('[data-combine-review="' + bard.hero.id + '"]');
      await click("#confirm-combine");
      assert.equal(state().roster.length, 5);
      assert.ok(state().roster[0].fusion.some((a) => a.classId === "bard"));
      await click('[data-nav="camp"]');
      await click('[data-building="tent"]');
      const created = state().roster.at(-1);
      await click('[data-profile="' + created.id + '"]');
      await click('[data-release="' + created.id + '"]');
      await click("#confirm-release");
      assert.equal(state().roster.length, 4);
      await click('[data-nav="challenges"]');
      await click('[data-challenge-tab="daily"]');
      await click('[data-trial="daily"]');
      assert.ok(get("#confirm-trial-launch"));
      await click("#confirm-trial-launch");
      assert.equal(state().expeditions.at(-1).mode, "trial");
      assert.equal(state().expeditions.at(-1).encounters, 1);
      worker.advance(600000);
      await click('[data-nav="challenges"]');
      await click('[data-challenge-tab="players"]');
      assert.ok(get(".challenge-rules"));
      assert.match(get("#app-content").innerHTML, /No other teams posted/);
      await click('[data-nav="codex"]');
      assert.match(document.title, /Codex/);
      get("#codex-search").value = "Heartstring";
      await get("#codex-search").oninput({ target: get("#codex-search") });
      assert.match(get("#app-content").innerHTML, /Bard/);
      await click('[data-nav="camp"]');
      await click("[data-market-visit]");
      await click("#confirm-market-visit");
      await click('[data-market-district="arena"]');
      await click("[data-enter-arena]");
      assert.equal(state().staging.length, 3);
      assert.equal(root.querySelector("[data-difficulty]"), null);
      assert.equal(state().destination.difficulty, "normal");
      await click("#launch-btn");
      assert.equal(state().expeditions.at(-1).mode, "arena");
      assert.equal(
        new Set(
          state()
            .expeditions.at(-1)
            .battleState.units.map((u) => u.team),
        ).size,
        state().expeditions.at(-1).arenaRule === "four" ? 4 : 2,
      );
      worker.advance(6000);
      nextFrame(performance.now());
      writeFileSync(
        join(tmpdir(), "camp-arena.png"),
        get("#battlefield").canvas.toBuffer("image/png"),
      );
      await click('[data-recall="' + state().expeditions.at(-1).id + '"]');
      await click("#confirm-recall");
      assert.equal(state().expeditions.at(-1).reason, "recall");
      await click("#settings-btn");
      assert.match(get("#modal-content").innerHTML, /Background tutorial/);
      await click("[data-close]");
    } finally {
      Math.random = originalRandom;
      Date.now = originalNow;
      for (const timer of intervals) clearInterval(timer);
      globalThis.setInterval = originalInterval;
      delete globalThis.Worker;
    }
  },
);
