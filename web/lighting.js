import { ITEMS, hasAttribute } from "./data.js?v=14";
export const NIGHT_SIGHT = {
  Dwarf: 220,
  Gnome: 200,
  Kobold: 240,
  Myconid: 210,
  Shade: 280,
  Elf: 95,
  Nereid: 95,
};
export function vision(h) {
  const sight = Math.max(
    NIGHT_SIGHT[h?.race] || 55,
    h && hasAttribute(h, "Vampire") ? 300 : 0,
    h && hasAttribute(h, "Werewolf") ? 250 : 0,
    h?.talents?.some((t) => t.key === "Night vision") ? 190 : 0,
  );
  return {
    sight,
    light: ITEMS[h?.light?.key]?.lightRadius || 0,
    nightVision: sight >= 190,
    label: sight >= 190 ? "Night vision" : "Ordinary sight",
  };
}
export function lightSources(b) {
  return [
    ...b.units
      .filter(
        (u) =>
          !u.dead &&
          !u.pet &&
          !u.summon &&
          !u.structure &&
          vision(u.hero).light,
      )
      .map((u) => ({
        x: u.x,
        y: u.y,
        r: vision(u.hero).light,
        color: ITEMS[u.hero.light.key].lightColor,
        kind: "lamp",
      })),
    ...(b.fires || []).map((f) => ({
      x: f.x,
      y: f.y,
      r: 110,
      color: "#ef9f55",
      kind: "fire",
    })),
    ...(b.zones || [])
      .filter((z) => z.type === "blessing")
      .map((z) => ({
        x: z.x,
        y: z.y,
        r: Math.max(65, z.r),
        color: "#acbfff",
        kind: "magic",
      })),
    ...(b.projectiles || [])
      .filter((p) => ["fire", "bolt"].includes(p.type))
      .map((p) => ({ x: p.x, y: p.y, r: 45, color: "#acbfff", kind: "magic" })),
  ];
}
// Use the same geometric shadows for detection, remembered terrain and the fog mask.
function rayLimit(b, a, dx, dy, max) {
  let distance = max;
  for (const o of b.map?.objects || []) {
    if (["tree", "rock"].includes(o.type)) {
      const x = a.x - o.x,
        y = a.y - o.y,
        t = -(x * dx + y * dy),
        disc = t * t - (x * x + y * y - o.r * o.r);
      if (disc >= 0) {
        const near = t - Math.sqrt(disc);
        if (near > 1) distance = Math.min(distance, near);
      }
    } else if (["house", "ruin"].includes(o.type)) {
      let near = 0,
        far = max;
      for (const [origin, dir, lo, hi] of [
        [a.x, dx, o.x, o.x + o.w],
        [a.y, dy, o.y, o.y + o.h],
      ]) {
        if (Math.abs(dir) < 1e-8) {
          if (origin < lo || origin > hi) {
            far = -1;
            break;
          }
        } else {
          const t1 = (lo - origin) / dir,
            t2 = (hi - origin) / dir;
          near = Math.max(near, Math.min(t1, t2));
          far = Math.min(far, Math.max(t1, t2));
        }
      }
      if (near > 1 && far >= near) distance = Math.min(distance, near);
    }
  }
  return distance;
}
export function sightLine(b, a, p) {
  const d = Math.hypot(p.x - a.x, p.y - a.y);
  return (
    !d ||
    a.flying ||
    rayLimit(b, a, (p.x - a.x) / d, (p.y - a.y) / d, d) >= d - 0.5
  );
}
export function sightPolygon(b, s) {
  return Array.from({ length: 96 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 96,
      dx = Math.cos(angle),
      dy = Math.sin(angle),
      r = s.flying ? s.r : rayLimit(b, s, dx, dy, s.r);
    return { x: s.x + dx * r, y: s.y + dy * r };
  });
}
export function canSee(b, o, p, sources = lightSources(b)) {
  if (!o || o.dead || !sightLine(b, o, p)) return false;
  const r = vision(o.hero).sight;
  if (Math.hypot(o.x - p.x, o.y - p.y) <= r) return true;
  return sources.some(
    (s) =>
      Math.hypot(p.x - s.x, p.y - s.y) <= s.r &&
      Math.hypot(o.x - s.x, o.y - s.y) <= s.r + r &&
      sightLine(b, s, p),
  );
}
export function revealed(b, p, team = 0, sources = lightSources(b)) {
  return b.units.some(
    (u) =>
      u.team === team &&
      !u.dead &&
      !u.pet &&
      !u.summon &&
      !u.structure &&
      canSee(b, u, p, sources),
  );
}
export function fogCells(b) {
  const cells = [],
    sources = lightSources(b);
  for (let y = 20; y < 480; y += 40)
    for (let x = 20; x < 1200; x += 40)
      if (revealed(b, { x, y }, 0, sources))
        cells.push(Math.floor(y / 40) * 30 + Math.floor(x / 40));
  return cells;
}
