import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {newTriviaSession,reduceTrivia} from './engine';
import {validateTriviaDeck} from './types';
const deck=validateTriviaDeck(JSON.parse(readFileSync('public/trivia/2026-10-12.json','utf8')));
it('previous navigates slides instead of undoing reveals or timer edits',()=>{let s=newTriviaSession(deck);s=reduceTrivia(s,{type:'jump',index:1},deck);s=reduceTrivia(s,{type:'duration',seconds:300},deck);s=reduceTrivia(s,{type:'next'},deck,1000);s=reduceTrivia(s,{type:'reveal'},deck,2000);s=reduceTrivia(s,{type:'extend'},deck,3000);s=reduceTrivia(s,{type:'previous'},deck,4000);expect(s.phase).toBe('card');expect(s.index).toBe(1);expect(s.revealed).toBe(0);expect(s.durations?.[deck.cards[1].id]).toBe(300);s=reduceTrivia(s,{type:'previous'},deck);expect(s.index).toBe(0);});
it('back and forward traverse checkpoint slides without restoring answers',()=>{let s=newTriviaSession(deck);const targets=[];for(let n=0;n<80;n++){targets.push({index:s.index,phase:s.phase,checkpoint:s.checkpoint});if(s.phase==='scores'&&s.checkpoint==='final')break;s=reduceTrivia(s,{type:'next'},deck,1000+n);}
for(let i=targets.length-2;i>=0;i--){s=reduceTrivia(s,{type:'previous'},deck,5000);expect({index:s.index,phase:s.phase,checkpoint:s.checkpoint}).toEqual(targets[i]);expect(s.revealed).toBe(0);expect(s.end).toBeNull();}});
it('undo still reverses a reveal independently of navigation',()=>{let s=newTriviaSession(deck);s=reduceTrivia(s,{type:'jump',index:1},deck);s=reduceTrivia(s,{type:'next'},deck);s=reduceTrivia(s,{type:'reveal'},deck);s=reduceTrivia(s,{type:'undo'},deck);expect(s.index).toBe(1);expect(s.phase).toBe('question');expect(s.revealed).toBe(0);});
