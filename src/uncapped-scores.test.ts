import {it,expect} from 'vitest';
import {reduce,startSession} from './engine';
import {validateGame} from './model';
import game from './data/original.json';
import {validateResult,withFinale,total} from './score-model';
it('keeps accumulated finale grades beyond one cycle through export, reload and totals',()=>{let s=reduce(startSession(validateGame(game)),{type:'opening',screen:null});for(const points of [48,96,1000]){s=reduce(s,{type:'finalePoints',sheetId:'event',teamId:'team',teamName:'Team',points});expect(s.finaleResults?.['event:team'].points).toBe(points);}const sheet={id:'event',title:'Test',date:'2026-09-25',venue:'Hall',liveFinale:true,questions:['Q1'],teams:[{id:'team',name:'Team',scores:[10]},{id:'other',name:'Other',scores:[0]}]};const result=withFinale(sheet,s);expect(total(result.teams[0])).toBe(1010);expect(validateResult(JSON.parse(JSON.stringify({version:1,result}))).teams[0].bonus).toBe(1000);});
