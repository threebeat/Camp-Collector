# Camp Collector · 0.12.0

A browser character collector with automatic battles, a living Camp, branching journeys, companions and an evolving equipment collection. **Camp Collector is a repository label, not a chosen game title.** The interface uses the player's Camp name. The owner has rejected Frutiger Fighters, Wayward Company and Little Legends; the final brand remains open.

The private test build is [here](https://camp-collector.johnmoore2048.chatgpt.site). Its sharing policy is unchanged. This source can also run locally without ChatGPT or an AI agent.

## Run it yourself

Use Node.js 24 or later. From this directory:

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. The local adapter serves the built application and uses `.local/camp.sqlite` for the challenge board, with a development-only identity. Rebuild and restart after changing source. `CAMP_DEV_PORT` changes the port. Your personal Camp is saved in this browser; use the in-game backup controls to move a current-season save.

```bash
npm test
npm run build
npm run validate
```

No production secrets are required for these commands. GitHub Actions runs the same checks. `node scripts/art-contact-sheet.mjs` produces asset sheets under ignored `artifacts/`; it does not test browser layouts.

## Read the project

| Document | What it explains |
| --- | --- |
| [Current game](docs/CURRENT_GAME.md) | Player flow, services, progression, combat and reward rules |
| [Architecture](docs/ARCHITECTURE.md) | Browser, simulation worker, backend, saves and module responsibilities |
| [Content guide](docs/CONTENT_GUIDE.md) | Adding races, classes, weapons, traits, companions and maps |
| [Content reference](docs/CONTENT_REFERENCE.md) | Current inventories, baseline stats, slots and modifier effects |
| [Vision](docs/VISION.md) | Product goals, open questions and room to change direction |
| [Development](docs/DEVELOPMENT.md) | Local work, tests, deployment, GitHub import and reset procedure |
| [Release notes](docs/RELEASE_NOTES.md) | Changes and verification for the fresh-Camp release |
| [Next agent prompt](docs/NEXT_AGENT_PROMPT.md) | A reusable, implementation-aware handoff |

Start with `web/data.js`, `web/progression.js`, `web/simulation.js` and `web/engine.js` for the game model. `web/app.js` renders the interface. `worker/api.js` handles shared player challenges. No framework or generated image service is required at runtime; visual assets are SVG and canvas code.

## Fresh season and current limits

Version 12 intentionally resets all earlier progress. The new season is `camp-fresh-2026-10-11`, with browser key `camp-collector-v12`. Old saves and backups are rejected. The appended database migration also clears the old shared challenge board and payouts. This reset was explicitly requested by the owner; future releases should preserve player progress unless another reset is requested.

Expeditions run in a browser Web Worker and reconstruct elapsed time at 1× after a suspended or closed page is reopened. There is no continuously running server expedition scheduler or cross-device Camp save yet. The shared challenge board is server-backed, but the underlying economy and owned collection are browser-local and cannot provide strong anti-cheat guarantees. Real phone/browser layout QA is still needed; automated interaction checks use DOM emulation.

## Ownership and repository status

This is a private project. No open-source license has been chosen. The owner should choose a license before public distribution.

The existing Sites source repository remains the deployment origin. The connected GitHub account is `threebeat`; no repository-creation operation was available during this release. The intended private GitHub repository is `threebeat/camp-collector`, pending creation and code transfer. Do not claim that transfer is complete until the repository can be opened and its committed files are verified. The [development guide](docs/DEVELOPMENT.md#github-transfer) explains both connector upload and ordinary Git workflows.
