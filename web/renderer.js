import { MAP_ASSETS } from "./map-assets.js?v=21";
import { paintGroundShadow } from "./scene-lighting.js?v=21";
import { WorldCamera } from "./camera.js?v=21";
import {
  vision,
  lightSources,
  environmentLights,
  revealed,
} from "./lighting.js?v=21";
import {
  W,
  H,
  characterSize,
  RARITY_COLORS,
  heroRarity,
  ITEMS,
  allGear,
  itemRarity,
} from "./data.js?v=21";
import { portraitSvg, petSvg, creatureSvg } from "./art.js?v=21";
import {
  pixelTerrainSvg,
  pixelPropSvg,
  pixelCreatureSvg,
} from "./pixel-art.js?v=21";
import { PixelLighting } from "./pixel-lighting.js?v=21";

const PAD_X = 600,
  PAD_Y = 480,
  BACK_W = W + PAD_X * 2,
  BACK_H = H + PAD_Y * 2;
const GRID = 2,
  images = new Map();
function sprite(key, svg, ready) {
  if (images.has(key)) {
    const image = images.get(key);
    images.delete(key);
    images.set(key, image);
    if (!image.complete && ready) image._ready.push(ready);
    return image;
  }
  const image = new Image();
  image._ready = ready ? [ready] : [];
  image.onload = () => {
    // WebKit otherwise rerasterizes embedded survivor SVGs for every unit on
    // every frame. Decode each appearance once, then blit a small bitmap.
    if (key.startsWith("hero:")) {
      const bitmap = document.createElement("canvas");
      bitmap.width = 192;
      bitmap.height = 240;
      const context = bitmap.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, bitmap.width, bitmap.height);
      image._bitmap = bitmap;
    }
    for (const callback of image._ready.splice(0)) callback();
  };
  image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg());
  if (images.size >= 320) images.delete(images.keys().next().value);
  images.set(key, image);
  return image;
}
function heroSprite(hero, pose) {
  const appearance = {
    ...hero.appearance,
    weaponPose: pose,
    wingPose: pose,
    smokePose: pose,
  };
  const visualGear = (i) =>
    i && [
      i.key,
      itemRarity(i),
      i.rank,
      i.cosmetic,
      i.prefix,
      i.affix,
      i.enchantment,
      i.modifiers,
      i.sockets,
    ];
  const key =
    "hero:" +
    JSON.stringify([
      hero.race,
      hero.classId,
      hero.specialization,
      hero.classPath,
      hero.classNodes,
      appearance,
      hero.items?.map(visualGear),
      hero.armor?.map(visualGear),
      visualGear(hero.light),
      heroRarity(hero),
      hero.cosmetic,
      hero.attributes?.map((a) => [a.key, a.rank]),
      hero.talents?.map((a) => a.key),
    ]);
  return sprite(key, () => portraitSvg({ ...hero, appearance }));
}
function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x / GRID) * GRID,
    Math.round(y / GRID) * GRID,
    Math.max(GRID, Math.round(w / GRID) * GRID),
    Math.max(GRID, Math.round(h / GRID) * GRID),
  );
}
function disk(ctx, x, y, radius, color, outline = false) {
  ctx.fillStyle = color;
  const r = Math.max(GRID, Math.round(radius / GRID) * GRID);
  for (let y1 = -r; y1 <= r; y1 += GRID) {
    const span =
      Math.floor(Math.sqrt(Math.max(0, r * r - y1 * y1)) / GRID) * GRID;
    if (outline) {
      rect(ctx, x - span, y + y1, GRID * 2, GRID, color);
      rect(ctx, x + span - GRID, y + y1, GRID * 2, GRID, color);
    } else rect(ctx, x - span, y + y1, span * 2 + GRID, GRID, color);
  }
}
function line(ctx, x1, y1, x2, y2, color, width = 3) {
  const steps = Math.max(
    1,
    Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / GRID),
  );
  for (let i = 0; i <= steps; i++)
    rect(
      ctx,
      x1 + ((x2 - x1) * i) / steps,
      y1 + ((y2 - y1) * i) / steps,
      width,
      width,
      color,
    );
}
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.world = document.createElement("canvas");
    this.background = document.createElement("canvas");
    for (const c of [this.world, this.background]) {
      c.width = BACK_W;
      c.height = BACK_H;
    }
    this.lighting = new PixelLighting(BACK_W, BACK_H, 8);
    this.terrainImages = new Map();
    this.camera = new WorldCamera(W, H, {
      x: 220,
      y: H / 2,
      span: 480,
      min: 360,
    });
    this.baseSpan = 480;
    this.camera.padding = 100;
    this.map = null;
    this.mapDirty = true;
    this.selected = null;
    this.showNames = false;
    this.lastSize = "";
    this.bounds = canvas.getBoundingClientRect();
    this.sizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            this.bounds = canvas.getBoundingClientRect();
          })
        : null;
    this.sizeObserver?.observe(canvas);
  }
  fit() {
    const r = this.sizeObserver
        ? this.bounds
        : this.canvas.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, r.width),
      height = Math.max(1, r.height);
    const key = width + ":" + height + ":" + dpr;
    if (key !== this.lastSize) {
      this.lastSize = key;
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.camera.maxSpan = Math.max(
        360,
        Math.min(1800, (1380 * width) / height),
      );
      this.camera.viewport(width, height);
      this.baseSpan = Math.min(W, Math.max(360, (H * width) / height));
    }
  }
  dispose() {
    this.sizeObserver?.disconnect();
  }
  panTo(x) {
    this.camera.move(x - this.camera.x, 0);
  }
  panBy(dx, dy) {
    this.camera.move(dx, dy);
  }
  zoom(factor) {
    this.camera.zoom(factor);
  }
  followCompany() {
    this.camera.manual = !this.camera.manual;
  }
  worldPoint(clientX, clientY) {
    return this.camera.point(
      this.canvas.getBoundingClientRect(),
      clientX,
      clientY,
    );
  }
  prop(ctx, kind, x, y, width = 64, height = width, variant = 0, ready) {
    const image = sprite(
      `prop:${kind}:${variant}`,
      () => pixelPropSvg(kind, variant),
      ready,
    );
    if (image.complete && image.naturalWidth)
      ctx.drawImage(
        image,
        Math.round((x - width / 2) / GRID) * GRID,
        y - height,
        width,
        height,
      );
  }
  bake(map) {
    this.map = map;
    this.mapDirty = false;
    const ctx = this.background.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, PAD_X, PAD_Y);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(-PAD_X, -PAD_Y, BACK_W, BACK_H);
    rect(ctx, -PAD_X, -PAD_Y, BACK_W, BACK_H, "#354d4b");
    const ready = () => {
      this.mapDirty = true;
    };
    const ground = sprite(
      `terrain:${map.biome}:${map.seed}`,
      () => pixelTerrainSvg(map.biome, BACK_W, BACK_H, map.seed),
      ready,
    );
    if (ground.complete && ground.naturalWidth)
      ctx.drawImage(ground, -PAD_X, -PAD_Y, BACK_W, BACK_H);
    const biome = map.biome === "river" ? "marsh" : map.biome;
    if (MAP_ASSETS[biome] && !this.terrainImages.has(biome)) {
      const im = new Image();
      im.onload = ready;
      im.src = MAP_ASSETS[biome].url;
      this.terrainImages.set(biome, im);
    }
    const terrain = this.terrainImages.get(biome);
    if (terrain?.complete && terrain.naturalWidth)
      ctx.drawImage(terrain, -PAD_X, -PAD_Y, BACK_W, BACK_H);
    for (let x = -PAD_X; !MAP_ASSETS[biome] && x < W + PAD_X; x += 12) {
      const y =
        Math.round((H * 0.5 + Math.sin(x / 160 + (map.seed % 5)) * 35) / 4) * 4;
      rect(
        ctx,
        x,
        y - 22,
        12,
        44,
        map.biome === "volcano" ? "#484053" : "#414654",
      );
      rect(
        ctx,
        x + 2,
        y - 17,
        8,
        34,
        map.biome === "volcano" ? "#5c4a56" : "#535162",
      );
      if (x % 36 === 0) rect(ctx, x, y - 12, 8, 2, "#6f6370");
    }
    for (const o of map.objects || [])
      if (o.type === "river") {
        rect(ctx, o.x - 8, -PAD_Y, o.w + 16, BACK_H, "#263f50");
        rect(ctx, o.x, -PAD_Y, o.w, BACK_H, "#416479");
        for (let i = -34; i < 104; i++)
          rect(
            ctx,
            o.x + ((Math.abs(i) * 17) % Math.max(8, o.w - 20)),
            i * 14,
            14 + (i % 3) * 6,
            2,
            "#7195a4",
          );
      }
    for (const bridge of map.bridges || []) {
      rect(ctx, bridge.x, bridge.y, bridge.w, bridge.h, "#6e554f");
      for (let x = 0; x < bridge.w; x += 8)
        rect(ctx, bridge.x + x, bridge.y + 2, 6, bridge.h - 4, "#a27c62");
      rect(ctx, bridge.x, bridge.y - 3, bridge.w, 5, "#c0a37a");
      rect(ctx, bridge.x, bridge.y + bridge.h - 3, bridge.w, 5, "#c0a37a");
    }
    for (const bush of map.bushes || [])
      this.prop(
        ctx,
        "bush",
        bush.x,
        bush.y + 10,
        bush.r * 2,
        bush.r * 1.5,
        0,
        ready,
      );
    for (const o of [...(map.objects || [])].sort((a, b) => a.y - b.y)) {
      if (o.type === "river") continue;
      const width =
        o.type === "tree"
          ? Math.max(70, o.r * 2.4)
          : o.type === "rock"
            ? o.r * 2.3
            : o.w;
      const height =
        o.type === "tree"
          ? width * 1.15
          : o.type === "rock"
            ? width * 0.8
            : o.h + 32;
      this.prop(
        ctx,
        o.type,
        o.x + (o.w ? o.w / 2 : 0),
        o.y + (o.h || o.r * 0.6 || 0),
        width,
        height,
        0,
        ready,
      );
    }
    for (const source of environmentLights(map))
      this.prop(
        ctx,
        source.kind === "window" ? "torch" : source.kind,
        source.x,
        source.y + 8,
        source.kind === "lava" ? 50 : 28,
        source.kind === "torch" ? 44 : 28,
        0,
        ready,
      );
  }
  draw(battle, wallTime = 0) {
    this.fit();
    if (
      this.mapDirty ||
      !this.map ||
      this.map.seed !== battle.map.seed ||
      this.map.biome !== battle.map.biome
    )
      this.bake(battle.map);
    const ctx = this.world.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, PAD_X, PAD_Y);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(-PAD_X, -PAD_Y, BACK_W, BACK_H);
    ctx.drawImage(this.background, -PAD_X, -PAD_Y, BACK_W, BACK_H);
    const sources = lightSources(battle),
      visible = (u) => u.team === 0 || revealed(battle, u, 0, sources);
    const visibleUnits = battle.units.filter(visible);
    const lamps = sources.filter((s) => revealed(battle, s, 0, sources));
    const senses = battle.units
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
    // Props and ground effects belong below the fog mask, exactly like terrain.
    for (const decal of battle.decals || [])
      disk(
        ctx,
        decal.x,
        decal.y,
        decal.r,
        decal.type === "blood" ? "#713d55" : "#242535",
      );
    for (const prop of battle.props || []) {
      if (prop.dead) continue;
      for (const source of lamps) paintGroundShadow(ctx, source, prop);
      this.prop(ctx, prop.kind, prop.x, prop.y + 10, 42, 42);
    }
    const shifted = (p) => ({ ...p, x: p.x + PAD_X, y: p.y + PAD_Y });
    this.lighting.paint(
      {
        map: { objects: battle.map.objects.map(shifted) },
        lightOffset: { x: PAD_X, y: PAD_Y },
      },
      lamps.map(shifted),
      senses.map(shifted),
      battle.fogSeen,
      wallTime,
    );
    ctx.save();
    ctx.translate(-PAD_X, -PAD_Y);
    this.lighting.composite(ctx);
    ctx.restore();
    for (const unit of visibleUnits.filter((u) => !u.dead))
      for (const source of lamps)
        paintGroundShadow(ctx, source, {
          id: unit.uid,
          x: unit.x,
          y: unit.y,
          r: unit.r || 9,
        });
    for (const zone of battle.zones || []) {
      const color =
        zone.type === "blessing"
          ? "#f7df9b"
          : zone.element === "gravity"
            ? "#ad83d5"
            : zone.element === "ember"
              ? "#d98c43"
              : "#92c9d0";
      ctx.globalAlpha = 0.22;
      disk(ctx, zone.x, zone.y, zone.r, color);
      ctx.globalAlpha = 0.8;
      disk(ctx, zone.x, zone.y, zone.r, color, true);
      ctx.globalAlpha = 1;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = zone.x + Math.cos(angle) * zone.r * 0.7,
          y = zone.y + Math.sin(angle) * zone.r * 0.7;
        rect(ctx, x - 4, y, 10, 2, color);
        rect(ctx, x, y - 4, 2, 10, color);
      }
    }
    for (const trap of battle.traps || []) {
      ctx.globalAlpha = trap.triggered ? 0.3 : 1;
      this.prop(
        ctx,
        trap.kind === "mine" ? "mine" : "trap",
        trap.x,
        trap.y + 8,
        28,
        28,
      );
      ctx.globalAlpha = 1;
    }
    for (const fire of battle.fires || []) {
      this.prop(
        ctx,
        "bonfire",
        fire.x,
        fire.y + 12,
        Math.max(34, fire.r),
        Math.max(34, fire.r),
        Math.floor(wallTime * 3) % 2,
      );
      for (let i = 0; i < 3; i++)
        rect(
          ctx,
          fire.x + (i - 1) * 8,
          fire.y - 10 - ((Math.floor(wallTime * 8) + i * 7) % 30),
          2,
          4,
          "#f4c76a",
        );
    }
    for (const unit of [...visibleUnits].sort((a, b) => a.y - b.y)) {
      if (unit.dead) {
        rect(
          ctx,
          unit.x - 10,
          unit.y,
          20,
          6,
          unit.team === 0 ? "#596481" : "#713d55",
        );
        continue;
      }
      const size =
        unit.structure || unit.summon || unit.pet
          ? [1, 1]
          : characterSize(unit.hero);
      const flying = unit.flying ? 14 : 0,
        bob = unit.moving
          ? (Math.floor(wallTime * 8 + Number(unit.uid || 0)) % 2) * 2
          : 0;
      rect(ctx, unit.x - 15, unit.y, 30, 6, "#111725");
      rect(
        ctx,
        unit.x - 18,
        unit.y + 4,
        36,
        2,
        ["#92c9d0", "#d97e86", "#b496da", "#f4c76a"][unit.team] || "#d97e86",
      );
      const y = unit.y + 4 - flying - bob;
      ctx.save();
      if (unit.stealthUntil > battle.time) ctx.globalAlpha = 0.48;
      if (unit.structure)
        this.prop(
          ctx,
          unit.kind === "wall" ? "wall" : "turret",
          unit.x,
          y,
          56,
          56,
        );
      else if (unit.pet) {
        const image = sprite(
          "pet:" +
            JSON.stringify([
              unit.hero.companion.key,
              unit.hero.companion.cosmetic,
              itemRarity(unit.hero.companion),
            ]),
          () => petSvg(unit.hero.companion),
        );
        if (image.complete && image.naturalWidth)
          ctx.drawImage(image, unit.x - 20, y - 40, 40, 40);
      } else if (unit.hazard || unit.summon) {
        const kind =
          unit.hazard ||
          (unit.name?.includes("Grove") || unit.name?.includes("Vine")
            ? "grove-spirit"
            : unit.name?.includes("echo")
              ? "wraith"
              : "wolf");
        const image = sprite("creature:" + kind, () =>
          ["grove-spirit", "wraith"].includes(kind)
            ? pixelPropSvg(kind)
            : pixelCreatureSvg(kind),
        );
        if (image.complete && image.naturalWidth)
          ctx.drawImage(image, unit.x - 32, y - 60, 64, 64);
      } else {
        if (unit.mounted) {
          const image = sprite(
            "mount:" + JSON.stringify(unit.hero.companion),
            () => petSvg(unit.hero.companion),
          );
          if (image.complete && image.naturalWidth)
            ctx.drawImage(image, unit.x - 40, y - 56, 80, 64);
        }
        const image =
          unit.hero.npcType === "dinosaur"
            ? sprite("dinosaur:" + unit.hero.race, () => creatureSvg(unit.hero))
            : heroSprite(
                unit.hero,
                unit.swingUntil > battle.time
                  ? 2
                  : Math.floor(wallTime * (unit.moving ? 4 : 1)) % 2,
              );
        if (image.complete && image.naturalWidth)
          ctx.drawImage(
            image._bitmap || image,
            unit.x - 32 * size[1],
            Math.round((y - 68 * size[0] - (unit.mounted ? 14 : 0)) / GRID) *
              GRID,
            64 * size[1],
            68 * size[0],
          );
        const rare = allGear(unit.hero).find(
          (i) => ITEMS[i.key]?.aura || itemRarity(i) >= 2,
        );
        if (rare)
          for (let n = 0; n < 2; n++)
            rect(
              ctx,
              unit.x + (n ? 25 : -25),
              y - ((Math.floor(wallTime * 10) + n * 25) % 60),
              2,
              4,
              ITEMS[rare.key].aura || RARITY_COLORS[itemRarity(rare)],
            );
      }
      ctx.restore();
      const barY = y - 74 * size[0] - (unit.mounted ? 14 : 0);
      rect(ctx, unit.x - 22, barY - 2, 44, 8, "#0a0c1a");
      rect(
        ctx,
        unit.x - 20,
        barY,
        Math.max(0, (40 * unit.hp) / unit.maxHp),
        4,
        unit.team === 0 ? "#a4d0a0" : "#d97e86",
      );
      if (unit.shield > 0) {
        disk(ctx, unit.x, y - 28, 35, "#92c9d0", true);
        rect(
          ctx,
          unit.x - 20,
          barY - 5,
          Math.min(40, unit.shield / 2),
          2,
          "#92c9d0",
        );
      }
      if (unit.hitUntil > battle.time) {
        ctx.globalAlpha = 0.3;
        rect(ctx, unit.x - 16, y - 42, 32, 28, "#f7df9b");
        ctx.globalAlpha = 1;
      }
    }
    for (const projectile of battle.projectiles || []) {
      const color =
        projectile.type === "fire"
          ? "#f4c76a"
          : projectile.type === "bolt"
            ? "#92c9d0"
            : "#f7df9b";
      if (projectile.type === "arrow")
        line(
          ctx,
          projectile.x - 10,
          projectile.y,
          projectile.x + 6,
          projectile.y,
          color,
          2,
        );
      else {
        rect(ctx, projectile.x - 4, projectile.y - 4, 8, 8, color);
        rect(ctx, projectile.x - 8, projectile.y - 1, 6, 2, "#d98c43");
      }
    }
    for (const debris of battle.debris || [])
      rect(
        ctx,
        debris.x,
        debris.y - debris.z,
        debris.r * 2,
        debris.r,
        debris.color,
      );
    for (const effect of battle.effects || []) {
      const progress = 1 - effect.life / effect.max;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      if (effect.type === "beam")
        line(ctx, effect.x, effect.y, effect.x2, effect.y2, effect.color, 4);
      else
        disk(
          ctx,
          effect.x,
          effect.y,
          Math.max(2, effect.r * (0.3 + progress)),
          effect.color,
          effect.type !== "explosion",
        );
      ctx.globalAlpha = 1;
    }
    const marked = visibleUnits.find((u) => u.uid === this.selected && !u.dead);
    if (marked) {
      const size = characterSize(marked.hero),
        top = marked.y - 76 * size[0] - (marked.flying ? 14 : 0);
      for (const [x, y, dx, dy] of [
        [marked.x - 36 * size[1], top, 1, 1],
        [marked.x + 36 * size[1], top, -1, 1],
        [marked.x - 36 * size[1], marked.y + 8, 1, -1],
        [marked.x + 36 * size[1], marked.y + 8, -1, -1],
      ]) {
        line(ctx, x, y, x + dx * 10, y, "#f7df9b", 2);
        line(ctx, x, y, x, y + dy * 10, "#f7df9b", 2);
      }
    }
    if (!this.camera.manual)
      this.camera.focus(
        battle.units.filter(
          (u) => u.team === 0 && !u.dead && !u.structure && !u.summon && !u.pet,
        ),
        this.baseSpan,
      );
    this.camera.update(wallTime);
    const display = this.ctx,
      canvas = this.canvas,
      scale = canvas.width / this.camera.width,
      offsetY = -this.camera.y * scale;
    display.setTransform(1, 0, 0, 1, 0, 0);
    display.imageSmoothingEnabled = false;
    display.fillStyle = "#0a0c1a";
    display.fillRect(0, 0, canvas.width, canvas.height);
    display.drawImage(
      this.world,
      (-PAD_X - this.camera.x) * scale,
      offsetY - PAD_Y * scale,
      BACK_W * scale,
      BACK_H * scale,
    );
    // Text uses display resolution so HP and names stay readable at phone sizes.
    display.setTransform(scale, 0, 0, scale, -this.camera.x * scale, offsetY);
    display.font = "bold 17px system-ui";
    display.textAlign = "center";
    display.lineWidth = 5;
    if (this.showNames)
      for (const unit of visibleUnits)
        if (!unit.dead && !unit.structure && !unit.summon) {
          display.strokeStyle = "#0a0c1a";
          display.strokeText(unit.name.split(" ")[0], unit.x, unit.y + 25);
          display.fillStyle = "#f7df9b";
          display.fillText(unit.name.split(" ")[0], unit.x, unit.y + 25);
        }
    for (const float of battle.floats || [])
      if (revealed(battle, float, 0, sources)) {
        display.globalAlpha = Math.max(0, float.life / float.max);
        display.strokeStyle = "#0a0c1a";
        display.fillStyle = float.color;
        const y = float.y - (1 - float.life / float.max) * 24;
        display.strokeText(float.text, float.x, y);
        display.fillText(float.text, float.x, y);
      }
    display.globalAlpha = 1;
  }
}
