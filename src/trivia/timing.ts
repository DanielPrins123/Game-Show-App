import type {TriviaCard,TriviaSession} from './types';
export function suggestedSeconds(card:TriviaCard){
  if(/final/i.test(card.title))return 390;
  const count=Math.max(card.answers.filter(a=>a.trim()).length,card.prompts?.length??0);
  return count<=1?210:count<=4?270:330;
}
export function cardSeconds(card:TriviaCard){return card.autoTime?suggestedSeconds(card):card.seconds;}
export function questionSeconds(session:TriviaSession,card:TriviaCard){return session.durations?.[card.id]??cardSeconds(card);}
