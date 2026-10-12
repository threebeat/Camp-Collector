# Evernight pixel art

Evernight 0.1 uses original, code-authored pixel sprites. `web/pixel-art.js` draws
integer cells onto small grids, then serializes equal cells as crisp SVG
rectangles. It does not downsample or filter the previous smooth illustrations.
No external artwork, fonts or sprite-pack license is required by this module.
The repository's overall licensing policy still applies.

| Asset | Source grid | Public function |
| --- | --- | --- |
| Characters, races, classes, guises and mounts | 32 × 34 | `pixelPortraitSvg(hero, small, pose)` |
| Weapons, tools, armor, scrolls, accessories and lights | 32 × 32 | `pixelItemSvg(item)` |
| Companions and companion guises | 24 × 24 | `pixelPetSvg(pet, pose)` |
| Camp and Market services | 48 × 48 | `pixelBuildingSvg(key, level)` |
| Environmental props, prepared structures and sources of light | 32 × 40 | `pixelPropSvg(key, variant)` |
| Dinosaurs, dragons, wolves, Arena animals and chariots | 32 × 34 | `pixelCreatureSvg(kindOrHero)` |
| Interface symbols | 16 × 16 | `pixelIcon(name, size)` |
| Ground textures and paths | One pixel per four world units | `pixelTerrainSvg(kind, width, height, seed)` |

`pixelCosmeticSvg(key)` previews the same palette or guise used by characters,
weapons and companions. `pixelWeaponPresentation`, `pixelWingArt` and
`pixelModifiersArt` retain 100-unit wrapper compatibility with older art callers.
All functions are pure with respect to game state and work in Node or a browser
without document/canvas globals.

The palette uses ink `#0a0c1a`, indigo `#171e3b`, violet `#353454`, slate
`#596481`, forest `#354d4b`, amber `#d98c43`, honey `#f4c76a`, cream
`#f7df9b` and cyan `#92c9d0`. Cloth, skin and authored cosmetic colors add small
identity accents. Warm windows, lantern glass, forge/stove/fire, lava and cool
portal/crystal/mushroom sources have matching art. Shared simulation visibility
and renderer illumination determine what they reveal; a decorative sprite does
not itself alter combat or visibility.

Characters compose their racial anatomy, class clothing, worn Head/Chest/Legs/
Boots, actual held weapons/tools, offhand/charm, utility light, Attributes,
wings and optional mount. Dwarf beards, beast ears/muzzles, owl disks, mushroom
caps, smoke bodies and Celestial crowns remain recognizable through equipment.
The authored solar, storm and reactor Mythicals retain complete silhouettes.
Individual ordinary weapon silhouettes are drawn in the `weaponGrid` switch;
guild equipment reuses its canonical base with a signature trim. Rarity pixels,
transformation sigils and socket colors show object progression.

When adding content, keep its canonical ID in `data.js` and add its shape here.
Use actual cell masks, integer rectangles, rasterized polygons or Bresenham
lines; do not add blurred filters or smooth paths. Keep the main silhouette
readable at 24–48 displayed pixels. Preserve semantic markers such as
`data-weapon-art`, `data-worn-armor`, `data-modifier-art`, `data-wing-type` and
`data-character-skin`. Portrait frame arguments provide deterministic stepped
foot/wing/smoke changes; browser CSS should respect reduced motion.

Use `image-rendering: pixelated`, disable canvas image smoothing, and prefer
integer display scales. For native verification, rasterize every canonical
asset with the existing canvas dependency and inspect the generated contact
sheets. Node art checks establish valid, coherent sprites; browser/device
checks remain necessary for viewport layout, touch interaction and frame rate.

The 0.2 Camp uses `pixelCampGroundSvg(1800,1400,seed)`: merged/grouped four-unit cells, irregular forest clearing, connected service paths and a south lake. Cache its compacted image. `pixelBonfireEmbersSvg(timeSeconds)` supplies a pure small ember layer; the live scene currently draws equivalent sparks directly on the lighting canvas to avoid DOM replacement.

Version 0.3 uses the same art in a bounded retro game window. The cinematic glow is a code-authored grid of light blocks around the original bonfire; the Journal is an original book on a stand. No external bitmap pack or new art license is introduced.
