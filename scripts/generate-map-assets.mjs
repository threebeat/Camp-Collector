// Original, deterministic Evernight pixel environments. No downloaded artwork.
// Rasterize ground, static shadows and fixed light once; actors remain live.
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pixelPropSvg, pixelBuildingSvg } from "../web/pixel-art.js";
import { PRERENDERED_BUILDINGS } from "../web/map-assets.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = resolve(root, "web");
const CELL = 2;
function rng(seed) {
  let v = seed >>> 0;
  return () => {
    v = (Math.imul(v, 1664525) + 1013904223) >>> 0;
    return v / 4294967296;
  };
}
const choose = (r, a) => a[Math.floor(r() * a.length)];
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) =>
  "#" +
  rgb(a)
    .map((n, i) =>
      Math.round(n * (1 - t) + rgb(b)[i] * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
class Surface {
  constructor(w, h, cell = CELL) {
    this.width = w;
    this.height = h;
    this.cell = cell;
    this.canvas = createCanvas(w / cell, h / cell);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
  }
  rect(x, y, w, h, c) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(
      Math.round(x / this.cell),
      Math.round(y / this.cell),
      Math.max(1, Math.round(w / this.cell)),
      Math.max(1, Math.round(h / this.cell)),
    );
  }
  ellipse(x, y, rx, ry, c) {
    const s = this.cell;
    for (let yy = Math.floor(-ry / s); yy <= Math.ceil(ry / s); yy++) {
      const q = 1 - ((yy * s) / ry) ** 2;
      if (q < 0) continue;
      const xx = Math.floor((rx / s) * Math.sqrt(q));
      this.rect(x - xx * s, y + yy * s, (xx * 2 + 1) * s, s, c);
    }
  }
  poly(points, c) {
    const p = points.map(([x, y]) => [x / this.cell, y / this.cell]);
    for (
      let y = Math.floor(Math.min(...p.map((x) => x[1])));
      y <= Math.ceil(Math.max(...p.map((x) => x[1])));
      y++
    ) {
      const xs = [];
      for (let n = 0; n < p.length; n++) {
        const a = p[n],
          b = p[(n + 1) % p.length];
        if (
          (a[1] <= y + 0.5 && b[1] > y + 0.5) ||
          (b[1] <= y + 0.5 && a[1] > y + 0.5)
        )
          xs.push(a[0] + ((y + 0.5 - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((a, b) => a - b);
      this.ctx.fillStyle = c;
      for (let n = 0; n < xs.length; n += 2)
        this.ctx.fillRect(
          Math.ceil(xs[n] - 0.5),
          y,
          Math.ceil(xs[n + 1] - 0.5) - Math.ceil(xs[n] - 0.5),
          1,
        );
    }
  }
  line(x, y, xx, yy, width, c) {
    const d = Math.hypot(xx - x, yy - y);
    for (let i = 0; i <= d; i += this.cell) {
      const t = d ? i / d : 0;
      this.ellipse(x + (xx - x) * t, y + (yy - y) * t, width / 2, width / 2, c);
    }
  }
  path(p, width, c) {
    for (let n = 1; n < p.length; n++)
      this.line(...p[n - 1], ...p[n], width, c);
  }
  image(im, x, y, w, h) {
    this.ctx.drawImage(
      im,
      Math.round(x / this.cell),
      Math.round(y / this.cell),
      Math.round(w / this.cell),
      Math.round(h / this.cell),
    );
  }
  shade(color, alpha, callback) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    callback(color);
    this.ctx.restore();
  }
  colorAt(x, y) {
    const d = this.ctx.getImageData(
      Math.max(0, Math.min(this.canvas.width - 1, Math.floor(x / this.cell))),
      Math.max(0, Math.min(this.canvas.height - 1, Math.floor(y / this.cell))),
      1,
      1,
    ).data;
    return (
      "#" +
      [...d.slice(0, 3)].map((n) => n.toString(16).padStart(2, "0")).join("")
    );
  }
  png() {
    const full = createCanvas(this.width, this.height),
      c = full.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.drawImage(this.canvas, 0, 0, this.width, this.height);
    return full.toBuffer("image/png");
  }
}
const sprite = async (svg) => loadImage(Buffer.from(svg));
const trees = await Promise.all(
  [0, 1, 2].map((n) => sprite(pixelPropSvg("tree", n))),
);
const rocks = await Promise.all(
  [0, 1].map((n) => sprite(pixelPropSvg("rock", n))),
);
const bush = await sprite(pixelPropSvg("bush"));
function vegetation(s, r, w, h) {
  s.rect(0, 0, w, h, "#1b2d32");
  for (let n = 0; n < (w * h) / 9000; n++)
    s.ellipse(
      r() * w,
      r() * h,
      30 + r() * 110,
      12 + r() * 44,
      choose(r, ["#1d3235", "#20373a", "#23393b", "#253b3c"]),
    );
  for (let n = 0; n < (w * h) / 140; n++) {
    const x = r() * w,
      y = r() * h,
      c = choose(r, ["#294141", "#2c4645", "#314c49", "#35524e", "#3c5952"]);
    s.rect(x, y, 2 + r() * 6, 2, c);
    if (n % 4 === 0) {
      s.rect(x + 2, y - 4, 2, 4, c);
      s.rect(x + 4, y - 2, 2, 2, mix(c, "#92aea0", 0.2));
    }
  }
}
function groundDetails(s, r, w, h, soil) {
  for (let n = 0; n < (w * h) / 135; n++) {
    const x = r() * w,
      y = r() * h,
      base = s.colorAt(x, y);
    if (!soil.includes(base)) continue;
    const c = mix(
      base,
      n % 5 === 0 ? "#211e26" : "#bd9b72",
      n % 5 === 0 ? 0.24 : 0.12 + r() * 0.16,
    );
    s.rect(x, y, 2 + r() * 6, 2, c);
    if (n % 7 === 0) s.rect(x + 2, y + 2, 4, 2, mix(base, "#151826", 0.2));
  }
}
function glow(s, x, y, rx, ry, color, power = 0.15) {
  // Quantized amber bounce light, baked into opaque ground at two-unit cells.
  for (let i = 6; i > 0; i--)
    s.shade(color, (power * (7 - i)) / 20, (c) =>
      s.ellipse(x, y, (rx * i) / 6, (ry * i) / 6, c),
    );
}
function treeShadow(s, x, y, size, lightX = 900, lightY = 650) {
  const dx = x - lightX,
    dy = y - lightY,
    l = Math.hypot(dx, dy) || 1,
    stretch = size * 0.64;
  const ex = x + (dx / l) * stretch,
    ey = y + (dy / l) * stretch * 0.52;
  s.shade("#090e19", 0.32, (c) =>
    s.poly(
      [
        [x - size * 0.31, y - 4],
        [x + size * 0.3, y + 4],
        [ex + size * 0.12, ey + 9],
        [ex - size * 0.12, ey - 9],
      ],
      c,
    ),
  );
  s.shade("#070d17", 0.44, (c) =>
    s.ellipse(x, y, size * 0.25, size * 0.065, c),
  );
}
function drawTrees(s, placements) {
  for (const t of placements)
    treeShadow(s, t.x, t.y, t.size, t.lightX, t.lightY);
  for (const t of placements.sort((a, b) => a.y - b.y))
    s.image(
      trees[t.kind % trees.length],
      t.x - t.size / 2,
      t.y - t.size * 1.25,
      t.size,
      t.size * 1.25,
    );
}
function road(s, p, width) {
  s.path(p, width + 18, "#2c3739");
  s.path(p, width + 8, "#49413b");
  s.path(p, width, "#5a4b40");
  s.path(p, width - 18, "#645346");
}
function stone(s, x, y, w, h, r) {
  s.poly(
    [
      [x, y + h * 0.3],
      [x + w * 0.2, y],
      [x + w * 0.78, y],
      [x + w, y + h * 0.3],
      [x + w * 0.85, y + h],
      [x + w * 0.12, y + h],
    ],
    "#353f45",
  );
  s.rect(x + w * 0.2, y + 2, w * 0.56, 2, "#677272");
  s.rect(
    x + w * 0.2,
    y + 4,
    w * 0.65,
    h * 0.45,
    choose(r, ["#4a575c", "#566162", "#50595e"]),
  );
}
function campMap() {
  const s = new Surface(1800, 1400),
    r = rng(1970318);
  vegetation(s, r, 1800, 1400);
  const clearing = [
    [530, 450],
    [590, 356],
    [747, 318],
    [890, 330],
    [1050, 318],
    [1178, 369],
    [1235, 551],
    [1213, 670],
    [1236, 790],
    [1138, 889],
    [998, 922],
    [864, 901],
    [739, 925],
    [587, 857],
    [525, 742],
    [511, 619],
  ];
  s.poly(clearing, "#333b3b");
  s.poly(
    clearing.map(([x, y]) => [
      900 + (x - 900) * 0.965,
      625 + (y - 625) * 0.965,
    ]),
    "#4a423b",
  );
  s.ellipse(893, 635, 264, 220, "#51473e");
  s.ellipse(900, 650, 185, 140, "#594a3e");
  const roads = [
    [
      [900, -80],
      [923, 180],
      [900, 390],
      [900, 650],
      [940, 816],
      [928, 944],
      [900, 1114],
    ],
    [
      [0, 645],
      [175, 620],
      [380, 650],
      [564, 668],
      [706, 636],
      [900, 650],
      [1076, 648],
      [1228, 680],
      [1410, 650],
      [1620, 688],
      [1880, 650],
    ],
    [
      [380, 650],
      [380, 470],
    ],
    [
      [380, 650],
      [410, 710],
    ],
    [
      [900, 390],
      [1080, 372],
      [1228, 408],
      [1420, 400],
    ],
    [
      [900, 650],
      [836, 556],
      [750, 520],
    ],
    [
      [900, 650],
      [844, 720],
      [730, 740],
    ],
    [
      [940, 816],
      [1050, 800],
    ],
    [
      [1076, 648],
      [1090, 600],
    ],
    [
      [900, 390],
      [1004, 416],
      [1090, 430],
    ],
    [
      [900, 390],
      [796, 416],
      [700, 390],
    ],
    [
      [1076, 648],
      [1136, 716],
      [1190, 740],
    ],
  ];
  roads.forEach((p, n) => road(s, p, n < 2 ? 66 : n < 5 ? 44 : 30));
  for (const [x, y, rx, ry] of [
    [380, 550, 135, 200],
    [1410, 400, 203, 167],
    [1410, 650, 96, 80],
    [620, 1090, 70, 52],
    [1410, 848, 96, 80],
  ])
    s.ellipse(x, y, rx, ry, "#41413d");
  road(
    s,
    [
      [380, 450],
      [380, 650],
      [410, 730],
    ],
    46,
  );
  road(
    s,
    [
      [1260, 400],
      [1630, 400],
    ],
    42,
  );
  groundDetails(s, r, 1800, 1400, [
    "#4a423b",
    "#51473e",
    "#594a3e",
    "#49413b",
    "#5a4b40",
    "#645346",
    "#41413d",
  ]);
  // Permanent stone ring without a flame: the bonfire itself remains an object.
  for (let n = 0; n < 16; n++) {
    const a = (n * Math.PI) / 8;
    stone(
      s,
      900 + Math.cos(a) * 57 - 8,
      650 + Math.sin(a) * 35 - 4,
      12 + r() * 8,
      7 + r() * 5,
      r,
    );
  }
  s.ellipse(900, 650, 48, 27, "#383334");
  s.ellipse(900, 650, 34, 20, "#29282c");
  for (let n = 0; n < 24; n++) {
    const a = r() * Math.PI * 2,
      t = r() * 30;
    s.rect(
      900 + Math.cos(a) * t,
      650 + Math.sin(a) * t * 0.6,
      4,
      2,
      choose(r, ["#504440", "#655448", "#201f27"]),
    );
  }
  // Long water shore; pier/island gameplay objects stay in the interactive scene.
  const lake = [
    [620, 1117],
    [664, 1060],
    [751, 1043],
    [839, 1059],
    [940, 1039],
    [1049, 1055],
    [1158, 1093],
    [1213, 1140],
    [1184, 1202],
    [1109, 1238],
    [994, 1224],
    [896, 1250],
    [787, 1231],
    [707, 1236],
    [641, 1196],
  ];
  s.poly(lake, "#4b5a55");
  s.poly(
    lake.map(([x, y]) => [920 + (x - 920) * 0.976, 1150 + (y - 1150) * 0.935]),
    "#344d50",
  );
  s.poly(
    lake.map(([x, y]) => [920 + (x - 920) * 0.94, 1150 + (y - 1150) * 0.86]),
    "#254454",
  );
  s.poly(
    lake.map(([x, y]) => [920 + (x - 920) * 0.87, 1150 + (y - 1150) * 0.72]),
    "#193747",
  );
  for (let n = 0; n < 280; n++) {
    const x = 635 + r() * 565,
      y = 1050 + r() * 190,
      b = s.colorAt(x, y);
    if (!["#254454", "#193747"].includes(b)) continue;
    s.rect(
      x,
      y,
      4 + r() * 28,
      2,
      choose(r, ["#315566", "#345969", "#426b76", "#537d82"]),
    );
  }
  for (let n = 0; n < 44; n++) {
    const a = r() * Math.PI * 2,
      x = 914 + Math.cos(a) * 280,
      y = 1147 + Math.sin(a) * 93;
    if (s.colorAt(x, y) === "#193747") continue;
    s.line(x, y, x - 2, y - 8 - r() * 9, 2, "#6a8670");
    s.line(x + 4, y, x + 8, y - 5 - r() * 6, 2, "#4e6f61");
    if (n % 3 === 0) s.rect(x - 3, y - 15, 3, 7, "#a18f62");
  }
  for (const [x, y] of [
    [721, 1118],
    [1132, 1169],
    [835, 1203],
  ]) {
    s.ellipse(x, y, 9, 4, "#40695f");
    s.rect(x - 3, y - 2, 7, 2, "#6a8d71");
  }
  s.poly(
    [
      [1020, 1145],
      [1038, 1129],
      [1070, 1135],
      [1083, 1157],
      [1060, 1170],
      [1023, 1165],
    ],
    "#3b5457",
  );
  s.rect(1037, 1140, 24, 7, "#587271");
  // Dense deep-forest border plus selective inner landmarks; all shadows precede trees.
  const placements = [];
  const blocked = (x, y) => {
    if (x > 530 && x < 1270 && y > 360 && y < 1030) return true;
    if (x > 590 && x < 1280 && y > 1040) return true;
    if (x > 240 && x < 535 && y > 315 && y < 860) return true;
    if (x > 1210 && x < 1660 && y > 215 && y < 575) return true;
    return ["#5a4b40", "#645346", "#49413b"].includes(s.colorAt(x, y));
  };
  for (let y = 54; y < 1490; y += 83)
    for (let x = 34 + (Math.floor(y / 83) % 2) * 43; x < 1870; x += 86) {
      const xx = x + (r() - 0.5) * 32,
        yy = y + (r() - 0.5) * 32;
      if (!blocked(xx, yy))
        placements.push({
          x: xx,
          y: yy,
          size: 80 + Math.floor(r() * 4) * 16,
          kind: Math.floor(r() * 3),
          lightX: 900,
          lightY: 650,
        });
    }
  for (const [x, y] of [
    [510, 362],
    [521, 957],
    [1284, 951],
    [1188, 298],
    [573, 266],
    [1587, 867],
  ])
    placements.push({ x, y, size: 128, kind: 1, lightX: 900, lightY: 650 });
  // Small immutable moss rocks and ferns do not appear as movable gameplay props.
  for (let n = 0; n < 65; n++) {
    const x = 40 + r() * 1720,
      y = 40 + r() * 1280,
      b = s.colorAt(x, y);
    if (!["#1b2d32", "#1d3235", "#20373a", "#23393b", "#253b3c"].includes(b))
      continue;
    const w = 18 + r() * 24;
    s.shade("#070e18", 0.4, (c) => s.ellipse(x, y, w * 0.6, 5, c));
    s.image(n % 4 ? bush : rocks[n % 2], x - w / 2, y - w * 0.5, w, w * 0.6);
  }
  drawTrees(s, placements);
  return s;
}
function woodBoard(s, x, y, w, h, r) {
  s.rect(
    x,
    y,
    w,
    h,
    choose(r, ["#473d3c", "#4e413d", "#55473e", "#5c4a3f", "#51413b"]),
  );
  s.rect(x + 2, y, w - 4, 2, "#77604a");
  s.rect(x + w - 2, y, 2, h, "#302d32");
  s.rect(x + 2, y + h - 2, w - 4, 2, "#292831");
  for (let n = 0; n < 3; n++)
    s.rect(
      x + 8 + r() * (w - 18),
      y + 4 + r() * (h - 8),
      6 + r() * 22,
      2,
      "#3f3535",
    );
  s.rect(x + 3, y + 4, 2, 2, "#9a7a53");
  s.rect(x + w - 6, y + h - 5, 2, 2, "#2a2630");
}
function rug(s, x, y, w, h) {
  s.rect(x - 6, y - 6, w + 12, h + 12, "#241e2a");
  s.rect(x, y, w, h, "#6a3741");
  s.rect(x + 4, y + 4, w - 8, h - 8, "#a87853");
  s.rect(x + 8, y + 8, w - 16, h - 16, "#55343d");
  for (let xx = x + 14; xx < x + w - 12; xx += 16) {
    s.rect(xx, y + 11, 6, 3, "#c3a066");
    s.rect(xx, y + h - 14, 6, 3, "#c3a066");
  }
  for (let yy = y + 20; yy < y + h - 20; yy += 28)
    for (let xx = x + 26; xx < x + w - 24; xx += 38) {
      s.poly(
        [
          [xx, yy - 6],
          [xx + 8, yy],
          [xx, yy + 6],
          [xx - 8, yy],
        ],
        "#794551",
      );
      s.rect(xx - 1, yy - 1, 2, 2, "#ac7756");
    }
  for (let n = 4; n < w; n += 8) {
    s.rect(x + n, y - 10, 2, 8, "#9b8463");
    s.rect(x + n, y + h + 2, 2, 8, "#9b8463");
  }
}
function barrel(s, x, y, r) {
  s.shade("#0c111b", 0.52, (c) => s.ellipse(x + 8, y + 10, 20, 9, c));
  s.ellipse(x, y - 5, 20, 27, "#30282c");
  s.rect(x - 18, y - 22, 36, 34, "#825b3b");
  s.ellipse(x, y + 12, 18, 7, "#4c382e");
  s.ellipse(x, y - 21, 18, 8, "#a17b4c");
  for (let xx = -12; xx <= 12; xx += 8)
    s.rect(x + xx, y - 20, 2, 36, "#513a30");
  s.rect(x - 19, y - 12, 38, 5, "#566069");
  s.rect(x - 19, y + 6, 38, 5, "#48545c");
  s.rect(x - 17, y - 12, 31, 2, "#849193");
  s.ellipse(x, y - 21, 14, 5, "#735334");
  s.rect(x - 11, y - 22, 23, 2, "#ab8551");
}
function table(s, x, y, w = 134, h = 78) {
  s.shade("#090d18", 0.45, (c) =>
    s.ellipse(x + 18, y + 24, w * 0.56, h * 0.5, c),
  );
  s.rect(x - w / 2 + 8, y + 17, 12, 24, "#211d27");
  s.rect(x + w / 2 - 20, y + 17, 12, 24, "#211d27");
  s.rect(x - w / 2, y - h / 2 + 10, w, h, "#322930");
  s.rect(x - w / 2, y - h / 2, w, h, "#795139");
  for (let yy = -h / 2 + 3; yy < h / 2; yy += 14) {
    s.rect(x - w / 2 + 2, y + yy, w - 4, 11, "#976b46");
    s.rect(x - w / 2 + 6, y + yy + 2, w - 16, 2, "#b38857");
    s.rect(x - w / 2 + 15, y + yy + 7, 34, 2, "#795039");
  }
  s.rect(x - w / 2, y - h / 2, w, 3, "#cca371");
  for (const dx of [-w * 0.32, w * 0.32]) {
    s.rect(x + dx - 6, y - 8, 12, 14, "#babb9e");
    s.rect(x + dx - 3, y - 6, 6, 5, "#8d572e");
    s.rect(x + dx + 6, y - 5, 3, 7, "#ddd2ad");
  }
  s.ellipse(x, y + 8, 10, 5, "#d1c3a0");
  s.rect(x - 6, y + 6, 12, 4, "#bb814b");
}
function stool(s, x, y) {
  s.shade("#0b101a", 0.4, (c) => s.ellipse(x + 6, y + 10, 17, 8, c));
  s.rect(x - 10, y - 3, 4, 15, "#392d2c");
  s.rect(x + 6, y - 3, 4, 15, "#392d2c");
  s.ellipse(x, y - 5, 16, 10, "#322a2d");
  s.ellipse(x, y - 9, 16, 10, "#825936");
  s.ellipse(x - 2, y - 11, 12, 6, "#a37745");
}
function candle(s, x, y) {
  glow(s, x, y + 12, 70, 44, "#f7b65d", 0.32);
  s.ellipse(x, y + 4, 7, 3, "#c99f5f");
  s.rect(x - 2, y - 8, 4, 12, "#e0c68a");
  s.rect(x - 2, y - 14, 4, 6, "#fbd774");
  s.rect(x, y - 16, 2, 8, "#fff3bd");
}
function tavernMap() {
  const s = new Surface(1200, 900),
    r = rng(284119);
  s.rect(0, 0, 1200, 900, "#151a27");
  // The room continues under all viewport edges; no browser-like frame is baked in.
  for (let y = 130; y < 900; y += 26)
    for (let x = ((y / 26) | 0) % 2 ? -70 : 0; x < 1200; x += 126)
      woodBoard(s, x, y, 124, 24, r);
  for (let y = 0; y < 142; y += 24)
    for (let x = ((y / 24) | 0) % 2 ? -27 : 0; x < 1200; x += 58) {
      s.rect(x, y, 56, 22, choose(r, ["#36343b", "#3f3a40", "#484045"]));
      s.rect(x + 3, y + 2, 49, 2, "#625358");
      s.rect(x + 4, y + 19, 47, 2, "#242530");
    }
  s.rect(0, 130, 1200, 20, "#211e2a");
  s.rect(0, 131, 1200, 5, "#8a6749");
  for (const x of [18, 302, 882, 1166]) {
    s.rect(x, 0, 18, 157, "#30272c");
    s.rect(x + 3, 0, 5, 153, "#6b4b37");
    s.rect(x + 3, 140, 16, 4, "#9b7750");
  }
  // Cool windows balance warm candle pools.
  for (const x of [145, 990]) {
    s.rect(x - 39, 25, 78, 81, "#1b1c2b");
    s.rect(x - 34, 31, 68, 68, "#3a5667");
    s.rect(x - 28, 37, 54, 55, "#547785");
    s.rect(x - 1, 31, 5, 68, "#302731");
    s.rect(x - 34, 63, 68, 5, "#302731");
    s.rect(x - 40, 102, 80, 7, "#98744f");
    glow(s, x, 162, 125, 89, "#78aec0", 0.15);
  }
  // Bar and bottle shelves. Shelves cast baked shadows behind, under the wood.
  for (const yy of [44, 90]) {
    s.rect(350, yy + 13, 495, 12, "#181c28");
    s.rect(349, yy + 5, 497, 9, "#7c563d");
    s.rect(350, yy + 5, 494, 3, "#b28a56");
    for (let x = 364; x < 830; x += 24) {
      const c = choose(r, [
        "#77908b",
        "#9d8054",
        "#64827d",
        "#8a607a",
        "#8a9569",
      ]);
      s.rect(x, yy - 14, 11, 20, c);
      s.rect(x + 3, yy - 21, 5, 8, mix(c, "#dae0b4", 0.28));
      s.rect(x + 2, yy - 10, 3, 9, mix(c, "#e1d7a2", 0.32));
      s.rect(x + 2, yy - 2, 7, 5, "#d0b17a");
    }
  }
  s.rect(334, 113, 525, 55, "#251f28");
  for (let x = 342; x < 854; x += 28) woodBoard(s, x, 117, 25, 48, r);
  s.shade("#10121e", 0.65, (c) => s.rect(273, 211, 650, 66, c));
  s.rect(272, 177, 650, 70, "#3b2c30");
  for (let x = 279; x < 918; x += 60) {
    s.rect(x, 190, 53, 48, "#654331");
    s.rect(x + 4, 194, 45, 3, "#976543");
    s.rect(x + 5, 199, 42, 32, "#53372c");
  }
  s.rect(262, 159, 670, 34, "#996a43");
  s.rect(262, 158, 670, 5, "#d3a971");
  s.rect(267, 168, 660, 3, "#b28555");
  s.rect(270, 189, 655, 7, "#51372d");
  for (const x of [324, 430, 552, 662, 774, 875]) stool(s, x, 272);
  for (const x of [331, 589, 861]) candle(s, x, 178);
  // Left hearth has static fire and warm masonry, distinct from the camp fire.
  s.shade("#080c17", 0.58, (c) => s.rect(43, 234, 173, 155, c));
  s.rect(26, 186, 176, 166, "#34353c");
  for (let yy = 195; yy < 338; yy += 22)
    for (let xx = 33 + (yy % 44 ? 0 : 18); xx < 195; xx += 40) {
      s.rect(xx, yy, 37, 19, "#515056");
      s.rect(xx + 3, yy + 1, 31, 3, "#747071");
    }
  s.rect(55, 220, 118, 111, "#121824");
  glow(s, 112, 330, 205, 165, "#f0a24e", 0.25);
  s.rect(66, 302, 97, 13, "#6f4531");
  s.line(78, 315, 153, 289, 7, "#b07542");
  s.line(77, 288, 151, 316, 7, "#945631");
  for (const [x, h] of [
    [80, 43],
    [105, 67],
    [135, 48],
  ]) {
    s.poly(
      [
        [x - 10, 307],
        [x - 12, 289],
        [x - 2, 278],
        [x + 2, 307 - h],
        [x + 13, 280],
        [x + 19, 295],
        [x + 12, 313],
      ],
      "#d96b3d",
    );
    s.poly(
      [
        [x - 3, 307],
        [x - 4, 283],
        [x + 5, 271],
        [x + 10, 298],
        [x + 6, 309],
      ],
      "#edb25d",
    );
    s.rect(x + 1, 292, 5, 13, "#ffe5a0");
  }
  s.rect(22, 339, 184, 15, "#747172");
  s.rect(24, 340, 180, 4, "#a39482");
  rug(s, 419, 367, 364, 344);
  // Tables stay outside the central recruiter promenade.
  for (const [x, y] of [
    [226, 477],
    [991, 471],
    [208, 722],
    [1002, 732],
  ]) {
    for (const [dx, dy] of [
      [-60, -63],
      [50, -61],
      [-61, 57],
      [48, 56],
    ])
      stool(s, x + dx, y + dy);
    table(s, x, y);
    candle(s, x, y - 9);
  }
  for (const [x, y] of [
    [1055, 216],
    [1100, 223],
    [1068, 272],
    [99, 812],
    [143, 825],
  ])
    barrel(s, x, y, r);
  // Hanging shield and pennants complete the room without text baked into artwork.
  for (const x of [269, 918]) {
    s.rect(x - 14, 18, 28, 63, "#222633");
    s.poly(
      [
        [x - 12, 18],
        [x + 12, 18],
        [x + 12, 64],
        [x, 79],
        [x - 12, 64],
      ],
      "#70414d",
    );
    s.rect(x - 3, 29, 6, 31, "#c2a16b");
    s.rect(x - 9, 41, 18, 5, "#c2a16b");
  }
  // Worn entry mat leaves the active central floor free for wandering heroes.
  rug(s, 494, 791, 214, 89);
  s.rect(490, 890, 222, 10, "#211f29");
  for (let n = 0; n < 45; n++) {
    const x = 355 + r() * 500,
      y = 300 + r() * 480;
    if (x > 415 && x < 790 && y < 718) continue;
    s.rect(x, y, 4 + r() * 9, 2, "#342b2e");
  }
  return s;
}
async function expeditionMap(kind = "forest") {
  const s = new Surface(2400, 1440),
    r = rng(100973),
    wooded = ["forest", "jungle"].includes(kind);
  vegetation(s, r, 2400, 1440);
  if (!wooded) {
    const palette =
      kind === "volcano"
        ? ["#302c3b", "#3b3243", "#4b3c4c", "#65505d"]
        : ["#343e48", "#414b53", "#525b60", "#6b7270"];
    s.rect(0, 0, 2400, 1440, palette[0]);
    for (let n = 0; n < 18000; n++)
      s.rect(r() * 2400, r() * 1440, 2 + r() * 12, 2, choose(r, palette));
    if (kind !== "volcano")
      for (let y = 0; y < 1440; y += 42)
        for (let x = ((y / 42) | 0) % 2 ? -36 : 0; x < 2400; x += 78) {
          s.rect(x, y, 74, 38, choose(r, palette.slice(0, 3)));
          s.rect(x + 4, y + 2, 64, 2, palette[3]);
          if (r() < 0.2) s.line(x + 28, y + 6, x + 40, y + 26, 2, palette[0]);
        }
  }
  const roadPoints = [];
  for (let x = -60; x <= 2460; x += 48)
    roadPoints.push([x, 722 + Math.sin((x - 600) / 165) * 36]);
  if (wooded) {
    s.path(roadPoints, 200, "#2b3839");
    s.path(roadPoints, 178, "#3d3f3b");
    s.path(roadPoints, 138, "#514940");
    s.path(roadPoints, 78, "#625246");
    groundDetails(s, r, 2400, 1440, ["#3d3f3b", "#514940", "#625246"]);
  }
  if (wooded) {
    for (let n = 0; n < 320; n++) {
      const x = r() * 2400,
        y = r() * 1440;
      if (y > 445 && y < 1000) continue;
      const w = 12 + r() * 30;
      s.shade("#0c131f", 0.42, (c) => s.ellipse(x + 3, y + 4, w * 0.6, 6, c));
      s.image(
        n % 5 === 0 ? rocks[n % 2] : bush,
        x - w / 2,
        y - w * 0.55,
        w,
        w * 0.7,
      );
    }
    const places = [];
    for (let y = 38; y < 1530; y += kind === "jungle" ? 65 : 80)
      for (let x = 8 + (Math.floor(y / 80) % 2) * 51; x < 2480; x += 94) {
        const xx = x + r() * 25,
          yy = y + r() * 30;
        if (yy > 465 && yy < 1030) continue;
        places.push({
          x: xx,
          y: yy,
          size: (kind === "jungle" ? 125 : 96) + Math.floor(r() * 3) * 16,
          kind: Math.floor(r() * 3),
          lightX: 1200,
          lightY: 200,
        });
      }
    drawTrees(s, places);
  }
  const prop = await sprite(
    pixelPropSvg(
      kind === "volcano" ? "rock" : kind === "village" ? "house" : "ruin",
    ),
  );
  if (kind !== "forest")
    for (let n = 0; n < 18; n++) {
      const x = 80 + (n % 9) * 275 + (r() - 0.5) * 45,
        y = n < 9 ? 350 + r() * 45 : 1280 + r() * 75,
        w = kind === "village" ? 170 : 105 + r() * 55;
      treeShadow(s, x, y, w, 1200, 700);
      s.image(prop, x - w / 2, y - w * 1.1, w, w * 1.2);
      if (kind === "village") glow(s, x, y - 25, 100, 60, "#f3b46a", 0.22);
    }
  if (kind === "volcano")
    for (const y0 of [130, 1180]) {
      const points = [];
      for (let x = -40; x < 2450; x += 26)
        points.push([x, y0 + Math.sin(x / 77) * 28 + Math.cos(x / 29) * 11]);
      s.path(points, 30, "#5d3442");
      s.path(points, 16, "#a34b43");
      s.path(points, 8, "#e89453");
      for (let n = 0; n < 12; n++)
        glow(s, n * 215, y0, 140, 85, "#e89453", 0.23);
    }
  if (kind !== "volcano")
    for (const [x, y] of [
      [402, 430],
      [1953, 1050],
      [982, 1106],
      [2030, 394],
    ]) {
      glow(s, x, y, 75, 40, "#8bbbc1", 0.17);
      for (let n = 0; n < 3; n++) {
        s.rect(x + n * 9, y - (n % 2) * 7, 3, 12, "#739092");
        s.ellipse(x + n * 9 + 2, y - (n % 2) * 7, 8, 4, "#8fc1be");
        s.rect(x + n * 9, y - (n % 2) * 7 - 2, 5, 2, "#d0d8bd");
      }
    }
  if (kind === "jungle")
    s.shade("#174534", 0.14, (c) => s.rect(0, 0, 2400, 1440, c));
  return s;
}

async function writeAsset(name, s) {
  const png = s.png();
  await writeFile(resolve(output, `${name}.png`), png);
  await writeFile(
    resolve(output, `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}" style="image-rendering:pixelated"><image width="${s.width}" height="${s.height}" href="data:image/png;base64,${png.toString("base64")}" /></svg>\n`,
  );
  console.log(`${name}: ${s.width}x${s.height} (${png.length} PNG bytes)`);
}
await mkdir(output, { recursive: true });
await writeAsset("map-camp", campMap());
await writeAsset("map-tavern", tavernMap());
for (const biome of ["forest", "jungle", "village", "volcano", "ruins"])
  await writeAsset(`map-expedition-${biome}`, await expeditionMap(biome));
const anchors = {
  tent: [750, 520],
  cabins: [750, 520],
  storage: [730, 740],
  crossroads: [900, 390],
  pantry: [1050, 800],
  kitchen: [1050, 800],
  tavern: [410, 710],
  guildhall: [380, 470],
  blacksmith: [1090, 600],
  training: [1090, 430],
  armory: [700, 390],
  alchemist: [1190, 740],
  market: [1410, 400],
  clinic: [1190, 900],
  farm: [1410, 850],
  garden: [620, 1100],
  archaeology: [420, 1040],
  dock: [940, 1120],
  portal: [1240, 480],
};
for (const key of PRERENDERED_BUILDINGS) {
  const s = new Surface(240, 240, 3),
    im = await sprite(pixelBuildingSvg(key, 1)),
    [x, y] = anchors[key] || [1410, 400],
    dx = x - 900,
    dy = y - 650,
    len = Math.hypot(dx, dy) || 1;
  // Contact/projection shadows always paint below the object, never over it.
  s.shade("#080c18", 0.46, (c) =>
    s.poly(
      [
        [72, 171],
        [168, 171],
        [156 + (dx / len) * 43, 187 + (dy / len) * 28],
        [84 + (dx / len) * 43, 187 + (dy / len) * 28],
      ],
      c,
    ),
  );
  s.shade("#070a13", 0.5, (c) => s.ellipse(120, 174, 51, 10, c));
  if (
    !["storage", "training", "farm", "garden", "archaeology", "dock"].includes(
      key,
    )
  )
    glow(s, 131, 173, 69, 36, key === "portal" ? "#a58bcf" : "#eab26f", 0.18);
  s.image(im, 48, 48, 144, 144);
  await writeAsset(`map-building-${key}`, s);
}
