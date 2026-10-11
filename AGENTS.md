# Evernight maintenance

Read README.md and docs/CURRENT_GAME.md, ARCHITECTURE.md, CONTENT_GUIDE.md, VISION.md, DEVELOPMENT.md, RELEASE_NOTES.md and QA.md before broad changes. Follow the owner's current direction, and keep desktop and phone usability central.

Preserve current saves and active checkpoints. The save schema/season/key is intentionally retained at v12 for the 0.14 release. Do not add another reset without an explicit new owner instruction. Preserve the bound private Site and its source origin. SQL migrations are append-only. Never commit credentials, real saves or runtime state.

Use Node 24+, npm ci and npm run check. Run supported Playwright checks for changes to UI behavior and record physical-device limits. Keep model mutations behind the simulation boundary and compatibility consistent with server snapshots. Keep canonical content and the generated reference current. See docs/NEXT_AGENT_PROMPT.md for remaining product and architecture work.
