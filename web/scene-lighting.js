import { PixelLighting } from "./pixel-lighting.js?v=21";
import { revealedCampAreas } from "./camp-world.js?v=21";
import { bonfireLight, fireFlicker } from "./camp-background.js?v=21";
import { createCampWater, paintCampWater } from "./camp-water.js?v=21";

// World-space lighting survives camera transforms. Layout is sampled once, not every frame.
export class SceneLighting {
  constructor(element, game = null) {
    this.element = element;
    this.game = game;
    this.camp = element.dataset.localMap === "camp";
    if (this.camp) this.water = createCampWater(element);
    this.width = Number(element.dataset.worldWidth) || 800;
    this.height = Number(element.dataset.worldHeight) || 700;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "scene-lightfield";
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.width = this.width / 2;
    this.canvas.height = this.height / 2;
    element.appendChild(this.canvas);
    this.light = new PixelLighting(this.width, this.height, 8);
    this.at = -Infinity;
    this.staticLights = [];
    this.objects = [];
    for (const el of element.querySelectorAll("[data-scene-key]")) {
      const key = el.dataset.sceneKey,
        x = +el.dataset.worldX,
        y = +el.dataset.worldY;
      if (key === "bonfire")
        this.staticLights.push({
          x,
          y: y + 12,
          ...bonfireLight(game),
          color: "#f4c76a",
          kind: "fire",
        });
      else if (["alchemist", "arcane", "portal"].includes(key))
        this.staticLights.push({
          x,
          y: y + 32,
          r: 150,
          color: "#ad83d5",
          kind: "window",
        });
      else if (
        [
          "tent",
          "tavern",
          "market",
          "kitchen",
          "blacksmith",
          "forge",
          "night",
          "menagerie",
          "guildhall",
        ].includes(key)
      )
        this.staticLights.push({
          x,
          y: y + 32,
          r: key === "market" ? 200 : 140,
          color: "#d98c43",
          kind: "window",
        });
    }
    this.residents = [
      ...element.querySelectorAll(
        "[data-world-resident], [data-world-prop], [data-tavern-wander], [data-town-npc], .bartender",
      ),
    ];
    if (element.dataset.localMap === "tavern")
      this.staticLights = [
        { x: 110, y: 305, r: 420, kind: "fire", color: "#e6aa64" },
        { x: 600, y: 220, r: 480, kind: "window", color: "#eec886" },
      ];
    this.scene = { map: { objects: this.objects } };
    this.fog = document.createElement("canvas");
    this.fog.width = this.width / 8;
    this.fog.height = this.height / 8;
    this.fog.className = "scene-reveal";
    this.fog.setAttribute("aria-hidden", "true");
    element.appendChild(this.fog);
    this.sync(game);
  }
  sync(game) {
    this.game = game;
    if (!this.camp || !game) return;
    this.staticLights = [bonfireLight(game)];
    const areas = revealedCampAreas(game),
      key = JSON.stringify(areas);
    if (key === this.fogKey) return;
    this.fogKey = key;
    const fog = this.fog.getContext("2d");
    fog.globalCompositeOperation = "source-over";
    fog.fillStyle = "#03060d";
    fog.fillRect(0, 0, this.fog.width, this.fog.height);
    fog.globalCompositeOperation = "destination-out";
    for (const area of areas) {
      const gradient = fog.createRadialGradient(
        area.x / 8,
        area.y / 8,
        (area.r * 0.83) / 8,
        area.x / 8,
        area.y / 8,
        (area.r * 1.14) / 8,
      );
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      fog.fillStyle = gradient;
      fog.fillRect(
        (area.x - area.r * 1.14) / 8,
        (area.y - area.r * 1.14) / 8,
        (area.r * 2.28) / 8,
        (area.r * 2.28) / 8,
      );
    }
  }
  draw(time) {
    if (time - this.at < 1 / 20) return;
    this.at = time;
    const reduced =
      !!this.game?.settings?.reducedMotion ||
      !!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const flicker = fireFlicker(time, reduced);
    const lights = [...this.staticLights],
      people = [];
    for (const el of this.residents) {
      if (el.hidden) continue;
      const x = parseFloat(el.style.left),
        y = parseFloat(el.style.top);
      people.push({
        type: "tree",
        id:
          el.dataset.hero ||
          el.dataset.worldProp ||
          el.dataset.tavernHero ||
          el.dataset.townNpc ||
          "bartender",
        x,
        y: y + 1,
        r: el.dataset.worldProp ? 13 : 12,
        height: el.dataset.worldProp ? 24 : 40,
      });
      const r = Number(el.dataset.lightRadius);
      if (r > 0)
        lights.push({
          owner:
            el.dataset.hero ||
            el.dataset.worldProp ||
            el.dataset.tavernHero ||
            el.dataset.townNpc ||
            "bartender",
          x: x + 10,
          y: y - 8,
          r,
          color: "#f4c76a",
          kind: "lamp",
        });
    }
    const ctx = this.canvas.getContext("2d");
    ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.camp) {
      // Ground and fire illumination are already baked. Only moving lamps add
      // live ground light; never wash out the scene with a second ambient pass.
      const patch = this.element.querySelector(".camp-firelight");
      if (patch) patch.style.opacity = String(0.9 * flicker);
      for (const source of lights.filter((l) => l.kind === "lamp")) {
        const glow = ctx.createRadialGradient(
          source.x,
          source.y,
          0,
          source.x,
          source.y,
          source.r,
        );
        glow.addColorStop(0, "rgba(234,184,98,.11)");
        glow.addColorStop(0.4, "rgba(198,155,87,.045)");
        glow.addColorStop(1, "rgba(198,155,87,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(
          source.x - source.r,
          source.y - source.r,
          source.r * 2,
          source.r * 2,
        );
      }
      if (
        (!reduced && time - (this.waterAt ?? -Infinity) >= 0.1) ||
        !this.waterPainted ||
        reduced !== this.waterReduced
      ) {
        paintCampWater(this.water.getContext("2d"), time, reduced);
        this.waterPainted = true;
        this.waterAt = time;
        this.waterReduced = reduced;
      }
      this.water.dataset.animated = String(!reduced);
      this.element.style.setProperty?.("--fire-flicker", String(flicker));
      for (const el of this.residents) {
        const x = parseFloat(el.style.left),
          y = parseFloat(el.style.top);
        let illumination = 0;
        for (const source of lights) {
          const f = Math.max(
            0,
            1 - Math.hypot(x - source.x, y - source.y) / source.r,
          );
          illumination = Math.max(
            illumination,
            f * (source.kind === "fire" ? flicker : 0.75),
          );
        }
        el.style.setProperty?.(
          "--actor-light",
          String(Math.min(1.05, 0.55 + illumination * 0.55)),
        );
      }
    } else {
      this.light.paint(
        { map: { objects: [] } },
        lights,
        [],
        [],
        time,
        this.element.dataset.localMap === "tavern" ? 0.18 : 0.5,
      );
      this.light.composite(ctx);
    }
    ctx.imageSmoothingEnabled = true;
    // Project from each footpoint away from the fire, after ALL ground light,
    // below sprites. Own lanterns never project their owner's shadow.
    for (const caster of people) {
      for (const source of lights) {
        const strength = this.camp
          ? source.kind === "fire"
            ? 0.64 * flicker
            : 0.16
          : 0.26;
        paintGroundShadow(ctx, source, caster, strength);
      }
      if (this.camp) {
        ctx.fillStyle = "rgba(2,4,8,.42)";
        ctx.beginPath();
        ctx.ellipse(caster.x, caster.y, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (this.camp) {
      this.paintFlame(time, reduced, flicker);
      return;
    }

    const fire = this.staticLights.find((l) => l.kind === "fire");
    if (fire) {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.06 + 0.015 * Math.sin(time * 13);
      ctx.fillStyle = "#f4c76a";
      for (const r of [30, 50, 80]) {
        ctx.beginPath();
        ctx.arc(fire.x, fire.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 6; i++) {
        const phase = (time * 0.6 + i * 0.17) % 1;
        ctx.fillStyle = phase < 0.5 ? "#f7df9b" : "#d98c43";
        ctx.fillRect(
          fire.x + Math.round((Math.sin(i * 4 + time) * 16) / 4) * 4,
          fire.y - 40 - Math.round((phase * 70) / 4) * 4,
          4,
          4,
        );
      }
    }
  }
  paintFlame(time, reduced, flicker) {
    if (!this.flame) {
      this.flame = document.createElement("canvas");
      this.flame.className = "camp-flame";
      this.flame.width = 160;
      this.flame.height = 180;
      this.flame.setAttribute("aria-hidden", "true");
      this.element.appendChild(this.flame);
    }
    const fire = this.staticLights[0],
      ctx = this.flame.getContext("2d");
    this.flame.style.left = fire.x - 80 + "px";
    this.flame.style.top = fire.y - 145 + "px";
    ctx.clearRect(0, 0, 160, 180);
    if (reduced) time = 0;
    for (let i = 0; i < 5; i++) {
      const x = 64 + i * 8,
        height = (62 + Math.sin(i * 11) * 18) * flicker,
        sway = Math.sin(time * 4 + i) * 4;
      ctx.fillStyle = ["#c76126", "#f49839", "#f9d078", "#67c9e4", "#fff0ba"][
        i
      ];
      ctx.beginPath();
      ctx.moveTo(x - 10, 144);
      ctx.bezierCurveTo(
        x - 17,
        125,
        x + sway,
        135 - height * 0.5,
        x + sway + 2,
        135 - height,
      );
      ctx.bezierCurveTo(x + 16, 132 - height * 0.35, x + 15, 139, x + 9, 145);
      ctx.closePath();
      ctx.fill();
    }
    if (!reduced)
      for (let i = 0; i < 5; i++) {
        const phase = (time * 0.43 + i * 0.19) % 1;
        ctx.globalAlpha = (1 - phase) * 0.65;
        ctx.fillStyle = "#eab868";
        ctx.fillRect(
          77 + Math.sin(i * 6 + time) * 15,
          124 - phase * 79,
          1.5,
          2.5,
        );
      }
    ctx.globalAlpha = 1;
  }
}

export function groundShadow(source, caster) {
  const dx = caster.x - source.x,
    dy = caster.y - source.y,
    d = Math.hypot(dx, dy);
  if ((source.owner && source.owner === caster.id) || d < 12 || d > source.r)
    return null;
  const ux = dx / d,
    uy = dy / d,
    r = caster.r || 9,
    length =
      source.height && caster.height
        ? Math.min(
            150,
            Math.max(
              35,
              (d * caster.height) / Math.max(22, source.height - caster.height),
            ),
          )
        : Math.min(100, 18 + d * 0.28);
  return [
    { x: caster.x - uy * r, y: caster.y + ux * r },
    { x: caster.x + uy * r, y: caster.y - ux * r },
    {
      x: caster.x + ux * length + uy * r * 0.45,
      y: caster.y + uy * length - ux * r * 0.45,
    },
    {
      x: caster.x + ux * length - uy * r * 0.45,
      y: caster.y + uy * length + ux * r * 0.45,
    },
  ];
}

export function paintGroundShadow(ctx, source, caster, opacity = 0.26) {
  const shape = groundShadow(source, caster);
  if (!shape) return;
  const tip = {
    x: (shape[2].x + shape[3].x) / 2,
    y: (shape[2].y + shape[3].y) / 2,
  };
  ctx.save();
  const fade = ctx.createLinearGradient(caster.x, caster.y, tip.x, tip.y);
  fade.addColorStop(0, `rgba(4,7,15,${opacity})`);
  fade.addColorStop(0.45, `rgba(4,7,15,${opacity * 0.6})`);
  fade.addColorStop(0.8, `rgba(4,7,15,${opacity * 0.18})`);
  fade.addColorStop(1, "rgba(4,7,15,0)");
  ctx.fillStyle = fade;
  ctx.shadowColor = `rgba(4,7,15,${opacity * 0.35})`;
  ctx.shadowBlur = 7;
  ctx.beginPath();
  shape.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
