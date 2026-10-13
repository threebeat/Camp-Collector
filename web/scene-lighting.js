import { PixelLighting } from "./pixel-lighting.js?v=19";
import { revealedCampAreas } from "./camp-world.js?v=19";
import { campProgress } from "./evernight.js?v=19";

// World-space lighting survives camera transforms. Layout is sampled once, not every frame.
export class SceneLighting {
  constructor(element, game = null) {
    this.element = element;
    this.game = game;
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
          r: 420 + Math.min(100, (game ? campProgress(game).level : 1) * 6),
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
    const fog = this.fog.getContext("2d");
    if (element.dataset.localMap === "camp" && game) {
      fog.fillStyle = "#080a16";
      fog.fillRect(0, 0, this.fog.width, this.fog.height);
      fog.globalCompositeOperation = "destination-out";
      for (const area of revealedCampAreas(game))
        for (const [f, a] of [
          [1.13, 0.18],
          [1.07, 0.3],
          [1, 0.98],
        ]) {
          fog.fillStyle = `rgba(0,0,0,${a})`;
          fog.beginPath();
          fog.arc(area.x / 8, area.y / 8, (area.r * f) / 8, 0, Math.PI * 2);
          fog.fill();
        }
    }
  }
  draw(time) {
    if (time - this.at < 1 / 20) return;
    this.at = time;
    const lights = [...this.staticLights],
      people = [];
    for (const el of this.residents) {
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
        y: y - 2,
        r: el.dataset.worldProp ? 13 : 9,
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
    // Resident occluders use the same ray geometry as buildings, without an innate aura.
    this.scene.map.objects = [...this.objects, ...people];
    this.light.paint(
      { map: { objects: [] } },
      lights,
      [],
      [],
      time,
      this.element.dataset.localMap === "tavern" ? 0.18 : 0.5,
    );
    const ctx = this.canvas.getContext("2d");
    ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    this.light.composite(ctx);
    ctx.imageSmoothingEnabled = false;
    // All cast shadows stay on the ground plane, below their owner sprites.
    for (const caster of people)
      for (const source of lights) {
        paintGroundShadow(ctx, source, caster);
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
    length = Math.min(100, 18 + d * 0.28);
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
