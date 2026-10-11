import { PixelLighting } from "./pixel-lighting.js?v=15";
export class SceneLighting {
  constructor(element) {
    this.element = element;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "scene-lightfield";
    this.canvas.setAttribute("aria-hidden", "true");
    element.appendChild(this.canvas);
    this.at = -Infinity;
    this.size = "";
  }
  draw(time) {
    if (time - this.at < 0.15) return;
    this.at = time;
    const bounds = this.element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const width = 600,
      height = Math.round((width * bounds.height) / bounds.width),
      size = height + ":" + bounds.width;
    if (this.size !== size) {
      this.size = size;
      this.light = new PixelLighting(width, height, 4);
      this.canvas.width = width / 2;
      this.canvas.height = Math.ceil(height / 2);
    }
    const lights = [],
      objects = [];
    const elements = this.element.querySelectorAll(
      ".camp-building,.vendor-map,.market-map-stall,.district-booth,.portal-mage,.camp-resident,.visitor-character,.expansion-service,.dock-service",
    );
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const x =
        ((box.left - bounds.left + box.width / 2) / bounds.width) * width;
      const y =
        ((box.top - bounds.top + box.height * 0.65) / bounds.height) * height;
      const key = element.dataset.building || element.dataset.vendorMap || "";
      const resident =
        element.classList.contains("camp-resident") ||
        element.classList.contains("visitor-character");
      if (resident) {
        if (element.querySelector("[data-pixel-light], [data-light-art]"))
          lights.push({ x, y, r: 72, color: "#f4c76a", kind: "lamp" });
      } else {
        const fire = key === "bonfire";
        const arcane =
          ["arcane", "alchemist"].includes(key) ||
          element.classList.contains("portal-mage");
        lights.push({
          x,
          y,
          r: fire
            ? 112 + Math.floor(Math.sin(time * 3) * 3)
            : arcane
              ? 80
              : key === "blacksmith" || key === "forge"
                ? 88
                : 55,
          color: arcane ? "#ad83d5" : fire ? "#f4c76a" : "#d98c43",
          kind: fire ? "fire" : "window",
        });
        if (!fire)
          objects.push({
            type: "house",
            x: x - (box.width / bounds.width) * width * 0.3,
            y: y - (box.height / bounds.height) * height * 0.35,
            w: (box.width / bounds.width) * width * 0.6,
            h: (box.height / bounds.height) * height * 0.4,
          });
      }
    }
    if (!lights.length)
      lights.push({
        x: width / 2,
        y: height / 2,
        r: 160,
        color: "#f4c76a",
        kind: "fire",
      });
    this.light.paint({ map: { objects } }, lights, [], [], time, 0.48);
    const ctx = this.canvas.getContext("2d");
    ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    ctx.clearRect(0, 0, width, height);
    this.light.composite(ctx);
  }
}
