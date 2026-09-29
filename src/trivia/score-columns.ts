import type {TriviaDeck,TriviaCard,TriviaTeam} from './types';
export type ScoreColumn={id:string;label:string;round:string;question?:TriviaCard;sumIds?:string[];kind:'question'|'round'|'halfway'|'beforeFinal'|'total'};
export function scoreColumns(deck:TriviaDeck):ScoreColumn[]{
 const questions=deck.cards.filter(c=>c.kind==='question'),rounds=[...new Set(questions.map(q=>q.round))],columns:ScoreColumn[]=[];
 const half=rounds.length>=3?rounds[1]:rounds[0];
 questions.forEach((q,i)=>{
   if(i===questions.length-1)columns.push({id:'before-final',label:'Pre-final',round:q.round,kind:'beforeFinal',sumIds:questions.slice(0,i).map(q=>q.id)});
   const roundLabel='R'+(rounds.indexOf(q.round)+1);
   const questionLabel=/final/i.test(q.title)?'Final':/bonus/i.test(q.title)?roundLabel+'B':roundLabel+q.title.replace(/^Question\s*/i,'Q');
   columns.push({id:q.id,label:questionLabel,round:q.round,kind:'question',question:q});
   if(!questions.slice(i+1).some(next=>next.round===q.round)){
     columns.push({id:'round-'+q.round,label:'Σ',round:q.round,kind:'round',sumIds:questions.filter(c=>c.round===q.round).map(c=>c.id)});
     if(q.round===half)columns.push({id:'halfway',label:'Half',round:q.round,kind:'halfway',sumIds:questions.slice(0,i+1).map(c=>c.id)});
   }
 });
 columns.push({id:'total',label:'Total',round:'Overall',kind:'total',sumIds:questions.map(q=>q.id)});return columns;
}
export const columnTotal=(team:TriviaTeam,column:ScoreColumn)=>(column.sumIds??[]).reduce((sum,id)=>sum+(team.scores[id]??0),0);
