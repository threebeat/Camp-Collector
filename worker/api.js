import {
  GAME_SEASON,
  MYTHICAL_HEROES,
  MYTHICAL_WEAPONS,
  makeMythicalHero,
  COSMETICS,
  CLASSES,
  RACES,
  ITEMS,
  ATTRIBUTES,
  SCHOOLS,
  LINEAGES,
  PETS,
  CORE_STATS,
  EQUIPMENT_TYPES,
  MAX_ABILITIES,
  MAX_EQUIPMENT,
  generateHero,
  makeFacet,
  makeItem,
  makePet,
  stats,
  abilities,
  equipmentSlots,
  equipmentRestriction,
  itemRarity,
  companionSlots,
  TALENTS,
  armorSlots,
  armorRestriction,
  classTree,
  normalizeHero,
  validClassNodes,
  migrateClassNodes,
  rarity,
  WEAPON_MODIFIERS,
  modifierPool,
  modifierFits,
  validModifiers,
} from "../web/data.js";
import { Battle } from "../web/engine.js";
const reply = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
const bounded = (n, low, high, fallback = low) =>
  Number.isFinite(n) ? Math.max(low, Math.min(high, Math.floor(n))) : fallback;
const safeText = (v, max = 36) =>
  String(v || "")
    .trim()
    .replace(/[\x00-\x1f]/g, "")
    .slice(0, max);
export function cleanItem(raw) {
  if (!raw || !ITEMS[raw.key]) return null;
  const level = bounded(raw.level, 1, 100),
    evolution =
      ITEMS[raw.key].weaponKind || ITEMS[raw.key].type === "armor"
        ? bounded(raw.evolution, 0, rarity(level))
        : 0,
    out = {
      ...makeItem(raw.key, level, rarity(level)),
      id: safeText(raw.id, 100) || crypto.randomUUID(),
      rank: bounded(raw.rank, 0, 5),
      evolution,
      xp: 0,
    };
  if (
    raw.mythical === true &&
    level >= 60 &&
    (!!MYTHICAL_WEAPONS[raw.key] ||
      (ITEMS[raw.key].mythicalOnly && ITEMS[raw.key].type === "armor"))
  )
    out.mythical = true;
  if (
    COSMETICS[raw.cosmetic]?.type === "weapon" &&
    COSMETICS[raw.cosmetic].kinds.includes(ITEMS[raw.key].weaponKind)
  )
    out.cosmetic = raw.cosmetic;
  let count = 0;
  for (const kind of ["prefix", "affix", "enchantment"])
    if (
      count < evolution &&
      modifierPool(out)[kind][raw[kind]] &&
      modifierFits(out, modifierPool(out)[kind][raw[kind]])
    ) {
      out[kind] = raw[kind];
      count++;
    }
  return out;
}
function cleanFacet(raw, key) {
  return {
    ...makeFacet(
      key,
      bounded(raw?.level, 1, 100),
      bounded(raw?.rarityTier, 0, 4),
    ),
    xp: 0,
  };
}
export function cleanTeam(raw, prefix) {
  if (!Array.isArray(raw) || raw.length !== 3)
    throw Error("Choose exactly three characters.");
  return raw.map((record, index) => {
    const source = structuredClone(record);
    if (
      source &&
      source.schema !== 7 &&
      (RACES[source.race] || ["Vampire", "Zombie"].includes(source.race)) &&
      (CLASSES[source.classId] ||
        ["miner", "lumberjack"].includes(source.classId))
    )
      normalizeHero(source, []);
    if (
      !source ||
      !RACES[source.race] ||
      !CLASSES[source.classId] ||
      ["witch", "stormcaller"].includes(source.classId)
    )
      throw Error("Invalid race or class.");
    const h = generateHero({
      id: prefix + "-" + index,
      name: safeText(source.name, 32) || "Adventurer",
      race: source.race,
      classId: source.classId,
      level: bounded(source.level, 1, 100),
      rarityTier: bounded(source.rarityTier, 0, 4),
      items: [],
      bonus: {},
      appearance: {
        hue: bounded(source.appearance?.hue, 0, 359),
        hair: bounded(source.appearance?.hair, 0, 5),
        crest: bounded(source.appearance?.crest, 0, 4),
        eyes: bounded(source.appearance?.eyes, 0, 4),
        crown: bounded(source.appearance?.crown, 0, 3),
        height: Math.max(
          0.92,
          Math.min(1.08, Number(source.appearance?.height) || 1),
        ),
        width: Math.max(
          0.9,
          Math.min(1.1, Number(source.appearance?.width) || 1),
        ),
        idle: 0,
      },
      currentHp: null,
    });
    if (source.mythical && MYTHICAL_HEROES[source.mythicKey]) {
      const canonical = MYTHICAL_HEROES[source.mythicKey];
      if (
        h.race !== canonical.race ||
        h.classId !== canonical.classId ||
        h.level < 60
      )
        throw Error("Invalid Mythical identity.");
      h.mythical = true;
      h.mythicKey = source.mythicKey;
    }
    if (
      COSMETICS[source.cosmetic] &&
      !["weapon", "pet"].includes(COSMETICS[source.cosmetic].type)
    )
      h.cosmetic = source.cosmetic;
    h.talents = [];
    for (const t of (source.talents || []).slice(0, 8))
      if (
        t &&
        (TALENTS[t.key] || CORE_STATS.some((k) => t.key === "training:" + k)) &&
        !h.talents.some((v) => v.key === t.key)
      )
        h.talents.push(cleanFacet(t, t.key));
    h.attributes = (source.attributes || [])
      .filter((a) => ATTRIBUTES[a?.key]?.profession)
      .map((a) => cleanFacet(a, a.key));
    const gatheringSlots = [...h.talents, ...h.attributes].filter(
      (t, i, a) =>
        TALENTS[t.key]?.slot && a.findIndex((v) => v.key === t.key) === i,
    ).length;
    h.extraSlots = (source.extraSlots || [])
      .filter(
        (s) =>
          s &&
          Array.isArray(s.types) &&
          s.types.length === 1 &&
          [
            "weapon",
            "focus",
            "offhand",
            "feet",
            "tool",
            "charm",
            "scroll",
          ].includes(s.types[0]),
      )
      .slice(0, 8 - CLASSES[h.classId].slots.length - gatheringSlots)
      .map((s) => ({ label: safeText(s.label, 20), types: s.types }));
    h.items = equipmentSlots(h).map((slot, i) => {
      const item = cleanItem(source.items?.[i]);
      return item &&
        slot.types.includes(ITEMS[item.key].type) &&
        !source.items[i].unidentified
        ? item
        : null;
    });
    h.light =
      source.light && ITEMS[source.light.key]?.type === "light"
        ? cleanItem(source.light)
        : null;
    h.armor = armorSlots(h).map((slot, i) => {
      const item = cleanItem(source.armor?.[i]);
      if (!item || !slot.allowed || source.armor[i].unidentified) return null;
      if (armorRestriction(h, item, i))
        throw Error("Restricted armor on " + h.name + ".");
      return item;
    });
    h.attributes = [
      cleanFacet(
        source.attributes?.find((a) => a.key === "race:" + h.race),
        "race:" + h.race,
      ),
    ];
    for (const a of (source.attributes || []).slice(0, 30))
      if (
        a?.key !== "race:" + h.race &&
        ATTRIBUTES[a?.key] &&
        !["Volunteer", "Converted"].includes(a.key) &&
        !h.attributes.some((v) => v.key === a.key)
      )
        h.attributes.push(cleanFacet(a, a.key));
    h.skills = {
      ["class:" + h.classId]: cleanFacet(
        source.skills?.["class:" + h.classId],
        "class:" + h.classId,
      ),
    };
    if (
      (source.classNodes || []).some(
        (id) => /:\d+$/.test(id) && !id.endsWith(":0"),
      ) &&
      (source.classNodes || []).some(
        (id, i) => id !== source.classPath + ":" + i,
      )
    )
      throw Error("Invalid class branch.");
    migrateClassNodes(source);
    const path = classTree(h).find((p) => p.id === source.classPath),
      nodes = source.classNodes || [];
    if (nodes.length) {
      if (
        (nodes.length > 1 && !path) ||
        !validClassNodes({
          ...h,
          classPath: path?.id || null,
          classNodes: nodes,
        })
      )
        throw Error("Invalid class branch.");
      h.classPath = path?.id || null;
      h.specialization = path?.id || null;
      h.classNodes = [...nodes];
    }
    if (LINEAGES[h.race].some((l) => l.id === source.lineage)) {
      h.lineage = source.lineage;
      h.attributes.push(cleanFacet(null, "lineage:" + h.lineage));
    }
    const learned = new Set();
    h.fusion = (source.fusion || [])
      .filter(
        (f) =>
          CLASSES[f.classId] &&
          f.classId !== h.classId &&
          !learned.has(f.classId) &&
          learned.add(f.classId),
      )
      .slice(0, 8)
      .map((f) => ({ classId: f.classId, name: safeText(f.name, 32) }));
    for (const f of h.fusion)
      h.skills["learned:" + f.classId] = cleanFacet(
        source.skills?.["learned:" + f.classId],
        "learned:" + f.classId,
      );
    if (source.companion && PETS[source.companion.key]) {
      const pet = source.companion;
      h.companion = makePet(
        pet.key,
        bounded(pet.level, 1, 100),
        bounded(pet.rarityTier, 0, 4),
      );
      if (COSMETICS[pet.cosmetic]?.type === "pet")
        h.companion.cosmetic = pet.cosmetic;
      h.companion.evolution = bounded(pet.evolution, 0, rarity(pet.level));
      let count = 0;
      for (const type of ["prefix", "affix", "enchantment"])
        if (
          count < h.companion.evolution &&
          modifierPool(h.companion, "pet")[type][pet[type]] &&
          modifierFits(
            h.companion,
            modifierPool(h.companion, "pet")[type][pet[type]],
          )
        ) {
          h.companion[type] = pet[type];
          count++;
        }
      h.companion.sockets = (pet.sockets || [])
        .slice(0, companionSlots(h.companion))
        .map((g) =>
          g && ["ruby", "sapphire", "emerald"].includes(g.kind)
            ? {
                id: crypto.randomUUID(),
                kind: g.kind,
                size: bounded(g.size, 0, 3),
              }
            : null,
        );
    }
    if (abilities(h).length > MAX_ABILITIES)
      throw Error("Ten active abilities maximum.");
    for (let i = 0; i < h.items.length; i++)
      if (h.items[i] && equipmentRestriction(h, h.items[i], i))
        throw Error("Restricted equipment on " + h.name + ".");
    h.currentHp = stats(h).hp;
    return h;
  });
}
function validReceipt(v) {
  return typeof v === "string" && /^[a-zA-Z0-9_-]{12,100}$/.test(v);
}
function offerPublic(row, user) {
  return {
    id: row.id,
    camp: row.camp,
    team: JSON.parse(row.team),
    gold: row.gold,
    loot: row.loot ? JSON.parse(row.loot) : null,
    state: row.state,
    mine: row.owner === user,
    created: row.created,
  };
}
export async function challengeApi(request, env) {
  const user = request.headers.get("oai-authenticated-user-id");
  if (!user)
    return reply(
      { error: "Sign in to this site to use player challenges." },
      401,
    );
  if (!env.DB)
    return reply(
      { error: "The shared board is not available in this preview." },
      503,
    );
  if (request.headers.get("x-camp-season") !== GAME_SEASON)
    return reply(
      { error: "This Camp season has ended. Reload to begin a fresh Camp." },
      409,
    );
  const url = new URL(request.url),
    db = env.DB,
    now = Date.now();
  if (request.method === "GET") {
    if (url.pathname.endsWith("/receipt")) {
      const id = url.searchParams.get("id");
      const offer = await db
        .prepare("SELECT id FROM challenge_offers WHERE id = ? AND owner = ?")
        .bind(id, user)
        .first();
      const match = await db
        .prepare(
          "SELECT id FROM challenge_matches WHERE id = ? AND challenger = ?",
        )
        .bind(id, user)
        .first();
      return reply({ accepted: !!offer || !!match });
    }
    const [offers, payouts, matches] = await Promise.all([
      db
        .prepare(
          "SELECT * FROM challenge_offers WHERE state = 'open' ORDER BY created DESC LIMIT 60",
        )
        .all(),
      db
        .prepare(
          "SELECT * FROM challenge_payouts WHERE owner = ? ORDER BY created DESC LIMIT 100",
        )
        .bind(user)
        .all(),
      db
        .prepare(
          "SELECT * FROM challenge_matches WHERE defender = ? OR challenger = ? ORDER BY created DESC LIMIT 20",
        )
        .bind(user, user)
        .all(),
    ]);
    return reply({
      offers: offers.results.map((row) => offerPublic(row, user)),
      payouts: payouts.results.map((p) => ({
        id: p.id,
        gold: p.gold,
        items: JSON.parse(p.items),
        claimed: !!p.claimed,
      })),
      matches: matches.results.map((m) => ({
        id: m.id,
        opponent: m.challenger === user ? m.defender_camp : m.challenger_camp,
        won: m.winner === user,
        result: JSON.parse(m.result),
        seed: m.seed,
        ownTeam: JSON.parse(
          m.challenger === user ? m.challenger_team : m.defender_team,
        ),
        enemyTeam: JSON.parse(
          m.challenger === user ? m.defender_team : m.challenger_team,
        ),
        attackingTeam: JSON.parse(m.challenger_team),
        defendingTeam: JSON.parse(m.defender_team),
        challenger: m.challenger === user,
      })),
    });
  }
  if (request.method !== "POST")
    return reply({ error: "Method not allowed." }, 405);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin)
    return reply({ error: "Request origin does not match this site." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return reply({ error: "JSON required." }, 415);
  if (Number(request.headers.get("content-length") || 0) > 90000)
    return reply({ error: "Request too large." }, 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > 90000) return reply({ error: "Request too large." }, 413);
    body = JSON.parse(text);
  } catch {
    return reply({ error: "Invalid request." }, 400);
  }
  try {
    if (url.pathname.endsWith("/post")) {
      if (
        !validReceipt(body.receipt) ||
        !Number.isInteger(body.gold) ||
        body.gold < 10 ||
        body.gold > 1000
      )
        throw Error("Pledge between 10 and 1,000 gold.");
      const existing = await db
        .prepare("SELECT * FROM challenge_offers WHERE id = ? AND owner = ?")
        .bind(body.receipt, user)
        .first();
      if (existing) return reply({ offer: offerPublic(existing, user) });
      const team = cleanTeam(body.team, body.receipt),
        camp = safeText(body.campName) || "A traveler’s camp",
        loot = cleanItem(body.loot);
      try {
        await db
          .prepare(
            "INSERT INTO challenge_offers (id, owner, camp, team, gold, loot, state, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          )
          .bind(
            body.receipt,
            user,
            camp,
            JSON.stringify(team),
            body.gold,
            loot ? JSON.stringify(loot) : null,
            "open",
            now,
          )
          .run();
      } catch {
        return reply(
          { error: "You already have a posted challenge. Withdraw it first." },
          409,
        );
      }
      return reply({ accepted: true });
    }
    if (url.pathname.endsWith("/cancel")) {
      const own = await db
        .prepare("SELECT * FROM challenge_offers WHERE id = ? AND owner = ?")
        .bind(body.id, user)
        .first();
      if (!own) return reply({ error: "Your challenge was not found." }, 404);
      const receipt = "return-" + own.id;
      const results = await db.batch([
        db
          .prepare(
            "UPDATE challenge_offers SET state = 'cancelled' WHERE id = ? AND owner = ? AND state = 'open'",
          )
          .bind(own.id, user),
        db
          .prepare(
            "INSERT OR IGNORE INTO challenge_payouts (id, owner, gold, items, created) SELECT ?, owner, gold, ?, ? FROM challenge_offers WHERE id = ? AND state = 'cancelled'",
          )
          .bind(
            receipt,
            JSON.stringify(own.loot ? [JSON.parse(own.loot)] : []),
            now,
            own.id,
          ),
      ]);
      if (!results[0].meta.changes && own.state !== "cancelled")
        return reply({ error: "This team has already been challenged." }, 409);
      return reply({ accepted: true });
    }
    if (url.pathname.endsWith("/claim")) {
      const payout = await db
        .prepare("SELECT * FROM challenge_payouts WHERE id = ? AND owner = ?")
        .bind(body.id, user)
        .first();
      if (!payout) return reply({ error: "Reward not found." }, 404);
      await db
        .prepare(
          "UPDATE challenge_payouts SET claimed = 1 WHERE id = ? AND owner = ?",
        )
        .bind(body.id, user)
        .run();
      return reply({
        id: payout.id,
        gold: payout.gold,
        items: JSON.parse(payout.items),
      });
    }
    if (url.pathname.endsWith("/attack")) {
      if (!validReceipt(body.receipt)) throw Error("Invalid receipt.");
      const previous = await db
        .prepare(
          "SELECT id, result FROM challenge_matches WHERE id = ? AND challenger = ?",
        )
        .bind(body.receipt, user)
        .first();
      if (previous)
        return reply({ accepted: true, result: JSON.parse(previous.result) });
      const offer = await db
        .prepare(
          "SELECT * FROM challenge_offers WHERE id = ? AND state = 'open'",
        )
        .bind(body.id)
        .first();
      if (!offer)
        return reply(
          { error: "Someone has already taken this challenge." },
          409,
        );
      if (offer.owner === user) throw Error("Choose another player’s team.");
      if (body.gold !== offer.gold) throw Error("The gold pledge must match.");
      const targetLoot = offer.loot ? JSON.parse(offer.loot) : null,
        loot = cleanItem(body.loot);
      if (targetLoot && (!loot || itemRarity(loot) < itemRarity(targetLoot)))
        throw Error("Match the equipment pledge’s rarity or higher.");
      const ownTeam = cleanTeam(body.team, body.receipt),
        enemyTeam = cleanTeam(JSON.parse(offer.team), offer.id),
        seed = crypto.getRandomValues(new Uint32Array(1))[0] % 10000000,
        b = new Battle(ownTeam, 0, seed, enemyTeam, {
          mode: "challenge",
          biome: "village",
          recruitLimit: 0,
        });
      b.autoPrepare();
      for (let n = 0; n < 10800 && !b.result; n++) b.update(1 / 30);
      if (!b.result)
        throw Error(
          "Battle could not resolve. Your pledge has not been accepted.",
        );
      const winner = b.result.winner === 0 ? user : offer.owner,
        result = {
          winner: b.result.winner,
          time: b.result.time,
          damage: b.result.damage,
          healing: b.result.healing,
        },
        items = [targetLoot, loot].filter(Boolean),
        camp = safeText(body.campName) || "A traveler’s camp";
      const out = await db.batch([
        db
          .prepare(
            "UPDATE challenge_offers SET state = 'resolved', attack_receipt = ? WHERE id = ? AND state = 'open'",
          )
          .bind(body.receipt, offer.id),
        db
          .prepare(
            "INSERT INTO challenge_matches (id, offer_id, defender, challenger, defender_camp, challenger_camp, defender_team, challenger_team, seed, winner, result, created) SELECT ?, id, owner, ?, camp, ?, team, ?, ?, ?, ?, ? FROM challenge_offers WHERE id = ? AND attack_receipt = ?",
          )
          .bind(
            body.receipt,
            user,
            camp,
            JSON.stringify(ownTeam),
            seed,
            winner,
            JSON.stringify(result),
            now,
            offer.id,
            body.receipt,
          ),
        db
          .prepare(
            "INSERT INTO challenge_payouts (id, owner, gold, items, created) SELECT ?, ?, gold * 2, ?, ? FROM challenge_offers WHERE id = ? AND attack_receipt = ?",
          )
          .bind(
            "win-" + body.receipt,
            winner,
            JSON.stringify(items),
            now,
            offer.id,
            body.receipt,
          ),
      ]);
      if (!out[0].meta.changes)
        return reply(
          { error: "Someone has already taken this challenge." },
          409,
        );
      return reply({ accepted: true, result });
    }
    return reply({ error: "Unknown challenge action." }, 404);
  } catch (error) {
    return reply({ error: error.message }, 400);
  }
}
