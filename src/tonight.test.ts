import { expect,it } from 'vitest';
import raw from './data/2026-10-29.json';
import fresh from './data/finale-2026-10-29.json';
import { validateGame,flatten,liveGame } from './model';
it('keeps sixteen supplied boards in four rounds, with four marked bonuses',()=>{
 const g=validateGame(raw);expect(liveGame(g)).toEqual(g);expect(g.rounds.map(r=>r.questions.length)).toEqual([4,4,4,4]);
 const qs=flatten(g).map(x=>x.question);expect(qs.map(q=>q.timer)).toEqual([210,210,210,240,210,210,210,240,210,210,210,240,210,210,210,240]);expect(qs.map(q=>q.answers.length)).toEqual([4,5,4,6,5,5,6,7,5,4,4,7,5,5,5,6]);
 expect(qs.filter(q=>q.bonus).map(q=>q.points)).toEqual([2,2,2,2]);expect(qs[3].answers[3]).toMatchObject({text:'Breathe deeply',count:null});
 expect(qs[7].text).toBe('Name someone husbands complain to about their wives.');expect(validateGame(JSON.parse(JSON.stringify(g)))).toEqual(g);
});
it('adds ten six-answer sourced finals and preserves both shorter spare boards',()=>{
 expect(fresh).toHaveLength(12);expect(fresh.slice(0,10).every(q=>q.answers.length===6&&q.source.startsWith('https://'))).toBe(true);
 expect(fresh.slice(10).map(q=>q.answers.map(a=>a.count))).toEqual([[73,8,6,5,2],[58,25,4,4]]);
 expect(fresh.every(q=>q.points===4&&q.timer===60&&!/Steve Harvey/i.test(q.text))).toBe(true);
});
