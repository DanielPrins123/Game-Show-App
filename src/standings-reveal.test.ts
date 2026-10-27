import {it,expect} from 'vitest';
import {stepStandings} from './standings-reveal';
import {newTriviaSession,reduceTrivia} from './trivia/engine';
import {removeTeamFromStandings} from './trivia/team-removal';
import {validateTriviaDeck} from './trivia/types';
import deckJson from '../public/trivia/2026-10-27.json';
import {reduce,startSession} from './engine';
import {validateGame} from './model';
import original from './data/original.json';
const rows=[30,30,20,10,10].map((total,i)=>({id:String(i),name:`Team ${i}`,total,rank:[1,1,3,4,4][i]}));
const deck=validateTriviaDeck(deckJson);
it('reveals and hides entire tied groups, including top and bottom ties',()=>{
 expect(stepStandings(rows,0,1)).toBe(2);expect(stepStandings(rows,2,1)).toBe(3);expect(stepStandings(rows,3,1)).toBe(5);
 expect(stepStandings(rows,5,-1)).toBe(3);expect(stepStandings(rows,3,-1)).toBe(2);expect(stepStandings(rows,2,-1)).toBe(0);
 expect(stepStandings(rows,0,10)).toBe(5);expect(stepStandings([],0,1)).toBe(0);
});
it('trivia reveals a tied group and undo restores the whole group',()=>{
 let s={...newTriviaSession(deck),phase:'scores' as const,standings:rows,standingsShown:0};
 s=reduceTrivia(s,{type:'revealStanding'},deck) as typeof s;expect(s.standingsShown).toBe(2);
 expect(reduceTrivia(s,{type:'undo'},deck).standingsShown).toBe(0);
});
it('Family Feud reveals and hides tied groups in one action',()=>{
 let s=startSession(validateGame(original));s=reduce(s,{type:'showScores',show:{id:'test',title:'Test',venue:'',date:'',stage:'final',revealed:0,teams:rows}});
 s=reduce(s,{type:'revealScore',delta:1});expect(s.scoreShow?.revealed).toBe(2);
 s=reduce(s,{type:'revealScore',delta:-1});expect(s.scoreShow?.revealed).toBe(0);
});
it('removal cleans current and undo standings without revealing hidden teams',()=>{
 const s={...newTriviaSession(deck),standings:structuredClone(rows),standingsShown:2};
 s.history=[structuredClone(s)];removeTeamFromStandings(s,'4');
 expect(s.standingsShown).toBe(1);expect(s.standings).toHaveLength(4);expect(s.history[0].standingsShown).toBe(1);
 expect(s.standings.map(t=>t.rank)).toEqual([1,1,3,4]);
});
