# Architecture

This describes the implementation at version 0.6.0. It is a map of the present code, not a commitment to keep its boundaries or technology forever.

## Runtime boundaries

The browser loads an HTML shell, CSS, and native ES modules. The interface sends commands to a dedicated Web Worker, which owns the mutable Camp state and advances every active party. Battles run in deterministic fixed steps. SVG portraits and weapon silhouettes are also rasterized for the canvas battle renderer.

The hosted backend is an ESM Worker. It serves embedded web assets and the authenticated player challenge API. Its `DB` binding is a SQLite-compatible D1 database. Campaign journeys, NPC challenges, the Camp economy, training and ordinary purchases currently execute on the client.

| Layer | Main files | Responsibility |
| --- | --- | --- |
| Definitions | `web/data.js` | Character generation, stats, items, progression tables, spells, saved-state defaults and shared helpers |
| Weapons and modifiers | `web/weapons.js`, `web/modifiers.js` | Base identities, unique shapes, compatibility, prefixes, affixes and enchantments |
| World content | `web/world.js`, `web/journeys.js` | Buildings, contextual explanations, calendar themes, regional road graphs, quests and route calculations |
| Camp commands | `web/camp.js` | Construction, capacity, timed training, recovery, Blacksmith, Archaeology, sockets, supplies and release |
| Progression commands | `web/progression.js` | Staging, purchases, character/equipment management, expedition rewards, recruitment, challenges and save validation |
| Combat model | `web/engine.js` | Movement, targeting, collision, abilities, projectiles, terrain, effects, recruitment and serialization |
| Time and commands | `web/simulation.js` | State within one browser session, fixed steps, concurrent parties, catch-up, observation and action dispatch |
| Worker transport | `web/expedition-worker.js`, `web/client.js` | Messages, responses, fallback simulation and local save checkpoints |
| Night-world commands/screens | `web/nightfall.js`, `web/nightfall-ui.js` | Professions, visitors, armor crafting/comparison, save additions, profile/district sheets and island configuration |
| Evernight model/screens | `web/evernight.js`, `web/evernight-ui.js`, `web/evernight.css` | Meals, Camp XP, world tiers, portals, guilds, Arena wagers, monthly collections and dark UI |
| Visibility | `web/lighting.js` | Shared night vision, light sources, terrain occlusion and fog sampling |
| Interface | `web/app.js`, `web/index.html`, `web/styles.css`, `web/nightfall.css` | Navigation, Camp/Market scenes, route selection, services, character inspector and battle controls |
| Presentation | `web/art.js`, `web/landmarks.js`, `web/renderer.js`, `web/chatter.js`, `web/map-interaction.js` | SVG art, geography, canvas scenes, occasional dialogue and pointer-based drag/drop |
| Explanations and backups | `web/codex.js`, `web/saves.js` | Searchable mechanical/lore content, backup export and validated import |
| Hosted API | `worker/api.js`, `worker/index.js` | Challenge identity, snapshots, offers, atomic results, payouts, assets and health |
| Tooling | `scripts/`, `tests/`, `drizzle/` | Local adapter, build, artifact validation, tests and immutable schema migrations |

## Saved model

`initialGame()` supplies a versioned root record. Its main collections are `roster`, `inventory`, `companions`, `scrolls`, `gemstones` and `expeditions`. It also records Camp buildings/resources, exploration, boss clears, quests, challenge reward receipts and cosmetic ownership. Characters have their own IDs, generated names, race/class, appearance, levels/XP, equipment, armor, companion, Attributes, Talents, class nodes and inert legacy social fields. Object IDs distinguish two instances of the same base weapon.

An expedition stores its party IDs, frozen itinerary, seed, current encounter, phase, AUTO flag, elapsed/pending seconds, rewards, temporary recruits and serialized battle. Equipment is not changed by the player during a journey. The checkpoint synchronizes battle-earned XP, levels and health back into the owning characters.

`validateSave()` guards the current shape and invariants; `migrateSave()` normalizes supported current-season records. `web/saves.js` validates imported files and reconstructs their battle checkpoints before accepting them. Current records carry both `version: 12` and `season: 'camp-fresh-2026-10-11'`. Older seasons cannot be restored through the backup importer.

Browser `localStorage` is the only personal Camp persistence today. It is scoped to a browser profile and origin, not the hosted account. `.local/camp.sqlite` is the development challenge database, not the personal Camp save. No actual player saves are included in source control; historical test fixtures are synthetic regression data.

## Time, AUTO and background behavior

`ExpeditionSimulation` uses `STEP = 1/30`. All active expeditions receive real elapsed time; a round-robin drain gives each party fixed combat steps. A time budget prevents a long offline catch-up from monopolizing the interface. Remaining elapsed time is retained in `pendingSeconds` and processed incrementally.

Only the actively observed party may run at 2× or 3× or pause. Unobserved parties always advance at 1×. Changing screens, losing visibility/focus, selecting a faster speed or reopening saved active expeditions enables AUTO. Long timer gaps are interpreted as suspended browser time and use 1× even if a fast battle was previously open. All interludes collect automatically and last five real seconds when observed, independently of combat speed; paused observation remains paused. New encounters have a 3–2–1–Fight preparation countdown.

A Web Worker helps while the browser continues scheduling it; it does not defeat mobile operating-system suspension. A closed tab has no server process advancing that party. Returning to the page simulates the missing time from its checkpoint. This distinction matters when designing notifications, server saves or competitive economy.

## Combat and visual state

`Battle` uses a seeded random stream, unit state, a battlefield map and transient entities such as projectiles, zones and prepared structures. Heroes, pets, summons, turrets and Arena hazards share enough of the unit model to collide, target and receive damage. Party positions are automatic; the player can prepare permitted traps/walls before combat, and AUTO prepares them itself.

The engine handles ground obstacles, movement and crowding, knockback, line of sight, elemental effects, finite encounter mana, stamina, invisibility for targeting, flight, shields, charm and anti-stalemate behavior. A serializer preserves cooldowns, mana, targets, terrain profile, projectiles, persistent ground marks and the random stream. Changes to this format require meaningful checkpoint/reload tests.

Road itinerary metadata selects river encounters near water and an open or obstructed terrain profile. Decorative map landmarks suggest these mechanics, but they are not the collision data itself. The renderer draws a long 1200×480 battlefield with clear selection, effects, blood/scorch marks and result feedback. SVG portrait code is reused by cards and battlefield units; changes must be checked in both contexts.

## Shared challenges

`/api/challenges` requires hosted identity in `oai-authenticated-user-id` and the current `x-camp-season`. POSTs also validate origin, body size, JSON, pledges and teams. `cleanTeam()` reconstructs bounded, legal combat snapshots from canonical content rather than trusting arbitrary numeric fields. It enforces class paths, armor/weapon restrictions, ability caps and authored Mythical identities. Compatible cosmetic IDs are retained for presentation.

Offers contain three characters, pledged gold and optional equipment. Posting/canceling/attacking/claiming uses receipts. Attacks simulate a seeded battle on the server and use database batches with state predicates to prevent two attackers resolving the same offer. Payout receipts are also tracked locally to avoid ordinary duplicate claims. See `tests/challenges.test.js` for auth, race, transaction and replay coverage.

These guards make the board functional, but do not prove the caller actually earned its gold, characters or cosmetics: the personal account model is client-owned. Strong competitive integrity requires a server-owned inventory/economy with authenticated transactions and durable reward receipts. That is future work, not an implemented guarantee.

## Build and deployment

`scripts/build.mjs` embeds all supported `web/` assets into `dist/server/index.js` and bundles the real backend ES module dependency graph using pinned esbuild into one Worker module. It also copies `.openai/hosting.json`. `scripts/validate-artifact.mjs` imports that exact Worker and checks assets, module routes, health, auth and bindings. Imports are resolved by the bundler rather than stripped by regular expressions. Browser modules retain native ESM and coherent `?v=21` cache URLs. Generated output is excluded from source control.

The hosting manifest binds the existing Sites project with `d1: 'DB'` and no R2 bucket. Sites applies committed `drizzle/` migrations before uploading the Worker. The original source origin and owner-private audience must be preserved when publishing unless the owner directs otherwise. A separate GitHub remote can coexist; it is not a replacement deployment ID.

## Areas to revisit

The broad `data.js`, `progression.js` and `app.js` files have accumulated content overlays and retained historical mechanics. Extracting smaller modules and separating current generation from compatibility handling would help, provided saves, content IDs and UI behaviors remain covered. Cross-device persistence, server-backed offline progression, competitive integrity, physical-device testing and economy balance remain practical gaps. Alternatives are welcome; no framework migration or permanent backend shape is mandated.

## Version 0.13 state additions

The save schema stays at version 12 and the same season/key. `normalizeNightfall()` appends empty Boots slots to owned and checkpoint heroes, migrates paid Outfitter construction into the Equipment Workshop, supplies new fields and removes obsolete Attribute purchase stock. IDs, existing slots, journals, bonds, claims and active battle time remain intact. No SQL migration or fresh-season change was introduced.

New state includes accepted Side quest IDs, frozen generated contracts, service counters, per-slot seen inventory IDs, deterministic visitor epochs/receipts and deepest island floor. Visitors use a three-hour seeded cycle; hiring consumes the exact arrival once. Main quests remain a single ordered chain. Accepted contracts store a numeric encounter target instead of serializing a function.

Profession slots count together with legacy gathering Talents, deduplicated by key, before enforcing the eight-slot maximum. Snapshot sanitization handles both representations. New authored Mythical armor is excluded from normal item generation and crafting, and accepted canonically by challenge snapshots.

UI sheets dispatch through the existing simulation boundary. Model restrictions remain authoritative within the local simulation; views only present available choices. Browser-local ownership is still not a server-authoritative economy.

## Version 0.14 state and light boundaries

`normalizeEvernight()` appends Camp XP/source/ledger records, world difficulty, twelve-hour meal clock, nourishment, settings/tutorial/story progress, guild standing/purchase receipts, Quest pins/sort, utility lights and Arena stakes. It admits old waiting recruits once into new capacity, then clears the obsolete queue. Existing calling IDs receive the new prerequisite foundation. Save validation bounds new fields and preserves optional older current-season records. `collectCampXp()` counts lifetime XP deltas by stable owned IDs rather than counting equipment placement.

`consumeMeals()` settles missed periods in O(roster) time; it cannot loop over months of elapsed time. Active characters defer food XP until their checkpoint returns. World difficulty and Arena rule/stake data freeze into each expedition, and stake settlement has an idempotent receipt flag. Boss Sigils are boss-completion rewards and portal spend is guarded against repeat unlocks. Guild and monthly stock use canonical definitions and owned purchase receipts.

Detection and fog sampling use shared `lighting.js` geometry. Moving lights, fire and magic illuminate regions; racial/Attribute/Talent sight can reveal darkness. Trees/rocks use circle ray intersections and buildings use rectangular intersections. The renderer clips low-resolution light bands to shadow polygons on reusable mask/tint canvases; the engine snapshots explored cell memory. Enemy targeting and selection use actual visibility. This is 2D real-time lighting, with no light-fuel simulation.

The challenge sanitizer accepts canonical light equipment and new class nodes; it reconstructs bounded derived stats instead of trusting client values. The existing authenticated challenge protocol remains separate from local Arena wagers and still cannot prove local ownership.

## Pixel rendering and intentional inspection

`pixel-art.js` owns pure, grid-authored SVG sprite construction. `art.js` is the compatibility facade. Rectangles are merged without changing pixel geometry. `pixel-markup.js` keeps the SVG layout envelope but puts dense sprite geometry into cacheable SVG images; small currentColor icons remain inline. `pixel.css` is the final palette/mobile layer, following the existing style sheets.

`renderer.js` draws the battlefield onto a 600×240 raster world, then scales/crops it without smoothing. Its camera follows the live company or accepts explicit pan input; `worldPoint()` reverses the viewport transform for hit testing. World UI text uses display resolution. `pixel-lighting.js` shades at a four-unit grid with clipped light bands, seven alpha steps and Bayer dithering; masks refresh at most ten times per second. `scene-lighting.js` applies the same bands to management maps, including resident lamps and warm or arcane building windows. It is decorative there; expedition visibility remains owned by `lighting.js` and the engine.

`battle-interaction.js` separates explicit selection from simulation snapshots. Encounter identity changes clear it, and reconciliation rejects dead, missing or hidden units. Pointer travel/cancellation separates taps from panning and page scrolling. `app.js` does not fall back to the first adventurer in expeditions. No new save fields or database migrations are required.

## Growing Camp and performance (0.2)

`camp-world.js` defines the 3000×2200 world anchors, four active merchants, revealed areas and idempotent legacy home/service migration. `homestead-ui.js` owns the Camp/Market world viewports and their disposable ResizeObservers. `camera.js` provides frame-time easing, party-bounds framing, zoom/coordinate inversion, two-axis drag, pinch, keyboard controls and synthetic-click suppression. `homestead.css` is the final compact layout layer.

The renderer caches visual sprite identities without XP/timer fields, reuses terrain and draws finer movement onto a 1200×480 world raster. App snapshots retain the Battle prototype/terrain but shallow-copy visual entities rather than reconstructing the model each update; units and projectiles interpolate from the previous displayed position. The simulation continues owning combat/checkpoints. Camera state survives ordinary expedition rerenders and observation-only responses do not rebuild the DOM. HUD writes are throttled. ResizeObserver caches viewport measurements; observers disconnect when their view is replaced.

Scene lighting samples static world anchors once, uses dynamic resident occluders and equipped lamps, and reuses unchanged mask geometry. Progression revelation has its own world-space mask. Bonfire glow/embers animate separately from the expensive darkness/shadow pass. Background Camp ground is generated and compacted once; do not regenerate its large SVG on snapshots. Save schema/key/season and database history remain unchanged.

## Session menu, tutorial and render layers (0.4)

`game-shell.js` owns session-only menu state. Every load starts at the empty fire regardless of saved `screen`; Continue navigates to Camp and fades out the menu. The introduction and required learning are separately persisted by `onboarding.js`. New Game is an explicit simulation command behind a replacement confirmation. Native fullscreen uses standard/WebKit APIs with an immersive viewport fallback; dialogs belong to the fullscreen game element.

Learning version 2 adds quest explanation, the scripted Fernbridge loss, free Tavern invitation and cheap Pantry construction. Completed version-1 Camps remain complete. Active first-road saves receive the victory tag on both journey and battle checkpoint. The engine serializes `tutorialOutcome`, protects the intended surviving side, then resolves the scripted outcome within 22 combat seconds. Only those two tutorial journeys receive a tag. Ordinary enemy generation scales health by 0.85 without altering player definitions.

`map-interaction.js` captures hero/prop pointers, suppresses camera gestures while held, and delegates drops to simulation commands. `dropResident` checks the hero, availability, building and Guild roster gate before storing a location; the UI then opens the character-specific service. `moveProp` validates finite coordinates against revealed Camp areas; `toggleProp` changes the movable lantern. No manual walking mode remains.

`tavern.js` owns frozen tutorial offers, rotating stock, capacity/payment, two upgrades and consumable purchases. The Tavern is a full map screen. Guild lessons, professions, quests, member purchases and building drops all require six owned heroes. Stable legacy building and vendor keys remain for save compatibility.

`map-assets.js` references checked-in PNGs inside SVG envelopes served by the existing text-asset Worker. `scripts/generate-map-assets.mjs` deterministically creates Camp, Tavern, five expedition biomes and building tiles from original art. Static scenery, contact shadows and fixed light are baked once. `SceneLighting` draws dynamic ground lighting and character/prop projections underneath actors; a separate reveal canvas handles expansion fog. `Renderer` surrounds the 1200×480 combat world with 600 horizontal and 480 vertical units of overscan. Camera zoom is capped to keep that outer boundary offscreen. Dynamic actors, props and spell effects draw over the ground-light pass, so a caster is never darkened by its own projected shadow. See MAP_ASSETS.md for regeneration and provenance.

Save version/key/season, active checkpoint identities and database migrations remain unchanged. Journal claims and every gameplay mutation stay behind the simulation boundary.

## Persistent Camp and explicit lessons (0.5)

Camp/Tavern structural signatures exclude position, light toggles, learning and ordinary command replies. `homestead-ui.sync()` updates actor destinations, portraits, prop light state, NPC question marks and build dots in place. Only structural changes replace the scene. The introductory reveal class is cleared on a timer, so it cannot restart during later updates.

`camp-background.js` caches a construction-keyed canvas composed from the generated terrain and existing building tiles/shadows. Building DOM nodes are transparent service/drop targets; fire, characters and props remain live. World revision 2 translates old pixel/percentage placements into the larger world exactly once. Camp anchors and revelation are shared with simulation validation. Dynamic shadow painting uses a fading gradient and soft edge below owners. Combat props/decals/shadows are now below the fog composite.

Learning schema 3 stores task readiness separately from explicit acknowledgement and once-only reward receipts. `learningContinue(stage)` rejects stale/duplicate acknowledgements; every one of fifteen lessons pays three gold and recovery adds five wood. Legacy Fernbridge journey/defeat/recruit stages merge into recovery. Open dialogs host the same tutorial coach so it remains operable in the browser top layer. The final lesson is immediately ready.

`town-npcs.js` owns stable authored NPC descriptions, deterministic portraits and progression-gated rotating offers. Acceptance validates the NPC and current map at the simulation boundary, freezes generated objectives and tracks the quest. Journal filtering excludes unaccepted offers. Trading Post uses compatible existing forge stock with a Camp purchase gate and the dragged character’s comparison context. Arena navigation/launch require the separate building. Challenge backend behavior and authenticated access are unchanged.

Crossroads now has overview, fixed map/route planning and fixed party planning. Regional images are generated WebP bytes inside SVG envelopes; see GENERATED_MAP_ART for original prompts and provenance. The Bonfire tree draws its connectors from the same canonical parent IDs used by the model.


## Darker living Camp (0.6)

`camp-background.js` keeps an ungraded scenery canvas, a dark baked ground canvas and a local firelight patch per mounted world. `campScenery` describes stable building/hearth pieces; `changedScenery` invalidates only their rectangles. Each dirty region restores terrain and intersecting tiles in depth order. Firelight rebakes only if its radius changes or a dirty region intersects it. The stone ring, logs, soot and embers are baked into the same scenery as buildings. Camera/lighting/ground nodes survive construction and upgrades; prebound hidden service targets become visible in `homestead-ui.sync`.

`SceneLighting.sync` refreshes progression fog and the canonical bonfire source without replacing the scene. Camp skips the old second PixelLighting ambient pass. Moving lamps draw local live light, then character/prop projections and contact shadows draw below sprites. A shared `fireFlicker` modulates cached scenery opacity, actor brightness and shadows; a small flame canvas supplies flames and embers. `camp-water.js` registers clipped ripples and waterfalls to the 1468×1071 painting, excluding banks and islands. Water renders at ten Hz; the dynamic light pass at twenty Hz. Reduced motion freezes decorative animation. These budgets are not a physical-device frame-rate guarantee.

Learning version 4 removes `profile` from the fourteen acknowledgements, migrating that old stage directly to `crossroads` without adding/replaying rewards. New tent drops already open character information. Social commands, profile sections and automatic memory/bond accumulation are removed. Version-12 legacy `journal` and `bonds` fields remain inert and round-trip existing saves; they do not drive gameplay. Attributes/professions and learned talents are distinct profile sections. Save key/season/schema, expedition checkpoints and SQL migrations stay unchanged.


## Fallen-world assets and canon (0.7)

`fallen-world.js` supplies the current recruitment pools and installs additions after the historical data overlays. Legacy definitions remain valid for saves and authenticated challenge snapshots. Do not replace historical IDs or change the save season as part of art work.

`art.js` routes character output through `survivor-art.js`; it composes self-contained raster bodies from `survivor-sprites.js` with the real vector equipment/modifier/flight/mount layers. Creatures and legacy races fall back to `pixel-art.js`. Self-contained images are essential for SVGs decoded into battle canvas: external image resources inside those SVGs will not load. PNG body data avoids codec-specific alpha issues; actual browser decode is tested.

`prepare-ruin-assets.mjs` slices checked-in generated source atlases into bodies/buildings and packages environments in SVG envelopes for the text-asset Worker. `ruin-theme.css` is the final stylesheet. Camp dimensions, registered water masks, light caching, patch-only construction and camera geometry remain unchanged. See RUIN_ART.md for provenance.
