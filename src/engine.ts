import type {ShowStep} from './show-sequence';
import {stepStandings} from './standings-reveal';
import { liveGame, flatten, type Game } from './model';
import { finaleQuestions } from './data/finale';
import {prepareReveal,withFinale,type ScoreSheet,type ScoreReveal} from './score-model';
export interface Timer { duration:number; remaining:number; end:number|null; started:boolean; cycle:number }
export interface Progress { revealed:string[]; strikes:number; awarded?:string[] }
export interface FinaleTurn {sheetId:string;teamId:string;teamName:string;questionId:string;status:'ready'|'running'|'ended';reason?:string}
export interface FinaleResult {sheetId:string;teamId:string;teamName:string;questionId:string;points:number;finished:boolean}
export interface FinaleAttempt {turn:FinaleTurn;progress:Progress;timer:Timer}
export interface Snapshot { showStep?:ShowStep; durations?:Record<string,number>; finaleLineup?:{sheetId:string;teamIds:string[]}; sequenceShow?:boolean; finaleAttempts?:Record<string,FinaleAttempt>; opening?:"logo"|"instructions";openingTimer?:Timer; index:number; progress:Record<string,Progress>; scores:number[]; active:number; timer:Timer; roundCard:boolean; boardPage?:number; extensions?:number; extensionAt?:number; collected?:boolean; finale?:FinaleTurn; finaleResults?:Record<string,FinaleResult>; regularTimer?:Timer; scoreShow?:ScoreReveal; suspendedTimer?:Timer }
export interface Session extends Snapshot { hostName?:string; eventDate?:string; game:Game; countdownSound?:boolean; revealSound?:"chime"|"silent"; auto:boolean; hideTimer:boolean; muted:boolean; volume:number; history:Snapshot[]; revision:number; upgraded?:boolean; event?:{id:string;type:'reveal'|'strike'|'extension'|'expired'} }
export type Action = {type:'showStep';step:ShowStep;sheet:ScoreSheet;start?:boolean}|{type:'finalists';sheetId:string;teamIds:string[]}|{type:'resetFinale'}|{type:'finalePoints';sheetId:string;teamId:string;teamName:string;points:number}|{type:'opening';screen:'logo'|'instructions'|null}|{type:'reveal'|'hide';id:string}|{type:'boardPage';page:number}|{type:'navigate';delta:number}|{type:'jump';index:number}|{type:'score';team:number;amount:number}|{type:'active';team:number}|{type:'strike';delta:number}|{type:'clearStrikes'|'revealAll'|'hideAll'|'resetQuestion'|'undo'|'resetScores'|'toggleTimer'|'resetTimer'|'roundCard'|'extend'|'collect'|'expire'|'leaveFinale'|'closeScores'}|{type:'duration';seconds:number;start?:boolean}|{type:'settings';hostName?:string;eventDate?:string;countdownSound?:boolean;revealSound?:'chime'|'silent';auto?:boolean;hideTimer?:boolean;muted?:boolean;volume?:number}|{type:'new';game:Game}|{type:'prepareFinale';sheetId:string;teamId:string;teamName:string;questionId:string}|{type:'showScores';show:ScoreReveal;sequence?:boolean}|{type:'revealScore';delta:number};
export const current = (s:Session) => s.finale?{round:{id:'finale',name:'TIMED FINALE',questions:finaleQuestions},question:finaleQuestions.find(q=>q.id===s.finale!.questionId)!}:flatten(s.game)[s.index];
export const secondsLeft = (t:Timer,now=Date.now()) => Math.max(0,t.end===null?t.remaining:(t.end-now)/1000);
export const clockText=(seconds:number)=>`${Math.floor(Math.ceil(seconds)/60)}:${String(Math.ceil(seconds)%60).padStart(2,'0')}`;
const makeTimer=(duration:number,cycle=0):Timer=>({duration,remaining:duration,end:null,started:false,cycle});
const timerFor=(game:Game,index:number,cycle=0):Timer=>{const q=flatten(game)[index].question;return makeTimer(q.timer??(game.timer===240?(q.answers.length<=3?180:q.answers.length>=7?300:240):game.timer),cycle);};
export function startSession(game:Game):Session{game=liveGame(game);return {game:structuredClone(game),index:0,progress:{},scores:game.teams.map(()=>0),active:0,timer:timerFor(game,0),auto:false,countdownSound:true,revealSound:"chime",hideTimer:true,muted:false,volume:.8,history:[],revision:0,roundCard:true,opening:"logo",upgraded:true,finaleResults:{}};}
function snapshot(s:Session,now:number):Snapshot{return {showStep:structuredClone(s.showStep),durations:structuredClone(s.durations),finaleLineup:structuredClone(s.finaleLineup),sequenceShow:s.sequenceShow,finaleAttempts:structuredClone(s.finaleAttempts),opening:s.opening,openingTimer:structuredClone(s.openingTimer),index:s.index,progress:structuredClone(s.progress),scores:[...s.scores],active:s.active,timer:{...s.timer,remaining:secondsLeft(s.timer,now)},roundCard:s.roundCard,boardPage:s.boardPage,extensions:s.extensions,extensionAt:s.extensionAt,collected:s.collected,finale:structuredClone(s.finale),finaleResults:structuredClone(s.finaleResults),regularTimer:structuredClone(s.regularTimer),scoreShow:structuredClone(s.scoreShow),suspendedTimer:structuredClone(s.suspendedTimer)};}
const pause=(t:Timer,now:number)=>({...t,remaining:secondsLeft(t,now),end:null});
const resume=(t:Timer,now:number,cycle:number)=>({...t,end:t.end===null?null:now+t.remaining*1000,cycle});
function rememberFinale(n:Session,now:number){if(!n.finale)return;const t=n.finale;const key=`${t.sheetId}:${t.teamId}:${t.questionId}`;n.finaleAttempts??={};n.finaleAttempts[key]={turn:structuredClone(t),progress:structuredClone(n.progress[t.questionId]??{revealed:[],strikes:0}),timer:pause(n.timer,now)};}
function finish(n:Session,reason:string,now:number){if(!n.finale)return;n.finale.status='ended';n.finale.reason=reason;n.timer=pause(n.timer,now);const result=n.finaleResults?.[`${n.finale.sheetId}:${n.finale.teamId}`];if(result)result.finished=true;}
export function reduce(s:Session,action:Action,now=Date.now()):Session {
  if(action.type==='new')return {...startSession(action.game),revision:s.revision+1};
  if(action.type==='undo'){const previous=s.history.at(-1);if(!previous)return s;return {...s,...structuredClone(previous),showStep:previous.showStep,durations:previous.durations,finaleLineup:previous.finaleLineup,sequenceShow:previous.sequenceShow,finaleAttempts:previous.finaleAttempts,opening:previous.opening,openingTimer:previous.openingTimer,finale:previous.finale,scoreShow:previous.scoreShow,regularTimer:previous.regularTimer,suspendedTimer:previous.suspendedTimer,extensionAt:previous.extensionAt,extensions:previous.extensions,collected:previous.collected,boardPage:previous.boardPage,finaleResults:previous.finaleResults,timer:resume(previous.timer,now,s.timer.cycle+1),history:s.history.slice(0,-1),event:undefined,revision:s.revision+1};}
  if(action.type==='showStep'){
    const step=action.step;let n=structuredClone(s);rememberFinale(n,now);
    n.opening=undefined;n.openingTimer=undefined;n.scoreShow=undefined;n.suspendedTimer=undefined;n.sequenceShow=undefined;n.event=undefined;n.extensionAt=undefined;n.collected=false;n.boardPage=0;n.index=step.index;n.showStep=step;
    if(step.kind==='finaleTitle'||step.kind==='finaleQuestion'){
      n.finale=undefined;n.roundCard=false;
      n=reduce(n,{type:'prepareFinale',sheetId:action.sheet.id,teamId:step.teamId!,teamName:step.teamName!,questionId:step.questionId!},now);
      const key=`${step.teamId}:${step.questionId}`;n.timer=makeTimer(n.durations?.[key]??60,n.timer.cycle+1);
      n.progress[step.questionId!]={revealed:[],strikes:0};n.finale!.status=step.kind==='finaleTitle'?'ready':'running';delete n.finale!.reason;
      if(step.kind==='finaleQuestion'){n.timer.started=true;n.timer.end=action.start?now+n.timer.duration*1000:null;}
    }else{
      n.finale=undefined;n.regularTimer=undefined;n.roundCard=step.kind!=='question';
      const q=flatten(n.game)[step.index].question;n.timer=timerFor(n.game,step.index,n.timer.cycle+1);
      n.timer=makeTimer(n.durations?.[q.id]??n.timer.duration,n.timer.cycle);
      if(step.kind==='intro'||step.kind==='instructions')n.opening=step.kind==='intro'?'logo':'instructions';
      if(step.kind==='question'||step.kind==='title')n.progress[q.id]={...n.progress[q.id],revealed:[],strikes:0};
      if(step.kind==='question'){n.timer.started=!!action.start;n.timer.end=action.start?now+n.timer.duration*1000:null;}
      if(step.kind==='scores'){n.scoreShow=prepareReveal(withFinale(action.sheet,n),step.stage!);n.sequenceShow=true;}
    }
    n.history=[...s.history.slice(-59),snapshot(s,now)];n.revision=s.revision+1;n.event=undefined;return n;
  }
  if(s.opening&&!['opening','settings','finalePoints','showScores','closeScores','revealScore'].includes(action.type))return s;
  if(s.scoreShow&&!['showScores','closeScores','revealScore','settings','finalists','finalePoints'].includes(action.type))return s;
  if(s.roundCard&&!s.finale&&['reveal','revealAll','toggleTimer'].includes(action.type))return s;
  const n=structuredClone(s);const q=current(n).question;const p=n.progress[q.id]??{revealed:[],strikes:0};n.progress[q.id]=p;n.event=undefined;
  if(n.finale?.status==='running'&&n.timer.end!==null&&secondsLeft(n.timer,now)===0&&!['showScores','closeScores','settings','leaveFinale','prepareFinale','resetFinale','finalePoints'].includes(action.type)){finish(n,'Time’s up',now);n.event={id:`${now}-${s.revision}`,type:'expired'};n.history=[...s.history.slice(-59),snapshot(s,now)];n.revision++;return n;}
  const finaleLocked=!!n.finale&&(n.finale.status!=='running'||n.timer.end===null);
  switch(action.type){
    case 'finalists':if(action.teamIds.length>5||new Set(action.teamIds).size!==action.teamIds.length)return s;n.finaleLineup={sheetId:action.sheetId,teamIds:[...action.teamIds]};break;
    case 'opening':if(action.screen){if(!n.opening){n.openingTimer={...n.timer,remaining:secondsLeft(n.timer,now)};n.timer=pause(n.timer,now);}n.opening=action.screen;}else{n.opening=undefined;if(n.openingTimer)n.timer=resume(n.openingTimer,now,n.timer.cycle+1);n.openingTimer=undefined;}break;
    case 'showScores':if(!n.scoreShow){n.suspendedTimer={...n.timer,remaining:secondsLeft(n.timer,now)};n.timer=pause(n.timer,now);}n.scoreShow=structuredClone(action.show);n.sequenceShow=action.sequence;break;
    case 'closeScores':if(!n.scoreShow)return s;n.scoreShow=undefined;n.sequenceShow=undefined;if(n.suspendedTimer)n.timer=resume(n.suspendedTimer,now,n.timer.cycle+1);n.suspendedTimer=undefined;break;
    case 'revealScore':if(!n.scoreShow)return s;n.scoreShow.revealed=stepStandings(n.scoreShow.teams,n.scoreShow.revealed,action.delta);if(n.scoreShow.revealed>(s.scoreShow?.revealed??0))n.event={id:`${now}-${s.revision}`,type:'reveal'};break;
    case 'prepareFinale':{if(!finaleQuestions.some(x=>x.id===action.questionId))return s;rememberFinale(n,now);const resultKey=`${action.sheetId}:${action.teamId}`;if(!n.finale)n.regularTimer={...n.timer,remaining:secondsLeft(n.timer,now)};const prior=n.finaleAttempts?.[`${resultKey}:${action.questionId}`];n.finale=prior?{...prior.turn,teamName:action.teamName}:{sheetId:action.sheetId,teamId:action.teamId,teamName:action.teamName,questionId:action.questionId,status:'ready'};n.finaleResults??={};n.finaleResults[resultKey]??={sheetId:action.sheetId,teamId:action.teamId,teamName:action.teamName,questionId:action.questionId,points:0,finished:false};n.finaleResults[resultKey].questionId=action.questionId;n.finaleResults[resultKey].teamName=action.teamName;n.progress[action.questionId]=prior?structuredClone(prior.progress):{revealed:[],strikes:0};n.timer=prior?{...prior.timer,end:null,cycle:n.timer.cycle+1}:makeTimer(60,n.timer.cycle+1);n.roundCard=false;n.boardPage=0;n.collected=false;break;}
    case 'resetFinale':if(!n.finale)return s;n.progress[q.id]={revealed:[],strikes:0};n.finale.status='ready';delete n.finale.reason;n.timer=makeTimer(60,n.timer.cycle+1);n.collected=false;n.finaleResults![`${n.finale.sheetId}:${n.finale.teamId}`].finished=false;break;
    case 'finalePoints':{if(!Number.isInteger(action.points)||action.points<0)return s;const key=`${action.sheetId}:${action.teamId}`;n.finaleResults??={};n.finaleResults[key]??={sheetId:action.sheetId,teamId:action.teamId,teamName:action.teamName,questionId:'',points:0,finished:false};n.finaleResults[key].points=action.points;break;}
    case 'leaveFinale':if(!n.finale)return s;rememberFinale(n,now);n.finale=undefined;if(n.regularTimer)n.timer=resume(n.regularTimer,now,n.timer.cycle+1);n.regularTimer=undefined;n.collected=false;break;
    case 'expire':return s;
    case 'reveal':if((finaleLocked&&n.finale?.status!=='ended')||!q.answers.some(a=>a.id===action.id)||p.revealed.includes(action.id))return s;p.revealed.push(action.id);n.boardPage=Math.floor(q.answers.findIndex(a=>a.id===action.id)/8);if(n.finale){if(p.revealed.length===q.answers.length)finish(n,'All answers revealed',now);}else if(n.auto&&!p.awarded?.includes(action.id)){n.scores[n.active]+=q.points;p.awarded=[...(p.awarded??[]),action.id];}n.event={id:`${now}-${s.revision}`,type:'reveal'};break;
    case 'boardPage':n.boardPage=Math.max(0,Math.min(Math.ceil(q.answers.length/8)-1,action.page));break;
    case 'hide':if(!p.revealed.includes(action.id))return s;p.revealed=p.revealed.filter(id=>id!==action.id);break;
    case 'navigate':case 'jump':{if(n.finale)return s;const index=Math.max(0,Math.min(flatten(n.game).length-1,action.type==='jump'?action.index:n.index+action.delta));if(index===n.index)return s;n.index=index;n.boardPage=0;n.timer=timerFor(n.game,index,n.timer.cycle+1);n.roundCard=true;n.extensions=0;n.extensionAt=undefined;n.collected=false;break;}
    case 'score':if(!Number.isFinite(action.amount)||!n.game.teams[action.team])return s;n.scores[action.team]+=action.amount;break;
    case 'active':if(!n.game.teams[action.team])return s;n.active=action.team;break;
    case 'strike':if(!n.finale||finaleLocked||action.delta<0)return s;p.strikes=Math.min(3,p.strikes+1);n.event={id:`${now}-${s.revision}`,type:'strike'};if(p.strikes===3)finish(n,'Three strikes',now);break;
    case 'clearStrikes':return s;
    case 'revealAll':if(n.finale&&n.finale.status!=='ended')return s;p.revealed=q.answers.map(a=>a.id);break;
    case 'hideAll':if(n.finale)return s;p.revealed=[];break;
    case 'resetQuestion':if(n.finale)return s;p.revealed=[];p.strikes=0;n.timer=timerFor(n.game,n.index,n.timer.cycle+1);n.extensions=0;n.extensionAt=undefined;n.collected=false;break;
    case 'resetScores':n.scores=n.game.teams.map(()=>0);break;
    case 'collect':n.timer=pause(n.timer,now);n.collected=true;if(n.finale)finish(n,'Host ended turn',now);break;
    case 'extend':{const left=secondsLeft(n.timer,now)+30;if(n.roundCard||n.finale?.status==='ready'){n.timer.duration+=30;n.durations={...n.durations,[n.finale?`${n.finale.teamId}:${q.id}`:q.id]:n.timer.duration};}n.timer={...n.timer,remaining:left,end:n.timer.end===null?null:now+left*1000,cycle:n.timer.cycle+1};n.extensions=(n.extensions??0)+1;n.extensionAt=now;n.collected=false;n.event={id:`${now}-${s.revision}`,type:'extension'};}break;
    case 'toggleTimer':{if(n.finale?.status==='ended')return s;const left=secondsLeft(n.timer,now);if(n.timer.end!==null&&left>0)n.timer=pause(n.timer,now);else{n.timer.remaining=left>0?left:n.timer.duration;n.timer.end=now+n.timer.remaining*1000;n.timer.started=true;n.timer.cycle++;if(n.finale)n.finale.status='running';}n.collected=false;break;}
    case 'resetTimer':if(n.finale)return s;n.timer=makeTimer(n.timer.duration,n.timer.cycle+1);n.collected=false;break;
    case 'duration':if(!Number.isInteger(action.seconds)||action.seconds<0||action.seconds>600||action.seconds%30!==0)return s;n.durations={...n.durations,[n.finale?`${n.finale.teamId}:${q.id}`:q.id]:action.seconds};n.timer=makeTimer(action.seconds,n.timer.cycle+1);if(action.start){n.timer.started=true;n.timer.end=now+action.seconds*1000;if(n.finale)n.finale.status='running';}n.collected=false;break;
    case 'roundCard':if(n.finale)return s;n.roundCard=!n.roundCard;if(n.roundCard)n.timer=pause(n.timer,now);else{const left=secondsLeft(n.timer,now)||n.timer.duration;n.timer={...n.timer,remaining:left,end:now+left*1000,started:true,cycle:n.timer.cycle+1};n.collected=false;}break;
    case 'settings':{const {type:_type,...settings}=action;void _type;Object.assign(n,settings);break;}
  }
  n.history=[...s.history.slice(-59),snapshot(s,now)];n.revision=s.revision+1;return n;
}
