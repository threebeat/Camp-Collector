# The world after the light: art production

Evernight 0.7 follows the owner's five supplied concept sheets: camp, battle UI, gothic title, fourteen races and twelve classes. The fantasy world contains the remains of an advanced civilization. Bronze machinery, cables, conduits, concrete and broken relays sit among forest, stonework, cloaks, plate and magic. Warm shelter contrasts with blue-violet eternal night.

## Provenance and reproducibility

The source images in `assets/ruin-source/` were generated with OpenAI ImageGen for this project, using the owner's sheets and the existing registered Camp terrain as visual references. No third-party sprite pack or external font is bundled. The editable source atlases are compressed WebP at full resolution. Run `node scripts/prepare-ruin-assets.mjs` to reproduce all shipped cutouts and SVG envelopes. The script slices and packs existing pixels; it does not call an image service.

| Source | Art brief | Shipped result |
| --- | --- | --- |
| camp.webp | Preserve the existing top-down terrain, paths, lake, island and waterfalls exactly; integrate forest-swallowed machinery, conduits and ruined ancient infrastructure under eternal night. No fixed service buildings. | map-camp-v07.svg |
| battlefield.webp | Elevated pixel-art forest arena, open slate causeway, broken arches and relays, bronze technology and cyan/amber lights around the perimeter; no units or interface. | map-expedition-reclaimed.svg |
| regions.webp | Four equal 5:3 environment panels in a 2×2 atlas: drowned aqueducts/marsh; derelict geothermal forges; ruined village plaza; jungle observatory. Open central combat ground with scenery concentrated at the edges. | ruin-expedition-{ruins,volcano,village,jungle}.svg |
| races.webp | Transparent 7×2 full-body survivor lineup in concept-sheet order. Practical salvage clothing, distinct racial anatomy, no labels/background or handheld equipment. | Fourteen race bodies in survivor-sprites.js |
| classes.webp | Transparent 6×2 full-body Human class lineup in concept-sheet order, detailed readable pixel clusters, salvaged fantasy clothing and characteristic equipment. A second generation removed the background while preserving the bodies. | Twelve class bodies in survivor-sprites.js |
| buildings.webp | Transparent 4×3 atlas of modular Camp services, matching the terrain perspective: reclaimed wood/cloth, bronze mechanisms, warm windows, readable service silhouettes. | Twelve ruin-building SVGs |
| wordmark.webp | Transparent gothic EVERNIGHT lettering, muted violet with pale highlights and dark edging, following the title concept. | evernight-wordmark.svg |

The regional prompt specifies no characters, text, UI, horizon or bonfires; the middle 65% width and 45% height remain a readable battle clearing. Detailed environmental art is decorative. Simulation obstacles, river bridges, sight, fog and damage terrain still come from the actual encounter.

## Shared rendering

Bodies are packed into 96×128 transparent PNGs and composed in a 64×80 SVG. Actual equipment, lamps, modifier trim, wings, cosmetics and mounts use the existing canonical vector layers. Human class bodies provide the illustrated class outfits; other races retain their anatomy with class livery and actual gear. Naga, Ent and Voidborn avoid human lower-leg overlays. Special creatures and legacy races retain the earlier code-authored art.

All body image bytes are embedded in the portrait SVG. External subresources cannot load when an SVG is itself decoded as a canvas image. The browser suite checks decoded opaque pixels for all 26 body variants in Chromium and WebKit. The native canvas SVG backend does not decode these embedded raster images and must not be used as proof that bodies are missing or present in browser combat.

Combat caches each decoded survivor appearance into a 192×240 bitmap, so WebKit does not rerasterize the layered SVG on every frame. Preserve this cache when changing equipment or pose rendering. Camp animation pauses behind open dialogs; changing reduced motion still repaints the frozen scene immediately.

The camera crops its visible rectangle before scaling the battle canvas. The editable `ruin-frame.svg` is rasterized into a 96×96 PNG CSS variable by the preparation script, retaining the same nine-slice frame with a cheap static image. The combat canvas and outer frame have independent compositing layers.

Keep the interior of `data-survivor-art` SVGs static. The old `.portrait-body`/spark rules animate internal vector groups; the new layered bitmaps use a separate `.survivor-body` class and animate the outer Camp sprite instead.

Environment SVG envelopes contain embedded WebP; modular building envelopes contain PNG with alpha. The Worker serves these as text assets, so no image CDN or network dependency is needed. Source atlases and companion WebP files are not separately embedded into the Worker.

## Invariants

- Camp stays 3000×2200, with registered paths, lake/water masks, service positions and local construction invalidation.
- Battle environments stay 2400×1440 around the 1200×480 encounter. Real obstacles, river/bridges and fog draw over the backdrop.
- Keep the public `art.js` facade for all character surfaces. Do not render the older generic portrait directly for a current survivor.
- Current pools live in `fallen-world.js`; old IDs stay valid in saves and challenge snapshots.
- Reduced motion freezes decorative embers, water and fire as before. UI framing never intercepts world hit targets.
