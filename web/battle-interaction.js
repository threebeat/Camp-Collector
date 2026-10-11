import { revealed } from "./lighting.js?v=15";

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
  let pointer = null;
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || pointer) return;
    const renderer = getRenderer();
    if (!renderer) return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      cameraX: renderer.camera.x,
      moved: false,
    };
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x,
      dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 8) pointer.moved = true;
    if (pointer.moved && Math.abs(dx) > Math.abs(dy)) {
      const renderer = getRenderer(),
        width = canvas.getBoundingClientRect().width;
      renderer?.panTo(pointer.cameraX - (dx * renderer.camera.width) / width);
    }
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const tap =
      !pointer.moved &&
      Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) <= 8;
    pointer = null;
    if (tap) onTap(getRenderer()?.worldPoint(event.clientX, event.clientY));
  });
  canvas.addEventListener("pointercancel", () => {
    pointer = null;
  });
}
