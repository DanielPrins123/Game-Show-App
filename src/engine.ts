import { flatten, type Game } from './model';
export interface Timer { duration:number; remaining:number; end:number|null; started:boolean; cycle:number }
export interface Progress { revealed:string[]; strikes:number; awarded?:string[] }
export interface Snapshot { index:number; progress:Record<string,Progress>; scores:number[]; active:number; timer:Timer; roundCard:boolean; boardPage?:number }
export interface Session extends Snapshot { game:Game; auto:boolean; hideTimer:boolean; muted:boolean; volume:number; history:Snapshot[]; revision:number; event?:{id:string;type:'reveal'|'strike'} }
export type Action = {type:'reveal'|'hide';id:string}|{type:'boardPage';page:number}|{type:'navigate';delta:number}|{type:'jump';index:number}|{type:'score';team:number;amount:number}|{type:'active';team:number}|{type:'strike';delta:number}|{type:'clearStrikes'|'revealAll'|'hideAll'|'resetQuestion'|'undo'|'resetScores'|'toggleTimer'|'resetTimer'|'roundCard'}|{type:'duration';seconds:number}|{type:'settings';auto?:boolean;hideTimer?:boolean;muted?:boolean;volume?:number}|{type:'new';game:Game};
export const current = (s:Session) => flatten(s.game)[s.index];
export const secondsLeft = (t:Timer,now=Date.now()) => Math.max(0,t.end===null?t.remaining:(t.end-now)/1000);
const timerFor=(game:Game,index:number,cycle=0):Timer=>{const duration=flatten(game)[index].question.timer??game.timer;return {duration,remaining:duration,end:null,started:false,cycle};};
export function startSession(game:Game):Session{return {game:structuredClone(game),index:0,progress:{},scores:[0,0],active:0,timer:timerFor(game,0),auto:false,hideTimer:true,muted:false,volume:.45,history:[],revision:0,roundCard:false};}
function snapshot(s:Session,now:number):Snapshot{return {index:s.index,progress:structuredClone(s.progress),scores:[...s.scores],active:s.active,timer:{...s.timer,remaining:secondsLeft(s.timer,now)},roundCard:s.roundCard,boardPage:s.boardPage};}
export function reduce(s:Session,action:Action,now=Date.now()):Session {
  if(action.type==='new')return {...startSession(action.game),revision:s.revision+1};
  if(action.type==='undo'){const previous=s.history.at(-1);if(!previous)return s;return {...s,...structuredClone(previous),timer:{...previous.timer,end:previous.timer.end===null?null:now+previous.timer.remaining*1000,cycle:s.timer.cycle+1},history:s.history.slice(0,-1),event:undefined,revision:s.revision+1};}
  const n=structuredClone(s);const q=current(n).question;const p=n.progress[q.id]??{revealed:[],strikes:0};n.progress[q.id]=p;n.event=undefined;
  switch(action.type){
    case 'reveal':if(!q.answers.some(a=>a.id===action.id)||p.revealed.includes(action.id))return s;p.revealed.push(action.id);n.boardPage=Math.floor(q.answers.findIndex(a=>a.id===action.id)/8);if(n.auto&&!p.awarded?.includes(action.id)){n.scores[n.active]+=q.points;p.awarded=[...(p.awarded??[]),action.id];}n.event={id:`${now}-${s.revision}`,type:'reveal'};break;
    case 'boardPage':n.boardPage=Math.max(0,Math.min(Math.ceil(q.answers.length/8)-1,action.page));break;
    case 'hide':if(!p.revealed.includes(action.id))return s;p.revealed=p.revealed.filter(id=>id!==action.id);break;
    case 'navigate':case 'jump':{const index=Math.max(0,Math.min(flatten(n.game).length-1,action.type==='jump'?action.index:n.index+action.delta));if(index===n.index)return s;n.index=index;n.boardPage=0;n.timer=timerFor(n.game,index,n.timer.cycle+1);n.roundCard=false;break;}
    case 'score':n.scores[action.team]+=action.amount;break;
    case 'active':n.active=action.team;break;
    case 'strike':{const v=Math.max(0,Math.min(3,p.strikes+action.delta));if(v===p.strikes)return s;p.strikes=v;if(action.delta>0)n.event={id:`${now}-${s.revision}`,type:'strike'};break;}
    case 'clearStrikes':p.strikes=0;break;
    case 'revealAll':p.revealed=q.answers.map(a=>a.id);break;
    case 'hideAll':p.revealed=[];break;
    case 'resetQuestion':p.revealed=[];p.strikes=0;n.timer=timerFor(n.game,n.index,n.timer.cycle+1);break;
    case 'resetScores':n.scores=[0,0];break;
    case 'toggleTimer':{const left=secondsLeft(n.timer,now);if(n.timer.end!==null&&left>0){n.timer.remaining=left;n.timer.end=null;}else{n.timer.remaining=left>0?left:n.timer.duration;n.timer.end=now+n.timer.remaining*1000;n.timer.started=true;n.timer.cycle++;}break;}
    case 'resetTimer':n.timer={...n.timer,remaining:n.timer.duration,end:null,started:false,cycle:n.timer.cycle+1};break;
    case 'duration':if(!Number.isInteger(action.seconds)||action.seconds<1||action.seconds>3600)return s;n.timer={duration:action.seconds,remaining:action.seconds,end:null,started:false,cycle:n.timer.cycle+1};break;
    case 'roundCard':n.roundCard=!n.roundCard;break;
    case 'settings':Object.assign(n,action);break;
  }
  n.history=[...s.history.slice(-59),snapshot(s,now)];n.revision=s.revision+1;return n;
}
