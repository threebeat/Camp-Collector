# Development and publishing

## Local workflow

Clone `https://github.com/threebeat/Camp-Collector.git`, use Node.js 24+, and run `npm ci`. Development dependencies are pinned: native canvas for art/test rendering, esbuild for the Worker, Playwright for browser checks and Prettier for readable source.

`npm run dev` builds and serves at `http://127.0.0.1:4173`. The local adapter applies SQL migrations once to `.local/camp.sqlite` and supplies the development board identity `local-developer`. It is not production authentication. Set `CAMP_DEV_PORT` to change the port; rebuild and restart after editing. Stop with Ctrl+C.

Personal Camps are stored in that browser/origin, separately from SQLite challenge data. No `.env` values or production tokens are needed for local checks. In a managed Sites agent environment, obey its supported preview/browser workflow; CI browser testing does not require starting a local preview in that environment.

## Checks and pipelines

```sh
npm run check
node scripts/generate-content-reference.mjs
node scripts/art-contact-sheet.mjs
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

The `Game checks` workflow runs on main pushes, pull requests and manual dispatch. Independent jobs cover model/integration tests plus built-artifact validation, and desktop/Android/iPhone browser scenarios. Concurrent updates cancel older runs. Jobs have time limits, read-only repository permissions, a locked dependency install and 14-day artifact retention.

| Check | Evidence |
| --- | --- |
| 142 Node tests | Combat, service costs/restrictions, worker transport, save/checkpoint migration, UI command flows and challenge transactions |
| Build + validation | The actual bundled ESM Worker serves embedded assets, routes and the expected auth/storage contract |
| Playwright | Desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit emulation; live Worker transport, naming, memory/reload, class/race sheets, districts, professions, quests, comparisons, clinic, storage, upgrades, crafting, lakeshore and reduced motion |
| Screenshots/report | Every browser project saves scene snapshots; failures retain screenshots, DOM context and traces in `browser-report` |
| Native art sheets | SVG validity and consistent shared equipment/race/map artwork; these do not prove browser layout |

Real physical-device testing, hosted multi-account behavior and long-term retention/balance remain separate work. See [QA.md](QA.md).

## Implementation boundaries

Dispatch changes through `web/simulation.js`; do not mutate view snapshots. Night-world services and sheets live in `nightfall.js` / `nightfall-ui.js`. Canonical definitions still live in the existing content modules. Compatibility must agree across storage choices, equipping, crafting, loot, art, saved records and `worker/api.js` challenge sanitization.

`scripts/build.mjs` uses esbuild to resolve the Worker module graph and embeds native browser modules/CSS into the asset map. `dist/` is generated and ignored. The `camp-collector-worker` CI artifact contains the built Worker, manifest and append-only database migration files. CI does not itself change the production Site.

Asset queries use `?v=13`; save version/key remain 12. Changing asset cache URLs never authorizes deleting progress. The current version-12 season is `camp-fresh-2026-10-11` and the key is `camp-collector-v12`. Version 0.13 adds backward-compatible fields and an empty Boots slot. Existing paid Outfitter construction becomes the Equipment Workshop.

## Production deployment

The existing owner-private Site is bound by `.openai/hosting.json`, project `appgprj_6ac836008248819185e27fe6a5051fd1`, with `DB` D1 and no R2. Its URL is `https://camp-collector.johnmoore2048.chatgpt.site`. Preserve that audience, project and configured source origin unless the owner directs a change.

In a Sites-enabled session, use the existing-source helper to open the checkout, run the remaining ordered checks/builds, and commit/push/package the exact source. Deploy the returned commit/archive with the matching private operation. Retain saved/deployment IDs, and poll only while nonterminal. Never expose a short-lived source credential. A project ID is a binding, not a token.

GitHub Actions automatically verifies and packages every change. Production publication remains an authenticated Sites operation; no fake automatic deployment or unconfigured secret-dependent workflow is presented as working. The two repositories retain matching source snapshots, although their import/commit history SHAs differ. Do not replace the Sites origin with GitHub merely to align them.

Deploying elsewhere requires an equivalent trusted identity boundary, D1-compatible database binding and migrations. `npm run build` alone does not deploy or provide authentication.

## Recovery, migrations and releases

`archives/v12-source-history.bundle` preserves the original history. See [SOURCE_TRANSFER.md](SOURCE_TRANSFER.md) for ordinary Git recovery. GitHub contains the current complete source; dependencies, runtime state, production credentials and real player saves are excluded.

The old v12 reset was explicitly authorized at that time. `drizzle/0001_fresh_camps.sql` is already applied to the existing Site and must not be edited/reused as a new wipe. All SQL migrations are append-only. Version 0.13 introduces no database migration and no reset. Code rollback does not undo a destructive database migration.

Preserve IDs, names, favorites, journals, bonds, belongings, claims and active-party checkpoints. Use focused tests for genuine behavior changes. Record observed browser results separately from assumed physical-device behavior. Before release, update current-game rules, release notes, generated reference and the next-agent handoff.
