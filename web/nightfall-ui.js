import { vision } from "./lighting.js?v=14";
import {
  CLASSES,
  RACES,
  CORE_STATS,
  ITEMS,
  ATTRIBUTES,
  stats,
  armorSlots,
  equipmentSlots,
  className,
  characterAttributes,
  allGear,
  itemInfo,
  itemRarity,
  RARITIES,
  heroRarity,
  makeItem,
} from "./data.js?v=14";
import * as Night from "./nightfall.js?v=14";
import * as Camp from "./camp.js?v=14";
import {
  QUESTS,
  generatedContracts,
  allQuests,
  questState,
  activeQuests,
} from "./journeys.js?v=14";
import { portraitSvg, itemSvg, petSvg, icon } from "./art.js?v=14";

// Screens are separate from the simulation and receive its command boundary.
export function createNightfallUi(c) {
  const {
    getGame,
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
    treeHtml,
    growthHtml,
    select,
    render,
    showSlots,
    showTransforms,
    showSell,
    openVendor,
  } = c;
  const game = () => getGame(),
    hero = (id) => game().roster.find((h) => h.id === id),
    owned = (h) => !!hero(h.id);
  const notice = (h, n, armor = false) =>
    Night.equipmentNotice(game(), h, n, armor)
      ? '<i class="new-gear-dot" aria-label="New compatible equipment"></i>'
      : "";
  const returnProfile = (h) =>
    button("← Character profile", `data-profile="${h.id}"`, "text-button");
  function showProfile(h) {
    if (!h) return;
    select(h.id);
    const g = game(),
      ready = Camp.idle(g, h),
      s = stats(h);
    openModal(
      esc(h.name),
      "Character tent · a life by the fire",
      `<div class="profile-intro"><div class="profile-portrait" style="--body-height:${c.characterSize(h)[0]};--body-width:${c.characterSize(h)[1]}">${portraitSvg(h)}</div><div><h3>${esc(h.race)} · ${esc(className(h))}</h3><p>Level ${h.level} · ${RARITIES[heroRarity(h)]}</p><p>${Math.ceil(h.currentHp)} / ${s.hp} HP · ${ready ? "Ready at Camp" : "Traveling or resting"}</p>${button("Race details", `data-profile-race="${h.id}"`, "text-button")}${button("Class & calling", `data-profile-class="${h.id}"`, "text-button")}</div></div>
      <div class="stat-six">${CORE_STATS.map((k) => `<div><strong>${s[k].toFixed(1)}</strong><small>${k}</small></div>`).join("")}</div>
      <h3>Armor & equipment</h3><div class="profile-gear">${armorSlots(h)
        .map((slot, n) =>
          button(
            `${h.armor[n] ? itemSvg(h.armor[n]) : icon("shield", 24)}<span>${slot.label}<small>${h.armor[n] ? itemInfo(h.armor[n]).name : "Empty"}</small></span>${notice(h, n, true)}`,
            `data-profile-armor="${n}" data-for="${h.id}" ${slot.allowed ? "" : "disabled"}`,
            "equipment-slot",
          ),
        )
        .join("")}${equipmentSlots(h)
        .map((slot, n) =>
          button(
            `${h.items[n] ? itemSvg(h.items[n]) : icon("spark", 24)}<span>${slot.label}<small>${h.items[n] ? itemInfo(h.items[n]).name : "Empty"}</small></span>${notice(h, n)}`,
            `data-profile-slot="${n}" data-for="${h.id}"`,
            "equipment-slot",
          ),
        )
        .join("")}</div>
      <h3>Light & sight</h3>${button((h.light ? itemInfo(h.light).name : "No light") + " · " + vision(h).label + " · " + vision(h).sight + " sight", `data-light-profile="${h.id}"`, "equipment-slot")}<h3>Companion</h3><div class="profile-companion">${h.companion ? petSvg(h.companion) : icon("paw", 42)}<p>${h.companion ? esc(h.companion.key) + " · Lv " + h.companion.level : "There is room for a friend."}</p>${button("Choose companion", `data-service="pet" data-for="${h.id}" ${ready ? "" : "disabled"}`, "secondary-button")}</div>
      <h3>Attributes & professions</h3><div class="detail-chip-list">${characterAttributes(
        h,
      )
        .map(
          (a) =>
            `<span class="detail-chip" title="${esc(a.text)}">${esc(a.name)}</span>`,
        )
        .join(
          "",
        )}</div><p class="small">Guildhall teaches professions. The Lantern Clinic can lift supernatural Attributes.</p>
      <h3>Friends</h3><div class="bond-list">${
        Object.entries(h.bonds)
          .map(
            ([id, n]) =>
              `<p>${esc(hero(id)?.name || "An old friend")} · ${n} shared encounters</p>`,
          )
          .join("") || "<p>A first shared story is waiting.</p>"
      }</div><div class="friend-choices">${g.roster
        .filter((f) => f !== h && !h.bonds[f.id] && Camp.idle(g, f))
        .map((f) =>
          button(
            "Share a story with " + esc(f.name),
            `data-befriend="${f.id}" data-for="${h.id}" ${ready ? "" : "disabled"}`,
            "text-button",
          ),
        )
        .join("")}</div>
      <h3>Memories</h3><div class="profile-journal">${h.journal
        .slice(0, 20)
        .map((e) => `<p>${esc(e.text)}</p>`)
        .join(
          "",
        )}</div><label class="field-label" for="memory-text">Add a memory</label><textarea id="memory-text" class="modal-select" maxlength="180" placeholder="A little moment worth keeping…"></textarea>${button("Keep this memory", `data-memory="${h.id}"`, "secondary-button")}
      <div class="character-service-grid">${button("Growth tables", `data-growth="${h.id}"`, "secondary-button")}${button("Train a stat", `data-service="training" data-for="${h.id}" ${ready ? "" : "disabled"}`, "secondary-button")}${button("Equipment Workshop", 'data-service="armory"', "secondary-button")}${button("Retire adventurer", `data-release="${h.id}" ${!ready || h.favorite || g.roster.length <= 3 ? "disabled" : ""}`, "text-button danger")}</div>`,
      button("← All adventurers", "data-tent-list", "secondary-button"),
    );
  }
  function showClass(h) {
    const d = CLASSES[h.classId],
      interactive =
        owned(h) && game().screen === "camp" && Camp.idle(game(), h);
    const tree = treeHtml(h),
      safeTree = interactive
        ? tree
        : tree.replaceAll("data-class-node=", "data-preview-node=");
    openModal(
      esc(className(h)),
      "Class · behavior, equipment and calling",
      `<p class="modal-note">${esc(d.behavior)}</p><p>${esc(d.abilityText)}</p><div class="stat-six">${CORE_STATS.map((k) => `<div><strong>+${d.base[k] || 0}</strong><small>${k}</small></div>`).join("")}</div><h3>Starting equipment</h3><p>${d.slots.map((s) => esc(s.label) + " (" + esc(s.types.join(", ")) + ")").join(" · ")}</p><p>Armor: ${d.armorWeight} · Head, Chest, Legs, Boots${h.race === "Celestial" ? " (crown replaces Head)" : ""}</p><h3>Choose a calling</h3>${safeTree}<p class="small">Class points at levels 10, 20, 40, 60 and 80: talent, subclass, talent, subclass, talent. Each choice locks its siblings.</p><details><summary>Class growth</summary>${growthHtml(d.growthTable)}</details>`,
      owned(h) && game().screen === "camp" ? returnProfile(h) : "",
    );
  }
  function showRace(h) {
    const d = RACES[h.race];
    openModal(
      esc(h.race),
      "Race · foundations and physiology",
      `<div class="profile-intro"><div class="profile-portrait">${portraitSvg(h)}</div><p>${esc(d.text)}</p></div><div class="stat-six">${CORE_STATS.map((k) => `<div><strong>${d.base[k] || 0}</strong><small>${k}</small></div>`).join("")}</div><p>Height ${c.characterSize(h)[0].toFixed(2)}× · width ${c.characterSize(h)[1].toFixed(2)}×. ${h.race === "Celestial" ? "A permanent crown replaces the Head armor slot." : "Your class selects armor weight and equipment families."}</p><h3>Race growth</h3>${growthHtml(d.growthTable)}`,
      owned(h) && game().screen === "camp" ? returnProfile(h) : "",
    );
  }
  function showGuild(h = null) {
    h = h || game().roster.find((h) => Camp.idle(game(), h));
    if (!h) return;
    openModal(
      "The Guildhall",
      "Learn a trade. Keep your battle class.",
      heroPicker(h) +
        `<div class="guild-stalls">${Night.PROFESSION_NAMES.map((key) => {
          const a = Night.professions(h).find((a) => a.key === key),
            rank = a ? Night.professionRank(a) : 0,
            cost = Night.guildCost(h, key);
          return `<article><span>${icon(key === "Miner" ? "stone" : key === "Hunter" ? "paw" : "leaf", 30)}</span><h3>${key === "Miner" ? "Miners" : key === "Hunter" ? "Hunters" : "Foresters"} Guild</h3><p>${esc(ATTRIBUTES[key].text)}</p><p>${a ? Night.professionLabel(a) : "No profession yet"}</p><small>${Camp.costText(cost)}</small>${button(rank === 3 ? "Mastered" : rank ? "Advance to " + ["I", "II", "III"][rank] : "Learn " + key + " I", `data-profession="${key}" data-for="${h.id}" ${rank === 3 || !Camp.idle(game(), h) || !Camp.hasCost(game(), cost) ? "disabled" : ""}`)}</article>`;
        }).join(
          "",
        )}</div><p>First lesson includes the dedicated tool. Work on expeditions improves the profession; guild lessons unlock ranks sooner.</p>`,
      button(
        "← Market square",
        'data-market-district="square"',
        "secondary-button",
      ),
    );
    const picker = document.getElementById("service-hero");
    if (picker) picker.onchange = (e) => showGuild(hero(e.target.value));
  }
  function showClinic(h = null) {
    h = h || game().roster[0];
    openModal(
      "The Lantern Clinic",
      "Only this service can remove an Attribute.",
      heroPicker(h) +
        `<p>Each removal costs 50 gold and 2 herbs. Racial Attributes and Professions remain part of you.</p><div class="item-list">${
          h.attributes
            .filter((a) => ATTRIBUTES[a.key] && !ATTRIBUTES[a.key].profession)
            .map((a) =>
              button(
                "Lift " + esc(a.key),
                `data-remove-attribute="${a.key}" data-for="${h.id}" ${Camp.idle(game(), h) && Camp.hasCost(game(), { gold: 50, herbs: 2 }) ? "" : "disabled"}`,
                "secondary-button",
              ),
            )
            .join("") || "<p>No removable Attributes.</p>"
        }</div>`,
    );
    const p = document.getElementById("service-hero");
    if (p) p.onchange = (e) => showClinic(hero(e.target.value));
  }
  function showQuestBoard() {
    const g = game(),
      offers = [
        ...QUESTS.filter(
          (q) =>
            q.category === "Side" &&
            q.id !== "settle-in" &&
            q.id !== "stock-pantry",
        ),
        ...generatedContracts(g),
      ].filter(
        (q) => !g.sideQuests.includes(q.id) && !g.questClaims.includes(q.id),
      );
    openModal(
      "Market Quest Board",
      "Side quests · choose what your company does next",
      `<p>Carry up to eight side quests. Generated patrols renew each UTC day; accepted contracts keep their exact objectives.</p><div class="quest-grid">${offers
        .map(
          (q) =>
            `<article class="quest-card"><span class="eyebrow">${q.contract ? "PATROL CONTRACT" : "SIDE QUEST"}</span><h3>${esc(q.name)}</h3><p>${esc(q.text)}</p><small>${Object.entries(
              q.reward,
            )
              .map(([k, n]) => n + " " + k)
              .join(
                " · ",
              )}</small>${button("Accept quest", `data-accept-quest="${q.id}" ${g.sideQuests.filter((id) => !g.questClaims.includes(id)).length < 8 ? "" : "disabled"}`)}</article>`,
        )
        .join("")}</div>${questList("Side")}`,
      "",
      showQuestBoard,
    );
  }
  function questList(category = null) {
    const g = game(),
      qs = activeQuests(g).filter(
        (q) =>
          !category ||
          q.category === category ||
          (category === "Side" && q.category === "NPC"),
      );
    return `<div class="quest-grid">${qs
      .map((q) => {
        const s = questState(g, q);
        return `<article class="quest-card ${g.trackedQuest === q.id ? "tracked" : ""}"><span class="eyebrow">${q.category.toUpperCase()} QUEST${s.complete ? " · READY" : ""}</span><h3>${esc(q.name)}</h3><p>${esc(q.text)}</p><small>${Object.entries(
          q.reward,
        )
          .map(([k, v]) => v + " " + k)
          .join(
            " · ",
          )}</small><div class="card-actions">${s.complete ? button("Claim reward", `data-quest="${q.id}"`) : button(g.trackedQuest === q.id ? "✓ Tracking" : "Track", `data-track-quest="${q.id}"`, "secondary-button")}${q.target ? button("Show on local map", `data-quest-map="${q.id}"`, "text-button") : ""}</div></article>`;
      })
      .join("")}</div>`;
  }
  function visitorScene(place) {
    return `<div class="neutral-visitors">${(game().visitors || [])
      .filter((h) => h.place === place)
      .map(
        (h, i) =>
          `<button class="neutral-visitor" data-neutral="${h.id}" style="left:${24 + i * 26}%;top:${place === "market" ? 88 : 84}%" aria-label="${esc(h.name)} · ${h.npcType}"><span class="npc-marker ${h.npcType}">${h.npcType === "quest" ? "?" : h.npcType === "challenger" ? "!" : "+"}</span>${portraitSvg(h)}<small>${esc(h.name)}</small></button>`,
      )
      .join("")}</div>`;
  }
  function showVisitor(h) {
    if (!h) return;
    select(h.id);
    const q = QUESTS.find((q) => q.id === h.quest);
    openModal(
      esc(h.name),
      h.npcType === "wanderer"
        ? "A traveler at the edge of the fire"
        : h.npcType === "quest"
          ? "A story needs a company"
          : "A challenger is waiting",
      `<div class="profile-intro neutral"><div class="profile-portrait">${portraitSvg(h)}</div><div><p>${h.race} · ${className(h)} · Lv ${h.level}</p><p>${RARITIES[heroRarity(h)]}</p>${h.npcType === "wanderer" ? `<p>“A place at your fire. That is all I ask.”</p><strong>${h.price} gold</strong>` : q ? `<h3>${q.name}</h3><p>${q.text}</p>` : "<p>“Show me your company can hold a road through the dark.”</p>"}</div></div>`,
      h.npcType === "wanderer"
        ? button(
            "Welcome to Camp",
            `data-hire-visitor="${h.id}" ${game().gold < h.price || game().roster.length >= Camp.campCapacity(game()) ? "disabled" : ""}`,
          )
        : q
          ? button(
              game().sideQuests.includes(q.id) ||
                game().questClaims.includes(q.id)
                ? "Story already accepted"
                : "Accept story",
              `data-accept-quest="${q.id}" ${game().sideQuests.includes(q.id) || game().questClaims.includes(q.id) ? "disabled" : ""}`,
            )
          : button("Challenge the Night Watch", 'data-trial="night-watch"'),
    );
  }
  function showEquipFromStorage(id) {
    const i = game().inventory.find((i) => i.id === id);
    if (!i) return;
    openModal(
      "Equip " + esc(itemInfo(i).name),
      "Choose a compatible adventurer and slot",
      `<div class="item-list">${
        game()
          .roster.filter((h) => Camp.idle(game(), h))
          .flatMap((h) =>
            Night.compatibleSlots(h, i).map(
              (v) =>
                `<article class="equip-target">${portraitSvg(h)}<h3>${esc(h.name)} · ${v.s.label}</h3>${comparisonHtml(h, i, v.index, v.armor)}${button("Equip", `data-${v.light ? "equip-light" : v.armor ? "equip-armor" : "equip"}="${id}" data-for="${h.id}" data-index="${v.index}"`)}</article>`,
            ),
          )
          .join("") || "<p>No ready characters have a compatible slot.</p>"
      }</div>`,
    );
  }
  function comparisonHtml(h, item, index, armor = false) {
    const old =
      ITEMS[item.key]?.type === "light"
        ? h.light
        : h[armor ? "armor" : "items"][index];
    return `<div class="equipment-comparison"><p>Equipped: <strong>${old ? esc(itemInfo(old).name) : "Empty slot"}</strong></p><table><caption>${esc(h.name)} · character stats after equipping</caption><thead><tr><th>Stat</th><th>Current</th><th>New</th><th>Change</th></tr></thead><tbody>${
      Night.comparison(h, item, index, armor)
        .filter((v) => Math.abs(v.delta) > 0.01)
        .map(
          (v) =>
            `<tr><th>${v.key}</th><td>${v.before.toFixed(1)}</td><td>${v.after.toFixed(1)}</td><td class="${v.delta > 0 ? "positive" : "negative"}">${v.delta > 0 ? "+" : ""}${v.delta.toFixed(1)}</td></tr>`,
        )
        .join("") ||
      '<tr><td colspan="4">Same core stats. Compare the item effects below.</td></tr>'
    }</tbody></table><p class="small">${esc(itemInfo(item).desc)}</p></div>`;
  }
  function showComparison(id) {
    const item = Object.values(game().market)
      .flat()
      .find((o) => o.id === id)?.item;
    if (!item) return;
    openModal(
      "Compare " + esc(itemInfo(item).name),
      "Your company’s equipped belongings",
      `<div class="item-list">${
        game()
          .roster.flatMap((h) =>
            Night.compatibleSlots(h, item).map(
              (v) =>
                `<article><h3>${esc(h.name)} · ${v.s.label}</h3>${comparisonHtml(h, item, v.index, v.armor)}</article>`,
            ),
          )
          .join("") ||
        "<p>No compatible characters. Sealed items need analysis first.</p>"
      }</div>`,
    );
  }
  function showWorkshop() {
    openModal(
      "Equipment Workshop",
      "Craft, trade and transform your company’s belongings",
      `<div class="character-service-grid">${button("Buy equipment", "data-workshop-buy", "secondary-button")}${button("Sell belongings", "data-workshop-sell", "secondary-button")}${button("Transform armor", 'data-workshop-transform="armor"', "secondary-button")}${button("Transform weapons", 'data-workshop-transform="weapon"', "secondary-button")}${button("Transform companions", 'data-workshop-transform="pet"', "secondary-button")}</div><h3>Craft armor</h3><p>20 gold + 2 wood + hides (light / medium) or 3 ore (heavy).</p><div class="guild-stalls">${Object.entries(
        ITEMS,
      )
        .filter(([k, d]) =>
          /^(light|medium|heavy)-(head|chest|legs|boots)$/.test(k),
        )
        .map(
          ([key, d]) =>
            `<article>${itemSvg(makeItem(key))}<h3>${d.name}</h3><p>${d.desc}</p>${button("Craft", `data-craft-armor="${key}" ${Camp.hasCost(game(), { gold: 20, wood: 2, [d.weight === "heavy" ? "ore" : "hide"]: d.weight === "light" ? 2 : 3 }) ? "" : "disabled"}`)}</article>`,
        )
        .join("")}</div>`,
      "",
      showWorkshop,
    );
  }
  function showDock() {
    openModal(
      "The Lantern Dock",
      "The lake never reflects the right sky",
      `<div class="dock-story"><span>${icon("moon", 54)}</span><h3>The Bell Beneath</h3><p>A violet bell marks the island. Twenty-five floors wait beneath it. Every fifth floor has a guardian, and floor 25 holds authored Mythical armor.</p><p>Deepest floor reached: ${game().islandFloor} / 25 · Provisions: 3 food per adventurer.</p></div><div class="dock-arrivals">${
        (game().visitors || [])
          .filter((h) => h.place === "dock")
          .map((h) =>
            button(
              `${portraitSvg(h)}<span>${esc(h.name)} · ${RARITIES[heroRarity(h)]}<small>${h.price} gold</small></span>`,
              `data-neutral="${h.id}"`,
              "item-option",
            ),
          )
          .join("") ||
        "<p>No ship at the dock. Travelers arrive every three hours.</p>"
      }</div>`,
      button("Sail to the island", "data-sail-island"),
    );
  }
  function districtView() {
    const names = {
        guildhall: "Guildhall",
        board: "Quest Board",
        outfitter: "Outfitter",
        clinic: "Lantern Clinic",
      },
      key = game().marketDistrict;
    return `<section class="market-district"><span class="eyebrow">A MARKET OF LANTERNS</span><h2>${names[key]}</h2><p>${key === "guildhall" ? "The guilds keep useful trades alive through the long night." : key === "board" ? "Choose an intermediate goal for your company." : key === "outfitter" ? "More room for the belongings that make a character yours." : "Some things should not follow you home."}</p>${button("Enter " + names[key], `data-district-open="${key}"`)}${button("↓ Market square", 'data-market-district="square"', "secondary-button")}${visitorScene("market")}</section>`;
  }
  function marketArrows() {
    return `<nav class="market-directions" aria-label="Market districts">${button("↑ Guildhall", 'data-market-district="guildhall"', "market-direction north")}${button("← Outfitter", 'data-market-district="outfitter"', "market-direction west")}${button("Quest Board →", 'data-market-district="board"', "market-direction east")}${button("↓ Camp", 'data-nav="camp"', "market-direction south")}</nav>`;
  }
  function bind(root) {
    const on = (sel, cb) =>
      root.querySelectorAll(sel).forEach((b) => (b.onclick = () => cb(b)));
    on("[data-profile]", (b) => showProfile(hero(b.dataset.profile)));
    on("[data-profile-class]", (b) => showClass(hero(b.dataset.profileClass)));
    on("[data-profile-race]", (b) => showRace(hero(b.dataset.profileRace)));
    on("[data-profile-slot]", (b) => {
      const h = hero(b.dataset.for);
      act("equipmentSeen", { id: h.id, index: +b.dataset.profileSlot });
      showEquipment(h, +b.dataset.profileSlot);
    });
    on("[data-profile-armor]", (b) => {
      const h = hero(b.dataset.for);
      act("equipmentSeen", {
        id: h.id,
        index: +b.dataset.profileArmor,
        armor: true,
      });
      showArmor(h, +b.dataset.profileArmor);
    });
    on("[data-memory]", async (b) => {
      if (
        await act(
          "memory",
          {
            id: b.dataset.memory,
            text: document.getElementById("memory-text").value,
          },
          "Memory kept.",
        )
      )
        showProfile(hero(b.dataset.memory));
    });
    on("[data-befriend]", async (b) => {
      if (
        await act(
          "befriend",
          { id: b.dataset.for, friend: b.dataset.befriend },
          "A first shared story.",
        )
      )
        showProfile(hero(b.dataset.for));
    });
    on("[data-profession]", async (b) => {
      if (
        await act(
          "profession",
          { id: b.dataset.for, key: b.dataset.profession },
          "A useful trade learned.",
        )
      )
        showGuild(hero(b.dataset.for));
    });
    on("[data-remove-attribute]", async (b) => {
      if (
        await act(
          "removeAttribute",
          { id: b.dataset.for, key: b.dataset.removeAttribute },
          "The Attribute is lifted.",
        )
      )
        showClinic(hero(b.dataset.for));
    });
    on("[data-market-district]", async (b) => {
      closeModal();
      await act("marketDistrict", { key: b.dataset.marketDistrict });
      render(true);
    });
    on("[data-district-open]", (b) =>
      ({
        guildhall: showGuild,
        board: showQuestBoard,
        outfitter: () => showSlots(game().roster[0]),
        clinic: showClinic,
      })[b.dataset.districtOpen](),
    );
    on("[data-accept-quest]", async (b) => {
      if (
        await act(
          "acceptQuest",
          { id: b.dataset.acceptQuest },
          "A new side quest.",
        )
      )
        showQuestBoard();
    });
    on("[data-neutral]", (b) =>
      showVisitor(game().visitors.find((h) => h.id === b.dataset.neutral)),
    );
    on("[data-hire-visitor]", async (b) => {
      if (
        await act(
          "hireVisitor",
          { id: b.dataset.hireVisitor },
          "A new place at your fire.",
        )
      ) {
        closeModal();
        render(true);
      }
    });
    on("[data-storage-equip]", (b) =>
      showEquipFromStorage(b.dataset.storageEquip),
    );
    on("[data-compare]", (b) => showComparison(b.dataset.compare));
    on("[data-workshop-buy]", async () => {
      closeModal();
      await c.visitMarketFromWorkshop();
      openVendor("forge");
    });
    on("[data-workshop-sell]", async () => {
      closeModal();
      await c.visitMarketFromWorkshop();
      showSell();
    });
    on("[data-workshop-transform]", (b) =>
      showTransforms(b.dataset.workshopTransform),
    );
    on("[data-craft-armor]", async (b) => {
      if (
        await act("craftArmor", { key: b.dataset.craftArmor }, "Armor crafted.")
      )
        showWorkshop();
    });
    on("[data-sail-island]", async () => {
      if (await act("stageIsland", {}, "The island waits.")) {
        closeModal();
        render(true);
      }
    });
  }
  return {
    showProfile,
    showClass,
    showRace,
    showGuild,
    showClinic,
    showQuestBoard,
    questList,
    visitorScene,
    showWorkshop,
    showDock,
    districtView,
    marketArrows,
    comparisonHtml,
    bind,
  };
}
