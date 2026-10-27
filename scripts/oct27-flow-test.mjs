import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const c=await b.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}),h=await c.newPage(),tv=await c.newPage();
 await h.goto('http://127.0.0.1:4173/#/trivia');
 await h.locator('.trivia-library-item').filter({hasText:'Included October 27 set'}).getByRole('button',{name:'Start this set',exact:true}).click();
 await h.getByLabel('Trivia team 1 name').waitFor();
 await h.getByRole('button',{name:'+ Add team',exact:true}).click();
 h.once('dialog',d=>d.dismiss());await h.getByRole('button',{name:'Remove Team 2',exact:true}).click();assert.equal(await h.locator('.trivia-all-scores tbody tr').count(),3);
 h.once('dialog',d=>d.accept());await h.getByRole('button',{name:'Remove Team 2',exact:true}).click();
 await h.waitForFunction(()=>document.querySelectorAll('.trivia-all-scores tbody tr').length===2);await h.reload();await h.getByLabel('Trivia team 2 name').waitFor();assert.equal(await h.getByLabel('Trivia team 2 name').inputValue(),'Team 3');assert.ok(h.url().endsWith('#/trivia/presenter'));
 await h.evaluate(()=>{const s=JSON.parse(localStorage.getItem('trivia.session.v1'));s.teams=[30,30,20,10,10].map((points,i)=>({id:String(i),name:`Club ${i+1}`,scores:{'slide-2':points}}));localStorage.setItem('trivia.session.v1',JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:'trivia.session.v1'}));});
 await tv.goto('http://127.0.0.1:4173/#/trivia/display');await h.getByRole('button',{name:'Show scores on TV',exact:true}).click();await tv.locator('.trivia-ranks').waitFor();
 assert.equal(await tv.locator('.trivia-ranks [data-rank]').count(),0);assert.ok(!(await tv.locator('.trivia-ranks').innerText()).includes('#'));
 for(const count of [2,3,5]){await h.getByRole('button',{name:'Reveal next team ↑',exact:true}).click();await tv.waitForFunction(n=>document.querySelectorAll('.trivia-ranks .shown').length===n,count);assert.equal(await tv.locator('.trivia-ranks>div:not(.shown)[data-rank]').count(),0);}
 await tv.screenshot({path:'qa/oct27-tied-standings.png'});
 await h.getByRole('button',{name:'Reveal next team ↑',exact:true}).focus();await h.keyboard.press('u');await tv.waitForFunction(()=>document.querySelectorAll('.trivia-ranks .shown').length===3);
 h.once('dialog',d=>d.accept());await h.getByRole('button',{name:'Remove Club 5',exact:true}).click();await tv.waitForFunction(()=>document.querySelectorAll('.trivia-ranks>div').length===4);assert.equal(await tv.getByText('Club 5',{exact:true}).count(),0);
 await h.reload();await h.getByLabel('Trivia team 1 name').waitFor();assert.equal(await h.locator('.trivia-all-scores tbody tr').count(),4);
 await h.goto('http://127.0.0.1:4173/#/presenter');await h.getByRole('heading',{name:'Score sheet',exact:true}).waitFor();await h.getByLabel('Intro host name').fill('Test host');await h.waitForFunction(()=>localStorage.getItem('feud.session.v1'));
 await h.evaluate(()=>{const key='feud.session.v1';const s=JSON.parse(localStorage.getItem(key));if(!s)throw Error('Missing Feud session');s.scoreShow={id:'ties',title:'Test',date:'',venue:'',stage:'final',revealed:0,teams:[30,30,10,10].map((total,i)=>({id:String(i),name:`Feud ${i+1}`,total,rank:i<2?1:3}))};localStorage.setItem(key,JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key}));});
 await tv.goto('http://127.0.0.1:4173/#/display');await tv.getByTestId('score-show').waitFor();assert.equal(await tv.locator('.show-rank').count(),0);
 await h.getByRole('button',{name:'Reveal next team ↑',exact:true}).last().click();await tv.waitForFunction(()=>document.querySelectorAll('.score-show-row.shown').length===2);
 await h.getByRole('button',{name:'Undo reveal',exact:true}).click();await tv.waitForFunction(()=>document.querySelectorAll('.score-show-row.shown').length===0);
 console.log('PASS: team removal/cancel/reload, inline scoring, hidden ranks, whole tied-group reveals and undo, audience synchronization in both modes.');
}finally{await b.close();}
