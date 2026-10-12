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

## Evernight 0.4

- Every visit begins at an empty bonfire main menu. Continue fades into the saved Camp; Start New Game preserves the introduction and asks before replacing existing progress.
- A contextual technical bar exposes Camp’s Journal, Build, Stock, Codex, Trials and Shop directly. The menu exposes only fullscreen, including an available-viewport fallback.
- Original pre-rendered pixel environments and building tiles bake static scenery, light and shadows. Live characters, movable Camp props and carried/spell lights render above them; ground shadows stay below their casters.
- Drag a hero onto a building to open that hero’s service. The old Walk action is removed. The starting Camp has its fire, Crossroads, tent and a cheap Pantry construction site.
- The Last Lantern Tavern fills the window with wandering recruitable heroes and a consumables bar. Two upgrades unlock Rare then Legendary travelers and more supplies. The neighboring Guild lodge requires six owned heroes.
- The saved tutorial guarantees a clearing victory, then a Fernbridge defeat, explains quests and loss/recovery, offers any common first recruit free, and teaches Pantry construction for five gold. Completing Fernbridge becomes the next goal.
- Expedition combat fills the available game area, with play controls below and Camp access above. Overscan scenery extends beyond the camera. Generated enemy HP is 15% lower; player stats are unchanged.

Existing class trees, quests, global difficulty, twelve-hour meals, rewarded retirement, light equipment, guild standing, Arena wagers, monthly collections, Kitchen, Archaeology and the island remain playable.

Existing current-season v12 saves and active expeditions migrate without a reset. The Site keeps its original URL so browser-local progress remains accessible. Personal saves/economy remain browser-local; missed expedition time reconstructs at 1× when the page returns. Cross-device synchronization and an always-running expedition server are future work.

## Continue development

Read [CURRENT_GAME](docs/CURRENT_GAME.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTENT_GUIDE](docs/CONTENT_GUIDE.md), [VISION](docs/VISION.md), [DEVELOPMENT](docs/DEVELOPMENT.md), [RELEASE_NOTES](docs/RELEASE_NOTES.md), [CONTENT_REFERENCE](docs/CONTENT_REFERENCE.md) and the [handoff](docs/NEXT_AGENT_PROMPT.md). [SOURCE_TRANSFER](docs/SOURCE_TRANSFER.md) explains the preserved original history.

The owner-supplied GitHub repository is public; the game retains its owner-private audience. An open-source license and monetization model have not been selected.
