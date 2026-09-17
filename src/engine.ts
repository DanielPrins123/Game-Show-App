import { flatten, type Game } from './model';
import { finaleQuestions } from './data/finale';
import type { ScoreReveal } from './score-model';
export interface Timer { duration:number; remaining:number; end:number|null; started:boolean; cycle:number }
export interface Progress { revealed:string[]; strikes:number; awarded?:string[] }
export interface FinaleTurn {sheetId:string;teamId:string;teamName:string;questionId:string;status:'ready'|'running'|'ended';reason?:string}
export interface FinaleResult {sheetId:string;teamId:string;teamName:string;questionId:string;points:number;finished:boolean}
export interface Snapshot { opening?:"logo"|"instructions";openingTimer?:Timer; index:number; progress:Record<string,Progress>; scores:number[]; active:number; timer:Timer; roundCard:boolean; boardPage?:number; extensions?:number; extensionAt?:number; collected?:boolean; finale?:FinaleTurn; finaleResults?:Record<string,FinaleResult>; regularTimer?:Timer; scoreShow?:ScoreReveal; suspendedTimer?:Timer }
export interface Session extends Snapshot { game:Game; auto:boolean; hideTimer:boolean; muted:boolean; volume:number; history:Snapshot[]; revision:number; upgraded?:boolean; event?:{id:string;type:'reveal'|'strike'|'extension'|'expired'} }
export type Action = {type:'opening';screen:'logo'|'instructions'|null}|{type:'reveal'|'hide';id:string}|{type:'boardPage';page:number}|{type:'navigate';delta:number}|{type:'jump';index:number}|{type:'score';team:number;amount:number}|{type:'active';team:number}|{type:'strike';delta:number}|{type:'clearStrikes'|'revealAll'|'hideAll'|'resetQuestion'|'undo'|'resetScores'|'toggleTimer'|'resetTimer'|'roundCard'|'extend'|'collect'|'expire'|'leaveFinale'|'closeScores'}|{type:'duration';seconds:number}|{type:'settings';auto?:boolean;hideTimer?:boolean;muted?:boolean;volume?:number}|{type:'new';game:Game}|{type:'prepareFinale';sheetId:string;teamId:string;teamName:string;questionId:string}|{type:'showScores';show:ScoreReveal}|{type:'revealScore';delta:number};
export const current = (s:Session) => s.finale?{round:{id:'finale',name:'TIMED FINALE',questions:finaleQuestions},question:finaleQuestions.find(q=>q.id===s.finale!.questionId)!}:flatten(s.game)[s.index];
export const secondsLeft = (t:Timer,now=Date.now()) => Math.max(0,t.end===null?t.remaining:(t.end-now)/1000);
export const clockText=(seconds:number)=>`${Math.floor(Math.ceil(seconds)/60)}:${String(Math.ceil(seconds)%60).padStart(2,'0')}`;
const makeTimer=(duration:number,cycle=0):Timer=>({duration,remaining:duration,end:null,started:false,cycle});
const timerFor=(game:Game,index:number,cycle=0):Timer=>{const q=flatten(game)[index].question;return makeTimer(q.timer??(game.timer===240?(q.answers.length<=3?180:q.answers.length>=7?300:240):game.timer),cycle);};
export function startSession(game:Game):Session{return {game:structuredClone(game),index:0,progress:{},scores:game.teams.map(()=>0),active:0,timer:timerFor(game,0),auto:false,hideTimer:true,muted:false,volume:.45,history:[],revision:0,roundCard:false,opening:"logo",upgraded:true,finaleResults:{}};}
function snapshot(s:Session,now:number):Snapshot{return {opening:s.opening,openingTimer:structuredClone(s.openingTimer),index:s.index,progress:structuredClone(s.progress),scores:[...s.scores],active:s.active,timer:{...s.timer,remaining:secondsLeft(s.timer,now)},roundCard:s.roundCard,boardPage:s.boardPage,extensions:s.extensions,extensionAt:s.extensionAt,collected:s.collected,finale:structuredClone(s.finale),finaleResults:structuredClone(s.finaleResults),regularTimer:structuredClone(s.regularTimer),scoreShow:structuredClone(s.scoreShow),suspendedTimer:structuredClone(s.suspendedTimer)};}
const pause=(t:Timer,now:number)=>({...t,remaining:secondsLeft(t,now),end:null});
const resume=(t:Timer,now:number,cycle:number)=>({...t,end:t.end===null?null:now+t.remaining*1000,cycle});
function finish(n:Session,reason:string,now:number){if(!n.finale)return;n.finale.status='ended';n.finale.reason=reason;n.timer=pause(n.timer,now);const result=n.finaleResults?.[`${n.finale.sheetId}:${n.finale.teamId}`];if(result)result.finished=true;}
export function reduce(s:Session,action:Action,now=Date.now()):Session {
  if(action.type==='new')return {...startSession(action.game),revision:s.revision+1};
  if(action.type==='undo'){const previous=s.history.at(-1);if(!previous)return s;return {...s,...structuredClone(previous),opening:previous.opening,openingTimer:previous.openingTimer,finale:previous.finale,scoreShow:previous.scoreShow,regularTimer:previous.regularTimer,suspendedTimer:previous.suspendedTimer,extensionAt:previous.extensionAt,extensions:previous.extensions,collected:previous.collected,boardPage:previous.boardPage,finaleResults:previous.finaleResults,timer:resume(previous.timer,now,s.timer.cycle+1),history:s.history.slice(0,-1),event:undefined,revision:s.revision+1};}
  if(s.opening&&!['opening','settings','showScores','closeScores','revealScore'].includes(action.type))return s;
  if(s.scoreShow&&!['showScores','closeScores','revealScore','settings'].includes(action.type))return s;
  const n=structuredClone(s);const q=current(n).question;const p=n.progress[q.id]??{revealed:[],strikes:0};n.progress[q.id]=p;n.event=undefined;
  if(n.finale?.status==='running'&&n.timer.end!==null&&secondsLeft(n.timer,now)===0&&!['showScores','closeScores','settings','leaveFinale'].includes(action.type)){finish(n,'Time’s up',now);n.event={id:`${now}-${s.revision}`,type:'expired'};n.history=[...s.history.slice(-59),snapshot(s,now)];n.revision++;return n;}
  const finaleLocked=!!n.finale&&(n.finale.status!=='running'||n.timer.end===null);
  switch(action.type){
    case 'opening':if(action.screen){if(!n.opening){n.openingTimer={...n.timer,remaining:secondsLeft(n.timer,now)};n.timer=pause(n.timer,now);}n.opening=action.screen;}else{n.opening=undefined;if(n.openingTimer)n.timer=resume(n.openingTimer,now,n.timer.cycle+1);n.openingTimer=undefined;}break;
    case 'showScores':if(!n.scoreShow){n.suspendedTimer={...n.timer,remaining:secondsLeft(n.timer,now)};n.timer=pause(n.timer,now);}n.scoreShow=structuredClone(action.show);break;
    case 'closeScores':if(!n.scoreShow)return s;n.scoreShow=undefined;if(n.suspendedTimer)n.timer=resume(n.suspendedTimer,now,n.timer.cycle+1);n.suspendedTimer=undefined;break;
    case 'revealScore':if(!n.scoreShow)return s;n.scoreShow.revealed=Math.max(0,Math.min(n.scoreShow.teams.length,n.scoreShow.revealed+action.delta));if(n.scoreShow.revealed>(s.scoreShow?.revealed??0))n.event={id:`${now}-${s.revision}`,type:'reveal'};break;
    case 'prepareFinale':{if(n.finale&&n.finale.status!=='ended')return s;const resultKey=`${action.sheetId}:${action.teamId}`;if(!finaleQuestions.some(x=>x.id===action.questionId)||n.finaleResults?.[resultKey]||Object.values(n.finaleResults??{}).some(r=>r.sheetId===action.sheetId&&r.questionId===action.questionId))return s;if(!n.finale)n.regularTimer={...n.timer,remaining:secondsLeft(n.timer,now)};n.finale={sheetId:action.sheetId,teamId:action.teamId,teamName:action.teamName,questionId:action.questionId,status:'ready'};n.finaleResults??={};n.finaleResults[resultKey]={sheetId:action.sheetId,teamId:action.teamId,teamName:action.teamName,questionId:action.questionId,points:0,finished:false};n.progress[action.questionId]={revealed:[],strikes:0,awarded:[]};n.timer=makeTimer(60,n.timer.cycle+1);n.roundCard=false;n.boardPage=0;break;}
    case 'leaveFinale':if(!n.finale||n.finale.status!=='ended')return s;n.finale=undefined;if(n.regularTimer)n.timer=resume(n.regularTimer,now,n.timer.cycle+1);n.regularTimer=undefined;break;
    case 'expire':return s;
    case 'reveal':if(finaleLocked||!q.answers.some(a=>a.id===action.id)||p.revealed.includes(action.id))return s;p.revealed.push(action.id);n.boardPage=Math.floor(q.answers.findIndex(a=>a.id===action.id)/8);if(n.finale){const r=n.finaleResults![`${n.finale.sheetId}:${n.finale.teamId}`];r.points+=4;p.awarded=[...(p.awarded??[]),action.id];if(p.revealed.length===q.answers.length)finish(n,'All six correct!',now);}else if(n.auto&&!p.awarded?.includes(action.id)){n.scores[n.active]+=q.points;p.awarded=[...(p.awarded??[]),action.id];}n.event={id:`${now}-${s.revision}`,type:'reveal'};break;
    case 'boardPage':n.boardPage=Math.max(0,Math.min(Math.ceil(q.answers.length/8)-1,action.page));break;
    case 'hide':if(n.finale||!p.revealed.includes(action.id))return s;p.revealed=p.revealed.filter(id=>id!==action.id);break;
    case 'navigate':case 'jump':{if(n.finale)return s;const index=Math.max(0,Math.min(flatten(n.game).length-1,action.type==='jump'?action.index:n.index+action.delta));if(index===n.index)return s;n.index=index;n.boardPage=0;n.timer=timerFor(n.game,index,n.timer.cycle+1);n.roundCard=false;n.extensions=0;n.extensionAt=undefined;n.collected=false;break;}
    case 'score':if(!Number.isFinite(action.amount)||!n.game.teams[action.team])return s;n.scores[action.team]+=action.amount;break;
    case 'active':if(!n.game.teams[action.team])return s;n.active=action.team;break;
    case 'strike':if(!n.finale||finaleLocked||action.delta<0)return s;p.strikes=Math.min(3,p.strikes+1);n.event={id:`${now}-${s.revision}`,type:'strike'};if(p.strikes===3)finish(n,'Three strikes',now);break;
    case 'clearStrikes':return s;
    case 'revealAll':if(n.finale&&n.finale.status!=='ended')return s;p.revealed=q.answers.map(a=>a.id);break;
    case 'hideAll':if(n.finale)return s;p.revealed=[];break;
    case 'resetQuestion':if(n.finale)return s;p.revealed=[];p.strikes=0;n.timer=timerFor(n.game,n.index,n.timer.cycle+1);n.extensions=0;n.extensionAt=undefined;n.collected=false;break;
    case 'resetScores':n.scores=n.game.teams.map(()=>0);break;
    case 'collect':n.timer=pause(n.timer,now);n.collected=true;if(n.finale)finish(n,'Host ended turn',now);break;
    case 'extend':if(n.finale)return s;{const left=secondsLeft(n.timer,now)+30;n.timer={...n.timer,remaining:left,end:n.timer.end===null?null:now+left*1000,cycle:n.timer.cycle+1};n.extensions=(n.extensions??0)+1;n.extensionAt=now;n.collected=false;n.event={id:`${now}-${s.revision}`,type:'extension'};}break;
    case 'toggleTimer':{if(n.finale?.status==='ended')return s;const left=secondsLeft(n.timer,now);if(n.timer.end!==null&&left>0)n.timer=pause(n.timer,now);else{n.timer.remaining=left>0?left:n.timer.duration;n.timer.end=now+n.timer.remaining*1000;n.timer.started=true;n.timer.cycle++;if(n.finale)n.finale.status='running';}n.collected=false;break;}
    case 'resetTimer':if(n.finale)return s;n.timer=makeTimer(n.timer.duration,n.timer.cycle+1);n.collected=false;break;
    case 'duration':if(n.finale||!Number.isInteger(action.seconds)||action.seconds<1||action.seconds>3600)return s;n.timer=makeTimer(action.seconds,n.timer.cycle+1);n.collected=false;break;
    case 'roundCard':if(n.finale)return s;n.roundCard=!n.roundCard;break;
    case 'settings':{const {type:_type,...settings}=action;void _type;Object.assign(n,settings);break;}
  }
  n.history=[...s.history.slice(-59),snapshot(s,now)];n.revision=s.revision+1;return n;
}
