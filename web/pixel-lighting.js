import { sightPolygon } from "./lighting.js?v=20";

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bands = [
  [1, 0.12],
  [0.82, 0.28],
  [0.62, 0.48],
  [0.38, 0.78],
];

// Lighting is intentionally rasterized at the art's grid, then scaled without smoothing.
export class PixelLighting {
  constructor(width = 1200, height = 480, grid = 4) {
    this.width = width;
    this.height = height;
    this.grid = grid;
    this.mask = document.createElement("canvas");
    this.tint = document.createElement("canvas");
    this.mask.width = this.tint.width = Math.ceil(width / grid);
    this.mask.height = this.tint.height = Math.ceil(height / grid);
    this.updatedAt = -Infinity;
    this.signature = "";
  }
  paint(scene, lights, senses, remembered, time, darkness = 0.98) {
    if (time - this.updatedAt < 0.1 && time >= this.updatedAt) return;
    const signature = JSON.stringify([
      darkness,
      lights.map((s) => [
        Math.round(s.x / 4),
        Math.round(s.y / 4),
        s.r,
        s.color,
      ]),
      senses.map((s) => [
        Math.round(s.x / 4),
        Math.round(s.y / 4),
        s.r,
        s.nightVision,
      ]),
      remembered,
      (scene.map.objects || []).map((o) => [
        o.type,
        Math.round(o.x / 4),
        Math.round(o.y / 4),
        o.r,
        o.w,
        o.h,
      ]),
    ]);
    if (signature === this.signature) return;
    this.signature = signature;
    this.updatedAt = time;
    const mask = this.mask.getContext("2d", { willReadFrequently: true }),
      tint = this.tint.getContext("2d"),
      grid = this.grid;
    for (const ctx of [mask, tint]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.mask.width, this.mask.height);

      ctx.imageSmoothingEnabled = false;
    }
    mask.globalCompositeOperation = "source-over";
    mask.fillStyle = `rgba(10,12,26,${darkness})`;
    mask.fillRect(0, 0, this.mask.width, this.mask.height);
    mask.globalCompositeOperation = "destination-out";
    mask.fillStyle = "rgba(0,0,0,.16)";
    for (const n of remembered || [])
      mask.fillRect(
        ((n % 30) * 40 + (scene.lightOffset?.x || 0)) / grid,
        (Math.floor(n / 30) * 40 + (scene.lightOffset?.y || 0)) / grid,
        40 / grid,
        40 / grid,
      );
    tint.globalCompositeOperation = "screen";
    for (const source of [...lights, ...senses]) {
      const polygon = sightPolygon(scene, source);
      for (const ctx of [mask, tint]) {
        ctx.save();
        ctx.beginPath();
        polygon.forEach((p, i) =>
          i
            ? ctx.lineTo(p.x / grid, p.y / grid)
            : ctx.moveTo(p.x / grid, p.y / grid),
        );
        ctx.closePath();
        ctx.clip();
      }
      for (const [radius, opacity] of bands) {
        mask.fillStyle = `rgba(0,0,0,${opacity})`;
        mask.beginPath();
        mask.arc(
          source.x / grid,
          source.y / grid,
          (source.r * radius) / grid,
          0,
          Math.PI * 2,
        );
        mask.fill();
      }
      if (source.kind !== "vision" || source.nightVision) {
        tint.fillStyle =
          source.kind === "vision" ? "#739ed2" : source.color || "#f4c76a";
        for (const [radius, opacity] of [
          [0.85, 0.045],
          [0.6, 0.07],
          [0.35, 0.11],
        ]) {
          tint.globalAlpha = opacity;
          tint.beginPath();
          tint.arc(
            source.x / grid,
            source.y / grid,
            (source.r * radius) / grid,
            0,
            Math.PI * 2,
          );
          tint.fill();
        }
      }
      mask.restore();
      tint.restore();
    }
    mask.globalCompositeOperation = "source-over";
    mask.setTransform(1, 0, 0, 1, 0, 0);
    // Ordered dithering keeps every edge on a stable pixel grid, including overlaps.
    const image = mask.getImageData(0, 0, this.mask.width, this.mask.height);
    for (let i = 3; i < image.data.length; i += 4) {
      const pixel = (i - 3) / 4,
        x = pixel % this.mask.width,
        y = Math.floor(pixel / this.mask.width);
      const alpha = (image.data[i] / 255) * 7,
        lo = Math.floor(alpha);
      image.data[i] = Math.round(
        ((lo + (alpha - lo > BAYER[(y % 4) * 4 + (x % 4)] / 16 ? 1 : 0)) *
          255) /
          7,
      );
    }
    mask.putImageData(image, 0, 0);
  }
  composite(ctx) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.mask, 0, 0, this.width, this.height);
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(this.tint, 0, 0, this.width, this.height);
    ctx.restore();
  }
}
