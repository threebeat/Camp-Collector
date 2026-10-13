// Current generated paintings: scripts/prepare-ruin-assets.mjs. Legacy maps: scripts/generate-map-assets.mjs.
// SVG envelopes embed PNG/WebP bytes so the existing text-asset Worker can serve them.
export const MAP_ASSETS = Object.freeze({
  camp: Object.freeze({
    url: "/map-camp-v07.svg?v=21",
    width: 3000,
    height: 2200,
    pixelSize: 2,
    originX: 0,
    originY: 0,
  }),
  tavern: Object.freeze({
    url: "/map-tavern.svg?v=21",
    width: 1200,
    height: 900,
    pixelSize: 2,
    originX: 0,
    originY: 0,
    bar: Object.freeze({ x: 600, y: 228 }),
    entrance: Object.freeze({ x: 600, y: 810 }),
  }),
  forest: Object.freeze({
    url: "/map-expedition-reclaimed.svg?v=21",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  marsh: Object.freeze({
    url: "/ruin-expedition-ruins.svg?v=21", width: 2400, height: 1440, pixelSize: 2,
    originX: -600, originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  jungle: Object.freeze({
    url: "/ruin-expedition-jungle.svg?v=21",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  village: Object.freeze({
    url: "/ruin-expedition-village.svg?v=21",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  volcano: Object.freeze({
    url: "/ruin-expedition-volcano.svg?v=21",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  ruins: Object.freeze({
    url: "/ruin-expedition-ruins.svg?v=21",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
});
export function mapAssetMarkup(key) {
  const map = MAP_ASSETS[key] || MAP_ASSETS.camp;
  return `<img class="prerendered-map" src="${map.url}" width="${map.width}" height="${map.height}" alt="" aria-hidden="true" draggable="false" style="width:100%;height:100%;image-rendering:pixelated;pointer-events:none" data-prerendered-map="${key}" />`;
}
export const PRERENDERED_BUILDINGS = Object.freeze([
  "tent",
  "cabins",
  "storage",
  "crossroads",
  "pantry",
  "kitchen",
  "tavern",
  "guildhall",
  "blacksmith",
  "training",
  "armory",
  "alchemist",
  "market",
  "clinic",
  "farm",
  "garden",
  "archaeology",
  "dock",
  "portal",
  "forge",
  "arcane",
  "night",
  "menagerie",
]);
// A padded image bleeds outside the old sprite envelope. Static shadows are
// painted first and the object surface second, so no shadow can cover its caster.
export function prerenderedBuildingSvg(key) {
  if (!PRERENDERED_BUILDINGS.includes(key)) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" preserveAspectRatio="none" aria-hidden="true" data-pixel-art="building" data-prerendered-building="${key}" style="image-rendering:pixelated;overflow:visible"><image href="${buildingAssetUrl(key)}" x="-16" y="-16" width="80" height="80" /></svg>`;
}

export const RUIN_BUILDINGS = Object.freeze(["tent","cabins","pantry","kitchen","crossroads","blacksmith","armory","alchemist","tavern","guildhall","market","clinic"]);
export const buildingAssetUrl = key => `/${RUIN_BUILDINGS.includes(key) ? "ruin" : "map"}-building-${key}.svg?v=21`;
