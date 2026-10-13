import { vision, canSee, fogCells } from "./lighting.js?v=20";
import {
  W,
  H,
  CELL,
  ITEMS,
  CLASSES,
  stats,
  enemyCompany,
  gainXp,
  combatClass,
  schoolCombatClass,
  school,
  abilityName,
  hasAttribute,
  abilityScale,
  gainFacetXp,
  makeFacet,
  facetScale,
  PETS,
  itemRarity,
  generateHero,
  dialogue,
  characterSize,
  allGear,
  itemInfo,
  petInfo,
  spellObjects,
  spellObjectInfo,
} from "./data.js?v=20";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function seeded(seed) {
  const random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  random.getState = () => seed | 0;
  random.setState = (value) => {
    seed = value | 0;
  };
  return random;
}
export function terrainFor(biome, seed = 1, profile = {}) {
  const random = seeded(seed),
    objects = [],
    bushes = [];
  if (biome === "river")
    objects.push({ type: "river", x: 564, y: 0, w: 72, h: H });
  if (biome === "jungle")
    for (const [x, y, w, h] of [
      [420, 90, 65, 45],
      [790, 330, 70, 45],
    ])
      objects.push({ type: "ruin", x, y, w, h });
  if (biome === "volcano")
    for (const [x, y] of [
      [420, 95],
      [685, 320],
      [840, 110],
    ])
      objects.push({ type: "rock", x, y, r: 25 });
  if (biome === "village") {
    for (const [x, y, w, h] of [
      [393, 83, 94, 67],
      [692, 322, 94, 66],
      [814, 70, 70, 58],
    ])
      objects.push({ type: "house", x, y, w, h });
  }
  const count =
    profile.style === "strong"
      ? 4
      : profile.style === "wild"
        ? 24
        : biome === "jungle"
          ? 24
          : biome === "volcano"
            ? 5
            : biome === "forest"
              ? 16
              : 10;
  for (let i = 0; i < count; i++) {
    let x = 280 + random() * 690,
      y = 55 + random() * 365;
    if (Math.abs(y - H / 2) < 72) y += y < H / 2 ? -65 : 65;
    if (biome === "river" && x > 530 && x < 672) x += 110;
    if (
      objects.some(
        (o) =>
          o.type === "house" &&
          x > o.x - 35 &&
          x < o.x + o.w + 35 &&
          y > o.y - 40 &&
          y < o.y + o.h + 35,
      )
    )
      continue;
    objects.push({ type: "tree", x, y, r: 17 + random() * 9 });
  }
  for (
    let i = 0;
    i < (profile.style === "strong" ? 3 : profile.style === "wild" ? 19 : 13);
    i++
  )
    bushes.push({
      x: 230 + random() * 760,
      y: 60 + random() * 360,
      r: 20 + random() * 8,
    });
  const map = {
    biome,
    profile,
    objects,
    bushes,
    grass:
      biome === "jungle"
        ? Array.from({ length: 10 }, () => ({
            x: 320 + random() * 610,
            y: 70 + random() * 340,
            r: 40 + random() * 35,
          }))
        : [],
    seed,
    bridges:
      biome === "river"
        ? [
            { x: 554, y: 132, w: 92, h: 72 },
            { x: 554, y: 300, w: 92, h: 72 },
          ]
        : [],
    cols: W / CELL,
    rows: H / CELL,
  };
  map.blocked = (x, y, r = 8) => {
    if (x < r || x > W - r || y < r || y > H - r) return true;
    for (const o of objects) {
      if (
        ["tree", "rock"].includes(o.type) &&
        Math.hypot(x - o.x, y - o.y) < o.r + r
      )
        return true;
      if (
        ["house", "ruin"].includes(o.type) &&
        x > o.x - r &&
        x < o.x + o.w + r &&
        y > o.y - r &&
        y < o.y + o.h + r
      )
        return true;
      if (
        o.type === "river" &&
        x > o.x - r &&
        x < o.x + o.w + r &&
        !map.bridges.some((b) => y > b.y + r && y < b.y + b.h - r)
      )
        return true;
    }
    return false;
  };
  return map;
}
export function findPath(map, from, to, walls = []) {
  const cols = map.cols,
    rows = map.rows;
  const cell = (p) => [
    clamp(Math.floor(p.x / CELL), 0, cols - 1),
    clamp(Math.floor(p.y / CELL), 0, rows - 1),
  ];
  const [sx, sy] = cell(from);
  let [gx, gy] = cell(to);
  const blocked = (x, y) =>
    x < 0 ||
    x >= cols ||
    y < 0 ||
    y >= rows ||
    map.blocked(x * CELL + CELL / 2, y * CELL + CELL / 2, 8) ||
    walls.some(
      (w) =>
        w.hp > 0 &&
        Math.abs(w.x - (x * CELL + 12)) < w.r + 10 &&
        Math.abs(w.y - (y * CELL + 12)) < w.r + 10,
    );
  if (blocked(gx, gy)) {
    let best = Infinity;
    const originalX = gx,
      originalY = gy;
    for (let y = originalY - 3; y <= originalY + 3; y++)
      for (let x = originalX - 3; x <= originalX + 3; x++)
        if (!blocked(x, y)) {
          const d = Math.hypot(x * CELL + 12 - to.x, y * CELL + 12 - to.y);
          if (d < best) {
            best = d;
            gx = x;
            gy = y;
          }
        }
  }
  const key = (x, y) => y * cols + x,
    start = key(sx, sy),
    goal = key(gx, gy),
    open = [start],
    g = new Map([[start, 0]]),
    parents = new Map(),
    closed = new Set();
  let bestKey = start,
    bestDist = Infinity;
  let loops = 0;
  while (open.length && loops++ < cols * rows) {
    let bi = 0,
      bf = Infinity;
    for (let i = 0; i < open.length; i++) {
      const k = open[i],
        x = k % cols,
        y = Math.floor(k / cols),
        f = g.get(k) + Math.hypot(x - gx, y - gy);
      if (f < bf) {
        bf = f;
        bi = i;
      }
    }
    const current = open.splice(bi, 1)[0],
      cx = current % cols,
      cy = Math.floor(current / cols);
    const hd = Math.hypot(cx - gx, cy - gy);
    if (hd < bestDist) {
      bestDist = hd;
      bestKey = current;
    }
    if (current === goal) {
      bestKey = goal;
      break;
    }
    closed.add(current);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const nx = cx + dx,
        ny = cy + dy,
        k = key(nx, ny);
      if (
        blocked(nx, ny) ||
        closed.has(k) ||
        (dx && dy && (blocked(cx + dx, cy) || blocked(cx, cy + dy)))
      )
        continue;
      const score = g.get(current) + (dx && dy ? 1.414 : 1);
      if (score < (g.get(k) ?? Infinity)) {
        g.set(k, score);
        parents.set(k, current);
        if (!open.includes(k)) open.push(k);
      }
    }
  }
  const path = [];
  let k = bestKey;
  while (k !== start && parents.has(k)) {
    path.push({
      x: (k % cols) * CELL + 12,
      y: Math.floor(k / cols) * CELL + 12,
    });
    k = parents.get(k);
  }
  return path.reverse();
}
export class Battle {
  constructor(heroes, stage = 0, seed = 1, enemyOverride = null, options = {}) {
    this.mode = options.mode || "campaign";
    this.tutorialOutcome = options.tutorialOutcome || null;
    this.arenaRule = options.arenaRule || "four";
    this.fogSeen = [];
    this.fogAt = 0;
    this.supplies = options.supplies || [];
    this.recruitLimit = options.recruitLimit ?? 2;
    this.hazards = options.hazards ?? seed % 2 === 0;
    this.hazardsAdded = false;
    this.props = [];
    this.decals = [];
    this.debris = [];
    this.fires = [];
    this.environmentAt = 0;
    this.onConvert = options.onConvert || null;
    this.onDefeat = options.onDefeat || null;
    this.traps = [];
    this.converted = [];
    this.stage = stage;
    this.random = seeded(seed);
    this.time = 0;
    this.result = null;
    this.units = [];
    this.projectiles = [];
    this.zones = [];
    this.effects = [];
    this.floats = [];
    this.events = [];
    this.serial = 0;
    this.map = terrainFor(
      options.biome || ["forest", "river", "village"][stage % 3] || "forest",
      seed,
      options.terrainProfile || {},
    );
    this.damageDone = {};
    this.healingDone = {};
    this.addFormation(
      heroes
        .filter(
          (h) =>
            h.deployed &&
            (h.currentHp === null ||
              h.currentHp === undefined ||
              h.currentHp > 0),
        )
        .map((h) => structuredClone(h)),
      0,
    );
    this.addFormation(
      (enemyOverride || enemyCompany(stage)).map((h) => structuredClone(h)),
      1,
    );
    if (this.mode === "arena" && this.arenaRule === "four")
      for (let t = 2; t < 4; t++)
        this.addFormation(
          (
            options.enemyTeams?.[t - 2] ||
            enemyOverride ||
            enemyCompany(stage)
          ).map((h) => structuredClone({ ...h, id: h.id + "-team-" + t })),
          t,
        );
    if (this.mode === "arena" && this.arenaRule === "tigers")
      for (const u of this.units.filter((u) => u.team === 1)) {
        u.hazard = "tiger";
        u.hero.uncharmable = true;
        u.name = "Arena tiger";
        u.hero.name = u.name;
        u.maxHp *= 1.2;
        u.hp = u.maxHp;
        u.speed *= 1.3;
        u.ranged = false;
        u.range = 30;
        u.classId = "vanguard";
        u.abilityAt = Infinity;
      }
    if (this.mode === "arena" && this.arenaRule === "mines")
      for (let i = 0; i < 12; i++)
        this.traps.push({
          x: 350 + (i % 6) * 100,
          y: 130 + Math.floor(i / 6) * 210,
          kind: "mine",
          owner: null,
          team: -1,
          triggered: false,
          r: 28,
          power: 45,
        });
    for (let i = 0; i < 8; i++) {
      const p = this.safePoint(
        330 + this.random() * 550,
        100 + this.random() * 280,
      );
      this.props.push({
        id: i,
        ...p,
        kind: i % 3 === 0 ? "barrel" : "crate",
        hp: i % 3 === 0 ? 35 : 50,
        r: i % 3 === 0 ? 13 : 15,
        vx: 0,
        vy: 0,
        burning: 0,
        dead: false,
      });
    }
    for (const owner of [...this.units])
      if (owner.hero.companion) this.addCompanion(owner);
    this.nextSpeechAt = 22 + this.random() * 35;
    this.initialCount = [
      this.units.filter((u) => u.team === 0).length,
      this.units.filter((u) => u.team === 1).length,
    ];
    for (const p of options.placements || [])
      this.placePreparation(p.heroId, p.x, p.y);
  }
  toState() {
    const units = this.units.map((u) => {
      const { target, ...plain } = u;
      return { ...plain, targetId: target?.uid ?? null };
    });
    const projectiles = this.projectiles.map((p) => {
      const { target, owner, ...plain } = p;
      return { ...plain, targetId: target.uid, ownerId: owner.uid };
    });
    const zones = this.zones.map((z) => {
      const { owner, ...plain } = z;
      return { ...plain, ownerId: owner?.uid ?? null };
    });
    return structuredClone({
      version: 1,
      arenaRule: this.arenaRule,
      tutorialOutcome: this.tutorialOutcome,
      fogSeen: this.fogSeen,
      fogAt: this.fogAt,
      mode: this.mode,
      supplies: this.supplies,
      recruitLimit: this.recruitLimit,
      hazards: this.hazards,
      hazardsAdded: this.hazardsAdded,
      props: this.props,
      decals: this.decals,
      debris: this.debris,
      fires: this.fires,
      environmentAt: this.environmentAt,
      nextSpeechAt: this.nextSpeechAt,
      stage: this.stage,
      time: this.time,
      randomState: this.random.getState(),
      map: {
        biome: this.map.biome,
        seed: this.map.seed,
        profile: this.map.profile,
      },
      serial: this.serial,
      initialCount: this.initialCount,
      units,
      projectiles,
      zones,
      traps: this.traps,
      convertedIds: this.converted.map((u) => u.uid),
      effects: this.effects,
      floats: this.floats,
      events: this.events,
      damageDone: this.damageDone,
      healingDone: this.healingDone,
      result: this.result,
    });
  }
  static fromState(state, options = {}) {
    if (
      !state ||
      state.version !== 1 ||
      !Array.isArray(state.units) ||
      !state.map ||
      !Number.isFinite(state.time)
    )
      throw Error("Invalid battle checkpoint");
    const b = Object.create(Battle.prototype),
      copy = structuredClone(state);
    for (const key of [
      "arenaRule",
      "tutorialOutcome",
      "fogSeen",
      "fogAt",
      "mode",
      "supplies",
      "recruitLimit",
      "hazards",
      "hazardsAdded",
      "props",
      "decals",
      "debris",
      "fires",
      "environmentAt",
      "nextSpeechAt",
      "stage",
      "time",
      "serial",
      "initialCount",
      "traps",
      "effects",
      "floats",
      "events",
      "damageDone",
      "healingDone",
      "result",
    ])
      b[key] = copy[key];
    b.arenaRule ||= "four";
    b.fogSeen ||= [];
    b.fogAt ??= b.time;
    b.nextSpeechAt ??= b.time + 25 + (copy.randomState % 35);
    b.supplies ||= [];
    b.map = terrainFor(copy.map.biome, copy.map.seed, copy.map.profile || {});
    b.random = seeded(copy.randomState);
    b.onConvert = options.onConvert || null;
    b.onDefeat = options.onDefeat || null;
    b.units = copy.units;
    const byId = new Map(b.units.map((u) => [u.uid, u]));
    for (const u of b.units) {
      u.mana ??= stats(u.hero).maxMana;
      u.maxMana ??= stats(u.hero).maxMana;
      u.zoneScale ??= 1;
      u.shieldScale ??= 1;
      u.summonCount ??= 2;
      u.target = byId.get(u.targetId) || null;
      delete u.targetId;
      for (const key of ["expires", "abilityAt", "extraAt", "schoolAt"])
        if (u[key] === null) u[key] = Infinity;
      if (u.structure || u.summon) u.hero = byId.get(u.owner)?.hero || u.hero;
    }
    b.projectiles = copy.projectiles
      .map((p) => ({
        ...p,
        target: byId.get(p.targetId),
        owner: byId.get(p.ownerId),
      }))
      .filter((p) => p.target && p.owner);
    b.zones = copy.zones.map((z) => ({
      ...z,
      owner: byId.get(z.ownerId) || null,
    }));
    b.converted = copy.convertedIds.map((id) => byId.get(id)).filter(Boolean);
    return b;
  }
  placePreparation(heroId, x, y) {
    if (
      this.time !== 0 ||
      this.result ||
      x < 215 ||
      x > W / 2 - 25 ||
      y < 30 ||
      y > H - 30 ||
      this.map.blocked(x, y, 15)
    )
      return false;
    const u = this.units.find(
        (a) =>
          a.hero.id === heroId &&
          a.team === 0 &&
          !a.summon &&
          !a.structure &&
          !a.dead,
      ),
      kind = u && CLASSES[u.hero.classId].preBattle;
    if (!kind) return false;
    const limit =
        kind === "wall"
          ? 1
          : u.hero.classId === "trapper" && u.hero.classPath === "adept"
            ? 3
            : 2,
      count =
        this.traps.filter((t) => t.owner === u.uid).length +
        this.units.filter((a) => a.prepared && a.owner === u.uid).length;
    if (count >= limit) return false;
    if (kind === "wall")
      this.addUnit(u.hero, 0, x, y, {
        name: "Prepared barrier",
        structure: true,
        kind: "wall",
        prepared: true,
        owner: u.uid,
        maxHp: 85 + u.endurance * 3,
        hp: 85 + u.endurance * 3,
        attack: 0,
        speed: 0,
        r: 17,
        range: 0,
        expires: 80,
        abilityAt: Infinity,
        extraAt: Infinity,
        regen: 0,
        flying: false,
      });
    else
      this.traps.push({
        x,
        y,
        kind,
        owner: u.uid,
        team: 0,
        triggered: false,
        r: 28,
        power: (kind === "mine" ? 28 : 8) + u.strength * 0.7,
      });
    return { heroId, x, y, kind };
  }
  autoPrepare() {
    const placements = [];
    for (const u of this.units.filter(
      (u) =>
        u.team === 0 &&
        !u.structure &&
        !u.summon &&
        CLASSES[u.hero.classId].preBattle,
    )) {
      const kind = CLASSES[u.hero.classId].preBattle,
        limit =
          kind === "wall"
            ? 1
            : u.hero.classId === "trapper" && u.hero.classPath === "adept"
              ? 3
              : 2;
      for (let i = 0; i < limit; i++) {
        for (const offset of [0, 24, -24, 48, -48, 72, -72]) {
          const y =
            this.map.biome === "river" && kind !== "wall"
              ? this.map.bridges[i % this.map.bridges.length].y + 36
              : u.y;
          const p = this.placePreparation(
            u.hero.id,
            kind === "wall" ? 420 : limit === 3 ? 420 + i * 60 : 450 + i * 80,
            clamp(y + offset, 35, H - 35),
          );
          if (p) {
            placements.push(p);
            break;
          }
        }
      }
    }
    return placements;
  }
  addFormation(heroes, team) {
    const groups = [[], [], [], [], []];
    heroes.forEach((h) => groups[CLASSES[h.classId].rank].push(h));
    groups.forEach((group, rank) =>
      group.forEach((h, i) => {
        const row = i % 8,
          col = Math.floor(i / 8),
          rows = Math.min(8, group.length);
        const x =
          team === 0
            ? 194 - rank * 29 - col * 20
            : W - 194 + rank * 29 + col * 20;
        const y = H / 2 + (row - (rows - 1) / 2) * 44;
        this.addUnit(
          h,
          team,
          this.mode === "arena"
            ? team % 2 === 0
              ? 175 - rank * 20
              : W - 175 + rank * 20
            : x,
          this.mode === "arena"
            ? (team < 2 ? 105 : 350) + (i - (group.length - 1) / 2) * 33
            : y,
        );
      }),
    );
  }
  addUnit(hero, team, x, y, extra = {}) {
    const s = stats(hero),
      def = CLASSES[hero.classId];
    const u = {
      uid: ++this.serial,
      hero,
      team,
      originTeam: team,
      classId: combatClass(hero),
      name: hero.name,
      ...s,
      maxHp: s.hp,
      hp: Math.min(s.hp, hero.currentHp ?? s.hp),
      stamina: s.maxStamina,
      mana: s.maxMana,
      x,
      y,
      r: Math.max(6, Math.min(24, 12 * characterSize(hero)[1])),
      creature: hero.creature,
      vx: 0,
      vy: 0,
      facing: team === 0 ? 1 : -1,
      shield: 0,
      attackAt: this.time + 0.25 + this.random() * 0.7,
      abilityAt: this.time + 1.8 + this.random() * 2,
      schoolAt: this.time + 5,
      scrollAt: {},
      learnedAt: (hero.fusion || []).map((_, i) => this.time + 7 + i * 2),
      extraAt: this.time + 7,
      targetAt: 0,
      pathAt: 0,
      path: [],
      dead: false,
      stealthUntil: 0,
      slowUntil: 0,
      buffUntil: 0,
      swingUntil: 0,
      hitUntil: 0,
      expires: Infinity,
      buildCount: 0,
      damage: 0,
      healed: 0,
      ...extra,
    };
    this.units.push(u);
    return u;
  }
  enemies(team) {
    return this.units.filter((u) => !u.dead && u.team !== team);
  }
  addCompanion(owner) {
    if (PETS[owner.hero.companion.key].mode === "mount") {
      owner.mounted = true;
      return null;
    }
    const pet = owner.hero.companion,
      def = PETS[pet.key],
      mods = petInfo(pet),
      power =
        (1 + pet.level * 0.04) *
        (1 + itemRarity(pet) * 0.2) *
        (owner.hero.petBuff || 1) *
        (1 + (pet.evolution || 0) * 0.4);
    return this.addUnit(owner.hero, owner.team, owner.x - 18, owner.y + 22, {
      name: def.name,
      pet: true,
      summon: true,
      petKey: pet.key,
      owner: owner.uid,
      classId: "vanguard",
      r: 7,
      maxHp: 40 * power + (mods.vitality || 0) * 10,
      hp: 40 * power + (mods.vitality || 0) * 10,
      attack: 4 * power + (mods.strength || 0) * 1.4 + (mods.attack || 0),
      armor: mods.armor || 0,
      speed: 90 + (mods.speed || 0) + (mods.agility || 0) * 2.2,
      range: (pet.key === "beetle" ? 140 : 30) + (mods.range || 0),
      ranged: pet.key === "beetle",
      rate: 2,
      petPower: power,
      abilityAt: Infinity,
      extraAt: Infinity,
      regen: 0,
      regenSelf: 0,
      flying: pet.key === "sprite" || pet.key === "mote" || !!mods.flying,
      mana: 48,
      maxMana: 48,
      petSpell: mods.spell,
      petSpellCooldown: mods.spellCooldown,
      petSpellPower: mods.spellPower,
      petSpellName: mods.enchantment ? mods.name : null,
      petCastAt: 5,
      slow: !!mods.slow,
      element: mods.element,
      scatter: mods.scatter || 1,
      chain: !!mods.chain,
      knock: mods.knock || 0,
      splash: mods.splash || 0,
      actionAt: 0,
    });
  }
  updateCompanion(u, dt) {
    const owner = this.units.find((a) => a.uid === u.owner);
    if (!owner || owner.dead) {
      u.dead = true;
      return;
    }
    u.team = owner.team;
    u.moving = false;
    if (u.petSpell && this.time >= u.petCastAt && u.mana >= 16) {
      u.mana -= 16;
      if (
        this.cast(u, u.petSpell === "heal" ? "healer" : "mage", false, {
          scroll: true,
          facetKey: "pet:" + u.hero.companion.id,
          specialization: u.petSpell,
          label: u.petSpellName,
          power: u.petSpellPower || 1,
        })
      )
        u.petCastAt = this.time + u.petSpellCooldown;
      else u.mana += 16;
    }
    const def = PETS[u.petKey],
      foe =
        def.mode === "attack"
          ? this.enemies(u.team)
              .filter((e) => distance(owner, e) < 145)
              .sort((a, b) => distance(u, a) - distance(u, b))[0]
          : null;
    if (foe && distance(u, owner) < 170 && distance(u, foe) > u.range + 10)
      this.move(u, foe, dt);
    else if (distance(u, owner) > 40 && !foe)
      this.move(u, { x: owner.x - 20 * owner.facing, y: owner.y + 18 }, dt);
    if (this.time < u.actionAt) return;
    u.actionAt = this.time + (def.mode === "heal" ? 6 : 3.5);
    if (def.mode === "heal") {
      this.heal(owner, 6 * u.petPower, u);
      this.effect("beam", u.x, u.y - 8, "#dcd9a5", 0, owner.x, owner.y - 20);
    } else if (def.mode === "shield") {
      owner.shield = Math.min(65, owner.shield + 8 * u.petPower);
      this.effect("ring", owner.x, owner.y, "#c7b9df", 20);
    } else if (foe && distance(u, foe) < u.range + 20) this.attack(u, foe);
  }
  deathBurst(u) {
    if (u.structure || u.pet) return;
    this.decals.push({
      x: u.x,
      y: u.y,
      r: 14 + this.random() * 9,
      type: "blood",
    });
    for (let i = 0; i < 7; i++) {
      const angle = this.random() * Math.PI * 2,
        speed = 35 + this.random() * 95;
      this.debris.push({
        x: u.x,
        y: u.y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        z: 10,
        vz: 50 + this.random() * 70,
        kind: i < 3 ? "limb" : "blood",
        color: i < 3 ? CLASSES[u.classId].color : "#963b3e",
        r: 2 + this.random() * 3,
      });
    }
    if (this.decals.length > 150) this.decals.shift();
  }
  ignite(x, y, owner) {
    if (this.fires.some((f) => Math.hypot(f.x - x, f.y - y) < 30)) return;
    this.fires.push({
      x,
      y,
      r: 30 + this.random() * 10,
      life: 10,
      ownerId: owner?.uid,
    });
    this.decals.push({ x, y, r: 35, type: "scorch" });
    for (const p of this.props)
      if (!p.dead && distance(p, { x, y }) < 65) p.burning = 8;
  }
  hitProps(x, y, r, amount, owner) {
    for (const p of this.props)
      if (!p.dead && distance(p, { x, y }) < r + p.r) {
        const d = Math.max(1, distance(p, { x, y }));
        p.vx += ((p.x - x) / d) * 70;
        p.vy += ((p.y - y) / d) * 70;
        this.damageProp(p, amount, owner);
      }
  }
  damageProp(p, amount, owner) {
    if (p.dead) return;
    p.hp -= amount;
    if (p.hp > 0) return;
    p.dead = true;
    this.decals.push({ x: p.x, y: p.y, r: 17, type: "wood" });
    if (p.kind === "barrel") {
      this.effect("explosion", p.x, p.y, "#e5a153", 65);
      this.ignite(p.x, p.y, owner);
      for (const u of this.units)
        if (!u.dead && distance(u, p) < 70) this.hurt(u, 16, owner, 80, true);
    }
    for (let i = 0; i < 5; i++)
      this.debris.push({
        x: p.x,
        y: p.y,
        vx: (this.random() - 0.5) * 100,
        vy: (this.random() - 0.5) * 100,
        z: 5,
        vz: 55,
        kind: "wood",
        color: "#a48159",
        r: 3,
      });
  }
  updateEnvironment(dt) {
    if (
      this.mode === "arena" &&
      this.hazards &&
      !this.hazardsAdded &&
      this.time > 35
    ) {
      this.hazardsAdded = true;
      for (const [i, kind] of ["lion", "chariot"].entries()) {
        const h = generateHero(
          {
            id: "hazard-" + this.map.seed + "-" + i,
            name: kind === "lion" ? "Arena lion" : "Arena chariot",
            race: kind === "lion" ? "Orc" : "Automaton",
            classId: kind === "lion" ? "vanguard" : "artillery",
            level: 4,
            uncharmable: true,
          },
          this.random,
        );
        this.addUnit(h, 4, 600, i ? 440 : 40, {
          hazard: kind,
          name: h.name,
          speed: kind === "lion" ? 88 : 65,
          attack: kind === "lion" ? 14 : 18,
          maxHp: 150,
          hp: 150,
          r: kind === "lion" ? 14 : 20,
          abilityAt: Infinity,
          extraAt: Infinity,
          schoolAt: Infinity,
        });
      }
      this.event("The gates open: a lion and a chariot enter!", 4, "skull");
    }
    for (const p of this.props) {
      if (p.dead) continue;
      for (const u of this.units) {
        if (u.dead || u.flying || u.structure) continue;
        const d = distance(p, u),
          min = p.r + u.r;
        if (d < min) {
          const dx = (p.x - u.x) / (d || 1),
            dy = (p.y - u.y) / (d || 1);
          p.vx += dx * (min - d) * 7;
          p.vy += dy * (min - d) * 7;
          if (Math.hypot(u.vx, u.vy) > 40) this.damageProp(p, dt * 12, u);
        }
      }
      const nx = clamp(p.x + p.vx * dt, 25, W - 25),
        ny = clamp(p.y + p.vy * dt, 25, H - 25);
      if (!this.map.blocked(nx, ny, p.r)) {
        p.x = nx;
        p.y = ny;
      } else {
        p.vx *= -0.2;
        p.vy *= -0.2;
      }
      p.vx *= Math.exp(-4 * dt);
      p.vy *= Math.exp(-4 * dt);
      if (p.burning > 0) {
        p.burning -= dt;
        this.damageProp(p, 5 * dt, null);
      }
    }
    for (const f of this.fires) {
      f.life -= dt;
      const owner = this.units.find((u) => u.uid === f.ownerId);
      for (const u of this.units)
        if (!u.dead && !u.flying && distance(u, f) < f.r)
          this.hurt(u, 3 * dt, owner, 0, true);
    }
    if (this.time >= this.environmentAt) {
      this.environmentAt = this.time + 1;
      for (const p of this.props.filter((p) => !p.dead && p.burning > 0)) {
        for (const q of this.props)
          if (q !== p && !q.dead && distance(q, p) < 65) q.burning = 8;
        this.ignite(p.x, p.y, null);
      }
    }
    this.fires = this.fires.filter((f) => f.life > 0);
    for (const d of this.debris) {
      if (d.z > 0) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vz -= 220 * dt;
        d.z = Math.max(0, d.z + d.vz * dt);
      } else {
        d.vx = 0;
        d.vy = 0;
      }
    }
    if (this.debris.length > 180)
      this.debris.splice(0, this.debris.length - 180);
    if (this.decals.length > 180)
      this.decals.splice(0, this.decals.length - 180);
  }
  alive(team, includeBuilds = true) {
    return this.units.filter(
      (u) => !u.dead && u.team === team && (includeBuilds || !u.structure),
    );
  }
  event(text, team = 0, icon = "spark") {
    this.events.unshift({ text, time: this.time, team, icon });
    if (this.events.length > 35) this.events.pop();
  }
  float(u, text, color = "#fff2c9") {
    this.floats.push({
      x: u.x + (this.random() - 0.5) * 12,
      y: u.y - 22,
      text: String(text),
      color,
      life: 1.1,
      max: 1.1,
    });
  }
  effect(type, x, y, color, r = 25, x2 = 0, y2 = 0) {
    this.effects.push({
      type,
      x,
      y,
      x2,
      y2,
      color,
      r,
      life: type === "beam" ? 0.3 : 0.55,
      max: type === "beam" ? 0.3 : 0.55,
    });
  }
  visible(a, b) {
    if (!canSee(this, a, b)) return false;
    if (a.flying || b.flying || a.classId === "artillery") return true;
    const d = distance(a, b);
    for (let s = 16; s < d - 10; s += 16) {
      const x = a.x + ((b.x - a.x) * s) / d,
        y = a.y + ((b.y - a.y) * s) / d;
      if (
        this.map.objects.some(
          (o) =>
            (["tree", "rock"].includes(o.type) &&
              Math.hypot(x - o.x, y - o.y) < o.r) ||
            (["house", "ruin"].includes(o.type) &&
              x > o.x &&
              x < o.x + o.w &&
              y > o.y &&
              y < o.y + o.h),
        )
      )
        return false;
    }
    return true;
  }
  effectiveRange(u) {
    return (
      u.range *
      (this.map.grass?.some((g) => distance(u, g) < g.r) && !u.flying
        ? this.supplies.includes("lantern")
          ? 0.825
          : 0.65
        : 1)
    );
  }
  pickTarget(u) {
    let candidates = this.enemies(u.team).filter(
      (e) =>
        e.stealthUntil <= this.time &&
        canSee(this, u, e) &&
        (!e.flying || u.ranged || u.flying),
    );
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      const score = (e) =>
        distance(u, e) -
        (u.classId === "assassin" && !e.structure
          ? CLASSES[e.classId].rank * 105
          : 0) +
        (e.structure ? 65 : 0) -
        (e.classId === "guardian" && distance(u, e) < 120 ? 30 : 0);
      return score(a) - score(b);
    });
    return candidates[0];
  }
  hurt(target, damage, source, knock = 0, magic = false) {
    if (target.dead) return;
    if (!magic && this.random() < target.dodge) {
      this.float(target, "evade", "#ced0ee");
      return;
    }
    let amount = magic
      ? damage * (35 / (35 + target.armor))
      : Math.max(damage >= 1 ? 1 : 0, damage - target.armor);
    amount *= 0.62 * (source?.hero.bonus?.damageScale || 1);
    if (
      !magic &&
      source?.ranged &&
      this.map.bushes.some((b) => distance(target, b) < b.r)
    )
      amount *= 0.8;
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, amount);
      target.shield -= absorbed;
      amount -= absorbed;
      this.effect("ring", target.x, target.y, "#accce8", 20);
    }
    // Script only the first two learning encounters; max HP and owned stats stay intact.
    if (
      this.tutorialOutcome &&
      target.team === (this.tutorialOutcome === "victory" ? 0 : 1)
    )
      amount = Math.min(amount, Math.max(0, target.hp - 1));
    target.hp -= amount;
    target.hitUntil = this.time + 0.16;
    if (source && hasAttribute(source.hero, "Vampire") && !source.dead)
      this.heal(
        source,
        amount *
          0.06 *
          facetScale(source.hero.attributes.find((a) => a.key === "Vampire")),
        null,
      );
    if (source) {
      source.damage += amount;
      this.damageDone[source.hero.id] =
        (this.damageDone[source.hero.id] || 0) + amount;
      if (source.slow) {
        target.slowUntil = this.time + (source.slowDuration || 2);
      }
    }
    if (amount >= 1) this.float(target, Math.round(amount), "#ffe2bf");
    if (knock && source && !target.structure) {
      const d = Math.max(1, distance(target, source)),
        force = (knock * (source.force || 1)) / target.mass;
      target.vx += ((target.x - source.x) / d) * force;
      target.vy += ((target.y - source.y) / d) * force;
    }
    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
      if (
        target.originTeam !== 0 &&
        !target.structure &&
        !target.summon &&
        !target.converted &&
        this.onDefeat
      )
        this.onDefeat(target.hero);
      if (source && source.team === 0 && !target.structure && !target.summon) {
        const owner =
          source.structure || source.summon
            ? this.units.find((a) => a.uid === source.owner)
            : source;
        if (owner && !owner.dead) this.awardXp(owner, 6 + target.hero.level);
      }
      this.deathBurst(target);
      this.effect(
        "burst",
        target.x,
        target.y,
        target.team === 0 ? "#bdc991" : "#dca886",
        24,
      );
    }
  }
  heal(target, amount, source) {
    if (target.dead) return;
    const actual = Math.min(
      target.maxHp - target.hp,
      amount *
        0.35 *
        Math.min(2.5, source?.healing || 1) *
        Math.max(0, 1 - Math.max(0, this.time - 75) / 105),
    );
    if (actual <= 0) return;
    target.hp += actual;
    if (source) {
      source.healed += actual;
      this.healingDone[source.hero.id] =
        (this.healingDone[source.hero.id] || 0) + actual;
    }
    if (actual > 3) this.float(target, "+" + Math.round(actual), "#b8edaf");
  }
  damageMultiplier(u) {
    let multi = 1;
    if (u.buffUntil > this.time) multi += 0.15;
    if (
      this.zones.some(
        (z) =>
          z.type === "blessing" && z.team === u.team && distance(u, z) < z.r,
      )
    )
      multi += 0.18;
    if (
      this.zones.some(
        (z) => z.type === "curse" && z.team !== u.team && distance(u, z) < z.r,
      )
    )
      multi *= 0.75;
    if (this.time > 130) multi *= 1 + (this.time - 130) * 0.018;
    return multi;
  }
  shoot(u, target, opts = {}) {
    opts = Object.fromEntries(
      Object.entries(opts).filter(([, value]) => value !== undefined),
    );
    this.projectiles.push({
      x: u.x,
      y: u.y - 9,
      startX: u.x,
      startY: u.y - 9,
      target,
      owner: u,
      team: u.team,
      speed: opts.speed || 270,
      damage: opts.damage || u.attack * this.damageMultiplier(u),
      type:
        opts.type ||
        (u.classId === "ranger"
          ? "arrow"
          : u.classId === "artillery"
            ? "shell"
            : u.element === "fire" ||
                (u.classId === "mage" && u.hero.specialization === "ember")
              ? "fire"
              : "bolt"),
      r: opts.r || u.splash || 0,
      knock: opts.knock || u.knock || 0,
      color: CLASSES[u.classId].color,
      ...opts,
    });
  }
  attack(u, target) {
    u.swingUntil = this.time + 0.3;
    if (u.element === "fire" && !u.ranged) this.ignite(target.x, target.y, u);
    if (u.ranged) {
      const weapon = u.hero.items.find((i) => i && ITEMS[i.key].weaponKind),
        kind = weapon ? ITEMS[weapon.key].weaponKind : null,
        type =
          u.element === "fire"
            ? "fire"
            : kind === "artillery"
              ? "shell"
              : ["sidearm", "longarm"].includes(kind)
                ? "bullet"
                : ["bow", "crossbow"].includes(kind)
                  ? "arrow"
                  : undefined,
        targets = [
          target,
          ...this.enemies(u.team).filter(
            (e) => e !== target && distance(e, target) < 100,
          ),
        ].slice(0, u.scatter || 1);
      for (const t of targets)
        this.shoot(u, t, {
          type,
          damage:
            u.attack *
            this.damageMultiplier(u) *
            (targets.length > 1 ? 0.65 : 1),
          r: kind === "artillery" ? 48 : u.splash,
          knock: kind === "artillery" ? 75 : u.knock,
          color:
            u.element === "frost"
              ? "#98d6e0"
              : u.element === "storm"
                ? "#b5a2e0"
                : u.element === "gravity"
                  ? "#a294ca"
                  : undefined,
        });
    } else {
      this.hurt(target, u.attack * this.damageMultiplier(u), u, 18 + u.knock);
      this.effect("slash", target.x, target.y, CLASSES[u.classId].color, 25);
      if (u.splash)
        this.enemies(u.team)
          .filter((e) => e !== target && distance(e, target) < u.splash)
          .forEach((e) => this.hurt(e, u.attack * 0.45, u));
    }
    if (u.chain) {
      const next = this.enemies(u.team).find(
        (e) => e !== target && distance(e, target) < 95,
      );
      if (next) {
        this.hurt(next, u.attack * 0.4, u, 0, true);
        this.effect("beam", target.x, target.y, "#b6a2e2", 0, next.x, next.y);
      }
    }
    if (u.element === "gravity" && this.random() < 0.25)
      this.zones.push({
        x: target.x,
        y: target.y,
        r: 55,
        type: "curse",
        element: "gravity",
        team: u.team,
        life: 1.2,
        power: 1.5,
        owner: u,
      });
    u.attackAt =
      this.time +
      u.rate *
        (u.buffUntil > this.time ? 0.72 : 1) *
        (hasAttribute(u.hero, "Werewolf") && u.hp < u.maxHp * 0.5 ? 0.8 : 1);
  }
  cast(u, classId = u.classId, secondary = false, echo = null) {
    const manaCost = echo?.scroll
      ? 16
      : classId === "healer"
        ? 16
        : CLASSES[classId].magical
          ? 12
          : 6;
    if (!u.structure && !u.summon && (u.mana ?? 0) < manaCost) return false;
    const enemy = this.pickTarget(u),
      def = CLASSES[classId],
      facetKey =
        echo?.facetKey ||
        (secondary ? "learned:" + echo.classId : "class:" + u.hero.classId),
      multi =
        abilityScale(u.hero, facetKey) *
        (secondary ? 0.6 : 1) *
        (echo?.power || 1) *
        (u.power || 1) *
        (1 + u.hero.level * 0.012),
      allies = this.alive(u.team).filter((a) => distance(u, a) < 150);
    if (
      !enemy &&
      !["guardian", "healer", "bard", "engineer", "summoner"].includes(classId)
    )
      return false;
    if (!u.structure && !u.summon) u.mana -= manaCost;
    if (!u.structure && !u.summon && !echo?.scroll) {
      u.hero.skills[facetKey] ||= makeFacet(facetKey);
      gainFacetXp(u.hero.skills[facetKey], 2);
    }
    this.event(
      `${u.name} · ${echo?.label || (secondary ? "learned: " + def.ability : abilityName(u.hero))}`,
      u.team,
      def.icon,
    );
    this.effect("spark", u.x, u.y, def.color, 22);
    if (u.creature === "dragon") {
      this.ignite(enemy.x, enemy.y, u);
      this.zones.push({
        x: enemy.x,
        y: enemy.y,
        r: 130,
        type: "curse",
        element: "ember",
        team: u.team,
        life: 4,
        power: 14 * multi,
        owner: u,
      });
      this.effect("beam", u.x, u.y - 25, "#e89a57", 0, enemy.x, enemy.y - 12);
    } else if (
      !secondary &&
      !echo?.scroll &&
      this.specializedCast(u, multi, enemy, allies)
    ) {
    } else if (classId === "vanguard" && u.hero.classPath === "duelist") {
      this.hurt(enemy, 55 * multi, u, 25);
      this.effect("slash", enemy.x, enemy.y, "#e5d69d", 35);
      u.attackAt = this.time + 0.1;
    } else if (classId === "vanguard") {
      this.enemies(u.team)
        .filter((e) => !e.flying && distance(u, e) < 83 * u.zoneScale)
        .forEach((e) =>
          this.hurt(e, 32 * multi * this.damageMultiplier(u), u, 150),
        );
      this.hitProps(u.x, u.y, 83, 25, u);
      this.effect("explosion", u.x, u.y, "#e8c884", 83);
    } else if (classId === "guardian" && u.hero.classPath === "bulwark") {
      u.shield = Math.min(280, u.shield + 100 * multi * u.shieldScale);
      this.effect("ring", u.x, u.y, "#cfdfcf", 35);
    } else if (classId === "guardian") {
      allies.forEach((a) => {
        a.shield = Math.min(
          120 + u.endurance * 2,
          a.shield + 42 * multi * u.shieldScale,
        );
      });
    } else if (classId === "ranger" && u.hero.classPath === "deadeye") {
      this.shoot(u, enemy, {
        damage: 60 * multi,
        type: "arrow",
        speed: 430,
        knock: 50,
      });
    } else if (classId === "ranger") {
      this.enemies(u.team)
        .filter(
          (e) => e.stealthUntil <= this.time && distance(u, e) < u.range + 100,
        )
        .sort((a, b) => distance(u, a) - distance(u, b))
        .slice(0, 3)
        .forEach((e) =>
          this.shoot(u, e, { damage: 22 * multi, type: "arrow" }),
        );
    } else if (classId === "healer" && u.hero.classPath === "protector") {
      const injured =
        this.alive(u.team).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ||
        u;
      injured.shield = Math.min(180, injured.shield + 65 * multi);
      this.heal(injured, 10 * multi, u);
    } else if (classId === "healer") {
      let injured =
        this.alive(u.team).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ||
        u;
      this.zones.push({
        x: injured.x,
        y: injured.y,
        r: 110 * u.zoneScale,
        type: "blessing",
        team: u.team,
        life: 4,
        power: 4 * multi,
        owner: u,
      });
    } else if (classId === "engineer" && u.hero.classPath === "siege") {
      this.shoot(u, enemy, {
        damage: 42 * multi,
        type: "shell",
        r: 90,
        knock: 130,
      });
    } else if (classId === "engineer") {
      if (
        this.alive(u.team).filter(
          (a) => a.kind === "turret" && a.owner === u.uid,
        ).length < (u.hero.classPath === "machinist" ? 3 : 2)
      ) {
        const side = u.team === 0 ? 1 : -1;
        let p = this.safePoint(u.x + side * 38, u.y - 30, u.flying);
        const turret = this.addUnit(u.hero, u.team, p.x, p.y, {
          name: "Turret",
          structure: true,
          kind: "turret",
          owner: u.uid,
          maxHp: 70 * multi,
          hp: 70 * multi,
          attack: 11 * multi,
          range: 225,
          rate: 1.3,
          ranged: true,
          speed: 0,
          r: 11,
          armor: 2,
          expires: this.time + 30,
          abilityAt: Infinity,
          extraAt: Infinity,
          regen: 0,
          flying: false,
          damage: 0,
          healed: 0,
        });
        p = this.safePoint(u.x + side * 68, u.y + 18, false);
        this.addUnit(u.hero, u.team, p.x, p.y, {
          name: "Barricade",
          structure: true,
          kind: "wall",
          owner: u.uid,
          maxHp: 100 * multi,
          hp: 100 * multi,
          attack: 0,
          speed: 0,
          r: 17,
          range: 0,
          expires: this.time + 28,
          abilityAt: Infinity,
          extraAt: Infinity,
          regen: 0,
          flying: false,
        });
        this.effect("build", turret.x, turret.y, "#e1bb82", 30);
      }
    } else if (classId === "assassin") {
      const p = this.safePoint(
        enemy.x + (u.team === 0 ? 29 : -29),
        enemy.y + 23,
        u.flying,
      );
      this.effect("burst", u.x, u.y, "#c9b4e8", 30);
      u.x = p.x;
      u.y = p.y;
      u.path = [];
      u.pathAt = 0;
      u.target = enemy;
      u.stealthUntil = this.time + (u.hero.classPath === "phantom" ? 5 : 2);
      if (u.hero.classPath === "phantom") u.shield += 35 * multi;
      this.hurt(
        enemy,
        (u.hero.classPath === "night"
          ? 45 * (enemy.hp < enemy.maxHp * 0.5 ? 1.5 : 1)
          : 29) * multi,
        u,
        20,
      );
      this.effect("burst", u.x, u.y, "#c9b4e8", 35);
    } else if (classId === "summoner") {
      const count = this.alive(u.team).filter(
        (a) => a.summon && a.owner === u.uid,
      ).length;
      for (
        let i = 0;
        i <
        Math.min(
          u.hero.classPath === "grove" ? 1 : u.summonCount || 2,
          6 - count,
        );
        i++
      ) {
        const p = this.safePoint(
          u.x + (u.team === 0 ? 35 : -35),
          u.y + (i ? 30 : -30),
          false,
        );
        this.addUnit(u.hero, u.team, p.x, p.y, {
          name: u.hero.classPath === "grove" ? "Grove spirit" : "Spirit wolf",
          classId: "vanguard",
          summon: true,
          owner: u.uid,
          maxHp: 58 * multi * (u.hero.classPath === "grove" ? 3 : 1),
          hp: 58 * multi * (u.hero.classPath === "grove" ? 3 : 1),
          attack: 11 * multi,
          speed: u.hero.classPath === "grove" ? 40 : 82,
          range: 26,
          rate: 0.9,
          ranged: false,
          armor: 1,
          r: 9,
          expires: this.time + 20,
          abilityAt: Infinity,
          extraAt: Infinity,
          regen: 0,
          flying: false,
        });
        this.effect("burst", p.x, p.y, "#bcd9a6", 25);
      }
    } else if (classId === "mage") {
      const specialization = echo?.useBase
        ? CLASSES[u.hero.classId].innateElement || "arcane"
        : echo?.specialization ||
          u.hero.classPath ||
          u.hero.specialization ||
          CLASSES[u.hero.classId].innateElement ||
          "arcane";
      if (specialization === "ember") this.ignite(enemy.x, enemy.y, u);
      this.zones.push({
        x: enemy.x,
        y: enemy.y,
        r: (specialization === "gravity" ? 118 : 96) * u.zoneScale,
        type: "curse",
        element: specialization,
        team: u.team,
        life: specialization === "gravity" ? 6 : 5,
        power:
          (specialization === "gravity"
            ? 4 + u.mind * 0.2
            : 7 + u.mind * 0.35) * multi,
        owner: u,
      });
    } else if (classId === "bard") {
      const candidate = this.enemies(u.team)
        .filter(
          (e) =>
            !e.hero.uncharmable &&
            !e.hero.boss &&
            !e.structure &&
            !e.summon &&
            !e.converted &&
            e.hp / e.maxHp < (u.charmThreshold || 0.55) &&
            distance(u, e) < u.range + 75 &&
            u.mind * multi >= e.mind * 0.5,
        )
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (
        candidate &&
        u.team === 0 &&
        !["arena", "challenge"].includes(this.mode) &&
        this.converted.length < this.recruitLimit
      )
        this.convert(candidate, u);
      else {
        allies.forEach((a) => {
          this.heal(a, 5 * multi, u);
          a.buffUntil = this.time + 4;
        });
        if (enemy) this.shoot(u, enemy, { damage: 8 * multi, type: "bolt" });
      }
    } else if (classId === "witch")
      this.zones.push({
        x: enemy.x,
        y: enemy.y,
        r: 112,
        element: "hex",
        type: "curse",
        team: u.team,
        life: 7,
        power: 4 * multi,
        owner: u,
      });
    else if (classId === "envoy") {
      const threshold = echo?.useBase
        ? 0.45
        : u.hero.classPath === "heartbinder"
          ? 0.65
          : Math.max(0.45, (u.charmThreshold || 0.55) - 0.1);
      const candidate = this.enemies(u.team)
        .filter(
          (e) =>
            e.originTeam === 1 &&
            !e.structure &&
            !e.summon &&
            !e.hero.boss &&
            !e.hero.uncharmable &&
            !e.converted &&
            e.stealthUntil <= this.time &&
            e.hp / e.maxHp <= threshold &&
            distance(u, e) < u.range + 60 &&
            u.mind >= e.mind * 0.65,
        )
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (
        candidate &&
        u.team === 0 &&
        !["arena", "challenge"].includes(this.mode) &&
        this.converted.length < this.recruitLimit
      )
        this.convert(candidate, u);
      else
        this.shoot(u, enemy, {
          damage: (8 + u.mind * 0.4) * multi,
          type: "bolt",
        });
    } else if (classId === "minelayer") {
      this.enemies(u.team)
        .filter(
          (a) => distance(a, enemy) < (u.hero.classPath === "adept" ? 115 : 85),
        )
        .forEach((a) => this.hurt(a, (28 + u.strength * 0.7) * multi, u, 100));
      this.hitProps(enemy.x, enemy.y, 85, 45, u);
      this.effect("explosion", enemy.x, enemy.y, "#ffae44", 85);
    } else if (classId === "artillery")
      this.shoot(u, enemy, {
        damage: 48 * multi,
        type: "shell",
        r: 74,
        knock: 190,
        speed: 205,
      });
    else if (classId === "stormcaller") {
      const hits = this.enemies(u.team)
        .filter((e) => e.stealthUntil <= this.time && distance(enemy, e) < 180)
        .sort((a, b) => distance(u, a) - distance(u, b))
        .slice(0, 4);
      let previous = u;
      for (const e of hits) {
        this.hurt(e, 22 * multi, u, 12, true);
        this.effect(
          "beam",
          previous.x,
          previous.y - 12,
          "#c0ebff",
          0,
          e.x,
          e.y - 12,
        );
        previous = e;
      }
    }
    return true;
  }
  specializedCast(u, power, enemy, allies) {
    const id = u.hero.classId,
      path = u.hero.classPath;
    if (!path) return false;
    const around = (r) =>
      this.enemies(u.team).filter((e) => distance(u, e) < r);
    const shield = (targets, amount) =>
      targets.forEach(
        (a) =>
          (a.shield = Math.min(240, a.shield + amount * power * u.shieldScale)),
      );
    const summon = (count, durable) => {
      const existing = this.alive(u.team).filter(
        (a) => a.summon && a.owner === u.uid && !a.pet,
      ).length;
      for (let i = 0; i < Math.min(count, 6 - existing); i++) {
        const p = this.safePoint(
          u.x + (u.team === 0 ? 38 : -38),
          u.y + (i - count / 2) * 24,
          false,
        );
        this.addUnit(u.hero, u.team, p.x, p.y, {
          name: durable ? "Vine / wraith guardian" : "Restless echo",
          classId: "vanguard",
          summon: true,
          owner: u.uid,
          maxHp: (durable ? 180 : 40) * power,
          hp: (durable ? 180 : 40) * power,
          attack: (durable ? 18 : 10) * power,
          speed: durable ? 42 : 80,
          range: 28,
          rate: 1.4,
          ranged: false,
          armor: durable ? 5 : 0,
          r: durable ? 16 : 8,
          expires: this.time + 24,
          abilityAt: Infinity,
          extraAt: Infinity,
          regen: 0,
          regenSelf: 0,
          flying: false,
        });
        this.effect("burst", p.x, p.y, "#b8c9a6", 25);
      }
    };
    if (id === "monk") {
      if (path === "keeper") {
        shield(allies, 45);
        this.effect("ring", u.x, u.y, "#e4d7a5", 115);
      } else {
        this.hurt(enemy, 65 * power, u, 200);
        this.effect("explosion", enemy.x, enemy.y, "#e7d393", 42);
      }
      return true;
    }
    if (id === "trapper") {
      if (path === "sentinel") {
        shield([u], 32);
        for (const e of around(135)) {
          e.slowUntil = this.time + 7;
          this.hurt(e, 18 * power, u);
        }
        this.effect("ring", u.x, u.y, "#abc190", 135);
      } else
        this.enemies(u.team)
          .filter((e) => distance(u, e) < u.range + 100)
          .sort((a, b) => distance(u, a) - distance(u, b))
          .slice(0, 5)
          .forEach((e) =>
            this.shoot(u, e, { damage: 28 * power, type: "arrow" }),
          );
      return true;
    }
    if (id === "minelayer" && path === "sentinel") {
      shield(allies, 28);
      for (const e of around(110)) this.hurt(e, 26 * power, u, 120);
      this.effect("explosion", u.x, u.y, "#e1bb7b", 110);
      return true;
    }
    if (id === "alchemist" && path === "sentinel") {
      const injured =
        this.alive(u.team).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ||
        u;
      shield([injured], 80);
      this.effect("ring", injured.x, injured.y, "#9cceb7", 48);
      return true;
    }
    if (id === "alchemist") {
      this.ignite(enemy.x, enemy.y, u);
      this.shoot(u, enemy, {
        damage: 42 * power,
        type: "shell",
        r: 90 * u.zoneScale,
        knock: 90,
      });
      return true;
    }
    if (id === "druid" && path === "sentinel") {
      summon(1, true);
      return true;
    }
    if (id === "druid") {
      const injured =
        this.alive(u.team).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ||
        u;
      this.zones.push(
        {
          x: injured.x,
          y: injured.y,
          r: 100 * u.zoneScale,
          type: "blessing",
          team: u.team,
          life: 4,
          power: 4 * power,
          owner: u,
        },
        {
          x: enemy.x,
          y: enemy.y,
          r: 80 * u.zoneScale,
          type: "curse",
          element: "thorn",
          team: u.team,
          life: 4,
          power: 5 * power,
          owner: u,
        },
      );
      return true;
    }
    if (id === "paladin") {
      shield(
        this.alive(u.team).filter(
          (a) => distance(u, a) < (path === "sentinel" ? 220 : 140),
        ),
        path === "sentinel" ? 68 : 32,
      );
      if (path === "adept") {
        for (const e of around(105)) this.hurt(e, 35 * power, u, 80);
        this.effect("explosion", u.x, u.y, "#ead598", 105);
      }
      return true;
    }
    if (id === "necromancer") {
      summon(
        path === "sentinel" ? 1 : Math.min(5, (u.summonCount || 2) + 1),
        path === "sentinel",
      );
      return true;
    }
    if (id === "psion" && path === "sentinel") {
      shield([u], 45);
      for (const e of around(180)) this.hurt(e, 18 * power, u, 280, true);
      this.effect("ring", u.x, u.y, "#b9aed4", 180);
      return true;
    }
    if (id === "psion") {
      this.zones.push({
        x: enemy.x,
        y: enemy.y,
        r: 145 * u.zoneScale,
        type: "curse",
        element: "gravity",
        team: u.team,
        life: 6,
        power: (6 + u.mind * 0.24) * power,
        owner: u,
      });
      return true;
    }
    if (id === "duelist" && path === "sentinel") {
      shield([u], 45);
      this.hurt(enemy, 58 * power, u, 45);
      this.effect("slash", enemy.x, enemy.y, "#dacf9d", 38);
      return true;
    }
    if (id === "bard" && path === "skald") {
      allies.forEach((a) => (a.buffUntil = this.time + 8));
      for (const e of around(130)) this.hurt(e, 28 * power, u, 65);
      this.effect("ring", u.x, u.y, "#e5c49b", 130);
      return true;
    }
    if (id === "artillery") {
      this.shoot(u, enemy, {
        damage: (path === "longshot" ? 78 : 45) * power,
        type: "shell",
        r: path === "longshot" ? 0 : 110 * u.zoneScale,
        knock: 190,
        speed: path === "longshot" ? 420 : 205,
      });
      return true;
    }
    return false;
  }
  awardXp(u, amount) {
    const gearLevels = u.hero.items
      .filter(Boolean)
      .map((i) => i.level)
      .join();
    if (gainXp(u.hero, amount)) this.levelUp(u);
    else if (
      gearLevels !==
      u.hero.items
        .filter(Boolean)
        .map((i) => i.level)
        .join()
    ) {
      const hp = u.hp,
        stamina = u.stamina,
        values = stats(u.hero);
      Object.assign(u, values);
      u.maxHp = values.hp;
      u.hp = Math.min(hp, u.maxHp);
      u.stamina = Math.min(stamina, u.maxStamina);
      this.float(u, "GEAR LEVEL", "#dfd3ae");
    }
  }
  levelUp(u) {
    const values = stats(u.hero);
    Object.assign(u, values);
    u.maxHp = values.hp;
    u.hp = values.hp;
    u.stamina = values.maxStamina;
    u.mana = Math.min(u.mana, values.maxMana);
    this.float(u, "LEVEL " + u.hero.level, "#fff6a7");
    this.effect("level", u.x, u.y, "#fff5a5", 36);
    this.event(
      `${u.name} reaches level ${u.hero.level} · fully healed`,
      u.team,
      "spark",
    );
  }
  convert(target, source) {
    if (
      target.dead ||
      target.hero.boss ||
      target.structure ||
      target.summon ||
      target.converted ||
      target.originTeam === 0 ||
      source.team !== 0 ||
      target.hero.uncharmable ||
      ["arena", "challenge"].includes(this.mode) ||
      this.converted.length >= this.recruitLimit
    )
      return false;
    target.team = 0;
    target.converted = true;
    target.target = null;
    target.path = [];
    target.targetAt = 0;
    target.hero.boss = false;
    this.converted.push(target);
    this.projectiles = this.projectiles.filter(
      (p) => p.target !== target && p.owner !== target,
    );
    this.zones.forEach((z) => {
      if (z.owner === target) z.team = 0;
    });
    this.units.forEach((a) => {
      if (a.target === target) {
        a.target = null;
        a.targetAt = 0;
      }
    });
    if (
      this.onConvert &&
      !this.onConvert({ ...structuredClone(target.hero), currentHp: target.hp })
    ) {
      target.team = target.originTeam;
      target.converted = false;
      this.converted.pop();
      return false;
    }
    this.effect("convert", target.x, target.y, "#ffe3a2", 40);
    this.float(target, "JOINS YOU", "#fff4bf");
    this.event(
      `${target.name} joins the journey · finish to recruit`,
      0,
      "heart",
    );
    return true;
  }
  safePoint(x, y, flying = false) {
    x = clamp(x, 25, W - 25);
    y = clamp(y, 25, H - 25);
    if (flying || !this.map.blocked(x, y, 13)) return { x, y };
    for (let radius = 24; radius < 220; radius += 18)
      for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
        const px = clamp(x + Math.cos(angle) * radius, 20, W - 20),
          py = clamp(y + Math.sin(angle) * radius, 20, H - 20);
        if (!this.map.blocked(px, py, 13)) return { x: px, y: py };
      }
    return { x: 160, y: H / 2 };
  }
  move(u, target, dt, retreat = false) {
    if (u.speed <= 0) return;
    let destination = target;
    if (retreat)
      destination = {
        x: u.x + (u.x - target.x) * 0.65,
        y: u.y + (u.y - target.y) * 0.65,
      };
    let dx = destination.x - u.x,
      dy = destination.y - u.y;
    if (!u.flying) {
      const walls = this.units.filter(
        (a) => !a.dead && a.kind === "wall" && a !== target,
      );
      if (this.time >= u.pathAt) {
        u.path = findPath(this.map, u, destination, walls);
        u.pathAt = this.time + 0.65 + this.random() * 0.2;
      }
      while (u.path.length && distance(u, u.path[0]) < 11) u.path.shift();
      if (u.path.length) {
        dx = u.path[0].x - u.x;
        dy = u.path[0].y - u.y;
      } else if (distance(u, destination) > 45) return;
    }
    const d = Math.hypot(dx, dy);
    if (d < 2) return;
    let speed = u.speed;
    if (u.lost) speed *= 0.6;
    if (hasAttribute(u.hero, "Werewolf") && u.hp < u.maxHp * 0.5) speed *= 1.2;
    if (u.slowUntil > this.time) speed *= 0.6;
    if (!u.flying && this.map.grass?.some((g) => distance(u, g) < g.r))
      speed *= 0.65;
    if (
      this.zones.some(
        (z) =>
          z.type === "curse" &&
          ["frost", "hex"].includes(z.element) &&
          z.team !== u.team &&
          distance(u, z) < z.r,
      )
    )
      speed *= 0.55;
    const step = Math.min(d, speed * dt),
      nx = u.x + (dx / d) * step,
      ny = u.y + (dy / d) * step;
    this.setPosition(u, nx, ny);
    u.facing = dx >= 0 ? 1 : -1;
    u.moving = true;
  }
  setPosition(u, x, y) {
    x = clamp(x, u.r + 4, W - u.r - 4);
    y = clamp(y, u.r + 4, H - u.r - 4);
    if (u.flying) {
      u.x = x;
      u.y = y;
      return;
    }
    const collision = (px, py) =>
      this.map.blocked(px, py, u.r) ||
      this.units.some(
        (a) =>
          !a.dead &&
          a.kind === "wall" &&
          a !== u &&
          distance(a, { x: px, y: py }) < a.r + u.r * 0.65,
      );
    if (!collision(x, y)) {
      u.x = x;
      u.y = y;
    } else if (!collision(x, u.y)) u.x = x;
    else if (!collision(u.x, y)) u.y = y;
  }
  update(dt) {
    if (this.result) return;
    dt = Math.min(0.06, dt);
    this.time += dt;
    this.updateEnvironment(dt);
    if (this.time >= this.nextSpeechAt) {
      const speakers = this.units.filter(
        (u) => !u.dead && !u.pet && !u.structure && !u.summon,
      );
      if (speakers.length) {
        const u = speakers[Math.floor(this.random() * speakers.length)];
        u.speech = dialogue(u.hero, "battle", Math.floor(this.random() * 1000));
        u.speechStarted = this.time;
        u.speechUntil = this.time + 3.4;
      }
      this.nextSpeechAt = this.time + 40 + this.random() * 70;
    }
    for (const u of this.units) {
      if (u.dead) continue;
      if (u.pet) {
        this.updateCompanion(u, dt);
        continue;
      }
      if (this.time > u.expires) {
        u.dead = true;
        continue;
      }
      u.moving = false;
      u.stamina = Math.min(
        u.maxStamina,
        u.stamina + (4 + u.endurance * 0.15) * dt,
      );
      if (u.vx || u.vy) {
        this.setPosition(u, u.x + u.vx * dt, u.y + u.vy * dt);
        u.vx *= Math.exp(-7 * dt);
        u.vy *= Math.exp(-7 * dt);
      }
      if (u.regenSelf > 0) this.heal(u, u.regenSelf * dt, u);
      if (u.regen > 0)
        this.alive(u.team)
          .filter((a) => distance(u, a) < 100)
          .forEach((a) => this.heal(a, u.regen * dt, u));
      if (u.kind === "wall") continue;
      if (
        this.time >= u.targetAt ||
        !u.target ||
        u.target.dead ||
        u.target.stealthUntil > this.time ||
        !canSee(this, u, u.target)
      ) {
        u.target = this.pickTarget(u);
        u.targetAt = this.time + 0.45;
      }
      const target = u.target;
      if (!target) {
        u.lost = !vision(u.hero).light && !vision(u.hero).nightVision;
        this.move(
          u,
          {
            x: u.team === 0 ? 1050 : 150,
            y: 240 + Math.sin(this.time * 0.35 + u.uid) * 75,
          },
          dt,
        );
        continue;
      }
      u.lost = false;
      const d = distance(u, target);
      if (
        (u.stamina >= 18 &&
          this.time >= u.abilityAt &&
          (u.ranged ? d < u.range + 110 : d < 100)) ||
        (u.stamina >= 18 &&
          this.time >= u.abilityAt &&
          [
            "guardian",
            "engineer",
            "summoner",
            "healer",
            "bard",
            "assassin",
          ].includes(u.classId))
      ) {
        if (
          this.cast(u, schoolCombatClass(u.hero), false, {
            specialization: u.hero.classPath || u.hero.specialization,
          })
        ) {
          u.stamina -= 18;
          u.abilityAt = this.time + u.cooldown;
        }
      }
      if (!u.structure && !u.summon) {
        u.scrollAt ||= {};
        for (const i of spellObjects(u.hero).filter(
          (i) => spellObjectInfo(i).spell,
        )) {
          if (this.time >= (u.scrollAt[i.id] ?? 6) && u.stamina >= 12) {
            const def = spellObjectInfo(i),
              key = "scroll:" + i.id;
            if (
              this.cast(u, def.spell === "heal" ? "healer" : "mage", false, {
                facetKey: key,
                scroll: true,
                specialization: def.spell,
                label: def.name,
                power:
                  (def.spellPower || 1) *
                  (1 + itemRarity(i) * 0.12 + (i.level - 1) * 0.02),
              })
            ) {
              u.stamina -= 12;
              u.scrollAt[i.id] =
                this.time +
                (def.spellCooldown || 13) / (1 + u.endurance * 0.008);
            }
          }
        }
        for (let i = 0; i < (u.hero.fusion || []).length; i++) {
          const learned = u.hero.fusion[i];
          if (this.time >= u.learnedAt[i] && u.stamina >= 10) {
            if (
              this.cast(u, combatClass(learned), true, {
                ...learned,
                useBase: true,
              })
            ) {
              u.stamina -= 10;
              u.learnedAt[i] =
                this.time + CLASSES[learned.classId].cooldown * 1.6;
            }
          }
        }
      }
      if (u.classId === "healer" && !u.structure) {
        const wounded = this.alive(u.team)
          .filter((a) => a.hp < a.maxHp - 5)
          .sort(
            (a, b) =>
              a.hp / a.maxHp +
              0.002 * distance(u, a) -
              (b.hp / b.maxHp + 0.002 * distance(u, b)),
          )[0];
        if (
          wounded &&
          u.mana >= 6 &&
          distance(u, wounded) < this.effectiveRange(u)
        ) {
          if (this.time >= u.attackAt) {
            u.mana -= 6;
            this.heal(wounded, 9 + u.attack * 0.12, u);
            this.effect(
              "beam",
              u.x,
              u.y - 12,
              "#ceeabc",
              0,
              wounded.x,
              wounded.y - 12,
            );
            u.attackAt = this.time + Math.max(3.5, u.rate * 2.4);
          }
          if (d < 70) this.move(u, target, dt, true);
          continue;
        }
      }
      if (d <= this.effectiveRange(u) + target.r && this.visible(u, target)) {
        if (this.time >= u.attackAt) this.attack(u, target);
        if (u.ranged && !u.structure && d < 75) this.move(u, target, dt, true);
      } else this.move(u, target, dt);
    }
    for (const trap of this.traps) {
      if (trap.triggered) continue;
      const victim = this.enemies(trap.team).find(
        (u) => !u.flying && !u.structure && distance(u, trap) < trap.r + u.r,
      );
      if (victim) {
        trap.triggered = true;
        const owner = this.units.find((u) => u.uid === trap.owner);
        if (trap.kind === "mine") {
          this.enemies(trap.team)
            .filter((u) => distance(u, trap) < 70)
            .forEach((u) => this.hurt(u, trap.power, owner, 110));
          this.effect("explosion", trap.x, trap.y, "#ffb34d", 70);
        } else {
          victim.slowUntil = this.time + 5;
          this.hurt(victim, trap.power, owner);
          this.effect("ring", trap.x, trap.y, "#48dded", 35);
        }
        this.event(
          trap.kind === "mine"
            ? "Blast mine detonates"
            : "Snare catches an opponent",
          trap.team,
          "gear",
        );
      }
    }
    // Overtime chips health until a real party is eliminated; no health-score loss.
    if (this.time > 230)
      for (const u of this.units.filter(
        (u) => !u.dead && !u.structure && !u.summon,
      ))
        this.hurt(
          u,
          u.maxHp * (0.025 + (this.time - 230) * 0.001) * dt,
          null,
          0,
          true,
        );
    const active = this.units.filter((u) => !u.dead);
    for (let i = 0; i < active.length; i++)
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i],
          b = active[j];
        if (a.flying !== b.flying) continue;
        const d = distance(a, b),
          minimum = a.r + b.r + 2;
        if (d < minimum) {
          let dx = (a.x - b.x) / (d || 1),
            dy = (a.y - b.y) / (d || 1);
          if (d < 0.01) {
            dx = 1;
            dy = 0.1;
          }
          const push = (minimum - d) * 0.5;
          if (!a.structure)
            this.setPosition(
              a,
              a.x + (dx * push) / (a.mass || 1),
              a.y + (dy * push) / (a.mass || 1),
            );
          if (!b.structure)
            this.setPosition(
              b,
              b.x - (dx * push) / (b.mass || 1),
              b.y - (dy * push) / (b.mass || 1),
            );
        }
      }
    for (const p of this.projectiles) {
      const target = p.target;
      const tx = target.x,
        ty = target.y - 9,
        dx = tx - p.x,
        dy = ty - p.y,
        d = Math.hypot(dx, dy),
        step = p.speed * dt;
      const end = d <= step;
      if (!end) {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
      }
      if (
        p.type !== "shell" &&
        this.map.grass?.some((g) => distance(p, g) < g.r)
      ) {
        p.speed *= Math.exp(-dt * 0.8);
        if (!p.grassTested) {
          p.grassTested = true;
          if (this.random() < 0.2) {
            p.done = true;
            this.effect("spark", p.x, p.y, "#91a96e", 8);
            continue;
          }
        }
      }
      const prop = this.props.find(
        (o) =>
          !o.dead &&
          Math.hypot(o.x - p.x, o.y - 7 - p.y) < o.r &&
          p.type !== "shell",
      );
      if (prop) {
        this.damageProp(prop, p.damage, p.owner);
        if (p.type === "fire") this.ignite(prop.x, prop.y, p.owner);
        p.done = true;
        continue;
      }
      let interceptor = null;
      if (p.type !== "shell")
        interceptor = this.enemies(p.team).find(
          (u) =>
            u !== target &&
            ((u.classId === "guardian" && u.shield > 0) || u.kind === "wall") &&
            u.stealthUntil <= this.time &&
            Math.hypot(u.x - p.x, u.y - 9 - p.y) < u.r + 9,
        );
      if (interceptor) {
        this.hurt(interceptor, p.damage * 0.8, p.owner, 0);
        this.float(interceptor, "block", "#bbd7e6");
        p.done = true;
      } else if (end) {
        if (p.type === "fire" || (p.owner.splash && p.owner.magical))
          this.ignite(tx, target.y, p.owner);
        if (p.r) this.hitProps(tx, target.y, p.r, p.damage, p.owner);
        if (p.r) {
          this.enemies(p.team)
            .filter((u) => Math.hypot(u.x - tx, u.y - target.y) <= p.r + u.r)
            .forEach((u) =>
              this.hurt(
                u,
                p.damage * (u === target ? 1 : 0.65),
                p.owner,
                p.knock,
                p.type === "fire",
              ),
            );
          this.effect(
            p.owner.magical ? "burst" : "explosion",
            tx,
            target.y,
            p.type === "shell" ? "#edc887" : "#efac79",
            p.r,
          );
        } else if (!target.dead && target.team !== p.team) {
          this.hurt(
            target,
            p.damage,
            p.owner,
            p.knock,
            p.owner.magical && (p.type === "bolt" || p.type === "fire"),
          );
          this.effect("hit", tx, target.y, p.color, 17);
        }
        p.done = true;
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
    for (const z of this.zones) {
      z.life -= dt;
      for (const u of active) {
        const dist = distance(u, z);
        if (dist > z.r) continue;
        if (z.type === "blessing" && u.team === z.team)
          this.heal(u, z.power * dt, z.owner);
        else if (z.team !== u.team && z.type === "curse") {
          this.hurt(u, z.power * dt, z.owner, 0, true);
          if (z.element === "gravity" && !u.structure && dist > 10) {
            u.vx += (((z.x - u.x) / dist) * 650 * dt) / u.mass;
            u.vy += (((z.y - u.y) / dist) * 650 * dt) / u.mass;
          }
          if (z.element === "frost") u.slowUntil = this.time + 0.4;
        }
      }
    }
    this.zones = this.zones.filter((z) => z.life > 0);
    this.effects = this.effects.filter((e) => (e.life -= dt) > 0);
    this.floats = this.floats.filter((e) => (e.life -= dt) > 0);
    // Damage over time is accumulated without hundreds of sub-point labels.
    if (this.floats.length > 90) this.floats.splice(0, this.floats.length - 90);
    if (this.time >= this.fogAt) {
      this.fogSeen = [...new Set([...this.fogSeen, ...fogCells(this)])];
      this.fogAt = this.time + 0.5;
    }
    if (this.tutorialOutcome && this.time >= 22) {
      const winningTeam = this.tutorialOutcome === "victory" ? 0 : 1;
      for (const u of this.units)
        if (u.team !== winningTeam && !u.dead) {
          u.hp = 0;
          u.dead = true;
          this.effect("burst", u.x, u.y, "#b697d2", 24);
        }
      this.event(
        winningTeam === 0
          ? "The clearing is safe. The first road is won."
          : "The darkness overwhelms Fernbridge. Fall back to the flame!",
        winningTeam,
        "flag",
      );
    }
    const living = (this.mode === "arena" ? [0, 1, 2, 3] : [0, 1]).map(
      (t) => this.alive(t, false).filter((u) => !u.summon).length,
    );
    if (living[0] === 0 || living.filter((n) => n > 0).length <= 1) {
      const winner =
        living[0] > 0
          ? 0
          : Math.max(
              1,
              living.findIndex((n) => n > 0),
            );
      this.result = {
        winner,
        time: this.time,
        survivors: living,
        damage: { ...this.damageDone },
        healing: { ...this.healingDone },
        heroes: this.units
          .filter((u) => u.originTeam === 0 && !u.summon && !u.structure)
          .map((u) => ({
            id: u.hero.id,
            hp: u.hp,
            level: u.hero.level,
            xp: u.hero.xp,
            totalXp: u.hero.totalXp,
            light: structuredClone(u.hero.light),
            items: structuredClone(u.hero.items),
            armor: structuredClone(u.hero.armor),
            talents: structuredClone(u.hero.talents),
            skills: structuredClone(u.hero.skills),
            attributes: structuredClone(u.hero.attributes),
            companion: structuredClone(u.hero.companion),
          })),
        converted: this.converted.map((u) => ({
          ...structuredClone(u.hero),
          currentHp: u.hp,
        })),
      };
      this.event(
        winner === 0
          ? "Encounter cleared. Rewards sent to Camp."
          : "The company returns safely to recover.",
        winner === 1 ? 1 : 0,
        "flag",
      );
    }
  }
}
