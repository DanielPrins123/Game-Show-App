import type { Session } from './engine';
export interface ResultTeam {id:string;name:string;scores:(number|null)[];bonus?:number}
export interface ScoreSheet {id:string;title:string;date:string;venue:string;questions:string[];teams:ResultTeam[];savedAt?:string;liveFinale?:boolean}
export function validateResult(value:unknown):ScoreSheet{
  const wrapper=value as {version?:number;result?:ScoreSheet};const s=wrapper?.result;
  if(wrapper?.version!==1||!s||typeof s.id!=='string'||!s.id||typeof s.title!=='string'||typeof s.date!=='string'||typeof s.venue!=='string'||!Array.isArray(s.questions)||!s.questions.length||s.questions.some(q=>typeof q!=='string')||!Array.isArray(s.teams)||s.teams.length<2||s.teams.length>10)throw new Error('Choose an exported game-night result with 2–10 teams.');
  const ids=new Set<string>();
  for(const t of s.teams){if(typeof t.id!=='string'||!t.id||ids.has(t.id)||typeof t.name!=='string'||!t.name.trim()||!Array.isArray(t.scores)||t.scores.length!==s.questions.length||t.scores.some(n=>n!==null&&(!Number.isFinite(n)||!Number.isInteger(n)))||(t.bonus!==undefined&&(!Number.isInteger(t.bonus)||t.bonus<0||t.bonus>24)))throw new Error('Result contains invalid teams or scores.');ids.add(t.id);}
  return {...structuredClone(s),liveFinale:false};
}
export const total=(team:ResultTeam,end?:number)=>team.scores.slice(0,end??team.scores.length).reduce<number>((a,b)=>a+(b??0),0)+(end===undefined?(team.bonus??0):0);
export const ranking=(teams:ResultTeam[])=>[...teams].sort((a,b)=>total(b)-total(a));
export const rank=(team:ResultTeam,teams:ResultTeam[])=>1+teams.filter(t=>total(t)>total(team)).length;
export type Checkpoint='halfway'|'beforeFinale'|'final';
export const checkpointName=(stage:Checkpoint)=>stage==='halfway'?'HALFTIME STANDINGS':stage==='beforeFinale'?'BEFORE THE TIMED FINALE':'FINAL RESULTS';
export interface ScoreReveal {id:string;title:string;venue:string;date:string;stage:Checkpoint;revealed:number;teams:{id:string;name:string;total:number;rank:number}[]}
export function withFinale(sheet:ScoreSheet,session:Session):ScoreSheet{
  if(!sheet.liveFinale)return sheet;
  return {...sheet,teams:sheet.teams.map(t=>({...t,bonus:session.finaleResults?.[`${sheet.id}:${t.id}`]?.points??t.bonus??0}))};
}
export function prepareReveal(sheet:ScoreSheet,stage:Checkpoint):ScoreReveal{
  const end=stage==='halfway'?Math.floor(sheet.questions.length/2):stage==='beforeFinale'?sheet.questions.length:undefined;
  const teams=sheet.teams.map(t=>({id:t.id,name:t.name,total:total(t,end),rank:0})).sort((a,b)=>b.total-a.total);
  for(const team of teams)team.rank=1+teams.filter(t=>t.total>team.total).length;
  return {id:crypto.randomUUID(),title:sheet.title,venue:sheet.venue,date:sheet.date,stage,revealed:0,teams};
}
