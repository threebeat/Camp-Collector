import { test, expect } from "@playwright/test";
import { initialGame, makeItem, makeFacet, stats } from "../../web/data.js";
import { seeded } from "../../web/engine.js";
import { addGems } from "../../web/camp.js";
const SAVE_KEY = "camp-collector-v12";
async function start(page, funded = false) {
  const g = initialGame(seeded(197), Date.now());
  if (funded) {
    g.campNamed = true;
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
  await modal(page).locator("#camp-name-input").fill("Ember House");
  await modal(page).locator("#confirm-camp-name").click();
  await expect(page.locator(".quest-board .quest-card")).toHaveCount(3);
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
  await page.locator('[data-district-open="guildhall"]').click();
  await modal(page).locator('[data-profession="Miner"]').click();
  await expect(modal(page)).toContainText("Miner I");
  await modal(page).locator('[data-profession="Miner"]').click();
  await expect(modal(page)).toContainText("Miner II");
  await close(page);
  await page.locator('[data-market-district="square"]:visible').click();
  await page.locator('[data-market-district="board"]').click();
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
