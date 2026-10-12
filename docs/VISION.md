# Vision and open direction

Evernight is a persistent character collector built around watching automatic battles and bringing a memorable company home. The owner has compared the desired attachment to Pokémon and the automatic team battles to a superhero squad battler. Those references describe the feeling, not a request to copy names, characters, assets or gameplay wholesale.

## What should guide decisions

- **Characters matter over time.** Names, appearance, traits, companions, class choices, journals and shared experiences should help players recognize favorites and remember their history.
- **Teams express choices.** Race and class begin simply; equipment, learned skills, companions and specialization create understandable changes in how a unit behaves.
- **Battles explain themselves visually.** Selection, flight, magic, weapon properties, terrain interactions and win/loss should be apparent without reading a spreadsheet.
- **Camp feels like home.** Residents and companions move around a readable place. Services open from buildings; resources and progression should be clear without crowding a phone screen.
- **Exploration gives context.** Roads, landmarks, supplies, destinations and reward milestones should make travel feel like reaching somewhere, not selecting an arbitrary wave count.
- **Background play respects attention.** Players can oversee one party or do something else while others progress fairly at 1×. What happens after a tab closes must be described honestly.
- **Collection has value.** New recruits and scarce upgrades should be exciting. Gold can be approachable; gem sinks and high-tier identities need pacing that rewards investment without making the first hour frustrating.

These are current product goals and may evolve with the owner. They do not mandate exactly five maps, three starters, forty starting Camp spaces, a particular rarity ladder, Node, D1, vanilla JavaScript or a fixed live-service economy.

## Near-term questions

| Question | What to learn before committing |
| --- | --- |
| Does the opening form attachment? | Observe how players recognize their first three, understand the first quest and decide to hire a fourth |
| Are upgrades meaningful? | Compare a clear combat change with raw stat gains; show a before/after in services |
| Are mobile scenes readable? | Test portrait layouts, tap targets, route comparisons, overlays, drag alternatives and battle metrics on real devices |
| Is background play trustworthy? | Check catch-up, multiple tabs, repeated reconnects, device switching and visible reward timing |
| Can the economy support competition? | Decide which ownership/reward transactions need server verification before expanding player-versus-player stakes |
| What makes Mythicals special? | Build original authored identities with recognizable silhouettes and behavior, not only larger numbers |
| Is there enough narrative texture? | Use rare contextual dialogue, small journal moments, map landmarks and character quirks without mechanical repetition |

## Possible future work

Server saves and an authenticated economy would improve cross-device play, competitive fairness and durable ownership. Timestamp-based authoritative progression or scheduled server simulation are both options; the choice should follow expected scale, cost and required fidelity. Do not introduce heavy infrastructure before the owner knows the problem it solves.

Other useful directions include richer class choices, more distinct companion behavior, camp construction depth, authored encounters, biome-specific movement/projectiles, better map boss silhouettes, deeper relationship interactions, accessibility settings, optional gore controls, stronger asset variety and easier content authoring. The owner has chosen Evernight and permanent-night camp-horror lore. Public game sharing, an open-source license and any monetization model remain undecided.

Balance constants are provisional. Content counts and release snapshots describe what exists now rather than promising a permanent campaign structure. Treat new user feedback as steering, update this document when goals shift, and keep the code/documentation usable by a future human or agent.

## Current visual and agency direction

Permanent night connects the name to campfires and permits a gentle double meaning: comfort at Camp, theatrical horror beyond its glow. Dark slate surfaces, warm lantern light, violet island signals and expressive original silhouettes establish a readable night palette. Permanent night now has real consequences: carried lights, terrain shadows, remembered fog and valuable night vision.

Version 0.13 keeps scalable original SVG assets and shared portrait rendering. A wholesale pixel-art conversion is deferred until an art direction is chosen: consistent silhouette sizes, armor layers, mounts, animation frames and ownership/licensing of any outsourced assets need a coherent pass. Existing code-native art remains easy to iterate and clear at phone sizes.

Intermediate agency now comes from Side/NPC quests, gathering profession choices, cooking, meaningful equipment comparisons and a visible distant island goal. These are implemented opportunities, not proof of retention or balanced first-hour pacing. Observe players before increasing the number of systems.

## Evernight priorities

The owner requested a clean frequently visited Camp, background guidance that stays out of battles, visible Camp progression, twelve-hour food, rewarded retirement, global difficulty and meaningful map choice. Those rules are implemented in 0.14. The expanded Market and Quest journal organize services and goals as the company grows. Arena wagers provide risk using gold/resources; the main menu prioritizes Quests. The calendar and twelve themed collections connect routine play to the monthly world.

Class decisions alternate learned talents and subclass choices instead of spending every point on another title. The Codex explains full trees and grouped modifier pools. Remaining balance questions include the value of night vision versus lamps, meal XP pacing, retirement income, guild lesson costs, Arena expected returns and boss-route lengths. These need observation and tuning; passing tests establish behavior, not a finished live-service balance.

## First pixel release — Evernight 0.1

The owner accepted the retro fantasy mock-up and prioritized complete pixel artwork, a clean Camp centered on phones, and a mobile expedition that is not interrupted by automatic profiles. Permanent night remains a mechanic. Warm lanterns, indigo darkness, violet magic and blue night vision overlap on the world with stepped/dithered edges. Text and control targets remain readable. Original equipment/race identities are preserved; the world should keep moving toward this coherent style rather than mixing unrelated asset packs.

## Growing home — Evernight 0.2

The owner now wants a smaller starting footprint within a larger explorable Camp, smooth camera control, a strong welcoming bonfire and less phone clutter. The neighboring Market is replaced by a constructed four-vendor Camp Market; services gradually occupy the Camp grounds. Home upgrades replace separate cabin placement. Treat animation-frame rendering as a performance target, not evidence of physical-device frame rate.

## A game in the browser — Evernight 0.3

The owner now wants the experience contained entirely in one retro pixel game window, including fullscreen on supported browsers and a phone viewport fallback. Camp is the place to play; services and information open inside it. A quiet cinematic fire introduces the three arrivals and the curse, then an action-driven first journey teaches controls, care and the Journal. The Crossroads contains expedition organization, and the Journal replaces separate quest navigation. Keep subsequent Camp visits clean and preserve existing players’ progress. These decisions supersede earlier dashboard/navigation and opening-dialogue descriptions.
