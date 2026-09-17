import { current, secondsLeft, type Session } from './engine';
export function Board({session,now,preview=false}:{session:Session;now:number;preview?:boolean}){
  const {round,question}=current(session);const progress=session.progress[question.id];const left=Math.ceil(secondsLeft(session.timer,now));
  const offset=(session.boardPage??0)*8;const answers=question.answers.slice(offset,offset+8);
  return <div className={`board ${preview?'preview':''}`} data-testid="board">
    <div className="board-top"><span className="brand">FAMILY <b>FEUD</b><small>GAME NIGHT</small></span><span className="round-tag">{round.name} <i>•</i> {question.bonus?'BONUS · ':''}{question.points} {question.points===1?'POINT':'POINTS'} / ANSWER</span><span className="board-title">{session.game.title}</span></div>
    {session.roundCard?<div className="round-card"><p>LET’S PLAY</p><h1>{round.name}</h1><span>{session.game.title}</span></div>:<><header className="question"><p>100 people surveyed. Top answers are on the board.</p><h1>{question.text}</h1></header>
    <div className="answer-grid" style={{gridTemplateRows:`repeat(${Math.ceil(answers.length/2)},minmax(0,1fr))`}}>
      {answers.map((a,j)=>{const i=j+offset;const revealed=progress?.revealed.includes(a.id);return <div key={a.id} className={`answer-tile ${revealed?'revealed':''}`} data-testid={`slot-${i+1}`}><span className="rank">{i+1}</span>{revealed?<><strong>{a.text}</strong><span className="count">{a.count}</span></>:<span className="concealed" aria-label={`Answer ${i+1} hidden`}>•••</span>}</div>;})}
    </div></>}
    <footer className="board-bottom"><div className="team-score" style={{borderColor:session.game.teams[0].color}}><span>{session.game.teams[0].name}</span><b data-testid="score-0">{session.scores[0]}</b></div><div className="center-status"><div className="strikes" aria-label={`${progress?.strikes??0} strikes`}>{[0,1,2].map(i=><span key={i} className={i<(progress?.strikes??0)?'on':''}>✕</span>)}</div>{(!session.hideTimer||session.timer.started)&&<div className={`countdown ${left<=5?'warning':''}`} data-testid="timer">{left.toString().padStart(2,'0')}<small>SECONDS</small></div>}</div><div className="team-score" style={{borderColor:session.game.teams[1].color}}><span>{session.game.teams[1].name}</span><b data-testid="score-1">{session.scores[1]}</b></div></footer>
    {session.event?.type==='strike'&&<div key={session.event.id} className="strike-flash" aria-hidden="true">✕</div>}
  </div>;
}
