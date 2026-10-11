# Verification record

## Evernight 0.14

The local suite passes **157 Node tests**, followed by build and bundled Worker validation. Fifteen new tests cover bounded twelve-hour meals, deployed meal XP, Camp XP ledgers, light equipment/AI/terrain shadows/fog checkpoints, world tiers and frozen parties, boss farming and chosen portals, guild standing/member receipts, Arena rules/mines/stakes, monthly cosmetics, migration and Codex consolidation. Existing combat, challenge transactions, save/worker transport, native rendering and full DOM service tests remain covered.

The browser pipeline now contains **21 scenarios**: seven flows across desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit emulation. It exercises the three-page opening, naming, four Camp metrics, tutorial placement/Skip/settings, saved profiles, all new district maps, eight guild booths, lessons/standing/shops, Tavern hiring, Quest organization, compatible light equipping, alternating class choices, global difficulty, chosen portals, calendar state, monthly collections, Arena stake deduction, reduced motion and horizontal fit. Screenshots and failure traces are retained in `browser-report`.

All 21 browser scenarios passed without retries in [Game checks run 38171105838](https://github.com/threebeat/Evernight/actions/runs/38171105838), source commit `e144cd8a3317b54c469d05e1374d773b3964245f`. Both jobs succeeded: the 157-test model/artifact job and browser job. The browser run took 1.2 minutes; its reports include scene screenshots. Local DOM/native canvas tests provide additional model/command/render evidence.

## Prior release evidence

The 0.13 workflow passed 142 Node tests and 12 browser scenarios: [run 38137043359](https://github.com/threebeat/Evernight/actions/runs/38137043359). Original browser-selector issues were corrected before that release. Native SVG sheets verified shared equipment/race art and the corrected island marker.

## Limits and follow-up

Browser emulation does not establish physical iOS/Android performance, OS suspension behavior, touch dragging ergonomics, hosted multi-account identity or long-term progression balance. The first-road seeded regression still requires at least 90% wins over twenty opening battles. Carried-light shadows should receive a frame-rate pass on an actual modest phone.

On physical devices, try the opening, settings/tutorial, a full roster, long class/Codex sheets, district navigation, lights in dark/obstructed battles, Quest filters, monthly calendar, long Arena outcomes, tap/drag service access and background/reopen catch-up. Test both orientations and reduced motion. Another browser/device has separate personal state; cross-device synchronization is not implemented.
