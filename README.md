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

## Evernight 0.6

- Camp is darker, with a baked stone hearth and firelit ground. Water ripples and waterfalls follow the painting; flames, scenery light and live character light flicker together.
- Construction and upgrades repaint only local environment pieces. Camp, camera, lighting and unrelated ground remain mounted. Bonfire shadows visibly start at characters’ feet and diffuse outward.
- A larger generated Camp background combines trees, coherent paths and baked building tiles. Five generated regional maps sit under interactive roads and quest markers.
- Fourteen persistent tutorial prompts use an explicit Continue, green when ready, and each pays three coins. The combined Fernbridge recovery/recruitment lesson supplies the five wood needed for the Pantry; the final Continue is immediately available.
- Crossroads opens on expedition status, then leads through fixed route and party planning screens with scrolling inside their panels.
- The camp menu holds the Journal, Build, Stock, Codex and Shop. Journal lists accepted/reached quests; Tavern NPCs offer new ones. Hero Info uses a desktop side panel and a full phone screen, with separate Attributes and Talents. Character memories and friendships are retired.
- The village contains Tavern, Guild lodge and Trading Post. Drag a hero to the Trading Post for compatible goods and personal equipment comparisons. The bartender hosts daily, monthly and player challenges; a separate northwest Arena becomes buildable at Camp level four.
- Bonfire class choices form a connected RPG skill tree. Non-combat encounters collect healing and loot automatically and remain visible for five seconds; expedition props stay under fog.

The empty-fire main menu, introduction, scripted first win/defeat, six-hero Guild gate, Tavern upgrades and retained camp/expedition systems remain.

Existing current-season v12 saves and active expeditions migrate without a reset. The Site keeps its original URL so browser-local progress remains accessible. Personal saves/economy remain browser-local; missed expedition time reconstructs at 1× when the page returns. Cross-device synchronization and an always-running expedition server are future work.

## Continue development

Read [CURRENT_GAME](docs/CURRENT_GAME.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTENT_GUIDE](docs/CONTENT_GUIDE.md), [VISION](docs/VISION.md), [DEVELOPMENT](docs/DEVELOPMENT.md), [RELEASE_NOTES](docs/RELEASE_NOTES.md), [CONTENT_REFERENCE](docs/CONTENT_REFERENCE.md) and the [handoff](docs/NEXT_AGENT_PROMPT.md). [SOURCE_TRANSFER](docs/SOURCE_TRANSFER.md) explains the preserved original history.

The owner-supplied GitHub repository is public; the game retains its owner-private audience. An open-source license and monetization model have not been selected.
