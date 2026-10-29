import {useLayoutEffect,useRef} from 'react';
import { current, secondsLeft, clockText, type Session } from './engine';
export function Board({session,now,preview=false}:{session:Session;now:number;preview?:boolean}){
  const {round,question}=current(session);const progress=session.progress[question.id];const left=Math.ceil(secondsLeft(session.timer,now));
  const offset=(session.boardPage??0)*8;const answers=question.answers.slice(offset,offset+8);const turn=session.finale;const ready=turn?.status==='ready';
  const heading=useRef<HTMLHeadingElement>(null);
  useLayoutEffect(()=>{
    const el=heading.current;if(!el)return;
    const fit=()=>{
      el.style.fontSize='3.2cqw';
      const header=el.parentElement!,label=header.querySelector('p')!,style=getComputedStyle(header);
      const available=header.clientHeight-label.getBoundingClientRect().height-parseFloat(getComputedStyle(label).marginBottom)-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
      let size=parseFloat(getComputedStyle(el).fontSize);
      while((el.scrollHeight>available||el.scrollWidth>el.clientWidth)&&size>10){size-=.5;el.style.fontSize=`${size}px`;}
    };
    const observer=new ResizeObserver(fit);observer.observe(el.parentElement!);fit();return()=>observer.disconnect();
  },[question.text,ready,session.roundCard]);
  return <div className={`board ${preview?'preview':''}`} data-testid="board">
    <div className="board-top"><span className="brand">FAMILY <b>FEUD</b><small>GAME NIGHT</small></span><span className="round-tag">{round.name} <i>•</i> {question.bonus?'BONUS · ':''}{question.points} {question.points===1?'POINT':'POINTS'} / ANSWER</span></div>
    {ready?<div className="round-card"><p>{session.timer.duration} SECONDS · {question.answers.length} ANSWERS</p><h1>{turn.teamName}</h1><span>Four points per correct answer.</span></div>:session.roundCard?<div className="round-card" data-testid="question-title-card"><p>{round.name}</p><h1>{`Question ${session.index+1}`}</h1><span>{question.bonus?`${question.answers.length} answers · ${question.points} points each`:""}</span></div>:<><header className="question"><p>{question.answers.length} answers on the board</p><h1 ref={heading}>{question.text}</h1></header>
    <div className="answer-grid" style={{gridTemplateRows:`repeat(${Math.ceil(answers.length/2)},minmax(0,1fr))`}}>
      {answers.map((a,j)=>{const i=j+offset;const revealed=progress?.revealed.includes(a.id);return <div key={a.id} className={`answer-tile ${revealed?'revealed':''}`} data-testid={`slot-${i+1}`}><span className="rank">{i+1}</span>{revealed?<><strong>{a.text}</strong><span className="count">{a.count}</span></>:<span className="concealed" aria-label={`Answer ${i+1} hidden`}>•••</span>}</div>;})}
    </div></>}
    {!session.roundCard&&<footer className="board-bottom written-footer"><div className="round-instructions">{turn?<strong>{turn.teamName}</strong>:<><strong>{session.collected?'Let’s see the answers!':`${question.answers.length} answers`}</strong><span>{question.points} {question.points===1?'point':'points'} per correct answer</span></>}</div><div className="center-status">{turn&&<div className="strikes" aria-label={`${progress?.strikes??0} strikes`}>{[0,1,2].map(i=><span key={i} className={i<(progress?.strikes??0)?'on':''}>✕</span>)}</div>}{(!session.hideTimer||session.timer.started||turn)&&<div className={`countdown ${left<=(turn?5:30)?'warning':''}`} data-testid="timer">{clockText(left)}<small>{turn?.status==='ended'?turn.reason:session.timer.started&&left===0?'TIME’S UP':session.timer.end===null&&session.timer.started?'PAUSED':'TIME REMAINING'}</small></div>}</div></footer>}
    {!session.roundCard&&session.timer.started&&left===0&&!session.collected&&<div className="time-up" role="status">TIME’S UP!</div>}
    {!turn&&session.extensionAt!==undefined&&now-session.extensionAt<2500&&<div className="extension-toast" key={session.extensionAt}>+30 SECONDS </div>}
    {turn&&session.event?.type==='strike'&&<div key={session.event.id} className="strike-flash" aria-hidden="true">✕</div>}
  </div>;
}
