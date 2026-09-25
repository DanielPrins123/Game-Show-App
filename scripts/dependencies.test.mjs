import {test} from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {dependencyStatus,markDependencies} from './dependencies.mjs';
test('an old TypeScript install must not mask newly required Node types',()=>{fs.mkdirSync('test-results',{recursive:true});const root=fs.mkdtempSync(path.resolve('test-results/dependency-check-'));fs.mkdirSync(path.join(root,'node_modules/typescript'),{recursive:true});fs.writeFileSync(path.join(root,'node_modules/typescript/package.json'),'{}');fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({devDependencies:{typescript:'1'}}));markDependencies(root);assert.deepEqual(dependencyStatus(root),{changed:false,missing:[]});fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({devDependencies:{typescript:'1','@types/node':'1'}}));assert.deepEqual(dependencyStatus(root),{changed:true,missing:['@types/node']});fs.mkdirSync(path.join(root,'node_modules/@types/node'),{recursive:true});fs.writeFileSync(path.join(root,'node_modules/@types/node/package.json'),'{}');markDependencies(root);assert.deepEqual(dependencyStatus(root),{changed:false,missing:[]});});
