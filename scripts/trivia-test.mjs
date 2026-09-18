import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sample=process.env.PPTX_SAMPLE_PATH;
if(!sample)throw Error('Set PPTX_SAMPLE_PATH to a local PowerPoint to exercise the upload.');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
const context=await browser.newContext({viewport:{width:1366,height:768}});const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
const host=await context.newPage(),tv=await context.newPage();const base='http://127.0.0.1:4173/';
await host.goto(base+'#/trivia');await tv.goto(base+'#/trivia/display');
await host.getByLabel('Upload PowerPoint',{exact:true}).setInputFiles(sample);
await host.getByText('28 source slides → 20 questions · 4 rounds').waitFor();
assert.equal(await host.getByRole('button',{name:'Save & start new trivia night'}).isDisabled(),true);
await host.getByLabel('I reviewed the public prompts, private answers, images and scoring.').check();
await host.getByRole('button',{name:'Save & start new trivia night'}).click();
await tv.getByText('WITH YOUR HOST, DANIEL PRINS').waitFor();
assert.equal(await tv.locator('button,input,select').count(),0);
assert.equal(await tv.locator('nav').count(),0);
const state=()=>host.evaluate(()=>JSON.parse(localStorage.getItem('trivia.session.v1')));
const click=name=>host.getByRole('button',{name,exact:true}).click();
await click('Next →');await tv.getByText('Current Events',{exact:false}).waitFor();
await click('Next →');assert.equal((await state()).end,null);await click('Show question & start timer');
await tv.getByText(/On September 8th/).waitFor();assert.equal(await tv.getByText('Hawai’i',{exact:true}).count(),0);assert.ok((await state()).end>Date.now());
await click('Pause');await click('Reveal next answer (0/1)');await tv.getByText('Hawai’i',{exact:true}).waitFor();
await tv.reload();await tv.getByText('Hawai’i',{exact:true}).waitFor();
await host.getByRole('link',{name:'Score sheet',exact:true}).click();await host.getByLabel('Venue',{exact:true}).pressSequentially('Community Hall');
const first=host.getByLabel('Team 1 Question 1 points',{exact:true});await first.fill('5');await first.press('Enter');
assert.equal(await host.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Team 2 Question 1 points');
await host.keyboard.type('3');await host.keyboard.press('Shift+Enter');assert.equal(await first.inputValue(),'5');assert.equal(await host.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Team 1 Question 1 points');
await click('Save dated result');await host.getByText('Dated result saved locally.',{exact:false}).waitFor();
await host.reload();assert.equal(await first.inputValue(),'5');assert.equal(await host.getByLabel('Venue',{exact:true}).inputValue(),'Community Hall');
const downloadEvent=host.waitForEvent('download');await click('Export results JSON');const result=await downloadEvent;const path=await result.path();const backup=JSON.parse(fs.readFileSync(path,'utf8'));assert.equal(backup.session.teams[0].scores['slide-2'],5);
await host.getByRole('link',{name:'Presenter',exact:true}).click();await click('Show scores on TV');await click('Reveal next team ↑');await tv.getByText('Team 2',{exact:true}).waitFor();assert.equal(await tv.getByText('Team 1',{exact:true}).count(),0);await click('Reveal next team ↑');await tv.getByText('Team 1',{exact:true}).waitFor();await click('Close scores / return');await tv.getByText('Hawai’i',{exact:true}).waitFor();
// Both synchronization channels: disable BroadcastChannel in the audience before reload.
await tv.addInitScript(()=>{Object.defineProperty(window,'BroadcastChannel',{value:undefined});});await tv.reload();await click('Hide answers');await tv.getByText(/On September 8th/).waitFor();assert.equal(await tv.getByText('Hawai’i',{exact:true}).count(),0);
// Exercise every converted question at both common TV resolutions, including all ten final answers.
const ids=await host.getByLabel('Jump to trivia screen').locator('option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,text:n.textContent})).filter(n=>/Question|BONUS/i.test(n.text)));
for(const size of process.env.TRIVIA_SKIP_LAYOUT?[]:[{width:1280,height:720},{width:1920,height:1080}]){
 await tv.setViewportSize(size);
 for(const item of ids){await host.getByLabel('Jump to trivia screen').selectOption(item.value);await click('Show question & start timer');await click('Pause');await tv.waitForFunction(index=>JSON.parse(localStorage.getItem('trivia.session.v1')).index===Number(index),item.value);const overflow=await tv.locator('.trivia-stage').evaluate(el=>({height:el.scrollHeight>el.clientHeight+2,width:el.scrollWidth>el.clientWidth+2,prompt:el.querySelector('.trivia-public-prompt')?.scrollHeight>el.querySelector('.trivia-public-prompt')?.clientHeight+2}));assert.deepEqual(overflow,{height:false,width:false,prompt:false},`${item.text} at ${size.width}`);}
}
if(process.env.TRIVIA_SKIP_LAYOUT){await host.getByLabel('Jump to trivia screen').selectOption(ids.at(-1).value);await click('Show question & start timer');await click('Pause');}
for(let i=0;i<10;i++)await click(`Reveal next answer (${i}/10)`);await tv.getByText('Whitney Houston',{exact:true}).waitFor();
await tv.screenshot({path:'qa/trivia-final-answers.png'});await host.screenshot({path:'qa/trivia-presenter.png'});
await click('Next →');await tv.getByText('FINAL STANDINGS',{exact:false}).waitFor();
await host.getByRole('link',{name:'Score sheet',exact:true}).click();await host.locator('.trivia-app select').selectOption('slide-2');await host.getByLabel('Team 1 Question 1 points',{exact:true}).fill('9');await host.waitForFunction(()=>JSON.parse(localStorage.getItem('trivia.session.v1')).teams[0].scores['slide-2']===9);
await host.getByRole('link',{name:'Import & library',exact:true}).click();await host.getByLabel('Upload PowerPoint',{exact:true}).setInputFiles({name:'trivia-results.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await host.getByLabel('I reviewed the public prompts, private answers, images and scoring.').check();await click('Restore saved trivia night');await host.waitForFunction(()=>JSON.parse(localStorage.getItem('trivia.session.v1')).teams[0].scores['slide-2']===5);assert.equal((await state()).teams[0].scores['slide-2'],5);
// Existing Feud score sheet uses the same keyboard conventions.
await host.goto(base+'#/scores');const feud=host.getByLabel('Team Blue question 1',{exact:true});await feud.fill('7');await feud.press('Enter');assert.equal(await host.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Team Gold question 1');await host.keyboard.type('4');await host.reload();assert.equal(await feud.inputValue(),'7');assert.equal(await host.getByLabel('Team Gold question 1',{exact:true}).inputValue(),'4');
assert.deepEqual(errors,[]);console.log('PASS: actual PPTX worker upload, review, private answers, both sync channels, timer, manual scoring, Enter navigation, save/reload, result restore and Feud score navigation.'+(process.env.TRIVIA_SKIP_LAYOUT?'':' All 20 questions fit at 720p/1080p.'));
}finally{await browser.close();}
