import { readFile, readdir, mkdir, rm, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = resolve(root, "web"),
  out = resolve(root, "dist");
const assets = {};
for (const name of (await readdir(source)).sort()) {
  const extension = name.split(".").at(-1);
  const type = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    svg: "image/svg+xml",
  }[extension];
  if (!type) continue;
  assets["/" + name] = {
    type: type + "; charset=utf-8",
    body: await readFile(resolve(source, name), "utf8"),
  };
}
await rm(out, { recursive: true, force: true });
await mkdir(resolve(out, "server"), { recursive: true });
await mkdir(resolve(out, ".openai"), { recursive: true });
// Resolve the real module graph, including imports shared with browser combat.
await build({
  entryPoints: [resolve(root, "worker/index.js")],
  outfile: resolve(out, "server/index.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  legalComments: "none",
  banner: { js: "const ASSETS = " + JSON.stringify(assets) + ";" },
});
await cp(
  resolve(root, ".openai/hosting.json"),
  resolve(out, ".openai/hosting.json"),
);
console.log(
  "Built ESM Worker with " +
    Object.keys(assets).length +
    " embedded web assets.",
);
