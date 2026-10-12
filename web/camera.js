const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export class WorldCamera {
  constructor(
    width,
    height,
    { x = width / 2, y = height / 2, span = width, min = 240 } = {},
  ) {
    this.worldWidth = width;
    this.worldHeight = height;
    this.min = min;
    this.cx = x;
    this.cy = y;
    this.width = span;
    this.ratio = 1;
    this.manual = false;
    this.target = { x, y, width: span };
    this.lastAt = null;
  }
  get x() {
    return this.cx - this.width / 2;
  }
  set x(v) {
    this.cx = v + this.width / 2;
  }
  get height() {
    return this.width / this.ratio;
  }
  get y() {
    return this.cy - this.height / 2;
  }
  viewport(width, height) {
    this.ratio = Math.max(0.1, width / height);
    this.constrain();
  }
  constrain() {
    this.width = clamp(
      this.width,
      this.min,
      Math.max(this.worldWidth, this.worldHeight * this.ratio),
    );
    this.cx = clamp(
      this.cx,
      Math.min(this.width / 2 - (this.padding || 0), this.worldWidth / 2),
      Math.max(
        this.worldWidth - this.width / 2 + (this.padding || 0),
        this.worldWidth / 2,
      ),
    );
    this.cy = clamp(
      this.cy,
      Math.min(this.height / 2, this.worldHeight / 2),
      Math.max(this.worldHeight - this.height / 2, this.worldHeight / 2),
    );
  }
  move(dx, dy) {
    this.manual = true;
    this.cx += dx;
    this.cy += dy;
    this.constrain();
  }
  zoom(factor, point = { x: this.cx, y: this.cy }) {
    this.manual = true;
    const old = this.width;
    this.width = clamp(
      old * factor,
      this.min,
      Math.max(this.worldWidth, this.worldHeight * this.ratio),
    );
    const f = this.width / old;
    this.cx = point.x + (this.cx - point.x) * f;
    this.cy = point.y + (this.cy - point.y) * f;
    this.constrain();
  }
  focus(points, base = 480) {
    this.manual = false;
    if (!points.length) return;
    const xs = points.map((p) => p.x),
      ys = points.map((p) => p.y);
    const left = Math.min(...xs),
      right = Math.max(...xs),
      top = Math.min(...ys) - 80,
      bottom = Math.max(...ys) + 30;
    this.target = {
      x: (left + right) / 2,
      y: (top + bottom) / 2,
      width: clamp(
        Math.max(base, right - left + 180, (bottom - top + 90) * this.ratio),
        this.min,
        Math.max(this.worldWidth, this.worldHeight * this.ratio),
      ),
    };
  }
  update(time) {
    const dt =
      this.lastAt === null ? 1 / 60 : clamp(time - this.lastAt, 0, 0.1);
    this.lastAt = time;
    if (!this.manual) {
      const a = 1 - Math.exp(-dt * 7);
      this.cx += (this.target.x - this.cx) * a;
      this.cy += (this.target.y - this.cy) * a;
      this.width += (this.target.width - this.width) * a;
      this.constrain();
    }
  }
  point(rect, x, y) {
    const s = rect.width / this.width;
    return { x: this.x + (x - rect.left) / s, y: this.y + (y - rect.top) / s };
  }
}

// One gesture owns a map. A drag/pinch suppresses the following synthetic click.
export function attachCameraInput(element, camera, changed = () => {}) {
  const pointers = new Map();
  let last = null,
    moved = false,
    suppressUntil = 0;
  const notify = () => changed(camera);
  element.addEventListener("dragstart", (e) => e.preventDefault());
  element.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    element.focus?.({ preventScroll: true });
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      suppressUntil = 0;
      last = {
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
      };
      moved = false;
    }
  });
  element.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    const old = [...pointers.values()];
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const next = [...pointers.values()];
    if (next.length > 1) {
      const distance = (ps) => Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (distance(old) > 1)
        camera.zoom(
          distance(old) / Math.max(1, distance(next)),
          camera.point(
            element.getBoundingClientRect(),
            (next[0].x + next[1].x) / 2,
            (next[0].y + next[1].y) / 2,
          ),
        );
      moved = true;
      notify();
    } else if (last) {
      if (Math.hypot(e.clientX - last.startX, e.clientY - last.startY) > 8)
        moved = true;
      if (moved) {
        element.setPointerCapture?.(e.pointerId);
        const scale = camera.width / element.getBoundingClientRect().width;
        camera.move((last.x - e.clientX) * scale, (last.y - e.clientY) * scale);
        notify();
      }
      last.x = e.clientX;
      last.y = e.clientY;
    }
  });
  const finish = (e) => {
    pointers.delete(e.pointerId);
    element.releasePointerCapture?.(e.pointerId);
    if (moved || e.type === "pointercancel") suppressUntil = Date.now() + 450;
    if (!pointers.size) last = null;
  };
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);
  element.addEventListener(
    "click",
    (e) => {
      if (Date.now() < suppressUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  element.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      camera.zoom(
        Math.exp(e.deltaY * 0.0015),
        camera.point(element.getBoundingClientRect(), e.clientX, e.clientY),
      );
      notify();
    },
    { passive: false },
  );
  element.addEventListener("keydown", (e) => {
    if (e.target !== element) return;
    const moves = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [x, y] = moves[e.key];
      camera.move(x * camera.width * 0.08, y * camera.width * 0.08);
      notify();
    }
    if (["+", "=", "-"].includes(e.key)) {
      e.preventDefault();
      camera.zoom(e.key === "-" ? 1.18 : 1 / 1.18);
      notify();
    }
  });
  return { isDragging: () => pointers.size > 0 };
}
