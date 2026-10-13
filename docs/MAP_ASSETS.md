# Pre-rendered environments

## Current 0.5 Camp and route maps

The 3000×2200 Camp and all five regional route maps use generated detailed terrain. Original generated images are encoded as WebP, with matching SVG envelopes for the Worker’s existing text asset transport. Exact prompts, dimensions, hashes and provenance are in [GENERATED_MAP_ART.md](GENERATED_MAP_ART.md). These images are not outputs of the deterministic 0.4 generator.

`camp-background.js` composites the terrain and current building tiles with their baked shadows into one cached ground canvas. Construction changes that canvas; dragging characters or props never does. Transparent service targets align with CAMP_ANCHORS. Camp world revision 2 migrates old placements once. Real-time ground light and diffusing character/prop shadows remain above the baked scenery and below sprites. Permanent trees are already in the terrain. The route maps keep all actual destination/road/quest controls as interactive overlays.

## Retained deterministic assets

The retained 0.4 artwork is original, deterministic Evernight pixel art. No downloaded packs or third-party image licenses are involved. `scripts/generate-map-assets.mjs` combines the existing canonical sprite system with authored roads, stonework, wood grain, foliage, furniture, ambient light and static shadows. Regenerate with `node scripts/generate-map-assets.mjs` under Node 24 after `npm ci`.

The legacy Camp asset is 1800×1400; the Tavern is 1200×900. Forest, jungle, village, volcano and ruins expedition maps are 2400×1440, surrounding a 1200×480 combat area whose image origin is (600,480). River encounters use the forest ground plus the seeded river/bridge overlay, extended through the overscan. Interactive buildings use separate transparent 240×240 tiles and are composited into the current Camp ground when construction changes.

PNG originals are checked in for editing and inspection. Matching SVG envelopes embed those exact bytes; `map-assets.js` supplies their URLs and geometry. The existing Worker embeds text assets, so the envelopes avoid a separate binary transport or runtime image-generation dependency. Never put text, recruitable heroes or movable props into the backgrounds. Static building/tree shadows paint before their owners. Camp dynamic lighting stays below building and actor layers; expansion fog is independent. In combat, seeded collision fixtures are cached into the background, while heroes, props, effects and their dynamic ground projections remain live.

Change the generator and regenerate assets together. Preserve a two-unit pixel grid, safe visual space for interactive anchors, wide overscan and character contrast. Inspect generated PNGs and actual desktop/phone browser captures. Native raster checks alone do not verify responsive layout or physical-device performance.
