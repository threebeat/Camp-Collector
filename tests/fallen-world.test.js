import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYABLE_RACES, PLAYABLE_CLASSES, RACES, CLASSES, generateHero, stats, equipmentRestriction, abilities, initialGame } from '../web/data.js';
import { seeded, Battle } from '../web/engine.js';
import { cleanTeam } from '../worker/api.js';
import { marketStock, refreshStock } from '../web/progression.js';

test('all 168 current race/class combinations equip legally and survive authenticated challenge transport', () => {
  assert.equal(PLAYABLE_RACES.length, 14);
  assert.deepEqual(PLAYABLE_CLASSES.map(k => CLASSES[k].label), ['Fighter','Ranger','Rogue','Wizard','Cleric','Barbarian','Paladin','Bard','Monk','Necromancer','Alchemist','Psion']);
  for (const race of PLAYABLE_RACES) for (const classId of PLAYABLE_CLASSES) {
    const team=Array.from({length:3},()=>generateHero({race,classId},seeded(37)));
    for (const h of team) {
      assert.ok(!RACES[h.race].legacy && !CLASSES[h.classId].legacy);
      for (const [i,item] of h.items.entries()) assert.equal(equipmentRestriction(h,item,i),'',race+' '+classId);
      assert.equal(abilities(h).length,1);
    }
    const clean=cleanTeam(team,'ruin-world');
    assert.deepEqual(clean.map(h=>[h.race,h.classId,stats(h).hp]),team.map(h=>[h.race,h.classId,stats(h).hp]));
  }
});

test('random recruits and rotating Market offers use only the concept roster', () => {
  const random=seeded(918),seenRaces=new Set(),seenClasses=new Set();
  for(let i=0;i<3000;i++) {
    const h=generateHero({},random);
    seenRaces.add(h.race);seenClasses.add(h.classId);
    assert.ok(PLAYABLE_RACES.includes(h.race));assert.ok(PLAYABLE_CLASSES.includes(h.classId));
  }
  assert.deepEqual([...seenRaces].sort(),[...PLAYABLE_RACES].sort());
  assert.deepEqual([...seenClasses].sort(),[...PLAYABLE_CLASSES].sort());
  const g=initialGame();
  for(let i=0;i<14;i++) {
    g.lastClock=i*43200000;refreshStock(g);
    for(const o of marketStock(g,'guild')) {
      assert.ok(PLAYABLE_RACES.includes(o.hero.race));assert.ok(PLAYABLE_CLASSES.includes(o.hero.classId));
    }
  }
});

test('Barbarian combat remains deterministic across a live checkpoint', () => {
  const random=seeded(208),left=['Chitin','Gnoll','Naga'].map(race=>generateHero({race,classId:'berserker',level:12},random)),right=['Myconoid','Voidborn','Human'].map(race=>generateHero({race,classId:'vanguard',level:12},random));
  const battle=new Battle(left,0,42,right);
  for(let i=0;i<180;i++)battle.update(1/30);
  const copy=Battle.fromState(JSON.parse(JSON.stringify(battle.toState())));
  for(let i=0;i<900;i++){battle.update(1/30);copy.update(1/30);}
  assert.deepEqual(JSON.parse(JSON.stringify(copy.toState())),JSON.parse(JSON.stringify(battle.toState())));
  assert.ok(battle.units.some(u=>u.hp<u.maxHp));
});
