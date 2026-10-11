# Version 0.12.0 · Fresh Camps

Prepared on 2026-10-11 after implementing the owner's latest change request. This is a new season, not a routine save-compatible update.

## Player-facing changes

- Camp rename now lives in the Camp bar. Food and adventurer capacity replace unused Camp/region metrics. Stone and Ore have new icons; eggs are no longer in the global resource strip.
- Camp starts with twenty adventurer spaces. Each repeatable cabin adds twenty. Purchases/creation/charm respect capacity; earned arrivals can wait for a space. Release replaces retirement and returns belongings.
- Archaeology unlocks after any Camp extension. It hatches the two dinosaur companions and grows three fossil companions, with fossils available at jungle side destinations.
- A buildable Blacksmith replaces the Sharpening Bench. It improves, transforms and crafts weapons. Weapon transformation is removed from the Bonfire; armor/pet transformation and class trees remain there.
- Crossroads hides region switching before the first boss/portal and lists only unlocked maps. Each map has three Rare mini-bosses and a final Rare boss, with off-node landmarks and geography.
- Strong roads remain solid; wild roads remain dotted, selected or not. The selected route is bright blue and others black. Road styles change actual obstacle density; water-adjacent roads can create river encounters. Direct paths always use 1× strength/rewards; detours increase both.
- Daily Battle exposes only today's UTC option. NPC battles offer difficulty selection; higher-tier prizes pay only their unclaimed increase. Weekly/monthly themed champions and cleared-region boss rematches appear in Champions.
- Cosmetic offers now show previews. Full character guises, compatible weapon-family skins and companion guises apply at the Atelier without changing mechanics.
- Three original authored Mythical adventurers and four signature weapons have themed visual identities. They are not ordinary random drops/crafting results.
- Victory/Defeat reports and intermediate win banners make encounter results clearer.
- Orcs, Kobolds and Nereids use sparse head marks/single hairs. Shades are animated dark smoke; Sylphs pale smoke, with visible gear.
- Fifty-two ordinary weapon bases have short names and unique silhouettes, including Katana. Modifiers extend their names and visual behavior.

## Reset

All old personal saves/backups are rejected, with a new browser key/season and three fresh level-5 starters. The appended shared-board migration clears old offers, matches and payouts. Old clients are rejected by the challenge API's season check. This was explicitly requested; future updates should preserve progress unless instructed otherwise.

## Maintainability and handoff

Added local Node/SQLite development support, a locked native canvas development dependency, GitHub Actions checks, reproducible asset sheets, generated content inventory, architecture/current-game/content/vision/development documentation and a next-agent handoff. No production secrets or real player saves belong in the exported source.

GitHub is connected as `threebeat`, but repository creation is not exposed here. Transfer to the intended private `threebeat/camp-collector` remains pending owner creation/access. The existing private Sites source/deployment is retained and the prepared source can be downloaded/run independently.

## Verification and limits

The regression suite has 130 passing tests, including capacity and overflow, Blacksmith/Archaeology gates, maps/terrain, direct-route multipliers, today-only daily rewards, champion unlocks, legal Mythical snapshots, cosmetic compatibility, smoke art, backup rejection, D1 reset, connected interface interactions and actual worker transport. The final build and deployed artifact are separately checked with the repository scripts.

Native SVG/canvas sheets were generated and inspected for weapons, characters/cosmetics, companions and map landmarks. This is not a live phone/browser layout test. Actual responsive layout/animation timing needs browser/device QA. The local HTTP adapter is syntax-checked and its built Worker/routes are validated; it was not launched in the managed Sites environment.

Personal saves/economy remain browser-local. Offline expeditions catch up on return rather than continuously executing on a server. Shared board battles are server-resolved, but client-owned currency/collections remain an integrity limitation. No final game name, public license or monetization model has been selected.
