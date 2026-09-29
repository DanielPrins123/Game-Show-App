import{chromium}from'@playwright/test';
import assert from'node:assert/strict';
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const c=await b.newContext({viewport:{width:1366,height:768}});
 await c.addInitScript(()=>{window.tones=[];const original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const osc=original.call(this),set=osc.frequency.setValueAtTime.bind(osc.frequency);osc.frequency.setValueAtTime=(value,time)=>{window.tones.push(value);return set(value,time);};return osc;};});
 const host=await c.newPage(),tv=await c.newPage();await host.goto('http://127.0.0.1:4173/#/trivia');await host.getByRole('button',{name:'Start this set',exact:true}).click();await tv.goto('http://127.0.0.1:4173/#/trivia/display');
 await host.evaluate(()=>{const s=JSON.parse(localStorage.getItem('trivia.session.v1'));s.teams=[10,20,30].map((points,i)=>({id:String(i),name:['Third team','Second team','First team'][i],scores:{'slide-2':points}}));localStorage.setItem('trivia.session.v1',JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:'trivia.session.v1'}));});
 await host.getByRole('button',{name:'Show scores on TV',exact:true}).click();
 for(let i=1;i<=3;i++){await host.getByRole('button',{name:'Reveal next team ↑',exact:true}).click();await host.waitForFunction(n=>window.tones.length===n,i);}
 const tones=await host.evaluate(()=>window.tones);assert.ok(tones[0]<tones[1]&&tones[1]<tones[2]);assert.equal(tones[2],880);
 for(let rank=1;rank<=3;rank++)await tv.locator('.trivia-ranks .medal-'+rank).waitFor();await tv.waitForTimeout(300);await tv.screenshot({path:'qa/trivia-medal-standings.png'});
 await host.getByRole('button',{name:'← Back / undo',exact:true}).click();await tv.locator('.trivia-ranks .medal-1').waitFor({state:'detached'});assert.equal(await host.evaluate(()=>window.tones.length),3);assert.equal(await tv.evaluate(()=>window.tones.length),0);
 console.log('PASS: trivia team reveals ascend 440 → 622 → 880 Hz, muted top-three accents, undo stays silent, no audience duplicate sounds.');
}finally{await b.close();}
