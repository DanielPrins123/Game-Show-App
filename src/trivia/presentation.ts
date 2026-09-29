import type { TriviaCard } from './types';
export function promptParts(card:TriviaCard){
  const lines=card.prompt.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  const notes=lines.filter(line=>/^(note|hint):/i.test(line));
  const body=lines.filter(line=>!/^(note|hint):/i.test(line));
  // Old pasted decks often put a question and each short choice on consecutive lines.
  const inferred=!card.prompts?.length&&body.length>1&&body.slice(1).every(line=>line.length<90&&!/[?]$/.test(line));
  return {question:inferred?body[0]:body.join('\n\n'),items:card.prompts?.length?card.prompts:inferred?body.slice(1):[],notes};
}
export function visibleAnswers(revealed:number,indices?:number[]){return indices??Array.from({length:revealed},(_,i)=>i);}
