import { pixelPropSvg, pixelBuildingSvg } from "./pixel-art.js?v=20";
const stamp = (key, x, y, w = 100, h = w, building = false) =>
  `<svg x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}">${building ? pixelBuildingSvg(key) : pixelPropSvg(key)}</svg>`;
function water(points, width = 34, color = "#416479") {
  let art = "";
  for (let i = 0; i < points.length - 1; i++) {
    const [x, y] = points[i],
      [nx, ny] = points[i + 1],
      steps = Math.ceil(Math.hypot(nx - x, ny - y) / 12);
    for (let j = 0; j < steps; j++)
      art += `<rect x="${Math.round((x + ((nx - x) * j) / steps) / 8) * 8}" y="${Math.round((y + ((ny - y) * j) / steps) / 8) * 8}" width="${width}" height="${width}" fill="${color}"/>`;
  }
  return art;
}
export function regionLandmarks(location) {
  if (location === "greenway")
    return `<g data-map-landmarks="forest"><g data-lakeshore-island="true" transform="translate(0 -74)"><rect x="60" y="1260" width="430" height="120" fill="#263f50"/><rect x="76" y="1244" width="110" height="16" fill="#416479"/><rect x="156" y="1300" width="78" height="32" fill="#354d4b"/>${stamp("ruin", 191, 1317, 52, 60)}<text x="278" y="1318" fill="#f7df9b" font-size="19">The Bell Beneath · 25 floors</text><text x="85" y="1236" fill="#92c9d0" font-size="17">Camp’s south lakeshore</text></g>${water(
      [
        [833, 360],
        [763, 440],
        [792, 530],
        [689, 636],
        [622, 699],
        [708, 758],
        [777, 928],
        [823, 1095],
        [622, 1230],
      ],
    )}${stamp("mill", 457, 850, 110, 130, true)}${stamp("ruin", 218, 540, 130, 100)}${stamp("tower", 226, 245, 96, 130, true)}${stamp("bridge", 682, 1100, 120, 70)}${stamp("mushroom", 687, 656, 100, 100)}</g>`;
  if (location === "marsh")
    return `<g data-map-landmarks="marsh">${water(
      [
        [665, 20],
        [551, 241],
        [680, 402],
        [580, 713],
        [754, 969],
        [548, 1300],
      ],
      75,
    )}${water(
      [
        [0, 917],
        [280, 859],
        [604, 745],
      ],
      28,
    )}${stamp("ruin", 235, 780, 130, 100)}${stamp("tower", 626, 290, 96, 130, true)}${stamp("house", 327, 450, 140, 130)}${stamp("boat", 709, 940, 110, 80)}</g>`;
  if (location === "volcano")
    return `<g data-map-landmarks="volcano">${stamp("mountain", 700, 220, 230, 210)}${water(
      [
        [696, 102],
        [613, 300],
        [720, 464],
        [653, 871],
      ],
      25,
      "#d98c43",
    )}${stamp("tower", 243, 755, 96, 130, true)}${stamp("ruin", 269, 425, 130, 100)}${stamp("rock", 776, 780)}${stamp("rock", 165, 1070)}${stamp("fountain", 316, 1040, 150, 90)}</g>`;
  if (location === "cinder")
    return `<g data-map-landmarks="country">${stamp("farm", 185, 1020, 210, 140, true)}${stamp("farm", 650, 750, 240, 170, true)}${stamp("mill", 253, 945, 110, 130, true)}${stamp("tower", 720, 320, 96, 130, true)}${stamp("ruin", 184, 590, 130, 100)}${stamp("house", 422, 520, 150, 130)}${stamp("grave", 676, 1019, 100, 70)}</g>`;
  return `<g data-map-landmarks="jungle">${water(
    [
      [846, 122],
      [635, 247],
      [713, 430],
      [659, 834],
      [779, 1029],
      [750, 1277],
    ],
    38,
  )}${stamp("ruin", 270, 720, 130, 100)}${stamp("ruin", 639, 390, 130, 100)}${stamp("bones", 276, 1030, 180, 95)}${stamp("eggs", 654, 980, 120, 90)}${Array.from({ length: 10 }, (_, i) => stamp("tree", 50 + ((i * 137) % 790), 155 + ((i * 127) % 1090), 70, 90)).join("")}</g>`;
}
