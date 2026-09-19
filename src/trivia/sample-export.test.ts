import {it,expect} from 'vitest';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {importPowerPoint} from './pptx';
it.skipIf(!process.env.PPTX_SAMPLE_PATH)('prepares a legacy saved game for compatibility browser checks',()=>{const deck=importPowerPoint(readFileSync(process.env.PPTX_SAMPLE_PATH!),'09.15.2026 Trivia.pptx');expect(deck.cards.filter(c=>c.kind==='question')).toHaveLength(20);mkdirSync('test-results',{recursive:true});writeFileSync('test-results/trivia-legacy.json',JSON.stringify(deck));});
