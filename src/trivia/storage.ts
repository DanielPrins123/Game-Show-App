import { useSyncExternalStore } from 'react';
import type { TriviaDeck, TriviaSession } from './types';
const KEY='trivia.session.v1';
function read():TriviaSession|null{try{const s=JSON.parse(localStorage.getItem(KEY)??'null');return s?.version===1&&typeof s.deckId==='string'&&Array.isArray(s.teams)&&Array.isArray(s.history)?s:null;}catch{return null;}}
let state=read();const listeners=new Set<()=>void>();
type Change=(s:TriviaSession|null)=>TriviaSession|null;
const pending:{change:Change}[]=[];
const channel=(()=>{try{return typeof BroadcastChannel==='undefined'?null:new BroadcastChannel('trivia.live.v1');}catch{return null;}})();
function refresh(){state=pending.reduce((current,item)=>item.change(current)??current,read());listeners.forEach(fn=>fn());}
window.addEventListener('storage',event=>{if(event.key===KEY)refresh();});
if(channel)channel.onmessage=refresh;
export function useTriviaSession(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>state);}
export async function updateTrivia(fn:Change){
  // Show keystrokes immediately; replay pending edits over each committed revision so
  // a delayed lock/storage event cannot roll a controlled input back while typing.
  const item={change:fn};pending.push(item);
  const apply=()=>{const current=read();const next=fn(current);if(!next)return;next.revision=(current?.revision??0)+1;try{localStorage.setItem(KEY,JSON.stringify(next));}catch{window.dispatchEvent(new Event('storage-failed'));throw Error('Browser storage is unavailable. Export a backup before continuing.');}channel?.postMessage('state');};
  try{refresh();if(navigator.locks)await navigator.locks.request('trivia-state',apply);else apply();}finally{pending.splice(pending.indexOf(item),1);refresh();}
}
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('game-night-trivia',2);request.onupgradeneeded=()=>{for(const name of ['decks','results','drafts'])if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name,{keyPath:'id'});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Local trivia storage could not be opened.'));});}
async function transaction<T>(name:'decks'|'results'|'drafts',mode:IDBTransactionMode,run:(store:IDBObjectStore)=>IDBRequest):Promise<T>{
  const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(name,mode),request=run(tx.objectStore(name));let result:T;request.onsuccess=()=>{result=request.result as T;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=tx.onabort=()=>{db.close();reject(Error('Could not save trivia data. Export a JSON backup and check browser storage.'));};});
}
export const saveTriviaDeck=(deck:TriviaDeck)=>transaction('decks','readwrite',s=>s.put(deck));
export const getTriviaDeck=(id:string)=>transaction<TriviaDeck|undefined>('decks','readonly',s=>s.get(id));
export const listTriviaDecks=()=>transaction<TriviaDeck[]>('decks','readonly',s=>s.getAll());
export interface TriviaResult { id:string; savedAt:string; session:TriviaSession; deck:TriviaDeck }
export const saveTriviaResult=(session:TriviaSession,deck:TriviaDeck)=>transaction('results','readwrite',s=>s.put({id:crypto.randomUUID(),savedAt:new Date().toISOString(),session:structuredClone(session),deck}));
export const listTriviaResults=()=>transaction<TriviaResult[]>('results','readonly',s=>s.getAll());
let draftWrites:Promise<unknown>=Promise.resolve();
export function saveTriviaDraft(deck:TriviaDeck){const snapshot=structuredClone(deck);const write=draftWrites.catch(()=>undefined).then(()=>transaction('drafts','readwrite',s=>s.put({id:'current',deck:snapshot})));draftWrites=write;return write;}
export const getTriviaDraft=async()=>{const result=await transaction<{deck:TriviaDeck}|undefined>('drafts','readonly',s=>s.get('current'));return result?.deck;};
