export function OpeningScreen({screen,title}:{screen:'logo'|'instructions';title:string}){
  return <section className={`opening-screen ${screen}`} data-testid={`opening-${screen}`}>
    <div className="opening-lights" aria-hidden="true"/>
    <header className="feud-logo" aria-label="Family Feud"><span>FAMILY</span><strong>FEUD</strong></header>
    {screen==='logo'?<div className="opening-welcome"><p>WELCOME TO GAME NIGHT</p><h1>{title}</h1><p className="host-credit">With your host, <strong>Daniel Prins</strong></p><span>Find your team. Get comfortable. We’ll begin shortly.</span></div>:<div className="opening-instructions"><p className="opening-kicker">HOW TO PLAY</p><h1>Think like the survey.</h1><ol><li><b>Discuss & write.</b> Each question shows how many answers you need. Write one guess for each answer.</li><li><b>Hand it in.</b> Bring your team’s sheet to the host when you’re ready. Watch the timer for the deadline.</li><li><b>See what scored.</b> The host grades all teams, then reveals the board. Earn the points shown per correct answer.</li><li><b>Watch the standings.</b> Scores are revealed at the checkpoints. Survey counts aren’t your points!</li></ol><span className="opening-good-luck">Same question. Every team. Good luck!</span></div>}
    <footer>{screen==='logo'?'THE TOP ANSWERS ARE WAITING…':'PENS READY · TEAMWORK ON'}</footer>
  </section>;
}

