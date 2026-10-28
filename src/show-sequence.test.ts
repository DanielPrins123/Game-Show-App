import {it,expect} from 'vitest';
import {startSession,reduce,current} from './engine';
import {validateGame,flatten} from './model';
import raw from './data/original.json';
import {showSequence,currentStepId} from './show-sequence';
import type {ScoreSheet} from './score-model';
const fresh=()=>startSession(validateGame({...raw,timer:240}));
const sheet:ScoreSheet={id:'night',title:'Test',date:'2026-10-27',venue:'Club',liveFinale:true,questions:flatten(fresh().game).map(x=>x.question.text),teams:[{id:'a',name:'A',scores:Array(15).fill(2)},{id:'b',name:'B',scores:Array(15).fill(3)}]};
it('traverses the entire show forward and backward without undoing grades',()=>{
 let s=fresh();s=reduce(s,{type:'finalePoints',sheetId:'night',teamId:'a',teamName:'A',points:44});const steps=showSequence(s,sheet);
 expect(steps.filter(x=>x.kind==='round')).toHaveLength(4);expect(steps.filter(x=>x.kind==='question')).toHaveLength(15);expect(steps.filter(x=>x.kind==='scores').map(x=>x.stage)).toEqual(['halfway','beforeFinale','final']);
 for(const step of steps){s=reduce(s,{type:'showStep',step,sheet,start:true},1000);expect(currentStepId(s)).toBe(step.id);}
 for(const step of [...steps].reverse()){s=reduce(s,{type:'showStep',step,sheet},2000);expect(currentStepId(s)).toBe(step.id);expect(s.timer.end).toBeNull();expect(s.finaleResults?.['night:a'].points).toBe(44);}
});
it('navigates to hidden answers rather than restoring reveals and keeps timer overrides',()=>{
 let s=fresh();const steps=showSequence(s,sheet),title=steps.find(x=>x.kind==='title')!,question=steps.find(x=>x.kind==='question')!;
 s=reduce(s,{type:'showStep',step:title,sheet},1000);s=reduce(s,{type:'duration',seconds:300},1000);s=reduce(s,{type:'extend'},1000);expect(s.timer.duration).toBe(330);
 s=reduce(s,{type:'showStep',step:question,sheet,start:true},2000);expect(s.timer.end).toBe(332000);
 const id=current(s).question.answers[0].id;s=reduce(s,{type:'reveal',id},3000);s=reduce(s,{type:'hide',id},4000);expect(s.progress[current(s).question.id].revealed).toEqual([]);
 s=reduce(s,{type:'reveal',id},5000);s=reduce(s,{type:'showStep',step:title,sheet},6000);s=reduce(s,{type:'showStep',step:question,sheet},7000);expect(s.progress[current(s).question.id].revealed).toEqual([]);expect(s.timer.duration).toBe(330);expect(s.timer.end).toBeNull();
});
it('supports five selected finalists from twenty teams and revisiting a different question',()=>{
 let s=fresh();const many={...sheet,teams:Array.from({length:20},(_,i)=>({id:String(i),name:`Team ${i}`,scores:Array(15).fill(i)}))};
 expect(showSequence(s,many).filter(x=>x.kind==='finaleQuestion')).toHaveLength(3);
 s=reduce(s,{type:'opening',screen:null});s=reduce(s,{type:'finalists',sheetId:many.id,teamIds:['1','2','3','4','5']});const steps=showSequence(s,many);expect(steps.filter(x=>x.kind==='finaleQuestion')).toHaveLength(5);
 const title=steps.find(x=>x.kind==='finaleTitle')!;s=reduce(s,{type:'showStep',step:title,sheet:many});s=reduce(s,{type:'duration',seconds:90});s=reduce(s,{type:'showStep',step:{...title,kind:'finaleQuestion',id:title.id.replace('Title','Question')},sheet:many,start:true},1000);expect(s.timer.duration).toBe(90);expect(s.timer.end).toBe(91000);
 s=reduce(s,{type:'extend'},2000);expect(s.timer.end).toBe(121000);
});
