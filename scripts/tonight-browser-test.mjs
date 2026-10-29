import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const c=await b.newContext({viewport:{width:1366,height:768}}),p=await c.newPage(),tv=await c.newPage();
 await p.goto('http://127.0.0.1:4173/#/home');await p.getByLabel('Family Feud set').selectOption('feud-2026-10-29');await p.getByRole('button',{name:'Start new game',exact:true}).click();await tv.goto('http://127.0.0.1:4173/#/display');await tv.getByTestId('opening-logo').waitFor();await tv.screenshot({path:'test-results/tonight-intro.png'});
 const jump=p.getByLabel('Jump to show slide');await jump.selectOption('question-20261029-q4');await tv.locator('.answer-grid').waitFor();await p.getByRole('button',{name:'Reveal answer 4',exact:true}).click();await tv.getByTestId('slot-4').locator('strong').waitFor();assert.equal(await tv.getByTestId('slot-4').locator('.count').innerText(),'');await tv.screenshot({path:'test-results/tonight-question.png'});
 for(let n=1;n<=16;n++){await jump.selectOption(`question-20261029-q${n}`);await p.waitForFunction(i=>JSON.parse(localStorage.getItem('feud.session.v1')).index===i,n-1);await p.evaluate(()=>scrollTo(0,0));const bottom=await p.locator('.feud-controls').evaluate(e=>e.getBoundingClientRect().bottom);assert.ok(bottom<=768,`Q${n} controls: ${bottom}`);}
 await p.getByLabel('Team Blue question 16',{exact:true}).fill('75');await jump.selectOption('scores-beforeFinale');await p.getByRole('button',{name:'Next →',exact:true}).click();await p.getByLabel('Finale question').waitFor();assert.equal(await p.getByLabel('Finale question').locator('option').count(),23);
 await p.getByLabel('Finale question').selectOption('finale-20261029-spare-2');await p.getByRole('button',{name:'Next →',exact:true}).click();await tv.waitForFunction(()=>document.querySelectorAll('.answer-tile').length===4);await p.getByRole('button',{name:'Reveal answer 1',exact:true}).click();await tv.getByTestId('slot-1').locator('strong').waitFor();assert.equal(await tv.getByTestId('slot-1').locator('strong').innerText(),'President');
 await p.reload();await p.getByLabel('Team Blue question 16',{exact:true}).waitFor();assert.equal(await p.getByLabel('Team Blue question 16',{exact:true}).inputValue(),'75');
 console.log('PASS: October 29 set, 16 question layouts, unknown count, two-tab reveal, spare final selection and score persistence.');
}finally{await b.close();}
