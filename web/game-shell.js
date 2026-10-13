import { pixelBuildingSvg } from "./pixel-art.js?v=20";
import { portraitSvg, icon } from "./art.js?v=20";
import { pixelMarkup } from "./pixel-markup.js?v=20";
import {
  learningLocked,
  learningReady,
  LESSON_REWARD,
} from "./onboarding.js?v=20";

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
    "Drag the ground to look around. Pinch or use + / − to zoom. Arrow keys work too.",
    "camp",
  ],
  move: [
    "A helping hand",
    "Drag an adventurer onto the Character tent to see their information and equipment. You can also select a hero, then select a building.",
    "resident",
  ],
  crossroads: [
    "Take the first road",
    "Open the Crossroads north of the bonfire. Plan roads and find returning companies here.",
    "crossroads",
  ],
  route: [
    "The first clearing",
    "Follow this short road with the three volunteers. Choose your party to continue.",
    "route",
  ],
  party: [
    "Three lights in the dark",
    "Start the expedition. Your adventurers move and fight automatically.",
    "party",
  ],
  journey: [
    "Follow the company",
    "Your first clearing is a safe learning expedition. Focus follows your company; drag to look around.",
    "journey",
  ],
  quests: [
    "A purpose beyond survival",
    "Open journal in the camp menu at the top of the screen and claim your first quest rewards",
    "questboard",
  ],
  fernbridge: [
    "On to Fernbridge",
    "The next quest leads across the bridge. Open Crossroads and prepare your three adventurers.",
    "crossroads",
  ],
  fernroute: [
    "The road to Fernbridge",
    "Review the route and choose your company.",
    "route",
  ],
  fernparty: [
    "Beyond the firelight",
    "Start your second expedition. The darkness ahead is stronger than it seems.",
    "party",
  ],
  recovery: [
    "A light after defeat",
    "Watch the Fernbridge expedition. Losing brings your heroes and equipment home safely, with recovery time. Then visit the Tavern and invite any common hero for free. The Guild lodge opens at six heroes.",
    "recovery",
  ],
  build: [
    "Make room for tomorrow",
    "Open Build in the camp menu or select the Pantry site. Use the 5 wood from your previous lesson and 5 gold to build it.",
    "build",
  ],
  pantry: [
    "Keep your company fed",
    "Open the Pantry and buy one food. Meals every twelve hours give XP and speed recovery.",
    "pantry",
  ],
  journal: [
    "Make Fernbridge your own",
    "Your company is growing. Track quests in the Journal, then find their gold markers at the Crossroads. Your next goal is Beyond the bridge: prepare your heroes and return to Fernbridge. Continue whenever you are ready.",
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
    lastStage = null,
    session = "menu",
    menuReady = false,
    entering = false,
    menuRevision = "";
  const root = document.getElementById("game-window");
  function reduced() {
    return (
      getGame()?.settings.reducedMotion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }
  const menu = document.getElementById("main-menu");
  const hasProgress = () =>
    !!(
      getGame()?.campNamed ||
      getGame()?.learning?.beat ||
      getGame()?.expeditions.length
    );
  const duration = (ms) => (reduced() ? 0 : ms);
  async function enter(fresh = false) {
    if (entering) return;
    entering = true;
    menu.querySelectorAll("button").forEach((b) => (b.disabled = true));
    try {
      if (fresh && hasProgress() && !(await act("newGame"))) return;
      if (!(await act("navigate", { screen: "camp" }))) return;
      session = "playing";
      root.dataset.session = session;
      menu.classList.add("menu-departing");
      root.classList.add("revealing-world");
      c.render?.();
      c.reveal?.();
      update();
      await c.started?.();
      setTimeout(() => {
        if (session !== "playing") return;
        menu.hidden = true;
        menu.classList.remove("menu-departing");
        root.classList.remove("revealing-world");
      }, duration(1500));
    } finally {
      entering = false;
      if (session === "menu") {
        menuRevision = "";
        update();
      }
    }
  }
  function showMenu() {
    session = "menu";
    menuReady = false;
    menuRevision = "";
    introKey = "";
    root.dataset.session = session;
    menu.hidden = false;
    menu.classList.remove("menu-departing");
    root.classList.remove("revealing-world");
    document.getElementById("resident-actions").hidden = true;
    document.getElementById("modal").close();
    c.stopped?.();
    update();
  }
  function update() {
    const g = getGame(),
      s = g.learning;
    if (!s) return;
    root.dataset.session = session;
    document.querySelector(".app").inert =
      session === "menu" || s.stage === "intro";
    const menuKey = String(hasProgress());
    if (session === "menu") {
      document.getElementById("opening-scene").hidden = true;
      document.getElementById("learning-coach").hidden = true;
      document.getElementById("game-control-hint").hidden = true;
      if (menuRevision !== menuKey) {
        menuRevision = menuKey;
        menu.innerHTML = pixelMarkup(
          `<div class="cinema-world ${menuReady ? "fire-already-lit" : ""}"><div class="cinema-glow">${glow()}</div><div class="cinema-fire">${pixelBuildingSvg("bonfire")}</div></div><div class="cinema-dialogue ${menuReady ? "ready" : ""}"><span class="cinema-title">A FIRE IN THE NIGHT</span><h1 class="menu-title">EVERNIGHT</h1><div class="main-menu-choices"><button id="continue-game" ${!hasProgress() ? "disabled" : ""}>Continue Game</button><button id="new-game">Start New Game</button></div><p id="menu-confirmation" hidden>Starting a new game replaces this device’s current Camp.</p></div>`,
        );
        menu.querySelector("#continue-game").onclick = () => enter(false);
        menu.querySelector("#new-game").onclick = () => {
          if (!hasProgress()) return enter(false);
          const message = menu.querySelector("#menu-confirmation");
          message.hidden = false;
          menu.querySelector(".main-menu-choices").innerHTML =
            '<button id="confirm-new-game">Start fresh</button><button id="cancel-new-game">Keep my Camp</button>';
          menu.querySelector("#confirm-new-game").onclick = () => enter(true);
          menu.querySelector("#cancel-new-game").onclick = () => {
            menuRevision = "";
            update();
          };
        };
        setTimeout(() => {
          menuReady = true;
        }, duration(3400));
      }
      return;
    }
    root.dataset.learning = s.stage;
    root.dataset.locked = String(learningLocked(g));
    const opening = document.getElementById("opening-scene");
    opening.hidden = s.stage !== "intro";
    const key = `${s.stage}:${s.beat}`;
    if (s.stage === "intro" && key !== introKey) {
      introKey = key;
      const [headline, line] = story[s.beat];
      opening.innerHTML = pixelMarkup(
        `<div class="cinema-world fire-already-lit"><div class="cinema-glow">${glow()}</div><div class="cinema-fire">${pixelBuildingSvg("bonfire")}</div>${
          s.beat > 0
            ? `<div class="cinema-arrivals">${g.roster
                .slice(0, 3)
                .map((h) => `<span>${portraitSvg(h, true)}</span>`)
                .join("")}</div>`
            : ""
        }</div><div class="cinema-dialogue ${"ready"}"><span class="cinema-title">EVERNIGHT</span><h1>${headline}</h1><p>${line}</p>${s.beat === 2 ? '<label class="cinema-name">Name your Camp <input id="opening-camp-name" maxlength="36" value="Last Light" aria-label="Camp name"></label>' : ""}<button class="primary-button" id="opening-continue" ${""}>${s.beat === 2 ? "Keep the flame" : "Continue"} ${icon("arrow", 14)}</button><span class="cinema-page">${s.beat + 1} / 3</span></div>`,
      );
      const next = opening.querySelector("#opening-continue");
      clearTimeout(readyTimer);
      readyTimer = setTimeout(() => {
        if (next.isConnected) next.disabled = false;
      }, 0);
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
      setTimeout(
        () => root.classList.remove("revealing-world"),
        duration(3500),
      );
    }
    lastStage = s.stage;
    const coach = document.getElementById("learning-coach"),
      lesson = lessons[s.stage];
    coach.hidden = !lesson;
    const ready = learningReady(g);
    const dialog = document.getElementById("modal");
    const parent = dialog?.open && lesson ? dialog : root;
    if (coach.parentElement !== parent) parent.appendChild(coach);
    const coachState = `${s.stage}:${ready}:${s.lossResolved}:${g.screen}`;
    if (lesson && coachKey !== coachState) {
      coachKey = coachState;
      const n = Object.keys(lessons).indexOf(s.stage) + 1;
      coach.innerHTML = `<div><span class="eyebrow">LEARN ${n} / ${Object.keys(lessons).length} · +${LESSON_REWARD} coins${s.stage === "recovery" ? " · +5 wood" : ""}</span><strong>${lesson[0]}</strong><p>${lesson[1]}</p></div><div class="lesson-actions">${!ready ? '<button class="secondary-button" data-lesson-help>Show me</button>' : ""}<button class="lesson-continue ${ready ? "ready" : ""}" data-lesson-continue ${ready ? "" : "disabled"}>Continue ${ready ? "✓" : ""}</button></div>`;
      coach
        .querySelector("[data-lesson-help]")
        ?.addEventListener("click", () => {
          c.closeSheets?.();
          c.help(
            lesson[2] === "recovery"
              ? s.lossResolved
                ? "tavern"
                : "journey"
              : lesson[2],
          );
        });
      coach.querySelector("[data-lesson-continue]").onclick = async (event) => {
        event.currentTarget.disabled = true;
        if (await act("learningContinue", { stage: s.stage }))
          c.closeSheets?.();
        update();
      };
    }
    const hint = document.getElementById("game-control-hint");
    if (hint) {
      hint.hidden =
        s.stage !== "complete" ||
        !g.settings.tutorial ||
        !["camp", "market"].includes(g.screen);
      hint.textContent =
        g.screen === "camp"
          ? "Drag the ground to explore · Drag heroes onto buildings"
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
            : g.screen === "tavern"
              ? "Last Lantern Tavern"
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
      !!(document.fullscreenElement || document.webkitFullscreenElement) ||
      root.classList.contains("immersive");
    fs.setAttribute("aria-pressed", String(active));
    fs.setAttribute(
      "aria-label",
      active ? "Exit fullscreen" : "Enter fullscreen",
    );
    fs.innerHTML = icon(active ? "close" : "expand", 18);
  }
  fs.addEventListener("click", async () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      await (document.exitFullscreen?.() || document.webkitExitFullscreen?.());
    } else if (root.classList.contains("immersive"))
      root.classList.remove("immersive");
    else if (root.requestFullscreen || root.webkitRequestFullscreen) {
      try {
        await (root.requestFullscreen
          ? root.requestFullscreen({ navigationUI: "hide" })
          : root.webkitRequestFullscreen());
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
  document.addEventListener("webkitfullscreenchange", fsState);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("immersive")) {
      root.classList.remove("immersive");
      fsState();
    }
  });
  fsState();
  return { update, showMenu, isPlaying: () => session === "playing" };
}
