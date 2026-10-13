import { CAMP_WORLD, CAMP_ANCHORS } from "./camp-world.js?v=19";
import { PRERENDERED_BUILDINGS } from "./map-assets.js?v=19";
// A single ground image contains terrain, buildings, contact shadows and static
// light. Moving actors never invalidates this composition.
const images = new Map();
let bakedKey = "",
  pending = null;
function image(url) {
  if (!images.has(url))
    images.set(
      url,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
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
export async function mountCampBackground(world, g) {
  const key = JSON.stringify(g.buildings);
  if (bakedKey !== key || !pending) {
    bakedKey = key;
    pending = (async () => {
      const canvas = document.createElement("canvas");
      canvas.width = CAMP_WORLD.width;
      canvas.height = CAMP_WORLD.height;
      canvas.className = "baked-camp-map";
      canvas.setAttribute("aria-hidden", "true");
      const ctx = canvas.getContext("2d");
      const base = await image("/map-camp-v05.svg?v=19");
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
      const buildings = Object.entries(CAMP_ANCHORS).filter(
        ([k]) =>
          !["bonfire", "storage", "questboard"].includes(k) &&
          g.buildings[k] &&
          !(k === "pantry" && g.buildings.kitchen),
      );
      buildings.sort((a, b) => a[1][1] - b[1][1]);
      const tiles = await Promise.all(
        buildings.map(async ([k, [x, y]]) => {
          const art = buildingArt(k, g);
          return PRERENDERED_BUILDINGS.includes(art)
            ? { k, x, y, img: await image(`/map-building-${art}.svg?v=19`) }
            : null;
        }),
      );
      for (const tile of tiles.filter(Boolean)) {
        const { k, x, y, img } = tile,
          size = ["tavern", "guildhall", "tradingpost", "arena"].includes(k)
            ? 290
            : k === "crossroads"
              ? 155
              : 210;
        // The tiles include their own static shadows. This contact wash joins
        // the foundation to the generated soil without a realtime occluder.
        const contact = ctx.createRadialGradient(
          x,
          y + 30,
          10,
          x,
          y + 30,
          size * 0.4,
        );
        contact.addColorStop(0, "rgba(5,8,15,.38)");
        contact.addColorStop(1, "rgba(5,8,15,0)");
        ctx.fillStyle = contact;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.drawImage(img, x - size / 2, y - size * 0.62, size, size);
      }
      return canvas;
    })();
  }
  try {
    const canvas = await pending;
    if (!world.isConnected) return;
    if (
      canvas.parentElement &&
      canvas.parentElement !== world.querySelector(".world-ground")
    )
      canvas.remove();
    world.querySelector(".world-ground").replaceChildren(canvas);
  } catch {
    /* Keep the generated terrain visible if an optional tile fails. */
  }
}
