# Verification record

## 0.7 verification

The local gate passes **196 model/integration tests**, build and bundled Worker validation. New coverage validates all 168 current race/class combinations, legal starter equipment and authenticated challenge transport, generation/stock restricted to the concept roster, preserved legacy collections, and deterministic Barbarian combat across checkpoints. It caught a Strength-gated starter weapon, which was replaced with the legal Hatchet.

The browser suite now contains **42 scenarios**, fourteen each on desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. It adds actual browser-canvas decoding for all 26 survivor bodies and title-screen portrait/landscape fit, alongside the retained tutorial, saves, Camp construction, water/light animation, services, gestures, profiles and expedition flows. All **42 scenarios passed without retries** in [Game checks run 38373841554](https://github.com/threebeat/Evernight/actions/runs/38373841554), GitHub source `c18e05ef4b254e6cae63977264839fb0175e7898`. Both verification and browser jobs succeeded; browser scenarios took 5.9 minutes. Desktop and phone screenshots were reviewed. The final publication adds this verification record and art-rendering notes without changing tested game code.

Browser review corrected an opening-scene layer intercepting Continue, oversized framing over the HUD, the phone battle plaque, exact-title Codex search ranking, moving character hit targets, dialog refresh stability, and reduced-motion changes behind an open sheet. Combat now caches decoded survivor SVGs into small bitmaps. Camera-coordinate checks wait for actual animation frames; the two long multi-service scenarios have a 90-second overall budget while individual actions keep their 10-second limit.

The focused iPhone route/combat scenario passed in run 38373162582. Its 500 ms frame sample recorded seven frames in isolation; two concurrent software-rendered WebKit sessions produced only two to four. The full suite is restored unchanged, with one worker for the iPhone project so its rendering sample has an independent runner budget. The frame assertion is retained. These measurements are CI diagnostics, not a physical-device frame-rate claim.

Physical-device performance, battery use, touch ergonomics and hosted multi-account behavior remain unverified.

## 0.6 verification

The local gate passes **193 model/integration tests**, build and bundled Worker validation. Added coverage verifies removal/migration of the duplicate profile lesson without reward replay, separate Attribute/Talent output, retired social commands and inert legacy records, local construction invalidation with unchanged distant pixels, darker terrain, firelight radius changes, water movement/exclusion masks/reduced motion, visible fading bonfire shadows and exact camera settling.

The browser suite contains **39 scenarios**, thirteen each on desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. It checks the fourteen-lesson tutorial and saves, profile sections, retained Camp/ground/firelight nodes during a cabin upgrade, water animation, synchronized light changes and reduced motion, alongside the existing service, expedition and drag/drop flows. Browser QA fixed the camera’s endless subpixel easing tail and made raw-coordinate drag checks wait for the opening camera move, verify pointer capture and compare actual saved positions.

All **39 scenarios passed without retries** in [Game checks run 38346019242](https://github.com/threebeat/Evernight/actions/runs/38346019242), GitHub source `2c22954f1b3908671b9645aeb9875f63fc594b57`. Both verification and browser jobs succeeded; browser scenarios took 3.1 minutes. The local and remote gates pass **193 model/integration tests**, build and artifact validation. Publication adds this verification record and corrected Codex wording about character profiles.

Screenshots cover darker terrain, the baked hearth/flame, character/prop shadows, lake water and desktop/phone profiles. Native raster checks separately verify shadow/illumination geometry and dry-land clipping. Physical-device frame rate, battery use, touch ergonomics and hosted multi-account behavior remain unverified.

## 0.5 verification

The local suite contains 187 model/integration tests, including persistent tutorial acknowledgement/rewards, NPC visit and acceptance guards, Journal exclusion of unaccepted quests, Trading Post purchase permissions, late Arena construction, once-only coordinate migration and actual raster shadow falloff. Existing save/checkpoint, combat, economy, Worker and connected DOM flows remain covered. Build validation now verifies all six generated WebP SVG envelopes through the bundled Worker.

The remote browser suite has 36 scenarios across desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. Added coverage retains the same scene/light/ground nodes after a prop drop, opens the profile side panel, drags a hero to the Trading Post for personal comparison, and walks the explicit tutorial through both scripted roads. Browser QA corrected an upgrade-site hit target covering the Pantry, live reduced-motion updates, post-drag click suppression, moving Camp hero hit targets, mobile route-footer overlap, compact party layout and Safari tutorial-action sizing. Desktop and phone screenshots cover the generated terrain, connected Bonfire tree, Journal, Tavern, profile panels and personal equipment comparisons. Physical devices and hosted multi-account behavior remain unverified.

All **36 scenarios passed without retries** in [Game checks run 38329285873](https://github.com/threebeat/Evernight/actions/runs/38329285873), GitHub source `006f37e6b348bc54a6b95b872195c5281c63bd3e`. Both verification and browser jobs succeeded; browser scenarios took 3.0 minutes. The local gate and remote gate pass **187 model/integration tests**, build and artifact validation. Screenshots were inspected at desktop and phone sizes, including the final Safari tutorial controls. Publication adds this verification record without changing tested game code.


## Evernight 0.4 menu, Tavern and guided progression

The local suite passes **185 Node tests**, followed by build and Worker artifact validation. New coverage checks the two scripted tutorial outcomes across sixteen seeds and checkpoint resumes, enemy-only HP changes, Tavern rarity/upgrades/free-choice purchases, Guild access at six heroes, persistent movable props and ground-shadow projection. The connected DOM flow completes both tutorial journeys, quest claiming, recruitment and Pantry construction. All thirty PNG assets match the bytes embedded in their shipped SVG envelopes.

The remote suite contains **33 scenarios**, eleven each on desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. It exercises the empty-fire menu on saved visits, Continue/reload, native or fallback fullscreen, character dragging, prop persistence, the full tutorial, Tavern hiring/bar purchases, construction, retained services and the enlarged expedition view. Browser QA corrected technical-bar overlap, continuously moving recruit targets, Tavern letterboxing and a save assertion that ran before its command completed. A final visual pass moved the Pantry site label away from the heroes and props and added explicit hit-target coverage.

All 33 scenarios passed without retries in [Game checks run 38306707312](https://github.com/threebeat/Evernight/actions/runs/38306707312), GitHub source `55aeeaa2a4e9cca7612371cbdf3025f02962ff78`. Both verification and browser jobs succeeded; browser scenarios took 2.0 minutes. Desktop and phone screenshots were inspected. The final publication adds this verification record without changing tested game code. Physical-device frame rate, touch ergonomics and browser/OS fullscreen restrictions remain separate checks; unsupported browsers use the expanded-viewport fallback.

## Evernight 0.3 single-window release

The local suite contains **179 Node tests** plus build/artifact validation. New checks cover saved cinematic beats, ordered learning events, enforced first-road choices, genuine journey completion, post-return care/Journal, defeat/retry, existing-Camp migration and persisted resident targets. The connected DOM flow exercises the full tutorial and retained Camp services.

The remote suite contains **30 scenarios**, ten per desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit project. It adds full first-journey/reload progression, Crossroads companies/reports, one-window vertical fit, orientation changes and fullscreen services. All 30 passed without retries in [Game checks run 38291061334](https://github.com/threebeat/Evernight/actions/runs/38291061334), GitHub source `76f1e2123b71f3b19ed6afd0901c4223b6e1b8e9`, matching Site source `38b213a4ba242282dfad7bf09ec8c2ca555b361f`. Both jobs succeeded; browser scenarios took 1.6 minutes. Browser QA corrected walk taps intercepted by service labels, resident hit-target layering after movement, map-key focus, Journal completion inside its dialog and obsolete guide selectors. Desktop and phone scene screenshots were inspected. Publication adds this verification record without changing tested game code. Physical-device performance and browser/OS fullscreen behavior remain separate follow-up; the fallback cannot remove unsupported browser controls.

## Evernight 0.2 growing-Camp release

The local suite passes **172 Node tests**, followed by build and Worker artifact validation. New checks cover gated Market construction, four vendors, in-place home capacity, idempotent migration, progressive revelation, camera easing/coordinate inversion, gesture click suppression, keyboard/wheel input actual Camp light/occluder behavior and Camp recruiting-stock refresh. The updated connected DOM flow exercises these services in their new locations. Native Camp ground art was rasterized and inspected.

The remote browser suite contains **24 scenarios**, eight each on desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. It now covers Camp/map gestures, construction and upgrades, all relocated services, persistent saves, route/profile regression, free/focused battle camera and zoom, and retained calendar/light/class/portal content. All 24 passed without retries in [Game checks run 38198468057](https://github.com/threebeat/Evernight/actions/runs/38198468057), GitHub source `fa3eead1b73a7c2213e06ed9ba14914cce703d73`, matching Site source `f77a6bb3ebbff40cef23af385d47ab66ab7ae038`. Both jobs succeeded; browser scenarios took 1.5 minutes. Browser QA corrected service hit targets, overview label overlap, and Camp recruiting-stock initialization. Desktop and phone scene screenshots were inspected. The final publication adds this verification record without changing tested game code. Paused battlefield animation-frame samples are diagnostic only; they do not establish physical-device performance under heavy combat.

## Evernight 0.1 pixel release

The local suite passes **164 Node tests**, followed by build and bundled Worker validation. Seven new regressions cover intentional selection across snapshots/encounters, hidden-enemy rejection, tap versus pan/scroll/cancel, deterministic colored environment lights, overlapping pixel light bands with terrain shadows/blue vision, canonical sprite coverage and phone camera coordinate conversion. Native art checks rasterized 307 original sprite variants, and native combat captures were inspected. Dense sprites are compacted at HTML boundaries; the full DOM service regression completes in approximately twelve seconds locally.

The browser suite contains **24 scenarios**: eight flows on desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. The new regression checks pixel buildings, expandable Camp stock, initially empty inspection, explicit inline selection, persistent close across updates, pan without selection, Follow, reload and horizontal fit. All 24 passed without retries in [Game checks run 38187834961](https://github.com/threebeat/Evernight/actions/runs/38187834961), GitHub source commit `102f94903e627de78a8774253fd83062fbb4813e`, matching Site source `d717ce1339ff96561ebbf82e46a31b96b4838f5f`. Both verification and browser jobs succeeded; browser scenarios took 1.5 minutes. Browser QA found and corrected a decorative Market label intercepting taps and wandering Camp characters overlapping service targets. Reports retain scene screenshots. The final publication adds this verification record without changing tested game code.


## Evernight 0.14

The local suite passes **157 Node tests**, followed by build and bundled Worker validation. Fifteen new tests cover bounded twelve-hour meals, deployed meal XP, Camp XP ledgers, light equipment/AI/terrain shadows/fog checkpoints, world tiers and frozen parties, boss farming and chosen portals, guild standing/member receipts, Arena rules/mines/stakes, monthly cosmetics, migration and Codex consolidation. Existing combat, challenge transactions, save/worker transport, native rendering and full DOM service tests remain covered.

The browser pipeline now contains **21 scenarios**: seven flows across desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit emulation. It exercises the three-page opening, naming, four Camp metrics, tutorial placement/Skip/settings, saved profiles, all new district maps, eight guild booths, lessons/standing/shops, Tavern hiring, Quest organization, compatible light equipping, alternating class choices, global difficulty, chosen portals, calendar state, monthly collections, Arena stake deduction, reduced motion and horizontal fit. Screenshots and failure traces are retained in `browser-report`.

All 21 browser scenarios passed without retries in [Game checks run 38172105838](https://github.com/threebeat/Evernight/actions/runs/38172105838), source commit `e144cd8a3317b54c469d05e1374d773b3964245f`. Both jobs succeeded: the 157-test model/artifact job and browser job. The browser run took 1.2 minutes; its reports include scene screenshots. Local DOM/native canvas tests provide additional model/command/render evidence.

## Prior release evidence

The 0.13 workflow passed 142 Node tests and 12 browser scenarios: [run 38137043359](https://github.com/threebeat/Evernight/actions/runs/38137043359). Original browser-selector issues were corrected before that release. Native SVG sheets verified shared equipment/race art and the corrected island marker.

## Limits and follow-up

Browser emulation does not establish physical iOS/Android performance, OS suspension behavior, touch dragging ergonomics, hosted multi-account identity or long-term progression balance. Tutorial outcomes are separately guaranteed and checked across seeds and checkpoint resumes; ordinary progression balance still needs playtesting. Carried-light shadows should receive a frame-rate pass on an actual modest phone.

On physical devices, try the opening, settings/tutorial, a full roster, long class/Codex sheets, district navigation, lights in dark/obstructed battles, Quest filters, monthly calendar, long Arena outcomes, tap/drag service access and background/reopen catch-up. Test both orientations and reduced motion. Another browser/device has separate personal state; cross-device synchronization is not implemented.
