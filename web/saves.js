import { Battle } from "./engine.js?v=17";
import { validateSave, migrateSave } from "./progression.js?v=17";
export function exportCamp(game) {
  return JSON.stringify({ format: "camp-backup", version: 1, game }, null, 2);
}
export function readCampBackup(text) {
  try {
    if (typeof text !== "string" || text.length > 5000000) return null;
    const payload = JSON.parse(text),
      raw =
        payload?.format === "camp-backup" && payload.version === 1
          ? payload.game
          : payload;
    const game = validateSave(raw) || migrateSave(raw);
    if (!game) return null;
    for (const r of game.expeditions)
      if (r.battleState) Battle.fromState(r.battleState);
    return game;
  } catch {
    return null;
  }
}
