import {it,expect} from 'vitest';
import {validateTriviaDeck} from './types';
import raw from '../../public/trivia/2026-10-27.json';
it('preserves October 27 questions, scoring, Facebook annotation and Gehry correction',()=>{
 const d=validateTriviaDeck(raw),qs=d.cards.filter(c=>c.kind==='question');
 expect(d.source).toHaveLength(28);expect(d.cards).toHaveLength(24);expect(qs).toHaveLength(20);
 expect(qs.flatMap(q=>q.answers)).toHaveLength(42);
 expect(qs.filter(q=>q.maxPoints!==null).map(q=>q.maxPoints)).toEqual([10,10,10,30]);
 for(const q of qs){const source=q.sourceSlides.flatMap(n=>d.source.find(s=>s.number===n)!.paragraphs).join('\n').replace('Frank Geary','Frank Gehry');expect(source).toContain(q.prompt);for(const a of q.answers)expect(source.replace(/\n- FACEBOOK/,' - FACEBOOK')).toContain(a);}
 expect(qs.find(q=>q.round==='Round 2'&&q.title==='Question 3')?.prompt).toContain('Frank Gehry');
 expect(qs.at(-1)?.answers).toHaveLength(15);expect(qs.at(-1)?.answers).toContain('Jaws - FACEBOOK');
});
