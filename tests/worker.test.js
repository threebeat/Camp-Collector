import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';

test('the actual expedition worker transports saved state and advances independently of the UI thread',async()=>{
 const worker=new Worker(new URL('./worker-harness.mjs',import.meta.url));let serial=0;const waiting=new Map();
 worker.on('message',data=>{if(waiting.has(data.requestId)){const {resolve,reject}=waiting.get(data.requestId);waiting.delete(data.requestId);if(data.error)reject(Error(data.error));else resolve(data);}});
 worker.on('error',error=>{for(const {reject} of waiting.values())reject(error);waiting.clear();});
 const request=(type,args,now)=>new Promise((resolve,reject)=>{const requestId=++serial;waiting.set(requestId,{resolve,reject});worker.postMessage({requestId,type,args,now});});
 const start=Date.now();
 try{
  await request('init',{saved:null},start);await request('navigate',{screen:'crossroads'},start);await request('lockRoute',{},start);const launched=await request('launch',{seed:52},start);assert.ok(launched.ok);const id=launched.game.selectedExpedition,baseline=launched.game.lastClock;
  await request('observe',{id,visible:false,speed:3},baseline);
  let data=await request('checkpoint',{},baseline+6000);for(let i=0;i<20&&data.game.expeditions[0].pendingSeconds>.04;i++)data=await request('checkpoint',{},baseline+6000);
  const r=data.game.expeditions[0];assert.ok(Math.abs(r.elapsedSeconds-6)<.1);assert.equal(r.phase,'battle');assert.ok(r.battleState.units.length>=5);
  const camp=await request('navigate',{screen:'camp'},baseline+6000);assert.equal(camp.game.screen,'camp');assert.equal(camp.game.expeditions[0].status,'active');assert.equal(camp.observation.id,null);
  const recalled=await request('recall',{id},baseline+6000);assert.ok(recalled.ok);assert.equal(recalled.game.roster.length,3);assert.equal(recalled.game.expeditions[0].status,'returned');
 }finally{await worker.terminate();}
});
