import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain','.xml':'application/xml'};
export function serveStatic(directory,port){
 const root=path.resolve(directory),base='/Auto-cass-site/';
 const server=http.createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(!pathname.startsWith(base)){res.writeHead(404);res.end('Not found');return;}
   let file=path.resolve(root,pathname.slice(base.length));
   if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(400);res.end('Invalid path');return;}
   if((await stat(file)).isDirectory())file=path.join(file,'index.html');
   const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});try{res.end(await readFile(path.join(root,'404.html')));}catch{res.end('Not found');}}
 });
 server.listen(port,'127.0.0.1',()=>console.log(`Static verification server listening on port ${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>process.exit(0)));
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))serveStatic('dist',Number(process.argv[process.argv.indexOf('--port')+1])||4330);
