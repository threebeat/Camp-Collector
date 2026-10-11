import { test, expect } from "@playwright/test";
import { initialGame, makeItem, makeFacet, stats } from "../../web/data.js";
import { seeded } from "../../web/engine.js";
import { addGems } from "../../web/camp.js";
const SAVE_KEY = "camp-collector-v12";
async function start(page, funded = false, prepare = () => {}) {
  const g = initialGame(seeded(197), Date.now());
  if (funded) {
    g.campNamed = true;
    g.storyPage = 3;
    g.campName = "Last Light";
    g.gold = 10000;
    g.food = 120;
    addGems(g, 100);
    for (const key in g.materials) g.materials[key] = 250;
    g.buildings.armory = 1;
    g.buildings.blacksmith = 1;
    g.buildings.training = 1;
    g.buildings.cabins = 1;
    g.roster[0].level = 20;
    g.roster[0].armor.forEach((i) => {
      if (i) i.level = 20;
    });
    g.roster[0].currentHp = stats(g.roster[0]).hp;
    g.roster[0].attributes.push(makeFacet("Cursed"));
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
    { key: SAVE_KEY, save: g },
  );
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".camp-map")).toBeVisible();
  return { g, errors };
}
const modal = (page) => page.locator("#modal");
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

async function market(page) {
  await page.locator("[data-market-visit]").first().click();
  await modal(page).locator("#confirm-market-visit").click();
  await expect(page.locator(".market-map")).toBeVisible();
}
async function fits(page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 2,
      ),
    )
    .toBe(true);
}
async function snapshot(page, name) {
  await page.screenshot({
    path: test.info().outputPath(name + ".png"),
    fullPage: true,
  });
}

test("first camp, three starter goals, tent memory, race/class sheets and reload persistence", async ({
  page,
}) => {
  const { g, errors } = await start(page);
  await expect(modal(page)).toContainText("1 / 3");
  await modal(page).locator("[data-story-next]").click();
  await expect(modal(page)).toContainText("2 / 3");
  await modal(page).locator("[data-story-next]").click();
  await expect(modal(page)).toContainText("3 / 3");
  await modal(page).locator("#camp-name-input").fill("Ember House");
  await modal(page).locator("#confirm-camp-name").click();
  await expect(page.locator(".camp-level-card")).toBeVisible();
  await expect(page.locator(".camp-metrics > *")).toHaveCount(4);
  await expect(page.locator("#food-count")).toHaveCount(0);
  await expect(page.locator('#main-nav [data-nav="arena"]')).toHaveCount(0);
  await expect(page.locator('#main-nav [data-nav="quests"]')).toHaveCount(1);
  await page.locator('.quest-summary [data-nav="quests"]').click();
  await expect(page.locator(".quest-journal .quest-card")).toHaveCount(3);
  await page.locator('#main-nav [data-nav="camp"]').click();
  await fits(page);
  await snapshot(page, "camp");
  await page.locator('[data-building="tent"]').click();
  await modal(page)
    .locator('[data-profile="' + g.roster[0].id + '"]')
    .click();
  await expect(modal(page)).toContainText("Memories");
  await expect(modal(page).locator("[data-profile-armor]")).toHaveCount(4);
  await modal(page)
    .locator("#memory-text")
    .fill("The first fire held through the night.");
  await modal(page).locator("[data-memory]").click();
  await expect(modal(page)).toContainText(
    "The first fire held through the night.",
  );
  await modal(page).locator("[data-profile-class]").click();
  await expect(modal(page)).toContainText("Choose a calling");
  await expect(modal(page)).toContainText("Starting equipment");
  await modal(page).locator("[data-profile]").click();
  await modal(page).locator("[data-profile-race]").click();
  await expect(modal(page)).toContainText("Race growth");
  await fits(page);
  await close(page);
  await expect(page.locator("#hero-detail")).toHaveAttribute(
    "data-allegiance",
    "friendly",
  );
  await expect(page.locator("#hero-detail")).not.toContainText(
    "Your Adventurer",
  );
  await expect(page.locator("#hero-detail [data-growth]")).toHaveCount(0);
  await page.reload();
  await page.locator('[data-building="tent"]').click();
  await modal(page)
    .locator('[data-profile="' + g.roster[0].id + '"]')
    .click();
  await expect(modal(page)).toContainText(
    "The first fire held through the night.",
  );
  expect(errors).toEqual([]);
});

test("Market districts, guild lessons, NPC stories, item comparisons and clinic", async ({
  page,
}) => {
  const { g, errors } = await start(page, true);
  await market(page);
  await expect(page.locator(".market-directions button")).toHaveCount(4);
  await fits(page);
  await snapshot(page, "market");
  await page.locator('[data-market-district="guildhall"]').first().click();
  await expect(page.locator("[data-guild-booth]")).toHaveCount(8);
  await page.locator('[data-guild-booth="miners"]').click();
  await modal(page).locator('[data-guild-profession="miners"]').click();
  await modal(page).locator('[data-profession="Miner"]').click();
  await expect(modal(page)).toContainText("Miner I");
  await modal(page).locator('[data-profession="Miner"]').click();
  await expect(modal(page)).toContainText("Miner II");
  await close(page);
  await page.locator('[data-market-district="square"]:visible').click();
  await page.locator('[data-market-district="commons"]').click();
  await page.locator('[data-district-open="board"]').click();
  await modal(page).locator('[data-accept-quest="guild-initiate"]').click();
  await expect(modal(page)).toContainText("Claim reward");
  await close(page);
  await page.locator('[data-market-district="square"]:visible').click();
  await page
    .locator("[data-neutral]")
    .filter({ has: page.locator(".npc-marker.quest") })
    .first()
    .click();
  await expect(page.locator("#hero-detail")).toHaveAttribute(
    "data-allegiance",
    "neutral",
  );
  await expect(modal(page)).toContainText("Mara");
  await modal(page).locator('[data-accept-quest="lantern-keeper"]').click();
  await close(page);
  await page.locator('[data-vendor-map="forge"]').click();
  await modal(page).locator("[data-compare]").first().click();
  await expect(modal(page)).toContainText("Current");
  await expect(modal(page)).toContainText("New");
  await close(page);
  await page.locator('[data-service="clinic"]').first().click();
  await page.locator('[data-district-open="clinic"]').click();
  await modal(page).locator('[data-remove-attribute="Cursed"]').click();
  await expect(modal(page)).not.toContainText("Lift Cursed");
  await close(page);
  await page.locator('[data-nav="camp"]').first().click();
  await expect(page.locator(".camp-map")).toBeVisible();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(
    save.roster[0].attributes.some((a) => a.key === "Miner" && a.level === 21),
  ).toBe(true);
  expect(save.roster[0].id).toBe(g.roster[0].id);
  expect(errors).toEqual([]);
});

test("storage equips compatible gear, Pantry upgrades, workshop crafts and lakeshore stages 25 floors", async ({
  page,
}) => {
  const { g, errors } = await start(page, true),
    boots = g.inventory.find((i) => i.key === "heavy-boots");
  await page.locator('[data-building="tent"]').click();
  await modal(page)
    .locator('[data-profile="' + g.roster[0].id + '"]')
    .click();
  await expect(
    modal(page).locator('[data-profile-armor="3"] .new-gear-dot'),
  ).toBeVisible();
  await close(page);
  await page.locator('[data-building="storage"]').click();
  await modal(page)
    .locator('[data-storage-equip="' + boots.id + '"]')
    .click();
  await expect(modal(page)).toContainText("compatible adventurer");
  await modal(page)
    .locator(
      '[data-equip-armor="' +
        boots.id +
        '"][data-for="' +
        g.roster[0].id +
        '"]',
    )
    .click();
  await expect(modal(page)).not.toBeVisible();
  await page.locator('[data-building="pantry"]').click();
  await modal(page).locator('[data-building="kitchen"]').click();
  await modal(page).locator('[data-construct="kitchen"]').click();
  await expect(page.locator('[data-building="pantry"]')).toHaveCount(0);
  await page.locator('[data-building="kitchen"]').click();
  await modal(page).locator('[data-cook="stew"]').click();
  await expect(modal(page)).toBeVisible();
  await close(page);
  await page.locator('[data-building="armory"]').click();
  await modal(page).locator('[data-craft-armor="heavy-head"]').click();
  await expect(modal(page)).toContainText("Equipment Workshop");
  await close(page);
  await page.locator('[data-expand-camp="south"]').click();
  await modal(page).locator("#confirm-expansion").click();
  await expect(page.locator(".lakeshore-map")).toBeVisible();
  await page.locator('[data-building="dock"]').click();
  await modal(page).locator('[data-construct="dock"]').click();
  await close(page);
  await expect(page.locator(".island-sign")).toContainText("25 floors");
  await fits(page);
  await snapshot(page, "lakeshore");
  await page.locator('[data-building="dock"]').click();
  await modal(page).locator("[data-sail-island]").click();
  await expect(page.locator("#launch-btn")).toBeVisible();
  await expect(page.locator("#app-content")).toContainText("25");
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(save.roster[0].armor[3].id).toBe(boots.id);
  expect(save.lockedJourney.roadItinerary).toHaveLength(25);
  expect(save.consumables.stew).toBe(1);
  expect(errors).toEqual([]);
});

test("touch service alternatives, readable map and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { errors } = await start(page, true);
  await page.locator('[data-building="crossroads"]').click();
  await expect(page.locator('[data-destination="clearing"]')).toBeVisible();
  await expect(page.locator("[data-lakeshore-island]")).toHaveCount(1);
  await page.locator('[data-destination="clearing"]').click();
  await page.locator("[data-lock-route]").click();
  await expect(page.locator("#launch-btn")).toBeVisible();
  await fits(page);
  await snapshot(page, "local-map-party");
  expect(errors).toEqual([]);
});

test("tutorial placement, settings, calendar states and all monthly collections fit each viewport", async ({
  page,
}) => {
  const { g, errors } = await start(page, true, (g) => {
    const d = new Date(g.lastClock),
      key = d.toISOString().slice(0, 7);
    if (d.getUTCDate() > 1) g.calendarClaims[key + ":1"] = true;
  });
  await expect(page.locator("#tutorial-bar")).toBeVisible();
  const bar = await page.locator("#tutorial-bar").boundingBox(),
    phone = (page.viewportSize()?.width || 1000) < 600;
  expect(phone ? bar.y > page.viewportSize().height / 2 : bar.y < 250).toBe(
    true,
  );
  const backgrounds = await page.evaluate(() =>
    ["body", ".camp-detail", ".site-header"].map(
      (sel) => getComputedStyle(document.querySelector(sel)).backgroundColor,
    ),
  );
  for (const c of backgrounds) {
    const rgb = c.match(/\d+/g).slice(0, 3).map(Number);
    expect(Math.max(...rgb)).toBeLessThan(80);
  }
  await page.locator("[data-tutorial-skip]").click();
  await expect(page.locator("#tutorial-bar")).not.toBeVisible();
  await page.locator("#settings-btn").click();
  await modal(page).locator("#setting-tutorial").check();
  await close(page);
  await expect(page.locator("#tutorial-bar")).toBeVisible();
  await page.locator('#main-nav [data-nav="challenges"]').click();
  await expect(page.locator(".calendar-date")).toHaveCount(
    new Date(
      Date.UTC(
        new Date(g.lastClock).getUTCFullYear(),
        new Date(g.lastClock).getUTCMonth() + 1,
        0,
      ),
    ).getUTCDate(),
  );
  await expect(page.locator('[aria-current="date"]')).toHaveCount(1);
  if (new Date(g.lastClock).getUTCDate() > 1)
    await expect(page.locator(".calendar-date.complete")).toHaveCount(1);
  await fits(page);
  await snapshot(page, "daily-calendar");
  await page.locator('#main-nav [data-nav="shop"]').click();
  await expect(page.locator("#shop-theme option")).toHaveCount(12);
  await page.locator("#shop-theme").selectOption("9");
  await expect(page.locator(".monthly-shop")).toContainText(
    "Harvest of shadows",
  );
  await page.locator('[data-monthly-buy="monthly-9-0"]').click();
  await expect(page.locator('[data-monthly-buy="monthly-9-0"]')).toHaveText(
    "Owned",
  );
  await fits(page);
  await snapshot(page, "monthly-shop");
  expect(errors).toEqual([]);
});

test("guild standing, Tavern hiring, Quest organization and Arena stakes use the new districts", async ({
  page,
}) => {
  const { errors } = await start(page, true);
  await market(page);
  await page.locator('[data-market-district="guildhall"]').click();
  await page.locator('[data-guild-booth="scouts"]').click();
  await modal(page).locator('[data-guild-lesson="scouts"]').click();
  await modal(page).locator('[data-guild-lesson="scouts"]').click();
  await expect(modal(page)).toContainText("Guild standing 20");
  await modal(page).locator('[data-guild-buy="scouts"]').click();
  await expect(modal(page).locator('[data-guild-buy="scouts"]')).toHaveText(
    "Sold this period",
  );
  await modal(page).locator('[data-guild-quest="scouts"]').click();
  await close(page);
  await page.locator('[data-market-district="square"]').click();
  await page.locator('[data-market-district="tavern"]').click();
  await expect(page.locator(".tavern-recruit")).toHaveCount(5);
  await page.locator(".tavern-recruit").first().click();
  await modal(page).locator("[data-hire-visitor]").click();
  await close(page);
  await page.locator('#main-nav [data-nav="quests"]').click();
  await page.locator("[data-pin-quest]").first().click();
  await page.locator("#quest-filter").selectOption("pinned");
  await expect(page.locator(".quest-grid .quest-card")).toHaveCount(1);
  await page.locator("#quest-sort").selectOption("name");
  await fits(page);
  await snapshot(page, "quest-journal");
  await page.locator('#main-nav [data-nav="camp"]').click();
  await market(page);
  await page.locator('[data-market-district="arena"]').click();
  await page.locator("[data-enter-arena]").click();
  await page.locator("#arena-gold").fill("25");
  await page.locator("#arena-resource").selectOption("wood");
  await page.locator("#arena-amount").fill("5");
  await page.locator("[data-set-wager]").click();
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  await fits(page);
  await snapshot(page, "arena-wager");
  await page.locator("#launch-btn").click();
  await expect(page.locator("#tutorial-bar")).not.toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("camp-collector-v12")).expeditions.at(
            -1,
          )?.mode,
      ),
    )
    .toBe("arena");
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(after.gold).toBe(before.gold - 25);
  expect(after.materials.wood).toBe(before.materials.wood - 5);
  expect(after.expeditions.at(-1).wager.gold).toBe(25);
  expect(errors).toEqual([]);
});

test("lantern equipment, alternating class points, global difficulty and chosen portals persist", async ({
  page,
}) => {
  const { g, errors } = await start(page, true, (g) => {
    g.regionBossClears.greenway = true;
    g.portalUnlocked = true;
    g.materials.bossSigils = 1;
    g.inventory.push(makeItem("witchlight-lantern"));
  });
  await page.locator('[data-building="tent"]').click();
  await modal(page)
    .locator('[data-profile="' + g.roster[0].id + '"]')
    .click();
  await modal(page).locator("[data-light-profile]").click();
  await modal(page)
    .locator(".item-option")
    .filter({ hasText: "Witchlight" })
    .locator("[data-equip-light]")
    .click();
  await expect(modal(page)).toContainText("Witchlight lantern");
  await close(page);
  await page.locator('[data-building="bonfire"]').click();
  await expect(
    modal(page).locator('[data-class-node="breaker:0"]'),
  ).toBeDisabled();
  await modal(page).locator('[data-class-node="vanguard:foundation"]').click();
  await modal(page).locator("#confirm-class-node").click();
  await modal(page).locator('[data-class-node="breaker:0"]').click();
  await modal(page).locator("#confirm-class-node").click();
  await modal(page).locator('[data-world-difficulty="hard"]').click();
  await expect(modal(page)).toContainText("World difficulty");
  await expect(
    modal(page).locator('[data-world-difficulty="hard"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await close(page);
  await page.locator("[data-portal]").click();
  await modal(page).locator('[data-open-portal="jungle"]').click();
  await expect(
    modal(page).locator('[data-portal-travel="jungle"]'),
  ).toBeVisible();
  await close(page);
  await page.reload();
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("camp-collector-v12")),
  );
  expect(save.roster[0].light.key).toBe("witchlight-lantern");
  expect(save.roster[0].classNodes).toEqual([
    "vanguard:foundation",
    "breaker:0",
  ]);
  expect(save.worldDifficulty).toBe("hard");
  expect(save.regionUnlocks).toEqual(["greenway", "jungle"]);
  expect(save.materials.bossSigils).toBe(0);
  await page.locator('#main-nav [data-nav="codex"]').click();
  await page.locator("#codex-search").fill("Vanguard");
  await expect(page.locator(".codex-page")).toContainText(
    "Class tree & subclasses",
  );
  await fits(page);
  await snapshot(page, "class-codex");
  expect(errors).toEqual([]);
});

// Regression: inspection must never be inferred from the first party member.
test("pixel Camp and mobile battlefield keep profiles closed until an intentional tap", async ({
  page,
}) => {
  const { errors } = await start(page, true);
  await page.locator("[data-tutorial-skip]").click();
  await expect(
    page.locator('.camp-building [data-pixel-art="building"]').first(),
  ).toBeVisible();
  const stock = page.locator("#camp-supplies");
  await expect(stock).not.toHaveAttribute("open");
  await stock.locator("summary").click();
  await expect(stock).toHaveAttribute("open");
  await expect(stock.locator(".camp-resource-list")).toBeVisible();
  await page.locator('[data-building="crossroads"]').click();
  await page.locator('[data-destination="clearing"]').click();
  await page.locator("[data-lock-route]").click();
  await page.locator("#launch-btn").click();
  await expect(page.locator("#battlefield")).toBeVisible();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await expect(
    page.locator(".expedition-workspace .inspector"),
  ).not.toBeVisible();
  await page.locator("#pause-btn").click();
  await expect(page.locator("#pause-btn")).toContainText("Resume");
  await page.locator(".battle-company-member").first().click();
  await expect(page.locator(".battle-inspection")).toBeVisible();
  await expect(modal(page)).not.toBeVisible();
  expect(
    await page
      .locator(".expedition-workspace .inspector")
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("static");
  await page.locator("[data-deselect]").click();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await page.waitForTimeout(1200);
  await expect(page.locator("#hero-detail")).toBeEmpty();
  const box = await page.locator("#battlefield").boundingBox();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await page.locator("#follow-btn").click();
  await fits(page);
  await snapshot(page, "pixel-battlefield");
  await page.reload();
  await expect(page.locator("#battlefield")).toBeVisible();
  await expect(page.locator("#hero-detail")).toBeEmpty();
  await expect(modal(page)).not.toBeVisible();
  await fits(page);
  expect(errors).toEqual([]);
});
