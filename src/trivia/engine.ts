import type { TriviaDeck, TriviaFrame, TriviaSession, Standing } from './types';
export type TriviaAction={type:'next'|'previous'|'undo'|'reveal'|'hideAnswers'|'toggleTimer'|'extend'|'resetTimer'|'intro'|'closeScores'|'revealStanding'}|{type:'revealAnswer';index:number}|{type:'jump';index:number}|{type:'scores';checkpoint:'manual'|'halfway'|'beforeFinal'|'final'};
export const triviaLeft=(s:TriviaFrame,now=Date.now())=>Math.max(0,s.end===null?s.remaining:(s.end-now)/1000);
export function newTriviaSession(deck:TriviaDeck):TriviaSession{
  const date=new Date();return {version:1,deckId:deck.id,title:deck.title,date:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,venue:'',teams:[{id:crypto.randomUUID(),name:'Team 1',scores:{}},{id:crypto.randomUUID(),name:'Team 2',scores:{}}],muted:false,revision:0,history:[],index:0,phase:'intro',revealed:0,remaining:deck.cards[0]?.seconds??240,end:null,started:false,standingsShown:0};
}
function frame(s:TriviaSession,now:number):TriviaFrame{return {index:s.index,phase:s.phase,revealed:s.revealed,revealedAnswers:s.revealedAnswers,remaining:triviaLeft(s,now),end:s.end,started:s.started,checkpoint:s.checkpoint,standings:structuredClone(s.standings),standingsShown:s.standingsShown,scoreReturn:structuredClone(s.scoreReturn)};}
export function triviaStandings(s:TriviaSession,deck:TriviaDeck,through=deck.cards.length-1):Standing[]{
  const ids=deck.cards.slice(0,through+1).filter(c=>c.kind==='question').map(c=>c.id);
  const teams=s.teams.map(t=>({id:t.id,name:t.name,total:ids.reduce((sum,id)=>sum+(t.scores[id]??0),0),rank:0})).sort((a,b)=>b.total-a.total);
  for(const t of teams)t.rank=1+teams.filter(other=>other.total>t.total).length;return teams;
}
function enter(s:TriviaSession,deck:TriviaDeck,index:number){s.index=Math.max(0,Math.min(deck.cards.length-1,index));s.phase='card';s.revealed=0;s.revealedAnswers=[];s.remaining=deck.cards[s.index].seconds;s.end=null;s.started=false;s.checkpoint=undefined;s.standings=undefined;s.standingsShown=0;}
function showScores(s:TriviaSession,deck:TriviaDeck,checkpoint:'manual'|'halfway'|'beforeFinal'|'final',now:number){s.scoreReturn=frame(s,now);s.remaining=triviaLeft(s,now);s.end=null;s.phase='scores';s.checkpoint=checkpoint;s.standings=triviaStandings(s,deck,checkpoint==='halfway'||checkpoint==='beforeFinal'?s.index:undefined).slice(0,10);s.standingsShown=0;}
export function reduceTrivia(state:TriviaSession,action:TriviaAction,deck:TriviaDeck,now=Date.now()):TriviaSession{
  const s=structuredClone(state);const c=deck.cards[s.index];
  if(action.type==='undo'||action.type==='previous'){
    const previous=s.history.pop();if(!previous)return state;Object.assign(s,previous);s.end=previous.end===null?null:now+previous.remaining*1000;return s;
  }
  const before=frame(state,now);
  if(action.type==='intro'){s.phase='intro';s.end=null;s.remaining=triviaLeft(state,now);}
  else if(action.type==='jump')enter(s,deck,action.index);
  else if(action.type==='scores'){if(s.phase==='scores')return state;showScores(s,deck,action.checkpoint,now);}
  else if(action.type==='revealStanding'){if(s.phase!=='scores')return state;s.standingsShown=Math.min(s.standings?.length??0,s.standingsShown+1);}
  else if(action.type==='closeScores'){
    if(s.phase!=='scores'||!s.scoreReturn)return state;const back=s.scoreReturn;Object.assign(s,back);s.end=back.end===null?null:now+back.remaining*1000;s.scoreReturn=undefined;
  }else if(action.type==='next'){
    if(s.phase==='intro')enter(s,deck,0);
    else if(s.phase==='scores'){
      if(s.checkpoint==='final')return state;
      if(s.checkpoint==='manual'){if(s.scoreReturn){const back=s.scoreReturn;Object.assign(s,back);s.end=back.end===null?null:now+back.remaining*1000;}}
      else enter(s,deck,s.index+1);s.scoreReturn=undefined;
    }else if(s.phase==='card'&&c.kind==='question'){s.phase='question';s.end=now+s.remaining*1000;s.started=true;}
    else {
      const next=deck.cards[s.index+1];const rounds=deck.cards.filter(card=>card.kind==='round');const nextRound=next?.kind==='round'?rounds.findIndex(card=>card.id===next.id):-1;
      if(!next)showScores(s,deck,'final',now);
      else if(next.kind==='question'&&(s.index+1===deck.cards.map(card=>card.kind).lastIndexOf('question')))showScores(s,deck,'beforeFinal',now);
      else if(nextRound===2||(rounds.length===2&&nextRound===1))showScores(s,deck,'halfway',now);
      else enter(s,deck,s.index+1);
    }
  }else if(action.type==='reveal'||action.type==='revealAnswer'){
    if(c.kind!=='question'||!['question','answers'].includes(s.phase)||!c.answers.length)return state;
    const visible=s.revealedAnswers??Array.from({length:s.revealed},(_,i)=>i);
    const index=action.type==='revealAnswer'?action.index:c.answers.findIndex((_,i)=>!visible.includes(i));
    if(!Number.isInteger(index)||index<0||index>=c.answers.length)return state;
    s.revealedAnswers=visible.includes(index)?visible.filter(i=>i!==index):[...visible,index];
    s.phase=s.revealedAnswers.length?'answers':'question';s.revealed=s.revealedAnswers.length;s.remaining=triviaLeft(s,now);s.end=null;
  }else if(action.type==='hideAnswers'){if(c.kind!=='question')return state;s.revealed=0;s.revealedAnswers=[];s.phase='question';}
  else if(action.type==='toggleTimer'){
    if(!['question','answers'].includes(s.phase))return state;
    const left=triviaLeft(s,now);s.remaining=left||c.seconds;s.end=s.end===null?now+s.remaining*1000:null;s.started=true;
  }else if(action.type==='extend'){if(!['question','answers'].includes(s.phase))return state;s.remaining=triviaLeft(s,now)+30;if(s.end!==null)s.end=now+s.remaining*1000;}
  else if(action.type==='resetTimer'){s.remaining=c.seconds;s.end=null;s.started=false;}
  s.history=[...state.history.slice(-49),before];return s;
}
