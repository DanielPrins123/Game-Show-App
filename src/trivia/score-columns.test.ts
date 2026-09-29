import{it,expect}from'vitest';
import{readFileSync}from'node:fs';
import{validateTriviaDeck}from'./types';
import{scoreColumns,columnTotal}from'./score-columns';
it('shows all 20 inputs, four round sums, halftime, pre-final and final totals',()=>{
 const d=validateTriviaDeck(JSON.parse(readFileSync('public/trivia/2026-09-29.json','utf8'))),columns=scoreColumns(d),questions=d.cards.filter(c=>c.kind==='question');
 expect(columns.filter(c=>c.question)).toHaveLength(20);expect(columns[3].label).toBe('R1Q4');expect(columns.filter(c=>c.kind==='round')).toHaveLength(4);
 const team={id:'a',name:'Test',scores:Object.fromEntries(questions.map((q,i)=>[q.id,i+1]))};
 expect(columns.filter(c=>c.kind==='round').map(c=>columnTotal(team,c))).toEqual([15,40,65,90]);
 expect(columnTotal(team,columns.find(c=>c.kind==='halfway')!)).toBe(55);expect(columnTotal(team,columns.find(c=>c.kind==='beforeFinal')!)).toBe(190);expect(columnTotal(team,columns.at(-1)!)).toBe(210);
 team.scores[questions[0].id]=1000;expect(columnTotal(team,columns.at(-1)!)).toBe(1209);
});
