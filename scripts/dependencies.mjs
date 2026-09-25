import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export function fingerprint(root){const hash=createHash('sha256');for(const file of ['package.json','pnpm-lock.yaml'])if(fs.existsSync(path.join(root,file)))hash.update(fs.readFileSync(path.join(root,file)));return hash.digest('hex');}
export function dependencyStatus(root){const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));const missing=Object.keys({...manifest.dependencies,...manifest.devDependencies}).filter(name=>!fs.existsSync(path.join(root,'node_modules',name,'package.json')));const stamp=path.join(root,'node_modules','.game-dependencies');return {missing,changed:!fs.existsSync(stamp)||fs.readFileSync(stamp,'utf8')!==fingerprint(root)};}
export function markDependencies(root){fs.writeFileSync(path.join(root,'node_modules','.game-dependencies'),fingerprint(root));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));if(process.argv[2]==='mark')markDependencies(root);else{const status=dependencyStatus(root);if(status.missing.length||status.changed){console.log(status.missing.length?'New or missing dependencies: '+status.missing.join(', '):'Checking dependencies for this game update.');process.exitCode=3;}}}
