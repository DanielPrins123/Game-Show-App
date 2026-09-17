import {it,expect} from 'vitest';
import {reduce,startSession} from './engine';
import {validateGame} from './model';
import raw from './data/original.json';
it('undo survives JSON persistence when optional fields were absent',()=>{let s=reduce(startSession(validateGame(raw)),{type:'opening',screen:null});s=reduce(s,{type:'extend'},1000);s=JSON.parse(JSON.stringify(s));s=reduce(s,{type:'undo'},2000);expect(s.extensions??0).toBe(0);expect(s.extensionAt).toBeUndefined();s=reduce(s,{type:'collect'},3000);s=JSON.parse(JSON.stringify(s));s=reduce(s,{type:'undo'},4000);expect(s.collected).not.toBe(true);});
it('opening sequence is host-controlled and holds the question clock',()=>{let s=startSession(validateGame(raw));expect(s.opening).toBe('logo');expect(reduce(s,{type:'toggleTimer'})).toBe(s);s=reduce(s,{type:'opening',screen:'instructions'});expect(s.opening).toBe('instructions');s=reduce(s,{type:'opening',screen:null});s=reduce(s,{type:'toggleTimer'},1000);s=reduce(s,{type:'opening',screen:'logo'},6000);expect(s.timer.end).toBeNull();s=reduce(s,{type:'opening',screen:null},20000);expect(s.timer.end).toBe(35000);});
