# Generated map art — Evernight 0.5

These original game backgrounds were made with the built-in `image_gen.imagegen` tool on 2026-10-12. They are generated raster artwork, not procedural map placeholders or downloaded third-party art. No API fallback, model substitution, external stock artwork, or Python image editing was used.

Original PNG outputs are retained unchanged outside the repository in `/workspace/scratch/7284e26e4498/generated-map-originals/`. The game-ready copies are WebP quality 88, encoded with the repository's existing `@napi-rs/canvas` 0.1.100 dependency. Encoding only changes format/compression: the entire image is drawn at its original dimensions without crop, resize, recolor, content edits, or compositing. Each matching SVG envelope embeds the exact corresponding WebP bytes using `data:image/webp;base64` for the existing Worker asset pipeline.

## Asset inventory

| Asset base in `web/` | Dimensions | WebP bytes | SVG bytes |
| --- | --- | ---: | ---: |
| `map-camp-v05` | 1468 × 1071 | 688,440 | 918,083 |
| `map-route-greenway-v05` | 1043 × 1508 | 695,576 | 927,599 |
| `map-route-marsh-v05` | 1042 × 1509 | 707,770 | 943,859 |
| `map-route-volcano-v05` | 1042 × 1509 | 718,382 | 958,007 |
| `map-route-cinder-v05` | 1042 × 1509 | 745,830 | 994,603 |
| `map-route-jungle-v05` | 1043 × 1508 | 785,082 | 1,046,939 |

Every base above has a `.webp` game file and a `.svg` envelope. Total WebP payload is 4,341,080 bytes; all six SVG envelopes together gzip to 4,359,285 bytes.

The world interaction geometry remains game data. Camp buildings and their static shadows are composited by the game into a cached background, while this generated terrain provides permanent trees, roots, rocks, water, coherent footpaths, and soft landscape shadows. Route lines, destination markers, fog, NPCs, characters and movable props remain interactive overlays rather than painted UI.

The Camp scene is mapped to a 3000 × 2200 world. Final scene anchors are main bonfire (1700,1100), character tent (1530,970), Crossroads (1600,790), Pantry (1850,1250), Tavern (580,850), Guild (580,540), Trading Post (880,690), and Arena (300,280). Generated clearing positions are approximate; these anchors align the usable artwork rather than expecting a raster generator to enforce exact game geometry. Camp has no painted buildings or characters. The five region maps use the game's 900 × 1300 route-layout area and include environmental landmarks beneath actual graph nodes.

## Validation

All six generated originals and all six encoded WebP copies were visually inspected. The encoded versions retain the fine pixel detail and consistent region palette, have no captions, labels, route badges or UI baked into them, and are each under 800 KB. The five regions are visually distinct: Greenway woodland and ruined castle, drowned marsh, basalt/lava mountain, Cinder countryside and thorn estate, and ancient tropical jungle. Camp includes linked clearings, a southern lake, distant village space, and a northwest arena clearing.

A byte comparison confirmed that every SVG envelope contains exactly the corresponding WebP file. All six files decoded with `@napi-rs/canvas`. SHA-256 checksums of the WebP copies:

- `map-camp-v05.webp`: `4f423ca96798116f50d43a4f7de40cc3e0ff31041b20877afdc0b5cabbcbc00a`
- `map-route-greenway-v05.webp`: `1d43b930ee3cda120c30dbaf0232485ce45d14dc41e41019990765f3e80bfd0c`
- `map-route-marsh-v05.webp`: `39924268e9ecca97fa4d144c8243735e6421325fac42d33fd1c6d05462fa3edf`
- `map-route-volcano-v05.webp`: `f96954ab7a2a0e00d087c20522711afddac46da9c93376f9930b7dd0ef817128`
- `map-route-cinder-v05.webp`: `e39e9e7fb39f3d6e9261e4c00df1dc0cfb697c75a50940ef4cd3d569d498b21b`
- `map-route-jungle-v05.webp`: `41e112ebb7d2556974aac087c451bd01c0ef302bf5e9923d4b1e2b4d4777b24c`

## Re-encoding an original

The following is the format-only procedure used for each asset. Replace the two paths with the selected original and matching game base. The generated source PNG is not edited.

```js
import fs from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const image = await loadImage("/absolute/path/to/original.png");
const canvas = createCanvas(image.width, image.height);
canvas.getContext("2d").drawImage(image, 0, 0);
const bytes = await canvas.encode("webp", 88);
const base = "web/map-camp-v05";
fs.writeFileSync(base + ".webp", bytes);
fs.writeFileSync(
  base + ".svg",
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + image.width +
  '" height="' + image.height + '" viewBox="0 0 ' + image.width + ' ' +
  image.height + '"><image width="' + image.width + '" height="' +
  image.height + '" href="data:image/webp;base64,' +
  bytes.toString("base64") + '"/></svg>',
);
```

## Exact generation prompts

The built-in tool was called once per requested asset with `transparent_background: false`. These are fresh image generations, without input-image references. No generation was silently substituted with procedural art.

### Camp

- Original tool output: `/workspace/scratch/7284e26e4498/generated_images/exec-b840cfb3-ae37-45f4-9f00-54efc2762eb0.png`
- Unchanged source copy: `/workspace/scratch/7284e26e4498/generated-map-originals/map-camp-v05.png`
- Final game asset: `web/map-camp-v05.webp`
- Serving envelope: `web/map-camp-v05.svg`

```text
Use case: stylized-concept.
Asset type: finished, production-ready raster background for the 2D pixel-art RPG Evernight. Create a single exceptionally detailed orthographic, directly top-down forest camp terrain image, landscape approximately 4:3, ideally 1536 by 1120 pixels. This image maps to a 3000 by 2200 game world. Camera is straight down, with no perspective horizon, no isometric tilt.
Style: richly crafted classic 16-bit RPG environment art, fine intentional pixel clusters, beautiful tactile woodland detail, moss, roots, stones, fern clusters, silver-blue grass, dusky pine and deciduous canopy, worn earthen trails. Painterly richness inside a cohesive crisp pixel-art aesthetic, appropriate beneath existing small pixel characters. Original fantasy woodland under eternal twilight, deep blue-green and muted moss palette, subtle cool moonlight, warmly colored bare earth in inhabited clearings. Not a photograph, not a 3D render.
Composition is functionally exact: the main open camp is centered at 53% across and 48% down. At its center is ONLY a large bare circular earthen clearing, with no campfire object. Leave connected empty, unobstructed natural building pads centered at (48%,42%) for a tent, (53%,36%) for crossroads, and (58%,55%) for a pantry. Leave generous future-building clearings to the east and south-east. A separate distant village clearing lies in the western forest; leave three empty clear pads at (19%,39%), (19%,25%), and (29%,31%). These are empty terrain pads, no buildings! An ancient circular arena-sized open earthen clearing lies at the far top-left (10%,13%), enclosed by dark old trees and weathered standing stones but with its center empty. A natural lake with reeds, rocks, and moonlit ripples lies toward the bottom at (57%,81%), with enough visible shoreline. A few tiny streams connect naturally, bridges only where necessary.
Trails are coherent and grounded: one modest branching dirt trail connects the central clearing northward to the crossroads pad, northwest through the forest to the three village pads, continuing toward the ancient top-left clearing. Short branches connect the tent, pantry, and future-building clearings. No random grid, arbitrary disconnected paths, straight map diagram lines, or overgrown paths crossing the lake. Dense, varied forest fills margins and divides the far village from the camp while paths keep them accessible. Organic clearings with rough irregular edges, never perfect blank rectangular lots.
Bake the STATIC landscape shadows into the painting: tree and boulder shadows have soft diffused ends and agree with cool moonlight coming from upper left. Preserve visible texture in the dark areas. The central clearing remains readable and calm for realtime firelight and characters. All trees, rooted vegetation, earth, water and immovable rocks belong to this background. Do not include buildings, tents, people, creatures, NPCs, campfires, lantern props, boxes, interactive props, signs, text, interface, icons, markers, route nodes, labels, borders, frames, or a vignette. Edge-to-edge terrain, no surrounding paper. The finished image should feel like a lovingly handcrafted premium RPG world, much more detailed than a procedural tiled placeholder.
```

### Greenway

- Original tool output: `/workspace/scratch/7284e26e4498/generated_images/exec-f0e787a8-0295-4b64-90ba-e8b6217267ff.png`
- Unchanged source copy: `/workspace/scratch/7284e26e4498/generated-map-originals/map-route-greenway-v05.png`
- Final game asset: `web/map-route-greenway-v05.webp`
- Serving envelope: `web/map-route-greenway-v05.svg`

```text
Use case: stylized-concept.
Asset type: finished detailed vertical region-map background for the 2D pixel-art RPG Evernight. A single edge-to-edge portrait image, approximately 900:1300 proportions, preferably 896 by 1296 pixels. This is terrain art beneath interactive route lines and destination markers added by code, never a UI mockup.
Style: premium original classic 16-bit RPG world-map illustration, exceptionally detailed intentional pixel clusters, a coherent atmospheric aerial view with very slightly visible front faces on architecture. Rich and tactile yet crisply pixel styled. Eternal twilight forest, muted blue-green canopy, silvery moss, midnight-blue streams, subdued stone, small warm amber accents at distant windows. No horizon, no sky, no paper texture or decorative frame.
Region: GREENWAY. A large ancient forest runs from friendly grassy clearings at the bottom to a ruined thorn-entangled castle on a rocky hill at the top. Arrange landmarks to match these exact normalized image positions: camp clearing (50% across,91% down), larger first clearing (47%,77%); a small old stone footbridge across a narrow meandering river (24%,63%); a glade with a ring of unusual mushrooms (70%,64%); moss-grown rootbound ruins (17%,42%); subtly luminous firefly hollow (79%,45%); massive ancient tree sanctuary (44%,29%); magnificent but small-scaled ruined castle atop the hill (58%,8%). Additional small landscape interest includes a derelict mill at (47%,57%), leaf shrine at (56%,43%), moonlit waterfall at (88%,27%), ruined watchtower at (19%,23%), castle gatehouse at (69%,23%). These landmarks are painted environment features, never icon badges or isolated drawings.
Terrain has natural flowing composition: tree-filled valleys, quiet varied clearings, root tangles, layered ridges, stone escarpments, fern banks, a organically meandering river with connected streams. Dense old forest along the margins. Plenty of small detail and varied foliage, but visually balanced empty space around landmark centers to make overlaid game markers readable. Forest and landmarks must feel planted in one continuous world, not floating stickers.
Lighting: soft cool moonlight from upper left, detailed shadows that diffuse naturally away from trees and ruins, visible surface texture even at night, controlled contrast. The finished result should feel like a lovingly handcrafted premium RPG map, markedly richer than a procedural placeholder.
Constraints: NO labels, NO text of any kind, NO symbols or markers, NO node circles, NO badges, NO arrows, NO route-network linework, NO dotted roads or highlighted roads, NO compass rose, NO legend, NO border, NO map UI, NO characters or creatures, NO loose movable props. Do not draw connection lines: the application will add all route paths. All pixels are part of the terrain art.
```

### Marsh

- Original tool output: `/workspace/scratch/7284e26e4498/generated_images/exec-12c063bf-3c21-4379-a2ad-eb43bf500382.png`
- Unchanged source copy: `/workspace/scratch/7284e26e4498/generated-map-originals/map-route-marsh-v05.png`
- Final game asset: `web/map-route-marsh-v05.webp`
- Serving envelope: `web/map-route-marsh-v05.svg`

```text
Use case: stylized-concept.
Asset type: finished detailed vertical region-map background for the 2D pixel-art RPG Evernight. A single edge-to-edge portrait image, approximately 900:1300 proportions, preferably 896 by 1296 pixels. This is terrain art beneath interactive route lines and destination markers added by code, never a UI mockup.
Style: premium original classic 16-bit RPG world-map illustration, exceptionally detailed intentional pixel clusters, a coherent atmospheric high aerial view with slightly visible front faces on architecture. Rich tactile fine detail, yet crisply pixel styled. Eternal twilight, detailed soft static shadows cast from the upper left, calm readable dark ground between landmarks. No horizon, sky, paper texture, border, or decorative frame. Everything is part of one continuous landscape, not a collection of floating landmark stickers. Plenty of surface and foliage variety with visual balance for overlay markers. 
Region: THE DROWNED MARSH. A haunted wetland stretches vertically from quiet grassy marsh edges at the bottom to an ancient half-flooded stone ferry harbor and abandoned ferryman's sanctuary near the top. Rich blue-green and smoky teal palette with silvery reflected moonlight, occasional very small amber lights at old windows. Make the marsh geography richly varied: winding channels, shallow glassy pools, muddy reed banks, small mossy islets, twisted willow canopies, cypress roots, stone causeways, broken boardwalk remnants and patches of lilies, subtle drifts of mist near water rather than a white haze over the entire image.
Paint these as environmental landmarks distributed naturally through the map: lower arrival clearing and small silent stone quay near lower-left; forgotten stone quarry in the lower-middle right bank; gravestones in reed-filled pools in the lower-middle left; a beautiful drowned Gothic cloister with ruined arches standing in shallow water around the middle; a leaning moss-grown bell tower higher up on the right; a deeper sinkhole with the shape of a giant submerged bronze bell near the upper-left; the last ferry harbor near top-center. Add secondary old sluices, half-sunken crypt masonry, ancient weirs, a tiny roofless chapel and a tree-covered island so exploration feels rewarding.
Keep their scale appropriate to a whole-region map, not a close-up of one building. Both left and right sides have a mixture of open traversal land and water, never an impassable band of water splitting the map. The lower part feels approachable, the upper part more ancient and dangerous. Water and still reflections look hand-pixelled, not photographic. 
Constraints: NO labels, NO text of any kind, NO symbols or markers, NO node circles, NO badges, NO arrows, NO route-network linework, NO dotted roads or highlighted roads, NO compass rose, NO legend, NO border, NO map UI, NO characters or creatures, NO loose movable props. Do not draw connection lines: the application will add all route paths. All pixels are part of the terrain art. The finished result must feel like a lovingly handcrafted premium RPG region, markedly richer than a procedural placeholder.
```

### Volcano

- Original tool output: `/workspace/scratch/7284e26e4498/generated_images/exec-39f7da18-2509-4c36-ad90-99fe9ec8c619.png`
- Unchanged source copy: `/workspace/scratch/7284e26e4498/generated-map-originals/map-route-volcano-v05.png`
- Final game asset: `web/map-route-volcano-v05.webp`
- Serving envelope: `web/map-route-volcano-v05.svg`

```text
Use case: stylized-concept.
Asset type: finished detailed vertical region-map background for the 2D pixel-art RPG Evernight. A single edge-to-edge portrait image, approximately 900:1300 proportions, preferably 896 by 1296 pixels. This is terrain art beneath interactive route lines and destination markers added by code, never a UI mockup.
Style: premium original classic 16-bit RPG world-map illustration, exceptionally detailed intentional pixel clusters, a coherent atmospheric high aerial view with slightly visible front faces on architecture. Rich tactile fine detail, yet crisply pixel styled. Eternal twilight, detailed soft static shadows cast from the upper left, calm readable dark ground between landmarks. No horizon, sky, paper texture, border, or decorative frame. Everything is part of one continuous landscape, not a collection of floating landmark stickers. Plenty of surface and foliage variety with visual balance for overlay markers. 
Region: THE OBSIDIAN MOUNTAIN. An imposing volcanic region stretches vertically from dark basalt foothills near the bottom, upward through rugged escarpments, blackglass ridges, mineral terraces and ancient fire-cut stone ruins, to an immense dragon caldera near top-center. A cohesive charred charcoal, cool indigo, russet and dark umber palette, with vivid but carefully restrained orange lava inside the caldera and a few branching fissures. Eternal twilight, no daylight or visible sky. Soft cool highlights on high ridges contrast with warm low glows beside lava.
At the bottom leave a calm foothill arrival valley. Moving upward, paint an abandoned obsidian quarry in the lower-left, a small crumbling watchtower lower-right, richly colored mineral pools and travertine terraces around the middle-left, an ancient dark obsidian altar surrounded by fractured rock middle-right, and a long broad weathered stone staircase ascending into the upper caldera. Secondary texture includes columnar basalt, brittle cooled lava fields, pale mineral deposits, abandoned mine entrances, a broken stone forge, a tiny shrine and stone bridge across a narrow lava fissure. Aerial top-down geographical composition, layered cliffs and ravines visible, no side-view mountainous skyline.
Keep lava confined to geographic fissures and basin edges, so much of the surface remains traversable and readable beneath future game route markers. Architectural details are small-scaled within a large continuous region. Upper caldera is spectacular and dangerous, but avoid a giant central flame, dragon illustration, skull emblem or isolated boss icon. All light and smoke effects are delicately baked terrain atmosphere. 
Constraints: NO labels, NO text of any kind, NO symbols or markers, NO node circles, NO badges, NO arrows, NO route-network linework, NO dotted roads or highlighted roads, NO compass rose, NO legend, NO border, NO map UI, NO characters or creatures, NO loose movable props. Do not draw connection lines: the application will add all route paths. All pixels are part of the terrain art. The finished result must feel like a lovingly handcrafted premium RPG region, markedly richer than a procedural placeholder.
```

### Cinder

- Original tool output: `/workspace/scratch/7284e26e4498/generated_images/exec-be0abd74-4b7b-40e6-b1c5-d9dbe0f2507e.png`
- Unchanged source copy: `/workspace/scratch/7284e26e4498/generated-map-originals/map-route-cinder-v05.png`
- Final game asset: `web/map-route-cinder-v05.webp`
- Serving envelope: `web/map-route-cinder-v05.svg`

```text
Use case: stylized-concept.
Asset type: finished detailed vertical region-map background for the 2D pixel-art RPG Evernight. A single edge-to-edge portrait image, approximately 900:1300 proportions, preferably 896 by 1296 pixels. This is terrain art beneath interactive route lines and destination markers added by code, never a UI mockup.
Style: premium original classic 16-bit RPG world-map illustration, exceptionally detailed intentional pixel clusters, a coherent atmospheric high aerial view with slightly visible front faces on architecture. Rich tactile fine detail, yet crisply pixel styled. Eternal twilight, detailed soft static shadows cast from the upper left, calm readable dark ground between landmarks. No horizon, sky, paper texture, border, or decorative frame. Everything is part of one continuous landscape, not a collection of floating landmark stickers. Plenty of surface and foliage variety with visual balance for overlay markers. 
Region: CINDER COUNTRY, an enchanted medieval countryside under endless blue twilight. This is rural farmland and old estates, not another volcano map. A broad gently rolling landscape stretches from orchard arrival fields at the bottom through red-roof hamlets, hedgerows, meadows and lonely manor grounds, toward a dark ruined royal estate encircled by giant thorn hedges near the top.
Palette: dusty blue and deep navy shadows, muted golden-brown harvest fields, silver-green orchards, weathered cream stone, warm russet roofs, tiny inviting amber windows. There is never a daytime sun or bright blue sky. Small details are handcrafted pixel clusters, no blur or photographic foliage.
Place a cultivated orchard around lower-center, clustered modest red-roof cottages in the lower-middle left, stables and fenced moonlit paddocks in lower-middle right, a windmill and hayfields at the lower edge, abandoned caravan shelter and hedgerow intersections near the middle, a glass-roofed ruined crypt amidst a small cemetery near upper-middle left, overgrown rose garden and pale stone manor to the upper-middle right, and the massive thorn-entangled old crown estate toward top-center. Add vineyards, stone walls, irrigation brooks, rustic arched bridges, worn field boundaries and layered copses. All objects feel embedded in a large continuous geographical world rather than iconic stickers.
Keep broad gentle ground and open fields between landmarks for future overlay markers. Natural country lanes may appear only as faint incidental terrain traces, never an overlaid route network. Focal buildings are small enough to maintain whole-region scale, with soft grounded baked shadows. 
Constraints: NO labels, NO text of any kind, NO symbols or markers, NO node circles, NO badges, NO arrows, NO route-network linework, NO dotted roads or highlighted roads, NO compass rose, NO legend, NO border, NO map UI, NO characters or creatures, NO loose movable props. Do not draw connection lines: the application will add all route paths. All pixels are part of the terrain art. The finished result must feel like a lovingly handcrafted premium RPG region, markedly richer than a procedural placeholder.
```

### Jungle

- Original tool output: `/workspace/scratch/7284e26e4498/generated_images/exec-e13e8abc-8606-4420-b879-f4919a616f85.png`
- Unchanged source copy: `/workspace/scratch/7284e26e4498/generated-map-originals/map-route-jungle-v05.png`
- Final game asset: `web/map-route-jungle-v05.webp`
- Serving envelope: `web/map-route-jungle-v05.svg`

```text
Use case: stylized-concept.
Asset type: finished detailed vertical region-map background for the 2D pixel-art RPG Evernight. A single edge-to-edge portrait image, approximately 900:1300 proportions, preferably 896 by 1296 pixels. This is terrain art beneath interactive route lines and destination markers added by code, never a UI mockup.
Style: premium original classic 16-bit RPG world-map illustration, exceptionally detailed intentional pixel clusters, a coherent atmospheric high aerial view with slightly visible front faces on architecture. Rich tactile fine detail, yet crisply pixel styled. Eternal twilight, detailed soft static shadows cast from the upper left, calm readable dark ground between landmarks. No horizon, sky, paper texture, border, or decorative frame. Everything is part of one continuous landscape, not a collection of floating landmark stickers. Plenty of surface and foliage variety with visual balance for overlay markers. 
Region: THE ANCIENT JUNGLE. A prehistoric rainforest realm stretches from an approachable fern-covered arrival valley near the bottom, through giant canopies, jade lagoons, waterfall cliffs and forgotten sun-temple ruins, toward a vast ancient tyrant's nesting basin near the top. No actual creature appears.
Palette: deep emerald and blue-green leaves with soft cool midnight shadows, moss-covered warm sandstone, jade and midnight-blue water, delicate muted gold details on abandoned temple stone. Dense tropical plant diversity: broad-leaf canopy, tree ferns, cycads, palms, bamboo, buttress roots and great trailing lianas. Handcrafted pixel clusters and crisp rich detail, no photographic rendering.
Near lower-left place a ruined sun temple with broken stepped terraces overtaken by vines. A beautiful small spring and natural canopy opening lies lower-middle right. A broad fossil-rich valley and ancient abandoned nesting hollow lies around the middle. A vine-covered sacrificial altar and stepped stone pyramidal temple sits upper-middle left, while a rocky thunderplain and taller stone obelisks emerge from the rainforest upper-middle right. Near top-center a large primordial rock bowl with weathered giant footprints and scattered enormous old bones suggests the ancient tyrant without depicting one. Add connected jade streams, quiet lagoons, short waterfalls, cliffside ledges, root-covered carved faces on ancient ruins, collapsed stairs and patches of luminous flowering moss.
Keep this a coherent high-aerial whole-region map, not a side-view painting. Jungle margins are dense but include many varying clearings and natural corridors to support future route-marker overlays. Temple structures are stately environmental ruins, never detached isolated icons. Static shadows should feel soft and grounded. 
Constraints: NO labels, NO text of any kind, NO symbols or markers, NO node circles, NO badges, NO arrows, NO route-network linework, NO dotted roads or highlighted roads, NO compass rose, NO legend, NO border, NO map UI, NO characters or creatures, NO loose movable props. Do not draw connection lines: the application will add all route paths. All pixels are part of the terrain art. The finished result must feel like a lovingly handcrafted premium RPG region, markedly richer than a procedural placeholder.
```
