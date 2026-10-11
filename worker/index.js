import { challengeApi } from "./api.js";
// The build embeds web assets here; no runtime filesystem or remote assets are needed.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      try {
        if (env.DB)
          await env.DB.prepare(
            "SELECT id FROM challenge_offers LIMIT 1",
          ).first();
        return new Response(
          JSON.stringify({ status: "ok", version: 12, challenges: !!env.DB }),
          {
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          },
        );
      } catch {
        return new Response(JSON.stringify({ status: "storage-unavailable" }), {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }
    }
    if (url.pathname.startsWith("/api/challenges"))
      return challengeApi(request, env);
    if (!["GET", "HEAD"].includes(request.method))
      return new Response("Method not allowed", { status: 405 });
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = ASSETS[path];
    if (!asset) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : asset.body, {
      headers: {
        "content-type": asset.type,
        "cache-control": "no-cache",
        "x-content-type-options": "nosniff",
        "referrer-policy": "same-origin",
      },
    });
  },
};
