import { useTriviaSession } from './trivia/storage';
import { useSession, SESSION_KEY } from './store';
import './Home.css';
export function Home(){
 const trivia=useTriviaSession(),feud=useSession();
 const hasFeud=localStorage.getItem(SESSION_KEY)!==null;
 return <main className="game-home"><p className="home-eyebrow">WITH YOUR HOST, DANIEL PRINS</p><h1>Game night</h1><p>Choose a game to begin or pick up where you left off.</p><div className="home-modes"><section><h2>Trivia night</h2><a className="home-primary" href="#/trivia/select">Choose a new set</a>{trivia&&<a href="#/trivia/presenter">Continue autosaved game <small>{trivia.title} · {trivia.date}{trivia.venue&&` · ${trivia.venue}`}</small></a>}<a href="#/trivia/results">Open a saved game</a><a href="#/trivia">Create or edit a set</a></section><section><h2>Family Feud</h2><a className="home-primary" href="#/editor">Choose a new set</a>{hasFeud&&<a href="#/presenter">Continue autosaved game <small>{feud.game.title}</small></a>}<a href="#/scores">Open saved scores</a></section></div></main>;
}
