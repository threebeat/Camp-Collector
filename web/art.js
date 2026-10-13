import { survivorPortraitSvg } from "./survivor-art.js?v=21";
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
} from "./pixel-art.js?v=21";
export const icon = pixelIcon;
export const portraitSvg = survivorPortraitSvg;
export const petSvg = pixelPetSvg;
export const itemSvg = pixelItemSvg;
export const cosmeticSvg = pixelCosmeticSvg;
export const creatureSvg = pixelCreatureSvg;
export const modifiersArt = pixelModifiersArt;
export const wingArt = pixelWingArt;
export const weaponPresentation = pixelWeaponPresentation;
export const guiseSvg = (key, hero = {}) =>
  survivorPortraitSvg({
    race: "Human",
    classId: "vanguard",
    items: [],
    armor: [],
    attributes: [],
    ...hero,
    cosmetic: key,
  });
export const smokeCharacterSvg = survivorPortraitSvg;
