import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1366,height:768}}),host=await context.newPage(),tv=await context.newPage();
 await host.goto('http://127.0.0.1:4173/#/trivia');await host.locator('.trivia-library-item').filter({hasText:'Included September 29 set'}).getByRole('button',{name:'Start this set',exact:true}).click();await tv.goto('http://127.0.0.1:4173/#/trivia/display');
 await host.getByLabel('Jump to trivia screen').selectOption('1');const preSlider=host.getByLabel('Seconds for this question');assert.equal(await preSlider.isEnabled(),true);await preSlider.press('End');await host.waitForFunction(()=>Object.values(JSON.parse(localStorage.getItem('trivia.session.v1')).durations??{}).includes(600));await host.reload();await preSlider.waitFor();assert.equal(await preSlider.inputValue(),'600');assert.equal(await tv.locator('.trivia-question-text').count(),0);await host.getByRole('button',{name:'Show question & start timer',exact:true}).click();
 const slider=host.getByLabel('Seconds for this question'),button=host.locator('.trivia-question-timing button');
 assert.equal(await slider.getAttribute('type'),'range');assert.equal(await slider.getAttribute('step'),'30');assert.equal(await button.innerText(),'Pause');
 await button.click();await host.waitForTimeout(250);const paused=await host.locator('.trivia-question-timing strong').innerText();await host.waitForTimeout(1000);assert.equal(await host.locator('.trivia-question-timing strong').innerText(),paused);assert.equal(await button.innerText(),'Start timer');await button.click();assert.equal(await button.innerText(),'Pause');
 await slider.press('End');assert.equal(await slider.inputValue(),'600');await button.click();await tv.waitForFunction(()=>document.querySelector('header>b')?.textContent.startsWith('10:')||document.querySelector('header>b')?.textContent.startsWith('9:'));
 await slider.press('Home');assert.equal(await slider.inputValue(),'0');await button.click();await tv.getByText('TIME’S UP',{exact:true}).waitFor();
 await host.reload();await slider.waitFor();assert.equal(await slider.inputValue(),'0');await slider.press('ArrowRight');assert.equal(await slider.inputValue(),'30');for(let i=1;i<9;i++)await slider.press('ArrowRight');await button.click();await tv.waitForFunction(()=>document.querySelector('header>b')?.textContent.startsWith('4:'));
 await host.reload();await slider.waitFor();assert.equal(await slider.inputValue(),'270');assert.equal(await host.locator('.trivia-question-timing button').count(),1);
 const timer=await host.locator('.trivia-question-timing').boundingBox(),sound=await host.locator('.trivia-sound-controls').boundingBox();assert.ok(sound.y>=timer.y+timer.height);assert.ok(await host.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));await host.screenshot({path:'qa/trivia-slider-presenter.png'});
 await host.getByRole('button',{name:'Reveal next answer (0/1)',exact:true}).click();await tv.getByText('Antarctica',{exact:true}).waitFor();assert.equal(await tv.locator('header>b').count(),0);
 console.log('PASS: 0–600 slider, 30-second steps, pre-reveal saved settings, one start/pause/restart button, pause/resume, endpoints, reload, TV sync, sound below timer and laptop fit.');
}finally{await browser.close();}
