import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {validateTriviaDeck} from './types';
it('includes the reconciled October set with all questions and complete bonus answers',()=>{
 const d=validateTriviaDeck(JSON.parse(readFileSync('public/trivia/2026-10-12.json','utf8')));
 expect(d.source).toHaveLength(28);expect(d.cards.filter(c=>c.kind==='round')).toHaveLength(4);expect(d.cards.filter(c=>c.kind==='question')).toHaveLength(20);
 expect(d.cards.find(c=>c.id==='slide-13')?.answers).toEqual(['Eric Bana','Edward Norton','Mark Ruffalo']);
 expect(d.cards.find(c=>c.id==='slide-19')?.prompt).toContain('Braves franchise history, not just');
 expect(d.cards.find(c=>c.id==='slide-25')?.answers).toEqual(['Margaret Hamilton']);
 const final=d.cards.at(-1)!;expect(final.answers).toHaveLength(13);expect(final.answers[7]).toBe("You're Only Human (Second Wind)");expect(final.maxPoints).toBe(30);expect(final.seconds).toBe(360);
 expect(d.cards.filter(c=>c.kind==='question').every(c=>c.answers.length>0)).toBe(true);
});
