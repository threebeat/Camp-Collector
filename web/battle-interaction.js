import { revealed } from "./lighting.js?v=18";

// Inspection is player intent, never a default derived from the party roster.
export class BattleSelection {
  constructor() {
    this.encounter = null;
    this.uid = null;
  }
  enter(encounter) {
    if (this.encounter !== encounter) this.clear();
    this.encounter = encounter;
  }
  clear() {
    this.uid = null;
  }
  select(battle, uid) {
    this.uid = uid;
    return this.resolve(battle);
  }
  resolve(battle) {
    const unit = battle?.units.find((u) => u.uid === this.uid);
    if (
      !unit ||
      unit.dead ||
      unit.structure ||
      unit.summon ||
      (unit.team !== 0 && !revealed(battle, unit))
    ) {
      this.clear();
      return null;
    }
    return unit;
  }
}

export function attachBattleGestures(canvas, getRenderer, onTap) {
  let pointer = null,
    pinching = false,
    pinchDistance = 0;
  const touches = new Map();
  canvas.tabIndex = 0;
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      getRenderer()?.zoom(Math.exp(e.deltaY * 0.0015));
    },
    { passive: false },
  );
  canvas.addEventListener("keydown", (e) => {
    const moves = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const renderer = getRenderer();
    if (moves[e.key]) {
      e.preventDefault();
      const [x, y] = moves[e.key];
      renderer?.panBy(
        x * renderer.camera.width * 0.08,
        y * renderer.camera.width * 0.08,
      );
    }
    if (["+", "=", "-"].includes(e.key)) {
      e.preventDefault();
      renderer?.zoom(e.key === "-" ? 1.18 : 1 / 1.18);
    }
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touches.size > 1) {
      const ps = [...touches.values()];
      pinchDistance = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      pinching = true;
      if (pointer) pointer.moved = true;
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }
    if (pointer) return;
    const renderer = getRenderer();
    if (!renderer) return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      cameraX: renderer.camera.x,
      cameraY: renderer.camera.y || 0,
      moved: false,
    };
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (touches.has(event.pointerId))
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinching && touches.size > 1) {
      const ps = [...touches.values()],
        d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (d > 1) getRenderer()?.zoom(pinchDistance / d);
      pinchDistance = d;
      return;
    }
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x,
      dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 8) pointer.moved = true;
    if (pointer.moved) {
      const renderer = getRenderer(),
        width = canvas.getBoundingClientRect().width;
      if (renderer?.panBy)
        renderer.panBy(
          pointer.cameraX -
            (dx * renderer.camera.width) / width -
            renderer.camera.x,
          pointer.cameraY -
            (dy * renderer.camera.width) / width -
            renderer.camera.y,
        );
      else
        renderer?.panTo(pointer.cameraX - (dx * renderer.camera.width) / width);
    }
  });
  canvas.addEventListener("pointerup", (event) => {
    touches.delete(event.pointerId);
    if (pinching) {
      if (!touches.size) {
        pinching = false;
        pointer = null;
      }
      return;
    }
    if (!pointer || pointer.id !== event.pointerId) return;
    const tap =
      !pointer.moved &&
      Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) <= 8;
    pointer = null;
    if (tap) onTap(getRenderer()?.worldPoint(event.clientX, event.clientY));
  });
  canvas.addEventListener("pointercancel", () => {
    pointer = null;
    touches.clear();
    pinching = false;
  });
}
