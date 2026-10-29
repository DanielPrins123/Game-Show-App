import {useEffect,useState} from 'react';
import {IntroDetails,today} from './IntroDetails';
import {Board} from './Board';
import {OpeningScreen} from './OpeningScreen';
import {ScoreRevealDisplay} from './ScoreReveal';
import {current,secondsLeft,clockText,type Session} from './engine';
import {dispatch,readJSON} from './store';
import {finaleQuestions} from './data/finale';
import {withFinale,type ScoreSheet} from './score-model';
import {newSheet} from './Scores';
import {showSequence,currentStepId,finalistIds,type ShowStep} from './show-sequence';
import {audioReady,testSound} from './audio';
import './presenter.css';
export function fullscreen(){if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void document.documentElement.requestFullscreen().catch(()=>{});}
export function ShowDisplay({session,now}:{session:Session;now:number}){
 if(session.scoreShow)return <ScoreRevealDisplay show={session.scoreShow}/>;
 if(session.opening)return <OpeningScreen screen={session.opening} game={session.game} hostName={session.hostName} eventDate={session.eventDate}/>;
 if(session.showStep?.kind==='round')return <div className="board"><div className="round-card"><h1>{current(session).round.name}</h1></div></div>;
 return <Board session={session} now={now}/>;
}
export function Presenter({session,now}:{session:Session;now:number}){
 const sheet=withFinale(readJSON<ScoreSheet>('feud.scores.draft.v1',newSheet(session)),session);
 const steps=showSequence(session,sheet),position=Math.max(0,steps.findIndex(step=>step.id===currentStepId(session))),step=steps[position];
 const {question}=current(session),turn=session.finale,progress=session.progress[question.id],shown=progress?.revealed??[];
 const go=(target:ShowStep,start=false)=>dispatch({type:'showStep',step:target,sheet,start});
 const live=!session.opening&&!session.scoreShow&&session.showStep?.kind!=='round'&&!session.roundCard;
 const canReveal=live&&(!turn||turn.status==='running'&&session.timer.end!==null||turn.status==='ended');
 const nextAnswer=question.answers.find(a=>!shown.includes(a.id));
 const next=()=>{if(position<steps.length-1)go(steps[position+1],true);};
 return <main className="feud-presenter"><header className="feud-toolbar"><h1>Family Feud</h1><button onClick={()=>window.open('#/display','feud-audience')}>Open audience display</button></header>
 <div className="feud-host"><section className="panel feud-controls" data-final={!!turn}><div className="button-row"><button data-show-previous disabled={position===0} onClick={()=>go(steps[position-1])}>← Previous</button><button data-next-show className="primary" disabled={position===steps.length-1} onClick={next}>Next →</button></div>
 <select aria-label="Jump to show slide" value={step.id} onChange={e=>go(steps.find(x=>x.id===e.target.value)!)}>{steps.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select>
 <h2>{step.kind==='question'||step.kind==='title'?`Question ${session.index+1}`:step.label}</h2>
 {session.opening==='logo'&&<IntroDetails date={session.eventDate??today()} name={session.hostName??''} onChange={v=>dispatch({type:'settings',...(v.date!==undefined?{eventDate:v.date}:{}),...(v.hostName!==undefined?{hostName:v.hostName}:{})})}/>}
 {session.scoreShow?<><button data-show-reveal disabled={session.scoreShow.revealed===session.scoreShow.teams.length} onClick={()=>dispatch({type:'revealScore',delta:1})}>Reveal next team ↑</button>{session.scoreShow.stage==='beforeFinale'&&<FinalistPicker session={session} sheet={sheet}/>}</>:!session.opening&&step.kind!=='round'&&<>
 {turn&&<label>Final question<select aria-label="Finale question" value={turn.questionId} onChange={e=>go({...step,kind:'finaleTitle',id:`finaleTitle-${turn.teamId}`,questionId:e.target.value})}>{finaleQuestions.map(q=><option key={q.id} value={q.id}>{q.id.startsWith('finale-20261029')?'New · ':''}{q.answers.length} answers · {q.text}</option>)}</select></label>}
 <p className="feud-private-question">{question.text}</p><div className="feud-answer-buttons">{question.answers.map((a,i)=><button key={a.id} className={shown.includes(a.id)?'answer-is-shown':''} aria-label={`Reveal answer ${i+1}`} aria-pressed={shown.includes(a.id)} disabled={!canReveal} onClick={()=>dispatch({type:shown.includes(a.id)?'hide':'reveal',id:a.id})}><span>{i+1}</span><strong>{a.text}</strong><span>{a.count}</span></button>)}</div>
 <button data-show-reveal disabled={!canReveal||!nextAnswer} onClick={()=>{if(nextAnswer)dispatch({type:'reveal',id:nextAnswer.id});}}>Reveal next answer</button>
 {turn&&<div className="button-row"><button disabled={!canReveal} onClick={()=>dispatch({type:'strike',delta:1})}>✕ Strike ({progress?.strikes??0}/3)</button><button onClick={()=>go({...step,kind:'finaleTitle',id:`finaleTitle-${turn.teamId}`})}>Restart turn</button></div>}
 <FeudTimer key={`${step.id}:${question.id}`} session={session} now={now} before={step.kind==='title'||step.kind==='finaleTitle'}/>
 </>}
 <p className="feud-shortcuts">← / → Slides · Space Reveal · U Undo</p></section><aside className="feud-preview"><ShowDisplay session={session} now={now}/></aside></div></main>;
}
function FeudTimer({session:s,now,before}:{session:Session;now:number;before:boolean}){
 const [value,setValue]=useState(Math.min(600,Math.round(s.timer.duration/30)*30)),left=secondsLeft(s.timer,now),changed=value!==s.timer.duration;
 useEffect(()=>setValue(Math.min(600,Math.round(s.timer.duration/30)*30)),[s.timer.duration]);
 return <div className="feud-timer"><label>Timer <strong>{clockText(before||changed?value:left)}</strong><input aria-label="Seconds for this question" aria-valuetext={clockText(value)} type="range" min="0" max="600" step="30" list="feud-timer-marks" value={value} onChange={e=>{const seconds=Number(e.target.value);setValue(seconds);if(before)dispatch({type:'duration',seconds});}}/><datalist id="feud-timer-marks">{Array.from({length:21},(_,i)=><option key={i} value={i*30}/>)}</datalist><span className="feud-slider-labels">{[0,150,300,450,600].map(n=><span key={n}>{clockText(n)}</span>)}</span></label><div className="button-row"><button disabled={s.finale?.status==='ended'} onClick={()=>dispatch({type:'extend'})}>+30 sec</button>{!before&&<button disabled={s.finale?.status==='ended'} onClick={()=>dispatch(!changed&&left>0?{type:'toggleTimer'}:{type:'duration',seconds:value,start:true})}>{s.timer.end&&left>0&&!changed?'Pause':changed||left===0?'Restart timer':'Start timer'}</button>}</div></div>;
}
function FinalistPicker({session,sheet}:{session:Session;sheet:ScoreSheet}){
 const selected=finalistIds(session,sheet);return <div className="feud-finalists"><h3>Finalists</h3>{sheet.teams.map(t=><label className="check" key={t.id}><input type="checkbox" checked={selected.includes(t.id)} disabled={selected.length>=5&&!selected.includes(t.id)} onChange={e=>dispatch({type:'finalists',sheetId:sheet.id,teamIds:e.target.checked?[...selected,t.id]:selected.filter(id=>id!==t.id)})}/>{t.name}</label>)}</div>;
}
export function FeudSettings({session:s}:{session:Session}){
 return <section className="panel feud-settings"><h2>Sound & settings</h2><div className="button-row"><button onClick={()=>{void testSound(s.volume,s.muted);}}>Enable / test sound</button><span>{audioReady()?'Sound ready':'Sound off'}</span><label className="check"><input type="checkbox" checked={s.muted} onChange={e=>dispatch({type:'settings',muted:e.target.checked})}/>Mute</label><label>Volume<input aria-label="Sound volume" type="range" min="0" max="1" step=".05" value={s.volume} onChange={e=>dispatch({type:'settings',volume:Number(e.target.value)})}/></label><label className="check"><input type="checkbox" checked={s.countdownSound!==false} onChange={e=>dispatch({type:'settings',countdownSound:e.target.checked})}/>Countdown ticks</label><label>Reveal sound<select value={s.revealSound??'chime'} onChange={e=>dispatch({type:'settings',revealSound:e.target.value as 'chime'|'silent'})}><option value="chime">Chime</option><option value="silent">Silent</option></select></label></div></section>;
}
