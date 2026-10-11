# Development and handoff

## Files and setup

Clone the source or unpack the source ZIP, then use Node.js 24+ and `npm ci`. This installs only the native canvas development dependency; the game does not load it in a player's browser. The lockfile is committed. No `.env` values or production credentials are needed for local tests.

```bash
npm run dev
```

The local Node adapter builds then serves `dist/server/index.js` at `http://127.0.0.1:4173`. Set `CAMP_DEV_PORT` to use another port. It automatically applies numbered SQL migrations once to `.local/camp.sqlite` and provides a SQLite-backed D1-compatible adapter. It injects the identity `local-developer` so the challenge board works locally. This is **local development**, not a production authentication implementation. Rebuild/restart after changing files. Stop with Ctrl+C.

The browser's personal Camp save is separate from the board database. A second browser profile/origin creates another local Camp; the default adapter still represents one board identity. Use unit/integration tests for multiple-account races. A real multi-account manual test requires hosted identity or a deliberately configured development identity flow.

`node scripts/dev.mjs` assumes the build already exists. `node --check scripts/dev.mjs` checks syntax without starting a server. In a managed Sites execution environment, use its prescribed preview/browser workflow; do not improvise a new preview server when that environment disallows it.

## Checks

```bash
npm test
npm run build
npm run validate
node scripts/art-contact-sheet.mjs
node scripts/generate-content-reference.mjs
```

| Check | What it proves | What it does not prove |
| --- | --- | --- |
| Node test suite | Model rules, caps/costs, serialization, real worker transport, DOM interactions, SQLite challenge transactions and reset behavior | Real browser layout, phone ergonomics or long-term balance |
| Build | The current source becomes an embedded Worker artifact | Live database health or deployment completion |
| Artifact validation | The actual built Worker imports and serves its assets/API routes with expected bindings/auth | End-to-end hosted user behavior |
| Native asset sheets | SVG assets load and can be inspected together | CSS animation timing or responsive layouts |
| Content reference generation | Current definitions become searchable tables | The definitions are balanced or every prose claim is mechanically correct |

The connected-interface test uses a small DOM emulator and native canvas. It exercises real application commands and service flows, but has no browser layout engine. Output images are under the OS temp directory. The art script writes ignored `artifacts/` by default. GitHub Actions uses Node 24 and runs tests/build/validation on pushes and pull requests.

For manual QA, prioritize a fresh phone portrait Camp, naming, selection/deselection, service sheets, touch drag/drop, Market filters, Crossroads fitted/zoomed map, route/difficulty comparison, party supplies, battle countdown/AUTO/results, ability explanations and background/reload behavior. Include reduced motion, slow connections and a full roster.

## Source and content edits

Keep mutable gameplay state in simulation/model commands rather than directly modifying the view snapshot. `web/app.js` should dispatch actions and render responses. Content definitions often have overlays later in `data.js`; inspect the final exported object, not only its first literal. Update canonical restrictions and challenge sanitization when adding new equipment, modifiers or identity flags.

The cache query currently uses `?v=12` throughout the ES module graph. Change it coherently if a release needs new asset URLs. The save `version` and `season` are separate concepts: an ordinary release should migrate current player records, not erase them merely because the asset version changes.

`scripts/build.mjs` is a narrow import-stripping concatenation build for known backend modules. Keep it valid or replace it deliberately with a more robust approach; do not assume newly imported backend files are included automatically. Do not edit generated `dist/` as source.

## Hosted publishing

The existing project is identified in `.openai/hosting.json`: `appgprj_6ac836008248819185e27fe6a5051fd1`. Its private URL is [camp-collector.johnmoore2048.chatgpt.site](https://camp-collector.johnmoore2048.chatgpt.site), with `DB` D1 and no R2 binding. Preserve the site, source origin and audience unless the owner asks to change them. The local checkout directory's historical name is not the current brand.

In a Sites-enabled agent session, read the Sites skill, open the existing source using its helper, build/test/validate, push the exact source state through the source/package helper, and publish that verified commit/archive using the matching audience operation. Retain deployment IDs on nonterminal responses and check until success or a reported failure. Never expose or commit a short-lived source credential, private access bypass token or account secret. `.openai/hosting.json` contains a project binding, not an authentication token.

Running `npm run build` locally does not deploy anything. Running the game on another hosting provider would require an intentional equivalent of the authenticated identity boundary, database binding and migrations; the present docs do not claim a one-command production deployment elsewhere.

## GitHub transfer

At this release the connected account is `threebeat`, but the connector can write only to an **existing accessible repository**; it exposes no repository-creation operation. `threebeat/camp-collector` was not accessible/found during preparation. No GitHub repository or upload should be reported as completed until verified.

For connector transfer, the owner can create a private repository named `camp-collector`, initialize it with a README, and allow the connected app access to it. A later agent can obtain its current branch/tree, upload all tracked source/docs/configuration files as a tree/commit, advance the branch and verify representative files and checks. The prepared source ZIP contains the complete current snapshot. A Git bundle additionally preserves source history for Git workflows. Do not upload `node_modules`, `dist`, `.local`, real saves, `.env`, credentials or ephemeral tool state.

For ordinary Git, an **empty** private repository is simplest. In an existing checkout:

```bash
git remote add github https://github.com/threebeat/camp-collector.git
git push github main
```

Authenticate through GitHub's normal credential flow. Keep the existing Sites remote as the deployment origin. Do not force-push over an initialized/nonempty repository: fetch it and intentionally merge/import, or use a new branch/PR. The owner may choose a different repository name; update links/status after transfer.

To reconstruct the supplied Git bundle without an AI agent:

```bash
git clone camp-collector-history.bundle camp-collector
cd camp-collector
git remote rename origin archive
git remote add github https://github.com/threebeat/camp-collector.git
npm ci
npm test
```

Then push to the chosen empty target or merge an initialized target deliberately. The ZIP also works without history: unzip, `npm ci`, `npm run dev`. Neither archive includes a Git credential. No open-source license is selected; keep the repository private until the owner decides otherwise.

## Reset procedure and rollback implications

Version 12 is an explicitly requested destructive fresh-season release. Its browser key is `camp-collector-v12`, season `camp-fresh-2026-10-11`. The client removes known earlier keys, validation rejects prior versions/seasons, and imported old backups cannot reverse the reset. Active old parties, collections, Camp construction and currency therefore do not carry forward.

`drizzle/0001_fresh_camps.sql` drops/recreates the three shared challenge tables, clearing offers, matches and payouts. The migration journal appends it; `0000_challenges.sql` remains immutable. Test data demonstrates the migration removes old rows and leaves usable tables. Sites applies committed migrations before the new Worker is uploaded. Old clients' board requests get a season-mismatch response and must reload.

This reset does not delete code history, account identities or hosting credentials. Personal progress was browser-local, so its old data is removed/rejected when that browser loads the new client; there is no central personal-account save table to clear. A previously closed browser will reset when it returns. The database wipe is not undone by merely rolling back code. Never add another wipe, change this season or reuse this destructive migration without a new explicit owner instruction.

Future save changes should preserve IDs, names, favorites, equipment, journals, bonds, earned rewards and active-party checkpoints, or define a reviewed migration explaining each intentional change. Keep database migrations append-only. Tests should check real old→new data transitions when migration is supported.
