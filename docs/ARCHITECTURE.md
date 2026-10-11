# Architecture

This describes the implementation at version 0.12.0. It is a map of the present code, not a commitment to keep its boundaries or technology forever.

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
| Interface | `web/app.js`, `web/index.html`, `web/styles.css` | Navigation, Camp/Market scenes, route selection, services, character inspector and battle controls |
| Presentation | `web/art.js`, `web/landmarks.js`, `web/renderer.js`, `web/chatter.js`, `web/map-interaction.js` | SVG art, geography, canvas scenes, occasional dialogue and pointer-based drag/drop |
| Explanations and backups | `web/codex.js`, `web/saves.js` | Searchable mechanical/lore content, backup export and validated import |
| Hosted API | `worker/api.js`, `worker/index.js` | Challenge identity, snapshots, offers, atomic results, payouts, assets and health |
| Tooling | `scripts/`, `tests/`, `drizzle/` | Local adapter, build, artifact validation, tests and immutable schema migrations |

## Saved model

`initialGame()` supplies a versioned root record. Its main collections are `roster`, `inventory`, `companions`, `scrolls`, `gemstones` and `expeditions`. It also records Camp buildings/resources, exploration, boss clears, quests, challenge reward receipts and cosmetic ownership. Characters have their own IDs, generated names, race/class, appearance, levels/XP, equipment, armor, companion, Attributes, Talents, class nodes, bonds and journal entries. Object IDs distinguish two instances of the same base weapon.

An expedition stores its party IDs, frozen itinerary, seed, current encounter, phase, AUTO flag, elapsed/pending seconds, rewards, temporary recruits and serialized battle. Equipment is not changed by the player during a journey. The checkpoint synchronizes battle-earned XP, levels and health back into the owning characters.

`validateSave()` guards the current shape and invariants; `migrateSave()` normalizes supported current-season records. `web/saves.js` validates imported files and reconstructs their battle checkpoints before accepting them. Current records carry both `version: 12` and `season: 'camp-fresh-2026-10-11'`. Older seasons cannot be restored through the backup importer.

Browser `localStorage` is the only personal Camp persistence today. It is scoped to a browser profile and origin, not the hosted account. `.local/camp.sqlite` is the development challenge database, not the personal Camp save. No actual player saves are included in source control; historical test fixtures are synthetic regression data.

## Time, AUTO and background behavior

`ExpeditionSimulation` uses `STEP = 1/30`. All active expeditions receive real elapsed time; a round-robin drain gives each party fixed combat steps. A time budget prevents a long offline catch-up from monopolizing the interface. Remaining elapsed time is retained in `pendingSeconds` and processed incrementally.

Only the actively observed party may run at 2× or 3× or pause. Unobserved parties always advance at 1×. Changing screens, losing visibility/focus, selecting a faster speed or reopening saved active expeditions enables AUTO. Long timer gaps are interpreted as suspended browser time and use 1× even if a fast battle was previously open. At observed 1× with AUTO off, combat still plays, but interludes wait for Continue. New encounters have a 3–2–1–Fight preparation countdown.

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

`scripts/build.mjs` embeds all supported `web/` assets into `dist/server/index.js` and combines the shared definitions, battle engine and backend into one Worker module. It also copies `.openai/hosting.json`. `scripts/validate-artifact.mjs` imports that exact Worker and checks assets, module routes, health, auth and bindings. The concatenation build strips single-line imports/exports from a known module list; introducing another backend dependency or complex module syntax may require changing the build.

The hosting manifest binds the existing Sites project with `d1: 'DB'` and no R2 bucket. Sites applies committed `drizzle/` migrations before uploading the Worker. The original source origin and owner-private audience must be preserved when publishing unless the owner directs otherwise. A separate GitHub remote can coexist; it is not a replacement deployment ID.

## Areas to revisit

The broad `data.js`, `progression.js` and `app.js` files have accumulated content overlays and retained historical mechanics. Extracting smaller modules and separating current generation from compatibility handling would help, provided saves, content IDs and UI behaviors remain covered. Cross-device persistence, server-backed offline progression, competitive integrity, phone layout testing and economy balance are the largest practical gaps. Alternatives are welcome; no framework migration or permanent backend shape is mandated.
