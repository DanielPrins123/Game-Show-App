import type { TriviaCard, TriviaDeck } from './types';
export const triviaTemplate=`Title: Friday Trivia

Round 1: General knowledge
Categories: Geography, Food, Music

Question 1
Question: What is the capital of Canada?
Answer: Ottawa
Points: 1
Timer: 240

Bonus
Question: Name the two planets closest to the Sun.
Answer: Mercury
Answer: Venus
Points: 4
Scoring: 2 points per correct answer
Timer: 240`;
export function blankCard(kind:TriviaCard['kind'],round='Round 1'):TriviaCard{return {id:crypto.randomUUID(),kind,title:kind==='round'?round:kind==='info'?'Information':'Question 1',round,prompt:'',answers:[],scoring:'',maxPoints:null,seconds:240,sourceSlides:[],notes:'',issues:[],images:[]};}
export function blankTrivia():TriviaDeck{return {version:1,type:'trivia',id:crypto.randomUUID(),title:'Trivia night',fileName:'',importedAt:new Date().toISOString(),cards:[blankCard('round'),blankCard('question')],source:[],warnings:[]};}
export function parseTriviaText(input:string):TriviaDeck{
  const deck=blankTrivia();deck.cards=[];let round='Round 1',card:TriviaCard|undefined,mode='prompt';
  for(const [i,raw] of input.replace(/\r/g,'').split('\n').entries()){
    const line=raw.trim();if(!line||/^[-=_]{3,}$/.test(line))continue;
    if(/^title\s*:/i.test(line)){deck.title=line.replace(/^title\s*:\s*/i,'');continue;}
    if(/^round(?:\s+\d+\b|\s*:)/i.test(line)){round=line.replace(/^round\s*:\s*/i,'');card=blankCard('round',round);deck.cards.push(card);mode='prompt';continue;}
    if(/^(?:question\s*\d+|q\d+|(?:final\s+)?bonus)(?:\s*[:.-].*|\s*)$/i.test(line)||/^(?:info|question title)\s*:/i.test(line)){
      if(!deck.cards.length)deck.cards.push(blankCard('round',round));card=blankCard(/^info/i.test(line)?'info':'question',round);card.title=line.replace(/^(?:info|question title)\s*:\s*/i,'');deck.cards.push(card);mode='prompt';continue;
    }
    const label=line.match(/^(question|q|answer|answers|a|prompt item|answer layout|points|timer|scoring|notes|categories)\s*:\s*(.*)$/i);
    if(!card||card.kind==='round'&&label&&/^(question|q)$/i.test(label[1])){if(!deck.cards.length)deck.cards.push(blankCard('round',round));card=blankCard('question',round);deck.cards.push(card);}
    if(!card)throw Error(`Line ${i+1}: start with a Round or Question heading.`);
    if(label){const key=label[1].toLowerCase(),value=label[2];
      if(key==='prompt item'){card.prompts=[...(card.prompts??[]),value];mode='prompt';}
      else if(key==='answer layout'){if(!['list','paired'].includes(value))throw Error('Answer layout must be list or paired.');card.answerLayout=value as 'list'|'paired';mode='prompt';}
      else if(key==='points'||key==='timer'){const n=Number(value);if(!value||!Number.isFinite(n)||n<0||key==='timer'&&(!Number.isInteger(n)||n<10||n>3600))throw Error(`Line ${i+1}: ${key==='timer'?'timer must be 10–3600 seconds':'points must be zero or more'}.`);if(key==='points')card.maxPoints=n;else card.seconds=n;mode='prompt';}
      else if(['answer','answers','a'].includes(key)){mode='answers';if(value)card.answers.push(value);}
      else {mode=key==='notes'?'notes':key==='scoring'?'scoring':'prompt';const field=mode as 'notes'|'scoring'|'prompt';card[field]+=(card[field]?'\n':'')+value;}
    }else if(mode==='answers'){if(/^[-•*]\s+/.test(line)||!card.answers.length)card.answers.push(line.replace(/^[-•*]\s+/,''));else card.answers[card.answers.length-1]+='\n'+line;}
    else {const field=mode as 'notes'|'scoring'|'prompt';card[field]+=(card[field]?'\n':'')+line;}
  }
  if(!deck.cards.some(c=>c.kind==='question'))throw Error('No questions found. Use Question 1, Question: and Answer: lines.');
  if(deck.cards.some(c=>c.kind==='question'&&!c.prompt.trim()))throw Error('A question is missing its prompt. Add a Question: line below its heading.');
  deck.source=[{number:1,paragraphs:input.split(/\r?\n/),notes:'Original pasted text'}];return deck;
}
export function exportTriviaText(deck:TriviaDeck){return [`Title: ${deck.title}`,...deck.cards.map(c=>c.kind==='round'?`Round: ${c.title}\nCategories: ${c.prompt}`:`${c.kind==='info'?'Info: ':'Question title: '}${c.title}\nQuestion: ${c.prompt}\n${(c.prompts??[]).map(p=>`Prompt item: ${p}`).join('\n')}\n${c.answerLayout?`Answer layout: ${c.answerLayout}`:''}\n${c.answers.map(a=>`Answer: ${a}`).join('\n')}\n${c.maxPoints===null?'':`Points: ${c.maxPoints}\n`}Timer: ${c.seconds}\nScoring: ${c.scoring}\nNotes: ${c.notes}`)].join('\n\n');}
