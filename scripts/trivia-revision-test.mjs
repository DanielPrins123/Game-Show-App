import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const deck=JSON.parse(fs.readFileSync('public/trivia/2026-09-29.json','utf8'));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:768}}),host=await context.newPage(),tv=await context.newPage(),errors=[];
 context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));host.on('pageerror',e=>errors.push(String(e)));tv.on('pageerror',e=>errors.push(String(e)));
 await host.goto('http://127.0.0.1:4173/#/trivia');await host.getByRole('button',{name:'Start this set',exact:true}).click();
 await tv.goto('http://127.0.0.1:4173/#/trivia/display');await tv.getByAltText('Outspoken Entertainment').waitFor();
 const click=name=>host.getByRole('button',{name,exact:true}).click();
 const state=()=>host.evaluate(()=>JSON.parse(localStorage.getItem('trivia.session.v1')));
 await click('Next →');await click('Next →');await click('Show question & start timer');
 await tv.getByText(deck.cards[1].prompt,{exact:true}).waitFor();assert.equal(await tv.getByText('Antarctica',{exact:true}).count(),0);assert.equal(await tv.getByAltText('Outspoken Entertainment').count(),0);
 await host.getByRole('link',{name:'Score sheet',exact:true}).click();await host.locator('.trivia-grading-card').getByText('Antarctica',{exact:true}).waitFor();await host.getByLabel('Team 1 Round 1 Question 1 points',{exact:true}).fill('45');assert.equal(await tv.getByText('Antarctica',{exact:true}).count(),0);
 await host.getByRole('link',{name:'Game editor & library',exact:true}).click();await click('Edit current game');
 const list=host.locator('.trivia-screen-list>button[draggable]');await list.nth(1).dragTo(list.nth(3));await click('Apply edits to current show');await host.getByText('Edits applied.',{exact:false}).waitFor();await tv.getByText(deck.cards[1].prompt,{exact:true}).waitFor();assert.equal((await state()).index,3);assert.equal((await state()).phase,'question');
 // Draft selections don't move the TV. Editing the active answer hides the board on Apply.
 await host.waitForTimeout(250);await list.filter({hasText:deck.cards[1].prompt}).click();await host.getByLabel('Private answers (one per line)',{exact:true}).fill('Antarctica edited');await host.evaluate(()=>document.body.dataset.beforeEdit=JSON.parse(localStorage.getItem('trivia.session.v1')).deckId);await click('Apply edits to current show');await host.waitForFunction(()=>JSON.parse(localStorage.getItem('trivia.session.v1')).deckId!==document.body.dataset.beforeEdit);await tv.getByText(deck.cards[1].prompt,{exact:true}).waitFor();assert.equal(await tv.getByText('Antarctica edited',{exact:true}).count(),0);
 // Delete another card; the current title must keep its identity.
 await list.nth(1).click();host.once('dialog',d=>d.accept());await click('Delete screen');await click('Apply edits to current show');await host.getByText('Edits applied.',{exact:false}).waitFor();await host.waitForFunction(()=>JSON.parse(localStorage.getItem('trivia.session.v1')).index===2);
 await host.getByRole('link',{name:'Presenter',exact:true}).click();await click('Reveal next answer (0/1)');await tv.getByText('Antarctica edited',{exact:true}).waitFor();
 await host.getByLabel('Game mode',{exact:true}).selectOption('feud');await host.getByRole('heading',{name:'Host desk',exact:true}).waitFor();await host.getByLabel('Game mode',{exact:true}).selectOption('trivia');await host.locator('.trivia-controls').waitFor();await tv.getByText('Antarctica edited',{exact:true}).waitFor();
 // Use the original complete set for geometry and arbitrary answer reveals.
 await host.getByRole('link',{name:'Game editor & library',exact:true}).click();await host.locator('.trivia-library-item').filter({has:host.getByText('09.29.2026 Trivia',{exact:true})}).first().getByRole('button',{name:'Start this set',exact:true}).click();
 async function set(values){await host.evaluate(v=>{const s=JSON.parse(localStorage.getItem('trivia.session.v1'));localStorage.setItem('trivia.session.v1',JSON.stringify({...s,...v,revision:s.revision+1}));window.dispatchEvent(new StorageEvent('storage',{key:'trivia.session.v1'}));},values);await tv.waitForTimeout(60);}
 await host.getByLabel('Jump to trivia screen',{exact:true}).selectOption('23');await click('Show question & start timer');await click('Reveal next answer (0/10)');await tv.getByText('Belgium',{exact:true}).waitFor();await host.screenshot({path:'qa/trivia-dark-presenter-final.png'});assert.ok(await host.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'Final presenter fits without page scrolling');assert.equal(await tv.getByText('Spain',{exact:true}).count(),0);await tv.reload();await tv.getByText('Belgium',{exact:true}).waitFor();
 for(const size of [{width:1280,height:720},{width:1920,height:1080}]){
  await tv.setViewportSize(size);
  for(let index=0;index<deck.cards.length;index++){const c=deck.cards[index];for(const phase of c.kind==='question'?['card','question','answers']:['card']){
   await set({index,phase,revealed:phase==='answers'?c.answers.length:0,revealedAnswers:undefined,started:false,end:null});
   const bad=await tv.locator('.trivia-slide').evaluate(slide=>{const frame=slide.getBoundingClientRect(),footer=slide.querySelector('footer')?.getBoundingClientRect();return [...slide.querySelectorAll('h1,h2,.trivia-question-note,.trivia-answer-list li,.trivia-round-categories')].filter(el=>{const b=el.getBoundingClientRect();return b.bottom>frame.bottom+1||b.top<frame.top-1||b.right>frame.right+1||b.left<frame.left-1||(footer&&b.bottom>footer.top+1);}).map(e=>e.textContent);});assert.deepEqual(bad,[],size.width+' '+index+' '+phase);
  }}
 }
 await set({index:23,phase:'answers',revealed:10,revealedAnswers:undefined});await tv.screenshot({path:'qa/trivia-dark-final.png'});
 await set({index:9,phase:'question',revealed:0,revealedAnswers:[],started:false});await tv.screenshot({path:'qa/trivia-dark-question.png'});await host.screenshot({path:'qa/trivia-dark-presenter.png'});
 await set({index:0,phase:'intro'});await tv.screenshot({path:'qa/trivia-dark-intro.png'});
 assert.deepEqual(errors,[]);console.log('PASS: included set, mode switch, private grading, drag reorder and safe live edits, individual reveals/reload/sync, all 24 cards at 720p and 1080p.');
}catch(e){for(const c of browser.contexts())for(const [i,p] of c.pages().entries())await p.screenshot({path:`test-results/revision-error-${i}.png`});throw e;}finally{await browser.close();}
