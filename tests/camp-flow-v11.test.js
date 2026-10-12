import { pixelMarkup } from "../web/pixel-markup.js";
import { pixelTerrainSvg, pixelBuildingSvg, pixelPropSvg } from "../web/pixel-art.js";
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';
import * as D from '../web/data.js';import * as P from '../web/progression.js';import * as Camp from '../web/camp.js';import {ExpeditionSimulation} from '../web/simulation.js';import {Battle,seeded} from '../web/engine.js';import {CampChatter} from '../web/chatter.js';import {exportCamp,readCampBackup} from '../web/saves.js';import {BUILDINGS} from '../web/world.js';import {portraitSvg,petSvg,icon} from '../web/art.js';
const NOW=Date.UTC(2026,9,11,12);
function launch(){const g=D.initialGame(seeded(21),NOW);P.stageCrossroads(g);assert.ok(P.lockRoute(g));const sim=new ExpeditionSimulation(g,NOW);sim.observe({id:null,visible:true,speed:1},NOW);assert.ok(sim.action('launch',{seed:41},NOW).ok);const r=sim.g.expeditions[0];sim.observe({id:r.id,visible:true,speed:1},NOW);return{sim,r};}
function win(sim,r,rest=null){if(rest)r.roadItinerary[r.stage].rest=rest;const b=sim.battle(r);b.result={winner:0,time:5,heroes:P.party(sim.g,r).map(h=>({...structuredClone(h),hp:D.stats(h).hp})),converted:[]};r.phase='battle';sim.step(r,1/30);assert.equal(r.phase,'interlude');}
function tick(sim,seconds){const start=sim.g.lastClock,end=start+seconds*1000;for(let at=start+100;at<=end;at+=100)sim.advance(at,Infinity);}

test('a watched new expedition starts with AUTO off and units do not fight during the countdown',()=>{
 const{sim,r}=launch();assert.equal(r.auto,false);const b=sim.battle(r),positions=b.units.map(u=>[u.x,u.y,u.hp]);tick(sim,3.5);assert.equal(r.phase,'prepare');assert.equal(b.time,0);assert.deepEqual(b.units.map(u=>[u.x,u.y,u.hp]),positions);tick(sim,.6);assert.equal(r.phase,'battle');assert.ok(b.time>0);const text=readFileSync(new URL('../web/app.js',import.meta.url),'utf8'),a=text.indexOf('function countdownLabel('),z=text.indexOf('\nfunction ',a+10);const label=runInNewContext(text.slice(a,z)+';countdownLabel');assert.deepEqual([4,3,2,1].map(n=>label(n)),['3','2','1','FIGHT']);
});
test('manual road encounters wait indefinitely for Continue and never accumulate unseen catch-up steps',()=>{
 const{sim,r}=launch();win(sim,r);assert.equal(r.stop.type,'road');const stage=r.stage;tick(sim,90);assert.equal(r.stage,stage);assert.equal(r.phase,'interlude');assert.equal(r.pendingSeconds,0);assert.equal(sim.snapshot().catchingUp,false);assert.ok(sim.action('continue',{id:r.id},sim.g.lastClock).ok);assert.equal(r.phase,'prepare');assert.equal(r.stage,stage+1);assert.equal(r.phaseSeconds,4);assert.equal(r.pendingSeconds,0);assert.equal(r.auto,false);
});
test('manual Continue collects an unclaimed chest once before starting the next countdown',()=>{
 const{sim,r}=launch();win(sim,r,'chest');const items=sim.g.inventory.length,gold=sim.g.gold;tick(sim,30);assert.equal(r.stop.done,false);assert.equal(sim.g.inventory.length,items);assert.equal(r.earned.items,0);assert.ok(sim.action('continue',{id:r.id},sim.g.lastClock).ok);assert.equal(sim.g.inventory.length,items+1);assert.equal(r.earned.items,1);assert.ok(sim.g.gold>gold);assert.equal(sim.action('continue',{id:r.id},sim.g.lastClock).ok,false);assert.equal(sim.g.inventory.length,items+1);
});
test('AUTO collects a stop and continues while its OFF control returns fast observation to 1x',()=>{
 const{sim,r}=launch();win(sim,r,'chest');assert.ok(sim.action('auto',{id:r.id,on:true},sim.g.lastClock).ok);tick(sim,12.2);assert.equal(r.stage,1);assert.equal(r.phase,'prepare');assert.equal(r.earned.items,1);sim.observe({id:r.id,visible:true,speed:3},sim.g.lastClock);assert.equal(r.auto,true);assert.ok(sim.action('auto',{id:r.id,on:false},sim.g.lastClock).ok);assert.equal(r.auto,false);assert.equal(sim.observation.speed,1);
});
test('navigation, leaving the tab, and fast observation each enable AUTO; background stays 1x',()=>{
 for(const kind of ['navigate','hidden','fast']){const{sim,r}=launch();win(sim,r);if(kind==='navigate')assert.ok(sim.action('navigate',{screen:'camp'},sim.g.lastClock).ok);else sim.observe({id:r.id,visible:kind!=='hidden',speed:kind==='fast'?2:3},sim.g.lastClock);assert.equal(r.auto,true,kind);assert.equal(sim.rate(r),kind==='fast'?2:1);const elapsed=r.elapsedSeconds;tick(sim,1);assert.ok(Math.abs(r.elapsedSeconds-elapsed-(kind==='fast'?2:1))<.04);}
});
test('reloading a manual checkpoint resumes in background AUTO without resetting characters or progress',()=>{
 const{sim,r}=launch();win(sim,r);const old=sim.snapshot().game;old.version=12;const next=new ExpeditionSimulation(old,sim.g.lastClock+1000);next.drain(Infinity);assert.equal(next.g.version,12);assert.equal(next.g.expeditions[0].auto,true);assert.deepEqual(next.g.roster.map(h=>h.id),old.roster.map(h=>h.id));assert.equal(next.g.gold,old.gold);assert.ok(P.validateSave(next.snapshot().game));
});
test('race controls height and width, class adjusts width, and artwork can render both dimensions independently',()=>{
 const appearance={height:1,width:1},make=(race,classId='ranger')=>D.generateHero({race,classId,appearance},seeded(44)),human=make('Human'),elf=make('Elf'),guardian=make('Human','guardian'),dwarf=make('Dwarf'),orc=make('Orc');assert.equal(D.characterSize(human)[0],D.characterSize(elf)[0]);assert.ok(D.characterSize(elf)[1]<D.characterSize(human)[1]);assert.ok(D.characterSize(dwarf)[1]>D.characterSize(human)[1]);assert.ok(D.characterSize(orc)[1]>D.characterSize(human)[1]);assert.ok(D.characterSize(guardian)[1]>D.characterSize(human)[1]);assert.match(portraitSvg(guardian),/preserveAspectRatio="none"/);
});
test('Camp chatter has irregular long gaps, short comments, one speaker, and avoids consecutive repeats',()=>{
 const director=new CampChatter(seeded(8)),heroes=D.initialGame(seeded(41),NOW).roster,events=[];let before=null;for(let t=NOW;t<NOW+900000;t+=100){director.update(t,heroes);const speaking=heroes.filter(h=>director.forHero(h.id,t));assert.ok(speaking.length<=1);if(speaking.length&&director.speaker!==before){events.push({at:t,id:director.speaker,text:director.line});before=director.speaker;}}
 assert.ok(events.length>=4&&events.length<=12);assert.ok(events.every(e=>e.text.length<30));const gaps=events.slice(1).map((e,i)=>e.at-events[i].at);assert.ok(gaps.every(g=>g>=60000));assert.ok(new Set(gaps).size>2);assert.ok(events.slice(1).every((e,i)=>e.id!==events[i].id));
});
test('Camp world has only constructed services, shadow plots and an unbuilt Market site',async()=>{
 const {createHomesteadUi}=await import('../web/homestead-ui.js'),game=D.initialGame(seeded(9),NOW);
 const html=createHomesteadUi({getGame:()=>game,esc:s=>s,button:(s,a='',c='')=>`<button class="${c}" ${a}>${s}</button>`}).campMap();
 assert.match(html,/data-map-camera="camp"/);assert.match(html,/data-building="tent"/);assert.match(html,/data-building="market"/);
 assert.doesNotMatch(html,/data-market-visit/);assert.doesNotMatch(html,/camp-expansion-arrow/);
 for(const key of ['training','blacksmith','kitchen','alchemist'])assert.ok(!html.includes('data-building="'+key+'"'));
 for(const key of ['west','east','south'])assert.ok(html.includes('data-expand-camp="'+key+'"'));
});

test('Camp backups preserve a running battle and its inventory when moving browser origins',()=>{
 const{sim,r}=launch();tick(sim,5);const game=sim.snapshot().game;game.campName='Willow Rest';const restored=readCampBackup(exportCamp(game));assert.ok(restored);assert.equal(restored.campName,'Willow Rest');assert.deepEqual(restored.roster.map(h=>h.id),game.roster.map(h=>h.id));assert.deepEqual(restored.inventory,game.inventory);assert.equal(restored.expeditions[0].battleState.time,game.expeditions[0].battleState.time);assert.equal(readCampBackup('not json'),null);assert.equal(readCampBackup('{"version":11}'),null);const corrupt=structuredClone(game);corrupt.expeditions[0].battleState={version:1};assert.equal(readCampBackup(exportCamp(corrupt)),null);const legacy=structuredClone(game);legacy.version=10;delete legacy.expeditions[0].auto;assert.equal(readCampBackup(JSON.stringify(legacy)),null);
});
