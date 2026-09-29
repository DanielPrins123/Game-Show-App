import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:768}}),host=await context.newPage(),tv=await context.newPage();
 await host.goto('http://127.0.0.1:4173/#/trivia');await host.getByRole('button',{name:'Start this set',exact:true}).click();await tv.goto('http://127.0.0.1:4173/#/trivia/display');
 const click=name=>host.getByRole('button',{name,exact:true}).click();
 await tv.getByAltText('Outspoken Entertainment').waitFor();await tv.screenshot({path:'qa/trivia-refined-intro.png'});
 await host.getByLabel('Jump to trivia screen').selectOption('1');assert.equal(await host.getByLabel('Seconds for this question').inputValue(),'180');await host.getByLabel('Seconds for this question').fill('270');await click('Set / restart time');await click('Show question & start timer');await tv.waitForFunction(()=>document.querySelector('.trivia-stage header>b')?.textContent.startsWith('4:'));
 await click('Reveal next answer (0/1)');await tv.getByText('Antarctica',{exact:true}).waitFor();assert.equal(await tv.locator('.trivia-answer-list .item-number').count(),0);assert.equal(await tv.locator('.answer-label').count(),1);assert.equal(await host.locator('.trivia-answer-key button').count(),0);await tv.waitForTimeout(600);await tv.screenshot({path:'qa/trivia-refined-single-answer.png'});
 await host.reload();await host.getByLabel('Seconds for this question').waitFor();assert.equal(await host.getByLabel('Seconds for this question').inputValue(),'270');await click('Reset timer');assert.equal(await tv.locator('.trivia-stage header>b').count(),0);assert.equal(await host.locator('.trivia-timer-controls>b').innerText(),'4:30');
 await host.getByLabel('Jump to trivia screen').selectOption('23');assert.equal(await host.getByLabel('Seconds for this question').inputValue(),'360');await click('Show question & start timer');await click('Reveal next answer (0/10)');await tv.getByText('Belgium',{exact:true}).waitFor();await host.waitForTimeout(600);await host.screenshot({path:'qa/trivia-refined-presenter.png'});assert.ok(await host.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'Presenter fits 1366×768');assert.equal(await tv.locator('.answer-label').count(),1);
 await host.getByRole('link',{name:'Score sheet',exact:true}).click();await host.locator('.trivia-grading-card').getByText('Sweden',{exact:true}).waitFor();assert.equal(await tv.getByText('Sweden',{exact:true}).count(),0);
 console.log('PASS: per-question automatic/custom times, TV timer sync, reload/reset, single-answer styling, no audience count, enlarged preview, private grading card.');
}finally{await browser.close();}
