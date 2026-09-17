export interface ResultTeam {id:string;name:string;scores:(number|null)[]}
export interface ScoreSheet {id:string;title:string;date:string;venue:string;questions:string[];teams:ResultTeam[];savedAt?:string}
export const total=(team:ResultTeam,end=team.scores.length)=>team.scores.slice(0,end).reduce<number>((a,b)=>a+(b??0),0);
export const ranking=(teams:ResultTeam[])=>[...teams].sort((a,b)=>total(b)-total(a));
export const rank=(team:ResultTeam,teams:ResultTeam[])=>1+teams.filter(t=>total(t)>total(team)).length;
export type Checkpoint='halfway'|'final';
export const checkpointName=(stage:Checkpoint)=>stage==='halfway'?'HALFTIME STANDINGS':'FINAL RESULTS';
export interface ScoreReveal {id:string;title:string;venue:string;date:string;stage:Checkpoint;revealed:number;teams:{id:string;name:string;total:number;rank:number}[]}
export function prepareReveal(sheet:ScoreSheet,stage:Checkpoint):ScoreReveal{
  const end=stage==='halfway'?Math.floor(sheet.questions.length/2):sheet.questions.length;
  const teams=sheet.teams.map(t=>({id:t.id,name:t.name,total:total(t,end),rank:0})).sort((a,b)=>b.total-a.total);
  for(const team of teams)team.rank=1+teams.filter(t=>t.total>team.total).length;
  return {id:crypto.randomUUID(),title:sheet.title,venue:sheet.venue,date:sheet.date,stage,revealed:0,teams};
}
