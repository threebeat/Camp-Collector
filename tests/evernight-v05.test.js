import test from "node:test";
import assert from "node:assert/strict";
import { createCanvas } from "@napi-rs/canvas";
import { initialGame, generateHero } from "../web/data.js";
import { seeded } from "../web/engine.js";
import { ExpeditionSimulation } from "../web/simulation.js";
import { TOWN_NPCS, npcQuestOffers } from "../web/town-npcs.js";
import { createEvernightUi } from "../web/evernight-ui.js";
import {
  CAMP_ANCHORS,
  CAMP_WORLD,
  revealedCampAreas,
} from "../web/camp-world.js";
import { paintGroundShadow } from "../web/scene-lighting.js";
const now = Date.UTC(2026, 9, 12, 12);
function established() {
  const g = initialGame(seeded(16), now);
  g.campNamed = true;
  g.storyPage = 3;
  g.buildings.tavern = 1;
  g.gold = 2000;
  g.materials.wood = g.materials.stone = 100;
  return new ExpeditionSimulation(g, now);
}
test("NPC offers require a visit, preserve accepted objectives and leave unaccepted quests out of Journal", () => {
  const sim = established(),
    g = sim.g,
    npc = TOWN_NPCS[0],
    q = npcQuestOffers(g, npc.id)[0];
  assert.ok(q);
  const ui = createEvernightUi({
    getGame: () => g,
    esc: (s) => s,
    button: (s, a) => `<button ${a}>${s}</button>`,
  });
  assert.ok(!ui.questsView().includes(`data-quest="${q.id}"`));
  assert.equal(
    sim.action("acceptNpcQuest", { npc: "missing", id: q.id }, now).ok,
    false,
  );
  assert.ok(sim.action("acceptNpcQuest", { npc: npc.id, id: q.id }, now).ok);
  assert.equal(
    sim.action("acceptNpcQuest", { npc: npc.id, id: q.id }, now).ok,
    false,
  );
  assert.ok(ui.questsView().includes(`data-quest="${q.id}"`));
  assert.equal(g.trackedQuest, q.id);
  const accepted = g.questContracts.find((v) => v.id === q.id);
  sim.advance(now + 86400000, Infinity);
  if (accepted)
    assert.equal(
      g.questContracts.find((v) => v.id === q.id).targetWins,
      accepted.targetWins,
    );
  const inside = TOWN_NPCS.find((n) => n.map === "tavern"),
    offer = npcQuestOffers(g, inside.id)[0];
  assert.equal(
    sim.action("acceptNpcQuest", { npc: inside.id, id: offer.id }, g.lastClock)
      .ok,
    false,
  );
});
test("Trading Post sells compatible equipment at Camp, and Arena requires its late construction", () => {
  const sim = established(),
    g = sim.g,
    item = g.market.forge.find((o) => o.kind === "item"),
    gold = g.gold;
  assert.equal(g.buildings.tradingpost, 1);
  assert.ok(
    sim.action(
      "dropResident",
      { id: g.roster[0].id, building: "tradingpost" },
      now,
    ).ok,
  );
  assert.ok(sim.action("buy", { offerId: item.id }, now).ok);
  assert.equal(g.gold, gold - item.gold);
  assert.ok(g.inventory.some((i) => i.id === item.item.id));
  assert.equal(sim.action("navigate", { screen: "arena" }, now).ok, false);
  assert.equal(sim.action("construct", { key: "arena" }, now).ok, false);
  const [x, y] = CAMP_ANCHORS.arena;
  assert.ok(
    !revealedCampAreas(g).some((a) => Math.hypot(a.x - x, a.y - y) < a.r),
  );
  g.campXp = 600;
  assert.ok(sim.action("construct", { key: "arena" }, now).ok);
  assert.ok(sim.action("navigate", { screen: "arena" }, now).ok);
});
test("world migration translates placed residents and props exactly once while preserving identities", () => {
  const g = initialGame(seeded(13), now),
    id = g.roster[0].id;
  g.campNamed = true;
  g.campWorldRevision = 1;
  g.mapPositions.camp[id] = { x: 50, y: 50 };
  g.campProps = [{ id: "custom", kind: "crate", x: 900, y: 750 }];
  const sim = new ExpeditionSimulation(g, now),
    p = sim.g.mapPositions.camp[id];
  assert.equal((p.x * CAMP_WORLD.width) / 100, 1700);
  assert.equal((p.y * CAMP_WORLD.height) / 100, 1150);
  assert.deepEqual(sim.g.campProps[0], {
    id: "custom",
    kind: "crate",
    x: 1700,
    y: 1200,
  });
  const restored = new ExpeditionSimulation(sim.snapshot().game, now);
  assert.deepEqual(restored.g.mapPositions, sim.g.mapPositions);
  assert.deepEqual(restored.g.campProps, sim.g.campProps);
});
test("ground shadows diffuse into transparency at their far end", () => {
  const canvas = createCanvas(300, 120),
    ctx = canvas.getContext("2d");
  paintGroundShadow(
    ctx,
    { x: 20, y: 60, r: 300 },
    { id: "hero", x: 100, y: 60, r: 12 },
  );
  const alpha = (x) => ctx.getImageData(x, 60, 1, 1).data[3];
  assert.ok(alpha(105) > alpha(125));
  assert.ok(alpha(125) > alpha(137));
  assert.ok(alpha(150) < 3);
  assert.equal(alpha(50), 0);
});
