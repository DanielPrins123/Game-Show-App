import{chromium}from'@playwright/test';import assert from'node:assert/strict';import fs from'node:fs';
const deck=JSON.parse(fs.readFileSync(process.env.TRIVIA_DECK||'public/trivia/2026-10-12.json','utf8')),b=await chromium.launch({channel:'msedge',headless:true});
try{const c=await b.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}),h=await c.newPage(),p=await c.newPage();
 await h.goto('http://127.0.0.1:4173/#/trivia');const item=h.locator('.trivia-library-item').filter({hasText:deck.title});await item.getByRole('button',{name:'Start this set',exact:true}).click();await h.getByLabel('Jump to trivia screen').waitFor();await p.goto('http://127.0.0.1:4173/#/trivia/display');await p.getByAltText('Outspoken Entertainment').waitFor();await p.screenshot({path:'qa/october-intro.png'});
 for(const width of [1280,1920]){await p.setViewportSize({width,height:width*9/16});for(let index=0;index<deck.cards.length;index++){const card=deck.cards[index];let questionRect;for(const phase of card.kind==='question'?['card','question','answers']:['card']){
 await h.evaluate(({index,phase,n})=>{const s=JSON.parse(localStorage.getItem('trivia.session.v1'));Object.assign(s,{index,phase,revealed:phase==='answers'?n:0,revealedAnswers:undefined,end:null,started:false,revision:s.revision+1});localStorage.setItem('trivia.session.v1',JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:'trivia.session.v1'}));},{index,phase,n:card.answers.length});
 await p.waitForFunction(({phase,n})=>phase!=='answers'||document.querySelectorAll('.answer-shown').length===n,{phase,n:card.answers.length});await p.waitForTimeout(80);
 if(card.kind==='question'&&card.answers.length<=6&&phase!=='card'){
 const rect=await p.locator('.trivia-question-text').boundingBox();
 if(phase==='question'){questionRect=rect;assert.equal(await p.locator('[aria-label="Answer hidden"]').count(),card.answers.length);assert.equal(await p.locator('.answer-shown').count(),0);}
 else{assert.deepEqual(rect,questionRect,'Question must not move on reveal');}
 if(width===1280&&index===1)await p.screenshot({path:'qa/trivia-combined-'+phase+'.png'});
 }
 if(phase==='card'&&card.kind==='question'&&card.scoring)assert.equal(await p.locator('.trivia-transition-scoring').innerText(),card.scoring.replace(/Name any 10 of 13;/gi,'10 answers;'));
 const contrastFailures=await p.locator('.trivia-slide').evaluate(el=>{
 const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number);
 const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 return [...el.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.getBoundingClientRect().height>0).flatMap(e=>{
 let bg=[255,255,255];for(let a=e;a;a=a.parentElement){const v=rgb(getComputedStyle(a).backgroundColor);if(v.length===3||v[3]===1){bg=v;break;}}
 const fg=rgb(getComputedStyle(e).color);const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 return ratio<4.5?[{text:e.textContent,ratio}]:[];
 });
 });assert.deepEqual(contrastFailures,[],width+' '+card.id+' '+phase+' contrast');
 if(width===1280&&phase==='card'&&card.title==='Question 4')await p.screenshot({path:'qa/trivia-question-transition.png'});
 const bad=await p.locator('.trivia-slide').evaluate(el=>{const f=el.getBoundingClientRect(),foot=el.querySelector('footer')?.getBoundingClientRect();return [...el.querySelectorAll('h1,h2,.trivia-question-note,.trivia-answer-list li')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>f.bottom+1||r.right>f.right+1||(foot&&r.bottom>foot.top+1);}).map(e=>e.textContent);});assert.deepEqual(bad,[],width+' '+card.id+' '+phase);
 }} }
 await p.screenshot({path:'qa/october-final-answers.png'});await h.getByRole('link',{name:'Score sheet',exact:true}).click();await h.locator('.trivia-grading-card').getByText(deck.cards.at(-1).answers.at(-1),{exact:true}).waitFor();assert.equal(await h.locator('.trivia-all-scores tbody tr').first().locator('input[type=number]').count(),20);
 await h.reload();await h.locator('.trivia-grading-card').waitFor();console.log('PASS: October set loads from library, all 20 questions and 13 final answers fit at 720p/1080p, private grading card and full score sheet work, reload persists.');
}finally{await b.close();}
