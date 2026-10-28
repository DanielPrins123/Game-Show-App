import { eventDate as displayDate, today } from './IntroDetails';
import { liveGame, type Game } from './model';
export function OpeningScreen({screen,game,hostName='',eventDate=today()}:{screen:'logo'|'instructions';game:Game;hostName?:string;eventDate?:string}){
  game=liveGame(game);
  const questions=game.rounds.flatMap(round=>round.questions);
  const perRound=game.rounds[0].questions.length;
  const equalRounds=game.rounds.every(round=>round.questions.length===perRound);
  const bonuses=game.rounds[0].questions.filter(question=>question.bonus).length;
  const equalBonuses=equalRounds&&game.rounds.every(round=>round.questions.filter(question=>question.bonus).length===bonuses);
  const points=(bonus:boolean)=>[...new Set(questions.filter(question=>question.bonus===bonus).map(question=>question.points))].join(' / ');
  return <section className={`opening-screen ${screen}`} data-testid={`opening-${screen}`}>
    <div className="opening-lights" aria-hidden="true"/>
    {screen==='logo'?<><header className="feud-logo" aria-label="Family Feud"><span>FAMILY</span><strong>FEUD</strong></header><div className="opening-welcome"><h1>{game.title}</h1>{eventDate&&<p>{displayDate(eventDate)}</p>}{hostName.trim()&&<p className="host-credit">With your host, <strong>{hostName}</strong></p>}</div></>:<div className="format-overview">
      <h1>Tonight’s game</h1>
      <div className="format-numbers"><p><strong>{game.rounds.length}</strong><span>ROUNDS</span></p><p><strong>{equalRounds?perRound:questions.length}</strong><span>{equalRounds?'QUESTIONS EACH':'QUESTIONS'}</span></p></div>
      <p className="format-rounds">{equalBonuses?`${perRound-bonuses} regular ${perRound-bonuses===1?'question':'questions'} + ${bonuses} bonus ${bonuses===1?'question':'questions'} per round`:`${questions.length} questions across ${game.rounds.length} rounds`}</p>
      <div className="format-scoring">{points(false)&&<p><span>Regular answers</span><strong>{points(false)} {points(false)==='1'?'point':'points'}</strong></p>}{points(true)&&<p><span>Bonus answers</span><strong>{points(true)} {points(true)==='1'?'point':'points'}</strong></p>}</div>

      <p className="format-finale">Then the timed finale: 60 seconds · 4 points per answer</p>
    </div>}
  </section>;
}
