// Native SVG/canvas inspection. This does not replace phone/browser layout QA.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {WEAPONS,makeItem,makePet,generateHero,MYTHICAL_HEROES,makeMythicalHero,makeMythicalWeapon,COSMETICS,LOCATIONS} from '../web/data.js';
import {itemSvg,portraitSvg,petSvg,cosmeticSvg} from '../web/art.js';
import {REGIONS,REGION_ORDER} from '../web/journeys.js';
import {regionLandmarks} from '../web/landmarks.js';
const out=resolve(process.argv[2]||'artifacts');
await mkdir(out,{recursive:true});
async function sheet(name,entries,columns=8){
 const tileW=160,tileH=175,canvas=createCanvas(columns*tileW,Math.ceil(entries.length/columns)*tileH),ctx=canvas.getContext('2d');
 ctx.fillStyle='#f3f1e5';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let i=0;i<entries.length;i++){
  const [label,svg]=entries[i],x=i%columns*tileW,y=Math.floor(i/columns)*tileH;
  const asset=await loadImage(Buffer.from(svg));ctx.drawImage(asset,x+24,y+8,112,125);
  ctx.fillStyle='#32473b';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(label,x+tileW/2,y+155,tileW-10);
 }
 await writeFile(resolve(out,name),canvas.toBuffer('image/png'));
}
await sheet('weapons.png',Object.entries(WEAPONS).map(([key,d])=>[d.name,itemSvg(d.mythicalOnly?makeMythicalWeapon(key):makeItem(key,1))]));
await sheet('characters-and-cosmetics.png',[
 ...['Orc','Kobold','Nereid','Shade','Sylph','Celestial','Owlkin','Bearkin','Fae','Ent'].map(race=>[race,portraitSvg(generateHero({race,classId:'vanguard',level:5}))]),
 ...Object.keys(MYTHICAL_HEROES).map(key=>[MYTHICAL_HEROES[key].name,portraitSvg(makeMythicalHero(key))]),
 ...Object.keys(COSMETICS).map(key=>[COSMETICS[key].name,cosmeticSvg(key)]),
 ...['ammonite','trilobite','pterosaur'].map(key=>[key,petSvg(makePet(key,20))])
],6);
const canvas=createCanvas(1800,1100),ctx=canvas.getContext('2d');
ctx.fillStyle='#f3f1e5';ctx.fillRect(0,0,canvas.width,canvas.height);
for(let index=0;index<REGION_ORDER.length;index++){
 const key=REGION_ORDER[index],region=REGIONS[key],roads=region.roads.map(e=>{
  const a=region.nodes.find(n=>n.id===e.a),b=region.nodes.find(n=>n.id===e.b),offset=(e.combat%2?1:-1)*34;
  return `<path d="M${a.x*9} ${a.y*13}Q${(a.x+b.x)*4.5+offset} ${(a.y+b.y)*6.5-offset} ${b.x*9} ${b.y*13}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-dasharray="${e.style==='wild'?'3 17':'none'}"/>`;
 }).join('');
 const nodes=region.nodes.map(n=>`<circle cx="${n.x*9}" cy="${n.y*13}" r="${n.kind==='boss'?25:n.kind==='miniboss'?18:11}" fill="${n.kind==='boss'?'#b95447':n.kind==='miniboss'?'#bd8844':'#e4d9b1'}" stroke="#3e563d" stroke-width="4"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1300"><rect width="900" height="1300" fill="#e0e4cb"/><rect width="900" height="1300" fill="${LOCATIONS[key].color}" opacity=".17"/>${regionLandmarks(key)}${roads}${nodes}</svg>`;
 ctx.drawImage(await loadImage(Buffer.from(svg)),index*360+8,20,344,994);
 ctx.fillStyle='#32473b';ctx.textAlign='center';ctx.font='16px sans-serif';ctx.fillText(LOCATIONS[key].name,index*360+180,1048,350);
}
await writeFile(resolve(out,'map-landmarks.png'),canvas.toBuffer('image/png'));
console.log('Wrote weapons, character/cosmetic, and map sheets to '+out);
