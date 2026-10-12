import { pixelBuildingSvg } from "./pixel-art.js?v=17";
import { portraitSvg, icon } from "./art.js?v=17";
import { pixelMarkup } from "./pixel-markup.js?v=17";
import { learningLocked } from "./onboarding.js?v=17";

const story = [
  [
    "Stay near the flame.",
    "In Evernight, the light is a promise. Hold it close.",
  ],
  [
    "Three adventurers have just arrived.",
    "They have agreed to help you face this new world.",
  ],
  [
    "The curse of eternal darkness takes more than light from the world.",
    "You must break it. Give us sunlight back.",
  ],
];
const lessons = {
  pan: [
    "Find your bearings",
    "Drag the ground to move the map. Pinch or use + / − to zoom. Arrow keys work too.",
    "camp",
  ],
  move: [
    "Move an adventurer",
    "Tap one of your adventurers, choose Walk, then tap the firelit ground. Dragging still moves the map.",
    "resident",
  ],
  profile: [
    "Meet your company",
    "Tap an adventurer and choose Info. Their profile holds equipment, lights, abilities and memories.",
    "resident",
  ],
  crossroads: [
    "Take the first road",
    "Open the Crossroads north of the bonfire. Routes, active companies and returned reports all live there.",
    "crossroads",
  ],
  route: [
    "The first clearing",
    "Your first expedition follows this short road. Review the route, then choose your party.",
    "route",
  ],
  party: [
    "Three lights in the dark",
    "Your three volunteers are ready. Start the expedition; they move and fight automatically.",
    "party",
  ],
  journey: [
    "Follow the company",
    "Focus tracks the party. Drag to look around; tap Focus to return. Finish this road to continue learning.",
    "journey",
  ],
  pantry: [
    "Keep the fire fed",
    "Your company is home. Open the Pantry and stock one food. Meals every twelve hours improve rest and give bonus XP.",
    "pantry",
  ],
  journal: [
    "Your story continues",
    "Open the Journal beside the Crossroads. Track quests, check progress and claim rewards here.",
    "questboard",
  ],
};
function glow() {
  let blocks = "";
  for (let y = 0; y < 30; y++)
    for (let x = 0; x < 52; x++) {
      const d = Math.hypot((x - 26) / 1.25, y - 15);
      if (d < 14)
        blocks += `<rect x="${x * 6}" y="${y * 6}" width="6" height="6" fill="${d < 5 ? "#e8b968" : d < 9 ? "#a86d3d" : "#513329"}" opacity="${d < 5 ? 0.22 : d < 9 ? 0.14 : 0.08}"/>`;
    }
  return `<svg viewBox="0 0 312 180" shape-rendering="crispEdges" aria-hidden="true">${blocks}</svg>`;
}
export function createGameShell(c) {
  const { getGame, esc, act } = c;
  let introKey = "",
    coachKey = "",
    readyTimer,
    lastStage = null;
  const root = document.getElementById("game-window");
  function reduced() {
    return (
      getGame()?.settings.reducedMotion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }
  function update() {
    const g = getGame(),
      s = g.learning;
    if (!s) return;
    root.dataset.learning = s.stage;
    root.dataset.locked = String(learningLocked(g));
    const opening = document.getElementById("opening-scene");
    opening.hidden = s.stage !== "intro";
    const key = `${s.stage}:${s.beat}`;
    if (s.stage === "intro" && key !== introKey) {
      introKey = key;
      const [headline, line] = story[s.beat];
      opening.innerHTML = pixelMarkup(
        `<button class="icon-button cinema-fullscreen" aria-label="Open fullscreen">${icon("expand", 18)}</button><div class="cinema-world ${s.beat > 0 ? "fire-already-lit" : ""}"><div class="cinema-glow">${glow()}</div><div class="cinema-fire">${pixelBuildingSvg("bonfire")}</div>${
          s.beat > 0
            ? `<div class="cinema-arrivals">${g.roster
                .slice(0, 3)
                .map((h) => `<span>${portraitSvg(h, true)}</span>`)
                .join("")}</div>`
            : ""
        }</div><div class="cinema-dialogue ${s.beat > 0 ? "ready" : ""}"><span class="cinema-title">EVERNIGHT</span><h1>${headline}</h1><p>${line}</p>${s.beat === 2 ? '<label class="cinema-name">Name your Camp <input id="opening-camp-name" maxlength="36" value="Last Light" aria-label="Camp name"></label>' : ""}<button class="primary-button" id="opening-continue" ${s.beat === 0 && !reduced() ? "disabled" : ""}>${s.beat === 2 ? "Keep the flame" : "Continue"} ${icon("arrow", 14)}</button><span class="cinema-page">${s.beat + 1} / 3</span></div>`,
      );
      opening.querySelector(".cinema-fullscreen").onclick = () =>
        document.getElementById("fullscreen-btn").click();
      const next = opening.querySelector("#opening-continue");
      clearTimeout(readyTimer);
      readyTimer = setTimeout(
        () => {
          if (next.isConnected) next.disabled = false;
        },
        reduced() ? 0 : 3400,
      );
      next.addEventListener("click", async () => {
        next.disabled = true;
        const ok = await act(
          s.beat === 2 ? "finishOpening" : "openingNext",
          s.beat === 2 ? { name: opening.querySelector("input")?.value } : {},
        );
        if (!ok) next.disabled = false;
      });
    }
    if (lastStage === "intro" && s.stage === "pan") {
      root.classList.remove("revealing-world");
      void root.offsetWidth;
      root.classList.add("revealing-world");
      c.reveal?.();
    }
    lastStage = s.stage;
    const coach = document.getElementById("learning-coach"),
      lesson = lessons[s.stage];
    coach.hidden = !lesson;
    const coachState = `${s.stage}:${s.journalSeen}:${g.screen}`;
    if (lesson && coachKey !== coachState) {
      coachKey = coachState;
      const n = Object.keys(lessons).indexOf(s.stage) + 1;
      coach.innerHTML = `<div><span class="eyebrow">LEARN ${n} / 9</span><strong>${lesson[0]}</strong><p>${lesson[1]}</p></div><button class="secondary-button" data-lesson-help>${s.stage === "journal" && s.journalSeen ? "Begin your story" : "Show me"}</button>`;
      coach.querySelector("button").onclick = () =>
        s.stage === "journal" && s.journalSeen
          ? act("learningEvent", { event: "journal-read" })
          : c.help(lesson[2]);
    }
    const hint = document.getElementById("game-control-hint");
    if (hint) {
      hint.hidden =
        s.stage !== "complete" ||
        !g.settings.tutorial ||
        !["camp", "market"].includes(g.screen);
      hint.textContent =
        g.screen === "camp"
          ? "Drag to explore · Tap an adventurer for Walk / Info"
          : "Tap a stall to browse · Drag to explore";
    }
    const home = document.getElementById("game-home");
    home.hidden = g.screen === "camp";
    document.getElementById("window-context").textContent =
      s.stage === "intro"
        ? "A fire in the night"
        : g.screen === "camp"
          ? g.campName || "Last Light"
          : ["crossroads", "party", "expedition"].includes(g.screen)
            ? "The Crossroads"
            : g.screen === "market"
              ? "Camp Market"
              : g.screen;
  }
  document
    .getElementById("game-home")
    .addEventListener("click", () => c.home());
  const fs = document.getElementById("fullscreen-btn");
  function fsState() {
    const active =
      !!document.fullscreenElement || root.classList.contains("immersive");
    fs.setAttribute("aria-pressed", String(active));
    fs.setAttribute(
      "aria-label",
      active ? "Exit fullscreen" : "Enter fullscreen",
    );
    fs.innerHTML = icon(active ? "close" : "expand", 18);
  }
  fs.addEventListener("click", async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (root.classList.contains("immersive"))
      root.classList.remove("immersive");
    else if (root.requestFullscreen) {
      try {
        await root.requestFullscreen();
      } catch {
        root.classList.add("immersive");
        c.toast("Game expanded to your display.");
      }
    } else {
      root.classList.add("immersive");
      c.toast(
        "Game expanded to your display. Your browser keeps its own controls.",
      );
    }
    fsState();
  });
  document.addEventListener("fullscreenchange", fsState);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("immersive")) {
      root.classList.remove("immersive");
      fsState();
    }
  });
  fsState();
  return { update };
}
