import fs from 'node:fs';
const source=fs.readFileSync('REQUIREMENTS.txt','utf8');
const text=source.slice(source.indexOf('Round 1\n\nRegular questions:',source.indexOf('Initial game data')),source.indexOf('\nVisual design\n'));
fs.mkdirSync('src/data',{recursive:true});fs.writeFileSync('src/data/original.txt',text);
let n=0;const id=()=>`original-${++n}`;const game={version:1,id:id(),title:'Family Feud Game Night',timer:20,teams:[{name:'Team Blue',color:'#48baff'},{name:'Team Gold',color:'#ffce65'}],rounds:[]};let r,q,bonus=false;
for(const line of text.split('\n').map(s=>s.trim()).filter(Boolean)){if(/^Round \d$/.test(line)){r={id:id(),name:line,questions:[]};game.rounds.push(r);bonus=false;}else if(line.startsWith('Regular questions'))bonus=false;else if(line.startsWith('Bonus question'))bonus=true;else if(line.startsWith('Question ')){q={id:id(),text:line.replace(/^Question \d+: /,''),bonus,points:bonus?2:1,answers:[]};r.questions.push(q);}else {const a=line.match(/^(.+), (\d+)$/);if(!a)throw Error(line);q.answers.push({id:id(),text:a[1],count:Number(a[2])});}}
fs.writeFileSync('src/data/original.json',JSON.stringify(game,null,2)+'\n');console.log(`${game.rounds.length} rounds, ${game.rounds.flatMap(r=>r.questions).length} questions, ${game.rounds.flatMap(r=>r.questions).flatMap(q=>q.answers).length} answers`);
