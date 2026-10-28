import {stepStandings} from '../standings-reveal';
import type { TriviaDeck, TriviaFrame, TriviaSession, Standing } from './types';
import {cardSeconds,questionSeconds} from './timing';
export type TriviaAction={type:'showAnswerBoard'|'next'|'previous'|'undo'|'reveal'|'hideAnswers'|'toggleTimer'|'extend'|'resetTimer'|'intro'|'closeScores'|'revealStanding'}|{type:'duration';seconds:number;start?:boolean}|{type:'revealAnswer';index:number}|{type:'jump';index:number}|{type:'scores';checkpoint:'manual'|'halfway'|'beforeFinal'|'final'};
export const triviaLeft=(s:TriviaFrame,now=Date.now())=>Math.max(0,s.end===null?s.remaining:(s.end-now)/1000);
export function newTriviaSession(deck:TriviaDeck):TriviaSession{
  const date=new Date();return {version:1,deckId:deck.id,title:deck.title,date:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,venue:'',teams:[{id:crypto.randomUUID(),name:'Team 1',scores:{}},{id:crypto.randomUUID(),name:'Team 2',scores:{}}],muted:false,revision:0,history:[],index:0,phase:'intro',revealed:0,remaining:deck.cards[0]?cardSeconds(deck.cards[0]):180,end:null,started:false,standingsShown:0};
}
function frame(s:TriviaSession,now:number):TriviaFrame{return {extensionAt:s.extensionAt,durations:structuredClone(s.durations),index:s.index,phase:s.phase,revealed:s.revealed,revealedAnswers:s.revealedAnswers,remaining:triviaLeft(s,now),end:s.end,started:s.started,checkpoint:s.checkpoint,standings:structuredClone(s.standings),standingsShown:s.standingsShown,scoreReturn:structuredClone(s.scoreReturn)};}
export function triviaStandings(s:TriviaSession,deck:TriviaDeck,through=deck.cards.length-1):Standing[]{
  const ids=deck.cards.slice(0,through+1).filter(c=>c.kind==='question').map(c=>c.id);
  const teams=s.teams.map(t=>({id:t.id,name:t.name,total:ids.reduce((sum,id)=>sum+(t.scores[id]??0),0),rank:0})).sort((a,b)=>b.total-a.total);
  for(const t of teams)t.rank=1+teams.filter(other=>other.total>t.total).length;return teams;
}
function enter(s:TriviaSession,deck:TriviaDeck,index:number){s.index=Math.max(0,Math.min(deck.cards.length-1,index));s.extensionAt=undefined;s.phase='card';s.revealed=0;s.revealedAnswers=[];s.remaining=questionSeconds(s,deck.cards[s.index]);s.end=null;s.started=false;s.checkpoint=undefined;s.standings=undefined;s.standingsShown=0;}
function showScores(s:TriviaSession,deck:TriviaDeck,checkpoint:'manual'|'halfway'|'beforeFinal'|'final',now:number){s.scoreReturn=frame(s,now);s.remaining=triviaLeft(s,now);s.end=null;s.phase='scores';s.checkpoint=checkpoint;s.standings=triviaStandings(s,deck,checkpoint==='halfway'||checkpoint==='beforeFinal'?s.index:undefined).slice(0,10);s.standingsShown=0;}
export function reduceTrivia(state:TriviaSession,action:TriviaAction,deck:TriviaDeck,now=Date.now()):TriviaSession{
  const s=structuredClone(state);const c=deck.cards[s.index];
  if(action.type==='undo'){
    const previous=s.history.pop();if(!previous)return state;s.extensionAt=undefined;Object.assign(s,previous);s.end=previous.end===null?null:now+previous.remaining*1000;return s;
  }
  const before=frame(state,now);
  if(action.type==='previous'){
    if(s.phase==='intro')return state;
    if(s.phase==='scores'&&s.checkpoint==='manual'&&s.scoreReturn){const back=s.scoreReturn;enter(s,deck,back.index);s.phase=back.phase==='answers'?'question':back.phase;s.remaining=back.remaining;}
    else {
      const slides:{index:number;phase:'intro'|'card'|'question'|'scores';checkpoint?:'halfway'|'beforeFinal'|'final'}[]=[{index:0,phase:'intro'}];
      const rounds=deck.cards.filter(card=>card.kind==='round');
      deck.cards.forEach((card,index)=>{
        const round=card.kind==='round'?rounds.findIndex(r=>r.id===card.id):-1;
        if(index>0&&card.kind==='question'&&index===deck.cards.map(q=>q.kind).lastIndexOf('question'))slides.push({index:index-1,phase:'scores',checkpoint:'beforeFinal'});
        else if(index>0&&(round===2||(rounds.length===2&&round===1)))slides.push({index:index-1,phase:'scores',checkpoint:'halfway'});
        slides.push({index,phase:'card'});if(card.kind==='question')slides.push({index,phase:'question'});
      });
      slides.push({index:deck.cards.length-1,phase:'scores',checkpoint:'final'});
      const position=slides.findIndex(x=>x.index===s.index&&x.phase===(s.phase==='answers'?'question':s.phase)&&(x.phase!=='scores'||x.checkpoint===s.checkpoint));
      const target=slides[Math.max(0,position-1)];enter(s,deck,target.index);
      if(target.phase==='scores')showScores(s,deck,target.checkpoint!,now);else s.phase=target.phase;
    }
  }
  else if(action.type==='intro'){
s.phase='intro';s.end=null;s.remaining=triviaLeft(state,now);}
  else if(action.type==='jump')enter(s,deck,action.index);
  else if(action.type==='scores'){if(s.phase==='scores')return state;showScores(s,deck,action.checkpoint,now);}
  else if(action.type==='revealStanding'){if(s.phase!=='scores')return state;s.standingsShown=stepStandings(s.standings??[],s.standingsShown,1);}
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
  }else if(action.type==='showAnswerBoard'){if(c.kind!=='question'||s.phase!=='question')return state;s.phase='answers';s.remaining=triviaLeft(s,now);s.end=null;
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
    const left=triviaLeft(s,now);s.remaining=left||questionSeconds(s,c);s.end=s.end===null?now+s.remaining*1000:null;s.started=true;
  }else if(action.type==='extend'){if(c.kind!=='question'||!['card','question','answers'].includes(s.phase))return state;if(s.phase==='card'){s.durations={...s.durations,[c.id]:Math.min(600,questionSeconds(s,c)+30)};s.remaining=s.durations[c.id];}else{s.extensionAt=now;s.remaining=triviaLeft(s,now)+30;if(s.end!==null)s.end=now+s.remaining*1000;}}
  else if(action.type==='duration'){
    if(c.kind!=='question'||s.phase==='scores'||!Number.isInteger(action.seconds)||action.seconds<0||action.seconds>600||action.seconds%30!==0)return state;
    s.durations={...s.durations,[c.id]:action.seconds};s.remaining=action.seconds;if(s.end!==null||action.start)s.end=now+action.seconds*1000;if(action.start)s.started=true;
  }
  else if(action.type==='resetTimer'){s.remaining=questionSeconds(s,c);s.end=null;s.started=false;}
  s.history=[...state.history.slice(-49),before];return s;
}
