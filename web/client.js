import { ExpeditionSimulation } from "./simulation.js?v=20";
export const SAVE_KEY = "camp-collector-v12";
export function loadGame(storage = localStorage) {
  try {
    for (const key of [
      "frutiger-fighters-v3",
      "wayward-company-v4",
      "little-legends-v5",
      ...Array.from({ length: 7 }, (_, i) => "camp-collector-v" + (i + 5)),
    ])
      storage.removeItem(key);
    const saved = storage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
export function createClient(onUpdate, saved = loadGame()) {
  let serial = 0,
    lastSave = 0,
    latest = null,
    storageFailed = false;
  const pending = new Map();
  let worker = null,
    simulation = null,
    timer = null;
  const receive = (message) => {
    const data = message.data || message;
    if (data.error) {
      pending.get(data.requestId)?.reject(Error(data.error));
      pending.delete(data.requestId);
      return;
    }
    if (data.game) {
      latest = data;
      const now = Date.now();
      if (data.requestId || now - lastSave >= 1000) {
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(data.game));
          lastSave = now;
          storageFailed = false;
        } catch {
          storageFailed = true;
        }
      }
      data.storageFailed = storageFailed;
      onUpdate(data);
    }
    if (pending.has(data.requestId)) {
      pending.get(data.requestId).resolve(data);
      pending.delete(data.requestId);
    }
  };
  if (typeof Worker !== "undefined") {
    worker = new Worker(
      new URL("./expedition-worker.js?v=20", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = receive;
  } else {
    simulation = new ExpeditionSimulation(saved);
    timer = setInterval(() => {
      simulation.advance();
      receive(simulation.snapshot());
    }, 100);
  }
  const command = (type, args = {}, now = Date.now()) => {
    if (simulation) {
      try {
        let data;
        if (type === "init") data = simulation.snapshot();
        else if (type === "observe") data = { ...simulation.observe(args, now), observationOnly: true };
        else if (type === "checkpoint") {
          simulation.advance(now);
          data = simulation.snapshot();
        } else data = simulation.action(type, args, now);
        receive({ ...data, requestId: ++serial });
        return Promise.resolve(data);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    const requestId = ++serial;
    return new Promise((resolve, reject) => {
      pending.set(requestId, { resolve, reject });
      worker.postMessage({ requestId, type, args, now });
    });
  };
  const ready = command("init", { saved });
  return {
    command,
    ready,
    get latest() {
      return latest;
    },
    checkpoint() {
      if (latest)
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(latest.game));
        } catch {}
      return command("checkpoint");
    },
    close() {
      if (timer) clearInterval(timer);
      worker?.terminate();
    },
  };
}
