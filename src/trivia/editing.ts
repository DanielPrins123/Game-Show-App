import type { TriviaDeck, TriviaFrame, TriviaSession } from './types';
import {questionSeconds} from './timing';
export function applyDeckEdits(session:TriviaSession,previous:TriviaDeck,next:TriviaDeck):TriviaSession{
  function remap(frame:TriviaFrame):TriviaFrame{
    const old=previous.cards[frame.index],index=next.cards.findIndex(c=>c.id===old?.id);
    const target=index<0?Math.min(frame.index,next.cards.length-1):index;
    const card=next.cards[target];
    const changed=index<0||JSON.stringify(old)!==JSON.stringify(card);
    if(index<0||old.kind!==card.kind)return {index:target,phase:'card',remaining:questionSeconds(session,card),end:null,started:false,revealed:0,revealedAnswers:[],standingsShown:0,checkpoint:undefined,standings:undefined,scoreReturn:undefined};
    return {...frame,index:target,...(changed?{phase:frame.phase==='answers'?'question' as const:frame.phase,revealed:0,revealedAnswers:[]}:{}),scoreReturn:frame.scoreReturn?remap(frame.scoreReturn):undefined};
  }
  return {...session,...remap(session),deckId:next.id,title:next.title,history:[]};
}
