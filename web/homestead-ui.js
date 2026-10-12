import {
  CAMP_WORLD,
  CAMP_ANCHORS,
  CAMP_PLOTS,
  CAMP_VENDORS,
  revealedCampAreas,
} from "./camp-world.js?v=17";
import { BUILDINGS } from "./world.js?v=17";
import { VENDORS } from "./data.js?v=17";
import { available } from "./progression.js?v=17";
import { vision } from "./lighting.js?v=17";
import {
  pixelJournalSvg,
  pixelCampGroundSvg,
  pixelBuildingSvg,
  pixelTerrainSvg,
} from "./pixel-art.js?v=17";
import { portraitSvg } from "./art.js?v=17";
import { pixelMarkup } from "./pixel-markup.js?v=17";
import { WorldCamera, attachCameraInput } from "./camera.js?v=17";
const views = new Map();
let ground = null;
const residentPositions = new Map();
let lastActorAt = null;
export function createHomesteadUi(c) {
  const { getGame, button, esc } = c;
  function viewport(key, content, width, height, center) {
    return `<section class="world-map-shell"><div class="map-camera-tools"><span>${key === "camp" ? "Your Camp" : "Camp Market"}</span>${button("−", `data-world-zoom="out" aria-label="Zoom out"`, "icon-button")}${button("+", `data-world-zoom="in" aria-label="Zoom in"`, "icon-button")}${button("Focus", `data-world-focus aria-label="Focus map"`, "secondary-button")}${button("Fit", `data-world-fit aria-label="View whole map"`, "secondary-button")}</div><div class="map-viewport" data-map-camera="${key}" tabindex="0" role="region" aria-label="${key} map. Drag to pan, pinch or use plus and minus to zoom. Arrow keys move the map."><div class="map-world ${key}-map local-map" data-local-map="${key}" data-world-width="${width}" data-world-height="${height}" data-home-x="${center.x}" data-home-y="${center.y}" style="width:${width}px;height:${height}px">${content}</div></div></section>`;
  }
  function campMap() {
    const g = getGame();
    ground ||= pixelMarkup(pixelCampGroundSvg());
    const buildings = Object.entries(CAMP_ANCHORS)
      .filter(
        ([key]) =>
          g.buildings[key] && !(key === "pantry" && g.buildings.kitchen),
      )
      .map(([key, [x, y]]) => {
        const name =
          key === "tent" && g.buildings.tent > 1
            ? "Character cabin"
            : key === "questboard"
              ? "Journal"
              : BUILDINGS[key]?.name || key;
        const attrs =
          key === "market" ? "data-market-visit" : `data-building="${key}"`;
        const art = key === "tent" && g.buildings.tent > 1 ? "cabins" : key;
        return button(
          `${key === "questboard" ? pixelJournalSvg() : pixelBuildingSvg(art, g.buildings[key])}<strong>${name}</strong>`,
          `${attrs} data-scene-key="${key}" data-world-x="${x}" data-world-y="${y}" style="left:${x}px!important;top:${y}px!important" aria-label="Open ${name}"`,
          "world-building camp-building built",
        );
      })
      .join("");
    const plotMarkers = {
      west: [220, 920],
      east: [1560, 720],
      south: [1250, 1200],
    };
    const plots = Object.entries(plotMarkers)
      .filter(([key]) => !g.campExpansions.includes(key))
      .map(([key, [x, y]]) =>
        button(
          `Clear ${key} plot`,
          `data-expand-camp="${key}" style="left:${x}px;top:${y}px"`,
          "world-plot",
        ),
      )
      .join("");
    const residents = g.roster
      .filter((h) => available(g, h))
      .slice(0, 6)
      .map((h, i) => {
        const saved = g.mapPositions.camp[h.id];
        let x = saved ? (saved.x * CAMP_WORLD.width) / 100 : 820 + (i % 3) * 70,
          y = saved
            ? (saved.y * CAMP_WORLD.height) / 100
            : 780 + Math.floor(i / 3) * 72;
        if (
          !revealedCampAreas(g).some((a) => Math.hypot(x - a.x, y - a.y) < a.r)
        ) {
          x = 820 + (i % 3) * 70;
          y = 780 + Math.floor(i / 3) * 72;
        }
        const position = residentPositions.get(h.id) || { x, y };
        residentPositions.set(h.id, position);
        return button(
          portraitSvg(h, true),
          `data-hero="${h.id}" data-world-resident="${i}" data-world-x="${x}" data-world-y="${y}" data-light-radius="${vision(h).light}" style="left:${position.x}px;top:${position.y}px" aria-label="Adventurer ${esc(h.name)}"`,
          "world-resident",
        );
      })
      .join("");
    const portal = g.portalUnlocked
      ? button(
          pixelBuildingSvg("portal") + "<strong>Portal mage</strong>",
          'data-portal data-scene-key="portal" data-world-x="1240" data-world-y="480" style="left:1240px;top:480px"',
          "world-building",
        )
      : "";
    const marketSite = !g.buildings.market
      ? button(
          "Market site",
          'data-building="market" style="left:1410px;top:400px"',
          "world-plot",
        )
      : "";
    return viewport(
      "camp",
      `<div class="world-ground pixel-ground">${ground}</div>${buildings}${residents}${portal}${plots}${marketSite}${g.buildings.dock ? button("The Bell Beneath · 25 floors", 'data-island-preview style="left:1100px;top:1210px"', "world-plot island-sign") : ""}`,
      CAMP_WORLD.width,
      CAMP_WORLD.height,
      CAMP_WORLD.center,
    );
  }
  function marketMap() {
    const booths = CAMP_VENDORS.map((key, i) => {
      const v = VENDORS.find((v) => v.id === key),
        x = 230 + (i % 2) * 340,
        y = 190 + Math.floor(i / 2) * 280;
      return button(
        `${pixelBuildingSvg(key)}<strong>${key === "night" ? "Supplies & lights" : v.name}</strong>`,
        `data-vendor-map="${key}" data-scene-key="${key}" data-world-x="${x}" data-world-y="${y}" style="left:${x}px;top:${y}px"`,
        "world-building market-map-stall",
      );
    }).join("");
    return `<div class="compact-market-heading"><h1>Camp Market</h1>${button("Camp", 'data-nav="camp"', "secondary-button")}</div>${viewport("market", `<div class="world-ground pixel-ground">${pixelTerrainSvg("market", 800, 700, 42)}</div>${booths}`, 800, 700, { x: 400, y: 350 })}`;
  }
  function bind(root) {
    const maps = [];
    for (const viewport of root.querySelectorAll("[data-map-camera]")) {
      const world = viewport.querySelector(".map-world"),
        key = viewport.dataset.mapCamera;
      const w = Number(world.dataset.worldWidth),
        h = Number(world.dataset.worldHeight);
      const home = {
        x: Number(world.dataset.homeX),
        y: Number(world.dataset.homeY),
      };
      let firstSize = !views.has(key);
      const camera =
        views.get(key) ||
        new WorldCamera(w, h, {
          ...home,
          span: key === "camp" ? 720 : 760,
          min: 360,
        });
      views.set(key, camera);
      let r = viewport.getBoundingClientRect();
      const observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              r = viewport.getBoundingClientRect();
            })
          : null;
      observer?.observe(viewport);
      let panNotified = false;
      const apply = () => {
        if (!r.width || !r.height) return;
        camera.viewport(r.width, r.height);
        const base = Math.max(
          key === "camp" ? 720 : 760,
          (key === "camp" ? 560 : 660) * camera.ratio,
        );
        if (!camera.manual) camera.target = { ...home, width: base };
        if (firstSize) {
          camera.width = base;
          camera.constrain();
          firstSize = false;
        }
        const scale = r.width / camera.width;
        world.style.setProperty?.("--camera-scale", String(scale));
        world.classList.toggle(
          "map-overview",
          scale < 0.35 || (key === "camp" && camera.height > 1000),
        );
        world.style.transform = `translate(${-camera.x * scale}px,${-camera.y * scale}px) scale(${scale})`;
        viewport.dataset.cameraMode = camera.manual ? "free" : "focus";
        viewport.dataset.moveActive = String(!!c.getMovingHero?.());
        if (key === "camp" && camera.manual && !panNotified) {
          panNotified = true;
          c.pan?.();
        }
      };
      const input = attachCameraInput(viewport, camera, apply);
      viewport.addEventListener(
        "click",
        (event) => {
          const id = c.getMovingHero?.();
          if (key !== "camp" || !id || event.target.closest(".world-resident"))
            return;
          const point = camera.point(r, event.clientX, event.clientY);
          const building = event.target.closest(".world-building");
          // A Walk gesture owns service labels as well as ground. Stop at the
          // front of the fixture instead of opening it through the destination tap.
          if (building)
            point.y = Math.max(point.y, +building.dataset.worldY + 110);
          event.preventDefault();
          event.stopImmediatePropagation();
          if (
            !revealedCampAreas(getGame()).some(
              (a) => Math.hypot(point.x - a.x, point.y - a.y) < a.r - 12,
            )
          )
            return;
          c.move?.(id, (point.x / w) * 100, (point.y / h) * 100);
        },
        true,
      );
      let dispatching = false;
      viewport.addEventListener(
        "click",
        (event) => {
          if (dispatching || !event.isTrusted) return;
          if (event.target.closest("button")) return;
          // At an overview scale, choose the nearest anchor rather than extending
          // overlapping rectangles over neighboring buildings.
          const candidates = [
            ...world.querySelectorAll(
              ".world-building, .world-resident, .world-plot",
            ),
          ]
            .map((el) => {
              const r = el.getBoundingClientRect();
              return {
                el,
                d: Math.hypot(
                  event.clientX - r.left - r.width / 2,
                  event.clientY - r.top - r.height / 2,
                ),
              };
            })
            .sort((a, b) => a.d - b.d);
          const hit = candidates[0];
          if (!hit || hit.d > 24 || event.target.closest("button") === hit.el)
            return;
          event.preventDefault();
          event.stopImmediatePropagation();
          dispatching = true;
          try {
            hit.el.click();
          } finally {
            dispatching = false;
          }
        },
        true,
      );
      const shell = viewport.closest(".world-map-shell");
      shell.querySelectorAll("[data-world-zoom]").forEach((b) =>
        b.addEventListener("click", () => {
          camera.zoom(b.dataset.worldZoom === "in" ? 1 / 1.2 : 1.2);
          apply();
        }),
      );
      shell
        .querySelector("[data-world-focus]")
        .addEventListener("click", () => {
          camera.focus(
            [home],
            Math.max(
              key === "camp" ? 720 : 760,
              (key === "camp" ? 560 : 660) * camera.ratio,
            ),
          );
          apply();
        });
      shell.querySelector("[data-world-fit]").addEventListener("click", () => {
        camera.manual = true;
        camera.cx = w / 2;
        camera.cy = h / 2;
        camera.width = Math.max(w, h * camera.ratio);
        apply();
      });
      shell.querySelectorAll("[data-world-zone]").forEach((b) =>
        b.addEventListener("click", () => {
          const [x, y] = CAMP_PLOTS[b.dataset.worldZone];
          camera.focus([{ x, y }], 720);
          apply();
        }),
      );
      apply();
      maps.push({
        camera,
        apply,
        input,
        dispose: () => observer?.disconnect(),
      });
    }
    return maps;
  }
  function focusTarget(key) {
    const camera = views.get("camp");
    if (!camera) return;
    const [x, y] =
      key === "resident"
        ? [880, 780]
        : CAMP_ANCHORS[key] || CAMP_ANCHORS.bonfire;
    camera.manual = false;
    camera.cx = x;
    camera.cy = y;
    camera.width = 720;
    camera.target = { x, y, width: 720 };
    const el =
      key === "resident"
        ? document.querySelector(".world-resident")
        : document.querySelector(`[data-building="${key}"]`);
    el?.classList.add("lesson-target");
    setTimeout(() => el?.classList.remove("lesson-target"), 3500);
  }
  function reveal() {
    if (
      getGame().settings.reducedMotion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const camera = views.get("camp");
    if (!camera) return;
    camera.manual = false;
    camera.cx = 900;
    camera.width = 360;
    camera.cy = 650 + camera.height * (window.innerWidth <= 850 ? 0.14 : 0.08);
    camera.easing = 1.2;
    setTimeout(() => {
      camera.easing = 7;
    }, 3500);
  }
  function animate(now) {
    const dt =
      lastActorAt === null ? 1 / 60 : Math.min(0.1, (now - lastActorAt) / 1000);
    lastActorAt = now;
    document.querySelectorAll("[data-world-resident]").forEach((el) => {
      const id = el.dataset.hero,
        target = { x: +el.dataset.worldX, y: +el.dataset.worldY };
      const pos = residentPositions.get(id) || { ...target };
      const distance = Math.hypot(target.x - pos.x, target.y - pos.y),
        amount = Math.min(1, (85 * dt) / Math.max(1, distance));
      pos.x += (target.x - pos.x) * amount;
      pos.y += (target.y - pos.y) * amount;
      residentPositions.set(id, pos);
      const moving = distance > 1;
      el.classList.toggle("walking", moving);
      const idle =
        getGame().settings.reducedMotion ||
        moving ||
        c.getMovingHero?.() === id ||
        el.matches?.(":hover") ||
        document.activeElement === el;
      const i = +el.dataset.worldResident;
      el.style.left = pos.x + (idle ? 0 : Math.sin(now / 9000 + i) * 8) + "px";
      el.style.top = pos.y + (idle ? 0 : Math.cos(now / 12000 + i) * 6) + "px";
    });
  }
  return {
    reveal,
    focusTarget,
    animate,
    campMap,
    marketMap,
    bind,
    areas: () => revealedCampAreas(getGame()),
  };
}
