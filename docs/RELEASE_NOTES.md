# Release notes

## 0.2.0 — A growing home

- Reused terrain and stable sprite/light caches, interpolated units/projectiles, cached viewport measurements and updated observation controls without replacing the screen.
- Added smooth party-bounds combat zoom, Focus/free view, two-axis drag, pinch, wheel and keyboard camera controls.
- Rebuilt Camp as a large forest clearing with paths, a south lake and progressively revealed shadowed plots. Camp expansion arrows are removed.
- Strengthened the bonfire, added flicker/embers and world-space building/resident shadows. Heroes emit no innate light.
- Replaced the neighboring town with a constructed four-vendor Camp Market. Camp now houses guild, recruiting, Clinic, Quest, slot, creation and appearance services.
- Upgraded the tent into a cabin in place, preserving legacy capacity and adding twenty spaces per further upgrade.
- Collapsed phone Camp details, simplified primary navigation, and prevented inspectors on Crossroads/party assembly. Explicit combat inspection remains a small inline card.

Save schema/key/season, owned records, checkpoints, Site URL/audience and database history are preserved. Local model/build validation passes 171 tests; remote browser results are recorded in QA.md.

## 0.1.0 — First pixel release

- Replaced all character, equipment, companion, cosmetic, building, map and prop art with an original shared pixel sprite system, including race physiology, worn armor, mounts and Mythicals.
- Rebuilt the combat renderer with a low-resolution world and stepped/dithered overlapping lights. Natural fixtures, lamps, fires and colored spell effects share terrain shadow geometry and actual visibility.
- Reworked phone Camp into compact progression/status cards, expandable supplies, a shorter portrait map and actionable harvesting/recovery/company activity.
- Added a closer following phone camera, sideways pan, Follow company, compact live party HP and a collapsed battle journal.
- Fixed automatic character profiles: no launch/watch/snapshot fallback selects the first adventurer. Selection clears across encounters, death and lost visibility; pointer drags/cancellation never inspect. Explicit inspection is a small inline card with a deliberate Details action.
- Kept save schema/key/season, current characters, active checkpoints, economy and the existing Site binding. Package/public version 0.1.0 follows legacy 0.14 at the owner's direction; browser cache generation is 15.

Verification: 164 Node tests, build/artifact validation and all 24 remote browser scenarios pass. Desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit passed without retries in run 38187834961; see QA.md. Actual phone frame rate and touch ergonomics remain a physical-device follow-up.


## 0.14.0 — Evernight

The owner renamed the game/repository and made permanent night the core world mechanic. Existing current-season saves, the private Site and append-only database history are preserved.

- Dark screens and real-time carried-light shadows, AI visibility, remembered fog and racial/Attribute/Talent night vision. Lamps equip in a dedicated utility slot.
- Three required opening pages, an optional guide attached to desktop/phone navigation, Skip and currency-adjacent settings. Camp has Build below its name, clickable Camp XP, four metrics and actual resources.
- Camp progression from XP/actions, 40 starting adventurer spaces plus 20 per cabin, twelve-hour food consumption/XP/recovery/wanderer benefits, and unified retirement returning belongings with level-based rewards. Waiting arrivals are removed.
- Bonfire class choices and global world tiers; armor/companion transformations at the Workshop. Active party configurations remain frozen.
- Market district maps, eight guild booths with training/quests/standing/exclusive discounts, Commons Outfitter/Board, Tavern hiring and Arena grounds. Arena stakes gold/resources with duel, four-team, tigers or mine-floor rules; losing/recalling forfeits the stake.
- Dedicated searchable/sortable/pinnable Quest journal. Final boss journeys yield one Boss Sigil; the Portal Mage spends it to open any chosen region.
- UTC Daily Battle month calendar and twelve themed Shop collections with once-only monthly appearance ownership.
- Consolidated Codex pages and five class points alternating talent/subclass/talent/subclass/talent, while preserving learned branch IDs. Equipment transformations retain their separate thresholds.

Verification: 157 local Node tests plus bundled build/artifact validation pass. All 21 remote browser scenarios passed across desktop, Android and iPhone emulation; run evidence is recorded in QA.md. GitHub pipelines verify/package changes; production publishing uses the authenticated Sites operation.

Previous recommendations on bundling, source recovery, player agency/profiles/content and automated phone-layout checks were reviewed and addressed. Physical devices, retention/economy tuning, cross-device saves, conflict handling and authoritative ownership remain future work. Personal saves/economy stay browser-local; offline battle time reconstructs on return.

## 0.13.0 — The long night

The owner chose Camp Collector and permanent-night lore. Existing v12 saves are preserved; no new season or SQL wipe is introduced.

- Detailed tent profiles support companions, friends, memories, growth and ordinary character care. The smaller inspector has friendly/enemy/neutral gradients and click-through race/class foundations/trees.
- The Market gains districts, Profession Guilds, a moved Outfitter, an Attribute-removal clinic, stable neutral wanderers, Mara's scripted quest and the Night Watch challenger.
- Professions have three ranks, real gathering bonuses, dedicated tools and rare-resource chances. Attributes are removed from direct purchase and generic granting.
- Armor has Head, Chest, Legs and Boots, distinct worn/card art, shared rarity/modifiers/transformation and authored Mythical island boots. Storage and shopping use compatible-character comparison sheets; slots flag new inventory instances.
- The Equipment Workshop crafts armor and offers trading/transformation. Kitchen upgrades replace the Pantry in place, retaining food shopping and adding efficient meals and ingredient dishes.
- One Main and two starter Side quests create early choices. The Market Board offers additional Side quests and generated daily patrols with frozen accepted objectives and once-only rewards.
- The south lakeshore and visible violet island connect geography to a built Lantern Dock, Legendary/occasional authored Mythical arrivals and 25 playable dungeon floors with five guardians.
- The Worker uses esbuild rather than import-stripping concatenation. GitHub has the complete source and preserved v12 history. Current Actions run Node checks, desktop/Android/iPhone browser flows and artifact packaging; production publication remains a verified private Sites operation.

Verification: 142 Node tests, build and artifact validation pass. Browser CI results and physical-device limits are recorded in QA.md. Native SVG contact sheets were regenerated and the island marker was moved into the visible forest map.

Personal saves and economy remain browser-local. Authoritative cross-device saves, multi-device conflicts and competitive ownership are still future work.

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
