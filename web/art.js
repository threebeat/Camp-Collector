// Every surface shares Evernight's original grid-authored sprites.
import {
  pixelIcon,
  pixelPortraitSvg,
  pixelPetSvg,
  pixelItemSvg,
  pixelCosmeticSvg,
  pixelCreatureSvg,
  pixelModifiersArt,
  pixelWingArt,
  pixelWeaponPresentation,
} from "./pixel-art.js?v=18";
export const icon = pixelIcon;
export const portraitSvg = pixelPortraitSvg;
export const petSvg = pixelPetSvg;
export const itemSvg = pixelItemSvg;
export const cosmeticSvg = pixelCosmeticSvg;
export const creatureSvg = pixelCreatureSvg;
export const modifiersArt = pixelModifiersArt;
export const wingArt = pixelWingArt;
export const weaponPresentation = pixelWeaponPresentation;
export const guiseSvg = (key, hero = {}) =>
  pixelPortraitSvg({
    race: "Human",
    classId: "vanguard",
    items: [],
    armor: [],
    attributes: [],
    ...hero,
    cosmetic: key,
  });
export const smokeCharacterSvg = pixelPortraitSvg;
