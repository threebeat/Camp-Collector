import * as Night from "./nightfall.js?v=13";
import { createNightfallUi } from "./nightfall-ui.js?v=13";
import { regionLandmarks } from "./landmarks.js?v=13";
import {
  GAME_SEASON,
  MYTHICAL_HEROES,
  WEAPONS,
  CLASSES,
  RACES,
  ITEMS,
  RARITIES,
  RARITY_COLORS,
  CORE_STATS,
  ATTRIBUTES,
  LOCATIONS,
  VENDORS,
  SCHOOLS,
  LINEAGES,
  EQUIPMENT_TYPES,
  W,
  H,
  stats,
  baseStats,
  growthFor,
  heroRarity,
  xpNeeded,
  itemXpNeeded,
  equipmentSlots,
  school,
  lineage,
  className,
  itemInfo,
  itemRarity,
  abilities,
  encounterFor,
  PETS,
  COSMETICS,
  CONSUMABLES,
  DIFFICULTIES,
  CAMPAIGNS,
  EVENTS,
  periodKey,
  characterAttributes,
  facetRarity,
  facetScale,
  facetXpNeeded,
  hasAttribute,
  trainingBonus,
  dialogue,
  equipmentRestriction,
  companionSlots,
  GEM_KINDS,
  GEM_SIZES,
  gemValue,
  TALENTS,
  talentInfo,
  allGear,
  armorSlots,
  armorRestriction,
  characterSize,
  classPoints,
  classTree,
  evolutionName,
  classNodeState,
  transformationOptions,
  weaponModifiers,
  WEAPON_KINDS,
  objectModifiers,
  modifierPool,
  petInfo,
} from "./data.js?v=13";
import { Battle, distance } from "./engine.js?v=13";
import { Renderer } from "./renderer.js?v=13";
import { icon, portraitSvg, petSvg, itemSvg, cosmeticSvg } from "./art.js?v=13";
import {
  activeExpeditions,
  expeditionSlots,
  SLOT_MILESTONES,
  assignedTo,
  available,
  party,
  trainingCost,
  destinationInfo,
  salvageValue,
  stockResetAt,
  trialInfo,
  trialClaimKey,
} from "./progression.js?v=13";
import * as Camp from "./camp.js?v=13";
import {
  BUILDINGS,
  BRANCHES,
  MATERIALS,
  CONTEXT,
  calendarMonth,
  calendarDay,
  CALENDAR_BONUSES,
  COOKING,
  BREWS,
} from "./world.js?v=13";
import { CODEX } from "./codex.js?v=13";
import {
  REGIONS,
  REGION_ORDER,
  regionalRoutes,
  visibleNodes,
  explored,
  journeyRequirements,
  QUESTS,
  allQuests,
  questById,
  questState,
  activeQuests,
  bossDefeated,
} from "./journeys.js?v=13";
import { attachResidentDragging } from "./map-interaction.js?v=13";
import { createClient } from "./client.js?v=13";
import { CampChatter } from "./chatter.js?v=13";
import { exportCamp, readCampBackup } from "./saves.js?v=13";
const campChatter = new CampChatter();
const $ = (id) => document.getElementById(id),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1),
  time = (s) =>
    s >= 3600
      ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
      : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
let game = null,
  client = null,
  selected = null,
  selectedUid = null,
  battle = null,
  renderer = null,
  observation = { id: null, visible: true, speed: 1, paused: false },
  catchingUp = false;
let focused =
  typeof document.hasFocus === "function" ? document.hasFocus() : true;
let signature = "",
  lastRender = 0,
  lastDetail = 0,
  lastObservedAt = 0,
  vendor = "all",
  marketMode = "vendors",
  codexSelected = "The six stats",
  filter = "all",
  search = "",
  marketSearch = "",
  marketType = "all",
  marketRarity = "all",
  marketSort = "name",
  marketPage = 0,
  codexSearch = "",
  codexCategory = "All",
  names = true,
  expanded = false,
  toastTimer = null,
  modalRefresh = null,
  closing = false;
const CAMP_PORTRAIT = {
  crossroads: [17, 23],
  tent: [22, 44],
  storage: [17, 70],
  pantry: [48, 82],
  training: [81, 28],
  blacksmith: [81, 68],
  armory: [50, 28],
  kitchen: [48, 82],
  alchemist: [81, 48],
  bonfire: [51, 56],
};
const ROUTE_COLORS = ["#b18a31", "#4f8994", "#9a6c92"];
const MARKET_PLOTS = {
  guild: [20, 28],
  forge: [78, 28],
  arcane: [21, 49],
  night: [78, 49],
  menagerie: [21, 73],
  atelier: [78, 73],
};
let marketVisitors = [],
  marketFor = null,
  marketShopVendor = null,
  shopSearch = "",
  shopType = "all",
  shopSort = "name",
  shopPage = 0,
  residentDrag = null,
  pendingMapRender = false,
  mapZoom = 1,
  challengeTab = "daily",
  gemFilter = "all";
const mapViews = new Map();

const heroById = (id) => game.roster.find((h) => h.id === id),
  currentExpedition = () =>
    game.expeditions.find((r) => r.id === game.selectedExpedition);
function selectedHero() {
  if (game.screen === "expedition" && selectedUid !== null && battle) {
    const u = battle.units.find((u) => u.uid === selectedUid);
    if (u) return u.hero;
  }
  return (
    heroById(selected) ||
    game.visitors?.find((h) => h.id === selected) ||
    ([
      "camp",
      "market",
      "crossroads",
      "expeditions",
      "shop",
      "challenges",
    ].includes(game.screen)
      ? null
      : game.roster[0])
  );
}
function rarityTag(tier) {
  return `<span class="rarity-tag" style="--rarity:${RARITY_COLORS[tier]}">${RARITIES[tier]}</span>`;
}
const itemLabel = (i) =>
  `${RARITIES[itemRarity(i)]} ${i.unidentified ? "Sealed magic relic" : evolutionName(i, "weapon")} · Lv ${i.level}`;
function toast(text) {
  $("toast").textContent = text;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3200);
}
async function act(type, args = {}, message = "") {
  try {
    const result = await client.command(type, args);
    if (!result.ok) {
      toast(
        catchingUp
          ? "Background journeys are catching up. Try again in a moment."
          : "Check the cost, requirements, and character availability.",
      );
      return false;
    }
    if (message) toast(message);
    return result;
  } catch (e) {
    toast("Could not complete this action. " + e.message);
    return false;
  }
}
function closeModal() {
  modalRefresh = null;
  $("modal").close();
}
function openModal(name, subtitle, body, footer = "", refresh = null) {
  modalRefresh = refresh;
  $("modal-content").innerHTML =
    `<div class="modal-header"><div><span class="eyebrow">${esc(game.campName || "Your Camp")} · ${title(game.screen)}</span><h2>${name}</h2><p>${subtitle}</p></div><button class="icon-button" data-close aria-label="Close dialog">${icon("close")}</button></div><div class="modal-body">${body}</div>${footer ? `<div class="modal-footer">${footer}</div>` : ""}`;
  bindActions($("modal-content"));
  if (!$("modal").open) $("modal").showModal();
}
const button = (label, attrs = "", style = "primary-button") =>
  `<button class="${style}" ${attrs}>${label}</button>`;
function heroPicker(h, id = "service-hero") {
  return `<label class="field-label" for="${id}">Character</label><select id="${id}" class="modal-select">${game.roster.map((a) => `<option value="${a.id}" ${a.id === h?.id ? "selected" : ""} ${!available(game, a) ? "disabled" : ""}>${esc(a.name)} · Lv ${a.level} ${className(a)}${!available(game, a) ? " · Away / recovering" : ""}</option>`).join("")}</select>`;
}
function statusOf(h) {
  const r = assignedTo(game, h);
  if (r) return { text: "On expedition", class: "away", detail: r.name };
  const job = Camp.heroJob(h);
  if (job)
    return {
      text: job.kind === "training" ? "Training" : "Sharpening",
      class: "recovering",
      detail: Math.max(0, Math.ceil((job.ends - game.lastClock) / 1000)) + "s",
    };
  if (h.recoveryUntil > game.lastClock)
    return {
      text: "Recovering",
      class: "recovering",
      detail: Math.ceil((h.recoveryUntil - game.lastClock) / 1000) + "s",
    };
  return { text: "At Camp", class: "idle", detail: "Ready for the road" };
}
function speechFor(h) {
  const u = battle?.units.find(
    (u) => u.hero.id === h.id && !u.summon && !u.structure,
  );
  if (game.screen === "expedition")
    return u && u.speechUntil > battle.time ? u.speech : "";
  return campChatter.forHero(h.id, game.lastClock);
}
function heroCard(h, context = "owned") {
  const marketPick = context === "market-visit",
    staged = context === "staging" || marketPick,
    checked = (marketPick ? marketVisitors : game.staging).includes(h.id),
    status = heroById(h.id)
      ? statusOf(h)
      : {
          text: h.temporary ? "Guest adventurer" : "Recruit",
          class: "away",
          detail: h.temporary ? "One expedition" : "Finish the expedition",
        },
    speech = speechFor(h),
    u = battle?.units.find((u) => u.hero.id === h.id && !u.summon),
    max = u?.maxHp || stats(h).hp,
    hp = u?.hp ?? h.currentHp ?? max;
  return `<article class="hero-card ${selected === h.id ? "selected" : ""} ${staged && !checked ? "benched" : ""}" style="--idle-delay:-${h.appearance.idle || h.appearance.hue}s;--idle-duration:${5.5 + (h.appearance.crest || 0) * 0.65}s;--portrait-height:${Math.min(170, 105 * characterSize(h)[0])}px;--portrait-width:${Math.min(155, 100 * characterSize(h)[1])}px"><button class="hero-card-main" data-hero="${h.id}" aria-label="Inspect ${esc(h.name)}"><div class="hero-card-top">${rarityTag(heroRarity(h))}<span>${h.favorite ? "♥ " : ""}Lv ${h.level}</span></div><div class="card-health"><span data-card-hp="${h.id}">${Math.ceil(hp)} / ${max} HP</span><div class="health-track"><i data-hp-fill="${h.id}" style="width:${(hp / max) * 100}%"></i></div></div><div class="card-portrait" style="--hero-hue:${h.appearance.hue}">${portraitSvg(h)}<span class="card-speech ${speech ? "visible" : ""}" data-speech="${h.id}">${esc(speech)}</span>${h.companion ? `<span class="card-pet" title="${evolutionName(h.companion, "pet")}">${petSvg(h.companion)}</span>` : ""}</div><strong class="hero-name">${esc(h.name)}</strong><span class="hero-class">${h.race} · ${className(h)}</span><span class="character-status ${status.class}" data-status="${h.id}">${status.text} <small>${esc(status.detail)}</small></span><div class="card-xp"><span data-card-xp="${h.id}">${h.xp} / ${xpNeeded(h.level)} XP</span><span class="mini-xp"><i data-xp-fill="${h.id}" style="width:${Math.min(100, (h.xp / xpNeeded(h.level)) * 100)}%"></i></span></div></button>${staged ? button(checked ? (marketPick ? "✓ Coming" : "✓ Staged") : marketPick ? "Bring along" : "Add to party", `${marketPick ? "data-market-pick" : "data-stage"}="${h.id}" aria-pressed="${checked}" ${!available(game, h) ? "disabled" : ""}`, "deploy-toggle") : ""}</article>`;
}
function collection(
  heroes,
  heading = "Your characters",
  context = "owned",
  controls = false,
) {
  if (controls)
    heroes = heroes.filter(
      (h) =>
        (filter === "all" ||
          (filter === "favorites" && h.favorite) ||
          (filter === "ready" && available(game, h)) ||
          (filter === "away" && assignedTo(game, h))) &&
        `${h.name} ${h.race} ${className(h)}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
  return `<section class="company-section"><div class="section-heading"><div><h2>${heading} <span class="count-pill">${heroes.length}</span></h2><p>${context === "market-visit" ? "Bring up to six ready adventurers. You may also browse alone." : context === "staging" ? "Choose " + (game.screen === "arena" ? "exactly three" : "three to six") + " available characters. Formation is automatic." : "A familiar face. A new chapter."}</p></div>${
    controls
      ? `<div class="collection-controls"><select id="collection-filter" aria-label="Filter characters">${[
          ["all", "All characters"],
          ["favorites", "Favorites"],
          ["ready", "At Camp"],
          ["away", "On expedition"],
        ]
          .map(
            ([v, t]) =>
              `<option value="${v}" ${filter === v ? "selected" : ""}>${t}</option>`,
          )
          .join(
            "",
          )}</select><input id="collection-search" type="search" placeholder="Name, race, or class…" aria-label="Search characters" value="${esc(search)}"></div>`
      : ""
  }</div><div class="roster-grid">${
    [...heroes]
      .sort((a, b) => Number(b.favorite) - Number(a.favorite))
      .map((h) => heroCard(h, context))
      .join("") ||
    '<p class="empty-note">No characters match. Try another filter.</p>'
  }</div></section>`;
}
function heading(eyebrow, name, text, action = "") {
  return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${name}</h1><p>${text}</p></div>${action}</div>`;
}
function workspace(content) {
  return `<div class="workspace ${game.screen}-workspace"><div class="main-column">${content}</div><aside class="inspector"><div id="hero-detail"></div></aside></div>`;
}
function slotMeter() {
  const slots = expeditionSlots(game),
    next = SLOT_MILESTONES[slots];
  return `<div class="slot-meter"><span>${icon("flag", 18)}<strong>${activeExpeditions(game).length} / ${slots}</strong> expedition slots occupied</span><span class="slot-next">${next ? "Next at " + next + " encounters · " + game.lifetimeEncounters + " cleared" : "All four slots unlocked"}</span></div>`;
}
function expeditionCard(r) {
  const active = r.status === "active";
  return `<article class="expedition-card ${active ? "active-expedition" : ""}"><div class="expedition-card-top"><span class="eyebrow">${r.mode === "arena" ? "ARENA" : LOCATIONS[r.location].name}</span><span class="status-badge ${active ? "running" : "returned"}">${active ? "1× · Background" : r.reason === "complete" ? "Completed" : "Returned"}</span></div><h3>${esc(r.name)}</h3><div class="party-faces">${party(
    game,
    r,
  )
    .slice(0, 6)
    .map((h) => `<span title="${esc(h.name)}">${portraitSvg(h, true)}</span>`)
    .join(
      "",
    )}</div><div class="expedition-metrics"><span><strong>${r.history.filter((h) => h.survived).length} / ${r.encounters}</strong> encounters</span><span><strong>${r.earned.gold}</strong> gold</span><span><strong>${time(r.elapsedSeconds)}</strong> elapsed</span></div><p class="expedition-phase">${active ? (r.phase === "interlude" ? r.stop.name : "The company is " + (r.phase === "battle" ? "fighting" : "preparing") + ".") : r.completion || "Everyone is back at Camp."}</p><div class="card-actions">${button(active ? "Watch company" : "View report", `data-watch="${r.id}"`, "secondary-button")}${active ? button("Recall", `data-recall="${r.id}"`, "text-button") : ""}</div></article>`;
}
function campScene() {
  if (game.campZone && game.campZone !== "center") return expansionScene();
  return `<div class="camp-map local-map" data-local-map="camp" data-camp-ground><svg class="landscape-terrain" viewBox="0 0 900 390" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="camp-ground" x2="0" y2="1"><stop stop-color="#bac39e"/><stop offset="1" stop-color="#81956b"/></linearGradient></defs><path d="M0 0h900v390H0Z" fill="url(#camp-ground)"/><path d="M-30 307Q150 210 350 268T610 190T920 250" fill="none" stroke="#d1c39b" stroke-width="38"/><path d="M420 0q-10 140 74 225t-4 190" fill="none" stroke="#d1c39b" stroke-width="25"/>${[28, 100, 210, 305, 560, 645, 755, 846].map((x, i) => `<g transform="translate(${x},${i % 2 ? 32 : 340})"><ellipse cy="12" rx="26" ry="9" fill="#425a40" opacity=".2"/><path d="M0 0v20" stroke="#7c7053" stroke-width="8"/><circle cy="-9" r="25" fill="#627f51"/><circle cx="-10" cy="-18" r="16" fill="#8da771"/><circle cx="9" cy="-23" r="13" fill="#a2b584"/></g>`).join("")}<ellipse cx="414" cy="212" rx="47" ry="23" fill="#9e9b72"/><path d="m386 216 49-17m-42-5 39 26" stroke="#886146" stroke-width="8"/><path class="camp-fire" d="M400 205q-15-24 3-44 0 19 15 18 9 18-6 29Z" fill="#e4ae63"/><path d="M404 202q-6-14 5-23 2 10 10 10-1 16-10 15Z" fill="#f3d895"/><g opacity=".4" fill="#778a66"><ellipse cx="169" cy="223" rx="24" ry="7"/><ellipse cx="600" cy="282" rx="23" ry="7"/></g></svg>${portraitTerrain("camp")}${Object.entries(
    BUILDINGS,
  )
    .filter(
      ([key, b]) =>
        !b.expansion &&
        game.buildings[key] &&
        !(key === "pantry" && game.buildings.kitchen),
    )
    .map(([key, b]) => {
      const built = game.buildings[key];
      return `<button class="camp-building camp-${key} ${built ? "built" : "unbuilt"} ${key === "tent" ? "camp-tent" : ""}" style="--plot-x:${b.x}%;--plot-y:${b.y}%;--phone-x:${CAMP_PORTRAIT[key][0]}%;--phone-y:${CAMP_PORTRAIT[key][1]}%" data-building="${key}" data-drop-target="building:${key}" aria-label="${built ? "Open" : "Build"} ${b.name}"><svg viewBox="0 0 100 88" aria-hidden="true">${built ? (key === "crossroads" ? '<path d="M49 76V10" stroke="#7b6b4c" stroke-width="7"/><path d="M15 19h65l11 9-11 9H15Z" fill="#ceb780" stroke="#86744e" stroke-width="2"/><path d="M78 45H19l-9 8 9 8h59Z" fill="#b59c6a" stroke="#86744e" stroke-width="2"/>' : key === "bonfire" ? '<ellipse cx="50" cy="69" rx="35" ry="13" fill="#a09871"/><path d="m25 72 46-12m-41-6 40 21" stroke="#896446" stroke-width="8"/><path class="camp-fire" d="M38 66Q17 41 42 16q-1 24 18 19 18 19-7 34Z" fill="#e9ae63"/><path d="M44 65q-10-19 7-32 0 13 10 15 5 17-11 19Z" fill="#f4d990"/>' : key === "tent" ? '<path d="M7 69 49 11l44 58Z" fill="#c0a77a" stroke="#75674e" stroke-width="3"/><path d="m49 11 9 58H34Z" fill="#67574a"/><path d="M3 74h94" stroke="#9b8966" stroke-width="4"/>' : key === "training" ? '<path d="M10 71h80" stroke="#897958" stroke-width="8"/><path d="M18 59V15m64 44V15" stroke="#947249" stroke-width="5"/><path d="M18 28h64" stroke="#ba9c69" stroke-width="5"/><circle cx="50" cy="44" r="17" fill="#d4c49a" stroke="#9e8460" stroke-width="3"/><circle cx="50" cy="44" r="10" fill="#b08367"/><circle cx="50" cy="44" r="3" fill="#e7d3a3"/>' : '<path d="M18 35h65v38H18Z" fill="#cfbc92" stroke="#86775a" stroke-width="2"/><path d="M8 37 50 10l44 27Z" fill="' + ({ alchemist: "#9384a3", kitchen: "#a97b62", outfitter: "#809896", workbench: "#a59670", pantry: "#929169" }[key] || "#86936c") + '" stroke="#746a55" stroke-width="3"/><path d="M43 73V48h17v25" fill="#706c54"/><rect x="23" y="46" width="12" height="11" fill="#e8d6a7"/>' + (key === "alchemist" ? '<path class="rarity-sparks" d="m65 10 3-10 3 10" stroke="#e5d39f" stroke-width="3"/>' : "")) : '<path d="M15 71h70M22 67V43h56v24M24 44l25-19 29 19" fill="none" stroke="#77856a" stroke-width="2" stroke-dasharray="4 4"/><path d="M44 53h13m-6-6v13" stroke="#fff3d0" stroke-width="3"/>'}</svg><strong>${b.name}</strong></button>`;
    })
    .join(
      "",
    )}<div class="camp-map-label"><strong>${esc(game.campName || "Your Camp")}</strong><span>${Object.values(game.buildings).filter(Boolean).length} buildings · ${game.roster.length} adventurers</span></div>${campWalkers()}${game.portalUnlocked ? portalScene() : ""}<button class="camp-market-sign" data-market-visit aria-label="Choose adventurers and walk to the Market"><span aria-hidden="true">↑</span><strong>Market</strong></button>${expansionArrows()}</div>`;
}
function campView() {
  return campV7View();
}
function inventoryView() {
  return `<section class="inventory-panel" id="item-storage"><div class="section-heading"><div><h2>The belongings chest</h2><p>${game.inventory.length} equipment · ${game.companions.length} companions · ${game.scrolls.length} scrolls</p></div>${button("Open storage", "data-storage", "secondary-button")}</div><div class="inventory-grid">${
    game.inventory
      .slice(0, 6)
      .map(
        (i) =>
          `<button class="inventory-item" data-item="${i.id}">${icon(ITEMS[i.key].icon, 22)}<span><strong>${i.unidentified ? "Sealed magic relic" : evolutionName(i, "weapon")}</strong><small>${RARITIES[itemRarity(i)]} · Lv ${i.level}</small></span></button>`,
      )
      .join("") ||
    '<p class="empty-note">Find new belongings on the road. Your starters already have Common gear.</p>'
  }</div></section>`;
}
function rewardName(key) {
  if (key === "eggs") return "Dinosaur eggs · hatch two species at Archaeology";
  if (key === "dragon") return "Rare Saber + Obsidian + the Briarfall pass";
  if (key === "gate") return "Open the next region";
  if (PETS[key]) return PETS[key].name + " companion";
  if (ITEMS[key]) return ITEMS[key].name;
  if (MATERIALS[key]) return "Gather extra " + MATERIALS[key].name;
  if (RACES[key]) return "A " + key + " adventurer";
  return key === "gold"
    ? "45 bonus gold"
    : key === "pet"
      ? "Bramble fox companion"
      : key === "slot"
        ? "An expedition slot"
        : key?.startsWith("scroll:")
          ? key.slice(7) + " creation scroll"
          : COSMETICS[key]?.name + " cosmetic";
}
function campaignMap() {
  const loc = game.destination.location,
    l = LOCATIONS[loc],
    nodes = CAMPAIGNS[loc],
    positions = [
      [8, 62],
      [28, 40],
      [49, 62],
      [70, 27],
      [91, 48],
    ],
    cleared = game.campaign[loc],
    branches = BRANCHES[loc];
  return `<section class="world-map region-${loc}" style="--region:${l.color}"><div class="map-caption"><span class="eyebrow">${l.name}</span><span>${cleared} / 5 milestones · dashed trails are optional</span></div><svg viewBox="0 0 760 320" preserveAspectRatio="none" aria-hidden="true"><path d="M0 130Q100 10 250 92T490 80T760 60V320H0Z" fill="currentColor" opacity=".18"/><path d="M0 275Q140 150 300 230T570 163T760 224V320H0Z" fill="currentColor" opacity=".16"/>${loc === "marsh" ? '<path d="M350-20q-65 135 25 190t-25 180" stroke="#8da5a9" stroke-width="68" fill="none"/><path d="M339 160h62" stroke="#c9b98e" stroke-width="28"/>' : loc === "cinder" ? '<g fill="#ad8969" stroke="#e3d0aa" stroke-width="2"><path d="M126 37h29v22h-29Z"/><path d="m121 37 20-17 19 17Z"/><path d="M570 240h36v26h-36Z"/><path d="m564 240 25-19 25 19Z"/></g>' : '<g fill="#9c7c91"><path d="M425 39q18-29 36 0Z"/><path d="M440 39v12" stroke="#e0cca9" stroke-width="7"/></g>'}<path d="M61 198C122 218 151 97 213 128S298 210 372 198 450 43 532 87 636 114 692 154" fill="none" stroke="#bdad88" stroke-width="14"/><path d="M61 198C122 218 151 97 213 128S298 210 372 198 450 43 532 87 636 114 692 154" fill="none" stroke="#f1e9d4" stroke-width="3" stroke-dasharray="5 9"/>${branches.map((b) => `<path d="M${positions[b.node][0] * 7.6} ${positions[b.node][1] * 3.2}Q${b.x * 7.6 + 30} ${b.y * 3.2 - 25} ${b.x * 7.6} ${b.y * 3.2}" fill="none" stroke="#948b67" stroke-width="5" stroke-dasharray="6 6"/>`).join("")}${[110, 300, 470, 640].map((x, i) => `<path d="m${x} ${45 + (i % 2) * 210} 14-30 14 30Z" fill="currentColor" opacity=".48"/>`).join("")}</svg>${nodes.map((n, i) => `<button class="map-node ${i < cleared ? "cleared" : ""} ${i > cleared ? "locked" : ""} ${game.destination.mode === "campaign" && game.destination.node === i && !game.destination.branch ? "selected" : ""}" data-node="${i}" style="left:${positions[i][0]}%;top:${positions[i][1]}%" ${i > cleared ? "disabled" : ""} aria-label="${n[0]} · ${n[1]} encounters"><b>${i < cleared ? "✓" : i + 1}</b><span>${n[0]}</span>${i === cleared ? "<small>NEXT MILESTONE</small>" : ""}</button>`).join("")}${branches.map((b) => `<button class="map-branch ${game.destination.branch === b.id ? "selected" : ""} ${b.node > cleared ? "locked" : ""}" style="left:${b.x}%;top:${b.y}%" data-branch="${b.id}" data-node-index="${b.node}" ${b.node > cleared ? "disabled" : ""}><b>${game.branchClears[loc + ":" + b.id] ? "✓" : "✧"}</b><span>${b.name}</span><small>OPTIONAL PATH</small></button>`).join("")}</section>`;
}
function difficultyControls() {
  const journey = game.destination.mode === "journey";
  if (journey && !(game.destination.routeIndex || 0))
    return '<p class="modal-note">Direct road · fixed 1× difficulty and 1× rewards. Choose a detour to raise the challenge.</p>';
  if (
    (journey && !bossDefeated(game, game.destination.location)) ||
    (!journey && game.destination.mode !== "trial" && !game.portalUnlocked)
  )
    return `<div class="difficulty-lock">${icon("shield", 18)}<span>Defeat this region’s boss to unlock harder map difficulties.</span></div>`;
  return `<div class="difficulty-grid">${Object.entries(DIFFICULTIES)
    .filter(([id]) => !journey || id !== "story")
    .map(([id, d]) =>
      button(
        `<strong>${d.name}</strong><span>${d.reward}× rewards</span><small>${d.health}× HP · ${d.damage}× damage</small>`,
        `data-difficulty="${id}" aria-pressed="${game.destination.difficulty === id}"`,
        game.destination.difficulty === id
          ? "difficulty-card selected"
          : "difficulty-card",
      ),
    )
    .join("")}</div>`;
}
function crossroadsView() {
  return crossroadsV7View();
}
function arenaView() {
  const free = expeditionSlots(game) > activeExpeditions(game).length;
  return (
    heading(
      "FOUR BANNERS. ONE VICTOR.",
      "The Arena",
      "Three characters. Three rival companies. One battlefield.",
      button("Back to Camp", 'data-nav="camp"', "secondary-button"),
    ) +
    workspace(
      `<section class="arena-banner"><div><span class="eyebrow">THE FOUR BANNERS</span><h2>A company against the crowd.</h2><p>Face three AI teams in a simultaneous battle royale. Lions and chariots sometimes join the fight. Win 170 base gold, combat rewards, and the Champion’s gold cosmetic.</p><div class="arena-banners">${["You", "Ember", "Thistle", "Gilded"].map((s, i) => `<span style="--banner:${["#7c9b91", "#b66f60", "#9b87ae", "#bfaa71"][i]}">${icon("flag", 28)}${s}</span>`).join("")}</div><p class="small">${game.arenaWins} victories · opponents scale to your staged team’s average level · your characters return safely after defeat.</p></div></section>${slotMeter()}${difficultyControls()}<div class="launch-bar"><div><strong>${game.staging.length} / 3 characters staged</strong><p>One expedition slot · no entry fee · Arena opponents cannot be recruited.</p></div>${button("Enter the Arena", 'id="launch-btn" ' + (game.staging.length !== 3 || !free || catchingUp ? "disabled" : ""))}</div>${collection(game.roster, "Choose your three", "staging")}`,
    )
  );
}
function expeditionsView() {
  const active = activeExpeditions(game),
    returned = game.expeditions
      .filter((r) => r.status === "returned")
      .reverse();
  return (
    heading(
      "SEVERAL STORIES AT ONCE",
      "Expeditions",
      "Every company keeps its own clock. Background play is always 1×.",
      button("Plan at Camp", 'data-nav="camp"'),
    ) +
    slotMeter() +
    `<div class="expedition-grid overview">${active.map(expeditionCard).join("") || '<p class="empty-note">No one is on the road. Choose a destination at the Crossroads.</p>'}</div><div class="section-heading"><h2>Home again</h2></div><div class="expedition-grid overview">${returned.slice(0, 12).map(expeditionCard).join("") || '<p class="empty-note">Your first expedition report will appear here.</p>'}</div>`
  );
}
function autoControl(r) {
  return button(
    r.auto ? "AUTO" : "OFF",
    `data-auto="${r.id}" aria-pressed="${r.auto}" aria-label="${r.auto ? "Disable" : "Enable"} automatic encounters" title="AUTO collects stops and begins the next encounter. Leaving this view or choosing fast speed enables it."`,
    "auto-toggle " + (r.auto ? "enabled" : "disabled"),
  );
}
function countdownLabel(seconds) {
  return seconds > 1 ? String(Math.min(3, Math.ceil(seconds - 1))) : "FIGHT";
}
function battleView(r) {
  const enc = encounterFor(r);
  return `<section class="battle-panel"><div class="battle-toolbar"><span><i class="team-dot ally"></i>Your company <strong id="ally-count">—</strong></span><div><span id="battle-time">0:00</span><button class="icon-button" id="names-btn" aria-label="Toggle character names">${icon("info", 17)}</button><button class="icon-button" id="expand-btn" aria-label="Expand battlefield">${icon("expand", 17)}</button></div><span><strong id="enemy-count">—</strong>${r.mode === "arena" ? "Three rival banners" : enc.boss ? "Rare champion" : "Opposing company"}<i class="team-dot enemy"></i></span></div><div class="canvas-wrap ${expanded ? "expanded" : ""}" id="canvas-wrap"><button class="close-field icon-button" id="collapse-field" aria-label="Collapse battlefield">${icon("close")}</button><div id="fight-countdown" class="fight-countdown" role="status" aria-live="polite" ${r.phase !== "prepare" ? "hidden" : ""}>${r.phase === "prepare" ? countdownLabel(r.phaseSeconds) : ""}</div><canvas id="battlefield" role="img" aria-label="Live automatic battle. Click a character to inspect it."></canvas><div class="board-hint">${r.phase === "prepare" ? "Formation ready" : "Click a character or enemy. The selected character has white brackets and a banner."}</div></div><div class="battle-controls"><span>${icon(LOCATIONS[r.location].icon, 17)}${LOCATIONS[r.location].name}</span><div class="battle-actions">${autoControl(r)}<div class="speed-control">${[1, 2, 3].map((s) => `<button data-speed="${s}" class="${observation.speed === s ? "active" : ""}" aria-pressed="${observation.speed === s}">${s}×</button>`).join("")}</div>${button(icon(observation.paused ? "play" : "pause", 15) + (observation.paused ? "Resume" : "Pause"), 'id="pause-btn"', "secondary-button")}</div></div><div class="battle-legend"><span><i class="legend-swatch blessing"></i>Blessing</span><span><i class="legend-swatch curse"></i>Curse / Gravity</span><span><i class="legend-swatch explosion"></i>Physical Explosion</span><span><i class="selection-key"></i>Selected character</span></div></section>`;
}
function interludeView(r) {
  const s = r.stop,
    a = r.lastAward;
  return `<section class="interlude-panel"><div class="wave-clear">${icon("check", 26)}<div><span class="eyebrow victory-label">VICTORY</span><h2>You won encounter ${r.stage + 1}</h2><p>+${a.gold} gold · +${a.xp} party XP · ${a.revived} characters revived</p></div></div><div class="quick-stop"><div class="stop-mark">${icon(s.type === "fountain" ? "heart" : s.type === "chest" ? "book" : "camp", 44)}</div><div><span class="eyebrow">A MOMENT ON THE ROAD</span><h2>${s.name}</h2><p>${s.done ? s.message : r.auto ? "The company is taking a short stop." : "Continue to collect this stop and set off."}</p>${!s.done ? button("Take a moment now", 'data-stop="' + r.id + '"', "secondary-button") : ""}${s.loot ? `<div class="loot-found">${rarityTag(itemRarity(s.loot))}${ITEMS[s.loot.key].name}</div>` : ""}<span class="status-badge ${r.auto ? "running" : "waiting"}">${r.auto ? "AUTO · Continuing shortly" : "Waiting for Continue"}</span>${button("Continue", 'data-continue="' + r.id + '" ' + (catchingUp ? "disabled" : ""))}</div></div><div class="battle-controls"><span>Resting before the next encounter</span><div class="battle-actions">${autoControl(r)}<div class="speed-control">${[1, 2, 3].map((v) => `<button data-speed="${v}" class="${observation.speed === v ? "active" : ""}" aria-pressed="${observation.speed === v}">${v}×</button>`).join("")}</div>${button(icon(observation.paused ? "play" : "pause", 15) + (observation.paused ? "Resume" : "Pause"), 'id="pause-btn"', "secondary-button")}</div></div></section>`;
}
function expeditionView() {
  const r = currentExpedition();
  if (!r) return expeditionsView();
  const active = r.status === "active";
  return `<div class="page-heading"><div><span class="eyebrow">${LOCATIONS[r.location].name} · ${active ? "EXPEDITION IN PROGRESS" : "EXPEDITION REPORT"}</span><h1>${esc(r.name)} <span class="heading-pill">${active ? "Encounter " + (r.stage + 1) + " / " + r.encounters : "Returned"}</span></h1><p>${active ? "Leave this view whenever you like. The company will keep going at 1×." : r.reason === "defeat" ? "A tough encounter brought the company home. Your permanent characters, items, and earned rewards are safe. Recruits only join after a completed expedition." : r.completion || "The company is back at Camp, ready for its next chapter."}</p></div><div class="heading-actions">${button("The Camp", 'data-nav="camp"', "secondary-button")}${active ? button("Recall company", 'data-recall="' + r.id + '" ' + (catchingUp ? "disabled" : ""), "text-button") : button("Plan another at Camp", 'data-nav="camp"')}</div></div><div class="run-status"><span>${icon("flag", 17)}<strong>${r.history.filter((h) => h.survived).length}</strong> cleared</span><div class="earned-loot" id="earned-loot">${lootMetrics(r)}</div><span id="exp-time">${time(r.elapsedSeconds)} elapsed</span></div><div class="workspace"><div class="main-column">${active ? (r.phase === "interlude" ? interludeView(r) : battleView(r)) : `<section class="report-panel ${r.reason === "defeat" ? "defeat-report" : "victory-report"}"><span class="result-emblem">${icon(r.reason === "defeat" ? "skull" : "check", 52)}</span><span class="eyebrow">${r.reason === "recall" ? "COMPANY RECALLED" : r.reason === "defeat" ? "DEFEAT" : "VICTORY"}</span><h2>${r.reason === "defeat" ? "You lost encounter " + (r.stage + 1) : r.reason === "recall" ? "Company recalled" : "Expedition won"}</h2><p>${r.reason === "defeat" ? "The company recovers in 90 seconds. Stocked food halves recovery time." : "Equipment and characters kept their levels. Bonds strengthened with every cleared encounter."}</p><div class="report-numbers"><span><strong>${r.earned.gold}</strong> Gold earned</span><span><strong>${r.earned.items}</strong> Items collected</span><span><strong>${time(r.elapsedSeconds)}</strong> Time together</span></div>${button("Meet them at Camp", 'data-nav="camp"')}</section>`}${collection(party(game, r), "The company")}<section class="battle-journal"><div class="section-heading"><h2>${active ? "Battle activity" : "Encounter history"}</h2></div><div id="battle-log">${
    !active
      ? r.history
          .slice(-15)
          .reverse()
          .map(
            (e) =>
              `<div class="log-entry">${icon(e.survived ? "check" : "heart", 15)}<span>Encounter ${e.stage + 1}</span>${e.survived ? "Cleared in " + time(e.time) : "DEFEAT · Company returned"}</div>`,
          )
          .join("") ||
        '<p class="empty-note">Recalled before the first encounter ended.</p>'
      : ""
  }</div></section></div><aside class="inspector"><div id="hero-detail"></div></aside></div>`;
}
function offerInfo(o) {
  if (o.kind === "hero")
    return {
      name: o.hero.name,
      text: o.hero.race + " · " + className(o.hero),
      detail:
        MYTHICAL_HEROES[o.hero.mythicKey]?.text ||
        CLASSES[o.hero.classId].abilityText,
      tier: heroRarity(o.hero),
      art: portraitSvg(o.hero),
      sub:
        "Level " +
        o.hero.level +
        " · " +
        equipmentSlots(o.hero).length +
        " equipment slots",
    };
  if (o.kind === "item") {
    const i = o.item,
      d = itemInfo(i);
    return {
      name: i.unidentified ? "Sealed magic relic" : d.name,
      text: i.unidentified ? "Analyze at the Market before equipping." : d.desc,
      detail: d.type,
      tier: itemRarity(i),
      art: itemSvg(i),
      sub: "Level " + i.level + " · " + d.type,
    };
  }
  if (o.kind === "pet") {
    const p = PETS[o.pet.key];
    return {
      name: evolutionName(o.pet, "pet"),
      text: petInfo(o.pet).desc,
      detail: "companion " + p.mode,
      tier: itemRarity(o.pet),
      art: petSvg(o.pet),
      sub: "Level " + o.pet.level + " · companion",
    };
  }
  if (o.kind === "scroll")
    return {
      name: "Sealed creation scroll",
      text: "Analyze to discover the race within. Single-use creation recipe.",
      detail: "creation scroll",
      art: icon("book", 48),
      sub: "Analyze · 25 gold",
    };
  const d =
    TALENTS[o.key] ||
    ATTRIBUTES[o.key] ||
    COSMETICS[o.key] ||
    CONSUMABLES[o.key];
  return {
    name: d.name || o.key,
    text: d.text,
    detail: o.kind,
    art:
      o.kind === "cosmetic"
        ? cosmeticSvg(o.key)
        : icon(o.kind === "consumable" ? "heart" : "spark", 48),
    sub: title(o.kind) + (o.kind === "attribute" ? " · Common · Lv 1" : ""),
  };
}
function marketView() {
  if (game.marketDistrict && game.marketDistrict !== "square")
    return (
      heading(
        "THE LANTERN MARKET",
        "A place in the night",
        "Trades, stories and useful strangers.",
      ) + workspace(nightUi.districtView())
    );
  if (marketMode === "vendors" && vendor === "all") return marketMapView();
  let stock = VENDORS.filter(
    (v) => vendor === "all" || vendor === v.id,
  ).flatMap((v) =>
    (game.market[v.id] || []).map((o) => ({ ...o, vendorName: v.name })),
  );
  const q = marketSearch.toLowerCase();
  stock = stock.filter((o) => {
    const d = offerInfo(o);
    return (
      (!marketFor || offerFitsHero(o, heroById(marketFor))) &&
      (marketType === "all" ||
        o.kind === marketType ||
        (marketType === "scroll" &&
          o.kind === "item" &&
          ITEMS[o.item.key].type === "scroll")) &&
      (marketRarity === "all" || d.tier === Number(marketRarity)) &&
      `${d.name} ${d.text} ${d.detail} ${o.vendorName}`
        .toLowerCase()
        .includes(q)
    );
  });
  stock.sort((a, b) =>
    marketSort === "price"
      ? a.gold - b.gold
      : marketSort === "rarity"
        ? (offerInfo(b).tier ?? -1) - (offerInfo(a).tier ?? -1)
        : offerInfo(a).name.localeCompare(offerInfo(b).name),
  );
  const pages = Math.max(1, Math.ceil(stock.length / 12));
  marketPage = Math.min(marketPage, pages - 1);
  return (
    heading(
      "A PLACE FOR NEW POSSIBILITIES",
      "The Market",
      "A considered purchase. A new friend. Something worth bringing home.",
      button("Back to Camp", 'data-nav="camp"', "secondary-button"),
    ) +
    `<div class="market-services">${[
      ["combine", "shuffle", "Combine"],
      ["analyze", "book", "Analyze"],
      ["create", "army", "Create character"],
      ["forge", "sword", "Forge"],
      ["cosmetics", "wing", "Apply cosmetics"],
      ["sell", "coin", "Sell belongings"],
      ["guildhall", "gear", "Guildhall"],
      ["questboard", "book", "Quest Board"],
      ["slots", "shield", "Outfitter"],
      ["clinic", "spark", "Lantern Clinic"],
    ]
      .map(([id, i, label]) =>
        button(icon(i, 18) + label, `data-service="${id}"`, "secondary-button"),
      )
      .join(
        "",
      )}</div>${marketTabs()}${marketFocusBar()}${marketMode === "vendors" ? vendorBanner(vendor) : '<div class="catalog-heading"><h2>The full catalog</h2><p>Every available good, searchable by vendor and effect.</p></div>'}${stockTimer()}<div class="catalog-tools"><select id="market-vendor" aria-label="Filter catalog by vendor"><option value="all">Every vendor</option>${VENDORS.map((v) => `<option value="${v.id}" ${vendor === v.id ? "selected" : ""}>${v.name}</option>`).join("")}</select><input id="market-search" type="search" value="${esc(marketSearch)}" placeholder="Search names, races, classes, effects…" aria-label="Search the Market"><select id="market-type" aria-label="Filter goods type">${[
      ["all", "Every kind"],
      ["hero", "Characters"],
      ["item", "Equipment"],
      ["pet", "Companions"],
      ["scroll", "Scrolls"],

      ["consumable", "Supplies"],
      ["cosmetic", "Cosmetics"],
    ]
      .map(
        ([v, t]) =>
          `<option value="${v}" ${marketType === v ? "selected" : ""}>${t}</option>`,
      )
      .join(
        "",
      )}</select><select id="market-rarity" aria-label="Filter rarity"><option value="all">Every rarity</option>${RARITIES.map((r, i) => `<option value="${i}" ${marketRarity === String(i) ? "selected" : ""}>${r}</option>`).join("")}</select><select id="market-sort" aria-label="Sort catalog">${[
      ["name", "Name A–Z"],
      ["price", "Price low–high"],
      ["rarity", "Rarity high–low"],
    ]
      .map(
        ([v, t]) =>
          `<option value="${v}" ${marketSort === v ? "selected" : ""}>${t}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="section-heading compact"><p>${stock.length} matching goods · Page ${marketPage + 1} / ${pages}</p></div><div class="market-stock">${
      stock
        .slice(marketPage * 12, marketPage * 12 + 12)
        .map((o) => {
          const d = offerInfo(o);
          return `<article class="market-offer"><span class="eyebrow">${o.vendorName}</span><div class="offer-art">${d.art}</div>${d.tier !== undefined ? rarityTag(d.tier) : '<span class="eyebrow">' + o.kind + "</span>"}<h3>${esc(d.name)}</h3><p>${esc(d.text)}</p><small>${d.sub}</small>${o.kind === "hero" ? button("Meet this character", `data-preview="${o.id}"`, "text-button") : ""}${o.kind === "item" ? button("Compare equipped", `data-compare="${o.id}"`, "text-button") : ""}${button(o.kind === "cosmetic" && game.cosmetics.includes(o.key) ? "Already owned" : o.gold + " gold" + (o.gems ? " + " + o.gems + " gems" : ""), `data-buy="${o.id}" ${game.gold < o.gold || game.gems < o.gems || (o.kind === "cosmetic" && game.cosmetics.includes(o.key)) ? "disabled" : ""}`)}</article>`;
        })
        .join("") ||
      '<div class="empty-collection"><h3>No matching goods.</h3><p>Try a broader search or a different vendor.</p></div>'
    }</div><div class="pagination">${button("Previous", `data-page="${marketPage - 1}" ${marketPage === 0 ? "disabled" : ""}`, "secondary-button")}<span>${marketPage + 1} / ${pages}</span>${button("Next", `data-page="${marketPage + 1}" ${marketPage >= pages - 1 ? "disabled" : ""}`, "secondary-button")}</div>`
  );
}
function codexView() {
  const cats = ["All", ...new Set(CODEX.map((e) => e.category))],
    list = CODEX.filter(
      (e) =>
        (codexCategory === "All" || e.category === codexCategory) &&
        `${e.name} ${e.text} ${e.category}`
          .toLowerCase()
          .includes(codexSearch.toLowerCase()),
    ),
    entry = list.find((e) => e.name === codexSelected) || list[0];
  return (
    heading(
      "THE CAMP’S FIELD GUIDE",
      "The Codex",
      "Lore, exact rules, and practical notes for building your company.",
    ) +
    `<div class="catalog-tools codex-tools"><input id="codex-search" type="search" placeholder="Search a stat, race, class, or system…" aria-label="Search Codex" value="${esc(codexSearch)}"><select id="codex-category" aria-label="Codex category">${cats.map((c) => `<option ${codexCategory === c ? "selected" : ""}>${c}</option>`).join("")}</select><span>${list.length} entries</span></div><div class="codex-reader"><nav class="codex-index" aria-label="Codex entries">${list.map((e) => button(`<small>${e.category}</small><strong>${esc(e.name)}</strong>`, `data-codex-entry="${esc(e.name)}"`, "codex-index-entry " + (entry === e ? "selected" : ""))).join("")}</nav><article class="codex-page">${
      entry
        ? `<span class="eyebrow">${entry.category}</span><h2>${esc(entry.name)}</h2>${entry.text
            .split(/\n\n/)
            .map((p) => "<p>" + esc(p) + "</p>")
            .join(
              "",
            )}${codexTable(entry)}<div class="codex-page-note">Search the guide or use the “i” buttons throughout Camp, the Market, and your character inspector.</div>`
        : "<p>No matching entry.</p>"
    }</article></div>`
  );
}
function renderDetail() {
  return v7Detail();
}
function chooseAvailable(id) {
  return (
    game.roster.find((h) => h.id === id && available(game, h)) ||
    game.roster.find((h) => h.id === selected && available(game, h)) ||
    game.roster.find((h) => available(game, h))
  );
}
function serviceHero(h, fn) {
  if ($("service-hero"))
    $("service-hero").onchange = (e) => fn(heroById(e.target.value));
}
function showGrowth(h) {
  const levels = [1, 20, 45, 80];
  openModal(
    "Every level leaves a mark",
    `${h.race} ${CLASSES[h.classId].label}. All six stats improve.`,
    `<p class="modal-note">Level 1 foundation: ${CORE_STATS.map((k) => title(k) + " " + baseStats(h, 1)[k]).join(" · ")}. Training, gear, and attributes are added afterward.</p><div class="table-scroll"><table><thead><tr><th>Levels</th>${CORE_STATS.map((k) => "<th>" + title(k) + "</th>").join("")}</tr></thead><tbody>${levels
      .map((lv, i) => {
        const a = growthFor(RACES[h.race].growthTable, lv),
          b = growthFor(CLASSES[h.classId].growthTable, lv);
        return `<tr><th>${lv}–${levels[i + 1] ? levels[i + 1] - 1 : 100}</th>${CORE_STATS.map((k) => "<td>+" + (a[k] + b[k]).toFixed(2) + "</td>").join("")}</tr>`;
      })
      .join(
        "",
      )}</tbody></table></div><p class="small muted">Growth per level. Fractions accumulate. Level-ups fully heal the character.</p>`,
  );
}
function showTraining(h) {
  const busy = Camp.heroJob(h),
    cost = trainingCost(h),
    seconds = Camp.trainingDuration(h);
  openModal(
    "Training Grounds",
    "A permanent training Talent. One adventurer, one stat, one focused session.",
    heroPicker(h) +
      `<div class="modal-note training-summary"><strong>${esc(h.name)} · ${Camp.sessions(h)} sessions completed ${info("training")}</strong><p data-training-timer="${h.id}">${busy ? "Training in progress · ready in " + Math.max(0, Math.ceil((busy.ends - game.lastClock) / 1000)) + "s" : cost + " gold · " + time(seconds) + " real time · unavailable during the session"}</p><p>Every session increases this character’s next cost and time, including training a different stat.</p></div><div class="training-grid">${CORE_STATS.map(
        (k) => {
          const a = h.talents.find((a) => a.key === "training:" + k),
            before = a ? trainingBonus(a) : 0,
            after = trainingBonus(
              a ? { ...a, level: a.level + 1 } : { level: 1, rarityTier: 0 },
            );
          return `<div class="training-choice"><span>${title(k)} ${info(k)}</span><strong>${Number(stats(h)[k].toFixed(1))}</strong><small>${a ? RARITIES[facetRarity(a)] + " training · Lv " + a.level : "No training yet"} · permanent +${before}</small>${button("Train +" + (after - before), `data-train="${k}" data-for="${h.id}" ${busy || !available(game, h) || game.gold < cost || a?.level >= 100 ? "disabled" : ""}`)}</div>`;
        },
      ).join("")}</div>`,
    "",
    () => showTraining(heroById(h.id)),
  );
  serviceHero(h, showTraining);
}
function showEquipment(h, slot) {
  if (!h) return;
  const manage = game.screen === "camp" && heroById(h.id) && available(game, h);
  const def = equipmentSlots(h)[slot],
    current = h.items[slot];
  openModal(
    def.label + " equipment",
    def.types.map((t) => EQUIPMENT_TYPES[t]).join(" "),
    `${current ? `<div class="item-preview-art">${itemSvg(current)}</div><div class="modal-note"><strong>${itemLabel(current)}</strong><p>${ITEMS[current.key].desc}</p><p>${current.xp} / ${itemXpNeeded(current.level)} XP · Sharpened ${current.rank} / 5</p>${manage ? button("Remove equipment", `data-unequip="${h.id}" data-index="${slot}"`, "text-button") : ""}</div>` : ""}<div class="item-list">${
      (manage ? game.inventory : [])
        .filter((i) => def.types.includes(ITEMS[i.key].type) && !i.unidentified)
        .map((i) =>
          button(
            `${icon(ITEMS[i.key].icon, 22)}<span><strong>${itemLabel(i)}</strong><small>${ITEMS[i.key].desc}</small>${equipmentRestriction(h, i, slot) ? "" : nightUi.comparisonHtml(h, i, slot)}<small>${equipmentRestriction(h, i, slot) || "Can equip"}</small></span>`,
            `data-equip="${i.id}" data-for="${h.id}" data-index="${slot}" ${equipmentRestriction(h, i, slot) || i.sharpenJob ? "disabled" : ""}`,
            "item-option",
          ),
        )
        .join("") ||
      '<p class="empty-note">No compatible identified gear in storage.</p>'
    }</div>`,
  );
}
function showPet(h) {
  openModal(
    "A small traveling friend",
    "One companion follows each character. Its slot is separate from equipment.",
    heroPicker(h) +
      `${h.companion ? `<div class="modal-note">${evolutionName(h.companion, "pet")} · Lv ${h.companion.level} · ${companionSlots(h.companion)} gem sockets ${companionSlots(h.companion) ? button("Manage gems", `data-sockets="${h.id}"`, "secondary-button") : ""}${button("Return to storage", `data-remove-pet="${h.id}"`, "text-button")}</div>` : ""}<div class="item-list">${game.companions.map((p) => button(`${petSvg(p)}<span><strong>${PETS[p.key].name}</strong><small>${RARITIES[itemRarity(p)]} · Lv ${p.level} · ${petInfo(p).desc}</small></span>`, `data-pet="${p.id}" data-for="${h.id}"`, "item-option pet-option")).join("") || '<p class="empty-note">Find companions at the Menagerie, or earn your first fox at Fernbridge.</p>'}</div>`,
    "",
    () => showPet(heroById(h.id)),
  );
  serviceHero(h, showPet);
}
function showGive() {
  toast(
    "Visit the Guildhall to learn a Profession. Attributes are discovered on your travels.",
  );
}
let blacksmithTab = "improve",
  forgeQuery = "";
function blacksmithTabs(h) {
  return `<div class="storage-tabs">${[
    ["improve", "Improve"],
    ["transform", "Transform"],
    ["forge", "Forge"],
  ]
    .map(([id, label]) =>
      button(
        label,
        `data-blacksmith-tab="${id}" ${h ? 'data-for="' + h.id + '"' : ""}`,
        blacksmithTab === id ? "secondary-button selected" : "text-button",
      ),
    )
    .join("")}</div>`;
}
function showBlacksmith(h = null) {
  if (blacksmithTab === "transform") {
    showTransforms("weapon", h);
    return;
  }
  let body;
  if (blacksmithTab === "forge") {
    body = `<label class="field-label" for="forge-search">Find a weapon base</label><input id="forge-search" class="modal-select" value="${esc(forgeQuery)}" placeholder="Sword, crossbow, musket…"><div class="evolution-grid">${Object.entries(
      WEAPONS,
    )
      .filter(
        ([key, d]) =>
          !d.mythicalOnly &&
          (d.name + " " + WEAPON_KINDS[d.weaponKind])
            .toLowerCase()
            .includes(forgeQuery.toLowerCase()),
      )
      .map(([key, d]) => {
        const cost = { gold: Math.round(d.price * 0.8), wood: 2, ore: 2 };
        return `<article><div class="gear-art">${itemSvg({ key, level: 1, rank: 0 })}</div><h3>${d.name}</h3><p>${WEAPON_KINDS[d.weaponKind]} · ${d.desc}</p><small>${Camp.costText(cost)}</small>${button("Forge", `data-forge-weapon="${key}" ${!Camp.hasCost(game, cost) ? "disabled" : ""}`)}</article>`;
      })
      .join("")}</div>`;
  } else {
    const items = (
      h ? allGear(h) : [...game.inventory, ...game.roster.flatMap(allGear)]
    ).filter((i) => ITEMS[i.key].weaponKind && !i.unidentified);
    body = `<p class="modal-note">Each rank adds 20% base potency, up to five ranks. Equipped weapons keep their owner here until the work finishes. ${info("sharpen")}</p>${h ? heroPicker(h) : ""}<div class="sharpen-grid">${
      items
        .map((i) => {
          const cost = Camp.sharpeningCost(i),
            owner = game.roster.find((h) => allGear(h).includes(i));
          return `<article class="sharpen-card"><div class="gear-art">${itemSvg(i)}</div>${rarityTag(itemRarity(i))}<h3>${evolutionName(i, "weapon")}</h3><p>${owner ? esc(owner.name) : "In storage"}</p><div class="rank-pips">${Array.from({ length: 5 }, (_, n) => '<i class="' + (n < i.rank ? "filled" : "") + '"></i>').join("")}</div><p>Rank ${i.rank} / 5 · ${itemInfo(i).scale.toFixed(2)}× potency</p><small>${i.sharpenJob ? "Ready in " + Math.max(0, Math.ceil((i.sharpenJob.ends - game.lastClock) / 1000)) + "s" : Camp.costText(cost) + " · " + (20 + i.rank * 20) + "s"}</small>${button(i.sharpenJob ? "Working" : i.rank >= 5 ? "Fully improved" : "Improve +20%", `data-improve="${i.id}" ${i.sharpenJob || i.rank >= 5 || !Camp.hasCost(game, cost) || (owner && !available(game, owner)) ? "disabled" : ""}`)}</article>`;
        })
        .join("") || "<p>No identified weapons in this selection.</p>"
    }</div>`;
  }
  openModal(
    "The Blacksmith",
    "Craft a simple base. Improve its power. Transform its identity.",
    blacksmithTabs(h) + body,
    "",
    () => showBlacksmith(h && heroById(h.id)),
  );
  if (h) serviceHero(h, showBlacksmith);
  if ($("forge-search"))
    $("forge-search").oninput = (e) => {
      forgeQuery = e.target.value;
      const pos = e.target.selectionStart;
      showBlacksmith(h);
      $("forge-search").focus();
      $("forge-search").setSelectionRange(pos, pos);
    };
}
let storageQuery = "",
  storageTab = "equipment";
function showStorage() {
  const q = storageQuery.toLowerCase(),
    matches = (name) => name.toLowerCase().includes(q);
  let body = "";
  if (storageTab === "equipment")
    body = game.inventory
      .filter(
        (i) =>
          ITEMS[i.key].type !== "scroll" &&
          matches(itemLabel(i) + " " + ITEMS[i.key].desc),
      )
      .map(
        (i) =>
          `<div class="item-option"><span class="stored-art">${itemSvg(i)}</span><span><strong>${itemLabel(i)}</strong><small>${i.unidentified ? "Analyze at the Market" : ITEMS[i.key].desc}</small></span>${button("Equip", `data-storage-equip="${i.id}" ${i.unidentified || i.sharpenJob ? "disabled" : ""}`, "secondary-button")}${button("Inspect", `data-item="${i.id}"`, "text-button")}${button("Recycle", `data-recycle="${i.id}" data-kind="item" ${i.sharpenJob ? "disabled" : ""}`, "text-button danger")}</div>`,
      )
      .join("");
  if (storageTab === "companions")
    body = game.companions
      .filter((p) => matches(PETS[p.key].name))
      .map(
        (p) =>
          `<div class="item-option pet-option">${petSvg(p)}<span><strong>${PETS[p.key].name}</strong><small>Lv ${p.level} · ${RARITIES[itemRarity(p)]} · ${companionSlots(p)} gem slots</small></span>${button("Recycle", `data-recycle="${p.id}" data-kind="pet"`, "text-button danger")}</div>`,
      )
      .join("");
  if (storageTab === "scrolls")
    body = game.scrolls
      .filter((s) => matches(s.analyzed ? s.race : "sealed"))
      .map(
        (s) =>
          `<div class="item-option"><span>${icon("book", 26)}</span><span><strong>${s.analyzed ? s.race + " creation scroll" : "Sealed creation scroll"}</strong><small>${s.analyzed ? "One use · create at the Market" : "Analyze at the Market"}</small></span></div>`,
      )
      .join("");
  if (storageTab === "scrolls")
    body += game.inventory
      .filter((i) => ITEMS[i.key].type === "scroll" && matches(itemLabel(i)))
      .map(
        (i) =>
          `<div class="item-option"><span class="stored-art">${itemSvg(i)}</span><span><strong>${itemLabel(i)}</strong><small>Equippable spell scroll · ${ITEMS[i.key].desc}</small></span>${button("Equip", `data-storage-equip="${i.id}" ${i.unidentified || i.sharpenJob ? "disabled" : ""}`, "secondary-button")}${button("Inspect", `data-item="${i.id}"`, "text-button")}</div>`,
      )
      .join("");
  if (storageTab === "consumables")
    body = Object.entries(CONSUMABLES)
      .filter(([k, d]) => matches(d.name))
      .map(
        ([key, d]) =>
          `<div class="item-option">${icon(d.icon, 24)}<span><strong>${d.name} ×${game.consumables[key] || 0}</strong><small>${d.text}</small></span></div>`,
      )
      .join("");
  if (storageTab === "gems")
    body = game.gemstones
      .filter((g) =>
        matches(GEM_KINDS[g.kind].name + " " + GEM_SIZES[g.size].name),
      )
      .map(
        (g) =>
          `<div class="item-option"><span class="gem-art" style="color:${GEM_KINDS[g.kind].color}">◆</span><span><strong>${GEM_SIZES[g.size].name} ${GEM_KINDS[g.kind].name}</strong><small>${gemValue(g)} gem value · socket for +${gemValue(g)} ${GEM_KINDS[g.kind].stat}</small></span></div>`,
      )
      .join("");
  if (storageTab === "materials")
    body = Object.entries(MATERIALS)
      .filter(([k, d]) => matches(d.name))
      .map(
        ([key, d]) =>
          `<div class="item-option">${icon(d.icon, 24)}<span><strong>${game.materials[key]} ${d.name}</strong><small>${d.text}</small></span></div>`,
      )
      .join("");
  if (storageTab === "keepsakes")
    body = Object.entries(game.essences)
      .filter(([k, n]) => n > 0 && matches(k))
      .map(
        ([key, n]) =>
          `<div class="item-option">${icon("spark", 24)}<span><strong>${key} ×${n}</strong><small>${(TALENTS[key] || ATTRIBUTES[key]).text}</small></span></div>`,
      )
      .join("");
  openModal(
    "Storage",
    "All of your company’s belongings, organized by kind.",
    `<div class="storage-tabs">${["equipment", "companions", "scrolls", "consumables", "gems", "materials", "keepsakes"].map((key) => button(key === "keepsakes" ? "Old keepsakes" : title(key), `data-storage-tab="${key}"`, storageTab === key ? "secondary-button selected" : "text-button")).join("")}</div><input class="modal-select" id="storage-search" type="search" value="${esc(storageQuery)}" placeholder="Search ${storageTab}…" aria-label="Search storage"><div class="item-list">${body || '<p class="empty-note">No matching belongings in this category.</p>'}</div>`,
  );
  $("storage-search").oninput = (e) => {
    storageQuery = e.target.value;
    const pos = e.target.selectionStart;
    showStorage();
    $("storage-search").focus();
    $("storage-search").setSelectionRange(pos, pos);
  };
}
function showItem(id) {
  const i = game.inventory.find((i) => i.id === id);
  if (!i) return;
  const d = itemInfo(i);
  openModal(
    i.unidentified ? "A sealed magic relic" : d.name,
    itemLabel(i),
    `<div class="item-preview-art">${itemSvg(i)}</div><div class="modal-note"><p>${i.unidentified ? "Take this to the Curiosity Shop for analysis. It cannot be equipped until identified." : d.desc}</p><p>${EQUIPMENT_TYPES[d.type]} ${d.weaponKind ? "· " + WEAPON_KINDS[d.weaponKind] + " slot" : ""}</p>${objectModifiers(
      i,
      ITEMS[i.key].type === "armor" ? "armor" : "weapon",
    )
      .map(
        (m) =>
          "<p><strong>" +
          title(m.kind) +
          " · " +
          m.name +
          "</strong><br>" +
          m.text +
          "</p>",
      )
      .join(
        "",
      )}<p>${i.xp} / ${itemXpNeeded(i.level)} XP · Sharpened ${i.rank} / 5</p>${i.unidentified ? "" : `<p>Numeric bonuses: ${d.scale.toFixed(2)}× base</p>`}</div><p>Choose Equip to see the ready adventurers and slots that fit this item.</p>`,
    game.screen === "camp"
      ? button(
          "Equip",
          `data-storage-equip="${i.id}" ${i.unidentified || i.sharpenJob ? "disabled" : ""}`,
        ) +
          button(
            "Recycle",
            `data-recycle="${i.id}" data-kind="item"`,
            "secondary-button",
          )
      : button(
          "Sell",
          `data-sell="${i.id}" data-kind="item"`,
          "secondary-button",
        ),
  );
}
function confirmSalvage(kind, id, sell = false) {
  const obj = (
    kind === "hero"
      ? game.roster
      : kind === "pet"
        ? game.companions
        : game.inventory
  ).find((o) => o.id === id);
  if (!obj) return;
  const v = salvageValue(kind, obj),
    name =
      kind === "hero"
        ? obj.name
        : kind === "pet"
          ? PETS[obj.key].name
          : obj.unidentified
            ? "Sealed magic relic"
            : ITEMS[obj.key].name;
  openModal(
    (sell ? "Sell " : "Recycle ") + esc(name) + "?",
    kind === "hero"
      ? "This character leaves your collection. Their equipment and companion return to storage."
      : "This belonging is permanently removed from your collection.",
    `<div class="modal-note"><strong>You receive ${sell ? Math.round(v.gold * 1.35) : v.gold} gold${!sell && v.gems ? " + " + v.gems + " gems" : ""}.</strong><p>${kind === "hero" ? "The company must keep at least three characters. Favorites are protected." : !sell && obj.level < 20 ? "Equipment and companions give gems only at level 20+." : "Sales give more gold; recycling can also give gems."}</p></div>`,
    button("Keep it", "data-close", "secondary-button") +
      button(
        sell ? "Confirm sale" : "Confirm recycling",
        'id="confirm-salvage"',
      ),
  );
  $("confirm-salvage").onclick = async () => {
    if (
      await act(
        sell ? "sell" : "recycle",
        { kind, objectId: id },
        sell ? "Sold." : "Recycled.",
      )
    )
      closeModal();
  };
}
function showAnalyze() {
  const scrolls = game.scrolls.filter((s) => !s.analyzed),
    items = game.inventory.filter((i) => i.unidentified);
  openModal(
    "The Curiosity Shop",
    "Analyze a scroll or magic weapon for 25 gold. Scroll recipes are consumed when creating a character.",
    `<div class="item-list">${[...scrolls.map((s) => ({ id: s.id, name: "Sealed creation scroll" })), ...items.map((i) => ({ id: i.id, name: "Sealed magic relic · " + RARITIES[itemRarity(i)] }))].map((o) => button(`<span><strong>${o.name}</strong><small>Analyze · 25 gold</small></span>`, `data-analyze="${o.id}" ${game.gold < 25 ? "disabled" : ""}`, "item-option")).join("") || '<p class="empty-note">No sealed belongings. Find scrolls on side locations or visit the Curiosity Shop catalog.</p>'}</div><h3>Identified scrolls</h3>${game.scrolls
      .filter((s) => s.analyzed)
      .map((s) => `<p>${s.race} creation scroll · one use</p>`)
      .join("")}`,
    button("Create a character", 'data-service="create"', "secondary-button"),
    showAnalyze,
  );
}
function showCreate() {
  const scrolls = game.scrolls.filter((s) => s.analyzed);
  openModal(
    "A new beginning",
    "Use one analyzed scroll, 160 gold, and six gems to create a uniquely named level-1 character.",
    `<label class="field-label" for="create-scroll">Creation scroll</label><select class="modal-select" id="create-scroll">${scrolls.map((s) => `<option value="${s.id}">${s.race} · one use</option>`).join("") || '<option value="">No analyzed scrolls</option>'}</select><label class="field-label" for="create-class">Class</label><select class="modal-select" id="create-class">${Object.entries(
      CLASSES,
    )
      .filter(([k]) => !["witch", "stormcaller"].includes(k))
      .map(
        ([k, c]) =>
          `<option value="${k}">${c.label} · ${c.slots.length} equipment slots</option>`,
      )
      .join(
        "",
      )}</select><p class="modal-note">A racial attribute, an active class ability, and Common starting equipment. Gems come mainly from recycling characters; high-level gear and companions can also yield gems.</p>`,
    button(
      "Create · 160 gold + 6 gems",
      'id="confirm-create" ' +
        (!scrolls.length || game.gold < 160 || game.gems < 6 ? "disabled" : ""),
    ),
  );
  $("confirm-create").onclick = async () => {
    const s = game.scrolls.find((s) => s.id === $("create-scroll").value);
    if (
      s &&
      (await act(
        "build",
        { race: s.race, classId: $("create-class").value, scrollId: s.id },
        "A new character joins your story.",
      ))
    )
      closeModal();
  };
}
function showCombine(h) {
  const donors = game.roster.filter(
    (a) =>
      available(game, a) &&
      !a.favorite &&
      a.id !== h.id &&
      a.classId !== h.classId &&
      !h.fusion.some((f) => f.classId === a.classId),
  );
  openModal(
    "Combine characters",
    "The receiving character inherits the donor’s active ability. Combining consumes the donor.",
    heroPicker(h) +
      `<p class="modal-note">Receiver: <strong>${esc(h.name)}</strong> · ${abilities(h).length} / 10 abilities. Cost: 80 gold + 3 gems. The donor’s equipment and pet return to storage. At least three characters must remain.</p><div class="item-list">${donors.map((d) => button(`<span class="mini-portrait">${portraitSvg(d, true)}</span><span><strong>${esc(d.name)}</strong><small>Inherit ${CLASSES[d.classId].ability} at 60% power; keep its level and rarity.</small></span>`, `data-combine-review="${d.id}" data-for="${h.id}" ${game.roster.filter((v) => !v.retired).length <= 3 || abilities(h).length >= 10 || game.gold < 80 || game.gems < 3 ? "disabled" : ""}`, "item-option")).join("") || '<p class="empty-note">No available donors of another class. Favorites are protected.</p>'}</div>`,
  );
  serviceHero(h, showCombine);
}
function reviewCombine(h, donor) {
  openModal(
    "Carry their story forward?",
    `${h.name} will inherit ${CLASSES[donor.classId].ability}.`,
    `<div class="modal-note"><strong>${esc(donor.name)} will permanently leave the collection.</strong><p>Their equipment and companion return to storage. ${esc(h.name)} keeps their identity, memories, and ${donor.name.replace(/[<>&]/g, "")}’s ability.</p><p>80 gold + 3 gems</p></div>`,
    button("Keep both", "data-close", "secondary-button") +
      button("Confirm combination", 'id="confirm-combine"'),
  );
  $("confirm-combine").onclick = async () => {
    if (
      await act(
        "combine",
        { id: h.id, donorId: donor.id },
        "A story carried forward.",
      )
    )
      closeModal();
  };
}
function showForge() {
  openModal(
    "The Forge",
    "Craft Common armor, accessories and companions. Weapon bases are crafted at your Camp’s Blacksmith. Each recipe here uses one gem.",
    `<div class="item-list">${Object.entries(ITEMS)
      .filter(([key, d]) => !d.weaponKind && !d.mythicalOnly)
      .map(([key, d]) =>
        button(
          `${icon(d.icon, 22)}<span><strong>${d.name}</strong><small>${d.desc}</small><small>${Math.round(d.price * 1.8)} gold + 1 gem</small></span>`,
          `data-forge="${key}" data-kind="item" ${game.gold < Math.round(d.price * 1.8) || game.gems < 1 ? "disabled" : ""}`,
          "item-option",
        ),
      )
      .join(
        "",
      )}</div><h3>Companion workshop</h3><div class="item-list">${Object.entries(
      PETS,
    )
      .filter(([key, d]) => !d.eggOnly && !d.fossilOnly)
      .map(([key, d]) =>
        button(
          `${petSvg({ key })}<span><strong>${d.name}</strong><small>${d.text}</small><small>${Math.round(d.price * 1.8)} gold + 1 gem</small></span>`,
          `data-forge="${key}" data-kind="pet" ${game.gold < Math.round(d.price * 1.8) || game.gems < 1 ? "disabled" : ""}`,
          "item-option pet-option",
        ),
      )
      .join("")}</div>`,
    "",
    showForge,
  );
}
function showCosmetics(h) {
  const targets = [
    ...allGear(h).filter((i) => ITEMS[i.key].weaponKind),
    h.companion,
  ].filter(Boolean);
  openModal(
    "The Atelier",
    "Change a whole character look, a weapon’s finish, or a companion’s appearance.",
    heroPicker(h) +
      `<h3>Character guises and colors</h3><div class="cosmetic-grid">${["none", ...game.cosmetics.filter((k) => !["weapon", "pet"].includes(COSMETICS[k].type))].map((key) => `<article><div class="cosmetic-preview">${key === "none" ? portraitSvg({ ...h, cosmetic: null }) : cosmeticSvg(key)}</div><strong>${key === "none" ? "Original appearance" : COSMETICS[key].name}</strong><p>${key === "none" ? "Return to their own look." : COSMETICS[key].text}</p>${button(h.cosmetic === key ? "Worn" : "Apply", `data-cosmetic="${key}" data-for="${h.id}"`, "secondary-button")}</article>`).join("")}</div><h3>Weapon and companion appearances</h3>${
        targets
          .map((i) => {
            const pet = i === h.companion,
              choices = game.cosmetics.filter((k) =>
                pet
                  ? COSMETICS[k].type === "pet"
                  : COSMETICS[k].type === "weapon" &&
                    COSMETICS[k].kinds.includes(ITEMS[i.key].weaponKind),
              );
            return `<section class="cosmetic-target"><h4>${evolutionName(i, pet ? "pet" : "weapon")}</h4><div class="cosmetic-grid">${["none", ...choices].map((key) => `<article><div class="cosmetic-preview">${pet ? petSvg({ ...i, cosmetic: key === "none" ? null : key }) : itemSvg({ ...i, cosmetic: key === "none" ? null : key })}</div><strong>${key === "none" ? "Original appearance" : COSMETICS[key].name}</strong>${button("Apply", `data-cosmetic="${key}" data-for="${h.id}" data-object="${i.id}"`, "secondary-button")}</article>`).join("")}</div></section>`;
          })
          .join("") ||
        "<p>Equip a weapon or companion at Camp to customize it here.</p>"
      }`,
    "",
    () => showCosmetics(heroById(h.id)),
  );
  serviceHero(h, showCosmetics);
}
function showSell() {
  openModal(
    "A place for unused belongings",
    "Sales yield 35% more gold than recycling, and no gems. Equipped gear must be removed at Camp first.",
    `<div class="item-list">${[...game.inventory.map((o) => ({ o, kind: "item", name: o.unidentified ? "Sealed magic relic" : ITEMS[o.key].name })), ...game.companions.map((o) => ({ o, kind: "pet", name: PETS[o.key].name })), ...game.roster.filter((h) => available(game, h)).map((o) => ({ o, kind: "hero", name: o.name }))].map(({ o, kind, name }) => `<div class="item-option"><span><strong>${esc(name)}</strong><small>Lv ${o.level} · ${Math.round(salvageValue(kind, o).gold * 1.35)} gold</small></span>${button("Sell", `data-sell="${o.id}" data-kind="${kind}" ${kind === "hero" && (o.favorite || game.roster.filter((v) => !v.retired).length <= 3) ? "disabled" : ""}`, "secondary-button")}</div>`).join("")}</div>`,
  );
}
function useService(service, id) {
  const campServices = {
    archaeology: showArchaeology,
    farm: () => showCampPlot("farm"),
    garden: () => showCampPlot("garden"),
    cabins: (h) => showCampPlot("cabins", h),
    characters: showCharacters,
    armory: () =>
      game.buildings.armory ? nightUi.showWorkshop() : showBuilding("armory"),
    dock: () => nightUi.showDock(),
    bonfire: showBonfire,
    crossroads: () => navigate("crossroads"),
    pantry: showPantry,
    kitchen: showKitchen,
    alchemy: showAlchemy,
    storage: showStorage,
  };
  if (campServices[service]) {
    if (game.screen === "camp")
      campServices[service](heroById(id) || chooseAvailable(selected));
    return;
  }
  if (game.screen === "camp") {
    const building = {
      training: "training",
      blacksmith: "blacksmith",
    }[service];
    if (building && !game.buildings[building]) {
      showBuilding(building);
      return;
    }
  }
  const marketServices = {
    analyze: showAnalyze,
    create: showCreate,
    forge: showForge,
    sell: showSell,
    guildhall: () => nightUi.showGuild(),
    clinic: () => nightUi.showClinic(),
    questboard: () => nightUi.showQuestBoard(),
    slots: () => showSlots(chooseAvailable(selected) || game.roster[0]),
  };
  if (marketServices[service]) {
    if (game.screen === "market") marketServices[service]();
    return;
  }
  const isMarket = ["combine", "cosmetics"].includes(service);
  if (game.screen !== (isMarket ? "market" : "camp")) return;
  const h = heroById(id) || chooseAvailable(id);
  if (service === "blacksmith") {
    showBlacksmith(id ? heroById(id) : null);
    return;
  }
  if (!h) {
    toast("Your characters are traveling, recovering, or training.");
    return;
  }
  ({
    slots: showSlots,
    training: showTraining,
    pet: showPet,
    give: showGive,
    combine: showCombine,
    cosmetics: showCosmetics,
  })[service]?.(h);
}
function confirmRecall(id) {
  const r = game.expeditions.find((r) => r.id === id);
  openModal(
    "Bring the company home?",
    r.name,
    `<div class="modal-note"><p>Keep your permanent characters, their equipment, levels, and ${r.earned.gold} earned gold.</p><p>This destination will remain unfinished. ${r.recruits.length} recruit${r.recruits.length === 1 ? "" : "s"} will leave instead of joining permanently.</p></div>`,
    button("Keep traveling", "data-close", "secondary-button") +
      button("Recall company", 'id="confirm-recall"'),
  );
  $("confirm-recall").onclick = async () => {
    if (await act("recall", { id }, "The company is home.")) closeModal();
  };
}
function help() {
  openModal(
    esc(game.campName || "Your Camp"),
    "A company worth getting to know.",
    `<div class="help-list"><p><strong>Begin at the Crossroads.</strong> Your three level-5 adventurers are yours to keep. Click the Crossroads sign in Camp. Choose a destination and a highlighted route, then assemble a party and pack supplies on the next screen.</p><p><strong>Background is always 1×.</strong> Expeditions continue in a dedicated browser worker. If the browser suspends or closes this page, they catch up at 1× when you return. Fast speed works only while overseeing a focused battle. Leaving the view or selecting fast speed enables AUTO. With AUTO off, each cleared encounter waits for Continue.</p><p><strong>New regions.</strong> Defeat the boss at Thornwatch Castle to meet Eldrin beside the Crossroads. His portal opens the next map. Each region’s boss unlocks the next region and difficulty controls for that map.</p><p><strong>Move your adventurers.</strong> Tap or click a resident, then drag them onto a service in Camp or a vendor at the Market. Touch and mouse work the same way.</p><p><strong>Build a home.</strong> Click Camp’s labeled buildings. Gather materials to build Training Grounds, a Blacksmith, the Outfitter, Kitchen, and Alchemist.</p><p><strong>Everyone comes home.</strong> Adventurers recover to full health over real time. Stock food to shorten the wait. Finish a destination to keep its recruits.</p><p><strong>New pages.</strong> Challenges contain a new single battle each day, monthly milestones, and player teams with pledged loot. The gem-only Shop offers cosmetics and Mythical gear. Market vendors restock every 12 hours.</p><p>This update begins a fresh Camp season with three level-5 adventurers. Progress is saved on this device; challenges use a shared board.</p></div>`,
    button("Export Camp", 'id="export-camp"', "secondary-button") +
      button("Import Camp", 'id="import-camp"', "secondary-button") +
      button("Read the Codex", 'data-nav="codex"', "secondary-button"),
  );
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  $("export-camp").onclick = async () => {
    const saved = await client.checkpoint(),
      url = URL.createObjectURL(
        new Blob([exportCamp(saved.game)], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "camp-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("import-camp").onclick = () => input.click();
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const imported =
      file.size <= 5000000 ? readCampBackup(await file.text()) : null;
    if (!imported) {
      toast("This file is not a valid Camp backup.");
      return;
    }
    openModal(
      "Restore a Camp",
      esc(imported.campName || "Your Camp"),
      `<div class="modal-note"><p>${imported.roster.length} adventurers · ${imported.gold} gold · ${imported.gems} gem value</p><p>This replaces the Camp saved on this device with the selected backup.</p></div>`,
      button("Keep this Camp", "data-close", "secondary-button") +
        button("Use this Camp", 'id="confirm-import-camp"'),
    );
    $("confirm-import-camp").onclick = () => {
      client.close();
      selected = null;
      selectedUid = null;
      signature = "";
      client = createClient(onUpdate, imported);
      closeModal();
      client.ready.then(() => syncObservation());
    };
  };
}
async function navigate(screen) {
  if (screen === "crossroads") {
    mapZoom = 1;
    mapViews.clear();
  }
  selectedUid = null;
  expanded = false;
  if ($("modal").open) closeModal();
  if (await act("navigate", { screen })) {
    if (screen === "challenges" && challengeTab === "players") loadChallenges();
    if (["camp", "crossroads"].includes(screen)) selected = null;
    if (["party", "calendar", "arena"].includes(screen))
      selected = game.staging[0] || game.roster[0]?.id;
    render(true);
    await syncObservation();
  }
}
function chooseHero(id) {
  if (["camp", "market"].includes(game.screen) && $("modal").open) closeModal();
  selected = game.screen === "camp" && selected === id ? null : id;
  selectedUid = null;
  if (game.screen === "expedition" && battle)
    selectedUid =
      battle.units.find((u) => u.hero.id === id && !u.structure && !u.summon)
        ?.uid ?? null;
  document
    .querySelectorAll("[data-hero]")
    .forEach((b) =>
      b
        .closest(".hero-card")
        ?.classList.toggle("selected", b.dataset.hero === id),
    );
  renderDetail();
  if (renderer) renderer.selected = selectedUid;
}
function bindActions(root = document) {
  const bind = (selector, fn) =>
    root.querySelectorAll(selector).forEach((b) => (b.onclick = () => fn(b)));
  const apply = async (type, args, message) => {
    if (await act(type, args, message)) {
      if (modalRefresh) modalRefresh();
      else closeModal();
    }
  };
  bind("[data-expand-camp]", (b) => showExpansion(b.dataset.expandCamp));
  bind("[data-camp-zone]", (b) => act("campZone", { key: b.dataset.campZone }));
  bind("[data-harvest]", (b) =>
    apply("harvest", { key: b.dataset.harvest }, "Harvest brought to storage."),
  );
  bind("[data-release]", (b) => confirmRelease(b.dataset.release));
  bind("[data-arrival]", (b) =>
    apply("arrival", { id: b.dataset.arrival }, "Welcome to Camp."),
  );
  bind("[data-fossil]", (b) =>
    apply("fossil", { key: b.dataset.fossil }, "A fossil has found new life."),
  );
  bind("[data-forge-weapon]", (b) =>
    apply(
      "forgeWeapon",
      { key: b.dataset.forgeWeapon },
      "A new weapon forged.",
    ),
  );
  bind("[data-blacksmith-tab]", (b) => {
    blacksmithTab = b.dataset.blacksmithTab;
    showBlacksmith(heroById(b.dataset.for));
  });
  bind("[data-gem-buy]", (b) =>
    act("gemBuy", { offerId: b.dataset.gemBuy }, "Added to your collection."),
  );
  bind("[data-gem-filter]", (b) => {
    gemFilter = b.dataset.gemFilter;
    render(true);
  });
  bind("[data-challenge-tab]", (b) => {
    challengeTab = b.dataset.challengeTab;
    render(true);
    if (challengeTab === "players") loadChallenges();
  });
  bind("[data-trial]", async (b) => {
    if (
      await act(
        "stageTrial",
        b.dataset.trial === "daily"
          ? { challengeId: "daily", day: Number(b.dataset.day) }
          : {
              challengeId: b.dataset.trial,
              bossLocation: b.dataset.bossLocation,
            },
      )
    )
      showTrialParty();
  });
  bind("[data-nav]", (b) => navigate(b.dataset.nav));
  bind("[data-close]", closeModal);
  bind("[data-hero]", (b) => {
    if (b.dataset.ignoreClick !== "yes") chooseHero(b.dataset.hero);
  });
  bind("[data-stage]", async (b) => {
    await act("stage", { id: b.dataset.stage });
    if (modalRefresh) modalRefresh();
  });
  bind("[data-service]", (b) => useService(b.dataset.service, b.dataset.for));
  bind("[data-storage]", showStorage);
  bind("[data-item]", (b) => showItem(b.dataset.item));
  bind("[data-watch]", async (b) => {
    selectedUid = null;
    if (await act("watch", { id: b.dataset.watch })) {
      chooseHero(currentExpedition().party[0]);
      await syncObservation();
    }
  });
  bind("[data-recall]", (b) => confirmRecall(b.dataset.recall));
  bind("[data-stop]", (b) => act("stop", { id: b.dataset.stop }));
  bind("[data-continue]", (b) => act("continue", { id: b.dataset.continue }));
  bind("[data-auto]", (b) =>
    act("auto", { id: b.dataset.auto, on: !currentExpedition().auto }),
  );
  bind("[data-region]", (b) => {
    mapZoom = 1;
    mapViews.clear();
    return act("destination", {
      mode: "journey",
      location: b.dataset.region,
      target: REGIONS[b.dataset.region].first,
      routeIndex: 0,
    });
  });
  bind("[data-destination]", async (b) => {
    if (
      await act("destination", {
        mode: "journey",
        target: b.dataset.destination,
        routeIndex: 0,
      })
    )
      if (window.matchMedia?.("(max-width: 600px)").matches)
        $("route-planner")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
  });
  bind("[data-route-index]", (b) =>
    act("destination", { routeIndex: Number(b.dataset.routeIndex) }),
  );
  bind("[data-node]", (b) =>
    act("destination", {
      mode: "campaign",
      node: Number(b.dataset.node),
      branch: null,
    }),
  );
  bind("[data-event]", (b) =>
    act("destination", { mode: "event", event: b.dataset.event }),
  );
  bind("[data-route]", (b) => act("destination", { route: b.dataset.route }));
  bind("[data-difficulty]", (b) =>
    act("destination", { difficulty: b.dataset.difficulty }),
  );
  bind("[data-trial-difficulty]", async (b) => {
    if (
      await act("stageTrial", {
        ...game.destination,
        difficulty: b.dataset.trialDifficulty,
      })
    )
      showTrialParty();
  });
  bind("[data-favorite]", (b) => act("favorite", { id: b.dataset.favorite }));
  bind("[data-growth]", (b) =>
    showGrowth(heroById(b.dataset.growth) || selectedHero()),
  );
  bind("[data-tent-list]", showCharacters);
  bind("[data-slot]", (b) => {
    const h = selectedHero(),
      index = Number(b.dataset.slot);
    if (heroById(h?.id)) act("equipmentSeen", { id: h.id, index });
    showEquipment(h, index);
  });
  bind("[data-recover]", (b) =>
    act("recover", { id: b.dataset.recover }, "Recovered and ready."),
  );
  bind("[data-rename]", (b) => {
    const h = heroById(b.dataset.rename);
    openModal(
      "A name of their own",
      "Give this character a name you will remember.",
      `<label class="field-label" for="hero-name-input">Name</label><input id="hero-name-input" class="modal-select" maxlength="32" value="${esc(h.name)}">`,
      button("Save name", 'id="confirm-name"'),
    );
    $("confirm-name").onclick = () =>
      apply("rename", { id: h.id, name: $("hero-name-input").value });
  });
  bind("[data-train]", (b) =>
    apply(
      "train",
      { id: b.dataset.for, stat: b.dataset.train },
      "Training has begun.",
    ),
  );
  bind("[data-transform]", (b) =>
    apply(
      "transform",
      { id: b.dataset.for, path: b.dataset.path, choice: b.dataset.transform },
      "A new chapter begins.",
    ),
  );
  bind("[data-equip]", (b) =>
    apply(
      "equip",
      {
        id: b.dataset.for,
        itemId: b.dataset.equip,
        slot: Number(b.dataset.index),
      },
      "Equipment changed.",
    ),
  );
  bind("[data-unequip]", (b) =>
    apply(
      "unequip",
      { id: b.dataset.unequip, slot: Number(b.dataset.index) },
      "Returned to storage.",
    ),
  );
  bind("[data-improve]", (b) =>
    apply("improve", { itemId: b.dataset.improve }, "Sharpening has begun."),
  );
  bind("[data-unlock]", (b) =>
    apply(
      "unlock",
      { id: b.dataset.for, itemType: b.dataset.unlock },
      "Equipment slot unlocked.",
    ),
  );
  bind("[data-pet]", (b) =>
    apply(
      "pet",
      { id: b.dataset.for, petId: b.dataset.pet },
      "A new traveling friend.",
    ),
  );
  bind("[data-remove-pet]", (b) =>
    apply("removePet", { id: b.dataset.removePet }),
  );
  bind("[data-attribute]", (b) =>
    apply(
      "attribute",
      { id: b.dataset.for, attribute: b.dataset.attribute },
      "An attribute discovered.",
    ),
  );
  bind("[data-consume]", (b) =>
    apply(
      "consume",
      { id: b.dataset.for, key: b.dataset.consume },
      "Item given.",
    ),
  );
  bind("[data-recycle-hero]", (b) =>
    confirmSalvage("hero", b.dataset.recycleHero),
  );
  bind("[data-recycle]", (b) =>
    confirmSalvage(b.dataset.kind, b.dataset.recycle),
  );
  bind("[data-sell]", (b) =>
    confirmSalvage(b.dataset.kind, b.dataset.sell, true),
  );
  bind("[data-analyze]", (b) =>
    apply(
      "analyze",
      { objectId: b.dataset.analyze },
      "Its secret is revealed.",
    ),
  );
  bind("[data-forge]", (b) =>
    apply(
      "forge",
      { kind: b.dataset.kind, key: b.dataset.forge },
      "A new belonging forged.",
    ),
  );
  bind("[data-cosmetic]", (b) =>
    apply(
      "cosmetic",
      {
        id: b.dataset.for,
        key: b.dataset.cosmetic,
        objectId: b.dataset.object,
      },
      "A new look.",
    ),
  );
  bind("[data-combine-review]", (b) =>
    reviewCombine(heroById(b.dataset.for), heroById(b.dataset.combineReview)),
  );
  bind("[data-vendor]", (b) => openVendor(b.dataset.vendor, marketFor));
  bind("[data-market-mode]", (b) => {
    marketMode = b.dataset.marketMode;
    vendor = "all";
    marketFor = null;
    marketPage = 0;
    render(true);
  });
  bind("[data-page]", (b) => {
    marketPage = Number(b.dataset.page);
    render(true);
  });
  bind("[data-buy]", async (b) => {
    if (
      await act("buy", { offerId: b.dataset.buy }, "Added to your collection.")
    )
      if ($("modal").open) {
        if (modalRefresh === showVendorShop) showVendorShop();
        else closeModal();
      }
  });
  bind("[data-preview]", (b) => {
    const o = Object.values(game.market)
        .flat()
        .find((o) => o.id === b.dataset.preview),
      h = o.hero;
    openModal(
      esc(h.name),
      h.race + " " + className(h),
      `<div class="character-preview">${portraitSvg(h)}<div class="stat-six">${CORE_STATS.map((k) => `<div><strong>${stats(h)[k]}</strong><small>${title(k)}</small></div>`).join("")}</div></div><p>${CLASSES[h.classId].abilityText}</p><p>${RACES[h.race].text}</p>`,
      button(
        "Hire · " + o.gold + " gold",
        `data-buy="${o.id}" ${game.gold < o.gold ? "disabled" : ""}`,
      ),
    );
  });
  bind("[data-refresh-challenges]", loadChallenges);
  bind("[data-challenge-hero]", (b) => {
    const id = b.dataset.challengeHero;
    challengeSelection = challengeSelection.includes(id)
      ? challengeSelection.filter((v) => v !== id)
      : challengeSelection.length < 3
        ? [...challengeSelection, id]
        : challengeSelection;
    render(true);
  });
  bind("[data-post-challenge]", () => reviewChallenge());
  bind("[data-attack-challenge]", (b) =>
    reviewChallenge(
      challengeBoard.offers.find((o) => o.id === b.dataset.attackChallenge),
    ),
  );
  bind("[data-claim-challenge]", (b) =>
    claimChallenge(b.dataset.claimChallenge),
  );
  bind("[data-cancel-challenge]", (b) =>
    cancelChallenge(b.dataset.cancelChallenge),
  );
  bind("[data-challenge-replay]", (b) =>
    replayChallenge(b.dataset.challengeReplay),
  );
  bind("[data-retry-challenge]", (b) => {
    const d = game.challengeDeposits[b.dataset.retryChallenge];
    if (d?.payload) submitChallenge(d.payload.path, d.payload.body);
  });
  bind("[data-rename-camp]", () => onboarding(true));
  bind("[data-building]", (b) => showBuilding(b.dataset.building));
  bind("[data-construct]", (b) =>
    apply("construct", { key: b.dataset.construct }, "A new building at home."),
  );
  bind("[data-food]", (b) => apply("food", { count: Number(b.dataset.food) }));
  bind("[data-cook]", (b) => apply("cook", { key: b.dataset.cook }));
  bind("[data-brew]", (b) => apply("brew", { key: b.dataset.brew }));
  bind("[data-fuse]", (b) =>
    apply("fuseGems", { kind: b.dataset.fuse, size: Number(b.dataset.size) }),
  );
  bind("[data-transmute]", (b) =>
    apply("transmute", {
      gemId: $("transmute-gem").value,
      material: b.dataset.transmute,
    }),
  );
  bind("[data-storage-tab]", (b) => {
    storageTab = b.dataset.storageTab;
    showStorage();
  });
  bind("[data-pack]", (b) => act("pack", { key: b.dataset.pack }));
  bind("[data-branch]", (b) =>
    act("destination", {
      mode: "campaign",
      branch: b.dataset.branch,
      node: Number(b.dataset.nodeIndex),
    }),
  );
  bind("[data-calendar-day]", (b) =>
    act("destination", {
      mode: "calendar",
      day: Number(b.dataset.calendarDay),
      month: calendarMonth(game.lastClock).key,
    }),
  );
  bind("[data-info]", (b) =>
    openModal(
      title(b.dataset.info),
      "From the Codex",
      `<p class="modal-note">${esc(CONTEXT[b.dataset.info] || "See the Codex.")}</p>`,
      button("Open Codex", 'data-nav="codex"', "secondary-button"),
    ),
  );
  bind("[data-codex-entry]", (b) => {
    codexSelected = b.dataset.codexEntry;
    render(true);
  });
  bind("[data-sockets]", (b) => showSockets(heroById(b.dataset.sockets)));
  bind("[data-socket-tab]", (b) =>
    showSockets(heroById(b.dataset.for), Number(b.dataset.socketTab)),
  );
  bind("[data-socket]", (b) =>
    apply("socket", {
      id: b.dataset.for,
      gemId: b.dataset.socket,
      index: Number(b.dataset.index),
    }),
  );
  bind("[data-unsocket]", (b) =>
    apply("unsocket", { id: b.dataset.for, index: Number(b.dataset.unsocket) }),
  );
  bind("[data-deselect]", () => {
    selected = null;
    renderDetail();
  });
  bind("[data-explain]", (b) =>
    showExplanation(b.dataset.explain, Number(b.dataset.index)),
  );
  bind("[data-armor-slot]", (b) => {
    const h = selectedHero(),
      index = Number(b.dataset.armorSlot);
    if (heroById(h?.id)) act("equipmentSeen", { id: h.id, index, armor: true });
    showArmor(h, index);
  });
  bind("[data-equip-armor]", (b) =>
    apply("armor", {
      id: b.dataset.for,
      itemId: b.dataset.equipArmor,
      index: Number(b.dataset.index),
    }),
  );
  bind("[data-remove-armor]", (b) =>
    apply("removeArmor", {
      id: b.dataset.removeArmor,
      index: Number(b.dataset.index),
    }),
  );
  bind("[data-bonfire-tab]", (b) => {
    bonfireTab = b.dataset.bonfireTab;
    showBonfire();
  });
  bind("[data-class-node]", (b) =>
    reviewClassNode(b.dataset.for, b.dataset.classNode),
  );
  bind("[data-evolve]", (b) => {
    const value = $("form-" + b.dataset.evolve)?.value?.split(":");
    return apply(
      "evolve",
      {
        kind: b.dataset.kind,
        objectId: b.dataset.evolve,
        choice: value ? { kind: value[0], key: value[1] } : null,
      },
      "A familiar belonging transformed.",
    );
  });
  bind("[data-hatch]", (b) =>
    apply("hatch", { key: b.dataset.hatch }, "A prehistoric friend hatched."),
  );
  bind("[data-talent]", (b) =>
    apply(
      "talent",
      { id: b.dataset.for, key: b.dataset.talent },
      "A Talent learned.",
    ),
  );
  bind("[data-quest]", (b) =>
    act("quest", { id: b.dataset.quest }, "Quest rewards collected."),
  );
  bind("[data-track-quest]", (b) =>
    act("trackQuest", { id: b.dataset.trackQuest }),
  );
  bind("[data-quest-map]", async (b) => {
    const q = questById(game, b.dataset.questMap);
    if (game.trackedQuest !== q.id) await act("trackQuest", { id: q.id });
    if (game.screen !== "camp") await navigate("camp");
    await navigate("crossroads");
    if (
      game.regionUnlocks.includes(q.location) &&
      visibleNodes(game, q.location).has(q.target)
    )
      await act("destination", {
        mode: "journey",
        location: q.location,
        target: q.target,
        routeIndex: 0,
      });
  });
  bind("[data-review-roads]", () =>
    $("region-map-viewport")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    }),
  );
  bind("[data-lock-route]", async () => {
    if (await act("lockRoute")) {
      selected = game.staging[0] || null;
      render(true);
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  });
  bind("[data-market-visit]", showMarketVisit);
  bind("[data-market-pick]", (b) => {
    marketVisitors = marketVisitors.includes(b.dataset.marketPick)
      ? marketVisitors.filter((id) => id !== b.dataset.marketPick)
      : marketVisitors.length < 6
        ? [...marketVisitors, b.dataset.marketPick]
        : marketVisitors;
    showMarketVisit();
  });
  bind("[data-vendor-map]", (b) => openVendor(b.dataset.vendorMap, marketFor));
  bind("[data-market-clear]", () => {
    marketFor = null;
    render(true);
  });
  bind("[data-build-sites]", showBuildSites);
  bind("[data-island-preview]", () =>
    game.buildings.dock
      ? nightUi.showDock()
      : openModal(
          "The Bell Beneath",
          "An island goal",
          "<p>A violet bell glows across the lake. Build a Lantern Dock at the south lakeshore to reach its 25-floor dungeon.</p>",
        ),
  );
  bind("[data-portal]", showPortal);
  bind("[data-speed]", (b) =>
    syncObservation({ speed: Number(b.dataset.speed), paused: false }),
  );
  nightUi.bind(root);
}
function bind() {
  bindActions();
  bindMapControls();
  document
    .querySelector("[data-camp-ground]")
    ?.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        selected = null;
        renderDetail();
      }
    });
  const input = (id, set) => {
      if ($(id))
        $(id).oninput = (e) => {
          set(e.target.value);
          const pos = e.target.selectionStart;
          render(true);
          $(id)?.focus();
          $(id)?.setSelectionRange(pos, pos);
        };
    },
    change = (id, set) => {
      if ($(id))
        $(id).onchange = (e) => {
          set(e.target.value);
          render(true);
        };
    };
  input("collection-search", (v) => (search = v));
  change("collection-filter", (v) => (filter = v));
  change("market-vendor", (v) => {
    vendor = v;
    marketPage = 0;
  });
  input("market-search", (v) => {
    marketSearch = v;
    marketPage = 0;
  });
  for (const [id, set] of [
    ["market-type", (v) => (marketType = v)],
    ["market-rarity", (v) => (marketRarity = v)],
    ["market-sort", (v) => (marketSort = v)],
  ])
    change(id, (v) => {
      set(v);
      marketPage = 0;
    });
  input("codex-search", (v) => (codexSearch = v));
  change("codex-category", (v) => (codexCategory = v));
  $("restock-btn")?.addEventListener("click", () => act("restock", { vendor }));
  $("launch-btn")?.addEventListener("click", async () => {
    if (await act("launch", {}, "Your company takes to the road.")) {
      selected = currentExpedition().party[0];
      await syncObservation();
      render(true);
    }
  });
  $("pause-btn")?.addEventListener("click", () =>
    syncObservation({ paused: !observation.paused }),
  );
  $("names-btn")?.addEventListener("click", () => {
    names = !names;
    if (renderer) renderer.showNames = names;
  });
  const expand = () => {
    expanded = !expanded;
    $("canvas-wrap").classList.toggle("expanded", expanded);
    renderer?.fit();
  };
  $("expand-btn")?.addEventListener("click", expand);
  $("collapse-field")?.addEventListener("click", expand);
  $("battlefield")?.addEventListener("click", (e) => {
    if (!battle) return;
    const rect = $("battlefield").getBoundingClientRect(),
      point = {
        x: ((e.clientX - rect.left) / rect.width) * W,
        y: ((e.clientY - rect.top) / rect.height) * H,
      },
      units = battle.units
        .filter((u) => !u.structure && !u.summon)
        .map((u) => ({
          u,
          d: distance({ x: u.x, y: u.y - 19 - (u.flying ? 12 : 0) }, point),
        }))
        .sort((a, b) => a.d - b.d);
    if (units[0]?.d < 38) {
      selectedUid = units[0].u.uid;
      selected = units[0].u.hero.id;
      renderer.selected = selectedUid;
      renderDetail();
    }
  });
}
function render(force = false) {
  if (!game) return;
  const now = performance.now();
  if (residentDrag?.isDragging()) {
    pendingMapRender = true;
    return;
  }
  if (!force && now - lastRender < 1000) return;
  lastRender = now;
  $("main-nav").innerHTML = [
    ["camp", "Camp", "camp"],
    ["expeditions", "Expeditions", "flag"],
    ["challenges", "Challenges", "shield"],
    ["arena", "Arena", "sword"],
    ["shop", "Shop", "spark"],
    ["codex", "Codex", "book"],
  ]
    .map(
      ([id, name, glyph]) =>
        `<button data-nav="${id}" class="${game.screen === id || (id === "expeditions" && game.screen === "expedition") ? "nav-active" : ""}">${icon(glyph, 16)}<span class="nav-label">${name}</span>${id === "expeditions" && activeExpeditions(game).length ? '<span class="nav-count">' + activeExpeditions(game).length + "</span>" : ""}</button>`,
    )
    .join("");
  const inspectorScroll = document.querySelector(".inspector")?.scrollTop || 0;
  rememberDetails();
  $("app-content").innerHTML = {
    camp: campView,
    crossroads: crossroadsView,
    party: partyView,
    calendar: challengesView,
    challenges: challengesView,
    shop: gemShopView,
    arena: arenaView,
    codex: codexView,
    expeditions: expeditionsView,
    expedition: expeditionView,
    market: marketView,
  }[game.screen]();
  document.body?.setAttribute("data-screen", game.screen);
  renderDetail();
  if (document.querySelector(".inspector"))
    document.querySelector(".inspector").scrollTop = inspectorScroll;
  bind();
  challengeRenderer = $("challenge-field")
    ? new Renderer($("challenge-field"))
    : null;
  renderer = $("battlefield") ? new Renderer($("battlefield")) : null;
  if (renderer && battle) {
    renderer.selected = selectedUid;
    renderer.showNames = names;
    renderer.draw(battle, now / 1000);
  }
  updateHud();
  document.title = `${game.screen === "camp" ? "The Camp" : game.screen === "crossroads" ? "Local map" : game.screen === "party" ? "Assemble your party" : game.screen === "market" ? "The Market" : game.screen === "arena" ? "The Arena" : game.screen === "shop" ? "The Gem Shop" : game.screen === "calendar" ? "Challenges" : game.screen === "challenges" ? "Challenges" : game.screen === "codex" ? "The Codex" : game.screen === "expedition" ? currentExpedition()?.name || "Expedition" : "Expeditions"} · ${game.campName || "Your Camp"} · Camp Collector`;
}
function updateHud() {
  if (!game) return;
  document
    .querySelectorAll("[data-stock-timer]")
    .forEach(
      (el) =>
        (el.textContent = time(
          Math.max(0, (stockResetAt(game) - game.lastClock) / 1000),
        )),
    );
  document.querySelectorAll("[data-harvest-timer]").forEach((el) => {
    const key = el.dataset.harvestTimer;
    el.textContent =
      Math.floor(
        Math.min(
          12,
          (game.lastClock - (game[key + "HarvestAt"] || game.lastClock)) /
            300000,
        ),
      ) + " harvests ready";
  });
  document.querySelectorAll("[data-speech]").forEach((el) => {
    const h =
      heroById(el.dataset.speech) ||
      party(game, currentExpedition() || { party: [] }).find(
        (h) => h.id === el.dataset.speech,
      );
    const line = h ? speechFor(h) : "";
    if (line) el.textContent = line;
    el.classList.toggle("visible", !!line);
  });
  $("gold-count").innerHTML =
    icon("coin", 18) +
    `<strong>${game.gold.toLocaleString()}</strong><small>gold</small>`;
  $("gem-count").innerHTML =
    icon("spark", 18) +
    `<strong>${game.gems.toLocaleString()}</strong><small>gem value</small>`;
  $("gem-count").title = CONTEXT.gems;
  if ($("resource-food")) $("resource-food").title = CONTEXT.recovery;
  $("clock-status").hidden = !catchingUp;
  $("clock-status").textContent = catchingUp
    ? "Your companies are catching up with the road. Background time is being simulated at 1×."
    : "";
  const brand = $("brand-name");
  if (brand) brand.textContent = "Camp Collector";
  const resource = $("resource-food");
  if (resource)
    resource.innerHTML =
      icon("heart", 16) + "<b>" + game.food + "</b><small>food</small>";
  for (const h of game.roster) {
    const u = battle?.units.find((u) => u.hero.id === h.id && !u.summon),
      max = u?.maxHp || stats(h).hp,
      hp = u?.hp ?? h.currentHp ?? max;
    document
      .querySelectorAll(`[data-card-hp="${h.id}"]`)
      .forEach((el) => (el.textContent = Math.ceil(hp) + " / " + max + " HP"));
    document
      .querySelectorAll(`[data-hp-fill="${h.id}"]`)
      .forEach((el) => (el.style.width = (hp / max) * 100 + "%"));
    document
      .querySelectorAll(`[data-card-xp="${h.id}"]`)
      .forEach(
        (el) => (el.textContent = h.xp + " / " + xpNeeded(h.level) + " XP"),
      );
    document
      .querySelectorAll(`[data-xp-fill="${h.id}"]`)
      .forEach(
        (el) => (el.style.width = (h.xp / xpNeeded(h.level)) * 100 + "%"),
      );
    document.querySelectorAll(`[data-status="${h.id}"]`).forEach((el) => {
      const status = statusOf(h);
      el.innerHTML = status.text + " <small>" + esc(status.detail) + "</small>";
    });
  }
  const shown = selectedHero();
  if (game.screen !== "expedition" && shown && $("detail-hp")) {
    $("detail-hp").textContent =
      Math.ceil(shown.currentHp ?? stats(shown).hp) +
      " / " +
      stats(shown).hp +
      " HP";
    if ($("detail-hp-fill"))
      $("detail-hp-fill").style.width =
        ((shown.currentHp ?? stats(shown).hp) / stats(shown).hp) * 100 + "%";
  }
  document.querySelectorAll("[data-training-timer]").forEach((el) => {
    const h = heroById(el.dataset.trainingTimer),
      job = h && Camp.heroJob(h);
    if (job)
      el.textContent =
        "Training in progress · ready in " +
        Math.max(0, Math.ceil((job.ends - game.lastClock) / 1000)) +
        "s";
  });
  const r = currentExpedition();
  if (game.screen === "expedition" && r) {
    if ($("fight-countdown")) {
      $("fight-countdown").hidden = r.phase !== "prepare";
      $("fight-countdown").textContent =
        r.phase === "prepare" ? countdownLabel(r.phaseSeconds) : "";
    }
    if ($("earned-loot")) $("earned-loot").innerHTML = lootMetrics(r);
    for (const [id, val] of [
      ["exp-gold", r.earned.gold],
      ["exp-gems", r.earned.gems],
      ["exp-items", r.earned.items],
      ["exp-time", time(r.elapsedSeconds) + " elapsed"],
    ])
      if ($(id)) $(id).textContent = val;
    if (battle) {
      if ($("ally-count"))
        $("ally-count").textContent = battle
          .alive(0, false)
          .filter((u) => !u.summon).length;
      if ($("enemy-count"))
        $("enemy-count").textContent = battle
          .enemies(0)
          .filter((u) => !u.summon && !u.structure).length;
      if ($("battle-time"))
        $("battle-time").textContent = observation.paused
          ? "Paused"
          : time(battle.time);
      if ($("battle-log"))
        $("battle-log").innerHTML = battle.events
          .slice(0, 8)
          .map(
            (e) =>
              `<div class="log-entry ${e.team ? "enemy-log" : ""}"><span>${time(e.time)}</span>${esc(e.text)}</div>`,
          )
          .join("");
    }
  }
}
function onUpdate(data) {
  game = data.game;
  campChatter.update(
    game.lastClock,
    game.screen === "camp"
      ? game.roster.filter((h) => available(game, h)).slice(0, 5)
      : game.screen === "market"
        ? game.roster.filter((h) => game.marketParty.includes(h.id))
        : [],
  );
  observation = data.observation || observation;
  catchingUp = data.catchingUp;
  const r = currentExpedition(),
    state =
      game.screen === "expedition" && r?.status === "active" && r.battleState;
  const previous = battle;
  battle = state ? Battle.fromState(state) : null;
  lastObservedAt = performance.now();
  if (
    battle &&
    previous &&
    battle.map.seed === previous.map.seed &&
    battle.map.biome === previous.map.biome
  ) {
    battle.map = previous.map;
    const positions = new Map(
      previous.units.map((u) => [u.uid, { x: u.x, y: u.y }]),
    );
    for (const u of battle.units) u.fromPosition = positions.get(u.uid);
  }
  if (battle) {
    let unit = battle.units.find(
      (u) => u.hero.id === selected && !u.structure && !u.summon,
    );
    if (!unit) {
      selected = r.party[0];
      unit = battle.units.find(
        (u) => u.hero.id === selected && !u.structure && !u.summon,
      );
    }
    selectedUid = unit?.uid ?? null;
  } else {
    selectedUid = null;
    if (selected && !heroById(selected))
      selected = r?.party[0] || game.roster[0]?.id || null;
  }
  const next = [
    game.screen,
    game.selectedExpedition,
    r?.phase,
    r?.stage,
    r?.auto,
    r?.stop?.done,
    game.roster.length,
    game.expeditions.map((r) => r.status).join(),
    observation.speed,
    observation.paused,
    JSON.stringify(game.questClaims),
    JSON.stringify(game.journeyClears),
    game.roster.map((h) => h.level + ":" + h.classNodes.length).join(),
    game.marketEpoch,
    Math.floor(game.lastClock / 86400000),
    JSON.stringify(game.buildings),
    game.campZone,
    game.roster
      .map((h) => h.recoveryUntil > game.lastClock || !!Camp.heroJob(h))
      .join(),
  ].join("|");
  if (next !== signature || data.requestId) {
    const stateChanged = next !== signature;
    signature = next;
    render(true);
    if (stateChanged && $("modal").open && modalRefresh) modalRefresh();
  }
  if (game.screen === "expedition" && performance.now() - lastDetail > 600) {
    lastDetail = performance.now();
    updateDetailLive();
  }
  updateHud();
  $("save-status").textContent = data.storageFailed
    ? "Saving unavailable · keep this tab open"
    : catchingUp
      ? "Catching up on background time"
      : "Saved on this device · background 1×";
}
function syncObservation(changes = {}) {
  return client.command("observe", {
    id:
      game.screen === "expedition" && currentExpedition()?.status === "active"
        ? game.selectedExpedition
        : null,
    visible: !document.hidden && focused,
    speed: changes.speed ?? observation.speed,
    paused: changes.paused ?? observation.paused,
  });
}
const openSections = new Map();
let detailHeroId = null,
  detailFingerprint = "";
function rememberDetails() {
  if (!detailHeroId) return;
  const sections = [
    ...document.querySelectorAll("#hero-detail details[data-detail-key]"),
  ];
  if (!sections.length) return;
  openSections.set(
    detailHeroId,
    new Set(sections.filter((el) => el.open).map((el) => el.dataset.detailKey)),
  );
}
function restoreDetails(id) {
  for (const el of document.querySelectorAll(
    "#hero-detail details[data-detail-key]",
  ))
    el.open = openSections.get(id)?.has(el.dataset.detailKey) || false;
  detailHeroId = id;
}
function info(key) {
  const text = CONTEXT[key] || "See the Codex for detailed rules.";
  return `<button class="info-tip" type="button" data-info="${key}" aria-label="Explain ${key}" title="${esc(text)}">i<span class="info-tooltip" role="tooltip">${esc(text)}</span></button>`;
}
function suppliesView() {
  return `<section class="packed-supplies"><div class="section-heading compact"><div><h3>Consumables</h3><p>Pack up to three kinds. Used once at departure; effects last for this expedition.</p></div><span>${game.packed.length} / 3 packed</span></div><div class="supply-grid">${Object.entries(
    CONSUMABLES,
  )
    .map(([key, d]) =>
      button(
        `${icon(d.icon, 19)}<span><strong>${d.name}</strong><small>${game.consumables[key] || 0} in storage</small></span>${game.packed.includes(key) ? "<b>✓</b>" : ""}`,
        `data-pack="${key}" title="${esc(d.text)}" ${!game.consumables[key] ? "disabled" : ""}`,
        "supply-choice " + (game.packed.includes(key) ? "selected" : ""),
      ),
    )
    .join("")}</div></section>`;
}

function showBuilding(key, id) {
  const def = BUILDINGS[key];
  if (!def) return;
  if (key === "pantry" && game.buildings.kitchen) {
    showKitchen();
    return;
  }
  if (game.buildings[key]) {
    if (key === "tent") {
      if (id) {
        selected = id;
        renderDetail();
        showCharacterService(heroById(id));
      } else showCharacters();
      return;
    }
    if (key === "storage") {
      showStorage();
      return;
    }
    useService(def.service, id);
    return;
  }
  openModal(
    (def.upgradeFrom ? "Upgrade to " : "Build ") + def.name,
    def.text,
    `<div class="construction-preview"><span>${icon(def.icon, 60)}</span><div><h3>A new part of home</h3><p>${Camp.costText(def.cost)}</p>${def.minRoster && game.roster.length < def.minRoster ? "<p>Hire or recruit a fourth adventurer first. Training keeps one character here, while three can travel.</p>" : ""}<div class="material-checks">${Object.entries(
      def.cost,
    )
      .map(
        ([k, n]) =>
          '<span class="' +
          ((k === "gold" ? game.gold : game.materials[k]) >= n ? "met" : "") +
          '">' +
          (k === "gold" ? game.gold : game.materials[k]) +
          " / " +
          n +
          " " +
          k +
          "</span>",
      )
      .join("")}</div></div></div>`,
    button(
      (def.upgradeFrom ? "Upgrade to " : "Build ") + def.name,
      `data-construct="${key}" ${!Camp.hasCost(game, def.cost) || (def.minRoster && game.roster.length < def.minRoster) ? "disabled" : ""}`,
    ),
  );
}
function showPantry() {
  openModal(
    "The Pantry",
    "A little food makes coming home easier.",
    `<div class="pantry-display">${icon("heart", 48)}<strong>${game.food}</strong><span>food in storage</span></div><p class="modal-note">Each returning adventurer uses one food to halve recovery time. Recovery gradually restores all HP. ${info("recovery")}</p><div class="card-actions">${[1, 5, 10].map((n) => button("Stock " + n + " food · " + n * 4 + " gold", `data-food="${n}" ${game.gold < n * 4 ? "disabled" : ""}`, "secondary-button")).join("")}</div><p>Upgrade this Pantry into a Kitchen to cook six meals per batch and choose special dishes.</p>${game.buildings.kitchen ? "" : button("Upgrade to Kitchen", 'data-building="kitchen"', "secondary-button")}`,
    "",
    showPantry,
  );
}
function showKitchen() {
  openModal(
    "The Kitchen",
    "Turn ingredients from the road into shared meals.",
    `<div class="pantry-display"><strong>${game.food}</strong><span>food stocked</span></div><div class="card-actions">${[1, 5, 10].map((n) => button("Stock " + n + " food · " + n * 4 + " gold", `data-food="${n}" ${game.gold < n * 4 ? "disabled" : ""}`, "secondary-button")).join("")}</div><div class="item-list">${Object.entries(
      COOKING,
    )
      .map(
        ([key, r]) =>
          `<div class="item-option">${icon("flame", 28)}<span><strong>${r.name}</strong><small>${Camp.costText(r.cost)} → ${r.count} ${r.output === "food" ? "food" : CONSUMABLES[r.output]?.name || r.output}</small></span>${button("Cook", `data-cook="${key}" ${!Camp.hasCost(game, r.cost) ? "disabled" : ""}`)}</div>`,
      )
      .join(
        "",
      )}</div><p class="modal-note">${game.materials.meat} ingredients · ${game.materials.herbs} herbs · ${game.food} food stocked</p>`,
    "",
    showKitchen,
  );
}
function showAlchemy() {
  const groups = Object.keys(GEM_KINDS)
    .flatMap((kind) =>
      GEM_SIZES.map((s, size) => ({
        kind,
        size,
        count: game.gemstones.filter((g) => g.kind === kind && g.size === size)
          .length,
      })),
    )
    .filter((g) => g.count);
  openModal(
    "The Alchemist",
    "A workshop for gem fusion, transmutation, and expedition potions.",
    `<p class="modal-note">${game.gems} available gem value. Three matching gems become one of the next size, preserving total value. Socketed gems stay with their companion. ${info("gems")}</p><h3>Combine gems</h3><div class="item-list">${groups.map((g) => `<div class="item-option"><span class="gem-art" style="color:${GEM_KINDS[g.kind].color}">◆</span><span><strong>${GEM_SIZES[g.size].name} ${GEM_KINDS[g.kind].name} ×${g.count}</strong><small>${g.size < 3 ? "3 → 1 " + GEM_SIZES[g.size + 1].name : "Largest size"}</small></span>${button("Combine", `data-fuse="${g.kind}" data-size="${g.size}" ${g.count < 3 || g.size === 3 ? "disabled" : ""}`, "secondary-button")}</div>`).join("") || "<p>No gems yet. Bosses drop gems; deeper destinations yield larger ones.</p>"}</div><h3>Transmute a gemstone</h3><select id="transmute-gem" class="modal-select">${game.gemstones.map((g) => `<option value="${g.id}">${GEM_SIZES[g.size].name} ${GEM_KINDS[g.kind].name} → ${gemValue(g) * 3} materials</option>`).join("") || '<option value="">No gems available</option>'}</select><div class="card-actions">${["ore", "herbs", "stone"].map((key) => button("Convert to " + key, `data-transmute="${key}" ${!game.gemstones.length ? "disabled" : ""}`, "secondary-button")).join("")}</div><h3>Brew consumables</h3><div class="item-list">${Object.entries(
      BREWS,
    )
      .map(
        ([key, r]) =>
          `<div class="item-option">${icon(CONSUMABLES[key].icon, 24)}<span><strong>${CONSUMABLES[key].name}</strong><small>${Camp.costText(r.cost)}${r.gems ? " · " + r.gems + " gem value" : ""}</small><small>${CONSUMABLES[key].text}</small></span>${button("Brew", `data-brew="${key}" ${!Camp.hasCost(game, r.cost) || game.gems < (r.gems || 0) ? "disabled" : ""}`)}</div>`,
      )
      .join("")}</div>`,
    "",
    showAlchemy,
  );
}
function showSlots(h) {
  openModal(
    "The Market Outfitter",
    "Give a growing adventurer room for more belongings.",
    heroPicker(h) +
      `<div class="modal-note"><strong>${esc(h.name)} · ${equipmentSlots(h).length} / 8 slots ${info("slots")}</strong><p>Requires level 10 · 75 gold + 2 gem value per additional slot.</p></div><div class="slot-choice-grid">${Object.entries(
        EQUIPMENT_TYPES,
      )
        .filter(
          ([key]) =>
            [
              "weapon",
              "focus",
              "offhand",
              "feet",
              "tool",
              "charm",
              "scroll",
            ].includes(key) &&
            (key !== "scroll" || CLASSES[h.classId].magical),
        )
        .map(
          ([key, d]) =>
            `<article class="training-choice"><span>${title(key)}</span><p>${d}</p>${button("Add slot", `data-unlock="${key}" data-for="${h.id}" ${h.level < 10 || equipmentSlots(h).length >= 8 || game.gold < 75 || game.gems < 2 || !available(game, h) ? "disabled" : ""}`)}</article>`,
        )
        .join("")}</div>`,
    "",
    () => showSlots(heroById(h.id)),
  );
  serviceHero(h, showSlots);
}
function showSockets(h, index = 0) {
  const p = h.companion,
    slots = companionSlots(p);
  openModal(
    PETS[p.key].name + " · gem sockets",
    "Rare: 1 socket. Legendary: 2. Mythical: 3. Gems boost the rider or owner’s base stats.",
    `<div class="pet-detail">${petSvg(p)}<div><strong>${RARITIES[itemRarity(p)]} · Lv ${p.level}</strong><p>${slots} sockets · ${game.gems} gem value in storage</p></div></div><div class="socket-tabs">${Array.from({ length: slots }, (_, n) => button("Socket " + (n + 1), `data-socket-tab="${n}" data-for="${h.id}"`, n === index ? "secondary-button selected" : "text-button")).join("")}</div>${p.sockets?.[index] ? `<p class="modal-note">${GEM_SIZES[p.sockets[index].size].name} ${GEM_KINDS[p.sockets[index].kind].name} · +${gemValue(p.sockets[index])} ${GEM_KINDS[p.sockets[index].kind].stat} ${button("Remove", `data-unsocket="${index}" data-for="${h.id}"`, "text-button")}</p>` : "<p>Empty socket.</p>"}<div class="item-list">${game.gemstones.map((g) => button(`<span class="gem-art" style="color:${GEM_KINDS[g.kind].color}">◆</span><span><strong>${GEM_SIZES[g.size].name} ${GEM_KINDS[g.kind].name}</strong><small>+${gemValue(g)} ${GEM_KINDS[g.kind].stat}</small></span>`, `data-socket="${g.id}" data-index="${index}" data-for="${h.id}"`, "item-option")).join("") || '<p class="empty-note">No gemstones in storage.</p>'}</div>`,
    "",
    () => showSockets(heroById(h.id), index),
  );
}
function onboarding(force = false) {
  if (game.campNamed && !force) return;
  openModal(
    "A place to call home",
    "Give your camp a name.",
    `<div class="onboarding-faces">${game.roster
      .slice(0, 3)
      .map((h) => portraitSvg(h))
      .join(
        "",
      )}</div><p>${game.firstExpedition ? "The world turned permanently to night. You keep a fire beside the lantern Market. Three level-5 adventurers have agreed to stay. Meet them at the Character tent, then follow the Quest Board to your first journey." : "Your adventurers and progress are safe. Name the camp they come home to."}</p><label class="field-label" for="camp-name-input">Camp name</label><input id="camp-name-input" class="modal-select" maxlength="36" placeholder="e.g. Willow Rest" value="${esc(game.campName)}"><p class="small muted">This name becomes your camp’s identity.</p>`,
    button("Welcome home", 'id="confirm-camp-name"'),
  );
  $("confirm-camp-name").onclick = async () => {
    const name = $("camp-name-input").value.trim();
    if (!name) {
      toast("Give your camp a name.");
      return;
    }
    if (await act("nameCamp", { name }, "Welcome to " + name + "."))
      closeModal();
  };
}
function codexTable(entry) {
  if (entry.category === "Races") {
    const r = RACES[entry.name];
    return `<h3>Level 1 foundation</h3><table><tbody>${CORE_STATS.map((k) => `<tr><th>${title(k)}</th><td>${r.base[k]}</td></tr>`).join("")}</tbody></table><h3>Growth per level</h3>${growthTableHtml(r.growthTable)}`;
  }
  if (entry.category === "Classes") {
    const c = CLASSES[entry.key];
    return `<h3>At level 1</h3><table><tbody><tr><th>Active ability</th><td>${c.ability}</td></tr><tr><th>Base cooldown</th><td>${c.cooldown}s · costs 18 stamina</td></tr><tr><th>Slots</th><td>${c.slots.map((s) => s.label).join(", ")}</td></tr><tr><th>Attack scaling</th><td>${c.magical ? "Mind × 1.2" : "Strength × 1.4"}</td></tr></tbody></table><h3>Class growth per level</h3>${growthTableHtml(c.growthTable)}`;
  }
  return "";
}
function growthTableHtml(table) {
  return `<div class="table-scroll"><table><thead><tr><th>From level</th>${CORE_STATS.map((k) => "<th>" + title(k) + "</th>").join("")}</tr></thead><tbody>${table.map((row) => "<tr><th>" + row.from + "</th>" + CORE_STATS.map((k) => "<td>+" + row.values[k].toFixed(3) + "</td>").join("") + "</tr>").join("")}</tbody></table></div>`;
}
function lootMetrics(r) {
  return `${r.earned.gold ? `<span>${icon("coin", 17)}<strong id="exp-gold">${r.earned.gold}</strong> gold</span>` : ""}${r.earned.gems ? `<span>${icon("spark", 17)}<strong id="exp-gems">${r.earned.gems}</strong> gem value</span>` : ""}${r.earned.items ? `<span>${icon("sword", 17)}<strong id="exp-items">${r.earned.items}</strong> equipment</span>` : ""}${r.earned.essences ? `<span>${r.earned.essences} attributes</span>` : ""}${[
    ["scrolls", "scrolls"],
    ["food", "food"],
    ["consumables", "consumables"],
    ["companions", "companions"],
    ["characters", "characters"],
  ]
    .filter(([key]) => r.earned[key] > 0)
    .map(([key, label]) => "<span>" + r.earned[key] + " " + label + "</span>")
    .join("")}${Object.entries(r.earned.materials || {})
    .filter(([key, n]) => n > 0)
    .map(
      ([key, n]) =>
        `<span>${icon(MATERIALS[key].icon, 17)}<strong>${n}</strong> ${MATERIALS[key].name}</span>`,
    )
    .join(
      "",
    )}${r.recruits.length || r.recruited ? `<span>${icon("heart", 17)}${r.status === "active" ? r.recruits.length : r.recruited} recruits</span>` : ""}`;
}

function marketServices() {
  return `<div class="market-services">${[
    ["combine", "shuffle", "Combine"],
    ["analyze", "book", "Analyze"],
    ["create", "army", "Create character"],
    ["forge", "sword", "Forge"],
    ["cosmetics", "wing", "Apply cosmetics"],
    ["sell", "coin", "Sell belongings"],
    ["guildhall", "gear", "Guildhall"],
    ["questboard", "book", "Quest Board"],
    ["slots", "shield", "Outfitter"],
    ["clinic", "spark", "Lantern Clinic"],
  ]
    .map(([id, i, label]) =>
      button(icon(i, 18) + label, `data-service="${id}"`, "secondary-button"),
    )
    .join("")}</div>`;
}
function marketTabs() {
  return `<div class="market-view-tabs">${button("The market square", 'data-market-mode="vendors"', marketMode === "vendors" ? "secondary-button selected" : "text-button")}${button("Full catalog", 'data-market-mode="catalog"', marketMode === "catalog" ? "secondary-button selected" : "text-button")}</div>`;
}
function vendorArt(v) {
  const colors = {
      guild: "#8b9f87",
      forge: "#b48168",
      arcane: "#a08cb4",
      night: "#8b9c92",
      menagerie: "#bd9f76",
      atelier: "#ad8e9e",
    },
    color = colors[v.id];
  return `<svg viewBox="0 0 290 120" aria-hidden="true"><path d="M0 114q75-24 148 0t142-4v10H0Z" fill="#83977b" opacity=".25"/><path d="M57 43h180v70H57Z" fill="#d1bd96" stroke="#938268" stroke-width="2"/><path d="m47 46 25-26h151l26 26Z" fill="${color}"/><path d="M49 47h196v18H49Z" fill="${color}"/><path d="M70 47h20v18H70m27-18h20v18H97m27-18h20v18h-20m27-18h20v18h-20m27-18h20v18h-20m27-18h20v18h-20" fill="#e6d5ad" opacity=".8"/><path d="M119 69h51v44h-51Z" fill="#83725c"/><path d="M73 75h29v23H73m82 14h52V77h-28" fill="#8a9686"/><path d="M37 114V56m220 58V56" stroke="#8d7758" stroke-width="5"/>${v.id === "forge" ? '<path d="m215 103 10-30" stroke="#707a74" stroke-width="6"/><path d="m225 68 9-7 6 10-13 8Z" fill="#b2b6aa"/>' : v.id === "arcane" ? '<circle class="character-aura" cx="199" cy="79" r="13" fill="#c5b1de"/><path d="m198 63 3 11 7 4-9 4-3 10-2-10-8-5 9-4Z" fill="#eee2b5"/>' : v.id === "menagerie" ? '<path d="M198 97q18-28 27 0Z" fill="#bf9062"/><path d="m202 83 2-12 7 9m5 0 8-10 1 14" fill="#bf9062"/>' : ""}<path d="M54 111h181" stroke="#9d8a66" stroke-width="5"/></svg>`;
}
function vendorBanner(id) {
  const v = VENDORS.find((v) => v.id === id);
  return `<section class="vendor-banner"><div><span class="eyebrow">${v.tag}</span><h2>${v.name}</h2><p>${v.text}</p>${button("← All vendors", 'data-vendor="all"', "text-button")}</div>${vendorArt(v)}</section>`;
}
function marketSquare() {
  return (
    heading(
      "A PLACE FOR NEW POSSIBILITIES",
      "The Market",
      "Visit a specialist, or search everything in the full catalog.",
      button("Back to Camp", 'data-nav="camp"', "secondary-button"),
    ) +
    marketServices() +
    marketTabs() +
    `<div class="market-square">${VENDORS.map((v) => `<button class="vendor-storefront" data-vendor="${v.id}">${vendorArt(v)}<span class="eyebrow">${v.tag}</span><h2>${v.name}</h2><p>${v.text}</p><strong>Browse ${game.market[v.id]?.length || 0} goods ${icon("arrow", 15)}</strong></button>`).join("")}</div>`
  );
}

let challengeBoard = { offers: [], payouts: [], matches: [] },
  challengeError = "",
  challengeLoading = false,
  challengeSelection = [],
  challengeReplay = null,
  challengeRenderer = null,
  challengeFrameAt = 0,
  challengeCountdown = 4;
async function challengeFetch(path, body) {
  const response = await fetch("/api/challenges" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "x-camp-season": GAME_SEASON,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw Error("The shared board is unavailable. Try again shortly.");
  }
  if (!response.ok) {
    const error = Error(data.error || "The challenge could not be completed.");
    error.status = response.status;
    throw error;
  }
  return data;
}
async function loadChallenges() {
  if (challengeLoading) return;
  challengeLoading = true;
  challengeError = "";
  try {
    challengeBoard = await challengeFetch("");
  } catch (error) {
    challengeError = error.message;
  } finally {
    challengeLoading = false;
    if (game.screen === "challenges") render(true);
  }
}
function playerChallengesView() {
  challengeSelection = challengeSelection.filter(
    (id) => heroById(id) && available(game, heroById(id)),
  );
  if (!challengeSelection.length)
    challengeSelection = game.roster
      .filter((h) => available(game, h))
      .slice(0, 3)
      .map((h) => h.id);
  const mine = challengeBoard.offers.find((o) => o.mine),
    others = challengeBoard.offers.filter((o) => !o.mine),
    payouts = challengeBoard.payouts.filter(
      (p) => !game.challengeReceipts.includes(p.id),
    );
  return (
    heading(
      "PLAYERS. PLEDGED LOOT.",
      "Challenges",
      "Challenge a posted team from another player, or put your own team on the board.",
      button("Refresh board", "data-refresh-challenges", "secondary-button"),
    ) +
    `<div class="challenge-rules"><strong>Only your pledge is at risk. ${info("challenges")}</strong><p>Both camps pledge matching gold. If equipment is offered, match its rarity or better. The winning team takes both pledges. Original characters and equipped gear stay with their camps.</p><p class="small muted">The board is shared with players who can access this site. No AI opponents appear here.</p></div>${challengeError ? '<div class="welcome-note">' + esc(challengeError) + "</div>" : ""}${payouts.length ? `<section class="challenge-rewards"><h2>Your winnings and returns</h2>${payouts.map((p) => `<div class="item-option"><span><strong>${p.gold} gold${p.items.length ? " + " + p.items.length + " equipment" : ""}</strong><small>Safely held until collected.</small></span>${button("Collect", `data-claim-challenge="${p.id}"`)}</div>`).join("")}</section>` : ""}${
      Object.entries(game.challengeDeposits).length
        ? `<div class="welcome-note"><strong>Awaiting board confirmation</strong>${Object.entries(
            game.challengeDeposits,
          )
            .map(
              ([id, d]) =>
                `<p>${d.gold} gold reserved. ${button("Retry safely", `data-retry-challenge="${id}"`, "text-button")}</p>`,
            )
            .join("")}</div>`
        : ""
    }<section class="challenge-setup"><div class="section-heading"><div><h2>Your challenge team</h2><p>Choose three ready characters. A snapshot fights; the characters stay yours.</p></div><span>${challengeSelection.length} / 3</span></div><div class="challenge-team-picker">${game.roster.map((h) => button(`<span class="mini-portrait">${portraitSvg(h, true)}</span><span><strong>${esc(h.name)}</strong><small>Lv ${h.level} ${className(h)}</small></span>`, `data-challenge-hero="${h.id}" ${!available(game, h) ? "disabled" : ""}`, "challenge-hero " + (challengeSelection.includes(h.id) ? "selected" : ""))).join("")}</div>${
      mine
        ? `<div class="posted-challenge"><strong>Your team is posted · ${mine.gold} gold${mine.loot ? " + " + ITEMS[mine.loot.key].name : ""}</strong>${button("Withdraw and recover pledge", `data-cancel-challenge="${mine.id}"`, "secondary-button")}</div>`
        : `<div class="challenge-pledge"><label>Gold pledge <input id="challenge-gold" type="number" min="10" max="1000" step="10" value="20"></label><label>Optional equipment <select id="challenge-loot"><option value="">Gold only</option>${game.inventory
            .filter((i) => !i.unidentified && !i.sharpenJob)
            .map((i) => `<option value="${i.id}">${itemLabel(i)}</option>`)
            .join(
              "",
            )}</select></label>${button("Post your team", "data-post-challenge " + (challengeSelection.length !== 3 || challengeLoading || challengeError ? "disabled" : ""))}</div>`
    }</section><div class="section-heading"><h2>Other players’ teams</h2></div><div class="challenge-board">${others.map((o) => `<article class="challenge-offer"><span class="eyebrow">PLAYER CAMP</span><h3>${esc(o.camp)}</h3><div class="party-faces">${o.team.map((h) => '<span title="' + esc(h.name) + " · Lv " + h.level + '">' + portraitSvg(h, true) + "</span>").join("")}</div><p>${o.team.map((h) => esc(className(h)) + " Lv " + h.level).join(" · ")}</p><strong>${o.gold} gold ${o.loot ? " + " + itemLabel(o.loot) : ""}</strong><p>Winner keeps both pledges.</p>${button("Review challenge", `data-attack-challenge="${o.id}" ${challengeSelection.length !== 3 || game.gold < o.gold ? "disabled" : ""}`)}</article>`).join("") || `<div class="empty-collection"><h3>${challengeLoading ? "Opening the shared board…" : "No other teams posted yet."}</h3><p>Post your team or return when another player has offered a challenge. The AI Arena is available separately.</p></div>`}</div>${challengeReplay ? `<section class="challenge-replay"><div class="section-heading"><h2>Match replay</h2><span>3× replay · rewards are already decided on the server</span></div><canvas id="challenge-field" aria-label="Replay of your player challenge"></canvas><p id="challenge-replay-status">Replaying the match…</p></section>` : ""}${challengeBoard.matches.length ? `<section><div class="section-heading"><h2>Recent matches</h2></div><div class="item-list">${challengeBoard.matches.map((m) => `<div class="item-option"><span><strong>${m.won ? "Victory" : "Defeat"} against ${esc(m.opponent)}</strong><small>${time(m.result.time)} · only pledged belongings changed hands</small></span>${button("Watch replay", `data-challenge-replay="${m.id}"`, "secondary-button")}</div>`).join("")}</div></section>` : ""}`
  );
}
async function submitChallenge(path, payload, itemId = "") {
  const receipt = payload.receipt;
  if (!game.challengeDeposits[receipt]) {
    if (
      !(await act("challengeReserve", {
        receipt,
        gold: payload.gold,
        itemId,
        payload: { path, body: payload },
      }))
    )
      return;
  }
  try {
    await challengeFetch(path, payload);
    await act("challengeAccepted", { receipt });
    toast(
      path === "/post"
        ? "Your team is posted."
        : "The match is resolved. Collect any winnings from the board.",
    );
    await loadChallenges();
    closeModal();
  } catch (error) {
    if (error.status) {
      await act("challengeRefund", { receipt });
      toast(error.message);
    } else {
      toast(
        "The response was interrupted. Your pledge is reserved; retry uses the same receipt.",
      );
    }
    if (game.screen === "challenges") render(true);
  }
}
function reviewChallenge(offer = null) {
  const team = game.roster.filter((h) => challengeSelection.includes(h.id)),
    gold = offer ? offer.gold : Number($("challenge-gold")?.value),
    itemId = offer ? "" : $("challenge-loot")?.value || "",
    item = game.inventory.find((i) => i.id === itemId);
  if (
    team.length !== 3 ||
    !Number.isInteger(gold) ||
    gold < 10 ||
    gold > 1000 ||
    game.gold < gold
  ) {
    toast(
      "Choose three ready characters and an affordable pledge of 10–1,000 gold.",
    );
    return;
  }
  openModal(
    offer ? "Challenge " + esc(offer.camp) + "?" : "Post your challenge team",
    "Your original characters are safe. Only this pledge can be won by another player.",
    `<p class="modal-note">${team.map((h) => esc(h.name)).join(", ")}<br><strong>Pledge: ${gold} gold${item ? " + " + itemLabel(item) : ""}</strong><br>${offer ? "The winner receives both camps’ gold and any pledged equipment." : "Anyone with access to this site can accept your posted challenge."}</p>${
      offer?.loot
        ? `<label class="field-label" for="attack-loot">Match ${RARITIES[itemRarity(offer.loot)]} equipment or better</label><select id="attack-loot" class="modal-select">${
            game.inventory
              .filter(
                (i) =>
                  !i.unidentified &&
                  !i.sharpenJob &&
                  itemRarity(i) >= itemRarity(offer.loot),
              )
              .map((i) => `<option value="${i.id}">${itemLabel(i)}</option>`)
              .join("") || '<option value="">No matching equipment</option>'
          }</select>`
        : ""
    }`,
    button("Keep my loot", "data-close", "secondary-button") +
      button(
        offer ? "Challenge this team" : "Post team",
        'id="confirm-challenge" ' +
          (offer?.loot &&
          !game.inventory.some(
            (i) => !i.unidentified && itemRarity(i) >= itemRarity(offer.loot),
          )
            ? "disabled"
            : ""),
      ),
  );
  $("confirm-challenge").onclick = () => {
    const chosenId = offer?.loot ? $("attack-loot").value : itemId,
      chosen = game.inventory.find((i) => i.id === chosenId),
      payload = {
        receipt: crypto.randomUUID(),
        id: offer?.id,
        campName: game.campName,
        team,
        gold,
        loot: chosen || null,
      };
    submitChallenge(offer ? "/attack" : "/post", payload, chosenId);
  };
}
async function claimChallenge(id) {
  try {
    const p = await challengeFetch("/claim", { id });
    if (
      await act(
        "challengePayout",
        { receipt: p.id, gold: p.gold, items: p.items },
        "Pledged loot collected.",
      )
    )
      await loadChallenges();
  } catch (error) {
    toast(error.message);
  }
}
async function cancelChallenge(id) {
  try {
    await challengeFetch("/cancel", { id });
    await loadChallenges();
    toast("Your pledge is ready to collect.");
  } catch (error) {
    toast(error.message);
  }
}
function replayChallenge(id) {
  const m = challengeBoard.matches.find((m) => m.id === id);
  if (!m) return;
  challengeReplay = new Battle(m.attackingTeam, 0, m.seed, m.defendingTeam, {
    mode: "challenge",
    biome: "village",
    recruitLimit: 0,
  });
  challengeReplay.autoPrepare();
  challengeFrameAt = 0;
  challengeCountdown = 4;
  render(true);
  $("challenge-field")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function detailKey(h, u) {
  return JSON.stringify([
    h.id,
    h.level,
    h.classPath,
    h.classNodes,
    h.talents,
    h.armor,
    h.specialization,
    h.lineage,
    h.items.map((i) => (i ? [i.id, i.level, i.rank, itemRarity(i)] : null)),
    abilities(h).map((a) => [a.id, a.level, facetRarity(a)]),
    h.attributes.map((a) => [a.key, a.level, facetRarity(a)]),
    h.companion?.id,
    h.companion?.level,
    u?.converted,
    u?.dead,
  ]);
}
function updateDetailLive() {
  if (!$("hero-detail")) return;
  const h = selectedHero(),
    u = battle?.units.find((u) => u.uid === selectedUid);
  if (!h) return;
  if (detailKey(h, u) !== detailFingerprint) {
    renderDetail();
    return;
  }
  const s = u || stats(h),
    hp = u?.hp ?? h.currentHp ?? s.hp,
    max = u?.maxHp || s.hp;
  for (const key of CORE_STATS)
    if ($("stat-" + key))
      $("stat-" + key).textContent = Number(s[key].toFixed(1));
  if ($("detail-mana"))
    $("detail-mana").textContent =
      Math.floor(u?.mana ?? s.maxMana) + " / " + s.maxMana + " mana";
  if ($("detail-mana-fill"))
    $("detail-mana-fill").style.width =
      ((u?.mana ?? s.maxMana) / s.maxMana) * 100 + "%";
  if ($("detail-hp"))
    $("detail-hp").textContent = Math.ceil(hp) + " / " + max + " HP";
  if ($("detail-hp-fill"))
    $("detail-hp-fill").style.width = Math.max(0, (hp / max) * 100) + "%";
  if ($("detail-xp-numbers"))
    $("detail-xp-numbers").textContent =
      h.xp + " / " + xpNeeded(h.level) + " XP";
  if ($("detail-xp-fill"))
    $("detail-xp-fill").style.width = (h.xp / xpNeeded(h.level)) * 100 + "%";
}

const nightUi = createNightfallUi({
  getGame: () => game,
  esc,
  button,
  openModal,
  act,
  closeModal,
  heroPicker,
  showEquipment,
  showArmor,
  showPet,
  showGrowth,
  showSlots,
  showTransforms,
  showSell,
  openVendor,
  characterSize,
  treeHtml: classTreeGraphic,
  growthHtml: growthTableHtml,
  render,
  select: (id) => {
    selected = id;
    selectedUid = null;
    renderDetail();
  },
  visitMarketFromWorkshop: async () => {
    await act("visitMarket", {
      ids: game.roster
        .filter((h) => available(game, h))
        .slice(0, 3)
        .map((h) => h.id),
    });
    marketMode = "vendors";
    vendor = "all";
  },
});
client = createClient(onUpdate);
await client.ready;
await syncObservation({ speed: 1, paused: false });
onboarding();
$("settings-btn").innerHTML = icon("info", 19);
$("settings-btn").onclick = help;
$("brand-home").onclick = (e) => {
  e.preventDefault();
  navigate("camp");
};
$("modal").addEventListener("click", (e) => {
  if (e.target === $("modal")) closeModal();
});
document.addEventListener("visibilitychange", () => {
  syncObservation({ paused: false });
  if (document.hidden) client.checkpoint();
});
window.addEventListener("pagehide", () => {
  closing = true;
  client.command("observe", {
    id: null,
    visible: false,
    speed: 1,
    paused: false,
  });
  client.checkpoint();
});
window.addEventListener("pageshow", () => {
  closing = false;
  client
    .command("checkpoint")
    .then(() => syncObservation({ speed: 1, paused: false }));
});
window.addEventListener("blur", () => {
  focused = false;
  syncObservation({ paused: false });
});
window.addEventListener("focus", () => {
  focused = true;
  syncObservation({ paused: false });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && expanded) {
    expanded = false;
    $("canvas-wrap")?.classList.remove("expanded");
  }
  if (
    e.code === "Space" &&
    game.screen === "expedition" &&
    !$("modal").open &&
    !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
      document.activeElement?.tagName,
    )
  ) {
    e.preventDefault();
    syncObservation({ paused: !observation.paused });
  }
});
function frame(now) {
  if (["camp", "market"].includes(game?.screen) && !document.hidden)
    animateResidents(now);
  if (
    !document.hidden &&
    focused &&
    challengeRenderer &&
    challengeReplay &&
    game.screen === "challenges"
  ) {
    const delta = challengeFrameAt
      ? Math.min(0.1, (now - challengeFrameAt) / 1000)
      : 0;
    challengeFrameAt = now;
    if (challengeCountdown > 0) {
      challengeCountdown = Math.max(0, challengeCountdown - delta);
      if ($("challenge-replay-status"))
        $("challenge-replay-status").textContent =
          countdownLabel(challengeCountdown);
    } else
      for (let n = 0; n < Math.round(delta * 90); n++)
        challengeReplay.update(1 / 30);
    challengeRenderer.draw(challengeReplay, now / 1000);
    if (challengeReplay.result && $("challenge-replay-status"))
      $("challenge-replay-status").textContent =
        "Replay complete. The board holds the server’s match result and winnings.";
  }
  if (!document.hidden && focused && !closing && renderer && battle) {
    const fraction = Math.min(1, Math.max(0, (now - lastObservedAt) / 100)),
      positions = [];
    for (const u of battle.units)
      if (u.fromPosition) {
        positions.push([u, u.x, u.y]);
        u.x = u.fromPosition.x + (u.x - u.fromPosition.x) * fraction;
        u.y = u.fromPosition.y + (u.y - u.fromPosition.y) * fraction;
      }
    renderer.selected = selectedUid;
    renderer.draw(battle, now / 1000);
    for (const [u, x, y] of positions) {
      u.x = x;
      u.y = y;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function campV7View() {
  const active = activeExpeditions(game);
  return (
    heading(
      "A FIRE IN THE PERMANENT NIGHT",
      esc(game.campName || "Your Camp"),
      "Select an adventurer. Drag them onto a building to use its service.",
      `<div class="heading-actions">${button("Build at Camp", "data-build-sites", "secondary-button")}</div>`,
    ) +
    workspace(
      `${campScene()}<div class="camp-resource-strip"><span>${icon("heart", 16)}<b>${game.food}</b> food ${info("recovery")}</span>${Object.entries(
        MATERIALS,
      )
        .map(
          ([key, m]) =>
            `<span title="${esc(m.text)}">${icon(m.icon, 16)}<b>${game.materials[key] || 0}</b> ${m.name}</span>`,
        )
        .join(
          "",
        )}</div>${game.firstExpedition ? '<div class="welcome-note"><strong>The sun never returned. The campfires stayed.</strong> Three adventurers have agreed to stay. Meet them at the Character tent, then follow the Quest Board onto the road.</div>' : ""}${questBoard()}${active.length ? `<div class="section-heading"><h2>On the road</h2>${button("Active expeditions", 'data-nav="expeditions"', "text-button")}</div><div class="expedition-grid">${active.map(expeditionCard).join("")}</div>` : ""}`,
    )
  );
}
function campWalkers() {
  return residentsView(
    "camp",
    game.roster
      .filter((h) => available(game, h))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite))
      .slice(0, 6),
  );
}
function animateResidents(now) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-resident]").forEach((el) => {
    if (el.classList.contains?.("picked-up")) return;
    const i = Number(el.dataset.resident),
      place = game.mapPositions[game.screen]?.[el.dataset.hero],
      phase = now / 17000 + i * 1.71,
      base = place || {
        x: 21 + i * 11,
        y: game.screen === "market" ? 67 + (i % 2) * 8 : 64 + (i % 2) * 6,
      };
    el.style.left = base.x + Math.sin(phase) * 4 + "%";
    el.style.top = base.y + Math.sin(phase * 0.6 + i) * 2 + "%";
  });
}

function questBoard() {
  return `<section class="quest-board"><div class="section-heading"><div><span class="eyebrow">A REASON TO LEAVE THE FIRE</span><h2>Quests</h2><p>One main story, with smaller goals along the way.</p></div><span>${game.questClaims.length} completed</span></div><h3>Main quest</h3>${nightUi.questList("Main")}<h3>Side quests & stories</h3>${nightUi.questList("Side")}<p class="small">Find more quests on the Market Board or from people marked with a question mark.</p></section>`;
}
function campBar() {
  const ready = game.roster.filter((h) => available(game, h)),
    training = game.roster.filter((h) => Camp.heroJob(h)),
    points = game.roster.reduce((n, h) => n + classPoints(h), 0);
  return `<section class="camp-detail"><span class="eyebrow">YOUR HOME</span><h2>${esc(game.campName || "Your Camp")}</h2>${button("Rename camp", "data-rename-camp", "text-button")}<div class="camp-bar-art">${icon("camp", 64)}</div><p>${game.campExpansions.length} / 3 Camp expansions · Beyond the firelight, the long night watches. Each returning traveler brings a little more of the world home.</p><div class="camp-metrics"><div><b>${game.roster.length} / ${Camp.campCapacity(game)}</b><span>Adventurers ${info("capacity")}</span></div><div><b>${ready.length}</b><span>Ready</span></div><div><b>${activeExpeditions(game).length} / ${expeditionSlots(game)}</b><span>Traveling parties</span></div><div><b>${game.lifetimeEncounters}</b><span>Victories</span></div><div><b>${game.food}</b><span>Food stocked</span></div><div><b>${game.waitingRecruits.length}</b><span>Waiting arrivals</span></div></div>${points ? `<p class="welcome-note">${points} class point${points === 1 ? "" : "s"} waiting at the Bonfire.</p>` : ""}${training.map((h) => `<p>${esc(h.name)} · ${statusOf(h).detail} remaining at ${Camp.heroJob(h).kind === "training" ? "Training Grounds" : "Blacksmith"}</p>`).join("")}${button("Meet your adventurers", 'data-service="characters"', "secondary-button")}${button("Gather at the Bonfire", 'data-service="bonfire"', "secondary-button")}<p class="small muted">Select a resident to see their character bar. Deselect them to return here.</p></section>`;
}
function roadPath(region, e) {
  const a = region.nodes.find((n) => n.id === e.a),
    b = region.nodes.find((n) => n.id === e.b),
    mx = (a.x + b.x) * 4.5,
    my = (a.y + b.y) * 6.5,
    offset = (e.combat % 2 ? 1 : -1) * 34;
  return `M${a.x * 9} ${a.y * 13} Q${mx + offset} ${my - offset} ${b.x * 9} ${b.y * 13}`;
}
function regionMap() {
  const loc = game.destination.location || game.location,
    region = REGIONS[loc],
    visible = visibleNodes(game, loc),
    seen = explored(game, loc),
    d = destinationInfo(game),
    routes = regionalRoutes(game, loc, d?.target),
    tracked = QUESTS.find(
      (q) => q.id === game.trackedQuest && q.location === loc,
    );
  return `<section class="route-map-shell"><div class="map-toolbar"><span>${LOCATIONS[loc].name} · ${seen.size} / ${region.nodes.length} discovered</span><div>${button("−", 'data-map-zoom="-1" aria-label="Zoom out"', "icon-button")}${button("+", 'data-map-zoom="1" aria-label="Zoom in"', "icon-button")}${button("Fit map", "data-map-fit", "secondary-button")}</div></div><div class="region-map-viewport" id="region-map-viewport"><div class="region-map" style="--map-scale:${mapZoom};--map-tint:${LOCATIONS[loc].color}" aria-label="${LOCATIONS[loc].name} local roads"><svg viewBox="0 0 900 1300" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="contours" width="160" height="180" patternUnits="userSpaceOnUse"><path d="M-40 30q140-80 210 30M-40 55q140-80 210 30" fill="none" stroke="#72835d" stroke-width="2" opacity=".15"/></pattern></defs><rect width="900" height="1300" fill="#e0e4cb"/><rect width="900" height="1300" fill="${LOCATIONS[loc].color}" opacity=".17"/><rect width="900" height="1300" fill="url(#contours)"/>${Array.from(
    { length: 64 },
    (_, i) => {
      const x = (i * 173 + 43) % 880,
        y = (i * 179 + 17) % 1270;
      return loc === "volcano"
        ? `<path d="m${x} ${y} 24-42 25 42Z" fill="#876652" opacity=".24"/>`
        : loc === "marsh"
          ? `<path d="M${x} ${y}q70-40 130 0" stroke="#7d9d9a" stroke-width="18" opacity=".2" fill="none"/>`
          : `<g fill="#657e4b" opacity=".22"><circle cx="${x}" cy="${y}" r="17"/><circle cx="${x + 13}" cy="${y - 7}" r="12"/></g>`;
    },
  ).join(
    "",
  )}${regionLandmarks(loc)}${region.roads.map((e) => `<path d="${roadPath(region, e)}" fill="none" stroke="#000000" stroke-width="7" stroke-linecap="round" stroke-dasharray="${e.style === "wild" ? "3 17" : "none"}"/>`).join("")}${routes
    .filter((r) => r.index === (d?.routeIndex ?? 0))
    .map(
      (r) =>
        `<g class="route-path route-${r.index} ${r.index === d?.routeIndex ? "current" : ""}">${r.edges.map((e) => `<path d="${roadPath(region, e)}" fill="none" stroke="#00aaff" stroke-width="10" stroke-linecap="round" stroke-dasharray="${e.style === "wild" ? "3 17" : "none"}"/>`).join("")}</g>`,
    )
    .join("")}</svg>${region.nodes
    .map((n) => {
      const show = visible.has(n.id),
        home = n.id === region.entry;
      return `<button class="regional-node ${show ? "" : "fogged"} ${home ? "home-node" : ""} ${n.kind === "boss" ? "boss-node" : n.kind === "miniboss" ? "miniboss-node" : ""} ${seen.has(n.id) ? "visited" : ""} ${d?.target === n.id ? "selected" : ""} ${tracked?.target === n.id && show ? "quest-target" : ""}" data-destination="${n.id}" style="left:${n.x}%;top:${n.y}%" ${!show || home ? "disabled" : ""} aria-label="${show ? n.name + " · Level " + n.level + " " + n.kind : "Unexplored location"}">${n.kind === "boss" ? castleArt() : ""}<b>${!show ? "?" : home ? (loc === "greenway" ? "★" : "◉") : seen.has(n.id) ? "✓" : n.kind === "boss" ? "♜" : n.kind === "miniboss" ? "⚔" : n.kind === "resource" ? "◆" : n.kind === "special" ? "✧" : "•"}</b><span>${show ? (home && loc === "greenway" ? esc(game.campName || "Your Camp") : n.name) : n.kind === "boss" ? n.name : "Unexplored"}</span>${tracked?.target === n.id && show ? "<small>QUEST</small>" : ""}</button>`;
    })
    .join(
      "",
    )}</div></div><div class="region-key">${loc === "greenway" ? "★ Your only Camp" : "◉ Portal arrival · Camp stays in the forest"} · ◆ Materials · ✧ Special rewards · ⚔ Three mini-bosses · ♜ Region boss<span>Bright blue is your selected route · solid roads are open · dotted roads are wild · explore to unlock darkened nodes</span></div></section>`;
}
function crossroadsV7View() {
  const d = destinationInfo(game),
    loc = d?.location || "greenway",
    routes = regionalRoutes(game, loc, d?.target),
    q = QUESTS.find((q) => q.id === game.trackedQuest),
    region = REGIONS[loc],
    boss = bossDefeated(game, loc);
  return (
    heading(
      "STEP 1 OF 2 · CHOOSE THE ROAD",
      "Local map",
      "Select a location, compare the highlighted roads, then lock your route.",
      button("Back to Camp", 'data-nav="camp"', "secondary-button"),
    ) +
    `${
      game.portalUnlocked
        ? `<div class="region-tabs" aria-label="Travel regions">${REGION_ORDER.filter(
            (id) => game.regionUnlocks.includes(id),
          )
            .map((id) =>
              button(
                `${icon(LOCATIONS[id].icon, 18)}${LOCATIONS[id].name}${!game.regionUnlocks.includes(id) ? " · Locked" : ""}`,
                `data-region="${id}" ${!game.regionUnlocks.includes(id) ? "disabled" : ""}`,
                "secondary-button " + (loc === id ? "selected" : ""),
              ),
            )
            .join("")}</div>`
        : ""
    }${q ? `<div class="tracked-banner"><span>${icon("flag", 18)}<strong>${q.name}</strong> · ${q.text}</span>${button("Quest Board", 'data-nav="camp"', "text-button")}</div>` : ""}<div class="travel-layout">${regionMap()}<section class="route-planner" id="route-planner"><span class="eyebrow">${d?.destinationBoss ? "REGION BOSS" : "SELECTED DESTINATION"}</span><h2>${esc(d?.name || "Choose a location")}</h2><p>${d?.milestone ? rewardName(d.milestone) : "Gold, XP, materials, and discoveries along the road."}</p>${button("Review highlighted roads", "data-review-roads", "text-button")}<p class="route-level">Suggested level ${d?.level + 3 || 4} · ${LOCATIONS[loc].name}</p><div class="route-options">${
      routes
        .map((r) =>
          button(
            `<span class="eyebrow" style="color:${r.index === d?.routeIndex ? "#0079be" : "#424c46"}">${r.index === d?.routeIndex ? "●" : "○"} ROUTE ${r.index + 1}${d?.routeIndex === r.index ? " · SELECTED" : ""}</span><strong>${r.label}</strong><span class="route-counts"><b>${r.combats}</b> combat · <b>${r.events}</b> non-combat</span><span>${routeDifficulty(r, loc)} difficulty · ${((r.index === 0 ? 1 : DIFFICULTIES[d?.difficulty || "normal"].reward) * r.danger).toFixed(2)}× rewards</span><small><b>${r.foodPerHero} food per adventurer</b>${r.foodPerHero ? " · " + r.foodPerHero * 3 + " for a party of three" : " · No supplies required"}</small><small class="route-waypoints">${r.ids
              .slice(1)
              .map((id) => region.nodes.find((n) => n.id === id).name)
              .join(" → ")}</small>`,
            `data-route-index="${r.index}" aria-pressed="${d?.routeIndex === r.index}"`,
            "route-option " + (d?.routeIndex === r.index ? "selected" : ""),
          ),
        )
        .join("") ||
      '<p class="locked-note">Explore neighboring roads to reveal this destination.</p>'
    }</div>${boss ? `<details class="map-difficulty"><summary>Region difficulty · ${DIFFICULTIES[d?.difficulty || "normal"].name}</summary><p>You defeated this region’s boss. Raise difficulty for greater rewards.</p>${difficultyControls()}</details>` : `<div class="difficulty-lock">${icon("shield", 18)}<span><strong>Adventurer difficulty</strong><small>Defeat ${region.nodes.find((n) => n.id === region.exit).name} to unlock difficulty controls${region.next ? " and the next map" : ""}.</small></span></div>`}<div class="route-confirm">${button("Lock route · Choose party " + icon("arrow", 16), "data-lock-route " + (!d?.unlocked ? "disabled" : ""))}<small>Choose your adventurers and pack supplies on the next screen.</small></div></section></div>`
  );
}
function partyView() {
  const d = game.lockedJourney,
    heroes = game.roster.filter((h) => game.staging.includes(h.id)),
    req = journeyRequirements(game, d || {}, heroes),
    free = expeditionSlots(game) > activeExpeditions(game).length;
  if (!d) return crossroadsV7View();
  return (
    heading(
      "STEP 2 OF 2 · ASSEMBLE YOUR COMPANY",
      "Who is coming?",
      d.name + " · " + LOCATIONS[d.location].name,
      button("← Change route", 'data-nav="crossroads"', "secondary-button"),
    ) +
    workspace(
      `<div class="locked-route-summary"><div><span class="eyebrow">YOUR LOCKED ROAD</span><h2>${esc(d.name)}</h2><p>${d.encounters} combat · ${d.otherEncounters || 0} non-combat · ${DIFFICULTIES[d.difficulty].name} · ${d.reward.toFixed(2)}× rewards</p></div>${icon(LOCATIONS[d.location].icon, 36)}</div>${slotMeter()}<div class="journey-provisions"><h3>${req.food ? req.food + " food reserved at departure" : "No food needed for this short road"}</h3><p>${game.food} stocked · ${game.staging.length} / 6 adventurers · minimum three</p>${req.missing.map((t) => '<p class="locked-note">' + esc(t) + "</p>").join("")}<small>Primary equipment must be equipped. Longer journeys use food; optional supplies help the party.</small></div>${suppliesView()}${collection(game.roster, "Choose three to six", "staging")}<div class="launch-bar sticky-departure"><div><strong>${game.staging.length} adventurers · ${req.food} food</strong><p>${!free ? "All expedition slots are occupied." : req.missing[0] || "Automatic formation · background 1×"}</p></div>${button("Start expedition " + icon("arrow", 15), 'id="launch-btn" ' + (req.missing.length || game.staging.length < 3 || !free || catchingUp ? "disabled" : ""))}</div>`,
    )
  );
}

function v7Detail() {
  document.body?.setAttribute("data-inspecting", selected ? "yes" : "no");
  const el = $("hero-detail");
  if (!el) return;
  const h = selectedHero();
  if (!h) {
    el.innerHTML = game.screen === "market" ? marketBar() : campBar();
    el.setAttribute("data-allegiance", "none");
    bindActions(el);
    return;
  }
  const u =
      game.screen === "expedition" &&
      battle?.units.find((u) => u.uid === selectedUid),
    s = u || stats(h),
    owned = !!heroById(h.id),
    neutral = !!h.npcType,
    hp = u?.hp ?? h.currentHp ?? s.hp,
    max = u?.maxHp || s.hp;
  el.setAttribute(
    "data-allegiance",
    owned ? "friendly" : neutral ? "neutral" : "enemy",
  );
  el.innerHTML = `${button(game.screen === "camp" ? "← Camp overview" : "Close character details", "data-deselect", "text-button")}<div class="hero-detail-header"><div class="detail-portrait" style="--detail-height:${Math.min(132, 82 * characterSize(h)[0])}px;--detail-width:${Math.min(138, 78 * characterSize(h)[1])}px">${portraitSvg(h)}</div><div class="hero-detail-name"><h2>${esc(h.name)}</h2><div class="hero-tags">${button(h.race, 'data-explain="race" data-index="0"', "text-button")}${button(className(h), 'data-explain="class" data-index="0"', "text-button")}${rarityTag(heroRarity(h))}</div>${owned ? `<div class="name-actions">${button(icon("heart", 13) + (h.favorite ? "Favorited" : "Favorite"), `data-favorite="${h.id}"`, "text-button")}${button("Rename", `data-rename="${h.id}"`, "text-button")}</div>` : ""}</div></div><div class="hero-detail-body"><div class="detail-xp" id="character-xp"><div><strong>Level ${h.level}</strong><span id="detail-xp-numbers">${h.xp} / ${xpNeeded(h.level)} XP</span></div><div class="xp-track"><i id="detail-xp-fill" style="width:${Math.min(100, (h.xp / xpNeeded(h.level)) * 100)}%"></i></div><small>${classPoints(h)} class points</small></div><div class="stat-six">${CORE_STATS.map((k) => `<div><strong id="stat-${k}">${Number(s[k].toFixed(1))}</strong><small>${title(k)} ${info(k)}</small></div>`).join("")}</div><div class="health-detail"><strong id="detail-hp">${Math.ceil(hp)} / ${max} HP</strong><div class="health-track"><i id="detail-hp-fill" style="width:${(hp / max) * 100}%"></i></div></div><div class="mana-detail"><span id="detail-mana">${Math.floor(u?.mana ?? s.maxMana)} / ${s.maxMana} mana</span>${info("mana")}<div class="mana-track"><i id="detail-mana-fill" style="width:${((u?.mana ?? s.maxMana) / s.maxMana) * 100}%"></i></div></div><div class="detail-section"><div class="detail-section-label">Active abilities</div><div class="detail-chip-list">${abilities(
    h,
  )
    .map((a, i) =>
      button(
        esc(a.name),
        `data-explain="ability" data-index="${i}" title="${esc(a.text)}"`,
        "detail-chip",
      ),
    )
    .join(
      "",
    )}</div></div><div class="detail-section"><div class="detail-section-label">Armor · ${CLASSES[h.classId].armorWeight}</div><div class="armor-row">${armorSlots(
    h,
  )
    .map((slot, i) =>
      button(
        `<span>${slot.label}<small>${h.armor[i] ? esc(itemInfo(h.armor[i]).name) : slot.allowed ? "Empty" : "Crown"}</small></span>${owned && Night.equipmentNotice(game, h, i, true) ? '<i class="new-gear-dot" aria-label="New compatible armor"></i>' : ""}`,
        `data-armor-slot="${i}" ${slot.allowed ? "" : "disabled"}`,
        "equipment-slot",
      ),
    )
    .join(
      "",
    )}</div></div><div class="detail-section"><div class="detail-section-label">Equipment · ${equipmentSlots(h).length} / 8</div><div class="equipment-row">${equipmentSlots(
    h,
  )
    .map((slot, i) =>
      button(
        `<span>${h.items[i] ? esc(itemInfo(h.items[i]).name) : slot.label}</span>${owned && Night.equipmentNotice(game, h, i) ? '<i class="new-gear-dot" aria-label="New compatible equipment"></i>' : ""}`,
        `data-slot="${i}"`,
        "equipment-slot",
      ),
    )
    .join(
      "",
    )}</div></div><div class="detail-section"><div class="detail-section-label">Attributes & professions</div><div class="detail-chip-list">${characterAttributes(
    h,
  )
    .map((a, i) =>
      button(
        esc(a.name),
        `data-explain="attribute" data-index="${i}" title="${esc(a.text)}"`,
        "detail-chip",
      ),
    )
    .join(
      "",
    )}</div></div><div class="detail-section"><div class="detail-section-label">Talents</div><div class="detail-chip-list">${(h.talents || []).map((t, i) => button(esc(talentInfo(t).name), `data-explain="talent" data-index="${i}"`, "detail-chip")).join("") || '<span class="small">No training yet.</span>'}</div></div><div class="detail-section"><div class="detail-section-label">Companion</div>${h.companion ? button(`${petSvg(h.companion)}<strong>${esc(evolutionName(h.companion, "pet"))}</strong>`, 'data-explain="pet" data-index="0"', "pet-detail detail-chip") : '<p class="small">No companion. Meet friends in the Character tent.</p>'}</div></div>`;
  detailFingerprint = detailKey(h, u);
  bindActions(el);
}
function showExplanation(kind, index) {
  const h = selectedHero();
  if (!h) return;
  if (kind === "class") {
    nightUi.showClass(h);
    return;
  }
  if (kind === "race") {
    nightUi.showRace(h);
    return;
  }
  let name,
    text,
    art = portraitSvg(h),
    extra = "";
  if (kind === "ability") {
    const a = abilities(h)[index];
    name = a.name;
    text = a.text;
    extra = `Lv ${a.level} · ${RARITIES[facetRarity(a)]} · ${facetScale(a).toFixed(2)}× learned potency. Uses finite mana, stamina, and a cooldown.`;
  } else if (kind === "attribute") {
    const a = characterAttributes(h)[index];
    name = a.name;
    text = a.text;
    extra = `Attribute · Lv ${a.level} · ${RARITIES[facetRarity(a)]}`;
  } else if (kind === "talent") {
    const a = h.talents[index],
      d = talentInfo(a);
    name = d.name;
    text = d.text;
    extra = `Talent · Lv ${a.level} · ${RARITIES[facetRarity(a)]}`;
  } else if (kind === "pet") {
    name = h.companion
      ? evolutionName(h.companion, "pet")
      : "A traveling companion";
    text = h.companion
      ? petInfo(h.companion).desc
      : "Assign a companion at the Character tent.";
    if (h.companion) {
      art = petSvg(h.companion);
      extra = `Lv ${h.companion.level} · ${RARITIES[itemRarity(h.companion)]} · ${companionSlots(h.companion)} sockets`;
    }
  } else if (kind === "race") {
    name = h.race;
    text = RACES[h.race].text;
    extra = CORE_STATS.map((k) => title(k) + " " + RACES[h.race].base[k]).join(
      " · ",
    );
  } else {
    name = className(h);
    text = school(h)?.text || CLASSES[h.classId].abilityText;
    extra =
      CLASSES[h.classId].armorWeight +
      " armor · " +
      equipmentSlots(h).length +
      " equipment slots";
  }
  openModal(
    esc(name),
    "A closer look",
    `<div class="explanation-visual"><div>${art}</div><span>${icon(kind === "ability" ? "bolt" : kind === "talent" ? "gear" : "spark", 38)}</span><div class="explanation-effect ${kind}">${kind === "ability" ? abilityDiagram(h, abilities(h)[index]) : icon(kind === "pet" ? "heart" : "leaf", 52)}</div></div><p class="modal-note">${esc(text)}</p><p>${esc(extra)}</p>`,
    button("Close", "data-close", "secondary-button"),
  );
}
function showArmor(h, index) {
  if (!h) return;
  const slot = armorSlots(h)[index],
    i = h.armor?.[index],
    manage = game.screen === "camp" && heroById(h.id) && available(game, h);
  openModal(
    slot.label,
    CLASSES[h.classId].armorWeight + " armor · separate from equipment slots",
    `${i ? '<div class="item-preview-art">' + itemSvg(i) + '</div><p class="modal-note">' + itemLabel(i) + "<br>" + ITEMS[i.key].desc + "</p>" + (manage ? button("Remove armor", `data-remove-armor="${h.id}" data-index="${index}"`, "text-button") : "") : ""}<div class="item-list">${
      manage
        ? game.inventory
            .filter(
              (i) =>
                ITEMS[i.key].type === "armor" &&
                ITEMS[i.key].armorSlot === slot.key,
            )
            .map((i) =>
              button(
                `<span>${itemLabel(i)}<small>${armorRestriction(h, i, index) || ITEMS[i.key].desc}</small></span>`,
                `data-equip-armor="${i.id}" data-for="${h.id}" data-index="${index}" ${armorRestriction(h, i, index) || i.sharpenJob ? "disabled" : ""}`,
                "item-option",
              ),
            )
            .join("") || "<p>No compatible armor in storage.</p>"
        : ""
    }</div>`,
  );
}
let bonfireTab = "classes";
function classTreeGraphic(h) {
  const paths = classTree(h),
    chosen = paths.find((p) => p.id === h.classPath),
    points = [];
  if (!chosen) {
    points.push({
      id: "root",
      x: 300,
      y: 240,
      name: CLASSES[h.classId].label,
      text: "Choose a calling at level 20.",
    });
    paths.forEach((p, i) => {
      const angle = (((i * 360) / paths.length - 90) * Math.PI) / 180;
      points.push({
        ...p.nodes[0],
        x: 300 + Math.cos(angle) * 190,
        y: 240 + Math.sin(angle) * 155,
      });
    });
  } else {
    points.push({ id: "root", x: 300, y: 462, name: CLASSES[h.classId].label });
    points.push({ ...chosen.nodes[0], x: 300, y: 335 });
    chosen.nodes
      .filter((n) => n.level === 40)
      .forEach((n, i) => points.push({ ...n, x: i ? 455 : 145, y: 205 }));
    chosen.nodes
      .filter((n) => n.level === 60)
      .forEach((n, i) =>
        points.push({ ...n, x: [75, 220, 380, 525][i], y: 70 }),
      );
  }
  return `<div class="branching-tree ${chosen ? "tree-focused" : "tree-overview"}" role="group" aria-label="Branching ${CLASSES[h.classId].label} class tree"><svg viewBox="0 0 600 510" aria-hidden="true">${points
    .filter((n) => n.id !== "root")
    .map((n) => {
      const from = points.find((p) => p.id === n.parent) || points[0],
        learned = h.classNodes.includes(n.id);
      return `<path d="M${from.x} ${from.y} Q${from.x} ${(from.y + n.y) / 2} ${n.x} ${n.y}" fill="none" stroke="${learned ? "#ad8141" : n.locked ? "#c9c8b8" : "#8f9c78"}" stroke-width="${learned ? 5 : 3}" ${n.locked ? 'stroke-dasharray="5 6"' : ""}/>`;
    })
    .join("")}</svg>${points
    .map((n) => {
      const state = n.id === "root" ? {} : classNodeState(h, n);
      return n.id === "root"
        ? `<div class="tree-root" style="left:${n.x / 6}%;top:${n.y / 5.1}%">${icon(CLASSES[h.classId].icon, 27)}<strong>${n.name}</strong><small>YOUR CLASS</small></div>`
        : button(
            `<b>${state.learned ? "✓" : state.locked ? "×" : "◆"}</b><strong>${n.name}</strong><small>${n.level === 20 ? "UNCOMMON" : n.level === 40 ? "RARE" : "LEGENDARY"} · ${n.level}</small>`,
            `data-class-node="${n.id}" data-for="${h.id}" title="${esc(n.text)}" style="left:${n.x / 6}%;top:${n.y / 5.1}%" ${!state.available || !available(game, h) ? "disabled" : ""}`,
            "tree-skill " +
              (state.learned ? "learned " : state.locked ? "locked " : "") +
              (state.available ? "unlockable" : ""),
          );
    })
    .join("")}</div>${
    chosen
      ? `<div class="locked-callings"><small>Other callings locked:</small>${paths
          .filter((p) => p.id !== h.classPath)
          .map((p) => "<span>× " + p.name + "</span>")
          .join("")}</div>`
      : ""
  }<p class="tree-caption">${chosen ? "Follow either fork. Choosing a node permanently locks its sibling." : "The central class branches into different callings. Choose one to reveal its next forks."} ${info("classPoints")}</p>`;
}
function showBonfire(h = chooseAvailable(selected)) {
  if (!["classes", "armor", "pets"].includes(bonfireTab))
    bonfireTab = "classes";
  if (bonfireTab !== "classes") {
    showTransforms(bonfireTab === "pets" ? "pet" : "armor", h);
    return;
  }
  const body = h
    ? heroPicker(h) +
      `<div class="class-tree-intro">${portraitSvg(h)}<div><h3>${esc(h.name)} · ${classPoints(h)} unspent points</h3><p>Earn a point at levels 20, 40 and 60.</p><strong>${h.classPath ? "Chosen calling: " + className(h) : "Choose a path from the central class"}</strong></div></div>${classTreeGraphic(h)}`
    : "<p>Return with an adventurer to choose a calling.</p>";
  openModal(
    "The Bonfire",
    "Choose a calling. Armor and companions can find new forms here.",
    bonfireTabs() + body,
    "",
    () => showBonfire(h && heroById(h.id)),
  );
  if (h) serviceHero(h, showBonfire);
}
function bonfireTabs() {
  return `<div class="storage-tabs">${[
    ["classes", "Class trees"],
    ["armor", "Armor"],
    ["pets", "Companions"],
  ]
    .map(([id, label]) =>
      button(
        label,
        `data-bonfire-tab="${id}"`,
        bonfireTab === id ? "secondary-button selected" : "text-button",
      ),
    )
    .join("")}</div>`;
}
function showTransforms(kind, h = null) {
  const objects = (
    kind === "pet"
      ? [
          ...game.companions,
          ...(h ? [h] : game.roster).map((h) => h.companion).filter(Boolean),
        ]
      : [...game.inventory, ...(h ? [h] : game.roster).flatMap(allGear)]
  ).filter(
    (i) =>
      kind === "pet" ||
      (kind === "armor"
        ? ITEMS[i.key].type === "armor"
        : ITEMS[i.key].weaponKind),
  );
  const body = `<p class="modal-note">At levels 20, 40 and 60, choose a missing prefix, affix or enchantment. ${info("weaponForms")}</p>${h ? heroPicker(h) : ""}<div class="evolution-grid">${
    objects
      .map((i) => {
        const t = transformationOptions(i, kind),
          owner = game.roster.find((h) =>
            kind === "pet" ? h.companion === i : allGear(h).includes(i),
          ),
          ready =
            t.level &&
            i.level >= t.level &&
            game.gems >= t.cost &&
            (!owner || available(game, owner)) &&
            (!t.material || game.materials[t.material] >= 5) &&
            !i.sharpenJob &&
            !i.unidentified;
        return `<article><div class="gear-art">${kind === "pet" ? petSvg(i) : itemSvg(i)}</div>${rarityTag(itemRarity(i))}<h3>${evolutionName(i, kind)}</h3><small>Lv ${i.level} · ${owner ? esc(owner.name) : "In storage"}</small><div class="modifier-list">${objectModifiers(
          i,
          kind,
        )
          .map(
            (m) =>
              "<div><b>" +
              title(m.kind) +
              " · " +
              m.name +
              "</b><small>" +
              m.text +
              "</small></div>",
          )
          .join(
            "",
          )}</div><p>${t.level ? "Level " + t.level + " · " + t.cost + " gem value" + (t.material ? " · 5 " + t.material : "") : "All three forms unlocked"}</p>${
          t.level
            ? `<label class="field-label" for="form-${i.id}">Next modifier</label><select id="form-${i.id}" class="modal-select" data-form-choice="${i.id}">${[
                "prefix",
                "affix",
                "enchantment",
              ]
                .filter((type) => t.choices.some((c) => c.kind === type))
                .map(
                  (type) =>
                    `<optgroup label="${title(type)}">${t.choices
                      .filter((c) => c.kind === type)
                      .map(
                        (c) =>
                          `<option value="${c.kind}:${c.key}" ${type === "enchantment" && owner && (kind !== "pet" || PETS[i.key].mode === "mount") && abilities(owner).length >= 10 ? "disabled" : ""}>${c.name} — ${c.text}</option>`,
                      )
                      .join("")}</optgroup>`,
                )
                .join(
                  "",
                )}</select><p class="modifier-hint">${t.choices[0]?.text || ""}</p>`
            : ""
        }${button(t.level ? "Transform" : "Fully transformed", `data-evolve="${i.id}" data-kind="${kind}" ${!ready ? "disabled" : ""}`)}</article>`;
      })
      .join("") || "<p>No matching belongings at Camp.</p>"
  }</div>`;
  openModal(
    kind === "weapon" ? "The Blacksmith" : "The Bonfire",
    kind === "weapon"
      ? "Weapon transformations"
      : "Armor and companion transformations",
    (kind === "weapon" ? blacksmithTabs(h) : bonfireTabs()) + body,
    "",
    () => showTransforms(kind, h && heroById(h.id)),
  );
  if (h) serviceHero(h, (a) => showTransforms(kind, a));
  document.querySelectorAll("[data-form-choice]").forEach(
    (el) =>
      (el.onchange = () => {
        const obj = objects.find((i) => i.id === el.dataset.formChoice),
          [type, key] = el.value.split(":"),
          c = transformationOptions(obj, kind).choices.find(
            (c) => c.kind === type && c.key === key,
          );
        el.closest("article").querySelector(".modifier-hint").textContent =
          c?.text || "";
        el.closest("article").querySelector(".gear-art").innerHTML =
          kind === "pet"
            ? petSvg({ ...obj, [type]: key })
            : itemSvg({ ...obj, [type]: key });
      }),
  );
}
function showArchaeology() {
  openModal(
    "Archaeology Camp",
    "Give ancient finds a new life.",
    `<div class="archaeology-resources"><strong>${game.eggs} dinosaur eggs</strong><strong>${game.materials.fossils || 0} fossils</strong></div><h3>Hatch an egg</h3><div class="hatch-grid">${["raptor", "hadrosaur"].map((key) => `<article>${petSvg({ key, level: 1 })}<h3>${PETS[key].name}</h3><p>${PETS[key].text}</p>${button("Hatch · 1 egg + 40 gold", `data-hatch="${key}" ${!game.eggs || game.gold < 40 ? "disabled" : ""}`)}</article>`).join("")}</div><h3>Grow a fossil companion</h3><div class="hatch-grid">${Object.entries(
      PETS,
    )
      .filter(([key, p]) => p.fossilOnly)
      .map(
        ([key, p]) =>
          `<article>${petSvg({ key, level: 1 })}<h3>${p.name}</h3><p>${p.text}</p>${button(p.fossilCost + " fossils + 55 gold", `data-fossil="${key}" ${!Camp.hasCost(game, { gold: 55, fossils: p.fossilCost }) ? "disabled" : ""}`)}</article>`,
      )
      .join("")}</div>`,
    "",
    showArchaeology,
  );
}
function reviewClassNode(id, node) {
  const h = heroById(id),
    path = classTree(h).find((p) => p.nodes.some((n) => n.id === node)),
    n = path.nodes.find((n) => n.id === node);
  openModal(
    n.name,
    "Spend one class point",
    `<div class="character-preview">${portraitSvg(h)}</div><p class="modal-note">${n.text}</p><p>${h.classPath ? "Choose this fork of your " + path.name + " calling; its sibling will be locked." : "Choosing " + path.name + " locks every other branch. This character keeps their race, name, memories and bonds."}</p>`,
    button("Keep thinking", "data-close", "secondary-button") +
      button("Learn this node", 'id="confirm-class-node"'),
  );
  $("confirm-class-node").onclick = async () => {
    if (await act("classNode", { id, node }, "A calling chosen."))
      showBonfire(heroById(id));
  };
}
function showCharacters() {
  openModal(
    "The Character tent",
    "Your adventurers · " +
      game.roster.length +
      " / " +
      Camp.campCapacity(game) +
      " capacity.",
    collection(game.roster, "Your characters", "owned", true).replaceAll(
      "data-hero=",
      "data-profile=",
    ) +
      `<div class="waiting-arrivals">${game.waitingRecruits.map((h) => '<div class="item-option"><span class="mini-portrait">' + portraitSvg(h) + "</span><span><strong>" + esc(h.name) + "</strong><small>Waiting for room at Camp</small></span>" + button("Welcome", `data-arrival="${h.id}" ${game.roster.length >= Camp.campCapacity(game) ? "disabled" : ""}`) + "</div>").join("")}</div>`,
  );
  const input = $("collection-search");
  if (input)
    input.oninput = (e) => {
      search = e.target.value;
      showCharacters();
      $("collection-search").focus();
    };
  if ($("collection-filter"))
    $("collection-filter").onchange = (e) => {
      filter = e.target.value;
      showCharacters();
    };
}

function abilityDiagram(h, a) {
  const recipe =
      a.spell === "heal"
        ? "healer"
        : a.spell
          ? "mage"
          : CLASSES[a.id.startsWith("learned:") ? a.id.slice(8) : h.classId]
              ?.recipe || h.classId,
    point = (x, y, color = "#859d6d") =>
      `<circle cx="${x}" cy="${y}" r="8" fill="${color}" stroke="#eff0d1" stroke-width="2"/>`;
  let scene = "",
    caption = "AUTO CAST";
  if (["healer", "druid"].includes(recipe)) {
    scene =
      '<circle class="diagram-zone" cx="79" cy="53" r="36" fill="#a3c788" fill-opacity=".35" stroke="#749b62" stroke-dasharray="4 4"/>' +
      point(66, 60) +
      point(89, 47) +
      '<path d="M75 40h10m-5-5v10" stroke="#eff5d8" stroke-width="3"/>';
    caption = "BLESSING · ALLIES";
  } else if (["mage", "psion", "witch", "stormcaller"].includes(recipe)) {
    scene =
      '<circle class="diagram-zone" cx="79" cy="53" r="35" fill="#c3acda" fill-opacity=".35" stroke="#9474b2" stroke-dasharray="4 4"/>' +
      point(59, 48, "#c58f79") +
      point(91, 63, "#c58f79") +
      '<path d="m48 31 18 10-8 1m49 33-17-9 4 7" stroke="#806299" stroke-width="3" fill="none"/>';
    caption =
      h.classPath === "gravity" || h.classId === "psion"
        ? "GRAVITY · PULL"
        : "CURSE · ENEMIES";
  } else if (["summoner", "necromancer"].includes(recipe)) {
    scene =
      point(34, 55) +
      point(75, 35, "#afc7cb") +
      point(97, 55, "#afc7cb") +
      point(75, 75, "#afc7cb") +
      '<path d="m45 54 15-9m-15 9h33m-33 0 14 11" stroke="#7799a1" stroke-width="2"/>';
    caption = "SUMMON · ALLIES";
  } else if (["bard", "envoy"].includes(recipe)) {
    scene =
      point(32, 55) +
      point(92, 55, "#c58f79") +
      '<path d="M78 47 62 55l16 8" stroke="#af7484" stroke-width="3" fill="none"/><path d="M58 32c-9-14-23 2 0 17 23-15 9-31 0-17Z" fill="#c68699"/>';
    caption = h.classPath === "skald" ? "REFRAIN · BOOST" : "CHARM · RECRUIT";
  } else if (["guardian", "paladin", "engineer"].includes(recipe)) {
    scene =
      point(61, 55) +
      point(85, 68) +
      '<path d="m71 24 24 9v20Q94 80 71 88 46 77 46 53V33Z" fill="none" stroke="#899caf" stroke-width="4"/>';
    caption = recipe === "engineer" ? "BUILD · DEFEND" : "SHIELD · PROTECT";
  } else {
    scene =
      '<circle class="diagram-zone" cx="78" cy="53" r="31" fill="#d7b66d" fill-opacity=".4" stroke="#a88644" stroke-dasharray="4 4"/>' +
      point(72, 57, "#c58f79") +
      point(90, 42, "#c58f79") +
      '<path d="m30 57 25-7-6 7m18-28 8 12m-13 27-8 13m42-21 15 4" fill="none" stroke="#af8c48" stroke-width="3"/>';
    caption = "STRIKE · EXPLOSION";
  }
  return `<svg viewBox="0 0 140 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${caption}"><rect width="140" height="110" rx="12" fill="#e7e6d1"/>${scene}<text x="70" y="103" text-anchor="middle" font-size="8" fill="#5a6b51" font-family="sans-serif">${caption}</text></svg>`;
}

// Camp and Market use the same resident interaction on touch and desktop.
function routeDifficulty(route, loc) {
  const d =
    route.index === 0
      ? DIFFICULTIES.normal
      : DIFFICULTIES[game.destination.difficulty || "normal"];
  return d.name + " · " + (route.danger * d.health).toFixed(2) + "× enemy HP";
}
function portraitTerrain(kind) {
  return `<svg class="portrait-terrain" viewBox="0 0 600 900" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="portrait-ground-${kind}" x2="0" y2="1"><stop stop-color="${kind === "camp" ? "#bbca9a" : "#c7c39e"}"/><stop offset="1" stop-color="${kind === "camp" ? "#8fa477" : "#a6ac88"}"/></linearGradient></defs><rect width="600" height="900" fill="url(#portrait-ground-${kind})"/><path d="M290-30Q330 150 250 260T300 520T295 940" fill="none" stroke="#d6c8a0" stroke-width="42"/><path d="M-20 380Q100 320 260 425T620 450M-20 710Q140 600 300 720T620 760" fill="none" stroke="#d6c8a0" stroke-width="27"/>${Array.from(
    { length: 18 },
    (_, i) => {
      const x = i % 2 ? 570 : 25,
        y = 40 + i * 49;
      return `<g transform="translate(${x},${y})"><ellipse cy="26" rx="33" ry="12" fill="#526a4926"/><path d="M0 5v27" stroke="#8e7953" stroke-width="8"/><circle r="29" fill="#718d5c"/><circle cx="-8" cy="-13" r="19" fill="#96ad76"/></g>`;
    },
  ).join(
    "",
  )}<g opacity=".35" fill="#688350">${Array.from({ length: 18 }, (_, i) => `<path d="m${((i * 137) % 550) + 20} ${((i * 71) % 790) + 60} 4-10 4 10 6-13 3 13Z"/>`).join("")}</g>${kind === "market" ? '<circle cx="300" cy="400" r="34" fill="#9fa596" stroke="#e3d3b1" stroke-width="9"/><ellipse cx="300" cy="392" rx="23" ry="13" fill="#94b1b3"/><path d="M300 375v-25" stroke="#e4d4b3" stroke-width="9"/>' : ""}</svg>`;
}
function residentsView(place, heroes) {
  return `<div class="camp-residents">${heroes
    .map((h, i) => {
      const size = characterSize(h),
        pos = game.mapPositions[place]?.[h.id] || {
          x: 21 + i * 11,
          y: place === "market" ? 67 + (i % 2) * 8 : 64 + (i % 2) * 6,
        };
      return `<button class="camp-resident ${selected === h.id ? "chosen" : ""}" data-hero="${h.id}" data-resident="${i}" data-camp-walker="${i}" style="--resident-height:${Math.min(88, 48 * size[0])}px;--resident-width:${Math.min(84, 46 * size[1])}px;--idle-delay:-${h.appearance.idle || i}s;left:${pos.x}%;top:${pos.y}%" aria-label="Select or drag ${esc(h.name)}" title="${esc(h.name)} · Drag onto a service">${portraitSvg(h)}${h.companion ? `<span class="resident-pet" style="--pet-size:${PETS[h.companion.key].mode === "mount" ? 62 : h.companion.key === "sprite" ? 22 : 32}px">${petSvg(h.companion)}</span>` : ""}<span class="resident-name">${esc(h.name.split(" ")[0])}</span><span class="card-speech ${speechFor(h) ? "visible" : ""}" data-speech="${h.id}">${esc(speechFor(h))}</span></button>`;
    })
    .join("")}</div>`;
}
function portalScene() {
  return `<button class="camp-portal" data-portal data-drop-target="portal" aria-label="Eldrin the portalkeeper · Travel to unlocked regions"><svg viewBox="0 0 120 130" aria-hidden="true"><ellipse cx="48" cy="64" rx="31" ry="43" fill="#a5b7c1" fill-opacity=".45" stroke="#667d87" stroke-width="8"/><ellipse class="portal-shimmer" cx="48" cy="64" rx="23" ry="34" fill="#96a8c6" stroke="#e7d5aa" stroke-width="3"/><path d="M30 60q18-30 34 0t-34 11" stroke="#eadfbd" stroke-width="2" fill="none"/><ellipse cx="48" cy="113" rx="43" ry="9" fill="#5f745238"/><path d="m74 115 10-43h18l15 43Z" fill="#67788d" stroke="#4a5c70" stroke-width="2"/><circle cx="93" cy="66" r="12" fill="#d4bb93"/><path d="m75 57 17-32 20 32Z" fill="#5d718a"/><path d="M80 58h28" stroke="#d5bd86" stroke-width="3"/><path d="m83 68 10 24 12-24" fill="#e5dec8"/><path d="m108 117 2-50" stroke="#917f55" stroke-width="4"/><circle class="portal-shimmer" cx="111" cy="61" r="6" fill="#e3c784"/></svg><strong>Portalkeeper</strong><small>${game.regionUnlocks.length - 1} regions beyond the forest</small></button>`;
}
function showPortal() {
  openModal(
    "Eldrin, the portalkeeper",
    "The castle has fallen. New roads are waiting.",
    `<div class="portal-story">${portalScene()}<p>“Your Camp remains your home. I can open a passage to every region your company has earned.”</p></div><div class="portal-regions">${REGION_ORDER.filter(
      (id) => game.regionUnlocks.includes(id),
    )
      .map((id) =>
        button(
          `${icon(LOCATIONS[id].icon, 21)} ${LOCATIONS[id].name}`,
          `data-portal-region="${id}"`,
          "secondary-button",
        ),
      )
      .join(
        "",
      )}</div><p class="modal-note">Defeat each region’s final boss to open the next. Only your Camp can be built on.</p>`,
  );
  document.querySelectorAll("[data-portal-region]").forEach(
    (b) =>
      (b.onclick = async () => {
        await navigate("crossroads");
        await act("destination", {
          mode: "journey",
          location: b.dataset.portalRegion,
          target: REGIONS[b.dataset.portalRegion].first,
          routeIndex: 0,
          difficulty: "normal",
        });
      }),
  );
}
function showBuildSites() {
  openModal(
    "Build at your Camp",
    "Your only home. Gather materials to add new services.",
    `<div class="build-site-list">${
      Object.entries(BUILDINGS)
        .filter(
          ([key, b]) => !game.buildings[key] && Camp.buildingAllowed(game, b),
        )
        .map(([key, b]) =>
          button(
            `${icon(b.icon, 24)}<span><strong>${b.name}</strong><small>${Camp.costText(b.cost)}${b.minRoster ? " · Four adventurers needed" : ""}</small></span>`,
            `data-building="${key}"`,
            "item-option",
          ),
        )
        .join("") || "<p>Every Camp service has been built.</p>"
    }</div>`,
  );
}
function showCharacterService(h) {
  nightUi.showProfile(h);
}
function showMarketVisit() {
  marketVisitors = marketVisitors.filter((id) =>
    game.roster.some((h) => h.id === id && available(game, h)),
  );
  openModal(
    "Walk to the Market",
    "Choose who comes with you. Up to six ready adventurers; browsing alone is fine.",
    collection(
      game.roster.filter((h) => available(game, h)),
      "Your visitors",
      "market-visit",
    ),
    button("Stay at Camp", "data-close", "secondary-button") +
      button(
        "Visit Market · " + marketVisitors.length + " coming",
        'id="confirm-market-visit"',
      ),
  );
  $("confirm-market-visit").onclick = async () => {
    if (await act("visitMarket", { ids: marketVisitors })) {
      closeModal();
      selected = marketVisitors[0] || null;
      marketFor = null;
      marketMode = "vendors";
      vendor = "all";
      render(true);
      await syncObservation();
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };
}
function marketMapView() {
  const visitors = game.roster.filter((h) => game.marketParty.includes(h.id));
  return (
    heading(
      "LANTERNS IN THE LONG NIGHT",
      "The Market",
      "Visit a labeled stall. Drag a visitor onto a vendor to browse goods for them.",
      button("← Camp", 'data-nav="camp"', "secondary-button"),
    ) +
    workspace(
      `${marketTabs()}${stockTimer()}<div class="market-map local-map" data-local-map="market"><svg class="landscape-terrain" viewBox="0 0 900 540" preserveAspectRatio="none" aria-hidden="true"><rect width="900" height="540" fill="#c1c6a2"/><path d="M-10 272Q240 185 450 272T915 290M440-30Q500 170 450 290T450 600" stroke="#dbcca7" stroke-width="54" fill="none"/><circle cx="450" cy="270" r="40" fill="#9faa9c" stroke="#dfd2b2" stroke-width="12"/><ellipse cx="450" cy="263" rx="29" ry="18" fill="#a1bec0"/>${[20, 120, 770, 880].map((x, i) => `<g fill="#6f8a5b"><circle cx="${x}" cy="${i % 2 ? 492 : 28}" r="35"/><circle cx="${x + 10}" cy="${i % 2 ? 480 : 15}" r="24" fill="#91a36e"/></g>`).join("")}</svg>${portraitTerrain("market")}${VENDORS.map(
        (v) => {
          const pos = MARKET_PLOTS[v.id];
          return `<button class="market-map-stall" style="left:${pos[0]}%;top:${pos[1]}%;--stall-color:${{ guild: "#8b9f87", forge: "#b48168", arcane: "#a08cb4", night: "#8b9c92", menagerie: "#bd9f76", atelier: "#ad8e9e" }[v.id]}" data-vendor-map="${v.id}" data-drop-target="vendor:${v.id}">${vendorArt(v)}<strong>${v.name}</strong><small>${v.tag}</small></button>`;
        },
      ).join(
        "",
      )}${residentsView("market", visitors)}${nightUi.visitorScene("market")}${nightUi.marketArrows()}<div class="market-map-sign">THE MARKET SQUARE<small>${visitors.length} visiting adventurers</small></div></div><p class="map-help">${icon("army", 16)}${visitors.length ? "Pick up a visitor and drop them on a stall." : "Browse any stall, or return to Camp to bring adventurers."}</p>${marketServices()}<div class="market-visitor-list"><h3>Your visitors</h3>${visitors.map((h) => button(`${portraitSvg(h)}<span>${esc(h.name)}</span>`, `data-hero="${h.id}"`, "visitor-chip")).join("") || "<p>Exploring the Market alone.</p>"}</div>`,
    )
  );
}
function offerFitsHero(o, h) {
  if (!h) return true;
  if (o.kind === "item") {
    if (o.item.unidentified) return CLASSES[h.classId].magical;
    const def = ITEMS[o.item.key];
    return def.type === "armor"
      ? armorSlots(h).some(
          (slot, i) => slot.allowed && !armorRestriction(h, o.item, i),
        )
      : equipmentSlots(h).some(
          (slot, i) =>
            slot.types.includes(def.type) &&
            !equipmentRestriction(h, o.item, i),
        );
  }
  if (o.kind === "attribute") return !hasAttribute(h, o.key);
  if (o.kind === "talent")
    return (
      !h.talents.some((t) => t.key === o.key) && equipmentSlots(h).length < 8
    );
  if (o.kind === "cosmetic") return !game.cosmetics.includes(o.key);
  return true;
}
function marketFocusBar() {
  const h = heroById(marketFor);
  return h
    ? `<div class="market-focus">${portraitSvg(h)}<span>Goods for <strong>${esc(h.name)}</strong> · ${className(h)}</span>${button("Show all goods", "data-market-clear", "text-button")}</div>`
    : "";
}
function openVendor(id, heroId = null) {
  marketShopVendor = id;
  marketFor = game.marketParty.includes(heroId) ? heroId : null;
  shopSearch = "";
  shopType = "all";
  shopPage = 0;
  showVendorShop();
}
function showVendorShop() {
  const v = VENDORS.find((v) => v.id === marketShopVendor);
  if (!v) return;
  const h = heroById(marketFor),
    q = shopSearch.toLowerCase();
  let stock = (game.market[v.id] || []).filter(
    (o) =>
      offerFitsHero(o, h) &&
      (shopType === "all" || shopType === o.kind) &&
      `${offerInfo(o).name} ${offerInfo(o).text} ${offerInfo(o).detail}`
        .toLowerCase()
        .includes(q),
  );
  stock.sort((a, b) =>
    shopSort === "price"
      ? a.gold - b.gold
      : shopSort === "rarity"
        ? (offerInfo(b).tier || 0) - (offerInfo(a).tier || 0)
        : offerInfo(a).name.localeCompare(offerInfo(b).name),
  );
  const pages = Math.max(1, Math.ceil(stock.length / 8));
  shopPage = Math.min(shopPage, pages - 1);
  openModal(
    v.name,
    h ? "Compatible goods for " + h.name + " · " + className(h) : v.text,
    `${stockTimer()}${vendorArt(v)}${h ? `<div class="market-focus">${portraitSvg(h)}<span><strong>${esc(h.name)}</strong><small>${h.race} · ${className(h)} · ${CLASSES[h.classId].armorWeight} armor</small></span>${button("All goods", "data-shop-all", "text-button")}</div>` : ""}<div class="shop-tools"><input id="shop-search" class="modal-select" type="search" value="${esc(shopSearch)}" placeholder="Search this vendor…" aria-label="Search this vendor"><select id="shop-type" class="modal-select" aria-label="Goods type"><option value="all">All kinds</option>${[...new Set((game.market[v.id] || []).map((o) => o.kind))].map((kind) => `<option value="${kind}" ${kind === shopType ? "selected" : ""}>${title(kind)}</option>`).join("")}</select><select id="shop-sort" class="modal-select" aria-label="Sort goods">${[
      ["name", "Name"],
      ["price", "Price"],
      ["rarity", "Rarity"],
    ]
      .map(
        ([id, name]) =>
          `<option value="${id}" ${shopSort === id ? "selected" : ""}>${name}</option>`,
      )
      .join(
        "",
      )}</select></div><p>${stock.length} ${h ? "compatible" : "available"} goods · Page ${shopPage + 1} / ${pages}</p><div class="market-stock shop-stock">${
      stock
        .slice(shopPage * 8, shopPage * 8 + 8)
        .map((o) => {
          const d = offerInfo(o);
          return `<article class="market-offer"><div class="offer-art">${d.art}</div>${d.tier !== undefined ? rarityTag(d.tier) : ""}<h3>${esc(d.name)}</h3><p>${esc(d.text)}</p><small>${d.sub}</small>${o.kind === "hero" ? button("Meet", `data-preview="${o.id}"`, "text-button") : ""}${o.kind === "item" ? button("Compare equipped", `data-compare="${o.id}"`, "text-button") : ""}${button(o.gold + " gold" + (o.gems ? " + " + o.gems + " gems" : ""), `data-buy="${o.id}" ${game.gold < o.gold || game.gems < o.gems ? "disabled" : ""}`)}</article>`;
        })
        .join("") || "<p>No matching goods. Try a different filter.</p>"
    }</div><div class="pagination">${button("Previous", `data-shop-page="${shopPage - 1}" ${shopPage === 0 ? "disabled" : ""}`, "secondary-button")}<span>${shopPage + 1} / ${pages}</span>${button("Next", `data-shop-page="${shopPage + 1}" ${shopPage >= pages - 1 ? "disabled" : ""}`, "secondary-button")}</div>`,
    button("Full catalog", "data-shop-catalog", "secondary-button"),
    showVendorShop,
  );
  $("shop-search").oninput = (e) => {
    shopSearch = e.target.value;
    const pos = e.target.selectionStart;
    showVendorShop();
    $("shop-search").focus();
    $("shop-search").setSelectionRange(pos, pos);
  };
  $("shop-type").onchange = (e) => {
    shopType = e.target.value;
    shopPage = 0;
    showVendorShop();
  };
  $("shop-sort").onchange = (e) => {
    shopSort = e.target.value;
    showVendorShop();
  };
  document.querySelectorAll("[data-shop-page]").forEach(
    (b) =>
      (b.onclick = () => {
        shopPage = Number(b.dataset.shopPage);
        showVendorShop();
      }),
  );
  document.querySelector("[data-shop-all]")?.addEventListener("click", () => {
    marketFor = null;
    shopPage = 0;
    showVendorShop();
  });
  document
    .querySelector("[data-shop-catalog]")
    ?.addEventListener("click", () => {
      closeModal();
      marketMode = "catalog";
      vendor = v.id;
      marketPage = 0;
      render(true);
    });
}
function bindMapControls() {
  residentDrag = attachResidentDragging(document, {
    select: (id) => {
      selected = id;
      selectedUid = null;
      renderDetail();
    },
    move: (id, x, y) => act("moveResident", { id, x, y }),
    drop: async (id, target) => {
      selected = id;
      renderDetail();
      if (target.startsWith("building:")) {
        const key = target.slice(9);
        if (key === "bonfire") bonfireTab = "classes";
        showBuilding(key, id);
      } else if (target.startsWith("vendor:")) openVendor(target.slice(7), id);
      else if (target === "portal") showPortal();
    },
    dragging: (on) => {
      document.body?.setAttribute("data-dragging", on ? "yes" : "no");
      if (!on && pendingMapRender) {
        pendingMapRender = false;
        render(true);
      }
    },
  });
  const viewport = $("region-map-viewport");
  if (!viewport) return;
  const loc = game.destination.location,
    state = mapViews.get(loc);
  if (state) {
    viewport.scrollLeft = state.x;
    viewport.scrollTop = state.y;
  } else {
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }
  viewport.addEventListener("scroll", () =>
    mapViews.set(loc, { x: viewport.scrollLeft, y: viewport.scrollTop }),
  );
  document.querySelectorAll("[data-map-zoom]").forEach(
    (b) =>
      (b.onclick = () => {
        mapViews.set(loc, { x: viewport.scrollLeft, y: viewport.scrollTop });
        mapZoom = Math.max(
          1,
          Math.min(2.5, mapZoom + Number(b.dataset.mapZoom) * 0.2),
        );
        render(true);
      }),
  );
  document.querySelector("[data-map-fit]")?.addEventListener("click", () => {
    mapZoom = 1;
    mapViews.delete(loc);
    render(true);
  });
  let pan = null;
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch" || e.target.closest("button")) return;
    pan = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    viewport.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!pan || pan.id !== e.pointerId) return;
    viewport.scrollLeft = pan.left - (e.clientX - pan.x);
    viewport.scrollTop = pan.top - (e.clientY - pan.y);
  });
  viewport.addEventListener("pointerup", () => (pan = null));
  viewport.addEventListener("pointercancel", () => (pan = null));
}
function marketBar() {
  return `<section class="camp-detail"><span class="eyebrow">BESIDE YOUR CAMP</span><h2>The Market</h2><p>Six specialists, one full catalog. Select a visitor or drop them onto a stall to see compatible goods.</p><div class="camp-metrics"><div><b>${game.marketParty.length}</b><span>Visitors</span></div><div><b>${VENDORS.length}</b><span>Vendors</span></div><div><b>${game.gold}</b><span>Gold</span></div><div><b>${game.gems}</b><span>Gem value</span></div></div>${button("Search the full catalog", 'data-market-mode="catalog"', "secondary-button")}${button("Return to Camp", 'data-nav="camp"', "secondary-button")}</section>`;
}

function stockTimer() {
  return `<div class="stock-timer">${icon("gear", 17)}<span>New stock in <strong data-stock-timer>${time((stockResetAt(game) - game.lastClock) / 1000)}</strong></span><small>Resets every 12 hours · UTC</small></div>`;
}
function castleArt() {
  return `<svg class="map-castle" viewBox="0 0 120 105" aria-hidden="true"><ellipse cx="60" cy="95" rx="53" ry="9" fill="#6e78524a"/><path d="M19 32h24v59H19Zm61 0h23v59H80ZM43 48h37v43H43Z" fill="#b7b6a1" stroke="#68775e" stroke-width="3"/><path d="M16 32 30 7l15 25M77 32 91 7l15 25" fill="#a25f55" stroke="#81453c" stroke-width="2"/><path d="M44 46V35h9v7h15v-7h10v11" fill="#b7b6a1" stroke="#68775e" stroke-width="3"/><path d="M53 92V73q8-14 16 0v19" fill="#58614c"/><path d="M26 48h9v13h-9m61-13h9v13h-9" fill="#5e6a50"/><path d="M61 35V7l21 6-21 8" fill="#b5544c" stroke="#824238" stroke-width="2"/></svg>`;
}
function expansionArrows() {
  return Object.entries(Camp.CAMP_EXPANSIONS)
    .map(([key, d]) =>
      button(
        `<span aria-hidden="true">${key === "east" ? "→" : key === "west" ? "←" : "↓"}</span>`,
        `${game.campExpansions.includes(key) ? "data-camp-zone" : "data-expand-camp"}="${key}" aria-label="${game.campExpansions.includes(key) ? "Visit" : "Repair road to"} ${d.name}"`,
        "camp-expansion-arrow " + key,
      ),
    )
    .join("");
}
function showExpansion(key) {
  const d = Camp.CAMP_EXPANSIONS[key],
    cost = Camp.expansionCost(game, key);
  openModal(
    "Repair the road to " + d.name,
    "Clear the land and repair the road to make room for " +
      d.purpose.toLowerCase() +
      ".",
    `<div class="expansion-preview">${icon("camp", 75)}<h3>A little more room to call home</h3><p>${Camp.costText(cost)}</p><p>These resources repair the road and clear the land. Use the Build menu to add a service afterward. Each repaired road raises the cost of the remaining expansions.</p></div>`,
    button("Keep saving", "data-close", "secondary-button") +
      button(
        "Repair road",
        'id="confirm-expansion" ' +
          (!Camp.hasCost(game, cost) ? "disabled" : ""),
      ),
  );
  $("confirm-expansion").onclick = async () => {
    if (await act("expandCamp", { key }, "A new part of Camp is yours."))
      closeModal();
  };
}
function expansionScene() {
  if (game.campZone === "south") return lakeshoreScene();
  const zone = game.campZone,
    d = Camp.CAMP_EXPANSIONS[zone],
    key = { east: "farm", west: "cabins", south: "garden" }[zone],
    b = BUILDINGS[key],
    built = game.buildings[key];
  return `<div class="camp-map local-map expanded-camp" data-local-map="camp" data-camp-ground>${portraitTerrain("camp")}<svg class="expansion-land" viewBox="0 0 600 900" aria-hidden="true"><path d="M100 630Q300 540 500 630" stroke="#d0c09a" stroke-width="35" fill="none"/>${built ? (zone === "east" ? Array.from({ length: 4 }, (_, i) => `<g transform="translate(${95 + (i % 2) * 215} ${280 + Math.floor(i / 2) * 130})"><path d="m0 20 140-15 30 90-140 15Z" fill="${built ? "#9e7854" : "#b7ba8c"}" stroke="#7f7856" stroke-width="4"/>${built ? Array.from({ length: 12 }, (_, n) => `<path d="m${20 + (n % 4) * 31} ${24 + Math.floor(n / 4) * 25} 3-13 5 13 5-11 2 11" fill="#88a368"/>`).join("") : ""}</g>`).join("") : zone === "west" ? Array.from({ length: 3 }, (_, i) => `<g transform="translate(${70 + i * 165} ${360 + (i % 2) * 75})"><path d="M10 60h115v100H10Z" fill="${built ? "#b89b72" : "#b8bb94"}" stroke="#796e52" stroke-width="4"/><path d="m0 64 66-65 68 65Z" fill="${built ? "#8a7b60" : "#a3ad81"}"/><path d="M49 160V96h37v64" fill="#66634c"/><path d="M17 90h23v27H17" fill="#e7cea1"/></g>`).join("") : `<ellipse cx="300" cy="420" rx="175" ry="100" fill="${built ? "#9aaa77" : "#b2bc93"}" stroke="#ad9f74" stroke-width="10"/>${Array.from({ length: 14 }, (_, i) => `<path d="m${180 + (i % 5) * 55} ${365 + Math.floor(i / 5) * 44}q-25-25 0-18 20-35 7 3 24-19 4 5" fill="#648f59"/>`).join("")}`) : ""}</svg><div class="camp-map-label"><strong>${d.name}</strong><span>Owned Camp expansion · ${b.name}</span></div>${button('<span aria-hidden="true">↑</span>', 'data-camp-zone="center" aria-label="Return to central Camp"', "camp-market-sign")}${built ? button(`${icon(b.icon, 30)}<strong>${b.name}</strong>`, `data-building="${key}" data-drop-target="building:${key}"`, "expansion-service") : ""}${game.buildings.archaeology && game.archaeologyZone === zone ? button(icon("bone", 30) + "<strong>Archaeology Camp</strong>", 'data-building="archaeology" data-drop-target="building:archaeology"', "archaeology-service") : ""}${residentsView("camp", game.roster.filter((h) => available(game, h)).slice(0, 5))}</div>`;
}
function showCampPlot(key, h = null) {
  const b = BUILDINGS[key];
  let body;
  if (key === "cabins") {
    const cost = Camp.cabinCost(game);
    body = `<div class="expansion-preview">${icon("camp", 75)}<h3>Room for more stories</h3><p>${game.buildings.cabins} cabin${game.buildings.cabins === 1 ? "" : "s"} · ${game.roster.length} / ${Camp.campCapacity(game)} adventurers</p><p>Each new cabin adds capacity for 20 adventurers. Characters remain available for travel.</p><strong>${Camp.costText(cost)}</strong></div>${button("Build another cabin · +20 capacity", `data-construct="cabins" ${!Camp.hasCost(game, cost) ? "disabled" : ""}`)}`;
  } else {
    const cycles = Math.min(
      12,
      Math.floor(
        (game.lastClock - (game[key + "HarvestAt"] ?? game.lastClock)) / 300000,
      ),
    );
    body = `<div class="expansion-preview">${icon("leaf", 75)}<h3>${key === "farm" ? "Food for returning friends" : "Herbs for cooks and alchemists"}</h3><p>${b.text}</p><strong data-harvest-timer="${key}">${cycles} harvests ready</strong><p>${key === "farm" ? cycles * 2 + " food" : cycles + " herbs"} waiting</p></div>${button("Harvest", `data-harvest="${key}" ${cycles < 1 ? "disabled" : ""}`)}`;
  }
  openModal(b.name, b.text, body, "", () => showCampPlot(key, h));
}
function gemShopView() {
  const offers = (game.gemShop || []).filter(
    (o) => gemFilter === "all" || o.kind === gemFilter,
  );
  return (
    heading(
      "GEMS FOR SOMETHING SPECIAL",
      "The Shop",
      "Cosmetics, Mythical adventurers and signature weapons. Apply your cosmetics at the Market’s Atelier.",
    ) +
    `${stockTimer()}<div class="shop-intro"><span class="gem-art">◆</span><div><h2>${game.gems} gem value</h2><p>Collected gemstones are your currency here. Your gold stays available for Camp and Market services.</p></div></div><div class="storage-tabs">${[
      ["all", "Everything"],
      ["cosmetic", "Cosmetics"],
      ["item", "Mythical weapons"],
      ["hero", "Mythical adventurers"],
    ]
      .map(([key, label]) =>
        button(
          label,
          `data-gem-filter="${key}"`,
          gemFilter === key ? "secondary-button selected" : "text-button",
        ),
      )
      .join("")}</div><div class="gem-shop-grid">${
      offers
        .map((o) => {
          const d = offerInfo(o),
            owned = o.kind === "cosmetic" && game.cosmetics.includes(o.key);
          return `<article class="gem-shop-offer"><div class="offer-art">${d.art}</div><span class="eyebrow">${o.kind === "cosmetic" ? "A NEW LOOK" : "MYTHICAL · SPECIAL SHOP GEAR"}</span><h3>${esc(d.name)}</h3><p>${esc(o.hero ? d.detail : d.text)}</p>${o.hero ? '<p class="small">Mythical · Lv ' + o.hero.level + " · " + o.hero.race + " " + className(o.hero) + "</p>" : ""}${
            o.item
              ? `<p class="small">Lv ${o.item.level} · ${WEAPON_KINDS[ITEMS[o.item.key].weaponKind]}</p><div class="modifier-list">${weaponModifiers(
                  o.item,
                )
                  .map((m) => "<small>" + m.name + " · " + m.text + "</small>")
                  .join("")}</div>`
              : ""
          }${button(owned ? "Already owned" : o.gems + " gem value", `data-gem-buy="${o.id}" ${owned || game.gems < o.gems || (o.kind === "hero" && game.roster.length >= Camp.campCapacity(game)) ? "disabled" : ""}`)}</article>`;
        })
        .join("") ||
      "<p>No goods remain in this category. New stock arrives at the next reset.</p>"
    }</div>`
  );
}
function challengeTabs() {
  return `<div class="challenge-tabs" role="tablist">${[
    ["daily", "Daily Battle"],
    ["monthly", "Champions & milestones"],
    ["players", "Player challenges"],
  ]
    .map(([id, label]) =>
      button(
        label,
        `data-challenge-tab="${id}" role="tab" aria-selected="${challengeTab === id}"`,
        challengeTab === id ? "secondary-button selected" : "text-button",
      ),
    )
    .join("")}</div>`;
}
function challengesView() {
  if (challengeTab === "players")
    return challengeTabs() + playerChallengesView();
  const m = calendarMonth(game.lastClock),
    count = Object.keys(game.calendarClaims).filter((k) =>
      k.startsWith(m.key + ":"),
    ).length,
    cards =
      challengeTab === "daily"
        ? [trialInfo(game, { challengeId: "daily" })]
        : [
            trialInfo(game, { challengeId: "weekly" }),
            trialInfo(game, { challengeId: "monthly" }),
            ...REGION_ORDER.filter((loc) => game.regionBossClears[loc]).map(
              (loc) =>
                trialInfo(game, { challengeId: "boss", bossLocation: loc }),
            ),
          ];
  return (
    heading(
      "ONE BATTLE. A CLEAR REWARD.",
      "Challenges",
      "Today’s Daily Battle, themed champions, and the bosses your company has overcome.",
    ) +
    challengeTabs() +
    `<section class="challenge-theme"><span class="eyebrow">${new Date(game.lastClock).toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" })} · ${m.name}</span><h2>${m.text}</h2><p>${count} / ${m.days} victorious daily dates this month.</p></section>${
      challengeTab === "monthly"
        ? `<div class="calendar-bonuses">${CALENDAR_BONUSES.map((b) => {
            const n = b.days === "all" ? m.days : b.days;
            return `<div class="calendar-bonus ${game.calendarBonuses[m.key + ":" + n] ? "claimed" : ""}"><strong>${n} different days</strong><span>${b.text}</span><div class="xp-track"><i style="width:${Math.min(100, (count / n) * 100)}%"></i></div></div>`;
          }).join("")}</div>`
        : ""
    }<div class="trial-grid">${cards
      .map((d) => {
        const key = trialClaimKey(d),
          done = !!game.challengeTiers[key];
        return `<article class="trial-card"><div class="trial-crest">${icon(d.challengeId === "daily" ? "shield" : "sword", 38)}</div><span class="eyebrow">${d.challengeId === "daily" ? "TODAY · DAY " + d.day : d.challengeId === "boss" ? "UNLOCKED BOSS" : title(d.challengeId) + " champion"} · SINGLE ENCOUNTER</span><h3>${d.name}</h3><p>Suggested level ${d.level} · ${LOCATIONS[d.location].name}</p><div class="trial-prize"><b>${d.victoryGold} gold</b><span>${d.victoryGems ? d.victoryGems + " gem value" : d.special === "food" ? "3 food" : d.special === "supplies" ? "Luck potion" : "Character XP"}${d.challengeId === "monthly" ? " + Starlit cosmetic" : ""}</span></div>${button(done ? "✓ Won · Choose difficulty" : "Choose party", `data-trial="${d.challengeId}" ${d.day ? 'data-day="' + d.day + '"' : ""} ${d.bossLocation ? 'data-boss-location="' + d.bossLocation + '"' : ""}`, "secondary-button")}<small>Choose difficulty before fighting. Higher tiers pay only the additional reward.</small></article>`;
      })
      .join("")}</div>`
  );
}
function showTrialParty() {
  const d = destinationInfo(game),
    heroes = game.roster.filter((h) => game.staging.includes(h.id)),
    free = activeExpeditions(game).length < expeditionSlots(game),
    prior = game.challengeTiers[trialClaimKey(d)] || 0,
    extraGold = Math.max(
      0,
      d.victoryGold - Math.round(d.baseVictoryGold * prior),
    ),
    extraGems = Math.max(
      0,
      d.victoryGems - Math.round(d.baseVictoryGems * prior),
    );
  openModal(
    "Choose your challenge company",
    d.name,
    `<div class="modal-note">One combat encounter · Suggested level ${d.level}<br><strong>${DIFFICULTIES[d.difficulty].name} · ${d.reward}× rewards</strong><br>Victory pays ${extraGold} gold${extraGems ? " + " + extraGems + " gem value" : ""} at this tier. Your characters keep XP and return afterward.</div><div class="difficulty-grid">${Object.entries(
      DIFFICULTIES,
    )
      .map(([id, v]) =>
        button(
          `<strong>${v.name}</strong><span>${v.reward}× rewards</span><small>${v.health}× HP · ${v.damage}× damage</small>`,
          `data-trial-difficulty="${id}" aria-pressed="${d.difficulty === id}"`,
          d.difficulty === id ? "difficulty-card selected" : "difficulty-card",
        ),
      )
      .join(
        "",
      )}</div>${collection(game.roster, "Three to six adventurers", "staging")}`,
    button("Keep thinking", "data-close", "secondary-button") +
      button(
        "Start challenge",
        'id="confirm-trial-launch" ' +
          (!free || heroes.length < 3 || heroes.some((h) => !available(game, h))
            ? "disabled"
            : ""),
      ),
  );
  modalRefresh = showTrialParty;
  $("confirm-trial-launch").onclick = async () => {
    if (await act("launch", {}, "The challenge begins.")) {
      closeModal();
      selected = currentExpedition().party[0];
      await syncObservation();
      render(true);
    }
  };
}
function confirmRelease(id) {
  const h = heroById(id);
  if (!h) return;
  openModal(
    "Let " + esc(h.name) + " go?",
    "This permanently removes the adventurer.",
    `<div class="class-tree-intro">${portraitSvg(h)}<p>Their equipment and companion return to storage. No gold or gems are awarded. Keep at least three adventurers at Camp.</p></div>`,
    button("Stay together", "data-close", "secondary-button") +
      button(
        "Let them go",
        `id="confirm-release" ${!available(game, h) || h.favorite || game.roster.length <= 3 ? "disabled" : ""}`,
        "primary-button danger",
      ),
  );
  $("confirm-release").onclick = async () => {
    if (
      await act("release", { id }, "Their belongings are safely in storage.")
    ) {
      selected = null;
      closeModal();
      render(true);
    }
  };
}

function lakeshoreScene() {
  return `<div class="camp-map local-map lakeshore-map"><svg viewBox="0 0 900 540" class="lake-terrain" preserveAspectRatio="none" aria-hidden="true"><rect width="900" height="540" fill="#132f42"/><path d="M0 0h900v198Q660 287 400 194T0 278Z" fill="#354936"/><path d="M0 228Q250 164 423 216T900 225" stroke="#779696" stroke-width="9" fill="none"/><ellipse cx="665" cy="416" rx="107" ry="45" fill="#384d43"/><path d="M625 422v-66h70v66m-82-66 47-38 47 38" fill="#44495f" stroke="#9290b8" stroke-width="4"/><path d="M650 365h20v27h-20Z" fill="#b18bde"/><path d="m674 425 35 14m-100 12 45 8M104 409h95m96-43h71" stroke="#618d97" stroke-width="3"/>${game.buildings.dock ? '<path d="M329 210v120h84V205m-84 24h84m-84 25h84m-84 25h84m-84 25h84" fill="#877252" stroke="#cab58a" stroke-width="7"/>' : ""}</svg><div class="camp-map-label"><strong>South lakeshore</strong><span>The Bell Beneath · an island in the local lake</span></div>${button("↑ Central Camp", 'data-camp-zone="center"', "market-direction north")}${game.buildings.dock ? button(icon("flag", 30) + "<strong>Lantern Dock</strong>", 'data-building="dock"', "dock-service") : button("Build Lantern Dock", 'data-building="dock"', "dock-service")}${button("◈ The Bell Beneath<small>25 floors · " + (game.buildings.dock ? "Sail from the dock" : "Build the dock to reach it") + "</small>", "data-island-preview", "island-sign")}${game.buildings.garden ? button("Herb garden", 'data-building="garden"', "shore-garden") : ""}${game.buildings.archaeology && game.archaeologyZone === "south" ? button("Archaeology Camp", 'data-building="archaeology"', "shore-archaeology") : ""}${nightUi.visitorScene("dock")}</div>`;
}
