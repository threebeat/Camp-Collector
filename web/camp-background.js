import { CAMP_WORLD, CAMP_ANCHORS } from "./camp-world.js?v=21";
import { PRERENDERED_BUILDINGS, buildingAssetUrl } from "./map-assets.js?v=21";
import { campProgress } from "./evernight.js?v=21";

const images = new Map(),
  mounted = new WeakMap();
function image(url) {
  if (!images.has(url))
    images.set(
      url,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          images.delete(url);
          reject(new Error(`Camp art: ${url}`));
        };
        img.src = url;
      }),
    );
  return images.get(url);
}
export function buildingArt(key, g) {
  return key === "tent" && g.buildings.tent > 1
    ? "cabins"
    : key === "tradingpost"
      ? "market"
      : key === "arena"
        ? "training"
        : key;
}
export function bonfireLight(g) {
  return {
    x: CAMP_ANCHORS.bonfire[0],
    y: CAMP_ANCHORS.bonfire[1],
    r: 430 + Math.min(110, campProgress(g).level * 7),
    kind: "fire",
    color: "#e6a75a",
    height: 65,
  };
}
export function fireFlicker(time, reduced = false) {
  return reduced
    ? 1
    : 1 +
        0.045 * Math.sin(time * 6.7) +
        0.024 * Math.sin(time * 11.3 + 1.2) +
        0.012 * Math.sin(time * 19.1);
}
export function campScenery(g) {
  const entries = Object.entries(CAMP_ANCHORS).filter(
    ([key]) =>
      !["storage", "questboard"].includes(key) &&
      g.buildings[key] &&
      !(key === "pantry" && g.buildings.kitchen),
  );
  if (g.portalUnlocked) entries.push(["portal", [2100, 650]]);
  return entries
    .map(([key, [x, y]]) => {
      const size = ["tavern", "guildhall", "tradingpost", "arena"].includes(key)
        ? 290
        : key === "crossroads"
          ? 155
          : key === "bonfire"
            ? 146
            : 210;
      return {
        key,
        x,
        y,
        size,
        art: buildingArt(key, g),
        level: g.buildings[key] || 1,
        rect: {
          x: Math.floor(x - size / 2 - 8),
          y: Math.floor(y - size * 0.62 - 8),
          w: size + 16,
          h: Math.ceil(size * 1.18) + 16,
        },
      };
    })
    .sort((a, b) => a.y - b.y);
}
export function overlaps(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
export function changedScenery(before, after) {
  const old = new Map(before.map((t) => [t.key, t])),
    next = new Map(after.map((t) => [t.key, t]));
  return [...new Set([...old.keys(), ...next.keys()])].flatMap((key) => {
    const a = old.get(key),
      b = next.get(key);
    return JSON.stringify(a) === JSON.stringify(b)
      ? []
      : [a?.rect, b?.rect].filter(Boolean);
  });
}
export function paintHearth(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  const soot = ctx.createRadialGradient(0, 4, 15, 0, 4, 72);
  soot.addColorStop(0, "rgba(9,7,7,.88)");
  soot.addColorStop(0.6, "rgba(19,12,9,.46)");
  soot.addColorStop(1, "rgba(19,12,9,0)");
  ctx.fillStyle = soot;
  ctx.scale(1, 0.64);
  ctx.fillRect(-74, -74, 148, 148);
  ctx.scale(1, 1 / 0.64);
  ctx.fillStyle = "#211814";
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 15; i++) {
    const a = (i * Math.PI * 2) / 15,
      sx = Math.cos(a) * 43,
      sy = Math.sin(a) * 25;
    ctx.fillStyle = i < 8 ? "#706653" : "#423e38";
    ctx.beginPath();
    ctx.ellipse(sx, sy, 9, 6, -0.2 + i * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#938168";
    ctx.fillRect(sx - 4, sy - 3, 6, 2);
  }
  for (const angle of [-0.5, 0.65]) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = "#2f211b";
    ctx.fillRect(-31, -5, 62, 10);
    ctx.fillStyle = "#5a3925";
    ctx.fillRect(-29, -5, 58, 3);
    ctx.restore();
  }
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = i % 3 ? "#9c4824" : "#e7953c";
    ctx.fillRect(Math.sin(i * 17) * 25, Math.cos(i * 7) * 12, 3, 2);
  }
  ctx.restore();
}
// Dirty rectangles restore their underlying terrain, then every intersecting
// building in depth order. An upgrade never redraws the rest of the world.
export function paintSceneryRegion(ctx, base, tiles, art, rect) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(base, 0, 0, CAMP_WORLD.width, CAMP_WORLD.height);
  for (const t of tiles) {
    if (!overlaps(t.rect, rect)) continue;
    if (t.key === "bonfire") {
      paintHearth(ctx, t.x, t.y);
      continue;
    }
    const img = art.get(t.art);
    if (!img) continue;
    const contact = ctx.createRadialGradient(
      t.x,
      t.y + 30,
      10,
      t.x,
      t.y + 30,
      t.size * 0.4,
    );
    contact.addColorStop(0, "rgba(5,8,15,.4)");
    contact.addColorStop(1, "rgba(5,8,15,0)");
    ctx.fillStyle = contact;
    ctx.fillRect(t.rect.x, t.rect.y, t.rect.w, t.rect.h);
    ctx.drawImage(img, t.x - t.size / 2, t.y - t.size * 0.62, t.size, t.size);
  }
  ctx.restore();
}
export function paintNightRegion(ctx, surface, rect) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(surface, 0, 0);
  ctx.fillStyle = "rgba(2,7,17,.64)";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
export function paintFirelight(ctx, surface, light) {
  const r = Math.ceil(light.r),
    size = r * 2;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(
    surface,
    light.x - r,
    light.y - r,
    size,
    size,
    0,
    0,
    size,
    size,
  );
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "#d5a678";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createRadialGradient(r, r, 12, r, r, r);
  mask.addColorStop(0, "rgba(0,0,0,.78)");
  mask.addColorStop(0.28, "rgba(0,0,0,.61)");
  mask.addColorStop(0.58, "rgba(0,0,0,.32)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";
}
function canvas(className, w, h) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  el.className = className;
  el.setAttribute("aria-hidden", "true");
  return el;
}
export async function mountCampBackground(world, g) {
  let state = mounted.get(world);
  if (!state) {
    state = {
      ground: canvas("baked-camp-map", CAMP_WORLD.width, CAMP_WORLD.height),
      surface: canvas("", CAMP_WORLD.width, CAMP_WORLD.height),
      fire: canvas("camp-firelight", 1, 1),
      tiles: [],
      key: "",
      revision: 0,
      queue: Promise.resolve(),
    };
    mounted.set(world, state);
  }
  const tiles = campScenery(g),
    light = bonfireLight(g),
    key = JSON.stringify([tiles, light.r]);
  if (state.requested === key) return state.queue;
  state.requested = key;
  state.queue = state.queue
    .then(async () => {
      const base = await image("/map-camp-v07.svg?v=21"),
        art = new Map(
          await Promise.all(
            [
              ...new Set(
                tiles
                  .map((t) => t.art)
                  .filter((k) => PRERENDERED_BUILDINGS.includes(k)),
              ),
            ].map(async (k) => [k, await image(buildingAssetUrl(k))]),
          ),
        );
      if (!world.isConnected) return;
      const dirty = state.key
        ? changedScenery(state.tiles, tiles)
        : [{ x: 0, y: 0, w: CAMP_WORLD.width, h: CAMP_WORLD.height }];
      for (const rect of dirty) {
        paintSceneryRegion(
          state.surface.getContext("2d"),
          base,
          tiles,
          art,
          rect,
        );
        paintNightRegion(state.ground.getContext("2d"), state.surface, rect);
      }
      const r = Math.ceil(light.r),
        fireRect = { x: light.x - r, y: light.y - r, w: r * 2, h: r * 2 };
      if (
        !state.key ||
        state.radius !== r ||
        dirty.some((rect) => overlaps(rect, fireRect))
      ) {
        state.fire.width = state.fire.height = r * 2;
        state.fire.style.left = fireRect.x + "px";
        state.fire.style.top = fireRect.y + "px";
        paintFirelight(state.fire.getContext("2d"), state.surface, light);
        state.fire.dataset.revision = String(
          Number(state.fire.dataset.revision || 0) + 1,
        );
      }
      state.tiles = tiles;
      state.key = key;
      state.radius = r;
      if (dirty.length)
        state.ground.dataset.revision = String(++state.revision);
      state.ground.dataset.dirtyRects = JSON.stringify(dirty);
      const ground = world.querySelector(".world-ground");
      if (state.ground.parentElement !== ground)
        ground.replaceChildren(state.ground, state.fire);
      world.dataset.environmentReady = "true";
    })
    .catch((error) => {
      state.requested = "";
      world.dataset.environmentReady = "error";
      console.warn(error.message);
    });
  return state.queue;
}
