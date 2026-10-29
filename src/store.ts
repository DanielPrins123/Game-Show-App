import { useSyncExternalStore } from 'react';
import raw from './data/original.json';
import tonightRaw from './data/2026-10-29.json';
const tonight=validateGame(tonightRaw);
import { finaleQuestions } from './data/finale';
import { liveGame, validateGame, type Game } from './model';
import { reduce, secondsLeft, startSession, type Action, type Session } from './engine';
export const original=liveGame(validateGame({...raw,timer:240}));
export const SESSION_KEY='feud.session.v1';
export const LIBRARY_KEY='feud.library.v1';
export function readJSON<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)??'null')??fallback;}catch{return fallback;}}
export function saveJSON(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{window.dispatchEvent(new Event('storage-failed'));return false;}}
function loadSession():Session{try{const s=readJSON<Session|null>(SESSION_KEY,null);if(s){validateGame(s.game);if(Number.isInteger(s.index)&&s.index>=0&&s.index<s.game.rounds.flatMap(r=>r.questions).length&&Array.isArray(s.scores)&&s.scores.length===s.game.teams.length&&s.timer&&s.progress&&Array.isArray(s.history)){if(!s.upgraded){s.upgraded=true;s.finaleResults={};if(s.game.timer===20)s.game.timer=240;if(!s.timer.started && s.timer.duration===20)s.timer={...s.timer,duration:240,remaining:240};}if(s.finale&&!finaleQuestions.some(q=>q.id===s.finale!.questionId)){const r=s.finaleResults?.[`${s.finale.sheetId}:${s.finale.teamId}`];if(r)r.finished=true;s.finale=undefined;s.scoreShow=undefined;s.opening=undefined;s.timer={...(s.regularTimer??s.timer),end:null};s.regularTimer=undefined;s.history=[];}const before=s.game.rounds.flatMap(r=>r.questions).length;s.game=liveGame(s.game);const after=s.game.rounds.flatMap(r=>r.questions).length;if(before!==after){s.index=Math.min(s.index,after-1);s.history=[];if(!s.finale){s.roundCard=true;s.timer={...s.timer,remaining:secondsLeft(s.timer),end:null};}}return s;}}}catch{/* Keep the included game usable when stored content is damaged. */}return startSession(original);}
let session=loadSession();const listeners=new Set<()=>void>();
let channel:BroadcastChannel|undefined;try{channel=new BroadcastChannel('feud.live.v1');}catch{/* Storage events are the fallback. */}
function refresh(){session=loadSession();listeners.forEach(l=>l());}
window.addEventListener('storage',e=>{if(e.key===SESSION_KEY)refresh();});
if(channel)channel.onmessage=e=>{if(e.data?.type==='state')refresh();if(e.data?.type==='hello')channel?.postMessage({type:'state'});if(e.data?.type==='presence')lastAudience=Date.now();};
channel?.postMessage({type:'hello'});
export function dispatch(action:Action){const apply=()=>{const latest=loadSession();const next=reduce(latest,action);if(next===latest)return;session=next;saveJSON(SESSION_KEY,next);listeners.forEach(l=>l());channel?.postMessage({type:'state'});};if(navigator.locks)void navigator.locks.request('feud-state',apply);else apply();}
export function useSession(){return useSyncExternalStore(l=>{listeners.add(l);return()=>{listeners.delete(l);};},()=>session);}
let lastAudience=0;
export function audienceConnected(){const fallback=Number(localStorage.getItem('feud.audience')??0);return Date.now()-Math.max(lastAudience,fallback)<5000;}
export function heartbeat(){channel?.postMessage({type:'presence'});try{localStorage.setItem('feud.audience',String(Date.now()));}catch{/* Optional status only. */}}
export function games():Game[]{const saved=readJSON<unknown[]>(LIBRARY_KEY,[]);if(!Array.isArray(saved))return [structuredClone(tonight),structuredClone(original)];const valid:Game[]=[];for(const item of saved){try{valid.push(validateGame(item));}catch{/* Ignore invalid library entries. */}}for(const bundled of [tonight,original])if(!valid.some(g=>g.id===bundled.id))valid.push(structuredClone(bundled));return valid;}
export function saveGame(game:Game){saveJSON('feud.editor.draft.v1',game);try{validateGame(game);}catch{return;}const library=games();const i=library.findIndex(g=>g.id===game.id);if(i<0)library.push(game);else library[i]=game;saveJSON(LIBRARY_KEY,library);}
export function download(name:string,value:unknown){const text=typeof value==='string'?value:JSON.stringify(value,null,2);const url=URL.createObjectURL(new Blob([text],{type:name.endsWith('.json')?'application/json':'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
