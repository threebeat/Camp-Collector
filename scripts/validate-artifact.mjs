import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");

const [source, manifest] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
JSON.parse(manifest);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

console.log("Artifact is valid ESM and exports default.fetch");
const hosting = JSON.parse(manifest);
assert.equal(hosting.d1, "DB");
assert.equal(hosting.r2, null);
assert.ok(!hosting.static);
const app = workerModule.default;
const home = await app.fetch(new Request("https://camp.test/"), {}, {});
assert.equal(home.status, 200);
const html = await home.text();
assert.ok(html.includes('id="brand-name"'));
assert.ok(html.includes("app.js?v=19"));
assert.ok(!html.includes("Little Legends"));
assert.ok(html.includes("homestead.css?v=19"));
assert.ok(html.includes("game-shell.css?v=19"));
assert.ok(html.includes('id="game-window"'));
assert.equal(
  (await app.fetch(new Request("https://camp.test/homestead.css?v=19"), {}, {}))
    .status,
  200,
);
for (const path of [
  "app.js",
  "map-assets.js",
  "tavern.js",
  "game-shell.js",
  "onboarding.js",
  "evernight.js",
  "evernight-ui.js",
  "lighting.js",
  "nightfall.js",
  "nightfall-ui.js",
  "landmarks.js",
  "chatter.js",
  "saves.js",
  "weapons.js",
  "modifiers.js",
  "data.js",
  "engine.js",
  "progression.js",
  "simulation.js",
  "expedition-worker.js",
  "camp.js",
  "world.js",
  "journeys.js",
  "map-interaction.js",
  "renderer.js",
  "pixel-art.js",
  "pixel-markup.js",
  "pixel-lighting.js",
  "scene-lighting.js",
  "battle-interaction.js",
  "camera.js",
  "camp-world.js",
  "homestead-ui.js",
  "art.js",
  "codex.js",
  "client.js",
]) {
  const asset = await app.fetch(
    new Request("https://camp.test/" + path + "?v=19"),
    {},
    {},
  );
  assert.equal(asset.status, 200, path);
  assert.ok(
    asset.headers.get("content-type").includes("application/javascript"),
  );
  assert.ok((await asset.text()).length > 0);
}
assert.deepEqual(
  await (
    await app.fetch(
      new Request("https://camp.test/api/health"),
      { DB: { prepare: () => ({ first: async () => null }) } },
      {},
    )
  ).json(),
  { status: "ok", version: 12, challenges: true },
);
assert.equal(
  (await app.fetch(new Request("https://camp.test/missing-file.js"), {}, {}))
    .status,
  404,
);
assert.equal(
  (await app.fetch(new Request("https://camp.test/api/challenges"), {}, {}))
    .status,
  401,
);
console.log(
  "Embedded page, module graph, route responses, challenge auth, and storage manifest verified.",
);

const nightCss = await app.fetch(
  new Request("https://camp.test/nightfall.css?v=19"),
  {},
  {},
);
assert.equal(nightCss.status, 200);
assert.ok((await nightCss.text()).includes("data-allegiance"));

const pixels = await app.fetch(
  new Request("https://camp.test/pixel.css?v=19"),
  {},
  {},
);
assert.equal(pixels.status, 200);
assert.ok((await pixels.text()).includes(".battle-inspection"));

for (const asset of [
  "camp",
  "tavern",
  ...["forest", "jungle", "village", "volcano", "ruins"].map(
    (k) => "expedition-" + k,
  ),
  "building-tavern",
  "building-tent",
]) {
  const result = await app.fetch(
    new Request("https://camp.test/map-" + asset + ".svg?v=19"),
    {},
    {},
  );
  assert.equal(result.status, 200);
  assert.match(await result.text(), /data:image\/png;base64,/);
}
console.log("Pre-rendered map and building assets verified.");

for (const asset of [
  "camp",
  ...["greenway", "marsh", "volcano", "cinder", "jungle"].map(
    (k) => "route-" + k,
  ),
]) {
  const result = await app.fetch(
    new Request("https://camp.test/map-" + asset + "-v05.svg?v=19"),
    {},
    {},
  );
  assert.equal(result.status, 200);
  assert.match(await result.text(), /data:image\/webp;base64,/);
}
console.log("Generated Camp and five regional terrain assets verified.");
