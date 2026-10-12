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
    this.style = Object.fromEntries(
      (attrs.style || "")
        .split(";")
        .filter(Boolean)
        .map((s) => s.split(":")),
    );
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
      contains: (v) => (this.attrs.class || "").split(" ").includes(v),
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
  get className() {
    return this.attrs.class || "";
  }
  set className(value) {
    this.attrs.class = value;
  }
  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }
  get open() {
    return "open" in this.attrs;
  }
  set open(v) {
    if (v) this.attrs.open = "";
    else delete this.attrs.open;
  }
  scrollIntoView() {}
  get isConnected() {
    return !!this.parent;
  }
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
    const ctx = this.canvas.getContext(type);
    return new Proxy(ctx, {
      get: (target, key) =>
        key === "drawImage"
          ? (img, ...args) => target.drawImage(img?.canvas || img, ...args)
          : typeof target[key] === "function"
            ? target[key].bind(target)
            : target[key],
      set: (target, key, value) => Reflect.set(target, key, value, target),
    });
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
  hasAttribute(k) {
    return k in this.attrs;
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
      createElement: (tag) => new Element(tag),
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
      assert.equal(state().learning.stage, "intro");
      await new Promise((resolve) => setTimeout(resolve, 3500));
      await click("#opening-continue");
      assert.equal(state().learning.beat, 1);
      await click("#opening-continue");
      get("#opening-camp-name").value = "Willow Rest";
      await click("#opening-continue");
      assert.equal(state().campName, "Willow Rest");
      assert.equal(state().learning.stage, "pan");
      await get('[data-map-camera="camp"]').dispatch("keydown", {
        key: "ArrowRight",
      });
      assert.equal(state().learning.stage, "move");
      const first = state().roster[0].id;
      await click('[data-world-resident="0"]');
      await click("[data-resident-walk]");
      await get('[data-map-camera="camp"]').dispatch("click", {
        clientX: 500,
        clientY: 200,
        stopImmediatePropagation() {},
      });
      assert.equal(state().learning.stage, "profile");
      await click('[data-world-resident="0"]');
      await click("[data-resident-info]");
      assert.equal(state().learning.stage, "crossroads");
      await click("[data-close]");
      assert.equal(root.querySelector(".company-section"), null);
      assert.equal(root.querySelector("[data-card-hp]"), null);
      nextFrame(performance.now());
      assert.ok(get("[data-world-resident]"));

      await click('[data-building="tent"]');
      await click('[data-profile="' + first + '"]');
      assert.match(get("#modal-content").innerHTML, /Add a memory/);
      await click("[data-close]");

      await click('[data-building="crossroads"]');
      assert.equal(state().screen, "crossroads");
      assert.equal(root.querySelector("#hero-detail")?.innerHTML || "", "");
      await click('[data-destination="clearing"]');
      await click("[data-lock-route]");
      assert.equal(state().screen, "party");
      assert.equal(root.querySelector("#hero-detail")?.innerHTML || "", "");
      await click("#launch-btn");
      assert.equal(root.querySelector("#hero-detail")?.innerHTML || "", "");
      await click("#pause-btn");
      assert.equal(worker.sim.observation.paused, true);
      nextFrame(performance.now());
      await click("#game-home");
      worker.advance(600000);
      assert.equal(state().learning.stage, "pantry");
      await click('[data-building="pantry"]');
      await click('[data-food="1"]');
      await click("[data-close]");
      await click('[data-building="questboard"]');
      await click("[data-finish-learning]");
      assert.equal(state().learning.stage, "complete");
      worker.sim.g.gold = 10000;
      worker.sim.g.campXp = 300;
      for (const key in worker.sim.g.materials)
        worker.sim.g.materials[key] = 250;
      addGems(worker.sim.g, 100);
      worker.advance(100);
      await click("#brand-home");
      await click("[data-build-sites]");
      await click('[data-building="market"]');
      await click('[data-construct="market"]');
      assert.equal(state().buildings.market, 1);
      await click("[data-market-visit]");
      await click("#confirm-market-visit");
      assert.equal(state().screen, "market");
      assert.equal(root.querySelectorAll("[data-vendor-map]").length, 4);
      await click('[data-vendor-map="forge"]');
      const gear = state().market.forge.find(
        (o) => o.id === get("[data-buy]").dataset.buy,
      );
      await click('[data-buy="' + gear.id + '"]');
      assert.ok(state().inventory.some((i) => i.id === gear.item.id));
      await click("[data-close]");
      await click("#game-home");
      await click("#brand-home");
      await click("[data-build-sites]");
      await click("[data-upgrade-home]");
      await click('[data-construct="cabins"]');
      assert.equal(state().buildings.tent, 2);
      assert.equal(state().buildings.cabins, 1);
      await click("[data-more-menu]");
      await click('[data-nav="codex"]');
      assert.ok(get(".codex-page"));
      await click("#game-home");
      await click('[data-expand-camp="west"]');
      await click("#confirm-expansion");
      await click("#brand-home");
      await click("[data-build-sites]");
      await click('[data-building="guildhall"]');
      await click('[data-construct="guildhall"]');
      await click('[data-building="guildhall"]');
      assert.equal(root.querySelectorAll("[data-guild-booth]").length, 8);
      await click('[data-guild-booth="miners"]');
      await click('[data-guild-lesson="miners"]');
      assert.equal(state().guildStanding.miners, 10);
      await click("[data-close]");
      assert.ok(worker.sim.g.roster.every((h) => h.id));
    } finally {
      Math.random = originalRandom;
      Date.now = originalNow;
      for (const timer of intervals) clearInterval(timer);
      globalThis.setInterval = originalInterval;
      delete globalThis.Worker;
    }
  },
);
