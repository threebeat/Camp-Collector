import { test, expect } from "@playwright/test";
import { initialGame, makeItem, makeFacet, stats } from "../../web/data.js";
import { seeded } from "../../web/engine.js";
import { addGems } from "../../web/camp.js";
const KEY = "camp-collector-v12",
  modal = (p) => p.locator("#modal");
async function start(page, funded = true, prepare = () => {}) {
  const g = initialGame(seeded(197), Date.now());
  if (funded) {
    g.campNamed = true;
    g.storyPage = 3;
    g.campName = "Last Light";
    g.gold = 10000;
    g.food = 120;
    g.campXp = 600;
    addGems(g, 100);
    for (const k in g.materials) g.materials[k] = 250;
    g.campExpansions = ["west", "east", "south"];
    for (const k of [
      "market",
      "guildhall",
      "tavern",
      "clinic",
      "armory",
      "blacksmith",
      "training",
      "alchemist",
    ])
      g.buildings[k] = 1;
    g.roster[0].level = 20;
    g.roster[0].attributes.push(makeFacet("Cursed"));
    g.roster[0].currentHp = stats(g.roster[0]).hp;
    g.inventory.push(makeItem("ironblade", 30), makeItem("heavy-boots", 30));
  }
  prepare(g);
  await page.addInitScript(
    ({ key, save }) => {
      if (!sessionStorage.getItem("qa-seeded")) {
        localStorage.setItem(key, JSON.stringify(save));
        sessionStorage.setItem("qa-seeded", "yes");
      }
    },
    { key: KEY, save: g },
  );
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.locator(g.campNamed ? ".map-viewport" : "#opening-scene"),
  ).toBeVisible();
  return { g, errors };
}
async function close(page) {
  if (await modal(page).isVisible()) {
    try {
      await modal(page)
        .locator("[data-close]:visible")
        .first()
        .click({ timeout: 1500 });
    } catch (error) {
      if (await modal(page).isVisible()) throw error;
    }
  }
  await expect(modal(page)).not.toBeVisible();
}
async function nav(page, key) {
  await close(page);
  if (key === "camp") {
    if (await page.locator("#game-home").isVisible())
      await page.locator("#game-home").click();
    return;
  }
  if (key === "quests") {
    await nav(page, "camp");
    await building(page, "questboard");
    return;
  }
  if (key === "expeditions") {
    await nav(page, "camp");
    await building(page, "crossroads");
    await page.locator('[data-crossroads-tab="companies"]').click();
    return;
  }
  await page.locator("[data-more-menu]").click();
  await modal(page).locator(`[data-nav="${key}"]`).click();
}
async function building(page, key) {
  await close(page);
  await page.locator("[data-world-fit]").first().click();
  await page.locator(`[data-building="${key}"]`).first().click();
}
async function market(page) {
  await page.locator("[data-world-fit]").first().click();
  await page.locator("[data-market-visit]").click();
  await modal(page).locator("#confirm-market-visit").click();
  await expect(page.locator(".market-map")).toBeVisible();
}
async function fits(page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 2,
      ),
    )
    .toBe(true);
}
async function shot(page, name) {
  await page.screenshot({
    path: test.info().outputPath(name + ".png"),
    fullPage: true,
  });
}
async function campDetails(page) {
  const d = page.locator(".camp-overview");
  if (!(await d.evaluate((e) => e.open)))
    await d.locator("summary").first().click();
}

test("opening, compact Camp, memory and reload preserve the company", async ({
  page,
}) => {
  const { g, errors } = await start(page, false);
  await expect(page.locator("#opening-scene")).toBeVisible();
  await expect(page.locator("#opening-continue")).toBeEnabled();
  await expect(page.locator("#opening-scene")).toContainText(
    "Stay near the flame",
  );
  await page.locator("#opening-continue").click();
  await expect(page.locator("#opening-scene")).toContainText(
    "Three adventurers",
  );
  await page.locator("#opening-continue").click();
  await page.locator("#opening-camp-name").fill("Ember House");
  await page.locator("#opening-continue").click();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "pan",
  );
  await expect(page.locator("#opening-scene")).not.toBeVisible();
  await expect(page.locator("#main-nav button")).toHaveCount(1);
  await expect(page.locator("#food-count")).toHaveCount(0);
  await fits(page);
  await page.waitForTimeout(2500);
  await shot(page, "camp");
  await building(page, "tent");
  await modal(page).locator(`[data-profile="${g.roster[0].id}"]`).click();
  await modal(page)
    .locator("#memory-text")
    .fill("The first fire held through the night.");
  await modal(page).locator("[data-memory]").click();
  await expect(modal(page)).toContainText(
    "The first fire held through the night.",
  );
  await close(page);
  await page.reload();
  await building(page, "tent");
  await modal(page).locator(`[data-profile="${g.roster[0].id}"]`).click();
  await expect(modal(page)).toContainText(
    "The first fire held through the night.",
  );
  expect(errors).toEqual([]);
});
test("Camp camera pans in both axes, arrow keys and zoom work, and shadow plots replace expansion arrows", async ({
  page,
}) => {
  const { errors } = await start(page);
  const view = page.locator('[data-map-camera="camp"]'),
    world = page.locator(".map-world");
  const before = await world.getAttribute("style");
  await view.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  const box = await view.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(view).toHaveAttribute("data-camera-mode", "free");
  await expect.poll(() => world.getAttribute("style")).not.toBe(before);
  await expect(modal(page)).not.toBeVisible();
  await view.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.locator('[data-world-zoom="out"]').click();
  await page.locator("[data-world-fit]").click();
  await expect(page.locator(".camp-expansion-arrow")).toHaveCount(0);
  await expect(page.locator("[data-world-zone]")).toHaveCount(0);
  await fits(page);
  await shot(page, "camp-overview-map");
  await page.locator("[data-world-focus]").click();
  await expect(view).toHaveAttribute("data-camera-mode", "focus");
  expect(errors).toEqual([]);
});
test("unbuilt Market is gated and the tent upgrades into a cabin without a separate house", async ({
  page,
}) => {
  const { errors } = await start(page, true, (g) => {
    g.buildings.market = 0;
    g.buildings.tent = 1;
    g.buildings.cabins = 0;
  });
  await expect(page.locator("[data-market-visit]")).toHaveCount(0);
  await page.locator("#brand-home").click();
  await modal(page).locator("[data-build-sites]").click();
  await modal(page).locator("[data-upgrade-home]").click();
  await modal(page).locator('[data-construct="cabins"]').click();
  await expect(page.locator('[data-building="tent"]')).toContainText(
    "Character cabin",
  );
  await expect(page.locator('[data-building="cabins"]')).toHaveCount(0);
  await page.locator("#brand-home").click();
  await modal(page).locator("[data-build-sites]").click();
  await modal(page).locator('[data-building="market"]').click();
  await modal(page).locator('[data-construct="market"]').click();
  await market(page);
  await expect(page.locator("[data-vendor-map]")).toHaveCount(4);
  await expect(page.locator("[data-market-district]")).toHaveCount(0);
  await fits(page);
  await shot(page, "camp-market");
  await page.locator('[data-vendor-map="forge"]').click();
  await modal(page).locator("[data-compare]").first().click();
  await expect(modal(page)).toContainText("Current");
  await expect(modal(page)).toContainText("New");
  await close(page);
  await nav(page, "camp");
  await page.reload();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(s.buildings.tent).toBe(2);
  expect(s.buildings.market).toBe(1);
  expect(errors).toEqual([]);
});
test("guild, quest, clinic, recruiting and Arena services work at Camp", async ({
  page,
}) => {
  const { errors } = await start(page);
  await building(page, "guildhall");
  await expect(modal(page).locator("[data-guild-booth]")).toHaveCount(8);
  await modal(page).locator('[data-guild-booth="scouts"]').click();
  await modal(page).locator('[data-guild-lesson="scouts"]').click();
  await modal(page).locator('[data-guild-lesson="scouts"]').click();
  await expect(modal(page)).toContainText("20");
  await close(page);
  await building(page, "questboard");
  await modal(page).locator("[data-journal-board]").click();
  await modal(page).locator('[data-accept-quest="guild-initiate"]').click();
  await close(page);
  await nav(page, "quests");
  await expect(page.locator(".quest-journal")).toBeVisible();
  await fits(page);
  await shot(page, "quests");
  await nav(page, "camp");
  await building(page, "clinic");
  await modal(page).locator('[data-remove-attribute="Cursed"]').click();
  await close(page);
  await building(page, "tavern");
  await modal(page).locator('[data-vendor-map="guild"]').click();
  await modal(page).locator("[data-buy]").first().click();
  await close(page);
  await building(page, "tavern");
  await modal(page).locator("[data-camp-arena]").click();
  await page.locator("#arena-gold").fill("25");
  await page.locator("#arena-resource").selectOption("wood");
  await page.locator("#arena-amount").fill("5");
  await page.locator("[data-set-wager]").click();
  await fits(page);
  await shot(page, "arena-wager");
  expect(errors).toEqual([]);
});
test("storage, equipment slots, Kitchen, crafting and the lake remain usable", async ({
  page,
}) => {
  const { g, errors } = await start(page);
  const boots = g.inventory.find((i) => i.key === "heavy-boots");
  await building(page, "storage");
  await modal(page).locator(`[data-storage-equip="${boots.id}"]`).click();
  await modal(page)
    .locator(`[data-equip-armor="${boots.id}"][data-for="${g.roster[0].id}"]`)
    .click();
  await building(page, "pantry");
  await modal(page).locator('[data-building="kitchen"]').click();
  await modal(page).locator('[data-construct="kitchen"]').click();
  await building(page, "kitchen");
  await modal(page).locator('[data-cook="stew"]').click();
  await close(page);
  await building(page, "armory");
  await modal(page).locator('[data-craft-armor="heavy-head"]').click();
  await close(page);
  await page.locator("#brand-home").click();
  await modal(page).locator("[data-build-sites]").click();
  await modal(page).locator('[data-building="dock"]').click();
  await modal(page).locator('[data-construct="dock"]').click();
  await building(page, "dock");
  await modal(page).locator("[data-sail-island]").click();
  await expect(page.locator("#launch-btn")).toBeVisible();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(s.lockedJourney.roadItinerary).toHaveLength(25);
  await fits(page);
  expect(errors).toEqual([]);
});
test("route and battlefield updates never open profiles; manual camera, focus and zoom persist through pause", async ({
  page,
}) => {
  const { errors } = await start(page);
  await page.locator("[data-world-resident]").first().focus();
  await page.locator("[data-world-resident]").first().click();
  await building(page, "crossroads");
  await expect(page.locator("#hero-detail")).toHaveCount(0);
  await page.waitForTimeout(1100);
  await expect(modal(page)).not.toBeVisible();
  await page.locator('[data-destination="clearing"]').click();
  await page.locator("[data-lock-route]").click();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await page.locator("#launch-btn").click();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await page.locator("#pause-btn").click();
  await page.locator(".battle-company-member").first().click();
  await expect(page.locator(".battle-inspection")).toBeVisible();
  await expect(modal(page)).not.toBeVisible();
  await page.locator("[data-deselect]").click();
  await page.waitForTimeout(1100);
  await expect(page.locator("#hero-detail")).toBeEmpty();
  const canvas = page.locator("#battlefield"),
    box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(page.locator("#follow-btn")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#battle-zoom-out").click();
  await page.locator("#pause-btn").click();
  await page.locator("#pause-btn").click();
  await expect(page.locator("#follow-btn")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await page.locator("#follow-btn").click();
  await expect(page.locator("#follow-btn")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let n = 0,
          start = performance.now();
        function tick(at) {
          n++;
          if (at - start >= 500) resolve(n);
          else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }),
  );
  console.log("paused battlefield animation frames / 500ms:", frames);
  expect(frames).toBeGreaterThan(5);
  await fits(page);
  await shot(page, "battlefield");
  await page.reload();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await expect(modal(page)).not.toBeVisible();
  expect(errors).toEqual([]);
});
test("guide settings, reduced motion, calendar and monthly collections fit compact navigation", async ({
  page,
}) => {
  const { errors } = await start(page);
  await expect(page.locator("#learning-coach")).not.toBeVisible();
  await page.locator("#settings-btn").click();
  await modal(page).locator("#setting-tutorial").check();
  await modal(page).locator("#setting-motion").check();
  await close(page);
  await expect(page.locator("body")).toHaveClass(/body-reduced-motion/);
  await nav(page, "challenges");
  await expect(page.locator(".daily-calendar")).toBeVisible();
  await fits(page);
  await shot(page, "daily-calendar");
  await nav(page, "shop");
  await expect(page.locator("#shop-theme option")).toHaveCount(12);
  await page.locator("#shop-theme").selectOption("9");
  await expect(page.locator("#shop-theme")).toContainText("October");
  await fits(page);
  await shot(page, "monthly-shop");
  expect(errors).toEqual([]);
});
test("lights, class choices, global difficulty, chosen portals and Codex retain progression", async ({
  page,
}) => {
  const { g, errors } = await start(page, true, (g) => {
    g.inventory.push(makeItem("witchlight-lantern"));
    g.regionBossClears.greenway = true;
    g.portalUnlocked = true;
    g.materials.bossSigils = 1;
  });
  await building(page, "tent");
  await modal(page).locator(`[data-profile="${g.roster[0].id}"]`).click();
  await modal(page).locator("[data-light-profile]").click();
  await modal(page).locator("[data-equip-light]").first().click();
  await close(page);
  await building(page, "bonfire");
  await modal(page).locator('[data-class-node="vanguard:foundation"]').click();
  await modal(page).locator("#confirm-class-node").click();
  await modal(page).locator('[data-class-node="breaker:0"]').click();
  await modal(page).locator("#confirm-class-node").click();
  await modal(page).locator('[data-world-difficulty="hard"]').click();
  await close(page);
  await page.locator("[data-world-fit]").click();
  await page.locator("[data-portal]").click();
  await modal(page).locator('[data-open-portal="jungle"]').click();
  await close(page);
  await nav(page, "codex");
  await page.locator("#codex-search").fill("Vanguard");
  await expect(page.locator(".codex-page")).toContainText(
    "Class tree & subclasses",
  );
  await fits(page);
  expect(errors).toEqual([]);
});

test("the cinematic tutorial resumes, moves a resident, finishes its required road and opens the Journal", async ({
  page,
}) => {
  test.setTimeout(120000);
  const { g, errors } = await start(page, false, (save) => {
    save.settings.reducedMotion = true;
  });
  for (let i = 0; i < 3; i++) await page.locator("#opening-continue").click();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "pan",
  );
  const view = page.locator('[data-map-camera="camp"]');
  await view.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "move",
  );
  await page.locator('[data-world-resident="0"]').click();
  await page.locator("[data-resident-walk]").click();
  const spot = await page.locator(".map-world").evaluate((el) => {
    const r = el.getBoundingClientRect(),
      scale = Number(el.style.getPropertyValue("--camera-scale"));
    return { x: r.left + 920 * scale, y: r.top + 710 * scale };
  });
  await page.mouse.click(spot.x, spot.y);
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "profile",
  );
  await page.reload();
  await expect(page.locator("#opening-scene")).not.toBeVisible();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "profile",
  );
  await page.locator('[data-world-resident="0"]').click();
  await page.locator("[data-resident-info]").click();
  await expect(modal(page)).toContainText(g.roster[0].name);
  await close(page);
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "crossroads",
  );
  await building(page, "crossroads");
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "route",
  );
  await page.locator("[data-lock-route]").click();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "party",
  );
  await page.locator("#launch-btn").click();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "journey",
  );
  await expect(page.locator("#hero-detail")).toBeEmpty();
  // Advance the saved clock through browser suspension; the real simulation resolves
  // both encounters and once-only rewards from its checkpoint on return.
  await page.addInitScript(() => {
    if (sessionStorage.getItem("qa-fast-forward")) {
      const save = JSON.parse(localStorage.getItem("camp-collector-v12"));
      save.lastClock -= 600000;
      localStorage.setItem("camp-collector-v12", JSON.stringify(save));
      sessionStorage.removeItem("qa-fast-forward");
    }
  });
  await page.evaluate(() => sessionStorage.setItem("qa-fast-forward", "yes"));
  await page.reload();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "pantry",
    { timeout: 45000 },
  );
  await page.locator("#game-home").click();
  await building(page, "pantry");
  await modal(page).locator('[data-food="1"]').click();
  await close(page);
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "journal",
  );
  await building(page, "questboard");
  await expect(modal(page)).toContainText("Journal");
  await modal(page).locator("[data-finish-learning]").click();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-learning",
    "complete",
  );
  await close(page);
  await expect(page.locator("#learning-coach")).not.toBeVisible();
  await building(page, "crossroads");
  await page.locator('[data-crossroads-tab="companies"]').click();
  await expect(page.locator(".crossroads-companies")).toContainText(
    "The first clearing",
  );
  await page.locator("[data-watch]").click();
  await expect(page.locator(".report-panel")).toContainText("Expedition won");
  await fits(page);
  await shot(page, "first-road-report");
  expect(errors).toEqual([]);
});

test("one retro window fits both orientations and fullscreen keeps services inside the game", async ({
  page,
}) => {
  const { errors } = await start(page);
  const size = page.viewportSize();
  const bounds = await page.locator("#game-window").boundingBox();
  expect(bounds.height).toBeLessThanOrEqual(size.height);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight + 2,
      ),
    )
    .toBe(true);
  await page.locator("#fullscreen-btn").click();
  await expect(page.locator("#fullscreen-btn")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await building(page, "tent");
  await expect(modal(page)).toBeVisible();
  await fits(page);
  await shot(page, "fullscreen-service");
  await close(page);
  await page.locator("#fullscreen-btn").click();
  await expect(page.locator("#fullscreen-btn")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.setViewportSize({ width: size.height, height: size.width });
  await fits(page);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight + 2,
      ),
    )
    .toBe(true);
  await shot(page, "landscape-window");
  expect(errors).toEqual([]);
});
