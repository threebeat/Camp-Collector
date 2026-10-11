import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialGame,generateHero,makeItem,makePet,rarity,heroRarity,itemRarity,facetRarity,classPoints,classTree,stats,abilities,itemInfo,weaponModifiers,WEAPONS,RACES,characterSize,equipmentRestriction,allGear,validClassNodes} from '../web/data.js';
import {weaponShape} from '../web/weapons.js';
import {portraitSvg,itemSvg} from '../web/art.js';
import {Battle,seeded} from '../web/engine.js';
import {ExpeditionSimulation} from '../web/simulation.js';
import * as P from '../web/progression.js';
import * as Camp from '../web/camp.js';
import {REGIONS,regionalRoutes} from '../web/journeys.js';
import {cleanItem,cleanTeam} from '../worker/api.js';
const NOW=Date.UTC(2026,9,11,10),fresh=()=>initialGame(seeded(47),NOW);
function funded(){const g=fresh();g.buildings.blacksmith=1;g.buildings.archaeology=1;g.gold=100000;Camp.addGems(g,200);for(const k in g.materials)g.materials[k]=200;return g;}
function closeRun(g,r,winner=0){r.phase='battle';return P.resolveBattle(g,r,{winner,time:35,heroes:P.party(g,r).map(h=>({id:h.id,hp:winner===0?stats(h).hp*.5:0}))},g.lastClock);}

test('all ordinary progression uses exactly three rarity thresholds and never levels into Mythical',()=>{
 for(const [level,tier] of [[1,0],[19,0],[20,1],[39,1],[40,2],[59,2],[60,3],[100,3]]){
  const h=generateHero({level}),i=makeItem('musket',level),a={level,rarityTier:4};
  assert.equal(rarity(level),tier);assert.equal(heroRarity(h),tier);assert.equal(itemRarity(i),tier);assert.equal(facetRarity(a),tier);
 }
 assert.equal(heroRarity(generateHero({level:1,boss:true})),2);
 assert.equal(itemRarity({...makeItem('musket',60),mythical:true}),4);
 const h=generateHero({level:100});assert.equal(classPoints(h),3);const mythical={...makeItem('dawncore',60),mythical:true,evolution:3,prefix:'flaming',affix:'might',enchantment:'meteor'};assert.equal(itemRarity(cleanItem(mythical)),4);
});
test('every class tree requires an actual ancestor and locks alternatives at both later forks',()=>{
 const g=funded(),h=g.roster[0];h.level=60;
 assert.equal(Camp.chooseClassNode(g,h,'breaker:power:surge'),false);
 assert.ok(Camp.chooseClassNode(g,h,'breaker:0'));
 assert.equal(Camp.chooseClassNode(g,h,'duelist:0'),false);
 assert.ok(Camp.chooseClassNode(g,h,'breaker:control'));
 assert.equal(Camp.chooseClassNode(g,h,'breaker:power'),false);
 assert.ok(Camp.chooseClassNode(g,h,'breaker:control:shelter'));
 assert.equal(Camp.chooseClassNode(g,h,'breaker:control:surge'),false);
 assert.ok(validClassNodes(h));assert.equal(classPoints(h),0);
 const other={...structuredClone(h),classPath:'breaker',classNodes:['breaker:0','breaker:power','breaker:power:surge']};
 assert.ok(stats(other).attack>stats(h).attack);assert.ok(stats(h).hp>stats(other).hp);
 assert.ok(classTree(h).flatMap(p=>p.nodes).some(n=>n.parent==='breaker:control'));
});
test('weapons can choose modifiers in any order, transform once per threshold, and keep their identity',()=>{
 const g=funded(),i=makeItem('musket',19);g.inventory.push(i);const id=i.id;
 assert.equal(Camp.evolveObject(g,'weapon',id,{kind:'prefix',key:'flaming'}),false);
 i.level=20;assert.ok(Camp.evolveObject(g,'weapon',id,{kind:'affix',key:'might'}));
 assert.equal(i.affix,'might');assert.equal(weaponModifiers(i).length,1);
 assert.equal(Camp.evolveObject(g,'weapon',id,{kind:'prefix',key:'flaming'}),false);
 i.level=40;assert.equal(Camp.evolveObject(g,'weapon',id,{kind:'affix',key:'impact'}),false);
 assert.ok(Camp.evolveObject(g,'weapon',id,{kind:'enchantment',key:'gravity'}));
 assert.equal(itemInfo(i).spell,'gravity');assert.equal(weaponModifiers(i).length,2);
 i.level=60;assert.ok(Camp.evolveObject(g,'weapon',id,{kind:'prefix',key:'glacial'}));
 assert.equal(i.id,id);assert.equal(weaponModifiers(i).length,3);assert.equal(i.evolution,3);
 assert.ok(itemInfo(i).slow);assert.equal(Camp.evolveObject(g,'weapon',id),false);
 assert.equal(P.migrateSave(g).inventory[0].affix,'might');
 assert.equal(weaponModifiers(P.migrateSave(g).inventory[0]).length,3);
});
test('firearms, scatter prefixes and spell enchantments change real automatic combat',()=>{
 const h=generateHero({classId:'ranger',race:'Human',level:40,items:[{...makeItem('blunderbuss',40),prefix:'flaming',enchantment:'gravity',evolution:2}]}),enemies=[0,1,2].map(()=>generateHero({classId:'guardian',race:'Human',level:70})),b=new Battle([h],0,51,enemies);
 b.map.objects=[];b.units.forEach((u,i)=>{u.x=i?530+i*15:440;u.y=220;u.speed=0;u.abilityAt=Infinity;});
 b.attack(b.units[0],b.units[1]);assert.equal(b.projectiles.length,3);assert.ok(b.projectiles.every(p=>p.type==='fire'));
 b.units[0].scrollAt={};b.units[0].attackAt=Infinity;b.time=6.1;b.update(1/30);
 assert.ok(b.events.some(e=>e.text.includes('Singularity')||e.text.includes('blunderbuss')));
 assert.ok(b.zones.some(z=>z.element==='gravity'));assert.ok(b.units[0].mana<b.units[0].maxMana);
 assert.equal(abilities(h).length,2);
 const gun=new Battle([generateHero({classId:'ranger',items:[makeItem('musket')]})],0,41,[enemies[0]]);gun.attack(gun.units[0],gun.units[1]);assert.equal(gun.projectiles[0].type,'bullet');
});
test('base weapon art is distinct and physical slot restrictions cover guns, bows, blades and heavy arms',()=>{
 assert.ok(Object.keys(WEAPONS).length>=50);
 assert.equal(new Set(Object.values(WEAPONS).map(w=>w.shape)).size,Object.keys(WEAPONS).length);
 for(const [key,d] of Object.entries(WEAPONS)){assert.ok(d.weaponKind);assert.ok(weaponShape(key).includes(d.shape.split('|')[0]));assert.ok(itemSvg(makeItem(key)).includes('data-weapon-art="'+key+'"'));}
 const ranger=generateHero({classId:'ranger'}),mage=generateHero({classId:'mage'}),warrior=generateHero({classId:'vanguard'});
 assert.equal(equipmentRestriction(ranger,makeItem('musket'),0),'');
 assert.match(equipmentRestriction(warrior,makeItem('revolver'),0),/Requires/);
 assert.match(equipmentRestriction(ranger,makeItem('rapier'),0),/Requires/);
 assert.equal(equipmentRestriction(mage,makeItem('sunstaff'),0),'');
 assert.match(equipmentRestriction(warrior,makeItem('greatblade'),0),/Strength/);
});
test('Market stock is mostly Common with a small high-rarity selection and rotates exactly at 12 hours',()=>{
 const g=funded();g.screen='market';const stock=P.marketStock(g,'guild'),forge=P.marketStock(g,'forge');
 assert.ok(stock.filter(o=>heroRarity(o.hero)===0).length>stock.length*.8);
 for(const tier of [1,2,3]){assert.ok(stock.some(o=>heroRarity(o.hero)===tier));assert.ok(forge.some(o=>itemRarity(o.item)===tier));}
 const id=stock[0].id;g.lastClock=P.stockResetAt(g)-1;assert.equal(P.marketStock(g,'guild')[0].id,id);
 g.lastClock++;assert.notEqual(P.marketStock(g,'guild')[0].id,id);assert.equal(P.buy(g,{id}),false);
 assert.equal(P.stockResetAt(g)-g.lastClock,43200000);assert.equal(P.restockMarket(g,'forge'),false);
});
test('gem Shop buys canonical cosmetic or Mythical offers without charging gold and preserves exact change',()=>{
 const g=funded();g.screen='shop';const stock=P.gemShopStock(g),o=stock.find(o=>o.kind==='item'),gold=g.gold,gems=g.gems;
 assert.ok(stock.every(o=>o.gold===0&&['item','cosmetic','hero'].includes(o.kind)));
 assert.ok(P.buyGemShop(g,o.id));assert.equal(g.gold,gold);assert.equal(g.gems,gems-o.gems);
 assert.equal(itemRarity(g.inventory.at(-1)),4);assert.equal(P.buyGemShop(g,o.id),false);
 g.screen='market';assert.equal(P.buyGemShop(g,P.gemShopStock(g)[0].id),false);
});
test('daily, weekly and monthly Challenges are single encounters; prizes require a first victory',()=>{
 const g=funded();g.screen='challenges';assert.equal(P.stageTrial(g,{day:12}),false);
 assert.ok(P.stageTrial(g,{day:11}));let r=P.startExpedition(g,{seed:7});assert.equal(r.encounters,1);const gold=g.gold;
 closeRun(g,r,1);assert.equal(g.gold,gold);assert.equal(Object.keys(g.calendarClaims).length,0);
 g.lastClock+=90001;Camp.updateCampClock(g);g.screen='challenges';P.stageTrial(g,{day:11});r=P.startExpedition(g);const before=g.gold;closeRun(g,r);assert.equal(g.gold-before,r.victoryGold);assert.ok(g.calendarClaims['2026-10:11']);
 g.lastClock+=90001;Camp.updateCampClock(g);g.screen='challenges';P.stageTrial(g,{day:11});r=P.startExpedition(g);const paid=g.gold;closeRun(g,r);assert.equal(g.gold,paid);
 for(const kind of ['weekly','monthly']){g.lastClock+=90001;Camp.updateCampClock(g);g.screen='challenges';assert.ok(P.stageTrial(g,{challengeId:kind}));r=P.startExpedition(g);assert.equal(r.encounters,1);closeRun(g,r);assert.ok(g.challengeWins[kind+':'+r.period]);}
 assert.ok(g.cosmetics.includes('starlit'));
});
test('Camp expansions charge escalating costs and unlock real farms, gardens and capacity cabins',()=>{
 const g=funded();g.materials.wood=400;const first=Camp.expansionCost(g,'east'),gold=g.gold;assert.ok(Camp.expandCamp(g,'east'));assert.equal(g.gold,gold-first.gold);assert.ok(Camp.expansionCost(g,'west').gold>first.gold);assert.equal(Camp.expandCamp(g,'east'),false);
 assert.ok(Camp.buildCamp(g,'farm'));assert.equal(Camp.buildCamp(g,'cabins'),false);
 g.lastClock+=600000;const food=g.food;assert.ok(Camp.harvestCamp(g,'farm'));assert.equal(g.food,food+4);assert.equal(Camp.harvestCamp(g,'farm'),false);
 assert.ok(Camp.expandCamp(g,'west'));assert.ok(Camp.buildCamp(g,'cabins'));assert.equal(Camp.campCapacity(g),40);assert.ok(Camp.buildCamp(g,'cabins'));assert.equal(Camp.campCapacity(g),60);const h=generateHero({classId:'bard',level:40});g.roster.push(h);const belongings=h.items[0];assert.ok(Camp.releaseHero(g,h));assert.ok(!g.roster.includes(h));assert.ok(g.inventory.includes(belongings));
 assert.ok(Camp.expandCamp(g,'south'));assert.ok(Camp.buildCamp(g,'garden'));g.lastClock+=300000;const herbs=g.materials.herbs;assert.ok(Camp.harvestCamp(g,'garden'));assert.equal(g.materials.herbs,herbs+1);g.screen='market';assert.equal(Camp.setCampZone(g,'east'),false);
});
test('Owlkin and Bearkin have full growth tables, unique racial attributes, silhouettes, and Market recruitment',()=>{
 const owl=generateHero({race:'Owlkin',classId:'mage'}),bear=generateHero({race:'Bearkin',classId:'guardian'});
 for(const h of [owl,bear]){assert.ok(RACES[h.race].passive);assert.equal(h.attributes.length,1);for(const k of ['vitality','armor','strength','mind','agility','endurance'])assert.ok(Number.isFinite(stats(h)[k]));assert.ok(portraitSvg(h).length>2000);}
 assert.ok(characterSize(bear)[0]>characterSize(owl)[0]);assert.notEqual(portraitSvg(owl),portraitSvg(bear));
 const g=funded();assert.ok(P.marketStock(g,'guild').some(o=>o.hero.race==='Owlkin'));assert.ok(P.marketStock(g,'guild').some(o=>o.hero.race==='Bearkin'));
});
test('old v8 collections are reset, while shared snapshot equipment remains validated',()=>{const old=JSON.parse(readFileSync(new URL('./fixtures/v8-save.json',import.meta.url)));assert.equal(P.migrateSave(old),null);const g=fresh(),bad=structuredClone(g.roster);bad[0].level=40;bad[0].classNodes=['breaker:0','duelist:1'];assert.throws(()=>cleanTeam(bad,'bad-legacy'),/Invalid class branch/);const cleaned=cleanItem({...makeItem('musket',40),evolution:2,prefix:'flaming',enchantment:'gravity',attack:999999});assert.equal(cleaned.attack,undefined);assert.equal(weaponModifiers(cleaned).length,2);assert.equal(cleaned.level,40);});

test('the forest is sparse, irregular, deduplicated, and its farthest node is the castle boss',()=>{
 const r=REGIONS.greenway;assert.equal(r.nodes.length,18);assert.equal(new Set(r.roads.map(e=>[e.a,e.b].sort().join(':'))).size,r.roads.length);assert.ok(r.roads.length<32);
 assert.equal(r.nodes.reduce((a,b)=>a.y<b.y?a:b).id,'grove');assert.equal(r.nodes.find(n=>n.id==='grove').kind,'boss');
 assert.ok(new Set(r.nodes.map(n=>n.y)).size>12);assert.equal(regionalRoutes(fresh(),'greenway','clearing').length,3);
});
test('new challenges and the Shop leave unobserved expeditions at 1×',()=>{
 const g=fresh(),s=new ExpeditionSimulation(g,NOW);s.action('navigate',{screen:'crossroads'},NOW);s.action('lockRoute',{},NOW);s.action('launch',{seed:17},NOW);s.action('navigate',{screen:'shop'},NOW);s.advance(NOW+4000,Infinity);assert.ok(Math.abs(s.g.expeditions[0].elapsedSeconds-4)<.01);s.action('navigate',{screen:'challenges'},NOW+4000);s.advance(NOW+8000,Infinity);assert.ok(Math.abs(s.g.expeditions[0].elapsedSeconds-8)<.01);
});

test('deep journey loot gains real levels while weapon modifiers still require the Blacksmith',()=>{
 const g=funded(),r={status:'active',phase:'battle',mode:'journey',location:'jungle',level:80,stage:0,seed:61,reward:1,party:g.roster.map(h=>h.id),recruits:[],waveDefeated:[],earned:{kills:7,gold:0,gems:0,items:0},supplies:[]};
 assert.ok(P.recordDefeat(g,r,{id:'deep-foe',boss:false}));assert.equal(g.inventory.length,1);const loot=g.inventory[0];assert.ok(loot.level>=40&&loot.level<=80);assert.equal(itemRarity(loot),rarity(loot.level));assert.equal(weaponModifiers(loot).length,0);
});
