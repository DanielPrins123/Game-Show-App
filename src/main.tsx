import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './Editor';
import { Presenter, FeudSettings, ShowDisplay, fullscreen } from './Presenter';
import { Scores } from './Scores';
import { secondsLeft } from './engine';
import { dispatch, heartbeat, useSession } from './store';
import { sound, unlockAudio, scorePitch } from './audio';
import './styles.css';
import { Home } from './Home';
import { TriviaApp } from './trivia/TriviaApp';
function App(){const session=useSession();const [route,setRoute]=useState(location.hash||'#/home');const [now,setNow]=useState(Date.now());const [storageError,setStorageError]=useState(false);const played=useRef('');const warned=useRef('');const expired=useRef('');const ticked=useRef('');
  const display=route==='#/display'||route==='#/score-show';const gameplay=display||route==='#/presenter';
  useEffect(()=>{const interval=setInterval(()=>setNow(Date.now()),100);const hash=()=>setRoute(location.hash||'#/home');const storage=()=>setStorageError(true);window.addEventListener('hashchange',hash);window.addEventListener('storage-failed',storage);window.addEventListener('pointerdown',unlockAudio);window.addEventListener('keydown',unlockAudio);return()=>{clearInterval(interval);window.removeEventListener('hashchange',hash);window.removeEventListener('storage-failed',storage);window.removeEventListener('pointerdown',unlockAudio);window.removeEventListener('keydown',unlockAudio);};},[]);
  useEffect(()=>{if(!display)return;heartbeat();const i=setInterval(heartbeat,1500);return()=>clearInterval(i);},[display]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{
    if(route!=='#/presenter'||e.ctrlKey||e.metaKey||e.altKey||e.repeat||(e.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"],.scores-page,.feud-settings'))return;
    const k=e.key.toLowerCase();let handled=true;
    if(k==='arrowright'||k==='n')document.querySelector<HTMLButtonElement>('[data-next-show]')?.click();
    else if(k==='arrowleft'||k==='p')document.querySelector<HTMLButtonElement>('[data-show-previous]')?.click();
    else if(k===' ')document.querySelector<HTMLButtonElement>('[data-show-reveal]')?.click();
    else if(/^[1-8]$/.test(k))document.querySelector<HTMLButtonElement>(`[aria-label="Reveal answer ${k}"]`)?.click();
    else if(k==='u')dispatch({type:'undo'});else if(k==='t')dispatch({type:'toggleTimer'});else if(k==='+')dispatch({type:'extend'});else if(k==='x')dispatch({type:'strike',delta:1});else if(k==='f')fullscreen();else handled=false;
    if(handled)e.preventDefault();
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[route]);
  useEffect(()=>{if(!gameplay||display||route.startsWith('#/trivia'))return;const canPlay=true;if(session.event&&played.current!==session.event.id){played.current=session.event.id;if(canPlay)sound(session.event.type,session.volume,session.muted||(session.event.type==='reveal'&&session.revealSound==='silent'),session.scoreShow?scorePitch(session.scoreShow.revealed,session.scoreShow.teams.length):880);}const left=secondsLeft(session.timer,now);const cycle=`${session.timer.cycle}:${session.timer.end}`;if(session.timer.end!==null){const second=Math.ceil(left);const tickKey=`${cycle}:${second}`;if(second>0&&second<=10&&session.countdownSound!==false&&ticked.current!==tickKey){ticked.current=tickKey;if(canPlay)sound('tick',session.volume,session.muted);}if(left>0&&left<=(session.finale?5:30)&&warned.current!==cycle){warned.current=cycle;if(canPlay&&(!session.finale||session.countdownSound===false))sound('warning',session.volume,session.muted);}if(left===0&&expired.current!==cycle){expired.current=cycle;if(canPlay&&!session.finale)sound('expired',session.volume,session.muted);if(session.finale?.status==='running')dispatch({type:'expire'});}}},[session,now,gameplay,display,route]);
  useEffect(()=>{if(route==='#/scores'||route==='#/leaderboard')location.hash='/presenter';},[route]);
  if(route==='#/home')return <Home/>;
  if(route.startsWith('#/trivia'))return <>{route!=='#/trivia/display'&&<nav className="app-nav trivia-nav"><a href="#/home">Choose game</a></nav>}<TriviaApp route={route}/></>;
  if(display)return <div className="display-page" onDoubleClick={fullscreen}><ShowDisplay session={session} now={now}/></div>;
  return <><nav className="app-nav"><div><a href="#/home">Choose game</a><a href="#/presenter">Presenter</a><a href="#/editor">Game editor</a></div></nav>{storageError&&<div role="alert" className="storage-error">Browser storage is unavailable. Export your game and results before closing.</div>}{route==='#/editor'?<Editor/>:<><Presenter session={session} now={now}/><Scores session={session} settings={<FeudSettings session={session}/>}/></>}</>;

}
class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<main><h1>Something went wrong.</h1><p>Your saved data is still in this browser. Reload to try again.</p><button onClick={()=>location.reload()}>Reload</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><App/></ErrorBoundary>);
