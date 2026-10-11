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

## Version 0.14

- Dark screens, carried lights, real terrain shadows and remembered fog of war. Underground races, Vampire/Werewolf Attributes and learned Night vision have meaningful sight advantages.
- A required three-page opening and an optional navigation guide with Skip and settings. Camp stays clean, with Build below its name.
- Camp level/XP, four overview metrics, a full resource list, forty starting adventurer spaces and food consumption every twelve hours.
- Unified retirement returns belongings and pays a reward that grows with level. Bonfire handles classes and world difficulty; the Workshop handles armor/companion transformation.
- Eight guild booths with lessons, quests, standing and exclusive discounted equipment; separate Commons, Tavern and Arena maps.
- A dedicated Quest journal with search, filters, sorting and pins. Boss Sigils open a freely chosen region through the Portal Mage.
- Gold/resource Arena wagers and four changing rules, a monthly Daily Battle calendar, and twelve themed Shop collections.
- Richer, consolidated Codex entries and talent → subclass → talent → subclass → talent class progression.

Existing current-season v12 saves and active expeditions migrate without a reset. The Site keeps its original URL so browser-local progress remains accessible. Personal saves/economy remain browser-local; missed expedition time reconstructs at 1× when the page returns. Cross-device synchronization and an always-running expedition server are future work.

## Continue development

Read [CURRENT_GAME](docs/CURRENT_GAME.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [CONTENT_GUIDE](docs/CONTENT_GUIDE.md), [VISION](docs/VISION.md), [DEVELOPMENT](docs/DEVELOPMENT.md), [RELEASE_NOTES](docs/RELEASE_NOTES.md), [CONTENT_REFERENCE](docs/CONTENT_REFERENCE.md) and the [handoff](docs/NEXT_AGENT_PROMPT.md). [SOURCE_TRANSFER](docs/SOURCE_TRANSFER.md) explains the preserved original history.

The owner-supplied GitHub repository is public; the game retains its owner-private audience. An open-source license and monetization model have not been selected.
