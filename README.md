# Camp Collector

The sun never returned. Campfires keep a small company alive, and something beyond the lanterns keeps collecting names.

Camp Collector is a browser character collector and automatic squad battler, designed for desktop and phone portrait screens. Build a home, recruit distinctive adventurers, choose their equipment and callings, and bring them back through the dark.

[Play the private game](https://camp-collector.johnmoore2048.chatgpt.site) · [Game checks](https://github.com/threebeat/Camp-Collector/actions) · [Current rules](docs/CURRENT_GAME.md)

## Run it

Use Node.js 24 or newer:

```sh
git clone https://github.com/threebeat/Camp-Collector.git
cd Camp-Collector
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. Local development uses SQLite and a local test identity; no production credentials are required. Stop with Ctrl+C. Rebuild and restart after source edits.

```sh
npm run check
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

The browser suite covers desktop Chromium, Android Chromium and iPhone WebKit emulation. GitHub Actions runs both pipelines on main pushes and pull requests, and retains the built Worker and browser reports. See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for environment details and [QA.md](docs/QA.md) for verification limits.

## Version 0.13

- Permanent-night Camp and Market scenes with warm parchment service sheets.
- Detailed tent profiles: companions, friends, memories and growth. Click a class or race for its real foundations, slots and calling tree.
- Guildhall professions I–III, wandering recruits, scripted NPC stories and red-marked challengers.
- Four armor slots, comparison sheets, storage-to-character equipping and compatible-item notification dots.
- Pantry-to-Kitchen upgrades, ingredient dishes, an Equipment Workshop and a Market Outfitter/Attribute clinic.
- One main quest and two starter side quests, plus accepted daily patrol contracts.
- A south lakeshore, Legendary and occasional authored Mythical arrivals, and a playable 25-floor island descent.

This release migrates existing v12 Camps without resetting progress. Personal saves and economy are still browser-local; the Worker handles open-page progression and reconstructs missed time at 1×. Cross-device saves and authoritative competitive ownership remain future work.

## Continue development

Read [CURRENT_GAME](docs/CURRENT_GAME.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTENT_GUIDE](docs/CONTENT_GUIDE.md), [VISION](docs/VISION.md), [DEVELOPMENT](docs/DEVELOPMENT.md), [RELEASE_NOTES](docs/RELEASE_NOTES.md) and the generated [CONTENT_REFERENCE](docs/CONTENT_REFERENCE.md). The updated [next-agent handoff](docs/NEXT_AGENT_PROMPT.md) lists decisions and remaining work.

[Source recovery](docs/SOURCE_TRANSFER.md) explains the preserved v12 Git history. The existing private Site identity and append-only database migrations are retained. Source is public in the owner-supplied repository; the game remains private. An open-source license has not been selected.
