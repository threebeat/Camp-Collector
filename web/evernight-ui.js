import { pixelTerrainSvg, pixelBuildingSvg } from "./pixel-art.js?v=21";
import * as E from "./evernight.js?v=21";
import { vision } from "./lighting.js?v=21";
import {
  CLASSES,
  ITEMS,
  DIFFICULTIES,
  LOCATIONS,
  makeItem,
  classTree,
  classNodeState,
  classPoints,
  itemInfo,
} from "./data.js?v=21";
import {
  activeExpeditions,
  available,
  expeditionSlots,
} from "./progression.js?v=21";
import {
  allQuests,
  questState,
  questProgress,
  activeQuests,
  REGION_ORDER,
  REGIONS,
} from "./journeys.js?v=21";
import { MATERIALS, calendarMonth, MONTH_THEMES } from "./world.js?v=21";
import { portraitSvg, itemSvg, icon } from "./art.js?v=21";
export function createEvernightUi(c) {
  const {
      getGame,
      button,
      esc,
      openModal,
      act,
      closeModal,
      heroPicker,
      collection,
      navigate,
      render,
    } = c,
    g = () => getGame(),
    hero = (id) => g().roster.find((h) => h.id === id);
  let questFilter = "active",
    questSearch = "",
    themeMonth = null;
  function campBar() {
    const s = g(),
      p = E.campProgress(s),
      food = E.foodPlan(s),
      ready = s.roster.filter((h) => available(s, h)).length,
      deployed = s.roster.filter((h) =>
        activeExpeditions(s).some((r) => r.party.includes(h.id)),
      ).length;
    return `<section class="camp-detail evernight-camp-card"><div class="camp-name-row"><h2>${esc(s.campName || "Your Camp")}</h2>${button(icon("gear", 16), 'data-rename-camp aria-label="Rename Camp"', "icon-button")}</div>${button("Build at Camp", "data-build-sites", "secondary-button camp-build")}<button class="camp-level-card" data-camp-progress><span>Camp level <b>${p.level}</b></span><span>${p.xp} / ${p.needed} XP</span><div class="xp-track"><i style="width:${(p.xp / p.needed) * 100}%"></i></div></button><details class="camp-overview" ${typeof window === "undefined" || !window.matchMedia?.("(max-width: 850px)").matches ? "open" : ""}><summary>${s.roster.length} / ${c.capacity(s)} adventurers · ${s.food} food · Camp details</summary><div class="camp-metrics"><div><b>${s.roster.length} / ${c.capacity(s)}</b><span>Adventurers</span></div><div><b>${ready} / ${deployed}</b><span>Ready / on expedition</span></div><button data-service="pantry"><b>${s.food}</b><span>Food · −${food.demand} / 12h</span></button><button data-service="bonfire"><b>${DIFFICULTIES[s.worldDifficulty].name}</b><span>World difficulty</span></button></div><details class="camp-supplies" id="camp-supplies"><summary>Camp resources<span>View stock</span></summary><dl class="camp-resource-list">${Object.entries(
      MATERIALS,
    )
      .map(
        ([key, m]) =>
          `<div title="${esc(m.text)}"><dt>${icon(m.icon, 16)} ${m.name}</dt><dd>${s.materials[key] || 0}</dd></div>`,
      )
      .join(
        "",
      )}<div><dt>${icon("paw", 16)} Dinosaur eggs</dt><dd>${s.eggs || 0}</dd></div></dl></details><p class="camp-meal-time">Next meal in ${Math.max(0, Math.ceil((food.next - s.lastClock) / 3600000))}h · ${food.supplied} supplied</p></details></section>`;
  }
  function progress() {
    const p = E.campProgress(g());
    openModal(
      "Camp level " + p.level,
      "A home that grows with your company",
      `<p>${E.CAMP_XP_TEXT}</p><p class="modal-note">${p.total} lifetime Camp XP · ${p.xp} / ${p.needed} toward the next level.</p><table><tbody>${Object.entries(
        g().campXpSources,
      )
        .map(
          ([k, v]) => `<tr><th>${esc(k)}</th><td>${Math.floor(v)} XP</td></tr>`,
        )
        .join("")}</tbody></table>`,
    );
  }
  function resourceStrip() {
    return `<div class="camp-resource-strip">${["wood", "stone", "ore", "herbs", "meat"].map((k) => `<span>${icon(MATERIALS[k].icon, 16)}<b>${g().materials[k] || 0}</b> ${MATERIALS[k].name}</span>`).join("")}</div>`;
  }
  function questSummary() {
    const quests = activeQuests(g()),
      q = quests.find((q) => q.id === g().trackedQuest) || quests[0];
    return `<section class="quest-board quest-summary"><div><h3>Quests</h3><p>${q ? esc(q.name) : "All accepted quests complete"} · ${quests.length} active</p></div>${button("Quest journal", 'data-nav="quests"', "secondary-button")}</section>`;
  }
  function questsView() {
    let list = allQuests(g())
      .filter(
        (q) =>
          questState(g(), q).unlocked ||
          questState(g(), q).claimed ||
          g().sideQuests.includes(q.id),
      )
      .filter((q) => {
        const s = questState(g(), q);
        return questFilter === "all" || questFilter === "completed"
          ? questFilter === "all" || s.claimed
          : questFilter === "pinned"
            ? g().questPins.includes(q.id)
            : s.unlocked && !s.claimed;
      })
      .filter((q) =>
        (q.name + " " + q.text)
          .toLowerCase()
          .includes(questSearch.toLowerCase()),
      );
    list.sort((a, b) =>
      g().questSort === "name"
        ? a.name.localeCompare(b.name)
        : g().questSort === "category"
          ? (a.category || "Side").localeCompare(b.category || "Side")
          : Number(questState(g(), b).complete) -
            Number(questState(g(), a).complete),
    );
    return `<section class="quest-journal"><div class="section-heading"><div><span class="eyebrow">YOUR COMPANY'S JOURNAL</span><h1>Your quests</h1><p>${g().questClaims.length} completed · ${activeQuests(g()).length} active</p></div></div><div class="quest-controls"><input id="quest-search" aria-label="Search quests" placeholder="Search quests" value="${esc(questSearch)}"><select id="quest-filter" aria-label="Quest status">${["active", "pinned", "completed", "all"].map((k) => `<option value="${k}" ${questFilter === k ? "selected" : ""}>${k[0].toUpperCase() + k.slice(1)}</option>`).join("")}</select><select id="quest-sort" aria-label="Sort quests">${["progress", "category", "name"].map((k) => `<option value="${k}" ${g().questSort === k ? "selected" : ""}>${k}</option>`).join("")}</select></div><div class="quest-grid">${
      list
        .map((q) => {
          const s = questState(g(), q),
            p = questProgress(g(), q),
            { done, total } = p;
          return `<article class="quest-card"><span class="eyebrow">${q.category || "Side"} · ${s.claimed ? "COMPLETED" : s.complete ? "READY TO CLAIM" : s.unlocked ? "IN PROGRESS" : "LOCKED"}</span><h3>${esc(q.name)}</h3><p>${esc(q.text)}</p>${q.location ? `<p class="small">${LOCATIONS[q.location].name}${q.target ? " · " + (REGIONS[q.location]?.nodes.find((n) => n.id === q.target)?.name || q.target) : ""}</p>` : ""}<div class="xp-track"><i style="width:${(done / total) * 100}%"></i></div><small>${done} / ${total} ${p.label}${!s.unlocked && q.after ? " · Requires: " + esc(allQuests(g()).find((v) => v.id === q.after)?.name || q.after) : ""}</small><p class="quest-reward">${Object.entries(
            q.reward,
          )
            .map(([k, n]) => n + " " + (MATERIALS[k]?.name || k))
            .join(
              " · ",
            )}</p><div class="card-actions">${button(g().questPins.includes(q.id) ? "Unpin" : "Pin", `data-pin-quest="${q.id}"`, "text-button")}${!s.claimed && s.unlocked ? button(g().trackedQuest === q.id ? "Tracking" : "Track", `data-track-quest="${q.id}"`, "secondary-button") : ""}${button(s.claimed ? "Claimed" : "Claim reward", `data-quest="${q.id}" ${!s.unlocked || !s.complete || s.claimed ? "disabled" : ""}`)}</div></article>`;
        })
        .join("") ||
      "<p>No quests match. Look for people with a question mark around the Tavern to find new stories.</p>"
    }</div></section>`;
  }
  function tree(h, readOnly = false) {
    const nodes = classTree(h).flatMap((p) => p.nodes),
      levels = [10, 20, 40, 60, 80];
    const children = (id) => nodes.filter((n) => n.parent === id);
    const spots = new Map();
    let leaf = 0;
    function place(n) {
      const branch = children(n.id);
      const x = branch.length
        ? branch.map(place).reduce((a, b) => a + b, 0) / branch.length
        : 80 + leaf++ * 104;
      spots.set(n.id, { x, y: 160 + levels.indexOf(n.level) * 132 });
      return x;
    }
    nodes.filter((n) => n.parent === "root").forEach(place);
    const width = Math.max(780, leaf * 104 + 56),
      rootX = spots.get(nodes[0].id)?.x || width / 2;
    const wires = nodes
      .map((n) => {
        const b = spots.get(n.id),
          a = spots.get(n.parent) || { x: rootX, y: 48 },
          mid = (a.y + b.y) / 2;
        return `<path class="${classNodeState(h, n).learned ? "learned" : ""}" d="M${a.x} ${a.y + 28}V${mid}H${b.x}V${b.y - 28}"/>`;
      })
      .join("");
    return `<div class="skill-tree-scroll" tabindex="0" aria-label="Scroll branching class tree"><div class="rpg-skill-tree" style="width:${width}px;height:760px" role="group" aria-label="${CLASSES[h.classId].label} skill tree"><svg viewBox="0 0 ${width} 760" aria-hidden="true">${wires}</svg><div class="tree-hero" style="left:${rootX}px">${portraitSvg(h, true)}<strong>${esc(CLASSES[h.classId].label)}</strong></div>${nodes
      .map((n) => {
        const state = classNodeState(h, n),
          pos = spots.get(n.id);
        return button(
          `<span class="skill-emblem">${icon(state.learned ? "check" : n.kind === "subclass" ? "shield" : n.name.includes("Forceful") ? "sword" : n.name.includes("Measured") ? "eye" : "spark", 24)}</span><strong>${esc(n.name)}</strong><small>Lv ${n.level}${state.learned ? " · Learned" : state.available ? " · 1 point" : ""}</small>`,
          `data-class-node="${n.id}" data-for="${h.id}" style="left:${pos.x}px;top:${pos.y}px" title="${esc(n.text)}" aria-label="${esc(n.name)}. Level ${n.level}. ${esc(n.text)}${state.learned ? " Learned." : state.available ? " Available." : " Locked."}" ${readOnly || !state.available || !available(g(), h) ? "disabled" : ""}`,
          `rpg-skill-node ${state.learned ? "learned" : state.available ? "available" : "locked"}`,
        );
      })
      .join(
        "",
      )}</div></div><p class="small">Follow the connected branches. Green nodes can be learned; gold nodes are yours. Each point locks sibling choices.</p>`;
  }
  function difficultyCards() {
    return `<div class="difficulty-grid">${["normal", "hard", "nightmare"]
      .map((key) => {
        const d = DIFFICULTIES[key],
          unlocked = E.difficultyUnlocked(g(), key);
        return button(
          `<strong>${d.name}</strong><span>${d.reward}× rewards</span><small>${unlocked ? d.health + "× enemy HP · " + d.damage + "× damage" : "Defeat " + E.DIFFICULTY_GATES[key] + " different regional bosses"}</small>`,
          `data-world-difficulty="${key}" ${unlocked ? "" : "disabled"} aria-pressed="${g().worldDifficulty === key}"`,
          "difficulty-card " + (g().worldDifficulty === key ? "selected" : ""),
        );
      })
      .join("")}</div>`;
  }
  function bonfire(h = null) {
    h = h || g().roster.find((h) => available(g(), h));
    openModal(
      "The Bonfire",
      "Class trees and world difficulty",
      `<div class="bonfire-character">${h ? heroPicker(h) + `<p>${esc(h.name)} · ${classPoints(h)} unspent points</p>` : "<p>Your adventurers are away.</p>"}</div>${h ? tree(h) : ""}<details class="bonfire-difficulty"><summary>World difficulty · ${DIFFICULTIES[g().worldDifficulty].name}</summary>${difficultyCards()}</details>`,
      "",
      () => bonfire(h && hero(h.id)),
    );
    document.getElementById("modal").dataset.sheet = "skills";
    const treeScroll = document.querySelector(".skill-tree-scroll");
    if (treeScroll)
      treeScroll.scrollLeft =
        (treeScroll.scrollWidth - treeScroll.clientWidth) / 2;
    const picker = document.getElementById("service-hero");
    if (picker) picker.onchange = () => bonfire(hero(picker.value));
  }
  function lightSheet(h) {
    if (!h) return;
    const v = vision(h);
    openModal(
      "Light & night vision",
      h.name,
      `<div class="profile-intro">${portraitSvg(h)}<p>${v.label}: ${v.sight} units. ${h.light ? itemInfo(h.light).name + " lights " + v.light + " units." : "No equipped light: ordinary characters move cautiously when they cannot detect a foe."}</p></div><div class="item-list">${
        g()
          .inventory.filter((i) => ITEMS[i.key]?.type === "light")
          .map(
            (i) =>
              `<div class="item-option">${itemSvg(i)}<span><strong>${itemInfo(i).name}</strong><small>${ITEMS[i.key].lightRadius}-unit light radius</small></span>${button("Equip", `data-equip-light="${i.id}" data-for="${h.id}" ${available(g(), h) && g().screen === "camp" ? "" : "disabled"}`)}</div>`,
          )
          .join("") ||
        "<p>Build the Camp Market to buy lights from the supply merchant.</p>"
      }</div>`,
      h.light
        ? button(
            "Unequip light",
            `data-equip-light="" data-for="${h.id}" ${available(g(), h) && g().screen === "camp" ? "" : "disabled"}`,
            "secondary-button",
          )
        : "",
      () => lightSheet(hero(h.id)),
    );
  }
  function portal() {
    openModal(
      "Eldrin, the portalkeeper",
      "Choose a map · one Boss sigil",
      `<p class="modal-note">${g().materials.bossSigils} Boss sigils. Final regional bosses drop one every successful journey, including repeat clears. Champion rematches do not drop sigils.</p><div class="portal-regions">${REGION_ORDER.map(
        (id) => {
          const owned = g().regionUnlocks.includes(id);
          return `<article><h3>${LOCATIONS[id].name}</h3><p>${LOCATIONS[id].text}</p>${button(owned ? "Travel" : "Open · 1 Boss sigil", owned ? `data-portal-travel="${id}"` : `data-open-portal="${id}" ${g().materials.bossSigils < 1 ? "disabled" : ""}`, "secondary-button")}</article>`;
        },
      ).join("")}</div>`,
      "",
      portal,
    );
  }
  function guild(id, h = null) {
    const d = E.GUILDS.find((d) => d.id === id);
    if (!d) return;
    h = h || g().roster.find((h) => available(g(), h));
    const o = E.guildOffer(g(), id),
      s = E.standing(g(), id),
      receipt = id + ":" + Math.floor(g().lastClock / 43200000);
    openModal(
      d.name,
      "Guild standing " + s,
      `${h ? heroPicker(h) : "<p>Bring a ready adventurer for lessons.</p>"}<div class="guild-services"><article><h3>Training</h3><p>35 gold · improves ${d.stat} training · +10 standing.${id === "scouts" ? " Two lessons unlock Night vision." : ""}</p>${button("Take a lesson", `data-guild-lesson="${id}" data-for="${h?.id || ""}" ${h && available(g(), h) && g().gold >= 35 ? "" : "disabled"}`)}${d.profession ? button("Profession lessons", `data-guild-profession="${id}" data-for="${h?.id || ""}"`, "secondary-button") : ""}</article><article><h3>Guild quests</h3><p>Win four encounters · +20 standing · 65 gold and four ${d.resource}.</p>${button("Accept patrol", `data-guild-quest="${id}" ${g().sideQuests.includes("guild-" + id + "-" + Math.floor(g().lastClock / 86400000)) ? "disabled" : ""}`)}${button("Quest journal", 'data-nav="quests"', "text-button")}</article><article><h3>Members shop</h3>${itemSvg(makeItem(o.key, o.level))}<p>Level ${o.level} ${ITEMS[o.key].name} · discount grows with standing, up to 40%.</p>${button(s < 20 ? "Requires 20 standing" : g().guildPurchases.includes(receipt) ? "Sold this period" : o.gold + " gold", `data-guild-buy="${id}" ${s < 20 || g().gold < o.gold || g().guildPurchases.includes(receipt) ? "disabled" : ""}`)}</article></div>`,
      "",
      () => guild(id, h && hero(h.id)),
    );
    const p = document.getElementById("service-hero");
    if (p) p.onchange = () => guild(id, hero(p.value));
  }
  function districtMap() {
    const key = g().marketDistrict,
      names = {
        guildhall: "Guildhall",
        commons: "Wayfarer Court",
        arena: "Arena grounds",
        tavern: "The Last Lantern Tavern",
        clinic: "Lantern Clinic",
      },
      name = names[key] || "Market square";
    let content = "";
    if (key === "guildhall")
      content = `<div class="guild-booth-grid">${E.GUILDS.map((d) => button(`<span>${pixelBuildingSvg("guild-" + d.id)}</span><strong>${d.name}</strong><small>${E.standing(g(), d.id)} standing</small>`, `data-guild-booth="${d.id}" style="--booth-color:${d.color}"`, "district-booth")).join("")}</div>`;
    if (key === "commons")
      content = `<div class="court-services">${button(pixelBuildingSvg("outfitter") + "<strong>The Outfitter</strong><small>Add equipment slots</small>", 'data-district-open="outfitter"', "district-booth")}${button(pixelBuildingSvg("questboard") + "<strong>Quest Board</strong><small>Stories and daily contracts</small>", 'data-district-open="board"', "district-booth")}</div>`;
    if (key === "arena")
      content = `<div class="arena-gate-art">${pixelBuildingSvg("arena")}<h2>The Wagering Pit</h2><p>${E.arenaRule(g()).name} · ${E.arenaRule(g()).text}</p>${button("Enter the Arena", "data-enter-arena")}</div>`;
    if (key === "tavern")
      content = `<div class="tavern-services">${button("Browse adventurers", 'data-vendor-map="guild"', "secondary-button")}<div class="tavern-recruits">${g()
        .visitors.filter((h) => h.place === "tavern")
        .map((h) =>
          button(
            `${portraitSvg(h)}<strong>${esc(h.name)}</strong><small>Lv ${h.level} · ${h.price} gold</small>`,
            `data-neutral="${h.id}"`,
            "tavern-recruit",
          ),
        )
        .join("")}</div></div>`;
    if (key === "clinic")
      content = button(
        "Enter the Clinic",
        'data-district-open="clinic"',
        "district-booth",
      );
    return `<section class="district-map-shell"><div class="section-heading"><h2>${name}</h2>${button("← Market square", 'data-market-district="square"', "secondary-button")}</div><div class="district-map ${key}-district" data-district-map="${key}"><div class="district-terrain pixel-ground">${pixelTerrainSvg(key === "tavern" ? "tavern" : "market", 900, 540, 37)}</div>${content}</div></section>`;
  }
  function marketArrows() {
    return `<nav class="market-directions" aria-label="Market districts">${button("↑ Guildhall", 'data-market-district="guildhall"', "market-direction north")}${button("← Outfitter & Quests", 'data-market-district="commons"', "market-direction west")}${button("Arena →", 'data-market-district="arena"', "market-direction east")}${button("↓ Camp", 'data-nav="camp"', "market-direction south")}</nav>`;
  }
  function arenaView() {
    const rule = E.arenaRule(g()),
      w = g().arenaWager,
      d = DIFFICULTIES[g().worldDifficulty],
      free = activeExpeditions(g()).length < expeditionSlots(g()),
      valid =
        free &&
        g().staging.length === 3 &&
        g().gold >= w.gold &&
        (!w.resource || g().materials[w.resource] >= w.amount);
    return `<div class="section-heading"><div><span class="eyebrow">GOLD AND RESOURCES AT RISK</span><h1>The Arena</h1></div>${button("← Camp", "data-arena-back", "secondary-button")}</div><section class="arena-banner"><h2>${rule.name}</h2><p>${rule.text}</p><p>${d.name} world difficulty · ${d.reward}× rewards · ${g().arenaWins} wins</p></section><section class="arena-wager"><h3>Your wager</h3><label>Gold <input id="arena-gold" type="number" min="10" max="1000" value="${w.gold}"></label><label>Resource <select id="arena-resource"><option value="">Gold only</option>${["wood", "stone", "ore", "herbs", "meat", "hide"].map((k) => `<option value="${k}" ${w.resource === k ? "selected" : ""}>${MATERIALS[k]?.name || k}</option>`).join("")}</select></label><label>Amount <input id="arena-amount" type="number" min="0" max="100" value="${w.amount}"></label>${button("Set wager", "data-set-wager", "secondary-button")}<p>Lose or recall: lose the wager. Win: ${Math.floor(w.gold * (rule.id === "four" ? 4 : 2.2) * d.reward)} gold returned${w.resource ? " plus " + Math.ceil(w.amount * 2.2 * d.reward) + " " + w.resource : ""}. No gems, recruits or cosmetic prizes.</p></section>${collection(g().roster, "Choose your three", "staging")}<div class="launch-bar"><strong>${g().staging.length} / 3 staged · ${w.gold} gold at risk</strong>${button("Place wager & fight", `id="launch-btn" ${valid ? "" : "disabled"}`)}</div>`;
  }
  function calendar() {
    const m = calendarMonth(g().lastClock);
    return `<section class="daily-calendar" aria-label="Daily battle calendar"><div><h3>${new Date(g().lastClock).toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" })}</h3><small>UTC · ✓ completed · × missed · ring today</small></div><div class="calendar-days">${["S", "M", "T", "W", "T", "F", "S"].map((d) => `<b>${d}</b>`).join("")}${"<span></span>".repeat(m.firstDay)}${Array.from(
      { length: m.days },
      (_, i) => {
        const day = i + 1,
          done = !!g().calendarClaims[m.key + ":" + day],
          state = done
            ? "complete"
            : day < m.today
              ? "missed"
              : day === m.today
                ? "today"
                : "future";
        return `<span class="calendar-date ${state} ${day === m.today ? "current" : ""}" ${day === m.today ? 'aria-current="date"' : ""} title="Day ${day}: ${state}">${day}<small>${done ? "✓" : day < m.today ? "×" : "·"}</small></span>`;
      },
    ).join("")}</div></section>`;
  }
  function monthlyShop() {
    const m = calendarMonth(g().lastClock);
    themeMonth ??= m.month;
    const t = MONTH_THEMES[themeMonth];
    return `<section class="monthly-shop"><div class="section-heading"><div><span class="eyebrow">MONTHLY COLLECTION</span><h2>${t[0]}</h2><p>${t[2]}</p></div><select id="shop-theme" aria-label="Monthly theme">${MONTH_THEMES.map((t, i) => `<option value="${i}" ${themeMonth === i ? "selected" : ""}>${new Date(Date.UTC(2026, i, 1)).toLocaleDateString("en", { month: "long", timeZone: "UTC" })} · ${t[0]}</option>`).join("")}</select></div><div class="monthly-offers">${[
      0, 1, 2,
    ]
      .map((i) => {
        const o = c.monthlyOffers(g(), themeMonth)[i],
          owned = g().cosmetics.includes(o.key);
        return `<article><div class="monthly-emblem" style="--theme-color:${o.color}">${icon(i === 0 ? "moon" : i === 1 ? "flame" : "wing", 38)}</div><h3>${o.name}</h3><p>${o.text}</p>${button(owned ? "Owned" : o.gems + " gem value", `data-monthly-buy="${o.id}" ${owned || g().gems < o.gems ? "disabled" : ""}`)}</article>`;
      })
      .join("")}</div></section>`;
  }
  function tutorial() {
    const bar = document.getElementById("tutorial-bar"),
      s = g();
    if (!bar) return;
    bar.hidden =
      !s.settings.tutorial ||
      s.storyPage < 3 ||
      s.tutorialStep >= 5 ||
      ["expedition", "party", "crossroads", "arena"].includes(s.screen);
    if (bar.hidden) return;
    const tips = [
        ["Meet your company at the Character tent.", "tent"],
        ["Stock the Pantry for twelve-hour meals.", "pantry"],
        [
          s.buildings.market
            ? "Visit your Camp Market and equip lights."
            : "Grow Camp to level 2, then build a Market.",
          "market",
        ],
        ["Follow a quest from your journal.", "quests"],
        ["Choose a road at the Crossroads.", "crossroads"],
      ],
      tip = tips[s.tutorialStep];
    bar.innerHTML = `<span><b>${s.tutorialStep + 1} / 5</b> ${tip[0]}</span>${button("Show me", `data-tutorial-action="${tip[1]}"`, "text-button")}${button("Next tip", "data-tutorial-next", "text-button")}${button("Skip", "data-tutorial-skip", "text-button")}`;
    bind(bar);
  }
  function story() {
    const s = g();
    if (s.storyPage >= 3) {
      if (!s.campNamed) c.renameCamp();
      return;
    }
    const pages = [
        [
          "Evernight",
          "No dawn has broken for generations. Roads disappear beyond the firelight, and the things that see in darkness have learned to rule it. A lantern is more than comfort: it tells your company where danger begins.",
        ],
        [
          "A fire within a dark forest clearing",
          "You have found a small clearing in the forest. Beyond the bonfire, the land is hidden by night. Build a home, invite travelers and eventually establish a small Market. Every improvement pushes the shadows farther back.",
        ],
        [
          "Three volunteers",
          "Three adventurers have offered to stay: a Vanguard, a Ranger and a Cleric. They bring their own equipment and lanterns. Give their Camp a name, then choose what their first shared story will be.",
        ],
      ],
      p = pages[s.storyPage];
    openModal(
      p[0],
      `${s.storyPage + 1} / 3`,
      `${s.storyPage === 2 ? '<div class="onboarding-faces">' + s.roster.slice(0, 3).map(portraitSvg).join("") + "</div>" : ""}<p class="opening-story">${p[1]}</p>${s.storyPage === 2 ? `<label class="field-label" for="camp-name-input">Camp name</label><input id="camp-name-input" maxlength="36" placeholder="e.g. Last Light" value="${esc(s.campName)}">` : ""}`,
      button(
        s.storyPage === 2 ? "Light the fire" : "Continue",
        s.storyPage === 2 ? 'id="confirm-camp-name"' : "data-story-next",
      ),
    );
    document.querySelector("#modal [data-close]")?.setAttribute("hidden", "");
    if (s.storyPage === 2)
      document.getElementById("confirm-camp-name").onclick = async () => {
        const name = document.getElementById("camp-name-input").value.trim();
        if (!name) return;
        if (await act("nameCamp", { name })) {
          await act("story");
          closeModal();
          render(true);
        }
      };
  }
  function bind(root) {
    const on = (selector, fn) =>
      root.querySelectorAll(selector).forEach((b) => (b.onclick = () => fn(b)));
    on("[data-camp-progress]", progress);
    on("[data-pin-quest]", async (b) => {
      await act("pinQuest", { id: b.dataset.pinQuest });
      c.refreshJournal?.();
    });
    on("[data-world-difficulty]", async (b) => {
      if (await act("worldDifficulty", { key: b.dataset.worldDifficulty }))
        bonfire();
    });
    on("[data-light-profile]", (b) => lightSheet(hero(b.dataset.lightProfile)));
    on("[data-equip-light]", async (b) => {
      if (
        await act("light", {
          id: b.dataset.for,
          itemId: b.dataset.equipLight || null,
        })
      )
        lightSheet(hero(b.dataset.for));
    });
    on("[data-open-portal]", async (b) => {
      if (await act("openPortal", { location: b.dataset.openPortal })) portal();
    });
    on("[data-portal-travel]", async (b) => {
      const loc = b.dataset.portalTravel;
      await navigate("crossroads");
      await act("destination", {
        mode: "journey",
        location: loc,
        target: REGIONS[loc].first,
        routeIndex: 0,
      });
    });
    on("[data-guild-booth]", (b) => guild(b.dataset.guildBooth));
    on("[data-guild-lesson]", async (b) => {
      if (
        await act("guildLesson", {
          id: b.dataset.for,
          guild: b.dataset.guildLesson,
        })
      )
        guild(b.dataset.guildLesson, hero(b.dataset.for));
    });
    on("[data-guild-profession]", (b) =>
      c.showProfessions(hero(b.dataset.for)),
    );
    on("[data-guild-quest]", async (b) => {
      if (await act("guildQuest", { guild: b.dataset.guildQuest }))
        guild(b.dataset.guildQuest);
    });
    on("[data-guild-buy]", async (b) => {
      if (await act("guildBuy", { guild: b.dataset.guildBuy }))
        guild(b.dataset.guildBuy);
    });
    on("[data-enter-arena]", () => navigate("arena"));
    on("[data-arena-back]", async () => {
      await navigate("camp");
    });
    on("[data-set-wager]", () =>
      act("wager", {
        gold: +document.getElementById("arena-gold").value,
        resource: document.getElementById("arena-resource").value || null,
        amount: +document.getElementById("arena-amount").value,
      }),
    );
    on("[data-story-next]", async () => {
      if (await act("story")) story();
    });
    on("[data-tutorial-next]", () => act("tutorial"));
    on("[data-tutorial-skip]", () =>
      act("settings", { key: "tutorial", value: false }),
    );
    on("[data-tutorial-action]", async (b) => {
      const k = b.dataset.tutorialAction;
      await act("tutorial");
      if (k === "quests") await navigate("quests");
      else {
        await navigate("camp");
        if (k === "market") c.marketVisit();
        else if (k === "crossroads") await navigate("crossroads");
        else c.service(k === "tent" ? "characters" : k);
      }
    });
    on("[data-monthly-buy]", (b) =>
      act("monthlyBuy", { id: b.dataset.monthlyBuy }),
    );
    const qs = root.querySelector("#quest-search");
    if (qs)
      qs.oninput = () => {
        questSearch = qs.value;
        if (c.refreshJournal) c.refreshJournal();
        else render(true);
        const n = document.getElementById("quest-search");
        n.focus();
        n.setSelectionRange(questSearch.length, questSearch.length);
      };
    const qf = root.querySelector("#quest-filter");
    if (qf)
      qf.onchange = () => {
        questFilter = qf.value;
        if (c.refreshJournal) c.refreshJournal();
        else render(true);
      };
    const sort = root.querySelector("#quest-sort");
    if (sort)
      sort.onchange = async () => {
        await act("questSort", { key: sort.value });
        c.refreshJournal?.();
      };
    const theme = root.querySelector("#shop-theme");
    if (theme)
      theme.onchange = () => {
        themeMonth = +theme.value;
        render(true);
      };
  }
  return {
    campBar,
    progress,
    resourceStrip,
    questSummary,
    questsView,
    tree,
    bonfire,
    lightSheet,
    portal,
    guild,
    districtMap,
    marketArrows,
    arenaView,
    calendar,
    monthlyShop,
    tutorial,
    story,
    bind,
  };
}
