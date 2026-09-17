export interface Answer { id: string; text: string; count: number }
export interface Question { id: string; text: string; bonus: boolean; points: number; timer?: number; answers: Answer[] }
export interface Round { id: string; name: string; questions: Question[] }
export interface Team { name: string; color: string }
export interface Game { version: 1; id: string; title: string; timer: number; teams: Team[]; rounds: Round[] }
export const uid = () => crypto.randomUUID();
export const newQuestion = (): Question => ({id:uid(),text:'New question',bonus:false,points:1,answers:[{id:uid(),text:'New answer',count:0}]});
export const newGame = (): Game => ({version:1,id:uid(),title:'Untitled game',timer:240,teams:[{name:'Team Blue',color:'#48baff'},{name:'Team Gold',color:'#ffce65'}],rounds:[{id:uid(),name:'Round 1',questions:[newQuestion()]}]});
export function validateGame(value: unknown): Game {
  if (!value || typeof value !== 'object') throw new Error('Expected a game object.');
  const g = value as Game;
  if(g.version !== 1 || typeof g.title !== 'string' || !g.title.trim() || !Array.isArray(g.rounds) || !g.rounds.length) throw new Error('Expected version 1, a title, and at least one round.');
  const integer = (v: number, min: number, max: number) => Number.isInteger(v) && v >= min && v <= max;
  if(!integer(g.timer,1,3600) || !Array.isArray(g.teams) || (g.teams.length < 2 || g.teams.length > 10) || g.teams.some(t=>typeof t.name !== 'string'||!t.name.trim()||!/^#[0-9a-f]{6}$/i.test(t.color))) throw new Error('Use 2–10 named teams with hex colors and a timer from 1–3600 seconds.');
  const ids = new Set<string>();
  const id = (v: string) => {if(typeof v !== 'string'||!v||ids.has(v)) throw new Error('Every game item needs a unique ID.'); ids.add(v);};
  id(g.id);
  for(const r of g.rounds){id(r.id); if(typeof r.name!=='string'||!r.name.trim()||!Array.isArray(r.questions)||!r.questions.length) throw new Error('Each round needs a name and questions.');
    for(const q of r.questions){id(q.id);if(typeof q.text!=='string'||!q.text.trim()||typeof q.bonus!=='boolean'||!integer(q.points,0,1000)||(q.timer!==undefined&&!integer(q.timer,1,3600))||!Array.isArray(q.answers)||!q.answers.length||q.answers.length>100) throw new Error('Each question needs text, 1–100 answers, valid points and timer.');
      for(const a of q.answers){id(a.id);if(typeof a.text!=='string'||!a.text.trim()||!integer(a.count,0,100000)) throw new Error('Answers need text and a nonnegative whole survey count.');}
    }
  }
  return structuredClone(g);
}
export const flatten = (g: Game) => g.rounds.flatMap(r=>r.questions.map(q=>({round:r,question:q})));
