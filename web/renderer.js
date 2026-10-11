import {
  vision,
  lightSources,
  revealed,
  sightPolygon,
} from "./lighting.js?v=14";
import {
  W,
  H,
  CLASSES,
  RARITY_COLORS,
  heroRarity,
  PETS,
  ITEMS,
  itemRarity,
  hasAttribute,
  characterSize,
  allGear,
} from "./data.js?v=14";
import { seeded } from "./engine.js?v=14";
import { portraitSvg, petSvg } from "./art.js?v=14";
const images = new Map();
function imageFor(hero) {
  const key =
    hero.race +
    hero.classId +
    (hero.specialization || "") +
    JSON.stringify(hero.appearance) +
    hero.cosmetic +
    JSON.stringify(hero.items) +
    JSON.stringify(hero.armor) +
    JSON.stringify(hero.light) +
    JSON.stringify(hero.talents) +
    JSON.stringify(hero.attributes) +
    JSON.stringify(hero.companion);
  if (images.has(key)) {
    const img = images.get(key);
    images.delete(key);
    images.set(key, img);
    return img;
  }
  const img = new Image();
  img.src =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(portraitSvg(hero));
  while (images.size >= 256) images.delete(images.keys().next().value);
  images.set(key, img);
  return img;
}

const circle = (ctx, x, y, r, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.background = document.createElement("canvas");
    this.background.width = W * 1.5;
    this.background.height = H * 1.5;
    this.fog = document.createElement("canvas");
    this.fog.width = W;
    this.fog.height = H;
    this.map = null;
    this.selected = null;
    this.showNames = true;
    this.lastSize = "";
  }
  fit() {
    const r = this.canvas.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2),
      key = r.width + ":" + r.height + ":" + dpr;
    if (key === this.lastSize) return;
    this.lastSize = key;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
  }
  bake(map) {
    this.map = map;
    const c = this.background.getContext("2d");
    c.setTransform(1.5, 0, 0, 1.5, 0, 0);
    const random = seeded(map.seed);
    const tones =
      map.biome === "volcano"
        ? ["#9b8b7c", "#726b62", "#a19482"]
        : map.biome === "jungle"
          ? ["#88a06d", "#67844e", "#74965b"]
          : map.biome === "river"
            ? ["#a5ada1", "#7b9284", "#8aa599"]
            : map.biome === "village"
              ? ["#c3b58d", "#a3a579", "#b8ad86"]
              : ["#a3b68b", "#7e9b6c", "#8aab77"];
    const grass = c.createLinearGradient(0, 0, 0, H);
    grass.addColorStop(0, tones[0]);
    grass.addColorStop(0.5, tones[1]);
    grass.addColorStop(1, tones[2]);
    c.fillStyle = grass;
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 750; i++) {
      const x = random() * W,
        y = random() * H;
      c.fillStyle = i % 3 ? "#c0ca9b" : "#678954";
      c.globalAlpha = 0.18 + random() * 0.13;
      c.beginPath();
      c.ellipse(x, y, 5 + random() * 35, 2 + random() * 11, 0, 0, 7);
      c.fill();
    }
    c.globalAlpha = 1;
    const roadPoints =
      {
        forest: [
          [-20, 255],
          [210, 195, 435, 292, 605, 236],
          [800, 177, 950, 280, W + 20, 225],
        ],
        river: [
          [-20, 175],
          [240, 80, 440, 190, 596, 168],
          [780, 140, 990, 390, W + 20, 320],
        ],
        village: [
          [-20, 320],
          [200, 380, 380, 80, 595, 178],
          [760, 240, 930, 100, W + 20, 170],
        ],
        volcano: [
          [-20, 355],
          [250, 330, 230, 100, 540, 210],
          [800, 390, 920, 55, W + 20, 115],
        ],
        jungle: [
          [-20, 225],
          [160, 80, 390, 380, 620, 235],
          [820, 80, 990, 355, W + 20, 270],
        ],
      }[map.biome] || [];
    c.beginPath();
    c.moveTo(...roadPoints[0]);
    for (const points of roadPoints.slice(1)) c.bezierCurveTo(...points);
    c.strokeStyle = map.biome === "volcano" ? "#8c8576" : "#b6b88b";
    c.lineWidth = 69;
    c.stroke();
    c.strokeStyle = map.biome === "volcano" ? "#b0a38a" : "#c9c49b";
    c.lineWidth = 48;
    c.stroke();
    if (map.biome === "volcano") {
      for (let i = 0; i < 8; i++) {
        const x = 230 + i * 118,
          y = 80 + (i % 3) * 122;
        c.strokeStyle = "#c17c50";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 19, y + 18);
        c.lineTo(x + 8, y + 35);
        c.lineTo(x + 38, y + 52);
        c.stroke();
        c.strokeStyle = "#efb36b";
        c.lineWidth = 1.4;
        c.stroke();
      }
    }
    for (let i = 0; i < 160; i++) {
      const x = random() * W,
        y = 230 + Math.sin(x / 140) * 18 + (random() - 0.5) * 39;
      circle(c, x, y, random() * 1.6 + 0.7, "#969969");
    }
    for (const o of map.objects)
      if (o.type === "river") {
        const water = c.createLinearGradient(o.x, 0, o.x + o.w, 0);
        water.addColorStop(0, "#668f99");
        water.addColorStop(0.5, "#8fafb6");
        water.addColorStop(1, "#608592");
        c.fillStyle = water;
        c.fillRect(o.x, 0, o.w, H);
        c.fillStyle = "#567e81";
        c.fillRect(o.x - 6, 0, 6, H);
        c.fillRect(o.x + o.w, 0, 6, H);
        for (let i = 0; i < 65; i++) {
          const y = random() * H,
            x = o.x + random() * o.w;
          c.strokeStyle = i % 3 ? "#c6d4cd" : "#9bbabd";
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + 12, y + 2);
          c.stroke();
        }
      }
    for (const b of map.bridges) {
      c.fillStyle = "#6b7673";
      c.fillRect(b.x, b.y + 6, b.w, b.h);
      c.fillStyle = "#baab85";
      c.fillRect(b.x, b.y, b.w, b.h);
      for (let i = 0; i < b.w; i += 10) {
        c.strokeStyle = "#91866d";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(b.x + i, b.y);
        c.lineTo(b.x + i, b.y + b.h);
        c.stroke();
      }
      c.strokeStyle = "#75765f";
      c.lineWidth = 4;
      c.strokeRect(b.x, b.y, b.w, b.h);
    }
    for (const b of map.bushes) {
      c.fillStyle = "#536f49";
      c.beginPath();
      c.ellipse(b.x + 4, b.y + 5, b.r, 14, 0, 0, 7);
      c.fill();
      for (let i = 0; i < 6; i++)
        circle(
          c,
          b.x + (random() - 0.5) * b.r * 1.4,
          b.y + (random() - 0.5) * 18,
          b.r * 0.45,
          i % 2 ? "#8aa26a" : "#6d915a",
        );
      for (let i = 0; i < 3; i++)
        circle(
          c,
          b.x + (random() - 0.5) * 20,
          b.y + (random() - 0.5) * 12,
          2,
          "#c1bb7d",
        );
    }
    for (const g of map.grass || []) {
      c.fillStyle = "#486e3f";
      c.globalAlpha = 0.18;
      c.beginPath();
      c.ellipse(g.x, g.y, g.r, g.r * 0.7, 0, 0, 7);
      c.fill();
      c.globalAlpha = 0.8;
      for (let n = 0; n < 25; n++) {
        const x = g.x + (random() - 0.5) * g.r * 1.5,
          y = g.y + (random() - 0.5) * g.r;
        c.strokeStyle = n % 2 ? "#78994e" : "#577b43";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x - 7, y - 10, x + 3, y - 21 - random() * 12);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    for (const o of map.objects
      .filter((o) => o.type !== "river")
      .sort((a, b) => a.y - b.y)) {
      if (o.type === "rock") {
        c.fillStyle = "#635e55";
        c.beginPath();
        c.moveTo(o.x - 25, o.y + 12);
        c.lineTo(o.x - 18, o.y - 21);
        c.lineTo(o.x + 7, o.y - 31);
        c.lineTo(o.x + 25, o.y - 5);
        c.lineTo(o.x + 20, o.y + 17);
        c.closePath();
        c.fill();
        c.strokeStyle = "#b39c76";
        c.lineWidth = 2;
        c.stroke();
        continue;
      }
      if (o.type === "ruin") {
        c.fillStyle = "#879280";
        c.fillRect(o.x, o.y + 16, o.w, o.h - 16);
        for (let n = 0; n < 3; n++) {
          c.fillStyle = n % 2 ? "#b1b29a" : "#999f86";
          c.fillRect(o.x + n * 23, o.y - 18 - (n % 2) * 8, 14, 52);
          c.fillStyle = "#698155";
          c.fillRect(o.x + n * 23 - 3, o.y + 3, 19, 5);
        }
        c.fillStyle = "#bec0a5";
        c.fillRect(o.x - 5, o.y - 23, o.w * 0.6, 10);
        continue;
      }
      if (o.type === "tree") {
        c.fillStyle = "#3e5a37";
        c.globalAlpha = 0.25;
        c.beginPath();
        c.ellipse(o.x + 11, o.y + 15, o.r + 7, o.r * 0.65, 0, 0, 7);
        c.fill();
        c.globalAlpha = 1;
        c.fillStyle = "#7c7458";
        c.fillRect(o.x - 4, o.y - 9, 8, 26);
        circle(
          c,
          o.x,
          o.y - 11,
          o.r + 9,
          map.biome === "volcano" ? "#645e4b" : "#507743",
        );
        circle(
          c,
          o.x - 12,
          o.y - 13,
          o.r * 0.65,
          map.biome === "volcano" ? "#81715a" : "#6e9257",
        );
        circle(
          c,
          o.x + 13,
          o.y - 10,
          o.r * 0.65,
          map.biome === "volcano" ? "#9b8568" : "#799c61",
        );
        circle(
          c,
          o.x,
          o.y - 24,
          o.r * 0.72,
          map.biome === "volcano" ? "#a18e6e" : "#90af70",
        );
        circle(
          c,
          o.x - 3,
          o.y - 29,
          o.r * 0.35,
          map.biome === "volcano" ? "#b4a07f" : "#a0b985",
        );
        c.strokeStyle = "#9bb486";
        c.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.arc(
            o.x + (random() - 0.5) * 25,
            o.y - 20 + (random() - 0.5) * 15,
            5,
            3.4,
            5.8,
          );
          c.stroke();
        }
      } else {
        c.fillStyle = "#476746";
        c.globalAlpha = 0.25;
        c.fillRect(o.x + 10, o.y + 12, o.w, o.h);
        c.globalAlpha = 1;
        c.fillStyle = "#c4bd98";
        c.fillRect(o.x, o.y + 12, o.w, o.h - 12);
        c.fillStyle = "#82765e";
        c.fillRect(o.x + o.w * 0.43, o.y + o.h - 24, 17, 24);
        c.fillStyle = "#8e9d97";
        c.fillRect(o.x + 13, o.y + o.h - 24, 13, 13);
        c.beginPath();
        c.moveTo(o.x - 9, o.y + 20);
        c.lineTo(o.x + o.w / 2, o.y - 13);
        c.lineTo(o.x + o.w + 9, o.y + 20);
        c.closePath();
        c.fillStyle = "#8e7962";
        c.fill();
        c.strokeStyle = "#776451";
        c.lineWidth = 3;
        c.stroke();
        c.beginPath();
        c.moveTo(o.x + o.w / 2, o.y - 13);
        c.lineTo(o.x + o.w / 2, o.y + 20);
        c.stroke();
      }
    }
    // Sparse flowers and weather-worn boundary posts.
    for (let i = 0; i < 120; i++) {
      const x = random() * W,
        y = random() * H;
      if (Math.abs(y - H / 2) < 45) continue;
      circle(c, x, y, 1.5, i % 4 ? "#c3c69b" : "#ded4a8");
    }
    for (const x of [22, W - 22])
      for (let y = 55; y < H; y += 65) {
        c.fillStyle = "#7b8967";
        c.fillRect(x, y, 3, 14);
        c.fillStyle = "#aaa88a";
        c.fillRect(x - 1, y, 5, 3);
      }
  }

  drawFog(b, t) {
    const f = this.fog.getContext("2d"),
      path = (ctx, s) => {
        const points = sightPolygon(b, s);
        ctx.beginPath();
        points.forEach((p, i) =>
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
        );
        ctx.closePath();
      };
    f.clearRect(0, 0, W, H);
    f.globalCompositeOperation = "source-over";
    f.fillStyle = "#070b18";
    f.fillRect(0, 0, W, H);
    f.globalCompositeOperation = "destination-out";
    f.fillStyle = "rgba(0,0,0,.18)";
    for (const n of b.fogSeen || [])
      f.fillRect((n % 30) * 40, Math.floor(n / 30) * 40, 40, 40);
    const lights = lightSources(b).filter((s) => revealed(b, s)),
      senses = b.units
        .filter(
          (u) => u.team === 0 && !u.dead && !u.pet && !u.summon && !u.structure,
        )
        .map((u) => ({
          x: u.x,
          y: u.y,
          r: vision(u.hero).sight,
          nightVision: vision(u.hero).nightVision,
          flying: u.flying,
          kind: "vision",
        }));
    for (const s of [...lights, ...senses]) {
      f.save();
      path(f, s);
      f.clip();
      const radius =
          s.r *
          (s.kind === "lamp" ? 1 + Math.sin(t * 5 + s.x * 0.01) * 0.008 : 1),
        g = f.createRadialGradient(
          s.x,
          s.y,
          Math.max(1, radius * 0.58),
          s.x,
          s.y,
          radius,
        );
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      f.fillStyle = g;
      f.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
      f.restore();
    }
    f.globalCompositeOperation = "source-over";
    this.ctx.drawImage(this.fog, 0, 0);
    for (const s of [...lights, ...senses.filter((s) => s.nightVision)]) {
      this.ctx.save();
      path(this.ctx, s);
      this.ctx.clip();
      this.ctx.globalCompositeOperation = "screen";
      const g = this.ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, s.r * 0.7),
        color = s.kind === "vision" ? "#739ed2" : s.color;
      g.addColorStop(0, color + "35");
      g.addColorStop(1, color + "00");
      this.ctx.fillStyle = g;
      this.ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
      this.ctx.restore();
    }
    this.ctx.save();
    this.ctx.font = "12px system-ui";
    this.ctx.fillStyle = "#d3dbea";
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      "Firelight reveals · blue sight is night vision",
      16,
      H - 12,
    );
    this.ctx.restore();
  }

  draw(battle, wallTime = 0) {
    this.fit();
    if (
      !this.map ||
      this.map.seed !== battle.map.seed ||
      this.map.biome !== battle.map.biome
    )
      this.bake(battle.map);
    const ctx = this.ctx,
      c = this.canvas;
    ctx.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(this.background, 0, 0, W, H);
    ctx.fillStyle = "#151c3b";
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    if (battle.time === 0) {
      for (const [x, color] of [
        [15, "#e0dcad"],
        [985, "#d9b28e"],
      ]) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(x, 35, 200, H - 70);
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([4, 7]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, 35, 200, H - 70);
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }
    for (const d of battle.decals || []) {
      ctx.save();
      ctx.globalAlpha = d.type === "blood" ? 0.7 : 0.5;
      ctx.fillStyle =
        d.type === "blood"
          ? "#843639"
          : d.type === "scorch"
            ? "#3d3c32"
            : "#8b6944";
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.r, d.r * 0.5, 0.2, 0, 7);
      ctx.fill();
      if (d.type === "blood")
        for (let i = 0; i < 5; i++)
          circle(
            ctx,
            d.x + Math.cos(i * 2) * d.r,
            d.y + Math.sin(i * 3) * d.r * 0.7,
            2 + (i % 3),
            "#8c3b3c",
          );
      ctx.restore();
    }
    for (const p of battle.props || []) {
      if (p.dead) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = "#334a36";
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.ellipse(4, 6, 20, 8, 0, 0, 7);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.burning > 0 ? "#806148" : "#aa8558";
      ctx.strokeStyle = "#6c573d";
      ctx.lineWidth = 2;
      if (p.kind === "barrel") {
        const wood = ctx.createLinearGradient(-14, 0, 14, 0);
        wood.addColorStop(0, "#725139");
        wood.addColorStop(0.35, "#b98b59");
        wood.addColorStop(0.75, "#ac7949");
        wood.addColorStop(1, "#6d4c35");
        ctx.fillStyle = wood;
        ctx.beginPath();
        ctx.moveTo(-12, -25);
        ctx.bezierCurveTo(-18, -17, -18, -2, -12, 6);
        ctx.quadraticCurveTo(0, 13, 12, 6);
        ctx.bezierCurveTo(18, -2, 18, -17, 12, -25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#684a34";
        ctx.stroke();
        for (let x = -10; x <= 10; x += 5) {
          ctx.beginPath();
          ctx.moveTo(x, -23);
          ctx.quadraticCurveTo(x * 1.35, -8, x, 7);
          ctx.strokeStyle = "#805b3d";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        for (const y of [-19, 0]) {
          ctx.fillStyle = "#64706b";
          ctx.beginPath();
          ctx.ellipse(0, y, 15, 4, 0, 0, 7);
          ctx.fill();
          ctx.fillRect(-15, y - 1, 30, 4);
          ctx.strokeStyle = "#9caaa0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(0, y - 1, 15, 3, 0, 0, Math.PI);
          ctx.stroke();
          circle(ctx, -9, y + 1, 1, "#b5b9a9");
          circle(ctx, 9, y + 1, 1, "#b5b9a9");
        }
        ctx.fillStyle = "#bf9868";
        ctx.beginPath();
        ctx.ellipse(0, -25, 12, 4, 0, 0, 7);
        ctx.fill();
        ctx.strokeStyle = "#6c5036";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-8, -27);
        ctx.lineTo(-7, -22);
        ctx.moveTo(-2, -29);
        ctx.lineTo(-1, -21);
        ctx.moveTo(5, -28);
        ctx.lineTo(6, -22);
        ctx.stroke();
        circle(ctx, 3, -25, 2, "#71513a");
      } else {
        ctx.fillRect(-15, -22, 30, 28);
        ctx.strokeRect(-15, -22, 30, 28);
        ctx.beginPath();
        ctx.moveTo(-13, -20);
        ctx.lineTo(13, 4);
        ctx.moveTo(13, -20);
        ctx.lineTo(-13, 4);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (const f of battle.fires || []) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life);
      for (let i = 0; i < 5; i++) {
        const x = f.x + Math.cos(i * 2) * f.r * 0.55,
          y = f.y + Math.sin(i * 2) * f.r * 0.4,
          h = 14 + Math.sin(wallTime * 9 + i) * 7;
        ctx.fillStyle = i % 2 ? "#e99546" : "#e3b366";
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.quadraticCurveTo(x - 10, y - h / 2, x + 2, y - h);
        ctx.quadraticCurveTo(x + 10, y - 4, x + 5, y);
        ctx.fill();
      }
      ctx.restore();
    }
    for (const z of battle.zones) {
      const blessing = z.type === "blessing",
        gravity = z.element === "gravity",
        color = blessing
          ? "#f1edbb"
          : gravity
            ? "#8e72ce"
            : z.element === "ember"
              ? "#efab68"
              : z.element === "frost"
                ? "#bedeee"
                : "#af81ba";
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = gravity ? 0.23 : 0.15;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, 7);
      ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = color;
      ctx.lineWidth = blessing ? 3 : 2;
      if (!blessing && !gravity) ctx.setLineDash([10, 5, 2, 5]);
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, 7);
      ctx.stroke();
      ctx.setLineDash([]);
      if (gravity) {
        circle(ctx, z.x, z.y, 18, "#483963");
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.48;
          ctx.beginPath();
          ctx.ellipse(
            z.x,
            z.y,
            28 + i * 20,
            10 + i * 11,
            wallTime * 0.9 + i * 0.7,
            0,
            7,
          );
          ctx.stroke();
        }
      }
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + (gravity ? wallTime * 0.9 : 0),
          x = z.x + Math.cos(a) * z.r * 0.63,
          y = z.y + Math.sin(a) * z.r * 0.63;
        ctx.globalAlpha = 0.8;
        if (blessing) {
          ctx.beginPath();
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x + 4, y);
          ctx.moveTo(x, y - 4);
          ctx.lineTo(x, y + 4);
          ctx.stroke();
        } else if (gravity) circle(ctx, x, y, 2.6, "#d5b7f1");
        else {
          ctx.beginPath();
          ctx.moveTo(x, y - 5);
          ctx.lineTo(x + 4, y + 3);
          ctx.lineTo(x - 4, y + 3);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.85;
      ctx.font = "bold 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = blessing ? "#476843" : "#554268";
      ctx.fillText(
        blessing
          ? "BLESSING"
          : gravity
            ? "GRAVITY CURSE"
            : z.element === "ember"
              ? "EMBER CURSE"
              : z.element === "frost"
                ? "FROST CURSE"
                : "CURSE",
        z.x,
        z.y + z.r + 12,
      );
      ctx.restore();
    }
    for (const t of battle.traps || []) {
      ctx.save();
      ctx.globalAlpha = t.triggered ? 0.25 : 0.95;
      ctx.strokeStyle = t.kind === "mine" ? "#d2a56b" : "#147fa0";
      ctx.fillStyle = t.kind === "mine" ? "#fff5b7" : "#b6c9b3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(t.x, t.y, 12, 7, 0, 0, 7);
      ctx.fill();
      ctx.stroke();
      if (t.kind === "mine") {
        circle(ctx, t.x, t.y - 3, 4, "#ff8e45");
      } else {
        ctx.beginPath();
        ctx.moveTo(t.x - 8, t.y - 3);
        ctx.lineTo(t.x + 8, t.y + 3);
        ctx.moveTo(t.x - 8, t.y + 3);
        ctx.lineTo(t.x + 8, t.y - 3);
        ctx.stroke();
      }
      ctx.restore();
    }
    const sorted = [...battle.units].sort((a, b) => a.y - b.y);
    for (const u of sorted) {
      if (u.team !== 0 && !revealed(battle, u)) continue;
      if (u.dead) {
        if (!u.structure) {
          ctx.globalAlpha = 0.26;
          circle(ctx, u.x, u.y, 8, u.team === 0 ? "#e9dab2" : "#deb596");
          ctx.globalAlpha = 1;
        }
        continue;
      }
      const bob = u.moving
          ? Math.sin(battle.time * 12 + u.uid) * 1.7
          : Math.sin(wallTime * (0.55 + (u.uid % 5) * 0.07) + u.uid) * 1.15 +
            Math.sin(wallTime * 0.73 + u.uid * 2) * 0.65,
        flying = u.flying ? 12 + Math.sin(wallTime * 4 + u.uid) * 3 : 0,
        stealth = u.stealthUntil > battle.time;
      ctx.save();
      ctx.translate(u.x, u.y);
      ctx.fillStyle = "#213b2e";
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      ctx.ellipse(1, 5, 13, 5, 0, 0, 7);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle =
        ["#a4b7c2", "#b9715c", "#a18ebc", "#d5b75f", "#a74339"][u.team] ||
        "#b9715c";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 1, 14, 5, 0, 0, 7);
      ctx.stroke();
      if (u.shield > 0) {
        ctx.strokeStyle = "#d0e5ec";
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -13 - flying, 21, 26, 0, 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.translate(0, bob - flying);
      if (stealth) ctx.globalAlpha = 0.42;
      if (u.structure) {
        if (u.kind === "wall") {
          ctx.fillStyle = "#c0a179";
          ctx.strokeStyle = "#776b4d";
          ctx.lineWidth = 2;
          for (let i = -15; i < 18; i += 8) {
            ctx.fillRect(i, -22, 7, 28);
            ctx.strokeRect(i, -22, 7, 28);
          }
          ctx.fillStyle = "#8a7953";
          ctx.fillRect(-18, -14, 39, 5);
        } else {
          ctx.fillStyle = "#b9b290";
          ctx.fillRect(-11, -10, 22, 13);
          ctx.fillStyle = "#697d66";
          ctx.fillRect(-9, -24, 18, 15);
          ctx.save();
          ctx.rotate(u.facing > 0 ? 0.15 : -0.15);
          ctx.fillStyle = "#5a6c5a";
          ctx.fillRect(u.facing > 0 ? 0 : -24, -22, 24, 6);
          ctx.restore();
          circle(ctx, -10, 0, 5, "#6b624a");
          circle(ctx, 10, 0, 5, "#6b624a");
        }
      } else if (u.pet) {
        const renderPet = {
            ...u.hero.companion,
            wingPose: [-4, 0, 5, 4, 0, -3][
              Math.floor(wallTime / 1.2 + u.uid) % 6
            ],
          },
          key = "pet:" + JSON.stringify(renderPet);
        let img = images.get(key);
        if (!img) {
          img = new Image();
          img.src =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(petSvg(renderPet));
          images.set(key, img);
        }
        if (img.complete && img.naturalWidth)
          ctx.drawImage(
            img,
            -(u.petKey === "sprite" ? 9 : 13),
            -(u.petKey === "sprite" ? 16 : 24),
            u.petKey === "sprite" ? 18 : 26,
            u.petKey === "sprite" ? 18 : 28,
          );
        else circle(ctx, 0, -8, 8, PETS[u.petKey].color);
      } else if (u.hazard) {
        ctx.fillStyle = ["lion", "tiger"].includes(u.hazard)
          ? "#c4a565"
          : "#8b7658";
        if (["lion", "tiger"].includes(u.hazard)) {
          ctx.beginPath();
          ctx.ellipse(0, -12, 22, 11, 0, 0, 7);
          ctx.fill();
          circle(ctx, u.facing * 18, -19, 13, "#8e6b40");
          circle(ctx, u.facing * 20, -17, 8, "#cdb079");
          circle(ctx, u.facing * 23, -20, 2, "#343d2f");
          ctx.fillRect(-15, -6, 5, 14);
          ctx.fillRect(12, -6, 5, 14);
          if (u.hazard === "tiger") {
            ctx.strokeStyle = "#433239";
            ctx.lineWidth = 3;
            for (const x of [-13, -4, 5, 14]) {
              ctx.beginPath();
              ctx.moveTo(x, -20);
              ctx.lineTo(x + 3, -9);
              ctx.stroke();
            }
          }
        } else {
          ctx.fillRect(-24, -21, 48, 23);
          circle(ctx, -17, 3, 8, "#4e5143");
          circle(ctx, 17, 3, 8, "#4e5143");
          ctx.fillStyle = "#bcaa7e";
          ctx.fillRect(-18, -24, 36, 5);
          ctx.strokeStyle = "#ddd2a7";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.lineTo(u.facing * 31, -35);
          ctx.stroke();
        }
      } else if (u.summon) {
        ctx.fillStyle = "#d0dcc0";
        ctx.beginPath();
        ctx.ellipse(0, -9, 15, 8, 0, 0, 7);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(u.facing * 7, -12);
        ctx.lineTo(u.facing * 21, -18);
        ctx.lineTo(u.facing * 17, -2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#c4d3b6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-10, 7);
        ctx.moveTo(8, -1);
        ctx.lineTo(10, 6);
        ctx.stroke();
        circle(ctx, u.facing * 17, -11, 1.7, "#5a745d");
      } else {
        if (u.mounted) {
          const renderMount = {
              ...u.hero.companion,
              wingPose: [-4, 0, 5, 4, 0, -3][
                Math.floor(wallTime / 1.2 + u.uid) % 6
              ],
            },
            horseKey = "mount:" + JSON.stringify(renderMount);
          let horse = images.get(horseKey);
          if (!horse) {
            horse = new Image();
            horse.src =
              "data:image/svg+xml;charset=utf-8," +
              encodeURIComponent(petSvg(renderMount));
            images.set(horseKey, horse);
          }
          if (horse.complete && horse.naturalWidth)
            ctx.drawImage(horse, -26, -29, 52, 47);
          ctx.translate(0, -13);
        }
        const phase = Math.floor(wallTime / 2.3 + u.uid) % 6,
          pose = {
            ...u.hero,
            appearance: {
              ...u.hero.appearance,
              look: [0, 1, 1, 0, -1, -1][phase],
              weaponPose: [-2, 0, 3, 4, 0, -3][phase],
              wingPose: [-4, 0, 5, 4, 0, -3][phase],
              smokePose: phase,
            },
          };
        const img = imageFor(pose),
          size = characterSize(u.hero);
        if (img.complete && img.naturalWidth) {
          ctx.save();
          if (u.swingUntil > battle.time) ctx.rotate(u.facing * 0.09);
          ctx.rotate(Math.sin(wallTime * 1.3 + u.uid) * 0.025);
          ctx.drawImage(
            img,
            -22 * size[1],
            -43 * size[0],
            44 * size[1],
            46 * size[0],
          );
          ctx.restore();
        } else circle(ctx, 0, -15, 15, CLASSES[u.classId].color);
      }
      if (!u.structure && !u.summon) {
        const gear = allGear(u.hero),
          magic =
            gear.find((i) => ITEMS[i.key].aura) ||
            gear.find((i) => itemRarity(i) >= 2),
          color = magic
            ? ITEMS[magic.key].aura || RARITY_COLORS[itemRarity(magic)]
            : hasAttribute(u.hero, "Cursed")
              ? "#b594d0"
              : hasAttribute(u.hero, "Blessed")
                ? "#ecdc9c"
                : null;
        if (color) {
          ctx.globalAlpha = 0.45 + 0.2 * Math.sin(wallTime * 1.5 + u.uid);
          for (let n = 0; n < 3; n++) {
            const t =
              (wallTime * (0.22 + n * 0.03) + u.uid * 0.17 + n * 0.31) % 1;
            circle(
              ctx,
              Math.sin(t * 5 + n) * 19,
              -6 - t * 42,
              1.1 + (n % 2) * 0.5,
              color,
            );
          }
          ctx.globalAlpha = 1;
        }
      }
      if (u.hitUntil > battle.time) {
        ctx.globalAlpha = 0.24;
        circle(ctx, 0, -15, 18, "#fff9d9");
      }
      ctx.restore();
      const barY =
          u.y -
          49 * (u.structure || u.summon ? 1 : characterSize(u.hero)[0]) -
          flying,
        health = u.hp / u.maxHp;
      ctx.fillStyle = "#3d5340";
      ctx.fillRect(u.x - 16, barY, 32, 4);
      ctx.fillStyle = u.team === 0 ? "#ccdaa8" : "#d9a086";
      ctx.fillRect(u.x - 16, barY, 32 * health, 4);
      if (u.shield > 0) {
        ctx.fillStyle = "#c6e0e8";
        ctx.fillRect(u.x - 16, barY - 3, 32 * Math.min(1, u.shield / 70), 2);
      }
      if (!u.structure && !u.summon) {
        ctx.fillStyle = RARITY_COLORS[heroRarity(u.hero)];
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(u.x + 20, barY - 4);
        ctx.lineTo(u.x + 24, barY);
        ctx.lineTo(u.x + 20, barY + 4);
        ctx.lineTo(u.x + 16, barY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      if (this.showNames && !u.structure && !u.summon) {
        ctx.font = "bold 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillStyle = "#324733";
        ctx.globalAlpha = 0.78;
        ctx.fillText(u.name.split(" ")[0], u.x, u.y + 17);
        ctx.globalAlpha = 1;
      }
    }
    for (const u of battle.units) {
      if (
        u.dead ||
        !u.speech ||
        u.speechUntil <= battle.time ||
        u.summon ||
        u.structure
      )
        continue;
      ctx.save();
      const age = battle.time - (u.speechStarted ?? u.speechUntil - 5);
      ctx.globalAlpha = Math.min(
        1,
        age / 0.55,
        (u.speechUntil - battle.time) / 0.8,
      );
      ctx.font = "9px system-ui";
      ctx.textAlign = "center";
      const w = ctx.measureText(u.speech).width + 12,
        x = Math.max(w / 2 + 5, Math.min(W - w / 2 - 5, u.x)),
        y = Math.max(
          30,
          u.y - 80 * characterSize(u.hero)[0] - (u.mounted ? 13 : 0),
        );
      ctx.fillStyle = "#fff7e7";
      ctx.strokeStyle = "#6a735d";
      ctx.lineWidth = 1;
      ctx.fillRect(x - w / 2, y - 11, w, 18);
      ctx.strokeRect(x - w / 2, y - 11, w, 18);
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 7);
      ctx.lineTo(x + 3, y + 12);
      ctx.lineTo(x + 7, y + 7);
      ctx.fill();
      ctx.fillStyle = "#354536";
      ctx.fillText(u.speech, x, y + 2);
      ctx.restore();
    }
    for (const d of battle.debris || []) {
      ctx.save();
      ctx.translate(d.x, d.y - d.z);
      ctx.rotate(d.x * 0.05);
      ctx.fillStyle = d.color;
      if (d.kind === "blood") circle(ctx, 0, 0, d.r, d.color);
      else {
        ctx.fillRect(-d.r, -d.r * 0.5, d.r * 2, d.r);
        if (d.kind === "limb") circle(ctx, d.r, 0, d.r * 0.5, "#c49d84");
      }
      ctx.restore();
    }
    for (const p of battle.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.type === "shell") {
        circle(
          ctx,
          0,
          -Math.sin(
            Math.min(
              1,
              Math.hypot(p.x - p.startX, p.y - p.startY) /
                Math.max(
                  1,
                  Math.hypot(p.target.x - p.startX, p.target.y - p.startY),
                ),
            ),
          ) * 25,
          5,
          "#565e50",
        );
        ctx.strokeStyle = "#eed19a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-12, 5);
        ctx.stroke();
      } else if (p.type === "arrow") {
        ctx.rotate(Math.atan2(p.target.y - 9 - p.y, p.target.x - p.x));
        ctx.strokeStyle = "#ead8a9";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(3, 0);
        ctx.stroke();
        ctx.fillStyle = "#f7ecd2";
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(0, -3);
        ctx.lineTo(0, 3);
        ctx.fill();
      } else {
        circle(ctx, 0, 0, 6, p.type === "fire" ? "#e9bb77" : "#e4dfb2");
        circle(ctx, 0, 0, 3, "#fff5cf");
      }
      ctx.restore();
    }
    for (const e of battle.effects) {
      ctx.save();
      ctx.globalAlpha = e.life / e.max;
      const progress = 1 - e.life / e.max;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3;
      if (e.type === "explosion") {
        circle(ctx, e.x, e.y, e.r * (0.15 + progress * 0.7), "#efbb70");
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#fce4a2";
      }
      if (e.type === "beam") {
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        if (e.color === "#c0ebff") {
          ctx.lineTo((e.x + e.x2) / 2 + 8, (e.y + e.y2) / 2 - 7);
        }
        ctx.lineTo(e.x2, e.y2);
        ctx.stroke();
      } else if (e.type === "slash") {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * (0.6 + progress * 0.5), -1.7, 1.4);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(e.x, e.y, Math.max(2, e.r * (0.3 + progress)), 0, 7);
        ctx.stroke();
        if (
          ["burst", "build", "explosion", "level", "convert"].includes(e.type)
        ) {
          for (let i = 0; i < 7; i++)
            circle(
              ctx,
              e.x + Math.cos(i) * e.r * progress,
              e.y + Math.sin(i) * e.r * progress,
              2.5,
              e.color,
            );
        }
      }
      ctx.restore();
    }
    ctx.textAlign = "center";
    for (const f of battle.floats) {
      ctx.globalAlpha = f.life / f.max;
      ctx.font = "bold 12px system-ui";
      ctx.strokeStyle = "#426044";
      ctx.lineWidth = 2.5;
      ctx.strokeText(f.text, f.x, f.y - (1 - f.life / f.max) * 24);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - (1 - f.life / f.max) * 24);
    }
    ctx.globalAlpha = 1;
    this.drawFog(battle, wallTime);
    const marked = battle.units.find((u) => u.uid === this.selected);
    if (marked) {
      const x = marked.x,
        y = marked.y - (marked.flying ? 15 : 0);
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#243a30";
      ctx.shadowBlur = 3;
      const selectedSize = characterSize(marked.hero),
        halfWidth = Math.max(23, 23 * selectedSize[1]),
        left = x - halfWidth,
        top =
          y - Math.max(47, 47 * selectedSize[0]) - (marked.mounted ? 13 : 0);
      for (const [cx, cy, dx, dy] of [
        [left, top, 1, 1],
        [x + halfWidth, top, -1, 1],
        [left, y + 7, 1, -1],
        [x + halfWidth, y + 7, -1, -1],
      ]) {
        ctx.beginPath();
        ctx.moveTo(cx + dx * 9, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + dy * 9);
        ctx.stroke();
      }
      const py = Math.max(34, top - 13 + Math.sin(wallTime * 3) * 2);
      ctx.fillStyle = "#efddb2";
      ctx.beginPath();
      ctx.moveTo(x - 7, py - 8);
      ctx.lineTo(x + 7, py - 8);
      ctx.lineTo(x, py + 1);
      ctx.closePath();
      ctx.fill();
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      const label = (marked.dead ? "FALLEN · " : "SELECTED · ") + marked.name,
        labelW = ctx.measureText(label).width + 16;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#354a3b";
      const labelX = Math.max(labelW / 2 + 4, Math.min(W - labelW / 2 - 4, x));
      ctx.fillRect(labelX - labelW / 2, py - 30, labelW, 17);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, labelX, py - 18);
      ctx.restore();
    }
  }
}
