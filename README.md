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

## Evernight 0.2

- A larger, camera-controlled Camp opens gradually from a small firelit clearing. Paths, textured forest and a southern lake connect the grounds; clear shadowed plots instead of navigating expansion arrows.
- Drag or pinch maps, use arrow keys and zoom controls, then Focus to return home. Combat Focus tracks the party and smoothly widens or tightens its frame as characters spread out or regroup. Manual movement switches to free view.
- Cached sprites and lighting, lightweight visual snapshots and interpolated movement reduce repeated work. Rendering follows animation frames; combat still uses deterministic fixed steps.
- The bonfire has a stronger, flickering light with embers. Buildings and equipped residents cast shadows. Heroes have no innate light.
- Build a four-vendor Camp Market at Camp level 2. Guild, recruiting, clinic, equipment, creation and Quest services now belong to Camp. The tent upgrades into a cabin in place; further upgrades add twenty spaces each.
- Phone Camp details collapse, navigation has five primary controls with Shop/Codex under More, and Crossroads/party assembly never open character inspectors automatically.

Existing class trees, quests, global difficulty, twelve-hour meals, rewarded retirement, light equipment, guild standing, Arena wagers, monthly collections, Kitchen, Archaeology and the island remain playable.

Existing current-season v12 saves and active expeditions migrate without a reset. The Site keeps its original URL so browser-local progress remains accessible. Personal saves/economy remain browser-local; missed expedition time reconstructs at 1× when the page returns. Cross-device synchronization and an always-running expedition server are future work.

## Continue development

Read [CURRENT_GAME](docs/CURRENT_GAME.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTENT_GUIDE](docs/CONTENT_GUIDE.md), [VISION](docs/VISION.md), [DEVELOPMENT](docs/DEVELOPMENT.md), [RELEASE_NOTES](docs/RELEASE_NOTES.md), [CONTENT_REFERENCE](docs/CONTENT_REFERENCE.md) and the [handoff](docs/NEXT_AGENT_PROMPT.md). [SOURCE_TRANSFER](docs/SOURCE_TRANSFER.md) explains the preserved original history.

The owner-supplied GitHub repository is public; the game retains its owner-private audience. An open-source license and monetization model have not been selected.
