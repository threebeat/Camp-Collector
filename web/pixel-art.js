// Evernight's original pixel sprites. No downloaded art, DOM, or raster filters.
// Every visible shape is authored onto an integer pixel grid, then serialized as
// crisp SVG rectangles so cards, maps and the battle canvas share the same art.
import {
  RACES,
  CLASSES,
  ITEMS,
  PETS,
  COSMETICS,
  MYTHICAL_HEROES,
  RARITY_COLORS,
  GEM_KINDS,
  itemRarity,
  heroRarity,
  hasAttribute,
  flightType,
  objectModifiers,
  GUILD_EQUIPMENT,
} from "./data.js?v=16";

export const PIXEL_PALETTE = Object.freeze({
  ink: "#0a0c1a",
  edge: "#171e3b",
  night: "#171e3b",
  dusk: "#353454",
  violet: "#655082",
  lavender: "#ad93c8",
  mist: "#c1c9d3",
  ivory: "#f7df9b",
  copper: "#b77b58",
  wood: "#785449",
  bark: "#4b3e46",
  gold: "#d98c43",
  amber: "#f4c76a",
  flame: "#ed824a",
  green: "#354d4b",
  leaf: "#79aa81",
  teal: "#92c9d0",
  blue: "#7892bb",
  metal: "#596481",
  paleMetal: "#c2d2dc",
});
const C = PIXEL_PALETTE;
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>\"]/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      })[c],
  );
const finite = (n, fallback = 0) => (Number.isFinite(n) ? n : fallback);
const hash = (s) => {
  let n = 2166136261;
  for (const c of String(s)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0;
};
const hue = (n, saturation = 0.46, lightness = 0.58) => {
  n = ((finite(n, 245) % 360) + 360) % 360;
  const a = saturation * Math.min(lightness, 1 - lightness);
  return (
    "#" +
    [0, 8, 4]
      .map((offset) => {
        const k = (offset + n / 30) % 12;
        return Math.round(
          255 * (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))),
        )
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
};
const mix = (color, other, fraction) => {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  return (
    "#" +
    [1, 3, 5]
      .map((p) =>
        Math.round(
          parseInt(color.slice(p, p + 2), 16) * (1 - fraction) +
            parseInt(other.slice(p, p + 2), 16) * fraction,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};
const dark = (c) => mix(c, C.ink, 0.43);
const light = (c) => mix(c, C.ivory, 0.37);

class Grid {
  constructor(w, h = w) {
    this.w = w;
    this.h = h;
    this.p = Array(w * h).fill(null);
    this.tags = [];
  }
  dot(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h)
      this.p[y * this.w + x] = c;
    return this;
  }
  rect(x, y, w, h, c) {
    for (let j = Math.round(y); j < Math.round(y + h); j++)
      for (let i = Math.round(x); i < Math.round(x + w); i++) this.dot(i, j, c);
    return this;
  }
  line(x, y, xx, yy, c, thickness = 1) {
    x = Math.round(x);
    y = Math.round(y);
    xx = Math.round(xx);
    yy = Math.round(yy);
    const dx = Math.abs(xx - x),
      sx = x < xx ? 1 : -1;
    const dy = -Math.abs(yy - y),
      sy = y < yy ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      this.rect(x, y, thickness, thickness, c);
      if (x === xx && y === yy) break;
      const e = error * 2;
      if (e >= dy) {
        error += dy;
        x += sx;
      }
      if (e <= dx) {
        error += dx;
        y += sy;
      }
    }
    return this;
  }
  poly(points, c) {
    // Scanline rasterization is intentional: diagonals have real staircase pixels.
    const ymin = Math.floor(Math.min(...points.map((p) => p[1])));
    const ymax = Math.ceil(Math.max(...points.map((p) => p[1])));
    for (let y = ymin; y < ymax; y++) {
      const xs = [];
      for (let n = 0; n < points.length; n++) {
        const a = points[n],
          b = points[(n + 1) % points.length];
        if (
          (a[1] <= y + 0.5 && b[1] > y + 0.5) ||
          (b[1] <= y + 0.5 && a[1] > y + 0.5)
        )
          xs.push(a[0] + ((y + 0.5 - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((a, b) => a - b);
      for (let n = 0; n < xs.length; n += 2)
        for (let x = Math.ceil(xs[n] - 0.5); x < xs[n + 1] - 0.5; x++)
          this.dot(x, y, c);
    }
    return this;
  }
  mask(rows, x, y, colors) {
    rows.forEach((r, j) =>
      [...r].forEach((v, i) => {
        if (colors[v]) this.dot(x + i, y + j, colors[v]);
      }),
    );
    return this;
  }
  copy(src, x, y, w = src.w, h = src.h, flip = false) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const sx = Math.floor((i * src.w) / w),
          sy = Math.floor((j * src.h) / h);
        const c = src.p[sy * src.w + (flip ? src.w - sx - 1 : sx)];
        if (c) this.dot(x + i, y + j, c);
      }
    this.tags.push(...src.tags);
    return this;
  }
  tag(key, value = "") {
    this.tags.push([key, String(value)]);
    return this;
  }
  outline(c = C.ink) {
    const src = this.p.slice();
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (!src[y * this.w + x]) continue;
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const xx = x + dx,
            yy = y + dy;
          if (
            xx >= 0 &&
            yy >= 0 &&
            xx < this.w &&
            yy < this.h &&
            !src[yy * this.w + xx]
          )
            this.dot(xx, yy, c);
        }
      }
    return this;
  }
  body() {
    // Merge equal horizontal runs into vertical rectangles. The geometry stays
    // exactly the authored grid while large map backgrounds stay inexpensive.
    const rects = [],
      active = new Map();
    for (let y = 0; y < this.h; y++) {
      const next = new Map();
      for (let x = 0; x < this.w;) {
        const c = this.p[y * this.w + x],
          begin = x;
        while (x < this.w && this.p[y * this.w + x] === c) x++;
        if (!c) continue;
        const key = begin + ":" + (x - begin) + ":" + c;
        const r = active.get(key) || { x: begin, y, w: x - begin, h: 0, c };
        r.h++;
        next.set(key, r);
      }
      for (const [key, r] of active) if (!next.has(key)) rects.push(r);
      active.clear();
      for (const [key, r] of next) active.set(key, r);
    }
    rects.push(...active.values());
    return rects
      .map(
        (r) =>
          `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${esc(r.c)}"/>`,
      )
      .join("");
  }
}
const svg = (g, type, attrs = "", dimensions = "") => {
  const markers = [
    ...new Map(g.tags.map(([k, v]) => [k + ":" + v, [k, v]])).values(),
  ]
    .map(([k, v]) => `<g ${k}="${esc(v)}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.w} ${g.h}" preserveAspectRatio="none" shape-rendering="crispEdges" style="image-rendering:pixelated" aria-hidden="true" data-pixel-art="${type}" ${attrs} ${dimensions}><g class="pixel-sprite portrait-body">${g.body()}</g>${markers}</svg>`;
};
const safeRarity = (item) =>
  Math.min(4, Math.max(0, itemRarity({ level: 1, ...item })));
const rarityPixels = (g, tier, x = 3, y = 3) => {
  if (tier < 1) return;
  const c = RARITY_COLORS[Math.min(4, tier)] || C.lavender;
  g.dot(x, y, c).dot(g.w - x - 1, y + 3, c);
  if (tier > 1) g.line(x - 1, y + 1, x + 1, y + 1, c).line(x, y, x, y + 2, c);
  if (tier > 2) g.rect(g.w - x - 3, g.h - 7, 2, 2, c).dot(x + 2, g.h - 5, c);
  if (tier === 4) g.tag("class", "character-aura rarity-sparks");
};

function modifierPixels(g, item, domain, small = false) {
  let mods = [];
  try {
    mods = objectModifiers(item, domain);
  } catch {
    /* Preview without a level is legal. */
  }
  for (let n = 0; n < mods.length; n++) {
    const m = mods[n],
      c = m.visual?.color || C.lavender;
    const x = small ? 5 + n * 5 : 7 + n * 8,
      y = small ? Math.min(g.h - 3, 25) : 27;
    g.dot(x, y, c)
      .dot(x + 1, y - 1, c)
      .dot(x + 2, y, c);
    if (!small) {
      const pattern = hash(m.key) % 4;
      g.dot(x + 1, y + 1, c);
      if (pattern & 1) g.dot(x - 1, y - 1, c);
      if (pattern & 2) g.dot(x + 3, y + 1, c);
      if (m.kind === "enchantment") {
        g.dot(3, 11, c).dot(28, 19, c).dot(26, 5, c);
        g.tag("class", "rarity-sparks modifier-flare");
      }
    }
    g.tag("data-modifier-art", `${domain}:${m.kind}:${m.key}`);
  }
}

function weaponGrid(item) {
  const d = ITEMS[item.key] || {},
    skin = COSMETICS[item.cosmetic];
  const g = new Grid(32),
    key = GUILD_EQUIPMENT[item.key?.slice(6)]?.[0] || item.key;
  const steel =
    skin?.skin === "crystal"
      ? "#9cdfdf"
      : skin?.skin === "brass"
        ? "#d1ad69"
        : C.paleMetal;
  const shadow = dark(steel),
    gold = skin?.skin === "crystal" ? C.teal : C.gold;
  const wood = ["bonebow", "bonewand"].includes(key) ? C.ivory : C.wood;
  const handle = (x = 15, y = 21, h = 7) =>
    g.rect(x, y, 2, h, wood).dot(x + 1, y + h - 1, gold);
  const blade = (points) =>
    g.poly(points, steel).line(points[0][0], points[0][1], 15, 20, shadow);
  g.tag("data-weapon-art", item.key);
  switch (key) {
    case "ironblade":
      blade([
        [15, 3],
        [17, 6],
        [17, 22],
        [14, 22],
        [14, 6],
      ]);
      g.rect(10, 22, 12, 2, gold);
      handle(15, 24, 5);
      break;
    case "dagger":
      blade([
        [15, 8],
        [19, 11],
        [17, 22],
        [14, 22],
        [12, 12],
      ]);
      g.rect(11, 22, 10, 2, gold);
      handle(15, 24, 5);
      break;
    case "greatblade":
      blade([
        [15, 2],
        [19, 5],
        [19, 22],
        [12, 22],
        [12, 5],
      ]);
      g.rect(8, 22, 17, 2, gold);
      handle(15, 24, 6);
      g.rect(15, 6, 1, 14, C.ivory);
      break;
    case "salamander":
      blade([
        [23, 3],
        [22, 10],
        [18, 20],
        [14, 23],
        [11, 21],
        [15, 15],
        [19, 8],
      ]);
      g.line(9, 23, 20, 23, gold, 2);
      handle(13, 25, 4);
      break;
    case "rapier":
      g.line(18, 2, 14, 23, steel);
      g.line(10, 23, 21, 23, gold);
      g.line(10, 24, 18, 27, gold);
      handle(14, 25, 4);
      break;
    case "cutlass":
      blade([
        [23, 4],
        [23, 10],
        [20, 18],
        [14, 24],
        [10, 21],
        [16, 17],
        [20, 8],
      ]);
      g.rect(8, 23, 13, 2, gold)
        .rect(7, 24, 2, 5, gold)
        .rect(8, 28, 9, 1, gold);
      handle(13, 25, 4);
      break;
    case "falchion":
      blade([
        [11, 7],
        [20, 3],
        [19, 10],
        [21, 21],
        [13, 23],
      ]);
      g.rect(8, 23, 17, 2, gold);
      handle(15, 25, 4);
      break;
    case "kukri":
      blade([
        [19, 3],
        [24, 7],
        [17, 16],
        [18, 22],
        [13, 24],
        [9, 13],
      ]);
      g.line(11, 24, 22, 21, gold, 2);
      handle(14, 25, 4);
      break;
    case "estoc":
      blade([
        [16, 2],
        [18, 9],
        [17, 23],
        [14, 23],
        [15, 9],
      ]);
      g.rect(9, 23, 14, 2, gold).rect(13, 28, 7, 1, gold);
      handle(15, 25, 5);
      break;
    case "twinblade":
      blade([
        [17, 2],
        [19, 6],
        [18, 13],
        [14, 14],
        [11, 7],
      ]);
      g.poly(
        [
          [14, 19],
          [18, 20],
          [21, 26],
          [18, 30],
          [13, 27],
        ],
        steel,
      );
      g.rect(9, 15, 15, 2, gold).rect(15, 14, 2, 8, wood);
      break;
    case "flamberge":
      g.poly(
        [
          [16, 2],
          [20, 4],
          [16, 8],
          [20, 12],
          [16, 16],
          [19, 20],
          [17, 23],
          [12, 23],
          [13, 18],
          [11, 15],
          [15, 11],
          [12, 8],
          [15, 4],
        ],
        steel,
      );
      g.rect(8, 23, 17, 2, gold);
      handle(15, 25, 5);
      break;
    case "executioner":
      g.rect(11, 3, 10, 19, steel)
        .rect(11, 3, 2, 19, shadow)
        .rect(14, 5, 4, 1, C.ivory)
        .rect(8, 23, 17, 2, gold);
      handle(15, 25, 5);
      break;
    case "katana":
      g.poly(
        [
          [22, 2],
          [22, 9],
          [19, 17],
          [15, 23],
          [12, 22],
          [16, 14],
          [19, 6],
        ],
        steel,
      );
      g.line(10, 23, 20, 23, gold, 2);
      g.line(14, 25, 12, 29, wood, 2);
      break;
    case "hatchet":
      handle(14, 7, 22);
      g.poly(
        [
          [15, 6],
          [22, 5],
          [27, 8],
          [27, 14],
          [16, 17],
        ],
        steel,
      );
      g.rect(24, 8, 2, 6, shadow);
      break;
    case "waraxe":
      handle(15, 4, 25);
      g.poly(
        [
          [12, 6],
          [4, 3],
          [4, 15],
          [13, 18],
          [19, 18],
          [28, 15],
          [28, 3],
          [19, 6],
        ],
        steel,
      );
      g.rect(14, 7, 4, 6, gold);
      break;
    case "crescentaxe":
      handle(13, 3, 26);
      g.poly(
        [
          [15, 4],
          [23, 5],
          [27, 10],
          [27, 17],
          [23, 21],
          [19, 18],
          [22, 14],
          [22, 9],
          [15, 8],
        ],
        steel,
      );
      break;
    case "hammer":
      handle(15, 14, 15);
      g.rect(6, 5, 21, 10, steel)
        .rect(6, 5, 3, 10, shadow)
        .rect(22, 5, 5, 10, gold)
        .rect(11, 7, 9, 2, C.ivory);
      break;
    case "monkmaul":
      handle(15, 16, 13);
      g.poly(
        [
          [16, 3],
          [22, 7],
          [22, 13],
          [16, 18],
          [10, 13],
          [10, 7],
        ],
        steel,
      ).rect(15, 6, 2, 8, gold);
      break;
    case "flail":
      handle(9, 21, 9);
      g.line(10, 22, 23, 12, C.metal);
      g.poly(
        [
          [22, 3],
          [27, 5],
          [29, 9],
          [27, 14],
          [20, 15],
          [17, 11],
          [18, 6],
        ],
        steel,
      ).dot(24, 7, C.ivory);
      break;
    case "morningstar":
      handle(15, 17, 12);
      g.rect(11, 7, 10, 10, steel)
        .poly(
          [
            [15, 2],
            [18, 8],
            [22, 5],
            [21, 11],
            [26, 12],
            [20, 15],
            [22, 19],
            [17, 17],
            [15, 22],
            [13, 16],
            [8, 19],
            [10, 13],
            [5, 11],
            [11, 9],
          ],
          steel,
        )
        .rect(13, 9, 5, 5, shadow)
        .dot(14, 10, C.ivory);
      break;
    case "club":
      g.poly(
        [
          [10, 3],
          [18, 3],
          [22, 8],
          [22, 18],
          [18, 22],
          [18, 29],
          [14, 29],
          [13, 21],
          [10, 18],
          [8, 8],
        ],
        wood,
      )
        .rect(13, 5, 2, 12, light(wood))
        .line(11, 8, 19, 7, gold);
      break;
    case "spear":
      handle(15, 12, 18);
      blade([
        [16, 1],
        [21, 8],
        [17, 14],
        [14, 14],
        [11, 8],
      ]);
      g.rect(14, 14, 4, 2, gold);
      break;
    case "glaive":
      handle(14, 12, 18);
      g.poly(
        [
          [19, 2],
          [23, 6],
          [24, 11],
          [22, 16],
          [15, 18],
          [11, 15],
          [16, 13],
          [19, 9],
        ],
        steel,
      );
      break;
    case "halberd":
      handle(14, 3, 27);
      g.poly(
        [
          [15, 1],
          [18, 7],
          [16, 10],
          [23, 7],
          [26, 10],
          [25, 18],
          [18, 16],
          [10, 17],
          [6, 13],
          [6, 8],
          [12, 11],
        ],
        steel,
      );
      g.rect(13, 11, 4, 4, gold);
      break;
    case "trident":
      handle(15, 17, 13);
      g.rect(8, 5, 3, 8, steel)
        .rect(15, 2, 3, 14, steel)
        .rect(23, 5, 3, 8, steel)
        .line(9, 13, 16, 18, steel, 2)
        .line(16, 18, 24, 13, steel, 2);
      break;
    case "scythe":
      handle(11, 5, 25);
      g.poly(
        [
          [11, 4],
          [17, 2],
          [23, 3],
          [28, 7],
          [29, 13],
          [24, 10],
          [18, 8],
          [11, 8],
        ],
        steel,
      );
      break;
    case "longbow":
    case "shortbow":
    case "recurved":
    case "stormbow":
    case "bonebow": {
      const short = key === "shortbow",
        top = short ? 7 : 3,
        bottom = short ? 26 : 29;
      g.line(10, top, 10, bottom, C.mist);
      const bend =
        key === "stormbow"
          ? [
              [11, top],
              [17, 7],
              [15, 11],
              [23, 16],
              [15, 21],
              [17, 26],
              [11, bottom],
            ]
          : key === "recurved"
            ? [
                [11, top],
                [8, 6],
                [15, 11],
                [20, 16],
                [15, 21],
                [8, 26],
                [11, bottom],
              ]
            : [
                [11, top],
                [17, top + 4],
                [21, 15],
                [19, bottom - 5],
                [11, bottom],
              ];
      for (let n = 0; n < bend.length - 1; n++)
        g.line(...bend[n], ...bend[n + 1], wood, 2);
      g.line(6, 16, 26, 16, C.ivory)
        .line(23, 14, 26, 16, C.ivory)
        .line(26, 16, 23, 18, C.ivory);
      if (key === "bonebow")
        for (const y of [7, 13, 20, 26]) g.line(16, y, 21, y - 3, wood);
      if (key === "stormbow")
        g.rect(9, 3, 5, 3, C.metal).rect(9, 27, 5, 3, C.metal);
      break;
    }
    case "crossbow":
    case "arbalest":
    case "repeatingbow": {
      const big = key === "arbalest";
      g.poly(
        [
          [3, big ? 8 : 10],
          [11, 14],
          [22, 14],
          [29, big ? 8 : 10],
          [28, 18],
          [23, 20],
          [10, 20],
          [4, 18],
        ],
        wood,
      );
      g.rect(15, 7, 3, 21, steel)
        .line(5, 9, 27, 9, C.mist)
        .rect(13, 23, 7, 3, wood);
      if (key === "repeatingbow")
        g.rect(13, 12, 7, 7, gold)
          .line(14, 11, 14, 19, shadow)
          .line(17, 11, 17, 19, shadow);
      else if (big) g.rect(11, 18, 11, 4, gold);
      break;
    }
    case "musket":
    case "arquebus":
    case "longrifle":
    case "blunderbuss": {
      g.poly(
        [
          [4, 26],
          [8, 19],
          [13, 20],
          [27, 5],
          [29, 7],
          [15, 23],
          [11, 25],
          [9, 30],
        ],
        wood,
      );
      g.line(11, 20, 27, 4, steel, 3).line(12, 20, 28, 4, shadow);
      g.rect(12, 22, 3, 3, gold);
      if (key === "blunderbuss")
        g.poly(
          [
            [24, 8],
            [25, 2],
            [31, 7],
            [26, 11],
          ],
          steel,
        );
      if (key === "arquebus")
        g.rect(20, 13, 4, 2, gold).rect(6, 24, 4, 2, gold);
      if (key === "longrifle")
        g.line(9, 19, 25, 3, gold).rect(17, 9, 5, 3, C.ink);
      break;
    }
    case "revolver":
    case "handcannon":
    case "duelpistol":
    case "pepperbox": {
      g.rect(8, 10, 18, key === "handcannon" ? 6 : 4, steel)
        .rect(8, 14, 8, 6, wood)
        .poly(
          [
            [9, 17],
            [15, 17],
            [12, 27],
            [6, 27],
          ],
          wood,
        )
        .rect(24, 10, 3, 5, shadow);
      if (key === "revolver")
        g.rect(12, 12, 6, 5, gold).dot(14, 13, shadow).dot(16, 15, shadow);
      if (key === "pepperbox")
        g.rect(19, 7, 8, 3, steel)
          .rect(19, 14, 8, 3, shadow)
          .dot(26, 8, C.ink)
          .dot(26, 15, C.ink);
      if (key === "duelpistol")
        g.rect(6, 11, 2, 3, gold).line(11, 18, 16, 18, gold);
      break;
    }
    case "cannon":
    case "mortar":
    case "cometarm": {
      const theme = key === "cometarm";
      g.poly(
        key === "mortar"
          ? [
              [10, 4],
              [24, 5],
              [22, 19],
              [12, 19],
            ]
          : [
              [4, 9],
              [25, 6],
              [28, 10],
              [27, 19],
              [7, 21],
            ],
        theme ? gold : C.metal,
      );
      g.rect(
        key === "mortar" ? 11 : 3,
        key === "mortar" ? 4 : 10,
        key === "mortar" ? 13 : 3,
        key === "mortar" ? 3 : 10,
        shadow,
      );
      g.rect(8, 23, 18, 3, wood)
        .rect(5, 23, 5, 6, shadow)
        .rect(24, 23, 5, 6, shadow)
        .dot(7, 25, gold)
        .dot(26, 25, gold);
      if (theme) g.rect(17, 10, 8, 3, "#8edbe5").rect(13, 17, 5, 3, C.blue);
      break;
    }
    case "willowstaff":
    case "crystalstaff":
    case "sunstaff":
    case "bonewand":
    case "forkedrod":
    case "ember":
    case "frost":
    case "lens":
    case "riftfocus": {
      const tall = d.weaponKind === "staff",
        yy = tall ? 2 : 7;
      handle(15, yy + 9, tall ? 20 : 13);
      if (key === "willowstaff")
        g.line(15, yy + 9, 11, yy + 4, wood, 2)
          .rect(10, yy, 9, 2, wood)
          .rect(17, yy + 2, 2, 5, wood)
          .dot(11, yy + 2, C.leaf);
      else if (key === "bonewand")
        g.rect(11, yy + 2, 10, 5, C.ivory)
          .rect(12, yy, 2, 3, C.ivory)
          .rect(18, yy, 2, 3, C.ivory)
          .dot(12, yy + 3, C.ink)
          .dot(18, yy + 3, C.ink);
      else if (key === "forkedrod")
        g.line(11, yy, 11, yy + 7, steel, 2)
          .line(20, yy, 20, yy + 7, steel, 2)
          .rect(12, yy + 7, 9, 2, steel);
      else {
        const gem =
          key === "ember"
            ? C.flame
            : key === "frost"
              ? C.teal
              : key === "sunstaff"
                ? C.amber
                : key === "riftfocus"
                  ? "#ba9dec"
                  : C.lavender;
        g.poly(
          [
            [16, yy],
            [21, yy + 5],
            [18, yy + 11],
            [13, yy + 11],
            [10, yy + 5],
          ],
          gem,
        )
          .rect(13, yy + 3, 2, 4, C.ivory)
          .rect(12, yy + 10, 9, 2, gold);
        if (key === "riftfocus")
          g.rect(8, yy + 5, 2, 4, C.blue).rect(23, yy + 2, 2, 4, C.lavender);
      }
      break;
    }
    case "dawncore":
      handle(15, 17, 12);
      g.rect(9, 6, 15, 11, gold)
        .rect(6, 9, 3, 5, gold)
        .rect(24, 9, 3, 5, gold)
        .rect(14, 2, 5, 4, gold)
        .rect(13, 9, 7, 5, C.amber)
        .rect(15, 10, 3, 3, C.ivory);
      break;
    case "riftlance":
      handle(15, 11, 19);
      g.poly(
        [
          [16, 1],
          [22, 7],
          [18, 13],
          [13, 13],
          [10, 7],
        ],
        "#ba9dec",
      )
        .line(16, 3, 16, 9, C.ivory)
        .rect(10, 15, 12, 2, C.blue)
        .dot(8, 8, C.lavender)
        .dot(24, 11, C.lavender);
      break;
    case "pickaxe":
      g.line(8, 29, 19, 8, wood, 3).poly(
        [
          [7, 8],
          [11, 4],
          [20, 4],
          [27, 10],
          [26, 13],
          [21, 9],
          [13, 7],
        ],
        steel,
      );
      break;
    case "axe":
      g.line(11, 29, 19, 5, wood, 3)
        .poly(
          [
            [18, 7],
            [26, 4],
            [29, 7],
            [26, 16],
            [18, 16],
          ],
          steel,
        )
        .rect(24, 7, 2, 7, shadow);
      break;
    default:
      g.rect(10, 7, 13, 12, steel)
        .rect(15, 19, 3, 10, wood)
        .rect(13, 9, 6, 3, gold);
  }
  if (d.guildOnly) g.rect(24, 25, 4, 4, C.gold).dot(25, 26, C.ivory);
  g.outline();
  if (item.evolution)
    g.dot(13, 20, C.amber).dot(17, 17, C.amber).dot(19, 21, C.amber);
  modifierPixels(g, item, "weapon");
  if (d.mythicTheme) {
    rarityPixels(g, 4);
    g.tag("class", "character-aura");
  }
  return g;
}

function armorGrid(item) {
  const d = ITEMS[item.key] || {},
    g = new Grid(32),
    slot = d.armorSlot || "chest";
  const color =
    d.visualColor ||
    { light: C.violet, medium: C.green, heavy: C.metal }[d.weight] ||
    C.metal;
  const shade = dark(color),
    hi = light(color);
  g.tag("data-armor-art", slot);
  if (slot === "head") {
    g.poly(
      [
        [11, 5],
        [21, 5],
        [26, 10],
        [26, 21],
        [22, 24],
        [19, 18],
        [13, 18],
        [10, 24],
        [6, 21],
        [6, 10],
      ],
      color,
    )
      .rect(10, 11, 12, 7, C.ink)
      .rect(12, 12, 8, 5, C.ivory)
      .rect(9, 8, 14, 2, hi);
    if (d.weight === "heavy")
      g.rect(10, 13, 12, 2, shade).rect(15, 6, 2, 17, hi).dot(19, 14, C.amber);
    if (d.weight === "light")
      g.rect(6, 21, 4, 5, shade).rect(23, 21, 4, 5, shade);
  } else if (slot === "chest") {
    g.poly(
      [
        [10, 6],
        [13, 5],
        [19, 5],
        [22, 6],
        [28, 11],
        [26, 17],
        [23, 15],
        [23, 27],
        [9, 27],
        [9, 15],
        [6, 17],
        [4, 11],
      ],
      color,
    )
      .rect(12, 5, 8, 4, C.ink)
      .rect(11, 10, 2, 14, hi)
      .rect(21, 12, 2, 13, shade)
      .rect(9, 21, 14, 3, C.wood)
      .rect(14, 21, 4, 3, C.gold);
    if (d.weight === "heavy")
      g.rect(5, 8, 8, 4, hi)
        .rect(19, 8, 8, 4, hi)
        .rect(13, 12, 7, 6, shade)
        .rect(14, 12, 5, 1, hi);
    if (["scaleMail", "glacier"].includes(item.key))
      for (let y = 11; y < 23; y += 3)
        for (let x = 11; x < 23; x += 4) g.rect(x, y, 2, 1, hi);
    if (item.key === "starRobe" || item.key === "robe")
      g.rect(9, 25, 14, 3, shade).dot(19, 15, C.amber).dot(13, 19, C.ivory);
    if (item.key === "trailLeather")
      g.rect(9, 15, 5, 4, C.copper).rect(19, 18, 4, 3, C.copper);
  } else if (slot === "legs") {
    g.rect(8, 5, 16, 6, color)
      .rect(8, 11, 7, 17, color)
      .rect(17, 11, 7, 17, color)
      .rect(8, 5, 16, 2, C.wood)
      .rect(14, 5, 4, 2, C.gold)
      .rect(9, 13, 2, 13, hi)
      .rect(22, 13, 2, 15, shade);
    if (d.weight === "heavy") g.rect(8, 17, 7, 3, hi).rect(17, 17, 7, 3, hi);
  } else {
    g.rect(8, 6, 6, 15, color)
      .rect(19, 6, 6, 15, color)
      .rect(4, 20, 10, 6, color)
      .rect(19, 20, 10, 6, color)
      .rect(4, 25, 10, 2, shade)
      .rect(19, 25, 10, 2, shade)
      .rect(8, 7, 6, 3, hi)
      .rect(19, 7, 6, 3, hi);
    if (d.weight === "heavy")
      g.rect(6, 14, 8, 4, hi)
        .rect(19, 14, 8, 4, hi)
        .rect(3, 22, 11, 2, hi)
        .rect(19, 22, 11, 2, hi);
    else if (d.weight === "medium")
      g.rect(8, 15, 6, 2, C.gold)
        .rect(19, 15, 6, 2, C.gold)
        .dot(11, 16, C.ivory)
        .dot(22, 16, C.ivory);
    else
      g.rect(8, 10, 6, 1, shade)
        .rect(19, 10, 6, 1, shade)
        .rect(8, 17, 2, 3, hi)
        .rect(19, 17, 2, 3, hi);
    if (item.key.includes("night-boots"))
      g.rect(9, 16, 4, 3, C.lavender)
        .rect(20, 16, 4, 3, C.lavender)
        .dot(11, 15, C.ivory)
        .dot(22, 15, C.ivory);
  }
  g.outline();
  modifierPixels(g, item, "armor");
  if (item.evolution)
    g.dot(14, 10, C.amber).dot(16, 9, C.amber).dot(18, 10, C.amber);
  return g;
}

function lanternGrid(item) {
  const g = new Grid(32),
    d = ITEMS[item.key] || {},
    c = d.lightColor || C.amber;
  g.tag("data-light-art", item.key);
  g.rect(13, 4, 6, 2, C.gold)
    .rect(11, 6, 2, 5, C.gold)
    .rect(19, 6, 2, 5, C.gold)
    .poly(
      [
        [10, 10],
        [22, 10],
        [25, 14],
        [7, 14],
      ],
      C.gold,
    )
    .rect(9, 14, 14, 13, C.wood)
    .rect(11, 15, 10, 10, c)
    .rect(14, 17, 4, 6, C.ivory)
    .rect(15, 15, 2, 2, light(c))
    .rect(15, 15, 1, 10, C.gold)
    .rect(9, 25, 14, 3, C.gold);
  if (item.key !== "hooded-lantern")
    g.dot(5, 16, c).dot(25, 22, c).dot(8, 6, c);
  return g.outline();
}

function accessoryGrid(item) {
  const g = new Grid(32),
    d = ITEMS[item.key] || {},
    key = GUILD_EQUIPMENT[item.key?.slice(6)]?.[0] || item.key;
  if (d.type === "light") return lanternGrid(item);
  if (d.type === "armor") return armorGrid(item);
  if (d.weaponKind || ["mining", "woodcutting"].includes(d.type))
    return weaponGrid(item);
  switch (key) {
    case "aegis":
      g.poly(
        [
          [5, 7],
          [16, 3],
          [27, 7],
          [26, 19],
          [22, 25],
          [16, 29],
          [10, 25],
          [6, 19],
        ],
        C.metal,
      )
        .poly(
          [
            [8, 9],
            [16, 6],
            [24, 9],
            [23, 18],
            [20, 22],
            [16, 26],
            [12, 22],
            [9, 18],
          ],
          C.green,
        )
        .rect(14, 9, 3, 15, C.gold)
        .rect(9, 14, 14, 3, C.gold);
      break;
    case "tome":
      g.rect(6, 5, 21, 24, C.violet)
        .rect(9, 5, 3, 24, C.gold)
        .rect(12, 6, 14, 2, C.ivory)
        .rect(13, 11, 9, 11, dark(C.violet))
        .rect(16, 14, 3, 5, C.amber)
        .rect(14, 16, 7, 1, C.amber)
        .rect(24, 18, 4, 3, C.gold);
      break;
    case "quiver":
      g.poly(
        [
          [8, 8],
          [23, 8],
          [21, 27],
          [11, 29],
        ],
        C.wood,
      )
        .rect(10, 9, 12, 3, C.gold)
        .line(12, 16, 21, 18, C.copper)
        .line(13, 3, 13, 11, C.ivory)
        .line(17, 2, 17, 10, C.ivory)
        .line(21, 4, 21, 11, C.ivory)
        .rect(11, 2, 4, 3, C.leaf)
        .rect(15, 1, 4, 3, C.teal)
        .rect(19, 3, 4, 3, C.leaf);
      break;
    case "wings":
      wingPixels(g, "moth", 0, 16, 18);
      g.rect(13, 8, 6, 20, C.violet).rect(14, 9, 4, 3, C.gold);
      break;
    case "boots":
      return armorGrid({ ...item, key: "medium-boots" }).tag(
        "data-item-art",
        item.key,
      );
    case "bell":
      g.rect(14, 5, 4, 4, C.gold)
        .poly(
          [
            [13, 9],
            [20, 9],
            [23, 23],
            [10, 23],
          ],
          C.gold,
        )
        .rect(8, 22, 17, 3, C.amber)
        .rect(14, 25, 5, 3, C.copper)
        .rect(13, 11, 2, 7, C.ivory);
      break;
    case "pendant":
      g.line(7, 4, 10, 14, C.gold)
        .line(10, 14, 16, 20, C.gold)
        .line(16, 20, 23, 12, C.gold)
        .line(23, 12, 25, 4, C.gold)
        .poly(
          [
            [16, 16],
            [21, 22],
            [17, 29],
            [12, 22],
          ],
          C.teal,
        )
        .dot(16, 21, C.ivory);
      break;
    case "lute":
      g.poly(
        [
          [12, 14],
          [20, 14],
          [24, 19],
          [24, 25],
          [19, 29],
          [11, 29],
          [6, 25],
          [6, 20],
        ],
        C.copper,
      )
        .rect(15, 3, 4, 13, C.wood)
        .rect(13, 2, 8, 3, C.gold)
        .rect(12, 19, 6, 7, C.bark)
        .line(15, 4, 14, 25, C.ivory)
        .line(17, 4, 16, 25, C.gold);
      break;
    case "haste":
      g.poly(
        [
          [15, 4],
          [24, 7],
          [27, 15],
          [23, 24],
          [15, 28],
          [6, 24],
          [3, 15],
          [7, 7],
        ],
        C.gold,
      )
        .rect(10, 10, 12, 12, C.metal)
        .rect(14, 6, 4, 20, C.wood)
        .rect(6, 14, 20, 4, C.wood)
        .rect(13, 13, 6, 6, C.teal)
        .dot(14, 14, C.ivory);
      break;
    case "spring":
      for (let y = 7; y < 26; y += 4)
        g.rect(6, y, 20, 2, C.metal)
          .rect(6, y, 3, 4, C.gold)
          .rect(23, y + 2, 3, 2, C.gold);
      g.rect(13, 3, 6, 3, C.gold);
      break;
    case "kit":
      g.rect(5, 11, 23, 16, C.wood)
        .rect(11, 5, 11, 2, C.gold)
        .rect(10, 7, 2, 5, C.gold)
        .rect(21, 7, 2, 5, C.gold)
        .rect(5, 13, 23, 3, C.copper)
        .rect(14, 14, 5, 7, C.amber)
        .rect(10, 17, 13, 2, C.amber);
      break;
    default:
      if (d.type === "scroll") {
        const c =
          {
            scrollEmber: C.flame,
            scrollGravity: C.lavender,
            scrollFrost: C.teal,
            scrollSpring: C.leaf,
          }[key] || C.lavender;
        g.rect(7, 6, 18, 22, C.ivory)
          .rect(5, 4, 21, 4, C.gold)
          .rect(6, 26, 21, 3, C.gold)
          .rect(24, 7, 3, 19, C.copper)
          .rect(11, 11, 10, 1, C.copper)
          .rect(11, 22, 10, 1, C.copper)
          .poly(
            [
              [16, 13],
              [20, 17],
              [16, 21],
              [12, 17],
            ],
            c,
          )
          .dot(16, 16, C.ivory);
      } else {
        g.rect(8, 10, 16, 16, C.wood)
          .rect(7, 8, 18, 4, C.gold)
          .rect(13, 14, 6, 7, C.teal)
          .dot(14, 15, C.ivory);
      }
  }
  g.tag("data-item-art", item.key).outline();
  modifierPixels(g, item, "weapon");
  return g;
}

export function pixelItemSvg(item = {}) {
  item = typeof item === "string" ? { key: item, level: 1 } : item;
  const g = accessoryGrid(item);
  rarityPixels(g, safeRarity(item));
  return svg(g, "item", `data-item-key="${esc(item.key)}"`);
}

export function pixelWeaponPresentation(item = {}) {
  const g = weaponGrid(item);
  return `<g shape-rendering="crispEdges" data-weapon-art="${esc(item.key)}" transform="scale(3.125)">${g.body()}${g.tags.map(([k, v]) => `<g ${k}="${esc(v)}"/>`).join("")}</g>`;
}

export function pixelModifiersArt(obj, kind) {
  const g = new Grid(32);
  modifierPixels(g, obj, kind);
  return `<g shape-rendering="crispEdges" transform="scale(3.125)">${g.body()}${g.tags.map(([k, v]) => `<g ${k}="${esc(v)}"/>`).join("")}</g>`;
}

function wingPixels(g, type = "feather", pose = 0, center = 16, yy = 20) {
  const up = Math.floor(Math.abs(pose)) % 2 === 1,
    y = yy - (up ? 3 : 0);
  const color =
    {
      feather: C.ivory,
      mechanical: C.metal,
      leather: C.violet,
      arcane: C.lavender,
      moth: C.copper,
      insect: C.teal,
    }[type] || C.teal;
  for (const side of [-1, 1]) {
    const x = (n) => center + side * n;
    const pts =
      type === "feather"
        ? [
            [x(3), y + 5],
            [x(11), y],
            [x(14), y - 8],
            [x(14), y + 1],
            [x(11), y + 8],
            [x(8), y + 4],
            [x(6), y + 10],
          ]
        : type === "mechanical"
          ? [
              [x(3), y + 5],
              [x(6), y - 1],
              [x(14), y - 8],
              [x(14), y - 1],
              [x(9), y + 3],
              [x(14), y + 4],
              [x(12), y + 9],
              [x(6), y + 10],
            ]
          : type === "leather"
            ? [
                [x(3), y + 6],
                [x(14), y - 8],
                [x(14), y + 2],
                [x(10), y],
                [x(9), y + 7],
                [x(6), y + 5],
                [x(4), y + 11],
              ]
            : [
                [x(3), y + 5],
                [x(8), y - 6],
                [x(13), y - 8],
                [x(14), y - 1],
                [x(11), y + 5],
                [x(14), y + 8],
                [x(11), y + 12],
                [x(5), y + 10],
              ];
    g.poly(pts, dark(color));
    g.line(x(5), y + 5, x(12), y - 4, color, 2).line(
      x(6),
      y + 7,
      x(11),
      y + 7,
      color,
      2,
    );
    if (type === "moth")
      g.rect(x(11), y - 2, 2, 2, C.ivory).rect(x(9), y + 7, 2, 2, C.gold);
    else if (type === "feather")
      for (let n = 0; n < 3; n++)
        g.line(x(7 + n), y + 5 + n, x(12 + n), y - n, color);
    else if (type === "mechanical")
      g.dot(x(5), y + 7, C.amber).dot(x(9), y + 1, C.amber);
    else g.dot(x(11), y, C.ivory).dot(x(9), y + 8, C.ivory);
  }
  g.tag("data-wing-type", type).tag(
    "class",
    `flight-wings wing-left wing-right ${type}-left ${type}-right`,
  );
}

export function pixelWingArt(type, pose = 0) {
  const g = new Grid(32, 34);
  wingPixels(g, type, pose, 16, 19);
  return `<g data-wing-type="${esc(type)}" class="flight-wings ${esc(type)}-left ${esc(type)}-right" shape-rendering="crispEdges" transform="scale(3.125)">${g.body()}</g>`;
}

function petGrid(pet = {}, pose = 0) {
  const skin = COSMETICS[pet.cosmetic],
    g = new Grid(24);
  const key =
    skin?.type === "pet"
      ? skin.skin === "moonfox"
        ? "fox"
        : "beetle"
      : pet.key || "fox";
  const d = PETS[key] || PETS.fox,
    c = pet.visualColor || skin?.color || d.color || C.copper;
  const shade = dark(c),
    hi = light(c),
    step = Math.round(pose) % 2;
  switch (key) {
    case "fox":
      g.mask(
        [
          "..cc............c....c..",
          ".cccc..........cc...cc..",
          ".cccccc........ccc.ccc..",
          "..cccccc......cccccccc..",
          "...cccccc.....cceeccce...",
          ".....ccccccccccchccch...",
          "......ccccccccccchhn....",
          "......ccscccccccchhh....",
          "......ccssscccccccc.....",
          "......cc...cc...cc......",
          "......cc...cc...cc......",
        ],
        0,
        8,
        { c, s: shade, h: C.ivory, e: C.ink, n: C.ink },
      );
      g.rect(1, 9, 3, 2, C.ivory).dot(17, 12, C.ivory).dot(22, 12, C.ivory);
      if (step)
        g.dot(6, 19, null).dot(8, 19, c).dot(17, 19, null).dot(18, 19, c);
      break;
    case "horse":
      g.poly(
        [
          [4, 11],
          [13, 10],
          [16, 6],
          [17, 2],
          [20, 4],
          [20, 8],
          [23, 11],
          [21, 14],
          [18, 14],
          [17, 18],
          [6, 18],
        ],
        c,
      )
        .rect(5, 17, 2, 5, c)
        .rect(10, 17, 2, 5, c)
        .rect(16, 16, 2, 6, c)
        .rect(19, 15, 2, 7, c)
        .line(4, 12, 2, 18, shade, 2)
        .rect(14, 7, 2, 9, shade)
        .rect(8, 10, 7, 5, C.wood)
        .rect(8, 10, 7, 1, C.gold)
        .dot(19, 8, C.ink)
        .dot(21, 11, C.ivory);
      if (step)
        g.dot(5, 21, null).dot(6, 21, c).dot(19, 21, null).dot(20, 21, c);
      break;
    case "raptor":
    case "hadrosaur":
      g.poly(
        [
          [2, 9],
          [6, 13],
          [12, 12],
          [15, 8],
          [16, 4],
          [21, 4],
          [23, 8],
          [21, 12],
          [17, 13],
          [17, 17],
          [8, 18],
          [4, 16],
        ],
        c,
      )
        .line(2, 9, 6, 16, shade)
        .rect(9, 17, 2, 4, c)
        .rect(7 + step, 21, 5, 1, shade)
        .rect(15, 17, 2, 4, c)
        .rect(14 - step, 21, 5, 1, shade)
        .dot(20, 7, C.ink)
        .rect(20, 10, 3, 1, C.ivory)
        .rect(13, 13, 4, 2, hi);
      if (key === "hadrosaur")
        g.rect(14, 4, 5, 2, shade)
          .rect(7, 11, 9, 4, C.wood)
          .rect(7, 11, 9, 1, C.gold)
          .dot(18, 5, hi);
      else g.dot(9, 13, shade).dot(12, 15, shade).dot(16, 11, shade);
      break;
    case "sprite":
      g.poly(
        [
          [8, 10],
          [1, 6],
          [2, 13],
          [7, 16],
        ],
        C.teal,
      )
        .poly(
          [
            [16, 10],
            [23, 6],
            [22, 13],
            [17, 16],
          ],
          C.teal,
        )
        .rect(9, 6, 7, 9, c)
        .rect(7, 11, 11, 6, c)
        .poly(
          [
            [8, 16],
            [16, 16],
            [19, 21],
            [13, 19],
            [10, 22],
            [5, 20],
          ],
          c,
        )
        .dot(11, 10, C.ink)
        .dot(14, 10, C.ink)
        .rect(11, 14, 3, 1, C.ivory)
        .dot(3, 5, C.amber)
        .dot(21, 3, C.amber);
      break;
    case "mote":
      g.poly(
        [
          [7, 7],
          [11, 4],
          [16, 6],
          [19, 10],
          [18, 16],
          [21, 20],
          [15, 19],
          [11, 22],
          [9, 18],
          [4, 20],
          [6, 14],
        ],
        c,
      )
        .dot(10, 11, C.ink)
        .dot(15, 11, C.ink)
        .rect(10, 15, 5, 1, C.ivory)
        .rect(11, 1, 6, 2, C.ivory)
        .rect(8, 3, 3, 3, C.ivory)
        .rect(8, 6, 2, 2, C.ivory)
        .dot(21, 7, C.ivory);
      break;
    case "beetle":
      g.rect(7, 6, 11, 13, c)
        .rect(9, 4, 7, 17, c)
        .rect(12, 6, 1, 14, C.gold)
        .line(7, 7, 3, 5, shade)
        .line(6, 11, 2, 11, shade)
        .line(7, 17, 3, 20, shade)
        .line(18, 7, 22, 5, shade)
        .line(18, 11, 22, 11, shade)
        .line(18, 17, 22, 20, shade)
        .dot(10, 7, C.amber)
        .dot(15, 7, C.amber)
        .rect(9, 12, 2, 4, hi);
      if (skin?.skin === "tinpet")
        g.rect(17, 8, 5, 2, C.gold)
          .rect(20, 6, 2, 6, C.gold)
          .dot(10, 7, C.teal)
          .dot(15, 7, C.teal);
      break;
    case "ammonite":
      g.poly(
        [
          [9, 4],
          [16, 4],
          [21, 9],
          [21, 15],
          [17, 19],
          [10, 19],
          [5, 15],
          [5, 9],
        ],
        c,
      )
        .rect(8, 8, 10, 1, C.ivory)
        .rect(7, 9, 1, 6, C.ivory)
        .rect(8, 15, 9, 1, C.ivory)
        .rect(17, 10, 1, 5, C.ivory)
        .rect(11, 10, 5, 1, C.ivory)
        .rect(11, 11, 1, 3, C.ivory)
        .rect(12, 13, 4, 1, C.ivory)
        .line(7, 18, 3, 20, c)
        .line(10, 18, 8, 22, c)
        .dot(2, 20, C.teal)
        .dot(7, 22, C.teal);
      break;
    case "trilobite":
      g.rect(8, 3, 8, 18, c)
        .rect(5, 7, 14, 11, c)
        .rect(3, 10, 18, 5, c)
        .rect(11, 5, 2, 16, hi);
      for (let y = 7; y < 20; y += 3) g.rect(6, y, 12, 1, shade);
      g.dot(9, 5, C.ink).dot(14, 5, C.ink);
      for (let y = 10; y < 19; y += 4) g.dot(4, y, c).dot(20, y, c);
      break;
    case "pterosaur":
      g.poly(
        [
          [11, 11],
          [1, 3],
          [2, 13],
          [8, 15],
          [11, 20],
        ],
        c,
      )
        .poly(
          [
            [13, 11],
            [23, 3],
            [22, 13],
            [16, 15],
            [13, 20],
          ],
          c,
        )
        .rect(11, 6, 3, 12, shade)
        .poly(
          [
            [11, 6],
            [13, 2],
            [17, 5],
            [14, 7],
          ],
          c,
        )
        .dot(14, 5, C.ink)
        .line(3, 7, 10, 13, hi)
        .line(21, 7, 14, 13, hi);
      g.tag("data-wing-type", "insect");
      break;
  }
  if (pet.evolution)
    g.rect(7, 17, 11, 1, C.gold)
      .dot(10, 3, C.gold)
      .dot(13, 2, C.gold)
      .dot(16, 3, C.gold);
  const tier = safeRarity(pet);
  rarityPixels(g, tier, 2, 2);
  for (let n = 0; n < (pet.sockets || []).length; n++) {
    const gem = pet.sockets[n];
    if (!gem) continue;
    const col = GEM_KINDS[gem.kind]?.color || C.teal;
    g.rect(7 + n * 3, 15, 2, 2, col).dot(7 + n * 3, 15, C.ivory);
  }
  modifierPixels(g, pet, "pet", true);
  return g
    .tag("data-pet-art", pet.key)
    .tag("class", "companion-body")
    .outline();
}

export function pixelPetSvg(pet = {}, pose = 0) {
  return svg(
    petGrid(typeof pet === "string" ? { key: pet } : pet, pose),
    "companion",
  );
}

function monsterGrid(h) {
  const g = new Grid(32, 34),
    key = h.creature || h.art || h.hazard || "dragon";
  const c =
    {
      dragon: C.copper,
      tyrant: C.leaf,
      triceratops: C.gold,
      raptor: C.leaf,
      tiger: "#cf9757",
      lion: "#cf9757",
      wolf: C.mist,
      skeleton: C.ivory,
      slime: C.teal,
    }[key] || C.leaf;
  if (key === "tiger" || key === "wolf" || key === "lion") {
    g.poly(
      [
        [3, 19],
        [6, 15],
        [21, 15],
        [23, 9],
        [27, 9],
        [30, 13],
        [29, 20],
        [25, 23],
        [8, 25],
        [4, 23],
      ],
      c,
    )
      .rect(8, 24, 3, 7, c)
      .rect(18, 23, 3, 8, c)
      .rect(25, 21, 3, 10, c)
      .line(4, 19, 1, 11, c, 2)
      .rect(25, 8, 2, 3, c)
      .rect(29, 10, 2, 3, c)
      .dot(26, 14, C.ink)
      .rect(28, 17, 3, 2, C.ivory)
      .dot(30, 17, C.ink);
    if (key === "tiger")
      for (const x of [8, 13, 18, 23]) g.line(x, 16, x + 2, 20, C.ink);
    if (key === "lion")
      g.rect(22, 7, 8, 15, C.copper)
        .rect(24, 10, 6, 9, c)
        .dot(26, 14, C.ink)
        .rect(28, 17, 3, 2, C.ivory);
  } else if (key === "chariot") {
    g.rect(6, 9, 22, 13, C.gold)
      .rect(6, 10, 22, 2, C.amber)
      .rect(7, 20, 21, 3, C.wood)
      .rect(2, 15, 3, 14, C.wood)
      .rect(2, 13, 2, 3, C.gold)
      .rect(9, 23, 8, 9, C.bark)
      .rect(22, 23, 8, 9, C.bark)
      .rect(11, 25, 4, 5, C.gold)
      .rect(24, 25, 4, 5, C.gold)
      .rect(16, 5, 3, 8, C.metal)
      .rect(21, 6, 9, 5, C.metal)
      .rect(28, 7, 3, 4, C.ink);
  } else if (key === "slime") {
    g.poly(
      [
        [10, 10],
        [22, 10],
        [28, 16],
        [29, 26],
        [26, 30],
        [5, 30],
        [3, 26],
        [4, 16],
      ],
      c,
    )
      .rect(8, 15, 3, 2, C.ivory)
      .rect(11, 14, 6, 2, C.ivory)
      .dot(11, 23, C.ink)
      .dot(21, 23, C.ink)
      .rect(14, 26, 5, 1, C.ink);
  } else {
    if (key === "dragon" || key === "pterosaur")
      wingPixels(g, "leather", 0, 16, 16);
    g.poly(
      [
        [2, 18],
        [7, 22],
        [17, 18],
        [20, 11],
        [20, 5],
        [26, 5],
        [29, 10],
        [30, 15],
        [25, 18],
        [25, 24],
        [21, 28],
        [10, 28],
        [6, 25],
      ],
      c,
    )
      .rect(10, 26, 3, 6, c)
      .rect(21, 25, 3, 7, c)
      .rect(8, 31, 6, 2, dark(c))
      .rect(20, 31, 7, 2, dark(c))
      .dot(25, 10, C.ink)
      .rect(26, 15, 4, 1, C.ivory)
      .rect(25, 16, 1, 2, C.ivory)
      .dot(22, 21, dark(c))
      .dot(17, 25, dark(c));
    if (key === "triceratops")
      g.rect(15, 7, 5, 11, C.gold)
        .line(21, 8, 20, 2, C.ivory, 2)
        .line(27, 10, 30, 5, C.ivory, 2);
    if (key === "dragon")
      g.line(20, 7, 19, 1, C.ivory, 2)
        .line(26, 7, 27, 1, C.ivory, 2)
        .dot(9, 20, C.gold);
    if (key === "tyrant")
      g.rect(21, 6, 8, 5, c).rect(18, 18, 3, 3, c).rect(27, 14, 3, 2, C.ivory);
  }
  if (h.boss) rarityPixels(g, 3);
  return g.tag("data-creature-art", key).outline();
}

export function pixelCreatureSvg(h = {}) {
  return svg(
    monsterGrid(typeof h === "string" ? { creature: h } : h),
    "creature",
  );
}

const CLASS_CLOTH = {
  vanguard: "#bd815e",
  guardian: "#7a9ca9",
  ranger: "#568b79",
  healer: "#e4cd92",
  engineer: "#bc9663",
  assassin: "#786ba1",
  summoner: "#719b86",
  mage: "#937bbc",
  bard: "#c384a2",
  witch: "#818263",
  artillery: "#898997",
  stormcaller: "#87afc8",
  envoy: "#d0ad81",
  trapper: "#6b9a78",
  minelayer: "#ac895e",
  alchemist: "#69a79c",
  druid: "#759768",
  paladin: "#c1a95c",
  necromancer: "#857eaa",
  psion: "#b391c3",
  duelist: "#c59781",
  monk: "#c49661",
};
function classHat(g, h, cloth, hair) {
  const id = h.classId,
    hi = light(cloth),
    shade = dark(cloth);
  if (["mage", "witch"].includes(id))
    g.poly(
      [
        [7, 9],
        [24, 9],
        [20, 7],
        [16, 1],
        [11, 7],
      ],
      shade,
    )
      .rect(10, 7, 12, 2, cloth)
      .dot(15, 4, hi);
  else if (["ranger", "trapper"].includes(id))
    g.poly(
      [
        [8, 12],
        [9, 7],
        [13, 4],
        [20, 5],
        [24, 10],
        [24, 14],
        [20, 10],
        [16, 9],
        [11, 11],
      ],
      cloth,
    )
      .line(21, 7, 26, 3, C.ivory)
      .dot(26, 2, C.ivory);
  else if (id === "assassin")
    g.poly(
      [
        [8, 18],
        [8, 9],
        [11, 5],
        [20, 5],
        [24, 9],
        [24, 18],
        [21, 12],
        [17, 10],
        [12, 11],
      ],
      shade,
    )
      .rect(11, 16, 10, 3, cloth)
      .rect(13, 17, 6, 1, hi);
  else if (["engineer", "minelayer"].includes(id))
    g.rect(9, 6, 14, 4, cloth)
      .rect(8, 9, 16, 2, hi)
      .rect(11, 8, 4, 3, C.metal)
      .rect(17, 8, 4, 3, C.metal)
      .dot(12, 9, C.teal)
      .dot(18, 9, C.teal);
  else if (id === "bard")
    g.rect(8, 8, 17, 2, shade)
      .poly(
        [
          [11, 8],
          [12, 4],
          [20, 4],
          [23, 8],
        ],
        cloth,
      )
      .line(21, 5, 25, 1, C.ivory)
      .dot(24, 2, C.flame);
  else if (id === "healer")
    g.rect(12, 6, 9, 3, C.ivory).rect(15, 6, 3, 2, C.gold);
  else if (["summoner", "necromancer"].includes(id))
    g.rect(9, 7, 15, 3, shade)
      .rect(10, 5, 3, 3, cloth)
      .rect(20, 5, 3, 3, cloth)
      .rect(15, 7, 4, 2, id === "necromancer" ? C.ivory : C.teal);
  else if (id === "alchemist")
    g.rect(8, 8, 17, 3, C.wood)
      .rect(9, 5, 14, 4, cloth)
      .rect(11, 8, 4, 3, C.metal)
      .rect(17, 8, 4, 3, C.metal)
      .dot(12, 9, C.amber)
      .dot(18, 9, C.teal);
  else if (id === "druid")
    g.line(11, 7, 8, 2, C.wood)
      .line(20, 7, 23, 2, C.wood)
      .line(8, 3, 5, 2, C.wood)
      .line(23, 3, 26, 2, C.wood)
      .dot(11, 6, C.leaf)
      .dot(20, 6, C.leaf);
  else if (id === "psion")
    g.rect(11, 7, 10, 1, cloth)
      .rect(14, 5, 4, 3, C.lavender)
      .dot(15, 5, C.ivory);
  else if (id === "stormcaller")
    g.rect(10, 8, 12, 1, C.blue).poly(
      [
        [17, 3],
        [13, 6],
        [16, 6],
        [14, 9],
        [20, 5],
        [17, 5],
      ],
      C.amber,
    );
  else if (id === "monk")
    g.rect(9, 8, 14, 2, cloth)
      .rect(21, 9, 3, 5, cloth)
      .rect(24, 12, 2, 4, shade);
  else if (id === "envoy") g.rect(10, 7, 12, 1, hi).dot(20, 7, C.amber);
  else if (id === "duelist")
    g.rect(8, 8, 17, 2, shade).rect(11, 5, 10, 3, cloth).dot(23, 7, C.ivory);
  else g.rect(10, 7, 12, 2, hair);
}

function raceHead(g, h, skin, hair, eye, frame) {
  const race = h.race;
  g.rect(10, 9, 13, 8, skin)
    .rect(12, 17, 9, 2, skin)
    .rect(9, 11, 1, 4, dark(skin))
    .rect(23, 11, 1, 4, dark(skin))
    .dot(11, 13, light(skin))
    .rect(13, 17, 7, 1, dark(skin));
  if (["Elf", "Nereid", "Kobold", "Drakeling", "Orc", "Fae"].includes(race)) {
    g.poly(
      [
        [10, 12],
        [5, 10],
        [7, 14],
        [10, 15],
      ],
      skin,
    ).poly(
      [
        [23, 12],
        [28, 10],
        [26, 14],
        [23, 15],
      ],
      skin,
    );
    if (race === "Nereid")
      g.rect(6, 12, 2, 1, C.teal)
        .rect(25, 12, 2, 1, C.teal)
        .dot(14, 10, C.blue)
        .dot(19, 10, C.blue);
  }
  if (
    race === "Human" ||
    race === "Elf" ||
    race === "Gnome" ||
    race === "Fae" ||
    race === "Dwarf"
  )
    g.rect(10, 7, 13, 3, hair)
      .rect(9, 9, 3, 4, hair)
      .rect(21, 9, 3, 3, hair)
      .rect(11, 7, 8, 1, light(hair));
  else if (["Orc", "Nereid", "Kobold", "Drakeling"].includes(race)) {
    // Sparse crest pixels are physiology, never a borrowed human hair cap.
    g.dot(12, 8, hair)
      .dot(21, 9, hair)
      .rect(16, 7 - (finite(h.appearance?.crest) % 2), 1, 3, hair);
    g.tag("data-head-marks", "sparse-pixels");
  }
  g.dot(13, 13, eye)
    .dot(20, 13, eye)
    .dot(12, 12, C.ivory)
    .dot(19, 12, C.ivory)
    .rect(15, 16, 3, 1, dark(skin));
  if (race === "Dwarf") {
    g.rect(9, 10, 2, 7, skin)
      .rect(23, 10, 2, 7, skin)
      .poly(
        [
          [10, 15],
          [14, 17],
          [18, 17],
          [23, 15],
          [22, 21],
          [17, 24],
          [12, 21],
        ],
        hair,
      )
      .rect(12, 17, 3, 4, light(hair))
      .rect(20, 16, 2, 4, dark(hair))
      .rect(14, 22, 5, 1, C.gold);
  } else if (race === "Gnome")
    g.rect(7, 11, 3, 4, skin).rect(23, 11, 3, 4, skin).dot(16, 15, light(skin));
  else if (race === "Orc")
    g.rect(9, 15, 15, 4, skin)
      .rect(11, 16, 2, 3, C.ivory)
      .rect(21, 16, 2, 3, C.ivory)
      .rect(14, 18, 6, 1, dark(skin));
  else if (race === "Kobold" || race === "Drakeling") {
    g.rect(14, 14, 12, 4, skin)
      .rect(20, 14, 6, 2, light(skin))
      .dot(24, 15, C.ink)
      .rect(22, 17, 2, 1, C.ivory)
      .dot(12, 14, C.gold)
      .dot(20, 13, C.gold);
    if (race === "Drakeling")
      g.line(11, 10, 10, 4, C.ivory).line(22, 10, 23, 4, C.ivory);
  } else if (race === "Automaton") {
    g.rect(9, 8, 15, 11, C.metal)
      .rect(11, 8, 11, 2, C.paleMetal)
      .rect(9, 11, 15, 1, C.copper)
      .rect(12, 12, 3, 2, C.amber)
      .rect(18, 12, 3, 2, C.amber)
      .rect(15, 16, 3, 1, C.ink)
      .rect(13, 18, 7, 1, C.copper)
      .rect(16, 5, 1, 3, C.gold)
      .dot(16, 4, C.teal);
  } else if (race === "Myconid") {
    g.poly(
      [
        [4, 11],
        [6, 6],
        [10, 3],
        [21, 3],
        [26, 6],
        [28, 11],
      ],
      C.violet,
    )
      .rect(4, 10, 24, 3, C.lavender)
      .rect(8, 6, 3, 2, C.ivory)
      .rect(18, 4, 3, 2, C.ivory)
      .rect(23, 8, 3, 2, C.ivory)
      .rect(11, 14, 2, 2, C.ink)
      .rect(20, 14, 2, 2, C.ink);
    g.tag("data-race-cap", "Myconid");
  } else if (race === "Ent") {
    g.rect(10, 8, 13, 12, C.wood)
      .rect(11, 9, 2, 10, C.copper)
      .rect(19, 9, 2, 11, C.bark)
      .rect(12, 12, 4, 1, C.amber)
      .rect(19, 12, 3, 1, C.amber)
      .rect(15, 17, 3, 1, C.bark)
      .line(12, 8, 10, 3, C.wood, 2)
      .line(10, 4, 5, 2, C.wood)
      .line(20, 8, 23, 2, C.wood, 2)
      .line(23, 3, 27, 1, C.wood)
      .rect(5, 2, 4, 2, C.leaf)
      .rect(24, 1, 4, 2, C.leaf)
      .dot(20, 9, C.leaf);
  } else if (race === "Owlkin") {
    g.rect(9, 8, 15, 11, skin)
      .poly(
        [
          [9, 10],
          [9, 4],
          [14, 8],
        ],
        dark(skin),
      )
      .poly(
        [
          [19, 8],
          [24, 4],
          [24, 11],
        ],
        dark(skin),
      )
      .rect(10, 10, 6, 6, C.ivory)
      .rect(18, 10, 6, 6, C.ivory)
      .rect(12, 11, 3, 4, C.gold)
      .rect(19, 11, 3, 4, C.gold)
      .rect(13, 12, 1, 2, C.ink)
      .rect(20, 12, 1, 2, C.ink)
      .poly(
        [
          [15, 15],
          [18, 15],
          [17, 19],
        ],
        C.gold,
      )
      .dot(11, 17, light(skin))
      .dot(22, 17, light(skin));
  } else if (race === "Bearkin") {
    g.rect(8, 9, 17, 10, skin)
      .rect(8, 6, 4, 4, dark(skin))
      .rect(21, 6, 4, 4, dark(skin))
      .rect(9, 7, 2, 2, light(skin))
      .rect(22, 7, 2, 2, light(skin))
      .rect(12, 14, 9, 5, light(skin))
      .rect(15, 14, 4, 2, C.ink)
      .dot(13, 12, C.ink)
      .dot(21, 12, C.ink)
      .rect(16, 17, 1, 1, C.ink);
  } else if (race === "Celestial") {
    const crown = finite(h.appearance?.crown) % 4;
    g.rect(10, 7, 13, 2, C.gold)
      .rect(10, 5, 2, 3, C.gold)
      .rect(15, 3, 3, 5, C.amber)
      .rect(21, 5, 2, 3, C.gold)
      .rect(15, 4, 2, 2, C.ivory)
      .rect(12, 1, 9, 1, C.amber)
      .dot(10, 2, C.amber)
      .dot(23, 2, C.amber);
    if (crown === 1) g.dot(7, 6, C.amber).dot(26, 6, C.amber);
    if (crown === 2) g.rect(14, 4, 5, 1, C.teal);
    if (crown === 3) g.line(10, 6, 8, 2, C.gold).line(22, 6, 24, 2, C.gold);
    g.tag("class", "celestial-crown attribute-halo");
  } else if (race === "Shade" || race === "Sylph") {
    const white = race === "Sylph",
      c = white ? "#edf3ec" : "#30313c",
      outline = white ? C.blue : C.violet;
    g.rect(9, 8, 15, 12, c)
      .rect(11, 7, 10, 1, c)
      .rect(10, 20, 13, 4, c)
      .poly(
        [
          [10, 24],
          [24, 24],
          [21, 29],
          [18, 32],
          [14, 29],
          [9, 31],
          [12, 27],
        ],
        c,
      )
      .rect(12, 13, 3, 1, white ? C.teal : "#e6c9ff")
      .rect(19, 13, 3, 1, white ? C.teal : "#e6c9ff")
      .rect(9, 12, 1, 7, outline)
      .rect(23, 17, 1, 5, outline)
      .dot(7 + frame, 25, c)
      .dot(25 - frame, 29, c);
    g.tag("data-smoke-race", race)
      .tag("class", "smoke-wisp")
      .tag("data-smoke-frame", frame);
  }
}

function wornArmor(g, item, index, cloth) {
  if (!item) return;
  const d = ITEMS[item.key] || {},
    c =
      d.visualColor ||
      { light: cloth, medium: C.green, heavy: C.metal }[d.weight] ||
      cloth;
  const hi = light(c),
    shade = dark(c),
    tier = safeRarity(item),
    trim = tier ? RARITY_COLORS[tier] : C.gold;
  const slot = ["head", "chest", "legs", "boots"][index] || d.armorSlot;
  g.tag("data-worn-armor", slot);
  if (index === 0) {
    if (d.weight === "heavy")
      g.rect(9, 7, 15, 4, c)
        .rect(10, 5, 13, 3, c)
        .rect(9, 11, 3, 6, c)
        .rect(22, 11, 2, 6, c)
        .rect(10, 8, 13, 1, hi)
        .rect(16, 5, 1, 8, hi)
        .rect(11, 12, 12, 1, shade);
    else if (d.weight === "medium")
      g.rect(9, 7, 15, 3, c)
        .rect(10, 5, 13, 3, c)
        .rect(9, 10, 3, 3, c)
        .rect(22, 10, 2, 3, c)
        .rect(11, 8, 12, 1, trim);
    else
      g.poly(
        [
          [8, 13],
          [9, 8],
          [12, 5],
          [20, 5],
          [24, 8],
          [25, 14],
          [22, 11],
          [19, 9],
          [13, 9],
          [10, 12],
        ],
        c,
      ).rect(10, 8, 11, 1, hi);
  } else if (index === 1) {
    g.rect(10, 20, 13, 8, c)
      .rect(11, 20, 2, 7, hi)
      .rect(21, 20, 2, 8, shade)
      .rect(10, 26, 13, 2, C.wood)
      .rect(15, 26, 3, 2, trim);
    if (d.weight === "heavy")
      g.rect(7, 19, 6, 3, hi)
        .rect(21, 19, 6, 3, hi)
        .rect(14, 21, 6, 4, shade)
        .rect(14, 21, 6, 1, hi);
    if (item.key === "scaleMail")
      for (let y = 21; y < 26; y += 2)
        for (let x = 11; x < 22; x += 3) g.dot(x, y, C.leaf);
    if (item.key === "starRobe") g.dot(14, 23, C.ivory).dot(19, 25, C.amber);
    if (item.key === "glacier") g.dot(12, 21, C.teal).dot(20, 21, C.teal);
    if (item.key === "trailLeather")
      g.rect(10, 23, 4, 3, C.copper).rect(20, 22, 3, 3, C.copper);
  } else if (index === 2) {
    g.rect(11, 28, 5, 3, c)
      .rect(18, 28, 5, 3, c)
      .rect(12, 28, 1, 3, hi)
      .rect(21, 28, 1, 3, shade);
    if (d.weight === "heavy")
      g.rect(11, 28, 5, 1, trim).rect(18, 28, 5, 1, trim);
  } else {
    g.rect(9, 31, 7, 2, c)
      .rect(18, 31, 7, 2, c)
      .rect(11, 30, 5, 2, c)
      .rect(18, 30, 5, 2, c)
      .rect(9, 32, 7, 1, shade)
      .rect(18, 32, 7, 1, shade);
    if (item.key.includes("night-boots"))
      g.dot(12, 31, C.ivory)
        .dot(21, 31, C.ivory)
        .dot(7, 32, C.lavender)
        .dot(27, 31, C.lavender);
  }
  const mods = objectModifiers(item, "armor");
  for (const m of mods) {
    g.tag("data-modifier-art", `armor:${m.kind}:${m.key}`);
    g.dot(11 + index * 3, 20 + index * 3, m.visual?.color || C.lavender);
  }
}

function guisePixels(g, key) {
  if (key === "moonwraith") {
    g.poly(
      [
        [11, 7],
        [20, 7],
        [24, 11],
        [23, 22],
        [27, 28],
        [23, 31],
        [20, 28],
        [17, 33],
        [14, 28],
        [9, 31],
        [6, 29],
        [10, 22],
        [8, 12],
      ],
      C.lavender,
    )
      .rect(11, 11, 11, 8, C.violet)
      .rect(12, 13, 3, 1, C.ivory)
      .rect(19, 13, 3, 1, C.ivory)
      .rect(16, 2, 6, 2, C.ivory)
      .rect(12, 3, 4, 3, C.ivory)
      .rect(12, 6, 2, 2, C.ivory)
      .rect(14, 7, 4, 1, C.ivory)
      .dot(9, 25, C.ivory);
    return;
  }
  const c =
    key === "sunplate"
      ? "#cfaa63"
      : key === "clockwork"
        ? "#98bec1"
        : "#a0aedb";
  const shade = dark(c),
    core =
      key === "sunplate"
        ? "#ffe7a0"
        : key === "clockwork"
          ? "#a1edf0"
          : "#e2ecff";
  g.rect(9, 7, 15, 12, c)
    .rect(10, 5, 13, 3, c)
    .rect(10, 11, 13, 4, shade)
    .rect(12, 12, 3, 1, core)
    .rect(19, 12, 3, 1, core)
    .rect(9, 20, 15, 9, c)
    .rect(7, 19, 6, 4, c)
    .rect(22, 19, 6, 4, c)
    .rect(11, 28, 5, 4, c)
    .rect(19, 28, 5, 4, c)
    .rect(8, 31, 8, 2, shade)
    .rect(19, 31, 8, 2, shade)
    .rect(14, 23, 6, 4, core)
    .rect(15, 23, 3, 1, C.ivory)
    .rect(16, 6, 1, 5, light(c));
  if (key === "sunplate") {
    g.poly(
      [
        [23, 22],
        [28, 21],
        [31, 24],
        [30, 29],
        [26, 31],
        [22, 28],
      ],
      C.gold,
    )
      .rect(25, 23, 2, 6, core)
      .rect(23, 25, 6, 2, core)
      .dot(16, 3, core);
  } else if (key === "clockwork")
    g.rect(16, 2, 1, 3, C.gold)
      .dot(16, 1, C.teal)
      .rect(8, 21, 2, 5, C.gold)
      .rect(26, 22, 2, 5, C.gold)
      .rect(11, 27, 12, 1, C.copper);
  else
    g.rect(9, 4, 4, 4, C.blue)
      .rect(21, 4, 4, 4, C.blue)
      .dot(6, 19, C.teal)
      .dot(28, 16, C.lavender);
}

export function pixelPortraitSvg(hero = {}, small = false, pose = 0) {
  if (hero.petKey) return pixelPetSvg({ key: hero.petKey, ...hero }, pose);
  if (
    hero.creature ||
    ["tiger", "lion", "chariot", "wolf"].includes(hero.hazard) ||
    ["tiger", "lion", "chariot", "wolf"].includes(hero.art)
  )
    return pixelCreatureSvg(hero);
  if (hero.structure || hero.hazard)
    return pixelPropSvg(hero.hazard || (hero.wall ? "wall" : "turret"));
  const h = {
    race: "Human",
    classId: "vanguard",
    level: 1,
    attributes: [],
    talents: [],
    items: [],
    armor: [],
    ...hero,
  };
  const g = new Grid(32, 34),
    cos = COSMETICS[h.cosmetic],
    authored = MYTHICAL_HEROES[h.mythicKey];
  const guise = cos?.skin || (!h.cosmetic && authored?.skin);
  const frame =
    Math.abs(Math.round(pose + finite(h.appearance?.smokePose))) % 4;
  const cloth =
    cos?.hue !== undefined ? hue(cos.hue) : CLASS_CLOTH[h.classId] || C.violet;
  const skin = RACES[h.race]?.color || RACES.Human.color;
  const hair = [
    "#644c40",
    "#c79858",
    "#626f7d",
    "#493d63",
    "#8f4852",
    "#dae6ef",
  ][Math.abs(Math.floor(finite(h.appearance?.hair))) % 6];
  const eye =
    hasAttribute(h, "Vampire") || hasAttribute(h, "Zombie") ? "#d66b79" : C.ink;
  const flight = flightType(h);
  if (flight)
    wingPixels(g, guise === "clockwork" ? "mechanical" : flight, pose, 16, 18);
  if (["Drakeling", "Kobold"].includes(h.race))
    g.line(23, 27, 29, 25, dark(skin), 2).line(29, 25, 30, 21, skin);
  if (guise) {
    guisePixels(g, guise);
    g.tag("data-character-skin", guise);
  } else {
    g.rect(11, 28, 5, 4, C.wood)
      .rect(18, 28, 5, 4, C.wood)
      .rect(9, 31, 7, 2, C.bark)
      .rect(18, 31, 7, 2, C.bark)
      .poly(
        [
          [11, 19],
          [21, 19],
          [25, 28],
          [23, 30],
          [9, 30],
          [7, 28],
        ],
        cloth,
      )
      .rect(7, 21, 3, 6, dark(cloth))
      .rect(24, 21, 3, 6, dark(cloth))
      .rect(7, 26, 3, 3, skin)
      .rect(24, 26, 3, 3, skin)
      .rect(11, 20, 2, 7, light(cloth))
      .rect(21, 22, 2, 6, dark(cloth))
      .rect(10, 27, 14, 2, C.wood)
      .rect(15, 27, 3, 2, C.gold)
      .rect(15, 20, 3, 3, hue(finite(h.appearance?.hue, 245), 0.4, 0.56));
    raceHead(g, h, skin, hair, eye, frame);
    if (
      ![
        "Myconid",
        "Celestial",
        "Ent",
        "Owlkin",
        "Bearkin",
        "Automaton",
        "Shade",
        "Sylph",
      ].includes(h.race)
    )
      classHat(g, h, cloth, hair);
    for (let n = 1; n < (h.armor || []).length; n++)
      wornArmor(g, h.armor[n], n, cloth);
    if (h.race !== "Celestial") wornArmor(g, h.armor?.[0], 0, cloth);
    // A helmet and cuirass may cover the head/body, but characteristic anatomy
    // stays recognizable: beards, ear silhouettes, muzzles and owl face disks.
    if (h.race === "Dwarf")
      g.poly(
        [
          [11, 16],
          [15, 18],
          [19, 18],
          [22, 16],
          [21, 21],
          [17, 24],
          [12, 21],
        ],
        hair,
      )
        .rect(12, 18, 2, 3, light(hair))
        .rect(15, 22, 4, 1, C.gold);
    if (h.race === "Bearkin")
      g.rect(7, 7, 3, 3, skin)
        .rect(24, 7, 3, 3, skin)
        .rect(12, 15, 9, 4, light(skin))
        .rect(15, 15, 4, 2, C.ink)
        .dot(16, 18, C.ink);
    if (h.race === "Owlkin")
      g.rect(7, 6, 3, 4, dark(skin))
        .rect(24, 6, 3, 4, dark(skin))
        .rect(11, 12, 5, 4, C.ivory)
        .rect(18, 12, 5, 4, C.ivory)
        .rect(13, 13, 2, 2, C.gold)
        .rect(19, 13, 2, 2, C.gold)
        .dot(14, 13, C.ink)
        .dot(20, 13, C.ink)
        .poly(
          [
            [16, 16],
            [19, 16],
            [17, 19],
          ],
          C.gold,
        );
    if (h.race === "Orc") g.dot(11, 17, C.ivory).dot(21, 17, C.ivory);
    if (hasAttribute(h, "Vampire")) g.dot(14, 17, C.ivory).dot(19, 17, C.ivory);
    if (hasAttribute(h, "Werewolf"))
      g.poly(
        [
          [9, 10],
          [10, 3],
          [14, 8],
        ],
        hair,
      ).poly(
        [
          [20, 8],
          [24, 3],
          [25, 10],
        ],
        hair,
      );
    if (hasAttribute(h, "Zombie"))
      g.line(18, 13, 21, 15, C.green)
        .line(18, 15, 21, 13, C.green)
        .dot(11, 17, C.green);
    if (hasAttribute(h, "Blessed") && h.race !== "Celestial")
      g.rect(11, 1, 10, 1, C.amber).dot(9, 2, C.amber).dot(23, 2, C.amber);
    if (hasAttribute(h, "Cursed"))
      g.dot(27, 17, C.lavender).dot(29, 22, C.violet);
    if (hasAttribute(h, "Inventive"))
      g.rect(22, 8, 4, 3, C.metal).dot(24, 9, C.teal);
  }
  const gear = (h.items || []).filter((i) => i && ITEMS[i.key]);
  const held = gear
    .filter(
      (i) =>
        ITEMS[i.key].weaponKind ||
        ["tool", "mining", "woodcutting"].includes(ITEMS[i.key].type),
    )
    .slice(0, 2);
  for (let n = 0; n < held.length; n++) {
    const item = held[n],
      weapon = accessoryGrid(item);
    g.copy(
      weapon,
      n === 0 ? 0 : 20,
      n === 0 ? 11 : 14,
      n === 0 ? 13 : 11,
      n === 0 ? 22 : 19,
      n === 1,
    );
    g.dot(n === 0 ? 8 : 24, 26, skin);
  }
  const offhand = gear.find((i) => ITEMS[i.key].type === "offhand");
  if (offhand) g.copy(accessoryGrid(offhand), 21, 19, 10, 13);
  const charm = gear.find((i) => ITEMS[i.key].type === "charm");
  if (charm) g.copy(accessoryGrid(charm), 17, 22, 7, 8);
  if (h.light)
    g.copy(lanternGrid(h.light), 23, 23, 8, 10).tag(
      "data-light-art",
      h.light.key,
    );
  if ((h.companion && PETS[h.companion.key]?.mode === "mount") || h.mount) {
    const mount = h.companion || h.mount;
    const top = g.p.slice();
    g.p.fill(null);
    g.copy(petGrid(mount, pose), 3, 12, 28, 22);
    const rider = new Grid(32, 34);
    rider.p = top;
    // The rider's feet sit in stirrups; the companion remains mechanically a mount.
    g.copy(rider, 7, 0, 20, 27).tag("data-mounted-on", mount.key);
  }
  if (Math.abs(Math.round(pose)) % 2 && !flight && !h.companion) {
    g.dot(9, 32, null)
      .dot(16, 32, C.bark)
      .dot(18, 32, null)
      .dot(25, 32, C.bark);
  }
  g.outline();
  rarityPixels(g, Math.min(4, Math.max(0, heroRarity(h))), 2, 4);
  g.tag("data-race-art", h.race)
    .tag("data-class-art", h.classId)
    .tag("data-pose", Math.round(pose));
  return svg(
    g,
    "character",
    `${small ? 'data-small-sprite="true"' : ""} ${guise ? `data-character-skin="${esc(guise)}"` : ""}`,
  );
}

export function pixelCosmeticSvg(key) {
  const d = COSMETICS[key];
  if (!d) return pixelIcon("spark", 48);
  if (d.type === "weapon")
    return pixelItemSvg({
      key: d.kinds?.includes("longarm") ? "musket" : "ironblade",
      level: 1,
      cosmetic: key,
    });
  if (d.type === "pet")
    return pixelPetSvg({ key: "fox", level: 1, cosmetic: key });
  return pixelPortraitSvg({
    race: "Human",
    classId: "vanguard",
    level: 1,
    items: [],
    armor: [],
    cosmetic: key,
  });
}

function flamePixels(g, x, y, large = false, pose = 0) {
  const s = large ? 2 : 1,
    f = Math.abs(Math.round(pose)) % 2;
  const src = new Grid(12, 16);
  src
    .poly(
      [
        [1, 13],
        [1, 9],
        [4, 5],
        [5, 1 + f],
        [8, 5],
        [9, 3],
        [11, 9],
        [11, 13],
        [8, 16],
        [4, 16],
      ],
      C.flame,
    )
    .poly(
      [
        [3, 13],
        [3, 10],
        [5, 7],
        [7, 4 + f],
        [8, 9],
        [9, 12],
        [8, 15],
        [4, 15],
      ],
      C.amber,
    )
    .rect(5, 11, 3, 4, C.ivory)
    .dot(5, 10, C.ivory);
  return g.copy(src, x, y, 12 * s, 16 * s).tag("data-light-source", "fire");
}

function propGrid(key, variant = 0) {
  const g = new Grid(32, 40),
    v = Math.abs(Math.floor(finite(variant))) % 4;
  switch (key) {
    case "tree":
    case "pine":
    case "fir": {
      const pine = key !== "tree" || v < 2;
      g.rect(14, 25, 5, 12, C.wood)
        .rect(14, 25, 1, 12, C.copper)
        .rect(12, 36, 9, 2, C.bark);
      if (pine) {
        g.poly(
          [
            [16, 1],
            [24, 13],
            [21, 13],
            [29, 23],
            [24, 23],
            [31, 32],
            [2, 32],
            [9, 23],
            [4, 23],
            [12, 13],
            [8, 13],
          ],
          C.green,
        )
          .poly(
            [
              [16, 3],
              [18, 10],
              [14, 10],
            ],
            "#617577",
          )
          .line(11, 14, 21, 14, "#4c6666", 2)
          .line(7, 24, 26, 24, "#4c6666", 2)
          .rect(9, 29, 9, 2, "#3f5d5a")
          .rect(19, 29, 7, 2, C.night);
      } else {
        g.poly(
          [
            [8, 6],
            [18, 3],
            [26, 7],
            [29, 15],
            [31, 22],
            [27, 29],
            [7, 29],
            [2, 24],
            [2, 14],
          ],
          C.green,
        )
          .rect(7, 8, 9, 3, "#546d69")
          .rect(3, 15, 7, 3, "#4a6463")
          .rect(17, 6, 7, 3, "#455b61")
          .rect(14, 16, 6, 3, "#40595a")
          .rect(21, 22, 6, 3, C.night)
          .dot(9, 12, C.leaf)
          .dot(25, 13, "#617577");
      }
      break;
    }
    case "mountain":
      g.poly(
        [
          [1, 37],
          [15, 2],
          [31, 37],
        ],
        C.metal,
      )
        .poly(
          [
            [15, 2],
            [31, 37],
            [15, 37],
          ],
          C.dusk,
        )
        .poly(
          [
            [10, 14],
            [15, 2],
            [20, 14],
            [17, 12],
            [15, 15],
            [13, 12],
          ],
          C.copper,
        )
        .line(15, 13, 12, 23, C.flame, 2)
        .line(12, 23, 17, 30, C.amber, 2)
        .rect(1, 37, 31, 2, C.bark);
      break;
    case "eggs":
      g.rect(3, 32, 28, 5, C.wood).rect(5, 30, 24, 3, C.copper);
      for (const [x, y] of [
        [5, 19],
        [13, 12],
        [21, 21],
      ]) {
        g.rect(x + 3, y, 5, 15, C.ivory)
          .rect(x + 1, y + 3, 9, 10, C.ivory)
          .rect(x + 2, y + 6, 2, 5, C.copper)
          .dot(x + 6, y + 3, C.mist)
          .dot(x + 7, y + 10, C.gold);
      }
      break;
    case "rock":
    case "stone":
    case "ore":
      g.poly(
        [
          [6, 24],
          [9, 15],
          [18, 11],
          [26, 18],
          [29, 29],
          [24, 35],
          [6, 35],
          [2, 29],
        ],
        C.metal,
      )
        .poly(
          [
            [9, 15],
            [18, 11],
            [18, 20],
            [6, 25],
          ],
          "#8693a7",
        )
        .poly(
          [
            [18, 20],
            [26, 18],
            [29, 29],
            [24, 35],
            [18, 31],
          ],
          C.dusk,
        )
        .line(6, 26, 17, 21, C.mist)
        .line(17, 21, 17, 30, C.dusk)
        .rect(7, 32, 10, 2, C.dusk);
      if (key === "ore")
        g.poly(
          [
            [19, 19],
            [23, 23],
            [21, 28],
            [16, 24],
          ],
          C.copper,
        ).dot(19, 22, C.gold);
      break;
    case "bush":
      g.poly(
        [
          [3, 28],
          [8, 22],
          [12, 24],
          [15, 18],
          [23, 20],
          [26, 26],
          [30, 28],
          [29, 35],
          [3, 35],
        ],
        C.green,
      )
        .rect(6, 26, 5, 2, "#60776b")
        .rect(16, 21, 5, 2, "#60776b")
        .rect(22, 29, 5, 3, C.night)
        .dot(12, 27, C.leaf)
        .dot(21, 26, v % 2 ? C.lavender : C.amber);
      break;
    case "mushroom":
      g.rect(11, 24, 4, 12, C.ivory)
        .rect(23, 28, 3, 8, C.ivory)
        .poly(
          [
            [3, 25],
            [6, 17],
            [12, 14],
            [19, 16],
            [22, 25],
          ],
          C.violet,
        )
        .rect(3, 24, 19, 3, C.lavender)
        .rect(8, 18, 3, 2, C.ivory)
        .rect(15, 17, 2, 2, C.ivory)
        .poly(
          [
            [18, 30],
            [20, 25],
            [25, 23],
            [30, 28],
            [31, 31],
          ],
          C.copper,
        )
        .rect(18, 29, 13, 2, C.gold)
        .dot(23, 25, C.ivory);
      g.tag("data-light-source", "mushroom");
      break;
    case "flower":
    case "grass":
      for (const [x, y] of [
        [7, 28],
        [16, 24],
        [24, 30],
      ]) {
        g.line(x, y + 6, x, y, C.leaf)
          .line(x, y + 4, x - 3, y + 2, C.green)
          .line(x, y + 3, x + 3, y + 1, C.green);
        if (key === "flower")
          g.rect(x - 2, y - 2, 5, 3, v % 2 ? C.lavender : C.gold)
            .rect(x - 1, y - 3, 3, 5, v % 2 ? C.lavender : C.gold)
            .dot(x, y - 1, C.ivory);
      }
      break;
    case "ruin":
      g.rect(4, 16, 6, 21, C.metal)
        .rect(22, 11, 6, 26, C.metal)
        .rect(10, 30, 12, 7, C.dusk)
        .rect(2, 14, 10, 3, C.mist)
        .rect(20, 9, 10, 3, C.mist)
        .rect(4, 22, 6, 1, C.dusk)
        .rect(22, 18, 6, 1, C.dusk)
        .rect(5, 28, 4, 1, C.dusk)
        .rect(23, 27, 5, 1, C.dusk)
        .rect(8, 34, 6, 3, C.metal)
        .rect(18, 33, 6, 4, C.metal)
        .line(9, 35, 13, 35, C.green)
        .dot(6, 20, C.green)
        .dot(25, 14, C.green);
      break;
    case "house": {
      const house = buildingGrid("cabins", 1);
      g.copy(house, 0, 0, 32, 40);
      break;
    }
    case "barrel":
      g.rect(9, 14, 14, 22, C.wood)
        .rect(7, 17, 18, 16, C.wood)
        .rect(10, 14, 3, 22, C.copper)
        .rect(8, 18, 16, 3, C.metal)
        .rect(8, 30, 16, 3, C.metal)
        .rect(11, 13, 10, 2, C.bark)
        .rect(14, 15, 1, 21, C.bark)
        .rect(20, 15, 1, 21, C.bark);
      break;
    case "crate":
      g.rect(5, 15, 22, 21, C.wood)
        .rect(5, 15, 22, 3, C.copper)
        .rect(5, 33, 22, 3, C.copper)
        .rect(5, 15, 3, 21, C.copper)
        .rect(24, 15, 3, 21, C.copper)
        .line(8, 18, 23, 32, C.copper, 2)
        .line(23, 18, 8, 32, C.copper, 2)
        .dot(6, 16, C.gold)
        .dot(25, 34, C.gold);
      break;
    case "chest":
    case "treasure":
      g.rect(5, 22, 23, 14, C.wood)
        .rect(7, 17, 19, 5, C.copper)
        .rect(5, 20, 23, 4, C.copper)
        .rect(5, 24, 23, 2, C.gold)
        .rect(8, 18, 3, 16, C.gold)
        .rect(22, 18, 3, 16, C.gold)
        .rect(14, 24, 5, 6, C.amber)
        .dot(16, 26, C.ink);
      break;
    case "torch":
      g.rect(14, 20, 3, 17, C.wood).rect(12, 17, 7, 5, C.metal);
      flamePixels(g, 10, 5, false, variant);
      break;
    case "lantern":
      g.rect(15, 3, 2, 7, C.wood)
        .rect(15, 29, 2, 8, C.wood)
        .copy(lanternGrid({ key: "hooded-lantern" }), 4, 6, 25, 30)
        .tag("data-light-source", "lantern");
      break;
    case "bonfire":
    case "fire":
      g.line(6, 31, 25, 35, C.wood, 3)
        .line(6, 35, 25, 31, C.copper, 3)
        .rect(6, 35, 22, 2, C.bark);
      flamePixels(g, 10, 16, false, variant);
      g.dot(11, 10, C.amber).dot(22, 13, C.flame);
      break;
    case "lava":
      g.poly(
        [
          [2, 25],
          [8, 20],
          [16, 23],
          [23, 17],
          [30, 20],
          [31, 30],
          [25, 34],
          [15, 33],
          [8, 37],
          [1, 34],
        ],
        C.flame,
      )
        .line(3, 28, 13, 27, C.gold, 2)
        .line(13, 27, 23, 23, C.amber, 2)
        .line(6, 33, 19, 30, C.ivory)
        .dot(26, 27, C.ivory)
        .dot(19, 32, C.amber)
        .tag("data-light-source", "lava");
      break;
    case "bridge":
      g.rect(2, 25, 28, 11, C.wood)
        .rect(2, 25, 28, 2, C.copper)
        .rect(2, 34, 28, 2, C.copper);
      for (let x = 4; x < 30; x += 4) g.rect(x, 27, 1, 7, C.bark);
      g.rect(3, 21, 2, 16, C.copper)
        .rect(27, 21, 2, 16, C.copper)
        .rect(3, 21, 26, 2, C.wood);
      break;
    case "wall":
    case "barricade":
      g.rect(2, 22, 28, 14, C.metal)
        .rect(2, 21, 28, 3, C.mist)
        .rect(3, 30, 26, 1, C.dusk)
        .rect(2, 36, 28, 2, C.dusk);
      for (const x of [8, 18, 28]) g.rect(x, 24, 1, 6, C.dusk);
      for (const x of [3, 13, 23]) g.rect(x, 31, 1, 5, C.dusk);
      break;
    case "turret":
      g.rect(8, 32, 17, 4, C.wood)
        .rect(12, 20, 8, 12, C.metal)
        .rect(6, 14, 21, 9, C.metal)
        .rect(3, 16, 6, 6, C.ink)
        .rect(11, 15, 14, 2, C.paleMetal)
        .rect(10, 21, 15, 2, C.gold)
        .rect(15, 25, 2, 4, C.amber)
        .dot(24, 19, C.teal);
      break;
    case "mine":
      g.rect(7, 29, 19, 6, C.metal)
        .rect(10, 25, 13, 5, C.metal)
        .rect(5, 34, 23, 2, C.dusk)
        .rect(13, 25, 7, 2, C.gold)
        .dot(16, 25, C.flame)
        .rect(8, 32, 15, 1, C.ink);
      break;
    case "trap":
    case "snare":
      g.rect(4, 31, 25, 4, C.metal)
        .rect(6, 28, 3, 6, C.paleMetal)
        .rect(24, 28, 3, 6, C.paleMetal)
        .rect(10, 34, 13, 2, C.wood)
        .rect(12, 32, 9, 2, C.bark)
        .dot(7, 27, C.ivory)
        .dot(25, 27, C.ivory);
      break;
    case "portal":
      g.rect(7, 11, 3, 21, C.violet)
        .rect(23, 11, 3, 21, C.violet)
        .rect(10, 7, 13, 3, C.violet)
        .rect(10, 33, 13, 3, C.violet)
        .rect(10, 10, 2, 23, C.lavender)
        .rect(21, 10, 2, 23, C.lavender)
        .rect(12, 10, 9, 2, C.lavender)
        .rect(12, 31, 9, 2, C.lavender)
        .rect(12, 12, 9, 19, C.dusk)
        .rect(15, 16, 3, 9, C.teal)
        .dot(13, 14, C.ivory)
        .dot(19, 28, C.lavender)
        .rect(5, 35, 23, 3, C.metal)
        .dot(5, 17, C.teal)
        .dot(28, 26, C.lavender)
        .tag("data-light-source", "portal");
      break;
    case "fountain":
      g.rect(4, 28, 25, 8, C.metal)
        .rect(6, 25, 21, 3, C.mist)
        .rect(8, 28, 17, 3, C.teal)
        .rect(15, 13, 3, 15, C.metal)
        .rect(10, 12, 13, 3, C.mist)
        .rect(12, 15, 9, 2, C.teal)
        .rect(11, 17, 1, 8, C.teal)
        .rect(22, 17, 1, 8, C.teal)
        .rect(15, 8, 3, 4, C.teal)
        .dot(16, 6, C.ivory)
        .dot(6, 27, C.ivory);
      break;
    case "fence":
      g.rect(4, 22, 3, 15, C.wood)
        .rect(25, 22, 3, 15, C.wood)
        .rect(4, 25, 24, 3, C.copper)
        .rect(4, 32, 24, 3, C.copper)
        .dot(5, 25, C.gold)
        .dot(26, 34, C.gold);
      break;
    case "bones":
    case "fossil":
      g.line(4, 29, 25, 21, C.ivory, 2)
        .rect(2, 28, 4, 4, C.ivory)
        .rect(25, 19, 4, 4, C.ivory);
      for (let x = 6; x < 25; x += 5)
        g.line(x, 28 - (x - 6) / 3, x + 2, 35 - (x - 6) / 3, C.ivory, 2);
      g.rect(24, 21, 5, 6, C.ivory).dot(26, 23, C.ink).dot(29, 24, C.ink);
      break;
    case "grave":
      g.rect(9, 16, 14, 20, C.metal)
        .rect(12, 13, 8, 3, C.metal)
        .rect(12, 20, 8, 1, C.mist)
        .rect(15, 18, 2, 10, C.mist)
        .rect(6, 34, 20, 3, C.dusk);
      break;
    case "crystal":
      g.poly(
        [
          [16, 7],
          [22, 15],
          [20, 32],
          [12, 35],
          [9, 18],
        ],
        C.teal,
      )
        .poly(
          [
            [16, 7],
            [16, 32],
            [12, 35],
            [9, 18],
          ],
          C.blue,
        )
        .rect(16, 14, 2, 12, C.ivory)
        .poly(
          [
            [7, 20],
            [11, 27],
            [8, 36],
            [3, 29],
          ],
          C.violet,
        )
        .poly(
          [
            [25, 16],
            [30, 24],
            [27, 35],
            [21, 31],
          ],
          C.lavender,
        )
        .tag("data-light-source", "crystal");
      break;
    case "grove-spirit":
      g.copy(propGrid("tree", 1), 0, 0)
        .rect(10, 18, 3, 2, C.amber)
        .rect(21, 18, 3, 2, C.amber)
        .rect(14, 25, 6, 2, C.bark)
        .rect(6, 31, 4, 5, C.green)
        .rect(23, 31, 4, 5, C.green);
      break;
    case "wraith":
    case "spirit":
      g.poly(
        [
          [9, 12],
          [13, 7],
          [20, 8],
          [24, 12],
          [23, 25],
          [28, 32],
          [23, 35],
          [18, 31],
          [15, 38],
          [12, 33],
          [5, 35],
          [9, 25],
        ],
        C.violet,
      )
        .rect(12, 15, 3, 1, C.lavender)
        .rect(19, 15, 3, 1, C.lavender)
        .dot(6, 23, C.lavender)
        .dot(27, 28, C.lavender);
      break;
    case "moon":
      g.mask(
        [
          "....hhhhhhh....",
          "..hhhhhhhh.....",
          ".hhhhhh........",
          "hhhhhh.........",
          "hhhhh..........",
          "hhhhh..........",
          "hhhhh..........",
          "hhhhhh.........",
          ".hhhhhh........",
          "..hhhhhhhhhh...",
          "....hhhhhhhhh..",
        ],
        8,
        12,
        { h: C.ivory },
      );
      break;
    case "boat":
      g.copy(buildingGrid("dock", 1), 0, 0, 32, 40);
      break;
    case "tower":
      g.copy(buildingGrid("tower", 1), 0, 0, 32, 40);
      break;
    case "mill":
      g.copy(buildingGrid("mill", 1), 0, 0, 32, 40);
      break;
    default:
      g.copy(propGrid("crate", variant), 0, 0);
  }
  return g.tag("data-prop-art", key).outline();
}

export function pixelPropSvg(key, variant = 0) {
  if (
    [
      "lion",
      "tiger",
      "wolf",
      "chariot",
      "dragon",
      "tyrant",
      "triceratops",
      "raptor",
      "slime",
    ].includes(key)
  )
    return pixelCreatureSvg({ creature: key });
  return svg(propGrid(key, variant), "prop", `data-prop-key="${esc(key)}"`);
}

function roof(g, c = C.violet, x = 6, y = 9, w = 36) {
  g.poly(
    [
      [x, y + 15],
      [x + w / 2, y],
      [x + w, y + 15],
    ],
    dark(c),
  );
  g.poly(
    [
      [x, y + 15],
      [x + w / 2, y],
      [x + w / 2, y + 15],
    ],
    c,
  );
  for (let yy = y + 6; yy < y + 15; yy += 3) {
    const inset = Math.ceil(((y + 15 - yy) * w) / 30);
    g.rect(x + inset, yy, w - inset * 2, 1, light(c));
    for (let xx = x + inset + (yy % 2) * 3; xx < x + w - inset; xx += 7)
      g.dot(xx, yy + 1, dark(c));
  }
  g.rect(x, y + 15, w, 2, C.wood);
}
function warmWindow(g, x, y, w = 6, h = 7, c = C.amber) {
  g.rect(x - 1, y - 1, w + 2, h + 2, C.bark)
    .rect(x, y, w, h, c)
    .rect(x + 1, y + 1, 1, h - 2, C.ivory)
    .rect(x + Math.floor(w / 2), y, 1, h, C.wood)
    .rect(x, y + Math.floor(h / 2), w, 1, C.wood)
    .tag("data-light-source", "window");
}
function hut(g, roofColor = C.violet, wall = C.wood) {
  g.rect(9, 23, 30, 20, wall)
    .rect(11, 25, 2, 16, light(wall))
    .rect(36, 25, 3, 18, dark(wall));
  for (let y = 28; y < 42; y += 4) g.rect(9, y, 30, 1, dark(wall));
  g.rect(18, 28, 11, 15, C.bark)
    .rect(20, 29, 7, 13, C.gold)
    .rect(21, 30, 2, 11, C.amber)
    .dot(26, 36, C.ink)
    .rect(7, 42, 34, 3, C.metal);
  roof(g, roofColor);
  warmWindow(g, 11, 28, 5, 7);
  warmWindow(g, 31, 28, 5, 7);
}

function buildingGrid(rawKey, level = 1) {
  const key =
    {
      characters: "tent",
      alchemy: "alchemist",
      slots: "outfitter",
      forge: "blacksmith",
      night: "storage",
      guild: "tavern",
      menagerie: "menagerie",
      workshop: "armory",
      board: "quest-board",
      questboard: "quest-board",
      lights: "lanternwright",
      portalMage: "portal",
    }[rawKey] || (rawKey.startsWith("guild-") ? "guild-booth" : rawKey);
  const g = new Grid(48),
    tier = Math.max(1, Math.min(5, Math.floor(finite(level, 1))));
  switch (key) {
    case "tent":
      g.poly(
        [
          [3, 39],
          [22, 9],
          [24, 9],
          [45, 39],
        ],
        C.violet,
      )
        .poly(
          [
            [24, 9],
            [45, 39],
            [25, 38],
          ],
          C.dusk,
        )
        .poly(
          [
            [22, 17],
            [24, 17],
            [32, 39],
            [13, 39],
          ],
          C.lavender,
        )
        .poly(
          [
            [22, 19],
            [25, 19],
            [28, 39],
            [18, 39],
          ],
          C.ink,
        )
        .rect(9, 37, 28, 3, C.copper)
        .rect(2, 40, 44, 2, C.bark)
        .line(6, 31, 1, 42, C.copper)
        .line(42, 31, 47, 42, C.copper)
        .rect(0, 40, 2, 4, C.gold)
        .rect(46, 40, 2, 4, C.gold)
        .rect(22, 7, 3, 4, C.gold)
        .copy(lanternGrid({ key: "hooded-lantern" }), 31, 23, 12, 17);
      break;
    case "storage":
      g.copy(propGrid("crate"), 1, 13, 25, 31)
        .copy(propGrid("barrel"), 23, 7, 23, 36)
        .copy(propGrid("chest"), 12, 18, 30, 27)
        .rect(12, 43, 30, 2, C.metal);
      break;
    case "bonfire":
      g.rect(7, 39, 34, 5, C.metal)
        .rect(10, 43, 28, 3, C.dusk)
        .line(11, 37, 35, 41, C.wood, 4)
        .line(11, 41, 35, 37, C.copper, 4);
      flamePixels(g, 12, 8, true, tier)
        .dot(10, 19, C.amber)
        .dot(38, 12, C.gold)
        .dot(28, 3, C.amber)
        .dot(6, 28, C.flame);
      break;
    case "crossroads":
      g.rect(22, 7, 4, 36, C.wood)
        .rect(23, 8, 1, 33, C.copper)
        .poly(
          [
            [5, 12],
            [35, 12],
            [42, 17],
            [35, 21],
            [5, 21],
          ],
          C.copper,
        )
        .poly(
          [
            [11, 24],
            [42, 24],
            [42, 33],
            [11, 33],
            [5, 28],
          ],
          C.wood,
        )
        .rect(10, 15, 24, 1, C.amber)
        .rect(13, 27, 23, 1, C.ivory)
        .rect(17, 42, 15, 3, C.metal)
        .copy(lanternGrid({ key: "hooded-lantern" }), 27, 30, 12, 16);
      break;
    case "training":
      g.rect(5, 41, 39, 3, C.wood)
        .rect(7, 24, 3, 18, C.copper)
        .rect(19, 24, 3, 18, C.copper)
        .rect(6, 11, 18, 18, C.wood)
        .rect(8, 13, 14, 14, C.ivory)
        .rect(10, 15, 10, 10, C.flame)
        .rect(12, 17, 6, 6, C.amber)
        .rect(14, 19, 2, 2, C.ink)
        .rect(34, 27, 3, 16, C.wood)
        .rect(29, 22, 14, 3, C.wood)
        .rect(31, 18, 10, 6, C.copper)
        .rect(33, 12, 6, 6, C.ivory)
        .copy(weaponGrid({ key: "ironblade" }), 23, 24, 13, 19);
      break;
    case "blacksmith":
      hut(g, C.copper, C.wood);
      g.rect(32, 5, 6, 15, C.metal)
        .rect(31, 4, 8, 3, C.mist)
        .dot(35, 1, C.dusk)
        .dot(31, 0, C.metal)
        .rect(20, 29, 9, 13, C.ink)
        .rect(21, 34, 7, 7, C.flame)
        .rect(22, 37, 5, 4, C.amber)
        .rect(1, 36, 13, 4, C.metal)
        .rect(5, 40, 5, 5, C.metal)
        .rect(0, 35, 6, 2, C.paleMetal)
        .tag("data-light-source", "forge");
      break;
    case "armory":
      hut(g, C.blue, C.metal);
      g.rect(15, 20, 19, 6, C.dusk)
        .rect(16, 20, 17, 1, C.gold)
        .copy(weaponGrid({ key: "ironblade" }), 13, 20, 10, 14)
        .copy(accessoryGrid({ key: "aegis" }), 24, 20, 10, 13)
        .copy(propGrid("crate"), 1, 25, 15, 20);
      break;
    case "cabins":
    case "cabin":
      hut(g, C.violet);
      g.rect(31, 8, 5, 9, C.metal).rect(31, 7, 6, 2, C.mist).dot(33, 4, C.dusk);
      break;
    case "pantry":
      hut(g, C.green, C.wood);
      g.copy(propGrid("barrel"), 0, 24, 17, 22)
        .copy(propGrid("crate"), 30, 28, 16, 19)
        .rect(19, 21, 9, 5, C.gold)
        .dot(22, 22, C.leaf)
        .dot(24, 23, C.flame);
      break;
    case "kitchen":
      hut(g, C.copper, C.wood);
      g.rect(31, 4, 6, 15, C.metal)
        .rect(31, 3, 7, 2, C.mist)
        .dot(33, 0, C.dusk)
        .rect(1, 31, 12, 10, C.metal)
        .rect(0, 29, 14, 3, C.paleMetal)
        .rect(3, 27, 8, 3, C.green)
        .rect(3, 41, 9, 3, C.flame)
        .dot(8, 43, C.amber)
        .tag("data-light-source", "stove");
      break;
    case "alchemist":
    case "arcane":
      hut(g, C.violet, C.metal);
      g.rect(22, 20, 6, 7, C.dusk)
        .rect(24, 20, 2, 2, C.lavender)
        .rect(22, 23, 6, 4, C.teal)
        .rect(2, 32, 7, 10, C.metal)
        .rect(3, 35, 5, 6, C.teal)
        .rect(12, 34, 6, 8, C.wood)
        .rect(13, 37, 4, 4, C.lavender)
        .dot(4, 32, C.ivory)
        .dot(15, 35, C.ivory)
        .tag("data-light-source", "alchemy");
      break;
    case "farm":
    case "garden":
      g.rect(4, 13, 40, 31, C.wood)
        .rect(4, 13, 40, 2, C.copper)
        .rect(4, 42, 40, 2, C.copper);
      for (let y = 18; y < 43; y += 7) {
        g.rect(7, y + 3, 34, 2, C.bark);
        for (let x = 8; x < 43; x += 8)
          g.line(x, y + 3, x, y - 1, C.leaf)
            .line(x, y + 1, x - 3, y - 1, C.green)
            .line(x, y, x + 3, y - 2, C.leaf)
            .dot(x, y - 2, key === "garden" ? C.lavender : C.gold);
      }
      g.copy(propGrid("fence"), 0, 0, 48, 18);
      break;
    case "archaeology":
      g.poly(
        [
          [4, 37],
          [12, 22],
          [35, 22],
          [44, 37],
          [39, 44],
          [9, 44],
        ],
        C.wood,
      )
        .poly(
          [
            [8, 37],
            [14, 27],
            [33, 27],
            [39, 38],
            [35, 41],
            [12, 41],
          ],
          C.bark,
        )
        .copy(propGrid("bones"), 9, 18, 27, 26)
        .copy(propGrid("crate"), 27, 6, 20, 28)
        .copy(weaponGrid({ key: "pickaxe" }), 1, 13, 15, 29)
        .copy(lanternGrid({ key: "hooded-lantern" }), 31, 27, 11, 17);
      break;
    case "dock":
      g.rect(0, 23, 48, 24, C.night)
        .rect(1, 27, 46, 1, C.blue)
        .rect(7, 40, 15, 1, C.teal)
        .rect(28, 43, 15, 1, C.blue)
        .rect(2, 19, 18, 25, C.wood)
        .rect(2, 19, 18, 3, C.copper)
        .rect(2, 39, 18, 3, C.copper);
      for (let y = 24; y < 39; y += 4) g.rect(3, y, 17, 1, C.bark);
      g.poly(
        [
          [23, 32],
          [46, 32],
          [41, 39],
          [27, 39],
        ],
        C.wood,
      )
        .rect(24, 32, 21, 2, C.copper)
        .rect(34, 11, 2, 22, C.copper)
        .poly(
          [
            [36, 12],
            [44, 23],
            [36, 25],
          ],
          C.ivory,
        )
        .rect(30, 29, 11, 3, C.violet)
        .copy(lanternGrid({ key: "hooded-lantern" }), 7, 6, 12, 18);
      break;
    case "portal":
      g.copy(propGrid("portal", tier), 6, 2, 36, 44)
        .copy(propGrid("crystal"), 0, 23, 14, 22)
        .copy(propGrid("crystal"), 34, 23, 14, 22);
      break;
    case "tavern":
      hut(g, C.copper, C.wood);
      g.rect(3, 24, 5, 19, C.wood)
        .rect(39, 24, 5, 19, C.wood)
        .rect(2, 24, 43, 4, C.gold)
        .rect(5, 12, 10, 8, C.wood)
        .rect(7, 13, 5, 4, C.amber)
        .rect(12, 14, 2, 2, C.amber)
        .copy(propGrid("barrel"), 30, 25, 16, 22);
      break;
    case "castle":
      g.rect(5, 16, 10, 28, C.metal)
        .rect(33, 16, 10, 28, C.metal)
        .rect(14, 25, 20, 19, C.metal)
        .rect(5, 16, 3, 27, C.mist)
        .rect(33, 16, 3, 27, C.mist)
        .rect(4, 13, 12, 4, C.paleMetal)
        .rect(32, 13, 12, 4, C.paleMetal)
        .rect(7, 6, 3, 9, C.metal)
        .rect(12, 6, 3, 9, C.metal)
        .rect(33, 6, 3, 9, C.metal)
        .rect(39, 6, 3, 9, C.metal)
        .rect(14, 21, 5, 5, C.metal)
        .rect(22, 21, 5, 5, C.metal)
        .rect(30, 21, 5, 5, C.metal)
        .rect(20, 31, 9, 13, C.ink)
        .rect(19, 34, 2, 10, C.copper)
        .rect(28, 34, 2, 10, C.copper)
        .rect(3, 43, 42, 3, C.dusk)
        .rect(24, 4, 2, 18, C.wood)
        .rect(26, 4, 9, 5, C.flame)
        .rect(26, 9, 6, 2, C.flame);
      warmWindow(g, 9, 22, 3, 6);
      warmWindow(g, 37, 22, 3, 6);
      break;
    case "lanternwright":
      hut(g, C.blue, C.wood);
      g.copy(lanternGrid({ key: "hooded-lantern" }), 0, 25, 14, 16)
        .copy(lanternGrid({ key: "witchlight-lantern" }), 33, 23, 14, 17)
        .rect(3, 22, 3, 4, C.wood)
        .rect(39, 20, 3, 4, C.wood)
        .tag("data-light-source", "lantern");
      break;
    case "guild-booth": {
      const id = rawKey.slice(6),
        colors = {
          miners: "#8da1bc",
          foresters: "#78ae91",
          hunters: "#cf9c73",
          arcanists: "#ac99dc",
          guardians: "#dfba7a",
          scouts: "#80baca",
          artisans: "#c49888",
          healers: "#a4c9ae",
        },
        color = colors[id] || C.blue;
      g.rect(7, 18, 3, 25, C.wood)
        .rect(38, 18, 3, 25, C.wood)
        .rect(7, 34, 34, 10, C.wood)
        .rect(5, 33, 38, 3, C.copper)
        .rect(7, 8, 34, 12, color)
        .rect(4, 17, 40, 6, color)
        .rect(8, 9, 3, 12, dark(color))
        .rect(20, 9, 3, 12, dark(color))
        .rect(33, 9, 3, 12, dark(color))
        .rect(16, 25, 16, 10, C.dusk)
        .rect(17, 26, 14, 8, dark(color));
      const tools = {
        miners: "pickaxe",
        foresters: "axe",
        hunters: "oakbow",
        arcanists: "staff",
        guardians: "ironblade",
        scouts: "dagger",
        artisans: "hammer",
        healers: "talisman",
      };
      if (ITEMS[tools[id]])
        g.copy(weaponGrid({ key: tools[id] }), 14, 19, 19, 19);
      if (id === "healers")
        g.rect(21, 25, 5, 10, C.ivory).rect(18, 28, 11, 4, C.ivory);
      g.tag("data-guild-art", id);
      break;
    }
    case "guildhall":
      g.rect(4, 23, 40, 20, C.metal).rect(4, 42, 40, 3, C.dusk);
      roof(g, C.blue, 2, 7, 44);
      for (const x of [7, 16, 25, 34])
        g.rect(x, 25, 7, 16, C.dusk)
          .rect(
            x,
            27,
            7,
            6,
            [C.gold, C.green, C.violet, C.copper][Math.floor(x / 9)] || C.gold,
          )
          .dot(x + 3, 32, C.ivory);
      g.rect(19, 29, 10, 14, C.wood).rect(21, 30, 6, 12, C.amber);
      break;
    case "outfitter":
    case "atelier":
    case "menagerie":
    case "clinic":
    case "arena":
    case "quest-board":
      if (key === "arena") {
        g.rect(3, 16, 9, 27, C.metal)
          .rect(36, 16, 9, 27, C.metal)
          .rect(2, 13, 11, 4, C.mist)
          .rect(35, 13, 11, 4, C.mist)
          .rect(11, 19, 26, 5, C.metal)
          .rect(12, 18, 24, 1, C.mist)
          .rect(13, 24, 23, 19, C.ink)
          .rect(7, 43, 34, 3, C.dusk);
        for (let x = 17; x < 35; x += 5) g.rect(x, 24, 2, 19, C.copper);
        g.rect(21, 9, 6, 10, C.flame).copy(
          weaponGrid({ key: "ironblade" }),
          17,
          7,
          14,
          14,
        );
      } else if (key === "quest-board") {
        g.rect(8, 18, 3, 26, C.wood)
          .rect(37, 18, 3, 26, C.wood)
          .rect(5, 12, 38, 25, C.wood)
          .rect(7, 14, 34, 21, C.bark);
        roof(g, C.green, 2, 2, 44);
        for (const [x, y] of [
          [10, 17],
          [22, 16],
          [31, 20],
        ])
          g.rect(x, y, 8, 11, C.ivory)
            .rect(x + 2, y + 3, 4, 1, C.copper)
            .rect(x + 2, y + 5, 3, 1, C.copper)
            .dot(x + 3, y + 1, C.gold);
      } else {
        const cloth = {
          outfitter: C.green,
          atelier: "#9e738f",
          menagerie: C.gold,
          clinic: C.ivory,
        }[key];
        g.rect(7, 21, 3, 22, C.wood)
          .rect(38, 21, 3, 22, C.wood)
          .rect(8, 36, 32, 8, C.wood)
          .rect(6, 35, 36, 3, C.copper)
          .rect(9, 24, 29, 2, C.bark)
          .poly(
            [
              [9, 9],
              [38, 9],
              [45, 22],
              [2, 22],
            ],
            cloth,
          );
        for (let x = 8; x < 41; x += 8) g.rect(x, 11, 4, 11, dark(cloth));
        g.rect(2, 22, 43, 3, dark(cloth));
        if (key === "outfitter")
          g.copy(armorGrid({ key: "medium-chest" }), 6, 20, 18, 18).copy(
            armorGrid({ key: "heavy-head" }),
            26,
            23,
            14,
            14,
          );
        if (key === "atelier")
          g.copy(armorGrid({ key: "light-chest" }), 10, 18, 23, 22)
            .rect(19, 31, 4, 4, C.lavender)
            .dot(20, 32, C.ivory);
        if (key === "menagerie")
          g.copy(petGrid({ key: "fox" }), 9, 18, 24, 23)
            .rect(13, 27, 16, 1, C.copper)
            .rect(13, 27, 1, 9, C.copper)
            .rect(28, 27, 1, 9, C.copper);
        if (key === "clinic")
          g.rect(21, 9, 5, 11, C.flame)
            .rect(17, 12, 13, 4, C.flame)
            .rect(15, 30, 18, 5, C.ivory)
            .dot(18, 28, C.teal);
      }
      break;
    case "tower":
      g.rect(13, 13, 22, 30, C.metal).rect(13, 14, 3, 28, C.mist);
      roof(g, C.violet, 8, 0, 32);
      warmWindow(g, 21, 20, 6, 9);
      g.rect(19, 35, 10, 8, C.bark).rect(10, 42, 28, 3, C.dusk);
      break;
    case "mill":
      hut(g, C.copper, C.wood);
      g.rect(23, 15, 2, 22, C.ivory)
        .rect(13, 25, 22, 2, C.ivory)
        .line(16, 18, 32, 34, C.wood, 2)
        .line(16, 34, 32, 18, C.wood, 2)
        .rect(22, 24, 4, 4, C.gold);
      break;
    case "fountain":
      g.copy(propGrid("fountain"), 2, 0, 44, 46);
      break;
    default:
      hut(g, C.violet, C.wood);
  }
  if (tier > 1 && !["bonfire", "farm", "garden", "portal"].includes(key)) {
    g.rect(39, 31, 6, 9, C.dusk).rect(40, 32, 4, 7, C.gold);
    for (let n = 1; n < tier; n++)
      g.dot(41 + (n % 2), 33 + Math.floor(n / 2), C.ivory);
  }
  return g.tag("data-building-art", rawKey).outline();
}

export function pixelBuildingSvg(key, level = 1) {
  return svg(
    buildingGrid(key, level),
    "building",
    `data-building-key="${esc(key)}"`,
  );
}

export function pixelIcon(name, size = 20) {
  const g = new Grid(16),
    c = "currentColor";
  switch (name) {
    case "coin":
      g.mask(
        [
          "...######...",
          "..##....##..",
          ".##..##..##.",
          "##..#..#..##",
          "##..#.....##",
          "##...##...##",
          "##.....#..##",
          "##..#..#..##",
          ".##..##..##.",
          "..##....##..",
          "...######...",
        ],
        2,
        2,
        { "#": c },
      );
      break;
    case "camp":
      g.poly(
        [
          [8, 2],
          [15, 14],
          [1, 14],
        ],
        c,
      ).poly(
        [
          [8, 6],
          [11, 13],
          [5, 13],
        ],
        null,
      );
      break;
    case "sword":
    case "dagger":
      g.line(3, 13, 12, 4, c, 2)
        .poly(
          [
            [10, 3],
            [15, 1],
            [13, 6],
          ],
          c,
        )
        .line(2, 9, 7, 14, c)
        .dot(2, 14, c);
      break;
    case "shield":
      g.poly(
        [
          [8, 1],
          [14, 4],
          [13, 10],
          [8, 15],
          [3, 10],
          [2, 4],
        ],
        c,
      ).poly(
        [
          [8, 3],
          [12, 5],
          [11, 9],
          [8, 12],
          [5, 9],
          [4, 5],
        ],
        null,
      );
      break;
    case "bow":
      g.line(4, 2, 4, 14, c)
        .line(5, 2, 10, 5, c)
        .line(10, 5, 12, 8, c)
        .line(12, 8, 10, 11, c)
        .line(10, 11, 5, 14, c)
        .line(2, 8, 14, 8, c)
        .line(11, 6, 14, 8, c)
        .line(14, 8, 11, 10, c);
      break;
    case "heart":
      g.mask(
        [
          ".###..###.",
          "##########",
          "##########",
          ".########.",
          "..######..",
          "...####...",
          "....##....",
        ],
        3,
        4,
        { "#": c },
      );
      break;
    case "settings":
    case "gear":
      g.rect(5, 1, 6, 14, c)
        .rect(1, 5, 14, 6, c)
        .rect(3, 3, 10, 10, c)
        .rect(6, 6, 4, 4, null)
        .rect(1, 1, 3, 3, null)
        .rect(12, 1, 3, 3, null)
        .rect(1, 12, 3, 3, null)
        .rect(12, 12, 3, 3, null);
      break;
    case "book":
      g.rect(1, 3, 6, 10, c)
        .rect(9, 3, 6, 10, c)
        .rect(3, 4, 3, 8, null)
        .rect(10, 4, 3, 8, null)
        .rect(6, 5, 4, 10, c);
      break;
    case "flame":
      g.poly(
        [
          [8, 1],
          [10, 6],
          [12, 4],
          [15, 10],
          [13, 14],
          [7, 15],
          [2, 12],
          [3, 7],
          [5, 9],
        ],
        c,
      ).poly(
        [
          [8, 7],
          [11, 11],
          [10, 13],
          [6, 13],
          [6, 10],
        ],
        null,
      );
      break;
    case "moon":
      g.mask(
        [
          "...######...",
          "..#####.....",
          ".####.......",
          "####........",
          "####........",
          "####........",
          ".####.......",
          "..########..",
          "...########.",
        ],
        3,
        3,
        { "#": c },
      );
      break;
    case "paw":
      g.rect(4, 9, 8, 5, c)
        .rect(6, 7, 4, 3, c)
        .rect(1, 5, 3, 4, c)
        .rect(5, 2, 3, 4, c)
        .rect(10, 2, 3, 4, c)
        .rect(13, 6, 3, 4, c);
      break;
    case "arrow":
      g.line(1, 8, 14, 8, c, 2)
        .line(9, 3, 14, 8, c, 2)
        .line(14, 8, 9, 13, c, 2);
      break;
    case "play":
      g.poly(
        [
          [4, 2],
          [14, 8],
          [4, 14],
        ],
        c,
      );
      break;
    case "pause":
      g.rect(3, 2, 4, 12, c).rect(10, 2, 4, 12, c);
      break;
    case "check":
      g.line(2, 8, 6, 12, c, 2).line(6, 12, 14, 4, c, 2);
      break;
    case "close":
      g.line(3, 3, 12, 12, c, 2).line(12, 3, 3, 12, c, 2);
      break;
    case "bolt":
      g.poly(
        [
          [9, 1],
          [3, 9],
          [7, 9],
          [6, 15],
          [14, 6],
          [10, 6],
        ],
        c,
      );
      break;
    case "stone":
    case "ore":
      g.poly(
        [
          [4, 4],
          [10, 2],
          [14, 7],
          [15, 13],
          [9, 15],
          [2, 12],
          [1, 7],
        ],
        c,
      )
        .line(4, 4, 8, 8, null)
        .line(8, 8, 13, 6, null)
        .line(8, 8, 8, 14, null);
      if (name === "ore") g.rect(8, 7, 3, 3, null);
      break;
    case "leaf":
      g.poly(
        [
          [2, 13],
          [2, 7],
          [5, 3],
          [14, 1],
          [15, 9],
          [10, 14],
          [4, 15],
        ],
        c,
      ).line(3, 13, 12, 4, null);
      break;
    case "hammer":
      g.rect(2, 2, 10, 6, c).line(8, 7, 13, 14, c, 3);
      break;
    case "bone":
      g.line(3, 3, 12, 12, c, 3).rect(1, 1, 4, 4, c).rect(11, 11, 4, 4, c);
      break;
    case "music":
      g.rect(6, 3, 2, 10, c)
        .rect(12, 1, 2, 10, c)
        .line(6, 3, 13, 1, c, 2)
        .rect(3, 11, 4, 3, c)
        .rect(9, 9, 4, 3, c);
      break;
    case "snow":
      g.line(8, 1, 8, 15, c)
        .line(2, 4, 14, 12, c)
        .line(2, 12, 14, 4, c)
        .line(5, 2, 8, 5, c)
        .line(8, 5, 11, 2, c)
        .line(5, 14, 8, 11, c)
        .line(8, 11, 11, 14, c);
      break;
    case "wing":
      g.poly(
        [
          [7, 13],
          [1, 8],
          [1, 2],
          [5, 5],
          [8, 11],
          [11, 5],
          [15, 2],
          [15, 8],
          [9, 13],
        ],
        c,
      ).rect(7, 12, 2, 4, c);
      break;
    case "flag":
      g.rect(3, 1, 2, 14, c).poly(
        [
          [5, 2],
          [15, 2],
          [11, 5],
          [15, 9],
          [5, 9],
        ],
        c,
      );
      break;
    case "cannon":
      g.poly(
        [
          [2, 8],
          [12, 3],
          [15, 7],
          [5, 12],
        ],
        c,
      )
        .rect(3, 12, 11, 2, c)
        .rect(3, 12, 3, 4, c)
        .rect(11, 12, 3, 4, c);
      break;
    case "skull":
      g.rect(3, 2, 10, 9, c)
        .rect(5, 11, 6, 4, c)
        .rect(4, 5, 3, 3, null)
        .rect(9, 5, 3, 3, null)
        .rect(7, 9, 2, 2, null)
        .dot(6, 13, null)
        .dot(9, 13, null);
      break;
    case "info":
      g.rect(2, 2, 12, 12, c)
        .rect(3, 3, 10, 10, null)
        .rect(7, 7, 2, 5, c)
        .rect(7, 4, 2, 2, c);
      break;
    case "army":
      g.rect(6, 1, 4, 4, c)
        .rect(4, 7, 8, 7, c)
        .rect(1, 5, 3, 3, c)
        .rect(12, 5, 3, 3, c)
        .rect(0, 10, 3, 5, c)
        .rect(13, 10, 3, 5, c)
        .rect(6, 9, 4, 6, null);
      break;
    case "expand":
      g.rect(1, 1, 6, 2, c)
        .rect(1, 1, 2, 6, c)
        .rect(9, 1, 6, 2, c)
        .rect(13, 1, 2, 6, c)
        .rect(1, 9, 2, 6, c)
        .rect(1, 13, 6, 2, c)
        .rect(9, 13, 6, 2, c)
        .rect(13, 9, 2, 6, c);
      break;
    case "shuffle":
      g.line(1, 3, 4, 3, c)
        .line(4, 3, 13, 12, c)
        .line(13, 12, 10, 9, c)
        .line(13, 12, 10, 15, c)
        .line(1, 12, 4, 12, c)
        .line(4, 12, 7, 9, c)
        .line(9, 6, 13, 2, c)
        .line(13, 2, 10, 2, c)
        .line(13, 2, 13, 5, c);
      break;
    default:
      g.poly(
        [
          [8, 1],
          [10, 6],
          [15, 8],
          [10, 10],
          [8, 15],
          [6, 10],
          [1, 8],
          [6, 6],
        ],
        c,
      );
  }
  return svg(
    g,
    "icon",
    `data-icon="${esc(name)}"`,
    `width="${finite(size, 20)}" height="${finite(size, 20)}"`,
  );
}

export function pixelTerrainSvg(
  kind = "forest",
  width = 1200,
  height = 760,
  seed = 1,
) {
  const w = Math.max(1, Math.ceil(finite(width, 1200) / 4)),
    h = Math.max(1, Math.ceil(finite(height, 760) / 4));
  const g = new Grid(w, h),
    darkGround =
      {
        volcano: "#292337",
        jungle: "#172e31",
        marsh: "#1d2c3b",
        cinder: "#252a38",
        country: "#252a38",
        market: "#262840",
        guildhall: "#22253a",
        arena: "#22223a",
        tavern: "#302738",
      }[kind] || "#202e38";
  g.rect(0, 0, w, h, darkGround);
  let n = hash(kind + ":" + seed);
  const random = () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
  if (
    ["market", "guildhall", "arena", "tavern", "commons", "clinic"].includes(
      kind,
    )
  ) {
    for (let y = 0; y < h; y += 8)
      for (let x = y % 16 ? -4 : 0; x < w; x += 12) {
        g.rect(x, y, 11, 7, random() > 0.6 ? "#30324b" : "#292d44");
        if (random() > 0.78) g.rect(x + 2, y + 1, 7, 1, "#3c4056");
      }
    g.rect(
      Math.round(w * 0.45),
      0,
      Math.max(8, Math.round(w * 0.1)),
      h,
      "#3c3d52",
    ).rect(
      0,
      Math.round(h * 0.47),
      w,
      Math.max(8, Math.round(h * 0.1)),
      "#3c3d52",
    );
  } else {
    for (let i = 0; i < Math.ceil((w * h) / 34); i++) {
      const x = Math.floor(random() * w),
        y = Math.floor(random() * h),
        c = random() > 0.7 ? "#3e4b55" : "#2f4146";
      g.rect(x, y, 2, 1, c);
      if (random() > 0.8) g.dot(x + 1, y - 1, c);
      if (random() > 0.97)
        g.dot(x - 2, y - 2, kind === "volcano" ? C.flame : C.violet);
    }
    if (kind === "camp") {
      const cx = Math.round(w * 0.5),
        cy = Math.round(h * 0.5);
      g.rect(cx - 10, 0, 20, h, "#333644").rect(0, cy - 7, w, 14, "#333644");
      g.poly(
        [
          [cx - 24, cy - 8],
          [cx - 10, cy - 22],
          [cx + 15, cy - 20],
          [cx + 25, cy],
          [cx + 15, cy + 19],
          [cx - 14, cy + 22],
          [cx - 26, cy + 10],
        ],
        "#3b3e48",
      );
      for (let i = 0; i < 30; i++)
        g.rect(
          cx - 22 + Math.floor(random() * 44),
          cy - 18 + Math.floor(random() * 38),
          3,
          1,
          "#535162",
        );
    }
    if (kind === "marsh")
      for (let i = 0; i < 8; i++) {
        const x = Math.floor(random() * w),
          y = Math.floor(random() * h),
          ww = 8 + Math.floor(random() * 15),
          hh = 4 + Math.floor(random() * 7);
        g.rect(x, y, ww, hh, C.night).rect(
          x + 2,
          y + 1,
          Math.max(2, ww - 4),
          1,
          "#354c61",
        );
      }
    if (kind === "volcano")
      for (let i = 0; i < 30; i++) {
        const x = Math.floor(random() * w),
          y = Math.floor(random() * h);
        g.line(x, y, x + 4, y + 2, "#5e3540");
      }
  }
  return svg(
    g,
    "terrain",
    `data-terrain-kind="${esc(kind)}"`,
    `width="${finite(width, 1200)}" height="${finite(height, 760)}"`,
  );
}

// The large Camp uses its own authored geography. Existing battle/Market
// terrain stays untouched: these paths match the Camp scene's world anchors.
export function pixelCampGroundSvg(width = 1800, height = 1400, seed = 197) {
  width = Math.max(4, Math.min(7200, Math.round(finite(width, 1800))));
  height = Math.max(4, Math.min(5600, Math.round(finite(height, 1400))));
  const cell = 4,
    sx = width / 1800,
    sy = height / 1400,
    g = new Grid(Math.ceil(width / cell), Math.ceil(height / cell));
  let state = hash("evernight-large-camp:" + seed);
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const xy = (x, y) => [
    Math.round((x * sx) / cell),
    Math.round((y * sy) / cell),
  ];
  const rect = (x, y, w, h, c) => {
    const [xx, yy] = xy(x, y);
    return g.rect(
      xx,
      yy,
      Math.max(1, Math.round((w * sx) / cell)),
      Math.max(1, Math.round((h * sy) / cell)),
      c,
    );
  };
  const poly = (points, c) =>
    g.poly(
      points.map(([x, y]) => xy(x, y)),
      c,
    );
  const dot = (x, y, c) => g.dot(...xy(x, y), c);
  const path = (points, thickness, c) => {
    const t = Math.max(1, Math.round((thickness * Math.min(sx, sy)) / cell));
    for (let n = 1; n < points.length; n++) {
      const a = xy(...points[n - 1]),
        b = xy(...points[n]);
      g.line(
        a[0] - Math.floor(t / 2),
        a[1] - Math.floor(t / 2),
        b[0] - Math.floor(t / 2),
        b[1] - Math.floor(t / 2),
        c,
        t,
      );
    }
  };

  // Broad clumps, broken tufts and tiny moonlit flecks establish texture without
  // a noisy tile checkerboard. The same seed always gives the same forest.
  g.rect(0, 0, g.w, g.h, "#1c2b35");
  for (let n = 0; n < 125; n++) {
    const x = random() * 1800,
      y = random() * 1400;
    rect(
      x,
      y,
      28 + random() * 84,
      12 + random() * 36,
      n % 3 ? "#20323a" : "#223239",
    );
  }
  for (let n = 0; n < 1000; n++) {
    const x = random() * 1800,
      y = random() * 1400,
      c = n % 4 ? "#30464a" : "#3e5356";
    rect(x, y, n % 5 ? 8 : 12, 4, c);
    if (n % 7 === 0) dot(x + 4, y - 4, c);
    if (n % 31 === 0) dot(x - 8, y + 8, "#484968");
  }

  const clearing = [
    [552, 448],
    [588, 352],
    [744, 312],
    [888, 324],
    [1032, 304],
    [1160, 364],
    [1188, 456],
    [1232, 552],
    [1204, 672],
    [1232, 784],
    [1152, 868],
    [1016, 912],
    [864, 896],
    [744, 924],
    [592, 856],
    [536, 760],
    [512, 636],
    [540, 540],
  ];
  poly(clearing, "#353d3e");
  poly(
    clearing.map(([x, y]) => [900 + (x - 900) * 0.95, 620 + (y - 620) * 0.95]),
    "#493f3e",
  );
  poly(
    [
      [644, 516],
      [700, 452],
      [856, 432],
      [1028, 464],
      [1112, 560],
      [1116, 708],
      [1052, 812],
      [896, 860],
      [748, 828],
      [652, 736],
      [612, 624],
    ],
    "#51453f",
  );
  poly(
    [
      [756, 588],
      [796, 520],
      [912, 512],
      [1012, 576],
      [1032, 672],
      [992, 744],
      [872, 780],
      [784, 736],
      [744, 660],
    ],
    "#5a493f",
  );

  // Winding, pixel-stepped roads reach the central services, expansion plots,
  // northeast Market and lake. Narrow service branches remain visually quiet.
  const roads = [
    {
      points: [
        [900, 650],
        [900, 390],
        [940, 228],
        [900, 112],
        [900, -24],
      ],
      wide: 72,
    },
    {
      points: [
        [900, 650],
        [706, 636],
        [564, 668],
        [380, 650],
        [160, 620],
        [-24, 660],
      ],
      wide: 60,
    },
    {
      points: [
        [900, 650],
        [1076, 648],
        [1228, 680],
        [1410, 650],
        [1620, 688],
        [1824, 650],
      ],
      wide: 60,
    },
    {
      points: [
        [900, 650],
        [940, 816],
        [928, 944],
        [900, 1052],
        [900, 1112],
      ],
      wide: 64,
    },
    {
      points: [
        [900, 390],
        [1080, 372],
        [1228, 408],
        [1420, 400],
      ],
      wide: 68,
    },
    {
      points: [
        [900, 650],
        [836, 556],
        [750, 520],
      ],
      wide: 36,
    },
    {
      points: [
        [900, 650],
        [844, 720],
        [730, 740],
      ],
      wide: 36,
    },
    {
      points: [
        [940, 816],
        [1050, 800],
      ],
      wide: 36,
    },
    {
      points: [
        [1076, 648],
        [1090, 600],
      ],
      wide: 36,
    },
    {
      points: [
        [900, 390],
        [1004, 416],
        [1090, 430],
      ],
      wide: 36,
    },
    {
      points: [
        [900, 390],
        [796, 416],
        [700, 390],
      ],
      wide: 36,
    },
    {
      points: [
        [1076, 648],
        [1136, 716],
        [1190, 740],
      ],
      wide: 36,
    },
  ];
  for (const road of roads) {
    path(road.points, road.wide + 16, "#343c3e");
    path(road.points, road.wide, "#57483f");
    path(road.points, Math.max(12, road.wide - 20), "#635046");
  }
  // Bare earth at buildable shadow plots and warm worn stone around the fire.
  for (const [x, y] of [
    [380, 650],
    [1410, 650],
  ]) {
    poly(
      [
        [x - 76, y - 48],
        [x - 36, y - 76],
        [x + 48, y - 68],
        [x + 88, y - 12],
        [x + 68, y + 60],
        [x - 36, y + 76],
        [x - 84, y + 24],
      ],
      "#3a3d3f",
    );
    poly(
      [
        [x - 56, y - 40],
        [x + 36, y - 52],
        [x + 64, y + 8],
        [x + 32, y + 52],
        [x - 44, y + 44],
        [x - 64, y],
      ],
      "#454041",
    );
  }
  poly(
    [
      [852, 620],
      [868, 592],
      [916, 588],
      [952, 620],
      [952, 668],
      [920, 696],
      [872, 684],
      [844, 656],
    ],
    "#6b5747",
  );
  for (let n = 0; n < 370; n++) {
    const x = 520 + random() * 712,
      y = 320 + random() * 592;
    const [xx, yy] = xy(x, y),
      base = g.p[yy * g.w + xx];
    if (
      ![
        "#493f3e",
        "#51453f",
        "#5a493f",
        "#6b5747",
        "#57483f",
        "#635046",
      ].includes(base)
    )
      continue;
    rect(x, y, n % 6 ? 8 : 16, 4, n % 4 ? "#6b594b" : "#3b3436");
    if (n % 19 === 0) dot(x + 4, y + 4, "#8a6d50");
  }

  // Four little booth pads sit on a separate clearing, leaving actual shops,
  // lamps and their interactive footprints to the Camp scene.
  poly(
    [
      [1248, 272],
      [1332, 224],
      [1508, 228],
      [1628, 292],
      [1660, 468],
      [1592, 544],
      [1364, 552],
      [1260, 488],
    ],
    "#333b42",
  );
  poly(
    [
      [1268, 292],
      [1344, 248],
      [1500, 252],
      [1608, 308],
      [1632, 460],
      [1580, 520],
      [1372, 528],
      [1284, 476],
    ],
    "#464349",
  );
  path(
    [
      [1420, 252],
      [1420, 520],
    ],
    44,
    "#5c4e48",
  );
  path(
    [
      [1260, 400],
      [1632, 400],
    ],
    48,
    "#5c4e48",
  );
  for (const [x, y] of [
    [1300, 300],
    [1520, 300],
    [1300, 470],
    [1520, 470],
  ]) {
    rect(x - 44, y - 12, 88, 32, "#4b4953");
    rect(x - 40, y - 8, 80, 4, "#67616a");
    rect(x - 40, y + 16, 80, 4, "#32303e");
  }

  // Stepped shoreline, deep blue water, broken cyan reflections and reeds. It
  // is artwork only; the scene owns the Dock/Island destinations and lighting.
  const lake = [
    [628, 1120],
    [668, 1068],
    [756, 1048],
    [840, 1064],
    [940, 1044],
    [1048, 1060],
    [1156, 1100],
    [1208, 1144],
    [1180, 1200],
    [1104, 1228],
    [992, 1212],
    [896, 1240],
    [788, 1220],
    [708, 1228],
    [644, 1188],
  ];
  poly(lake, "#3b474b");
  poly(
    lake.map(([x, y]) => [920 + (x - 920) * 0.96, 1150 + (y - 1150) * 0.89]),
    "#304958",
  );
  poly(
    lake.map(([x, y]) => [920 + (x - 920) * 0.9, 1150 + (y - 1150) * 0.8]),
    "#203c50",
  );
  poly(
    lake.map(([x, y]) => [920 + (x - 920) * 0.83, 1150 + (y - 1150) * 0.69]),
    "#172f47",
  );
  for (let n = 0; n < 55; n++) {
    const x = 656 + random() * 520,
      y = 1068 + random() * 156;
    const [xx, yy] = xy(x, y),
      base = g.p[yy * g.w + xx];
    if (!["#203c50", "#172f47"].includes(base)) continue;
    rect(x, y, 12 + random() * 28, 4, n % 5 ? "#315268" : "#65818b");
    if (n % 11 === 0) rect(x + 8, y + 8, 12, 4, "#829b9e");
  }
  for (const [x, y] of [
    [650, 1124],
    [708, 1056],
    [1080, 1080],
    [1168, 1152],
    [1084, 1224],
    [740, 1220],
  ]) {
    path(
      [
        [x, y + 12],
        [x, y - 12],
      ],
      4,
      "#5c776e",
    );
    path(
      [
        [x + 8, y + 12],
        [x + 12, y - 4],
      ],
      4,
      "#425f5e",
    );
    dot(x, y - 12, "#ad9564");
  }
  // Small offshore rock/island gives the distant violet dungeon a visual home.
  poly(
    [
      [1016, 1144],
      [1040, 1128],
      [1072, 1136],
      [1084, 1156],
      [1060, 1168],
      [1024, 1164],
    ],
    "#354b4e",
  );
  rect(1032, 1140, 28, 8, "#4c6760");
  dot(1052, 1140, "#8c7c9d");

  // Front-to-back tree rows use the exact prop sprite rather than a second art
  // style. Keep the clearing, roads, Market and south shore free for interaction.
  const trees = [];
  const open = (x, y) => {
    // A tree rooted just below water would otherwise cover the entire lake with
    // its tall canopy. Reserve an open south shore, including that canopy space.
    if (x > 560 && x < 1280 && y > 1100) return true;
    const [xx, yy] = xy(x, y),
      base = g.p[yy * g.w + xx];
    return [
      "#493f3e",
      "#51453f",
      "#5a493f",
      "#6b5747",
      "#57483f",
      "#635046",
      "#454041",
      "#464349",
      "#5c4e48",
      "#4b4953",
      "#304958",
      "#203c50",
      "#172f47",
    ].includes(base);
  };
  for (let row = 0; row < 4; row++) {
    for (let x = 44 + row * 22; x < 1800; x += 128) {
      for (const y of [28 + row * 76, 1400 - row * 58]) {
        const xx = x + (random() - 0.5) * 52,
          yy = y + (random() - 0.5) * 24;
        if (!open(xx, yy))
          trees.push({
            x: xx,
            y: yy,
            size: 100 + random() * 44,
            kind: row % 3,
          });
      }
    }
    for (let y = 252 + row * 22; y < 1232; y += 124) {
      for (const x of [42 + row * 90, 1750 - row * 80]) {
        const xx = x + (random() - 0.5) * 36,
          yy = y + (random() - 0.5) * 42;
        if (!open(xx, yy))
          trees.push({
            x: xx,
            y: yy,
            size: 108 + random() * 40,
            kind: row % 3,
          });
      }
    }
  }
  for (const [x, y] of [
    [474, 400],
    [460, 508],
    [476, 836],
    [548, 960],
    [1180, 972],
    [1300, 916],
    [1564, 832],
    [1200, 216],
    [1136, 108],
    [656, 160],
    [514, 288],
  ])
    if (!open(x, y)) trees.push({ x, y, size: 116, kind: 1 });
  trees.sort((a, b) => a.y - b.y);
  const sprites = [
    propGrid("tree", 0),
    propGrid("tree", 1),
    propGrid("tree", 2),
  ];
  for (const tree of trees) {
    const [x, y] = xy(tree.x - tree.size / 2, tree.y - tree.size * 1.18);
    g.copy(
      sprites[tree.kind],
      x,
      y,
      Math.max(1, Math.round((tree.size * sx) / cell)),
      Math.max(1, Math.round((tree.size * 1.25 * sy) / cell)),
    );
  }

  // Rectangles are already merged into runs. Grouping their fill further cuts
  // repeated attributes; pixelMarkup can cache this whole ground as one image.
  const colors = new Map();
  for (const match of g.body().matchAll(/<rect [^>]*fill="([^"]+)"\/>/g)) {
    const color = match[1],
      shape = match[0].replace(/ fill="[^"]+"/, "");
    colors.set(color, (colors.get(color) || "") + shape);
  }
  const body = [...colors]
    .map(([color, shapes]) => `<g fill="${esc(color)}">${shapes}</g>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none" shape-rendering="crispEdges" style="image-rendering:pixelated" aria-hidden="true" data-pixel-art="camp-ground" data-camp-ground-art="true"><g transform="scale(${cell})">${body}</g></svg>`;
}

export function pixelBonfireEmbersSvg(time = 0) {
  const frame = Math.floor(finite(time) * 8),
    g = new Grid(48);
  // Six integer sparks loop on different periods. Updating this tiny layer
  // leaves the full Camp ground, building sprite and light mask cache intact.
  for (let n = 0; n < 6; n++) {
    const phase =
      (((frame + n * 7) % (19 + n * 3)) + (19 + n * 3)) % (19 + n * 3);
    const rise = Math.floor(phase * 0.7),
      x = 21 + (n % 3) * 3 + (phase % 5 === 0 ? (n % 2 ? 1 : -1) : 0),
      y = 29 - rise;
    g.dot(x, y, n % 3 ? C.amber : C.flame);
    if (n < 2 && phase < 8) g.dot(x, y + 1, C.ivory);
  }
  return svg(g, "bonfire-embers", `data-ember-frame="${frame}"`);
}
