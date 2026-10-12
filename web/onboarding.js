import { stats } from "./data.js?v=18";
// Learning belongs to the saved simulation. The main menu is separate session state.
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
  "fernjourney",
  "defeat",
  "recruit",
  "build",
  "pantry",
  "journal",
  "complete",
];
export function validLearning(s) {
  return (
    s === undefined ||
    !!(
      s &&
      [1, 2].includes(s.version) &&
      LEARNING_STAGES.includes(s.stage) &&
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
      version: 2,
      stage: existing ? "complete" : "intro",
      beat: 0,
      required: false,
      journeyId: null,
    };
  }
  if (g.learning.version === 1) {
    g.learning.version = 2;
    if (g.learning.stage === "pantry") g.learning.stage = "quests";
    if (g.learning.stage === "journey") {
      const run = g.expeditions.find((r) => r.id === g.learning.journeyId);
      if (run?.status === "active") {
        run.tutorialOutcome = "victory";
        if (run.battleState) run.battleState.tutorialOutcome = "victory";
      }
    }
  }
  if (g.screen === "expeditions") g.screen = "crossroads";
  if (g.screen === "quests") g.screen = "camp";
  return g.learning;
}
export const learningLocked = (g) =>
  !!g.learning?.required && g.learning.stage !== "complete";
export const tutorialTarget = (g) =>
  ["fernbridge", "fernroute", "fernparty", "fernjourney"].includes(
    g.learning?.stage,
  )
    ? "bridge"
    : "clearing";
export function learningActionAllowed(g, type, a) {
  if (!learningLocked(g) || type === "newGame") return true;
  const s = g.learning;
  if (type === "navigate")
    return (
      a.screen === "camp" ||
      (a.screen === "tavern" && s.stage === "recruit") ||
      (["crossroads", "party"].includes(a.screen) &&
        [
          "crossroads",
          "route",
          "party",
          "journey",
          "fernbridge",
          "fernroute",
          "fernparty",
          "fernjourney",
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
    return s.stage === "recruit" && type === "tavernHire";
  if (["tavernUpgrade", "tavernBuy"].includes(type)) return false;
  if (type === "settings" && a.key === "tutorial" && !a.value) return false;
  return true;
}
export function learningEvent(g, event, id) {
  const s = g.learning;
  if (!s) return false;
  if (s.stage === "pan" && event === "pan") {
    s.stage = "move";
    return true;
  }
  if (
    s.stage === "profile" &&
    event === "profile" &&
    g.roster.some((h) => h.id === id)
  ) {
    s.stage = "crossroads";
    return true;
  }
  if (["quests", "journal"].includes(s.stage) && event === "journal") {
    s.journalSeen = true;
    return true;
  }
  if (
    s.stage === "quests" &&
    event === "journal-read" &&
    s.journalSeen &&
    g.questClaims.includes("first-road")
  ) {
    s.stage = "fernbridge";
    s.journalSeen = false;
    g.trackedQuest = "bridge";
    return true;
  }
  if (s.stage === "defeat" && event === "defeat-read") {
    s.stage = "recruit";
    return true;
  }
  if (s.stage === "journal" && event === "journal-read" && s.journalSeen) {
    s.stage = "complete";
    s.required = false;
    g.tutorialStep = 5;
    g.trackedQuest = "bridge";
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
  Object.assign(g.learning, { stage: "pan", required: true });
  return true;
}
export function afterLearningAction(g, type, args, result) {
  if (!result || !learningLocked(g)) return;
  const s = g.learning;
  if (type === "dropResident" && s.stage === "move") s.stage = "profile";
  if (
    type === "navigate" &&
    args.screen === "crossroads" &&
    ["crossroads", "fernbridge"].includes(s.stage)
  ) {
    const second = s.stage === "fernbridge";
    g.destination = {
      mode: "journey",
      location: "greenway",
      target: second ? "bridge" : "clearing",
      routeIndex: 0,
      difficulty: "normal",
    };
    s.stage = second ? "fernroute" : "route";
  }
  if (type === "lockRoute" && ["route", "fernroute"].includes(s.stage))
    s.stage = s.stage === "fernroute" ? "fernparty" : "party";
  if (type === "launch" && ["party", "fernparty"].includes(s.stage)) {
    const second = s.stage === "fernparty";
    s.stage = second ? "fernjourney" : "journey";
    s.journeyId = result.id;
    result.auto = true;
    result.tutorialOutcome = second ? "defeat" : "victory";
  }
  if (type === "tavernHire" && s.stage === "recruit")
    s.stage = g.buildings.pantry || g.buildings.kitchen ? "pantry" : "build";
  if (type === "construct" && args.key === "pantry" && s.stage === "build")
    s.stage = "pantry";
  if (type === "food" && s.stage === "pantry") {
    s.stage = "journal";
    s.journalSeen = false;
  }
}
export function settleLearning(g) {
  const s = g.learning;
  if (!["journey", "fernjourney"].includes(s?.stage)) return;
  const r = g.expeditions.find((r) => r.id === s.journeyId);
  if (r?.status !== "returned") return;
  if (s.stage === "journey") {
    s.stage = r.reason === "complete" ? "quests" : "crossroads";
    if (r.reason !== "complete") s.journeyId = null;
    else
      for (const h of g.roster.filter((h) => r.party.includes(h.id))) {
        h.recoveryUntil = g.lastClock;
        h.currentHp = stats(h).hp;
      }
  } else {
    s.stage = "defeat";
    g.buildings.tavern = Math.max(1, g.buildings.tavern || 0);
    g.buildings.guildhall = Math.max(1, g.buildings.guildhall || 0);
    g.trackedQuest = "bridge";
  }
}
