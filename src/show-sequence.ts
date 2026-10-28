import type {Session} from './engine';
import {flatten} from './model';
import {finaleQuestions} from './data/finale';
import {total,type ScoreSheet,type Checkpoint} from './score-model';
export type ShowStep={id:string;label:string;kind:'intro'|'instructions'|'round'|'title'|'question'|'scores'|'finaleTitle'|'finaleQuestion';index:number;stage?:Checkpoint;teamId?:string;teamName?:string;questionId?:string};
export function finalistIds(s:Session,sheet:ScoreSheet){
 if(s.finaleLineup?.sheetId===sheet.id)return s.finaleLineup.teamIds.filter(id=>sheet.teams.some(t=>t.id===id)).slice(0,5);
 return sheet.teams.length<=5?sheet.teams.map(t=>t.id):[...sheet.teams].sort((a,b)=>total(b,sheet.questions.length)-total(a,sheet.questions.length)).slice(0,3).reverse().map(t=>t.id);
}
export function showSequence(s:Session,sheet:ScoreSheet):ShowStep[]{
 const steps:ShowStep[]=[{id:'intro',label:'Intro',kind:'intro',index:0},{id:'instructions',label:'Instructions',kind:'instructions',index:0}],list=flatten(s.game);
 list.forEach(({round,question},index)=>{
  if(index===Math.ceil(list.length/2))steps.push({id:'scores-halfway',label:'Standings',kind:'scores',stage:'halfway',index:index-1});
  if(index===0||list[index-1].round.id!==round.id)steps.push({id:`round-${round.id}`,label:round.name,kind:'round',index});
  steps.push({id:`title-${question.id}`,label:`${round.name} · Q${index+1}`,kind:'title',index},{id:`question-${question.id}`,label:`Q${index+1} · ${question.text}`,kind:'question',index});
 });
 steps.push({id:'scores-beforeFinale',label:'Standings · before final',kind:'scores',stage:'beforeFinale',index:list.length-1});
 finalistIds(s,sheet).forEach((id,i)=>{const team=sheet.teams.find(t=>t.id===id)!;
  const questionId=s.finale?.teamId===id?s.finale.questionId:s.finaleResults?.[`${sheet.id}:${id}`]?.questionId||finaleQuestions[i%finaleQuestions.length].id;
  for(const kind of ['finaleTitle','finaleQuestion'] as const)steps.push({id:`${kind}-${id}`,label:`Final · ${team.name}${kind==='finaleTitle'?' · title':''}`,kind,index:list.length-1,teamId:id,teamName:team.name,questionId});
 });
 steps.push({id:'scores-final',label:'Final standings',kind:'scores',stage:'final',index:list.length-1});return steps;
}
export function currentStepId(s:Session){
 if(s.scoreShow)return `scores-${s.scoreShow.stage}`;
 if(s.opening)return s.opening==='logo'?'intro':'instructions';
 if(s.finale)return `${s.finale.status==='ready'?'finaleTitle':'finaleQuestion'}-${s.finale.teamId}`;
 if(s.showStep?.kind==='round')return s.showStep.id;
 return `${s.roundCard?'title':'question'}-${flatten(s.game)[s.index].question.id}`;
}
