import { CAMP_WORLD } from "./camp-world.js?v=21";
// Coordinates refer to the 1468 × 1071 generated painting. Inset banks and
// exclusion islands keep moving highlights off rocks, reeds, trees and bridges.
export const WATER_AREAS = [
  [
    [473, 715],
    [497, 700],
    [548, 714],
    [585, 705],
    [638, 729],
    [686, 726],
    [726, 715],
    [786, 733],
    [836, 752],
    [894, 766],
    [939, 800],
    [1019, 831],
    [1069, 856],
    [1118, 871],
    [1120, 883],
    [1072, 900],
    [1060, 913],
    [990, 913],
    [943, 944],
    [908, 957],
    [854, 970],
    [811, 975],
    [766, 966],
    [727, 955],
    [689, 936],
    [645, 915],
    [618, 900],
    [604, 873],
    [617, 850],
    [581, 816],
    [540, 818],
    [512, 797],
    [488, 759],
  ],
  [
    [693, 220],
    [726, 224],
    [760, 216],
    [785, 215],
    [805, 222],
    [819, 227],
    [816, 233],
    [793, 229],
    [770, 226],
    [741, 234],
    [710, 232],
  ],
  [
    [847, 225],
    [878, 221],
    [907, 226],
    [931, 235],
    [943, 248],
    [938, 254],
    [919, 244],
    [902, 237],
    [874, 233],
    [849, 234],
  ],
  [
    [965, 303],
    [986, 299],
    [1006, 309],
    [1021, 331],
    [1055, 346],
    [1080, 349],
    [1095, 359],
    [1083, 366],
    [1054, 356],
    [1020, 342],
    [1001, 319],
    [980, 311],
  ],
];
const WATER_ISLANDS = [
  [
    [708, 851],
    [744, 820],
    [762, 789],
    [819, 800],
    [841, 842],
    [858, 876],
    [850, 905],
    [816, 924],
    [769, 922],
    [729, 894],
  ],
  [
    [898, 781],
    [919, 770],
    [938, 786],
    [951, 804],
    [942, 817],
    [909, 818],
    [893, 803],
  ],
  [
    [543, 818],
    [570, 819],
    [589, 835],
    [582, 851],
    [552, 851],
    [535, 838],
  ],
  [
    [683, 932],
    [706, 917],
    [728, 928],
    [755, 946],
    [746, 966],
    [717, 960],
  ],
  [
    [992, 882],
    [1020, 877],
    [1053, 890],
    [1060, 914],
    [1015, 923],
    [986, 910],
  ],
];
export const WATERFALLS = [
  [1174, 105, 1181, 135, 6],
  [1200, 144, 1208, 170, 6],
  [1266, 209, 1273, 238, 5],
  [1306, 264, 1312, 289, 6],
  [958, 262, 965, 291, 5],
  [548, 551, 553, 570, 4],
  [577, 585, 583, 611, 6],
  [588, 665, 594, 689, 7],
  [742, 680, 747, 696, 5],
];
function polygon(ctx, points) {
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}
export function paintCampWater(ctx, time, reduced = false) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.scale(ctx.canvas.width / 1468, ctx.canvas.height / 1071);
  if (reduced) time = 0;
  ctx.save();
  ctx.beginPath();
  for (const points of WATER_AREAS) polygon(ctx, points);
  ctx.clip();
  ctx.beginPath();
  ctx.rect(0, 0, 1468, 1071);
  for (const points of WATER_ISLANDS) polygon(ctx, points);
  ctx.clip("evenodd");
  ctx.strokeStyle = "#6fa6bd";
  ctx.lineWidth = 0.65;
  for (let i = 0; i < 210; i++) {
    const x = 460 + ((i * 89.37) % 660),
      y = 704 + ((i * 47.19) % 271),
      phase = time * 0.7 + i * 1.71;
    ctx.globalAlpha = 0.065 + (0.065 * (1 + Math.sin(phase))) / 2;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.sin(phase * 0.35) * 2,
      y + Math.cos(phase * 0.5) * 0.6,
      3 + (i % 7),
      0.6,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();
  }
  // Narrow moving threads follow the two visible stretches of northern stream.
  for (let i = 0; i < 45; i++) {
    const x = 697 + ((i * 29.37) % 408),
      y = 217 + ((i * 17.41) % 149);
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(x + ((time * 3) % 9), y);
    ctx.lineTo(x + 6 + ((time * 3) % 9), y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
  for (const [x, y, tx, ty, width] of WATERFALLS) {
    ctx.save();
    ctx.beginPath();
    polygon(ctx, [
      [x - width / 2, y],
      [x + width / 2, y],
      [tx + width / 2, ty],
      [tx - width / 2, ty],
    ]);
    ctx.clip();
    for (let i = 0; i < 7; i++) {
      const phase = (time * 0.7 + i / 7) % 1,
        px = x + (tx - x) * phase,
        py = y + (ty - y) * phase;
      ctx.strokeStyle = "#a9d7e1";
      ctx.globalAlpha = 0.13 + 0.09 * Math.sin(phase * Math.PI);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - width * 0.25, py);
      ctx.lineTo(px + width * 0.1, py + 5);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
export function createCampWater(element) {
  const canvas = document.createElement("canvas");
  canvas.className = "camp-water";
  canvas.width = CAMP_WORLD.width / 2;
  canvas.height = CAMP_WORLD.height / 2;
  canvas.setAttribute("aria-hidden", "true");
  element.appendChild(canvas);
  return canvas;
}
