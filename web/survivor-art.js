import { SURVIVOR_SPRITES } from './survivor-sprites.js?v=21';
import { pixelPortraitSvg, pixelItemSvg, pixelPetSvg, pixelWingArt } from './pixel-art.js?v=21';
import { RACES, CLASSES, ITEMS, PETS, COSMETICS, MYTHICAL_HEROES, flightType, heroRarity, RARITY_COLORS, objectModifiers, hasAttribute } from './data.js?v=21';
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const nested = (svg,x,y,w,h) => svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const livery = {vanguard:'#a58056',ranger:'#66825e',assassin:'#656875',mage:'#657993',healer:'#d2c3a0',berserker:'#a17a53',paladin:'#d5b56c',bard:'#8d8665',monk:'#a17d66',necromancer:'#7a8580',alchemist:'#78aa89',psion:'#b08cc6'};

// Self-contained embedded images are required: the combat renderer decodes this
// same SVG through an Image URL, where external SVG subresources cannot load.
export function survivorPortraitSvg(hero = {}, small = false, pose = 0) {
  if (hero.petKey || hero.creature || hero.structure || hero.hazard || hero.art)
    return pixelPortraitSvg(hero, small, pose);
  const h={race:'Human',classId:'vanguard',items:[],armor:[],attributes:[],talents:[],...hero};
  const cosmetic=COSMETICS[h.cosmetic], guise=cosmetic?.skin || (!h.cosmetic && MYTHICAL_HEROES[h.mythicKey]?.skin);
  let key=h.race==='Human' && SURVIVOR_SPRITES['class:'+h.classId] ? 'class:'+h.classId : 'race:'+h.race;
  if(guise)key={sunplate:'class:paladin',clockwork:'race:Automaton',moonwraith:'race:Voidborn',stormknight:'class:paladin'}[guise]||key;
  const body=SURVIVOR_SPRITES[key];
  if(!body)return pixelPortraitSvg(hero,small,pose);
  const tone=livery[h.classId]||'#9c8b73', tier=heroRarity(h), flight=flightType(h);
  let layers='', details='';
  if(flight && !(h.race==='Fae' && flight==='insect'))layers+=`<g transform="translate(0 4) scale(.64)">${pixelWingArt(flight,pose)}</g>`;
  const filter=cosmetic?.hue!==undefined?`<defs><filter id="palette" color-interpolation-filters="sRGB"><feColorMatrix type="hueRotate" values="${cosmetic.hue-245}"/></filter></defs>`:'';
  layers+=filter+`<image x="4" y="0" width="56" height="75" href="${body}" ${filter?'filter="url(#palette)"':''}/>`;
  // Race anatomy stays readable. Small cloth tabs and actual equipment convey
  // class without turning every species into the same human silhouette.
  if(h.race!=='Human' && !guise && !['Ent','Voidborn','Myconoid'].includes(h.race))
    layers+=`<path d="M27 35h8v5l-3 7-5-2z" fill="${tone}" stroke="#25232a" stroke-width=".7"/><path d="M29 36v6" stroke="#c2b293" stroke-width=".8"/>`;
  for(let i=0;i<(h.armor||[]).length;i++){
    const item=h.armor[i],def=ITEMS[item?.key];if(!def)continue;
    const slot=def.armorSlot||['head','chest','legs','boots'][i], mods=objectModifiers(item,'armor');
    const color=mods.find(m=>m.visual?.color)?.visual.color||def.visualColor||({heavy:'#abb6b8',medium:'#9a8165',light:tone}[def.weight]);
    details+=`<g data-worn-armor="${esc(slot)}" data-armor-item="${esc(item.key)}"/>`;
    for(const m of mods)details+=`<g data-modifier-art="armor:${esc(m.kind)}:${esc(m.key)}"/>`;
    // Named armor and transformations visibly replace the starter's trim and
    // plates. The generated body already supplies the starter outfit.
    if(!/^(light|medium|heavy)-(head|chest|legs|boots)$/.test(item.key)||mods.length){
      const shapes={head:'M23 15h19v3H23zM23 18h3v6h-3z',chest:'M18 32h8v5h-8zM39 32h8v5h-8zM27 40h12v9H27z',legs:'M23 55h7v4h-7zM35 55h7v4h-7z',boots:'M21 69h10v3H21zM35 69h10v3H35z'};
      if(!(['Naga','Ent','Voidborn'].includes(h.race)&&['legs','boots'].includes(slot)))layers+=`<path d="${shapes[slot]}" fill="${color}" stroke="#282a2c" stroke-width="1"/>`;
    }
  }
  const gear=h.items.filter(i=>ITEMS[i?.key]);
  const held=gear.filter(i=>ITEMS[i.key].weaponKind||['tool','mining','woodcutting','focus'].includes(ITEMS[i.key].type)).slice(0,2);
  for(let i=0;i<held.length;i++)layers+=nested(pixelItemSvg(held[i]),i?36:9,30,i?20:24,39);
  const offhand=gear.find(i=>ITEMS[i.key].type==='offhand');
  if(offhand)layers+=nested(pixelItemSvg(offhand),34,38,21,29);
  const charm=gear.find(i=>ITEMS[i.key].type==='charm');
  if(charm)layers+=nested(pixelItemSvg(charm),28,43,10,13);
  if(h.light){layers+=nested(pixelItemSvg(h.light),41,52,13,20);details+=`<g data-light-art="${esc(h.light.key)}"/>`;}
  if(hasAttribute(h,'Vampire'))layers+='<rect x="32" y="21" width="2" height="1" fill="#f87591"/>';
  if(hasAttribute(h,'Cursed')||h.race==='Voidborn'){
    const drift=(Math.round(pose+h.appearance?.smokePose||0)%4)*2;
    layers+=`<g class="smoke-wisp" opacity=".45" fill="#9571bd"><rect x="9" y="${54-drift}" width="2" height="4"/><rect x="53" y="${46+drift}" width="2" height="3"/></g>`;
  }
  if(tier>0){const color=RARITY_COLORS[Math.min(4,tier)];layers+=`<g class="rarity-sparks" fill="${color}"><rect x="8" y="24" width="1" height="2"/><rect x="55" y="42" width="2" height="1"/></g>`;}
  const mount=h.mount||(PETS[h.companion?.key]?.mode==='mount'?h.companion:null);
  if(mount)layers=nested(pixelPetSvg(mount,pose),0,39,64,40)+`<g transform="translate(10 -2) scale(.68)">${layers}</g>`+`<g data-mounted-on="${esc(mount.key)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" preserveAspectRatio="xMidYMax meet" shape-rendering="crispEdges" style="image-rendering:pixelated" aria-hidden="true" data-pixel-art="character" data-survivor-art="${esc(key)}" data-race-art="${esc(h.race)}" data-class-art="${esc(h.classId)}" data-pose="${Math.round(pose)}" ${small?'data-small-sprite="true"':''} ${guise?`data-character-skin="${esc(guise)}"`:''}><g class="survivor-body">${layers}</g>${details}</svg>`;
}
