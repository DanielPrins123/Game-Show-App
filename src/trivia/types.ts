export interface TriviaImage { id:string; data:string; name:string; role:'question'|'answer'|'review' }
export interface TriviaCard {
  id:string; kind:'round'|'question'|'info'; title:string; round:string;
  prompt:string; answers:string[]; scoring:string; maxPoints:number|null;
  seconds:number; sourceSlides:number[]; notes:string; issues:string[]; images:TriviaImage[];
}
export interface SourceSlide { number:number; paragraphs:string[]; notes:string }
export interface TriviaDeck {
  version:1; type:'trivia'; id:string; title:string; fileName:string; importedAt:string;
  cards:TriviaCard[]; source:SourceSlide[]; warnings:string[];
}
export interface TriviaTeam { id:string; name:string; scores:Record<string,number|null> }
export interface Standing { id:string; name:string; total:number; rank:number }
export interface TriviaFrame {
  index:number; phase:'intro'|'card'|'question'|'answers'|'scores'; revealed:number;
  remaining:number; end:number|null; started:boolean;
  checkpoint?:'halfway'|'final'|'manual'; standings?:Standing[]; standingsShown:number;
  scoreReturn?:TriviaFrame;
}
export interface TriviaSession extends TriviaFrame {
  version:1; deckId:string; title:string; date:string; venue:string; teams:TriviaTeam[];
  muted:boolean; volume?:number; revision:number; history:TriviaFrame[]; scoreReturn?:TriviaFrame;
}

export function validateTriviaDeck(value:unknown):TriviaDeck {
  const d=value as TriviaDeck;
  if(!d||d.version!==1||d.type!=='trivia'||typeof d.id!=='string'||!d.id||typeof d.title!=='string'||!Array.isArray(d.cards)||!d.cards.length||d.cards.length>500)throw Error('Choose a trivia JSON export with 1–500 screens.');
  const ids=new Set<string>();
  for(const c of d.cards){
    if(!c||typeof c.id!=='string'||!c.id||ids.has(c.id)||!['round','question','info'].includes(c.kind)||[c.title,c.round,c.prompt,c.scoring,c.notes].some(x=>typeof x!=='string')||!Array.isArray(c.answers)||c.answers.some(a=>typeof a!=='string')||!Number.isInteger(c.seconds)||c.seconds<10||c.seconds>3600||(c.maxPoints!==null&&(!Number.isFinite(c.maxPoints)||c.maxPoints<0))||!Array.isArray(c.sourceSlides)||!Array.isArray(c.issues)||!Array.isArray(c.images))throw Error('A trivia screen has invalid content, timing or points.');
    ids.add(c.id);
    for(const img of c.images)if(!img||typeof img.id!=='string'||typeof img.name!=='string'||!['question','answer','review'].includes(img.role)||typeof img.data!=='string'||!/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(img.data))throw Error('Use embedded PNG, JPEG, GIF or WebP images.');
  }
  if(typeof d.fileName!=='string'||typeof d.importedAt!=='string'||!Array.isArray(d.source)||d.source.some(s=>!s||!Number.isInteger(s.number)||!Array.isArray(s.paragraphs)||s.paragraphs.some(p=>typeof p!=='string')||typeof s.notes!=='string')||!Array.isArray(d.warnings)||d.warnings.some(w=>typeof w!=='string'))throw Error('Trivia source information is missing or invalid.');
  return structuredClone(d);
}

export function validateTriviaSession(value:unknown,deck:TriviaDeck):TriviaSession {
  const s=value as TriviaSession;
  if(!s||s.version!==1||s.deckId!==deck.id||[s.title,s.date,s.venue].some(v=>typeof v!=='string')||!Array.isArray(s.teams)||!s.teams.length||!Number.isInteger(s.index)||s.index<0||s.index>=deck.cards.length||!['intro','card','question','answers','scores'].includes(s.phase)||!Number.isFinite(s.remaining)||s.remaining<0||(s.end!==null&&!Number.isFinite(s.end))||!Number.isInteger(s.revealed)||s.revealed<0)throw Error('This trivia result has invalid saved state.');
  const ids=new Set<string>();for(const t of s.teams){if(!t||typeof t.id!=='string'||ids.has(t.id)||typeof t.name!=='string'||!t.scores||typeof t.scores!=='object'||Object.values(t.scores).some(v=>v!==null&&!Number.isFinite(v)))throw Error('This trivia result has invalid team scores.');ids.add(t.id);}
  // Imported nights resume paused at a title card: scores survive without reviving an old timer.
  return {...structuredClone(s),phase:'card',end:null,remaining:deck.cards[s.index].seconds,revealed:0,started:false,history:[],standings:undefined,standingsShown:0,checkpoint:undefined,scoreReturn:undefined,muted:!!s.muted,revision:0};
}
