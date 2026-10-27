import type {TriviaFrame, TriviaSession} from './types';

export function removeTeamFromStandings(session:TriviaSession,id:string){
  function clean(frame:TriviaFrame){
    if(frame.standings){
      const boundary=frame.standings.length-frame.standingsShown;
      frame.standingsShown-=frame.standings.filter((t,i)=>t.id===id&&i>=boundary).length;
      frame.standings=frame.standings.filter(t=>t.id!==id);
      for(const team of frame.standings)team.rank=1+frame.standings.filter(t=>t.total>team.total).length;
    }
    if(frame.scoreReturn)clean(frame.scoreReturn);
  }
  clean(session);
  session.history.forEach(clean);
}
