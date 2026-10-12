// Saved learning state stays separate from combat, ownership and the v12 season.
export const LEARNING_STAGES = [
  "intro",
  "pan",
  "move",
  "profile",
  "crossroads",
  "route",
  "party",
  "journey",
  "pantry",
  "journal",
  "complete",
];
export function validLearning(s) {
  return (
    s === undefined ||
    !!(
      s &&
      s.version === 1 &&
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
      version: 1,
      stage: existing ? "complete" : "intro",
      beat: 0,
      required: false,
      journeyId: null,
    };
  }
  // Old page locations become internal Crossroads/Journal surfaces.
  if (g.screen === "expeditions") g.screen = "crossroads";
  if (g.screen === "quests") g.screen = "camp";
  return g.learning;
}
export const learningLocked = (g) =>
  !!g.learning?.required && g.learning.stage !== "complete";
export function learningActionAllowed(g, type, a) {
  if (!learningLocked(g)) return true;
  const s = g.learning;
  if (type === "navigate")
    return (
      ["camp", "crossroads", "party"].includes(a.screen) &&
      (a.screen === "camp" ||
        [
          "crossroads",
          "route",
          "party",
          "journey",
          "pantry",
          "journal",
        ].includes(s.stage))
    );
  if (type === "destination")
    return (
      ["route", "party"].includes(s.stage) &&
      (!a.mode || a.mode === "journey") &&
      (!a.location || a.location === "greenway") &&
      (!a.target || a.target === "clearing") &&
      (!a.routeIndex || a.routeIndex === 0)
    );
  if (type === "lockRoute") return s.stage === "route";
  if (type === "launch")
    return (
      s.stage === "party" &&
      g.lockedJourney?.location === "greenway" &&
      g.lockedJourney?.target === "clearing" &&
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
    ].includes(type)
  )
    return false;
  if (type === "settings" && a.key === "tutorial" && !a.value) return false;
  return true;
}
export function learningEvent(g, event, id) {
  const s = g.learning;
  if (!s) return false;
  const sequence = { pan: "move", move: "profile", profile: "crossroads" };
  if (s.stage === event && sequence[event]) {
    if (
      ["move", "profile"].includes(event) &&
      !g.roster.some((h) => h.id === id)
    )
      return false;
    s.stage = sequence[event];
    return true;
  }
  if (s.stage === "journal" && event === "journal") {
    s.journalSeen = true;
    return true;
  }
  if (s.stage === "journal" && event === "journal-read" && s.journalSeen) {
    s.stage = "complete";
    s.required = false;
    g.tutorialStep = 5;
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
  if (type === "moveResident") learningEvent(g, "move", args.id);
  if (
    type === "navigate" &&
    args.screen === "crossroads" &&
    s.stage === "crossroads"
  ) {
    g.destination = {
      mode: "journey",
      location: "greenway",
      target: "clearing",
      routeIndex: 0,
      difficulty: "normal",
    };
    s.stage = "route";
  }
  if (type === "lockRoute" && s.stage === "route") s.stage = "party";
  if (type === "launch" && s.stage === "party") {
    s.stage = "journey";
    s.journeyId = result.id;
    result.auto = true;
  }
  if (type === "food" && s.stage === "pantry") s.stage = "journal";
}
export function settleLearning(g) {
  const s = g.learning;
  if (s?.stage !== "journey") return;
  const r = g.expeditions.find((r) => r.id === s.journeyId);
  if (r?.status === "returned") {
    s.stage = r.reason === "complete" ? "pantry" : "crossroads";
    if (r.reason !== "complete") s.journeyId = null;
  }
}
