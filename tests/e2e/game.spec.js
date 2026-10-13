import { test, expect } from "@playwright/test";
import {
  initialGame,
  generateHero,
  makeItem,
  makeFacet,
  stats,
} from "../../web/data.js";
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
      "pantry",
      "market",
      "guildhall",
      "tavern",
      "clinic",
      "armory",
      "blacksmith",
      "training",
      "arena",
      "tradingpost",
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
  await expect(page.locator("#main-menu")).toBeVisible();
  await expect(page.locator("#main-menu .cinema-arrivals")).toHaveCount(0);
  await expect(page.locator("#settings-btn")).not.toBeVisible();
  await expect(page.locator("#fullscreen-btn")).toBeVisible();
  await page.locator(g.campNamed ? "#continue-game" : "#new-game").click();
  await expect(
    page.locator(g.campNamed ? ".map-viewport" : "#opening-scene"),
  ).toBeVisible();
  return { g, errors };
}
async function resume(page) {
  await expect(page.locator("#main-menu")).toBeVisible();
  await page.locator("#continue-game").click();
  await expect(page.locator("#game-window")).toHaveAttribute(
    "data-session",
    "playing",
  );
  await expect(page.locator('[data-map-camera="camp"]')).toBeVisible();
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
    return;
  }
  await nav(page, "camp");
  if (key === "challenges" || key === "calendar") {
    await building(page, "tavern");
    await page.locator("#main-nav [data-tavern-bar]").click();
    await modal(page).locator('[data-bar-challenge="daily"]').click();
    return;
  }
  await page
    .locator(
      `#main-nav [data-nav="${key === "challenges" ? "calendar" : key}"]`,
    )
    .click();
}
async function building(page, key) {
  await close(page);
  if (key === "questboard" || key === "storage") {
    await page
      .locator(key === "questboard" ? "[data-open-journal]" : "[data-storage]")
      .click();
    return;
  }
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
  await expect(page.locator("#main-nav button")).toHaveCount(5);
  await expect(page.locator("#food-count")).toHaveCount(0);
  await fits(page);
  await page.waitForTimeout(2500);
  for (const actor of await page
    .locator("[data-world-resident], [data-world-prop]")
    .all()) {
    expect(
      await actor.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          document
            .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
            ?.closest("button") === el
        );
      }),
    ).toBe(true);
  }
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
  await resume(page);
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
  await resume(page);
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
  const { errors } = await start(page, true, (g) =>
    g.roster.push(...Array.from({ length: 3 }, () => generateHero())),
  );
  await building(page, "guildhall");
  await expect(modal(page).locator("[data-guild-booth]")).toHaveCount(8);
  await modal(page).locator('[data-guild-booth="scouts"]').click();
  await modal(page).locator('[data-guild-lesson="scouts"]').click();
  await modal(page).locator('[data-guild-lesson="scouts"]').click();
  await expect(modal(page)).toContainText("20");
  await close(page);
  await page.locator("[data-world-fit]").click();
  await page.locator('[data-town-npc="orin"]').click();
  await modal(page).locator("[data-npc-accept]").first().click();
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
  await expect(page.locator('[data-map-camera="tavern"]')).toBeVisible();
  const room = await page.locator(".tavern-map .world-ground").boundingBox();
  const viewport = await page
    .locator('[data-map-camera="tavern"]')
    .boundingBox();
  expect(room.y).toBeLessThanOrEqual(viewport.y + 1);
  expect(room.y + room.height).toBeGreaterThanOrEqual(
    viewport.y + viewport.height - 1,
  );
  await expect(page.locator("[data-tavern-hero]")).toHaveCount(6);
  await shot(page, "tavern");
  await page.locator("[data-tavern-hero]").first().click();
  await expect(modal(page)).not.toContainText("undefined");
  await modal(page).locator("[data-tavern-hire]").click();
  await expect(page.locator("[data-tavern-hero]")).toHaveCount(5);
  await page.locator("#main-nav [data-tavern-bar]").click();
  await modal(page).locator("[data-tavern-buy]").first().click();
  await close(page);
  await nav(page, "camp");
  await building(page, "arena");
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
  await page.locator("[data-plan-expedition]").click();
  await page.locator('[data-destination="clearing"]').click();
  await page.locator("[data-lock-route]").click();
  await expect(page.locator("#hero-detail")).toHaveCount(0);
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
  await resume(page);
  await expect(page.locator("#battlefield")).toHaveCount(0);
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
  await shot(page, "bonfire-skill-tree");
  await modal(page).locator('[data-class-node="vanguard:foundation"]').click();
  await modal(page).locator("#confirm-class-node").click();
  await modal(page).locator('[data-class-node="breaker:0"]').click();
  await modal(page).locator("#confirm-class-node").click();
  await modal(page).locator(".bonfire-difficulty summary").click();
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

test("tutorial prompts persist, pay once, combine recovery and finish without a Journal footer", async ({
  page,
}) => {
  test.setTimeout(120000);
  const { g, errors } = await start(page, false, (save) => {
    save.settings.reducedMotion = true;
  });
  const stage = (value) =>
    expect(page.locator("#game-window")).toHaveAttribute(
      "data-learning",
      value,
    );
  const next = async () => {
    await expect(page.locator("[data-lesson-continue]")).toBeEnabled();
    await page.locator("[data-lesson-continue]").click();
  };
  for (let i = 0; i < 3; i++) await page.locator("#opening-continue").click();
  await stage("pan");
  await expect(page.locator("[data-lesson-continue]")).toBeDisabled();
  await page.locator('[data-map-camera="camp"]').focus();
  await page.keyboard.press("ArrowRight");
  await stage("pan");
  await next();
  await stage("move");
  const hero = page.locator('[data-world-resident="0"]');
  await hero.dragTo(page.locator('[data-building="tent"]'));
  await stage("move");
  await expect(modal(page)).toContainText(g.roster[0].name);
  await next();
  await stage("profile");
  await hero.click();
  await page.locator("[data-resident-info]").click();
  await expect(modal(page)).toHaveAttribute("data-sheet", "profile");
  await next();
  await stage("crossroads");
  await page.reload();
  await resume(page);
  await stage("crossroads");
  await building(page, "crossroads");
  await expect(page.locator(".crossroads-hub")).toBeVisible();
  await next();
  await stage("route");
  await page.locator("[data-plan-expedition]").click();
  await shot(page, "route-planner");
  await expect(page.locator("#app-content")).toHaveCSS("overflow", "hidden");
  await page.locator("[data-lock-route]").click();
  await next();
  await stage("party");
  await shot(page, "party-planner");
  await page.locator("#launch-btn").click();
  await next();
  await stage("journey");
  await page.addInitScript(() => {
    if (sessionStorage.getItem("qa-fast-forward")) {
      const save = JSON.parse(localStorage.getItem("camp-collector-v12"));
      save.lastClock -= 600000;
      localStorage.setItem("camp-collector-v12", JSON.stringify(save));
      sessionStorage.removeItem("qa-fast-forward");
    }
  });
  const catchUp = async () => {
    await page.evaluate(() => sessionStorage.setItem("qa-fast-forward", "yes"));
    await page.reload();
    await resume(page);
  };
  await catchUp();
  await stage("journey");
  await next();
  await stage("quests");
  await expect(page.locator("#learning-coach")).toContainText(
    "Open journal in the camp menu at the top of the screen and claim your first quest rewards",
  );
  await building(page, "questboard");
  await expect(modal(page).locator(".modal-footer")).toHaveCount(0);
  await modal(page).locator('[data-quest="first-road"]').click();
  await next();
  await stage("fernbridge");
  await building(page, "crossroads");
  await next();
  await stage("fernroute");
  await page.locator("[data-plan-expedition]").click();
  await expect(
    page.locator('[data-destination="bridge"] .quest-map-marker'),
  ).toBeVisible();
  await page.locator("[data-lock-route]").click();
  await next();
  await stage("fernparty");
  await page.locator("#launch-btn").click();
  await next();
  await stage("recovery");
  await catchUp();
  await stage("recovery");
  await expect(page.locator("[data-lesson-continue]")).toBeDisabled();
  await building(page, "tavern");
  await expect(page.locator("[data-tavern-hero]")).toHaveCount(6);
  await page.locator("[data-tavern-hero]").nth(4).click();
  await modal(page).locator("[data-tavern-hire]").click();
  await stage("recovery");
  await next();
  await stage("build");
  await page.locator("#game-home").click();
  await expect(page.locator('[data-build-dot="pantry"]')).toBeVisible();
  await building(page, "pantry");
  await modal(page).locator('[data-construct="pantry"]').click();
  await stage("build");
  await next();
  await stage("pantry");
  await building(page, "pantry");
  await modal(page).locator('[data-food="1"]').click();
  await next();
  await stage("journal");
  await next();
  await stage("complete");
  await expect(page.locator("#learning-coach")).not.toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(saved.roster.length).toBe(4);
  expect(saved.learning.claimedStages).toHaveLength(15);
  expect(saved.trackedQuest).toBe("bridge");
  expect(saved.expeditions.map((r) => r.reason)).toEqual([
    "complete",
    "defeat",
  ]);
  expect(saved.journeyClears["greenway:bridge"]).toBeFalsy();
  await building(page, "crossroads");
  await page.locator(`[data-watch="${saved.expeditions[0].id}"]`).click();
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

test("saved Camp opens at an empty main menu and movable props retain their positions", async ({
  page,
}) => {
  const { errors } = await start(page);
  const prop = page.locator('[data-world-prop="supply-crate"]');
  const ids = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")).roster.map(
      (h) => h.id,
    ),
  );
  const old = await prop.getAttribute("style");
  const oldPosition = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")).campProps.find(
      (p) => p.id === "supply-crate",
    ),
  );
  const box = await prop.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 30,
    box.y + box.height / 2 + 35,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect.poll(() => prop.getAttribute("style")).not.toBe(old);
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("camp-collector-v12")).campProps.find(
          (p) => p.id === "supply-crate",
        ),
      ),
    )
    .not.toEqual(oldPosition);
  const position = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")).campProps.find(
      (p) => p.id === "supply-crate",
    ),
  );
  await page.reload();
  await expect(page.locator("#main-menu")).toBeVisible();
  await expect(page.locator("#main-menu .cinema-arrivals")).toHaveCount(0);
  await expect(page.locator("#main-nav")).not.toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("#main-menu .cinema-world")
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  await shot(page, "main-menu");
  await resume(page);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(saved.roster.map((h) => h.id)).toEqual(ids);
  expect(saved.campProps.find((p) => p.id === "supply-crate")).toEqual(
    position,
  );
  await building(page, "guildhall");
  await expect(modal(page)).not.toBeVisible();
  await expect(page.locator("#toast")).toContainText("six heroes");
  expect(errors).toEqual([]);
});

test("dragging retains the lit scene, profiles use the right panel, and Trading Post compares the dragged hero", async ({
  page,
}) => {
  const { g, errors } = await start(page);
  await expect(page.locator(".baked-camp-map")).toBeVisible();
  await expect(page.locator("#game-window")).not.toHaveClass(/revealing-world/);
  await page.evaluate(() => {
    window.qaWorld = document.querySelector(".camp-map");
    window.qaLight = document.querySelector(".scene-lightfield");
    window.qaGround = document.querySelector(".baked-camp-map");
  });
  const prop = page.locator('[data-world-prop="lantern"]'),
    box = await prop.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 35,
    box.y + box.height / 2 + 30,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.qaWorld === document.querySelector(".camp-map") &&
          window.qaLight === document.querySelector(".scene-lightfield") &&
          window.qaGround === document.querySelector(".baked-camp-map"),
      ),
    )
    .toBe(true);
  await expect(page.locator("#game-window")).not.toHaveClass(/revealing-world/);
  await page.locator('[data-world-resident="0"]').click();
  await page.locator("[data-resident-info]").click();
  const drawer = await modal(page).boundingBox();
  expect(drawer.width).toBeLessThanOrEqual(
    page.viewportSize().width <= 850 ? page.viewportSize().width : 445,
  );
  await shot(page, "character-info-panel");
  await close(page);
  await page.locator("[data-world-fit]").click();
  await page
    .locator('[data-world-resident="1"]')
    .dragTo(page.locator('[data-building="tradingpost"]'));
  await expect(modal(page)).toContainText("Trading Post");
  await expect(modal(page)).toContainText(g.roster[1].name);
  await modal(page).locator("[data-compare]").first().click();
  await expect(modal(page)).toContainText(g.roster[1].name);
  await expect(modal(page)).not.toContainText(g.roster[0].name);
  await shot(page, "trading-comparison");
  expect(errors).toEqual([]);
});
