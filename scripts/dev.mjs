// Local development only. Hosted identity is supplied by Sites, never this adapter.
import { createServer } from "node:http";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
const root = resolve(new URL("..", import.meta.url).pathname);
await mkdir(resolve(root, ".local"), { recursive: true });
const database = new DatabaseSync(resolve(root, ".local/camp.sqlite"));
database.exec(
  "CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY)",
);
for (const name of (await readdir(resolve(root, "drizzle")))
  .filter((n) => n.endsWith(".sql"))
  .sort()) {
  if (
    database.prepare("SELECT name FROM local_migrations WHERE name=?").get(name)
  )
    continue;
  database.exec("BEGIN");
  try {
    database.exec(await readFile(resolve(root, "drizzle", name), "utf8"));
    database.prepare("INSERT INTO local_migrations(name) VALUES(?)").run(name);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
const DB = {
  prepare(sql) {
    const statement = database.prepare(sql);
    let args = [];
    const query = {
      bind(...values) {
        args = values;
        return query;
      },
      async first() {
        return statement.get(...args) || null;
      },
      async all() {
        return { results: statement.all(...args) };
      },
      async run() {
        const r = statement.run(...args);
        return { meta: { changes: r.changes } };
      },
    };
    return query;
  },
  async batch(queries) {
    database.exec("BEGIN");
    try {
      const out = [];
      for (const q of queries) out.push(await q.run());
      database.exec("COMMIT");
      return out;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  },
};
const { default: worker } = await import("../dist/server/index.js");
const port = Number(process.env.CAMP_DEV_PORT || 4173);
const server = createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers))
      if (value)
        headers.set(key, Array.isArray(value) ? value.join(",") : value);
    headers.set("oai-authenticated-user-id", "local-developer");
    const request = new Request("http://127.0.0.1:" + port + req.url, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : Buffer.concat(chunks),
    });
    const response = await worker.fetch(request, { DB });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(error.message);
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    "Local Camp: http://127.0.0.1:" +
      port +
      " — rebuild and restart after editing.",
  ),
);
const close = () =>
  server.close(() => {
    database.close();
    process.exit(0);
  });
process.on("SIGINT", close);
process.on("SIGTERM", close);
