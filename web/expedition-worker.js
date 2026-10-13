import { ExpeditionSimulation } from "./simulation.js?v=21";
let simulation = null,
  lastEmission = 0;
function send(requestId = null, result = null) {
  if (!simulation) return;
  self.postMessage({ requestId, ...(result || simulation.snapshot()) });
  lastEmission = Date.now();
}
self.onmessage = (event) => {
  const { type, args = {}, now = Date.now(), requestId } = event.data;
  try {
    if (type === "init") {
      simulation = new ExpeditionSimulation(args.saved, now);
      send(requestId);
    } else if (type === "observe")
      send(requestId, { ...simulation.observe(args, now), observationOnly: true });
    else if (type === "checkpoint") {
      simulation.advance(now);
      send(requestId);
    } else if (simulation) send(requestId, simulation.action(type, args, now));
  } catch (error) {
    self.postMessage({ requestId, error: error.message });
  }
};
setInterval(() => {
  if (!simulation) return;
  simulation.advance(Date.now());
  const interval =
    simulation.observation.visible && simulation.observation.id ? 100 : 1000;
  if (Date.now() - lastEmission >= interval) send();
}, 50);
