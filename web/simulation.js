import * as Tavern from "./tavern.js?v=18";
import { CAMP_ANCHORS, revealedCampAreas } from "./camp-world.js?v=18";
import * as Learn from "./onboarding.js?v=18";
import { normalizeCampWorld } from "./camp-world.js?v=18";
import * as Ever from "./evernight.js?v=18";
import { questById } from "./journeys.js?v=18";
import * as Night from "./nightfall.js?v=18";
import { Battle } from "./engine.js?v=18";
import {
  LOCATIONS,
  initialGame,
  enemyCompany,
  stats,
  VENDORS,
  ITEMS,
  uid,
} from "./data.js?v=18";
import * as Camp from "./camp.js?v=18";
import * as P from "./progression.js?v=18";

// The clock lives outside the view. Every party gets the same fixed simulation steps.
export const STEP = 1 / 30;
export class ExpeditionSimulation {
  constructor(saved = null, now = Date.now()) {
    this.g =
      P.validateSave(saved) ||
      P.migrateSave(saved, now) ||
      initialGame(Math.random, now);
    Night.normalizeNightfall(this.g);
    Ever.normalizeEvernight(this.g);
    normalizeCampWorld(this.g);
    Learn.normalizeLearning(this.g);
    Tavern.normalizeTavern(this.g);
    this.g.campProps ||= [
      { id: "lantern", kind: "torch", x: 990, y: 700, lit: true },
      { id: "supply-crate", kind: "crate", x: 820, y: 665 },
      { id: "water-barrel", kind: "barrel", x: 1070, y: 850 },
    ];
    if (this.g.buildings.tavern) P.marketStock(this.g, "guild");
    Night.refreshVisitors(this.g);
    this.battles = new Map();
    this.observation = { id: null, visible: false, speed: 1, paused: false };
    this.cursor = 0;
    for (const r of P.activeExpeditions(this.g)) {
      r.auto = true;
      if (r.battleState)
        this.battles.set(
          r.id,
          Battle.fromState(r.battleState, this.callbacks(r)),
        );
    }
    this.advance(now, 0); // All time before an observation is restored belongs to background play.
  }
  callbacks(r) {
    return {
      onDefeat: (h) => P.recordDefeat(this.g, r, h),
      onConvert: (h) => P.recruitConverted(this.g, r, h),
    };
  }
  battle(r) {
    if (!this.battles.has(r.id)) {
      const b = new Battle(
        P.party(this.g, r),
        r.stage,
        r.seed + r.stage * 997,
        enemyCompany(
          r.stage,
          r.mode === "island"
            ? { ...r, level: r.roadItinerary[r.stage].level }
            : r,
        ),
        {
          ...this.callbacks(r),
          tutorialOutcome: r.tutorialOutcome,
          biome: r.roadItinerary?.[r.stage]?.water
            ? "river"
            : LOCATIONS[r.location].biome,
          terrainProfile: r.roadItinerary?.[r.stage] || {},
          mode: r.mode,
          supplies: r.supplies,
          recruitLimit: Math.max(0, 2 - r.recruits.length),
          ...(r.mode === "arena"
            ? { arenaRule: r.arenaRule, hazards: false }
            : {}),
          enemyTeams:
            r.mode === "arena"
              ? [
                  enemyCompany(r.stage, { ...r, seed: r.seed + 123 }),
                  enemyCompany(r.stage, { ...r, seed: r.seed + 456 }),
                ]
              : null,
        },
      );
      r.placements = b.autoPrepare();
      this.battles.set(r.id, b);
    }
    return this.battles.get(r.id);
  }
  rate(r) {
    return this.observation.visible && this.observation.id === r.id
      ? this.observation.paused
        ? 0
        : this.observation.speed
      : 1;
  }
  observe(next, now = Date.now()) {
    this.advance(now);
    const old = this.observation;
    this.observation = {
      id: next.id ?? null,
      visible: !!next.visible,
      speed: [1, 2, 3].includes(next.speed) ? next.speed : old.speed,
      paused: !!next.paused,
    };
    if (!this.observation.visible) this.observation.paused = false;
    this.backgroundAuto();
    return this.snapshot();
  }
  backgroundAuto() {
    for (const r of P.activeExpeditions(this.g))
      if (
        !this.observation.visible ||
        this.observation.id !== r.id ||
        this.observation.speed > 1
      )
        r.auto = true;
  }
  advance(now = Date.now(), budgetMs = 18) {
    const clock = Math.max(
        this.g.lastClock,
        Number.isFinite(now) ? now : this.g.lastClock,
      ),
      elapsed = (clock - this.g.lastClock) / 1000;
    this.g.lastClock = clock;
    Ever.consumeMeals(this.g);
    P.refreshStock(this.g);
    Night.refreshVisitors(this.g);
    if (this.g.screen === "tavern") Tavern.normalizeTavern(this.g);
    if (this.g.screen === "shop") P.gemShopStock(this.g);
    if (this.g.screen === "market")
      for (const v of VENDORS) P.marketStock(this.g, v.id);
    else if (this.g.screen === "camp" && this.g.buildings.tavern)
      P.marketStock(this.g, "guild");
    // A long timer gap means the browser suspended this worker. That unseen time is 1×,
    // even if the player had left a fast or paused battle open before suspension.
    this.backgroundAuto();
    for (const r of P.activeExpeditions(this.g)) {
      if (r.phase === "interlude" && !r.auto) {
        r.pendingSeconds = 0;
        continue;
      }
      r.pendingSeconds += elapsed * (elapsed > 2 ? 1 : this.rate(r));
    }
    this.drain(budgetMs);
    this.recover();
    return this.g;
  }
  drain(budgetMs = Infinity, maxSteps = Infinity) {
    const begun = performance.now();
    let steps = 0,
      active = P.activeExpeditions(this.g);
    while (
      active.length &&
      steps < maxSteps &&
      performance.now() - begun < budgetMs
    ) {
      let eligible = null;
      for (let n = 0; n < active.length; n++) {
        const r = active[(this.cursor + n) % active.length];
        if (r.pendingSeconds + 1e-9 >= STEP) {
          eligible = r;
          this.cursor = (this.cursor + n + 1) % active.length;
          break;
        }
      }
      if (!eligible) break;
      eligible.pendingSeconds = Math.max(0, eligible.pendingSeconds - STEP);
      eligible.elapsedSeconds += STEP;
      this.step(eligible, STEP);
      steps++;
      if (eligible.status !== "active") active = P.activeExpeditions(this.g);
    }
    return steps;
  }
  step(r, dt) {
    if (r.phase === "prepare") {
      this.battle(r);
      r.phaseSeconds -= dt;
      if (r.phaseSeconds <= 1e-8) {
        r.phase = "battle";
        r.phaseSeconds = 0;
      }
    } else if (r.phase === "battle") {
      const b = this.battle(r);
      b.update(dt);
      if (b.result) {
        P.checkpointBattle(this.g, r, b);
        const at = Math.max(
          r.startedAt,
          this.g.lastClock - r.pendingSeconds * 1000,
        );
        P.resolveBattle(this.g, r, b.result, at);
        this.battles.delete(r.id);
        r.battleState = null;
        if (r.phase === "interlude" && !r.auto) r.pendingSeconds = 0;
      }
    } else if (r.phase === "interlude") {
      if (!r.auto) {
        r.pendingSeconds = 0;
        return;
      }
      r.phaseSeconds -= dt;
      if (r.phaseSeconds <= 4 && !r.stop.done) P.useStop(this.g, r);
      if (r.phaseSeconds <= 1e-8) {
        if (!r.stop.done) P.useStop(this.g, r);
        P.nextEncounter(this.g, r);
      }
    }
  }
  recover() {
    Camp.updateCampClock(this.g);
  }
  snapshot() {
    for (const r of P.activeExpeditions(this.g))
      if (["prepare", "battle"].includes(r.phase)) {
        const b = this.battle(r);
        P.checkpointBattle(this.g, r, b);
        r.battleState = b.toState();
      }
    Ever.collectCampXp(this.g);
    Learn.settleLearning(this.g);
    // Finished reports are small and bounded; active parties and their checkpoints are never pruned.
    const reports = this.g.expeditions.filter((r) => r.status === "returned");
    if (reports.length > 30) {
      const remove = new Set(reports.slice(0, -30).map((r) => r.id));
      this.g.expeditions = this.g.expeditions.filter((r) => !remove.has(r.id));
    }
    return {
      game: structuredClone(this.g),
      observation: { ...this.observation },
      catchingUp: P.activeExpeditions(this.g).some((r) => r.pendingSeconds > 2),
    };
  }
  action(type, args = {}, now = Date.now()) {
    this.advance(now);
    if (type === "newGame") {
      const fresh = new ExpeditionSimulation(null, now);
      this.g = fresh.g;
      this.battles = fresh.battles;
      this.observation = fresh.observation;
      this.cursor = 0;
      return { ok: true, ...this.snapshot() };
    }
    if (
      !["navigate", "watch", "favorite", "rename", "dismiss"].includes(type) &&
      P.activeExpeditions(this.g).some((r) => r.pendingSeconds > 2)
    )
      return { ok: false, ...this.snapshot() };
    const g = this.g,
      h = g.roster.find((h) => h.id === args.id);
    if (!Learn.learningActionAllowed(g, type, args))
      return { ok: false, ...this.snapshot() };
    let result = false;
    switch (type) {
      case "tavernHire":
        result = Tavern.hireAtTavern(g, args.id);
        break;
      case "tavernUpgrade":
        result = Tavern.upgradeTavern(g);
        break;
      case "tavernBuy":
        result = Tavern.buyAtBar(g, args.key);
        break;
      case "dropResident": {
        const anchor = CAMP_ANCHORS[args.building];
        if (
          g.screen === "camp" &&
          anchor &&
          h &&
          g.buildings[args.building] &&
          P.available(g, h) &&
          (args.building !== "guildhall" || g.roster.length >= 6)
        )
          result = P.moveResident(
            g,
            h.id,
            anchor[0] / 18,
            (anchor[1] + 95) / 14,
          );
        break;
      }
      case "moveProp": {
        const p = g.campProps.find((p) => p.id === args.id);
        if (
          g.screen === "camp" &&
          p &&
          Number.isFinite(args.x) &&
          Number.isFinite(args.y) &&
          args.x > 20 &&
          args.x < 1780 &&
          args.y > 20 &&
          args.y < 1380 &&
          revealedCampAreas(g).some(
            (a) => Math.hypot(a.x - args.x, a.y - args.y) < a.r - 12,
          )
        ) {
          p.x = args.x;
          p.y = args.y;
          result = true;
        }
        break;
      }
      case "toggleProp": {
        const p = g.campProps.find(
          (p) => p.id === args.id && p.kind === "torch",
        );
        if (g.screen === "camp" && p) {
          p.lit = !p.lit;
          result = true;
        }
        break;
      }
      case "openingNext":
        if (g.learning.stage === "intro" && g.learning.beat < 2) {
          g.learning.beat++;
          result = true;
        }
        break;
      case "finishOpening":
        result = Learn.finishOpening(g, args.name);
        break;
      case "learningEvent":
        result = Learn.learningEvent(g, args.event, args.id);
        break;
      case "light":
        result = Ever.equipLight(g, h, args.itemId);
        break;
      case "worldDifficulty":
        result = Ever.setWorldDifficulty(g, args.key);
        break;
      case "openPortal":
        result = Ever.openPortal(g, args.location);
        break;
      case "guildLesson":
        result = Ever.guildLesson(g, h, args.guild);
        break;
      case "guildQuest":
        result = Ever.guildQuest(g, args.guild);
        break;
      case "guildBuy":
        result = Ever.guildBuy(g, args.guild);
        break;
      case "monthlyBuy":
        result = Ever.monthlyBuy(g, args.id);
        break;
      case "wager":
        result = Ever.setWager(g, args.gold, args.resource, args.amount);
        break;
      case "story":
        if (g.storyPage < 3) {
          g.storyPage++;
          result = true;
        }
        break;
      case "settings":
        if (
          ["tutorial", "reducedMotion"].includes(args.key) &&
          typeof args.value === "boolean"
        ) {
          g.settings[args.key] = args.value;
          if (args.key === "tutorial" && args.value && g.tutorialStep >= 5)
            g.tutorialStep = 0;
          result = true;
        }
        break;
      case "tutorial":
        g.tutorialStep = Math.min(5, g.tutorialStep + 1);
        result = true;
        break;
      case "pinQuest":
        if (questById(g, args.id)) {
          g.questPins = g.questPins.includes(args.id)
            ? g.questPins.filter((id) => id !== args.id)
            : [...g.questPins, args.id];
          result = true;
        }
        break;
      case "questSort":
        if (["progress", "name", "category"].includes(args.key)) {
          g.questSort = args.key;
          result = true;
        }
        break;

      case "profession":
        result = Night.trainProfession(g, h, args.key);
        break;
      case "removeAttribute":
        result = Night.removeAttribute(g, h, args.key);
        break;
      case "memory":
        result = Night.addMemory(g, h, args.text);
        break;
      case "befriend":
        result = Night.befriend(g, h, args.friend);
        break;
      case "hireVisitor":
        result = Night.hireVisitor(g, args.id);
        break;
      case "craftArmor":
        result = Night.craftArmor(g, args.key);
        break;
      case "equipmentSeen":
        result = Night.markEquipmentSeen(g, h, args.index, !!args.armor);
        break;
      case "acceptQuest": {
        const q = questById(g, args.id);
        if (
          ["camp", "market"].includes(g.screen) &&
          q &&
          q.category !== "Main" &&
          !g.sideQuests.includes(q.id) &&
          !g.questClaims.includes(q.id) &&
          g.sideQuests.filter((id) => !g.questClaims.includes(id)).length < 100
        ) {
          g.sideQuests.push(q.id);
          if (q.contract) g.questContracts.push(q);
          result = true;
        }
        break;
      }
      case "marketDistrict":
        if (
          ["market", "camp"].includes(g.screen) &&
          [
            "square",
            "guildhall",
            "commons",
            "board",
            "outfitter",
            "clinic",
            "arena",
            "tavern",
          ].includes(args.key)
        ) {
          g.marketDistrict = ["board", "outfitter"].includes(args.key)
            ? "commons"
            : args.key;
          result = true;
        }
        break;
      case "stageIsland":
        if (g.screen === "camp" && g.buildings.dock) {
          g.destination = { mode: "island", difficulty: "normal" };
          g.lockedJourney = Night.islandInfo(g);
          g.screen = "party";
          g.staging = g.roster
            .filter((h) => P.available(g, h))
            .slice(0, 3)
            .map((h) => h.id);
          result = true;
        }
        break;
      case "navigate":
        if (
          ![
            "camp",
            "crossroads",
            "party",
            "market",
            "tavern",
            "expeditions",
            "arena",
            "quests",
            "codex",
            "calendar",
            "challenges",
            "shop",
          ].includes(args.screen)
        )
          break;
        if (
          (args.screen === "market" && g.screen !== "market") ||
          (args.screen === "party" && !g.lockedJourney) ||
          (args.screen === "crossroads" &&
            !["camp", "party", "crossroads"].includes(g.screen))
        )
          break;
        if (args.screen === "tavern" && !g.buildings.tavern) break;
        if (args.screen === "tavern") Tavern.normalizeTavern(g);
        if (args.screen !== "market") g.marketParty = [];
        for (const r of P.activeExpeditions(g)) r.auto = true;
        this.observation.id = null;
        this.observation.paused = false;
        if (["calendar", "arena"].includes(args.screen)) {
          P.stageCrossroads(g, args.screen === "arena");
          g.screen = args.screen;
        } else g.screen = args.screen;
        if (args.screen === "calendar" && g.destination.mode !== "calendar")
          g.destination = {
            mode: "calendar",
            day: new Date(g.lastClock).getUTCDate(),
            difficulty: g.destination.difficulty || "normal",
          };
        if (args.screen === "crossroads" && g.destination.mode !== "journey")
          g.destination = {
            mode: "journey",
            location: g.regionUnlocks.includes(g.location)
              ? g.location
              : "greenway",
            target: null,
            routeIndex: 0,
            difficulty: "normal",
          };
        if (args.screen === "shop") P.gemShopStock(g);
        if (args.screen === "market" && !g.buildings.market) {
          g.screen = "camp";
          result = false;
          break;
        }
        if (args.screen === "market")
          for (const v of VENDORS) P.marketStock(g, v.id);
        result = true;
        break;
      case "stageTrial":
        result = P.stageTrial(g, args);
        break;
      case "gemBuy":
        result = P.buyGemShop(g, args.offerId);
        break;
      case "expandCamp":
        result = Camp.expandCamp(g, args.key);
        break;
      case "campZone":
        result = Camp.setCampZone(g, args.key);
        break;
      case "harvest":
        result = Camp.harvestCamp(g, args.key);
        break;
      case "release":
        if (h) result = Camp.releaseHero(g, h);
        break;
      case "arrival":
        result = P.claimArrival(g, args.id);
        break;
      case "forgeWeapon":
        result = Camp.forgeWeapon(g, args.key);
        break;
      case "fossil":
        result = Camp.growFossil(g, args.key);
        break;
      case "lockRoute":
        result = P.lockRoute(g);
        break;
      case "visitMarket":
        g.marketDistrict = "square";
        result = P.visitMarket(g, args.ids);
        break;
      case "moveResident":
        result = P.moveResident(g, args.id, args.x, args.y);
        break;
      case "classNode":
        if (h) result = Camp.chooseClassNode(g, h, args.node);
        break;
      case "evolve":
        result = Camp.evolveObject(g, args.kind, args.objectId, args.choice);
        break;
      case "hatch":
        result = Camp.hatchEgg(g, args.key);
        break;
      case "talent":
        if (h) result = Camp.teachTalent(g, h, args.key);
        break;
      case "armor":
        if (h) result = Camp.equipArmor(g, h, args.itemId, args.index);
        break;
      case "removeArmor":
        if (h) result = Camp.removeArmor(g, h, args.index);
        break;
      case "quest":
        result = P.claimQuest(g, args.id);
        break;
      case "trackQuest":
        result = P.trackQuest(g, args.id);
        break;
      case "nameCamp":
        result = Camp.nameCamp(g, args.name);
        break;
      case "construct":
        result = Camp.buildCamp(g, args.key);
        if (result && args.key === "tavern") P.marketStock(g, "guild");
        break;
      case "food":
        result = Camp.buyFood(g, args.count);
        break;
      case "cook":
        result = Camp.cook(g, args.key);
        break;
      case "brew":
        result = Camp.brew(g, args.key);
        break;
      case "fuseGems":
        result = Camp.fuseGems(g, args.kind, args.size);
        break;
      case "transmute":
        result = Camp.transmuteGem(g, args.gemId, args.material);
        break;
      case "socket":
        if (h) result = Camp.socketGem(g, h, args.gemId, args.index);
        break;
      case "unsocket":
        if (h) result = Camp.unsocketGem(g, h, args.index);
        break;
      case "pack":
        result = Camp.pack(g, args.key);
        break;
      case "challengeReserve":
        if (
          g.screen === "challenges" &&
          Number.isInteger(args.gold) &&
          args.gold >= 10 &&
          args.gold <= 1000 &&
          g.gold >= args.gold &&
          !g.challengeDeposits[args.receipt]
        ) {
          g.gold -= args.gold;
          const item = args.itemId
            ? g.inventory.find(
                (i) => i.id === args.itemId && !i.unidentified && !i.sharpenJob,
              )
            : null;
          if (args.itemId && !item) {
            g.gold += args.gold;
            break;
          }
          if (item) g.inventory = g.inventory.filter((i) => i !== item);
          g.challengeDeposits[args.receipt] = {
            gold: args.gold,
            item,
            payload: args.payload,
            at: g.lastClock,
          };
          result = true;
        }
        break;
      case "challengeRefund": {
        const deposit = g.challengeDeposits[args.receipt];
        if (deposit) {
          g.gold += deposit.gold;
          if (deposit.item) g.inventory.push(deposit.item);
          delete g.challengeDeposits[args.receipt];
          result = true;
        }
        break;
      }
      case "challengeAccepted":
        if (g.challengeDeposits[args.receipt]) {
          delete g.challengeDeposits[args.receipt];
          result = true;
        }
        break;
      case "challengePayout":
        if (
          typeof args.receipt === "string" &&
          !g.challengeReceipts.includes(args.receipt) &&
          Number.isInteger(args.gold) &&
          args.gold >= 0 &&
          args.gold <= 2000
        ) {
          g.challengeReceipts.push(args.receipt);
          g.gold += args.gold;
          for (const i of args.items || [])
            if (i && ITEMS[i.key])
              g.inventory.push({
                ...structuredClone(i),
                id: uid("challenge-loot"),
              });
          result = true;
        }
        break;
      case "stage":
        result = P.toggleStage(g, args.id);
        break;
      case "destination":
        result = P.setDestination(g, args);
        break;
      case "launch":
        result = P.startExpedition(g, args, now);
        if (result)
          this.observation = {
            id: result.id,
            visible: this.observation.visible,
            speed: 1,
            paused: false,
          };
        break;
      case "auto": {
        const r = g.expeditions.find(
          (r) => r.id === args.id && r.status === "active",
        );
        if (!r || typeof args.on !== "boolean") break;
        if (!args.on) {
          if (!this.observation.visible || this.observation.id !== r.id) break;
          this.observation.speed = 1;
        }
        r.auto = args.on;
        r.pendingSeconds = 0;
        result = true;
        break;
      }
      case "continue": {
        const r = g.expeditions.find(
          (r) =>
            r.id === args.id &&
            r.status === "active" &&
            r.phase === "interlude",
        );
        if (!r) break;
        if (!r.stop.done) P.useStop(g, r);
        result = P.nextEncounter(g, r);
        if (result) r.pendingSeconds = 0;
        break;
      }
      case "watch":
        if (g.expeditions.some((r) => r.id === args.id)) {
          for (const r of P.activeExpeditions(g))
            if (r.id !== args.id) r.auto = true;
          g.selectedExpedition = args.id;
          g.screen = "expedition";
          this.observation.id = args.id;
          this.observation.paused = false;
          result = true;
        }
        break;
      case "recall": {
        const r = g.expeditions.find((r) => r.id === args.id);
        if (r) {
          const b = this.battles.get(r.id);
          if (b) P.checkpointBattle(g, r, b);
          result = P.endExpedition(g, r, "recall", now);
          this.battles.delete(r.id);
          r.battleState = null;
        }
        break;
      }
      case "equip":
        if (h) result = P.equip(g, h, args.itemId, args.slot);
        break;
      case "unequip":
        if (h) result = P.unequip(g, h, args.slot);
        break;
      case "train":
        if (h) result = P.train(g, h, args.stat);
        break;
      case "improve":
        result = P.improveItem(g, args.itemId);
        break;
      case "unlock":
        if (h) result = P.unlockEquipment(g, h, args.itemType);
        break;
      case "transform":
        if (h) result = P.transform(g, h, args.path, args.choice);
        break;
      case "combine":
        if (h)
          result = P.combine(
            g,
            h,
            g.roster.find((a) => a.id === args.donorId),
          );
        break;
      case "build":
        result = P.buildHero(g, args.race, args.classId, args.scrollId);
        break;
      case "attribute":
        if (h) result = P.addAttribute(g, h, args.attribute);
        break;
      case "pet":
        if (h) result = P.equipPet(g, h, args.petId);
        break;
      case "removePet":
        if (h) result = P.removePet(g, h);
        break;
      case "consume":
        if (h) result = P.consume(g, h, args.key);
        break;
      case "recycle":
        result = P.recycle(g, args.kind, args.objectId);
        break;
      case "sell":
        result = P.recycle(g, args.kind, args.objectId, true);
        break;
      case "analyze":
        result = P.analyze(g, args.objectId);
        break;
      case "forge":
        result = P.forge(g, args.kind, args.key);
        break;
      case "cosmetic":
        if (h) result = P.applyCosmetic(g, h, args.key, args.objectId);
        break;
      case "stop": {
        const r = g.expeditions.find((r) => r.id === args.id);
        if (r) result = P.useStop(g, r);
        break;
      }
      case "recover":
        if (h) result = P.recover(g, h);
        break;
      case "rename":
        if (h) {
          result = P.renameHero(g, h, args.name);
          if (result)
            for (const b of this.battles.values())
              for (const u of b.units)
                if (u.hero.id === h.id) {
                  u.hero.name = h.name;
                  u.name = h.name;
                }
        }
        break;
      case "favorite":
        if (h) result = P.favoriteHero(g, h);
        break;
      case "buy":
        result = P.buy(g, { id: args.offerId });
        break;
      case "restock":
        result = P.restockMarket(g, args.vendor);
        break;
      case "dismiss":
        g.notifications = g.notifications.filter((n) => n.id !== args.noticeId);
        result = true;
        break;
    }
    Learn.afterLearningAction(g, type, args, result);
    return {
      ok: !!result,
      value: result && typeof result === "object" ? result.id || true : result,
      ...this.snapshot(),
    };
  }
}
