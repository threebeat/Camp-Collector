// Checked-in, deterministic raster maps. Regenerate with scripts/generate-map-assets.mjs.
// SVG envelopes embed PNG bytes so the existing text-asset Worker can serve them.
export const MAP_ASSETS = Object.freeze({
  camp: Object.freeze({
    url: "/map-camp.svg?v=18",
    width: 1800,
    height: 1400,
    pixelSize: 2,
    originX: 0,
    originY: 0,
  }),
  tavern: Object.freeze({
    url: "/map-tavern.svg?v=18",
    width: 1200,
    height: 900,
    pixelSize: 2,
    originX: 0,
    originY: 0,
    bar: Object.freeze({ x: 600, y: 228 }),
    entrance: Object.freeze({ x: 600, y: 810 }),
  }),
  forest: Object.freeze({
    url: "/map-expedition-forest.svg?v=18",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  jungle: Object.freeze({
    url: "/map-expedition-jungle.svg?v=18",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  village: Object.freeze({
    url: "/map-expedition-village.svg?v=18",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  volcano: Object.freeze({
    url: "/map-expedition-volcano.svg?v=18",
    width: 2400,
    height: 1440,
    pixelSize: 2,
    originX: -600,
    originY: -480,
    battlefield: Object.freeze({ x: 600, y: 480, width: 1200, height: 480 }),
  }),
  ruins: Object.freeze({
    url: "/map-expedition-ruins.svg?v=18",
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" preserveAspectRatio="none" aria-hidden="true" data-pixel-art="building" data-prerendered-building="${key}" style="image-rendering:pixelated;overflow:visible"><image href="/map-building-${key}.svg?v=18" x="-16" y="-16" width="80" height="80" /></svg>`;
}
