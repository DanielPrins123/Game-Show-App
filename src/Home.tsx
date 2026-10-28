import { useTriviaSession } from './trivia/storage';
import { useSession, SESSION_KEY, games, dispatch, readJSON, saveJSON } from './store';
import './Home.css';
import {startSession} from './engine';
import {newSheet} from './Scores';
import {withFinale,type ScoreSheet} from './score-model';
export function Home(){
 const trivia=useTriviaSession(),feud=useSession();
 const hasFeud=localStorage.getItem(SESSION_KEY)!==null;
 return <main className="game-home"><h1>Game night</h1><p>Choose a game to begin or pick up where you left off.</p><div className="home-modes"><section><h2>Trivia night</h2><a className="home-primary" href="#/trivia/select">Choose a new set</a>{trivia&&<a href="#/trivia/presenter">Continue autosaved game <small>{trivia.title} · {trivia.date}{trivia.venue&&` · ${trivia.venue}`}</small></a>}<a href="#/trivia/results">Open a saved game</a><a href="#/trivia">Create or edit a set</a></section><section><h2>Family Feud</h2><label>Set<select aria-label="Family Feud set" id="feud-start-set">{games().map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label><button className="home-primary" onClick={()=>{const id=(document.getElementById('feud-start-set') as HTMLSelectElement).value,game=games().find(g=>g.id===id);if(!game)return;if(hasFeud&&!confirm('Start a new game? Current scores will be saved.'))return;const draft=readJSON<ScoreSheet|null>('feud.scores.draft.v1',null);if(draft){const saved=readJSON<ScoreSheet[]>('feud.scores.saved.v1',[]);if(!saveJSON('feud.scores.saved.v1',[{...withFinale(draft,feud),liveFinale:false,savedAt:new Date().toISOString()},...saved.filter(r=>r.id!==draft.id)]))return;}saveJSON('feud.scores.draft.v1',newSheet(startSession(game)));dispatch({type:'new',game});location.hash='/presenter';}}>Start new game</button><a href="#/editor">Create or edit a set</a>{hasFeud&&<a href="#/presenter">Continue autosaved game <small>{feud.game.title}</small></a>}<a href="#/scores">Open saved scores</a></section></div></main>;
}
