import {chromium} from '@playwright/test';
import ts from 'typescript';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('src/data/finale.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {finaleQuestions}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext();const host=await context.newPage();const display=await context.newPage();
await host.goto('http://127.0.0.1:4173/#/presenter');await host.getByRole('button',{name:'3 · Begin questions',exact:true}).click();await host.getByRole('button',{name:'Show question',exact:true}).click();await host.getByRole('button',{name:'Pause timer',exact:true}).click();
await host.waitForFunction(()=>!!localStorage.getItem('feud.session.v1'));
const original=await host.evaluate(()=>JSON.parse(localStorage.getItem('feud.session.v1')));
for(const [width,height] of [[1280,720],[1920,1080]]){
 await display.setViewportSize({width,height});
 for(const q of finaleQuestions){
  await host.evaluate(({original,q})=>{const s=structuredClone(original);s.finale={sheetId:'test',teamId:'team',teamName:'Community Champions',questionId:q.id,status:'ended',reason:'All answers revealed'};s.finaleResults={'test:team':{...s.finale,points:24,finished:true}};s.progress[q.id]={revealed:q.answers.map(a=>a.id),strikes:3};s.timer={duration:60,remaining:0,end:null,started:true,cycle:1};localStorage.setItem('feud.session.v1',JSON.stringify(s));},{original,q});
  await display.goto('http://127.0.0.1:4173/#/display');await display.getByRole('heading',{name:q.text,exact:true}).waitFor();await display.waitForTimeout(350);
  const bad=await display.evaluate(()=>[...document.querySelectorAll('.question h1,.answer-tile,.answer-tile strong,.board-bottom')].filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1||e.getBoundingClientRect().bottom>innerHeight+1).map(e=>e.className));
  assert.deepEqual(bad,[],`${width}: ${q.text}`);
  if(q.season===19)await display.screenshot({path:`qa/large-finale-${width}.png`});
 }
 console.log(`All eleven finale boards fit at ${width}×${height}.`);
}
await host.evaluate(original=>{const s=structuredClone(original);s.finale={sheetId:'test',teamId:'team',teamName:'Team',questionId:'retired-question',status:'running'};s.finaleResults={'test:team':{...s.finale,points:12,finished:false}};localStorage.setItem('feud.session.v1',JSON.stringify(s));},original);
await host.reload();await host.getByRole('button',{name:'Reveal answer 1',exact:true}).click();await host.waitForFunction(()=>JSON.parse(localStorage.getItem('feud.session.v1')).finale===undefined);
assert.equal(await host.evaluate(()=>JSON.parse(localStorage.getItem('feud.session.v1')).finaleResults['test:team'].points),12);
console.log('Retired finale recovers to written play and retains earned points.');
const fresh=await browser.newContext();const page=await fresh.newPage();await page.goto('http://127.0.0.1:4173/#/presenter');const button=name=>page.getByRole('button',{name,exact:true});
await button('3 · Begin questions').click();await button('Show question').click();await button('Pause timer').click();await button('Score entry / teams').click();await button('← Back to presenter').click();await page.getByRole('button',{name:'Timed finale',exact:true}).click();await button('Open selected team & question').click();await button('Start 60-second turn').click();await button('Reveal answer 1').click();await page.getByLabel('Finale points',{exact:true}).fill('12');
await button('Next bonus →').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('feud.session.v1')).finale.questionId==='finale-26-balanced');await button('← Previous bonus').click();await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('feud.session.v1'));return s.finale.questionId==='finale-27'&&s.progress['finale-27'].revealed.length===1&&s.timer.end===null;});assert.equal(await page.getByLabel('Finale points',{exact:true}).inputValue(),'12');
await button('Reset this turn · 60 seconds').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('feud.session.v1')).finale.status==='ready');await page.reload();await button('Start 60-second turn').waitFor();assert.equal(await page.getByLabel('Finale points',{exact:true}).inputValue(),'12');await button('Return to written rounds').click();await button('Score entry / teams').click();await page.getByTestId('bonus-0').locator('input').fill('20');await page.waitForFunction(()=>Object.values(JSON.parse(localStorage.getItem('feud.session.v1')).finaleResults)[0].points===20);await page.reload();assert.equal(await page.getByTestId('bonus-0').locator('input').inputValue(),'20');
console.log('Manual grading, same-team question changes, previous attempt recovery, reset, early exit and scorebook edits survive reload.');await browser.close();


