import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
if(!fs.existsSync(path.join(root,'index.html'))){console.error('The production build is missing. Run npm install, then npm run build.');process.exit(1);}
http.createServer((req,res)=>{let file;try{const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+requested);if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}}catch{res.writeHead(400).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});}).on('error',err=>{if(err.code==='EADDRINUSE')console.error(`Port ${port} is already in use. Your game may already be running at http://127.0.0.1:${port}/`);else console.error(err.message);process.exit(1);}).listen(port,'127.0.0.1',()=>console.log(`Game Night ready: http://127.0.0.1:${port}/#/presenter`));
