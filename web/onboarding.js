import { stats } from "./data.js?v=19";
export const LESSON_REWARD = 3;
export const LEARNING_STAGES = [
  "intro",
  "pan",
  "move",
  "profile",
  "crossroads",
  "route",
  "party",
  "journey",
  "quests",
  "fernbridge",
  "fernroute",
  "fernparty",
  "recovery",
  "build",
  "pantry",
  "journal",
  "complete",
];
const legacyStages = ["fernjourney", "defeat", "recruit"];
export function validLearning(s) {
  return (
    s === undefined ||
    !!(
      s &&
      [1, 2, 3].includes(s.version) &&
      [...LEARNING_STAGES, ...legacyStages].includes(s.stage) &&
      Number.isInteger(s.beat) &&
      s.beat >= 0 &&
      s.beat <= 2 &&
      typeof s.required === "boolean" &&
      (s.journeyId === null || typeof s.journeyId === "string")
    )
  );
}
export function normalizeLearning(g) {
  if (!validLearning(g.learning) || !g.learning) {
    const existing =
      g.campNamed || g.storyPage >= 3 || g.expeditions.length > 0;
    g.learning = {
      version: 3,
      stage: existing ? "complete" : "intro",
      beat: 0,
      required: false,
      journeyId: null,
      claimedStages: [],
      done: false,
    };
  }
  const s = g.learning;
  if (s.version < 3) {
    if (s.version === 1 && s.stage === "pantry") s.stage = "quests";
    if (legacyStages.includes(s.stage)) s.stage = "recovery";
    const index = LEARNING_STAGES.indexOf(s.stage);
    s.claimedStages = LEARNING_STAGES.slice(1, Math.max(1, index));
    s.done = false;
    if (
      ["journey", "quests", "fernbridge", "fernroute", "fernparty"].includes(
        s.stage,
      )
    )
      s.firstJourneyId = s.journeyId;
    if (s.stage === "recovery") s.secondJourneyId = s.journeyId;
    if (
      ["build", "pantry", "journal"].includes(s.stage) &&
      !g.buildings.pantry &&
      !g.buildings.kitchen
    ) {
      g.materials.wood = (g.materials.wood || 0) + 5;
      s.woodRewardGranted = true;
    }
    if (
      s.stage === "journey" &&
      g.expeditions.some(
        (r) =>
          r.id === s.journeyId &&
          r.status === "returned" &&
          r.reason !== "complete",
      )
    ) {
      s.stage = "crossroads";
      s.journeyId = null;
      s.firstJourneyId = null;
      s.claimedStages = LEARNING_STAGES.slice(
        1,
        LEARNING_STAGES.indexOf("crossroads"),
      );
    }
    s.version = 3;
  }
  s.claimedStages ||= [];
  if (s.stage === "journey") {
    const r = g.expeditions.find((r) => r.id === s.journeyId);
    if (r?.status === "active") {
      r.tutorialOutcome = "victory";
      if (r.battleState) r.battleState.tutorialOutcome = "victory";
    }
  }
  if (g.screen === "expeditions") g.screen = "crossroads";
  if (g.screen === "quests") g.screen = "camp";
  return s;
}
export const learningLocked = (g) =>
  !!g.learning?.required && g.learning.stage !== "complete";
export const tutorialTarget = (g) =>
  ["fernbridge", "fernroute", "fernparty", "recovery"].includes(
    g.learning?.stage,
  )
    ? "bridge"
    : "clearing";
export function learningReady(g) {
  const s = g.learning;
  if (!s || !learningLocked(g)) return false;
  if (s.stage === "journal") return true;
  if (s.stage === "profile") return !!s.profileSeen;
  if (s.stage === "quests") return g.questClaims.includes("first-road");
  if (s.stage === "journey") return !!s.firstVictory;
  if (s.stage === "recovery")
    return !!s.lossResolved && !!g.tavern?.firstHireClaimed;
  if (s.stage === "build") return !!(g.buildings.pantry || g.buildings.kitchen);
  return !!s.done;
}
export function learningContinue(g, stage) {
  const s = g.learning;
  if (
    !s ||
    stage !== s.stage ||
    !learningReady(g) ||
    s.claimedStages.includes(stage)
  )
    return false;
  s.claimedStages.push(stage);
  g.gold += LESSON_REWARD;
  if (stage === "recovery" && !s.woodRewardGranted) {
    g.materials.wood = (g.materials.wood || 0) + 5;
    s.woodRewardGranted = true;
  }
  if (stage === "quests") g.trackedQuest = "bridge";
  s.stage = LEARNING_STAGES[LEARNING_STAGES.indexOf(stage) + 1];
  s.done = false;
  if (s.stage === "complete") {
    s.required = false;
    g.tutorialStep = 5;
    g.trackedQuest = "bridge";
  }
  return true;
}
export function learningActionAllowed(g, type, a) {
  if (!learningLocked(g) || type === "newGame") return true;
  const s = g.learning;
  if (type === "navigate")
    return (
      a.screen === "camp" ||
      (a.screen === "tavern" && s.stage === "recovery" && s.lossResolved) ||
      (["crossroads", "party"].includes(a.screen) &&
        [
          "crossroads",
          "route",
          "party",
          "journey",
          "fernbridge",
          "fernroute",
          "fernparty",
          "recovery",
        ].includes(s.stage))
    );
  if (type === "destination")
    return (
      ["route", "party", "fernroute", "fernparty"].includes(s.stage) &&
      (!a.mode || a.mode === "journey") &&
      (!a.location || a.location === "greenway") &&
      (!a.target || a.target === tutorialTarget(g)) &&
      (!a.routeIndex || a.routeIndex === 0)
    );
  if (type === "lockRoute") return ["route", "fernroute"].includes(s.stage);
  if (type === "launch")
    return (
      ["party", "fernparty"].includes(s.stage) &&
      !s.done &&
      g.lockedJourney?.location === "greenway" &&
      g.lockedJourney?.target === tutorialTarget(g) &&
      g.staging.length === 3 &&
      g.roster.slice(0, 3).every((h) => g.staging.includes(h.id))
    );
  if (
    [
      "stage",
      "stageTrial",
      "stageIsland",
      "visitMarket",
      "worldDifficulty",
      "recall",
      "import",
      "retire",
      "release",
      "sell",
      "combine",
    ].includes(type)
  )
    return false;
  if (type === "construct") return s.stage === "build" && a.key === "pantry";
  if (["tavernHire", "buy", "hireVisitor"].includes(type))
    return (
      s.stage === "recovery" &&
      s.lossResolved &&
      !g.tavern?.firstHireClaimed &&
      type === "tavernHire"
    );
  if (
    ["tavernUpgrade", "tavernBuy", "acceptQuest", "acceptNpcQuest"].includes(
      type,
    )
  )
    return false;
  if (type === "settings" && a.key === "tutorial" && !a.value) return false;
  return true;
}
export function learningEvent(g, event, id) {
  const s = g.learning;
  if (!s) return false;
  if (s.stage === "pan" && event === "pan") {
    s.done = true;
    return true;
  }
  if (
    ["move", "profile"].includes(s.stage) &&
    event === "profile" &&
    g.roster.some((h) => h.id === id)
  ) {
    s.profileSeen = true;
    return true;
  }
  if (["quests", "journal"].includes(s.stage) && event === "journal") {
    s.journalSeen = true;
    return true;
  }
  return false;
}
export function finishOpening(g, name = "Last Light") {
  if (g.learning?.stage !== "intro" || g.learning.beat !== 2) return false;
  g.campName =
    String(name || "Last Light")
      .trim()
      .slice(0, 36) || "Last Light";
  g.campNamed = true;
  g.storyPage = 3;
  Object.assign(g.learning, { stage: "pan", required: true, done: false });
  return true;
}
export function afterLearningAction(g, type, args, result) {
  if (!result || !learningLocked(g)) return;
  const s = g.learning;
  if (type === "dropResident" && s.stage === "move" && args.building === "tent")
    s.done = true;
  if (
    type === "navigate" &&
    args.screen === "crossroads" &&
    ["crossroads", "fernbridge"].includes(s.stage)
  ) {
    g.destination = {
      mode: "journey",
      location: "greenway",
      target: s.stage === "fernbridge" ? "bridge" : "clearing",
      routeIndex: 0,
      difficulty: "normal",
    };
    s.done = true;
  }
  if (type === "lockRoute" && ["route", "fernroute"].includes(s.stage))
    s.done = true;
  if (type === "launch" && ["party", "fernparty"].includes(s.stage)) {
    const second = s.stage === "fernparty";
    s.done = true;
    s.journeyId = result.id;
    s[second ? "secondJourneyId" : "firstJourneyId"] = result.id;
    result.auto = true;
    result.tutorialOutcome = second ? "defeat" : "victory";
  }
  if (type === "food" && s.stage === "pantry") s.done = true;
}
export function settleLearning(g) {
  const s = g.learning;
  if (!s || !learningLocked(g)) return;
  const first = g.expeditions.find(
    (r) =>
      r.id ===
      (s.firstJourneyId ||
        (["party", "journey"].includes(s.stage) ? s.journeyId : null)),
  );
  if (
    first?.status === "returned" &&
    first.reason === "complete" &&
    !s.firstVictory
  ) {
    s.firstVictory = true;
    for (const h of g.roster.filter((h) => first.party.includes(h.id))) {
      h.recoveryUntil = g.lastClock;
      h.currentHp = stats(h).hp;
    }
  }
  const second = g.expeditions.find(
    (r) =>
      r.id ===
      (s.secondJourneyId || (s.stage === "recovery" ? s.journeyId : null)),
  );
  if (second?.status === "returned") {
    s.lossResolved = true;
    for (const key of ["tavern", "guildhall", "tradingpost"])
      g.buildings[key] = Math.max(1, g.buildings[key] || 0);
    g.trackedQuest = "bridge";
  }
}
