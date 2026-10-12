# Evernight

The sun never returned. Your company survives by the light it carries.

Evernight is a browser character collector and automatic squad battler for desktop and phone portrait screens. Build a home, equip lights, choose talents and subclasses, explore dangerous roads, and bring a memorable company back through the dark.

[Play the private game](https://camp-collector.johnmoore2048.chatgpt.site) · [Game checks](https://github.com/threebeat/Evernight/actions) · [Current rules](docs/CURRENT_GAME.md)

## Run it

Use Node.js 24 or newer:

```sh
git clone https://github.com/threebeat/Evernight.git
cd Evernight
npm ci
npm run dev
```

Open `http://127.0.0.1:4173`. The local adapter uses SQLite and a development identity; production credentials are unnecessary. Rebuild and restart after source changes.

```sh
npm run check
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

GitHub Actions runs model/artifact checks and desktop Chromium, Android Chromium and iPhone WebKit emulation on main pushes and pull requests. It retains the built Worker, browser reports and scene screenshots. See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for publishing and [QA.md](docs/QA.md) for observed results and limits.

## Evernight 0.3

- One retro game window holds the world, combat, services and menus. Desktop has a framed viewport; phones fill their available display. Fullscreen uses the browser API when available, with an expanded viewport fallback.
- The opening starts black, slowly reveals the bonfire, introduces three arrivals and the curse, then fades into Camp with a small camera pullback. Reduced motion keeps every step readable.
- A saved tutorial teaches map movement, tap-to-walk residents, character information and the Crossroads. Its first short expedition is required; Pantry and Journal lessons follow the completed journey.
- The Camp Journal replaces the notice board and separate Quest page. The Crossroads contains roads, party preparation, active companies and returned reports.
- Camp overview, construction, stock and secondary features open inside the game. Existing Camps enter directly; current saves and active checkpoints are retained.

Existing class trees, quests, global difficulty, twelve-hour meals, rewarded retirement, light equipment, guild standing, Arena wagers, monthly collections, Kitchen, Archaeology and the island remain playable.

Existing current-season v12 saves and active expeditions migrate without a reset. The Site keeps its original URL so browser-local progress remains accessible. Personal saves/economy remain browser-local; missed expedition time reconstructs at 1× when the page returns. Cross-device synchronization and an always-running expedition server are future work.

## Continue development

Read [CURRENT_GAME](docs/CURRENT_GAME.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTENT_GUIDE](docs/CONTENT_GUIDE.md), [VISION](docs/VISION.md), [DEVELOPMENT](docs/DEVELOPMENT.md), [RELEASE_NOTES](docs/RELEASE_NOTES.md), [CONTENT_REFERENCE](docs/CONTENT_REFERENCE.md) and the [handoff](docs/NEXT_AGENT_PROMPT.md). [SOURCE_TRANSFER](docs/SOURCE_TRANSFER.md) explains the preserved original history.

The owner-supplied GitHub repository is public; the game retains its owner-private audience. An open-source license and monetization model have not been selected.
