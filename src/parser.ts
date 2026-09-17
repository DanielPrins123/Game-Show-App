import { type Game, type Question, type Round } from './model';
export interface Issue { line: number; text: string; reason: string }
export interface ParseResult { game: Game; issues: Issue[] }
// Deliberately deterministic: IDs depend on source order, never randomness or services.
export function parseText(source: string): ParseResult {
  let serial=0; const id=()=>`paste-${++serial}`;
  const game: Game={version:1,id:id(),title:'Imported game',timer:20,teams:[{name:'Team Blue',color:'#48baff'},{name:'Team Gold',color:'#ffce65'}],rounds:[]};
  const issues: Issue[]=[]; let round: Round|undefined; let question: Question|undefined; let bonus=false; let points=1;
  const getRound=()=>{if(!round){round={id:id(),name:`Round ${game.rounds.length+1}`,questions:[]};game.rounds.push(round);}return round;};
  source.replace(/\r/g,'').split('\n').forEach((raw,index)=>{
    const line=raw.replace(/\*\*/g,'').trim(); if(!line||/^[-–—_=]{3,}$/.test(line))return;
    const issue=(reason:string)=>issues.push({line:index+1,text:raw,reason});
    const title=line.match(/^Game title\s*:\s*(.+)$/i); if(title){game.title=title[1];return;}
    if(/^Round\s+[\w.-]+\s*:?$/i.test(line)){round={id:id(),name:line.replace(/:$/,''),questions:[]};game.rounds.push(round);question=undefined;bonus=false;points=1;return;}
    if(/^(bonus(?:\s+questions?)?|regular(?:\s+questions?)?)\s*[:.-]?(?:\s*\d+\s+points?.*)?$/i.test(line)){bonus=/^bonus/i.test(line);points=bonus?2:1;const p=line.match(/(\d+)\s+points?/i);if(p)points=Number(p[1]);question=undefined;return;}
    if(/^\d+\s+points?\s+(each|for each correct answer)[.!]?$/i.test(line)){points=Number(line.match(/^\d+/)![0]);return;}
    const explicit=line.match(/^(?:Question\s*\d+\s*[:.)-]\s*|Q\d+\s*[:.)-]\s*)(.+)$/i);
    const cells=line.split(/\t+|\s{2,}|\s+\|\s+/).filter(Boolean);
    const parseAnswer=(v:string)=>v.replace(/^\s*(?:\d+[.)]\s*|[-•]\s*)/,'').match(/^(.+?)(?:\s*[,;:]\s*|\s+)(\d+)\s*$/);
    const answers=cells.length>1&&cells.every(c=>parseAnswer(c))?cells.map(c=>parseAnswer(c)!):[parseAnswer(line)];
    if(!explicit && answers.every(Boolean)){
      if(!question){issue('Answer has no question above it.');return;}
      for(const a of answers)question.answers.push({id:id(),text:a![1].trim(),count:Number(a![2])});return;
    }
    if(explicit||/^(?:\d+[.)]\s*)?(name\b|when\b|what\b|where\b|which\b|who\b|how\b|why\b)/i.test(line)||(!question && /[?.]$/.test(line))){
      question={id:id(),text:explicit?explicit[1]:line.replace(/^\d+[.)]\s*/,''),bonus,points,answers:[]};getRound().questions.push(question);return;
    }
    issue('Unrecognized line; edit the source or account for it before importing.');
  });
  for(const r of game.rounds){if(!r.questions.length)issues.push({line:0,text:r.name,reason:'Round has no questions.'});for(const q of r.questions)if(!q.answers.length)issues.push({line:0,text:q.text,reason:'Question has no answers.'});}
  if(!game.rounds.length)issues.push({line:0,text:'',reason:'No questions found.'});
  return {game,issues};
}
// CSV schema: round,question,bonus,points,timer,rank,answer,count. RFC 4180 quoted cells supported.
export function parseCSV(source: string): ParseResult {
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<source.length;i++){const c=source[i];if(c==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=c;}
  if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}if(quoted)throw new Error('CSV contains an unclosed quoted cell.');
  const headers=rows.shift()?.map(x=>x.trim().toLowerCase())??[];
  for(const key of ['round','question','answer','count'])if(!headers.includes(key))throw new Error(`CSV missing column: ${key}`);
  const parsed=parseText(''); parsed.game.rounds=[];parsed.issues=[];let serial=0;const id=()=>`csv-${++serial}`;parsed.game.id=id();
  for(const [i,values] of rows.entries()){if(values.every(v=>!v.trim()))continue;const v=(key:string)=>values[headers.indexOf(key)]?.trim()??'';
    if(!v('round')||!v('question')||!v('answer')||!/^\d+$/.test(v('count'))){parsed.issues.push({line:i+2,text:values.join(','),reason:'Missing text or invalid count.'});continue;}
    let r=parsed.game.rounds.find(r=>r.name===v('round'));if(!r){r={id:id(),name:v('round'),questions:[]};parsed.game.rounds.push(r);}
    let q=r.questions.find(q=>q.text===v('question'));if(!q){const bonus=/^(true|yes|1|bonus)$/i.test(v('bonus'));q={id:id(),text:v('question'),bonus,points:v('points')?Number(v('points')):bonus?2:1,answers:[],...(v('timer')?{timer:Number(v('timer'))}:{})};r.questions.push(q);}
    q.answers.push({id:v('rank')?`rank-${v('rank')}-${id()}`:id(),text:v('answer'),count:Number(v('count'))});
  }
  for(const r of parsed.game.rounds)for(const q of r.questions)q.answers.sort((a,b)=>Number(a.id.match(/^rank-(\d+)/)?.[1]??1e6)-Number(b.id.match(/^rank-(\d+)/)?.[1]??1e6));
  return parsed;
}
