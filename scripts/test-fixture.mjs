import {cp,mkdtemp,mkdir,writeFile,symlink,rm,realpath} from 'node:fs/promises';
import {Buffer} from 'node:buffer';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {fixtureVehicles,fixtureDealership} from '../tests/fixture-data.ts';
import {serveStatic} from './serve-static.mjs';

const directory=await mkdtemp(path.join(os.tmpdir(),'auto-cass-test-'));
process.env.XDG_CACHE_HOME ??= path.resolve('.cache');
await mkdir(process.env.XDG_CACHE_HOME,{recursive:true});
for(const file of ['src','public','astro.config.mjs','tsconfig.json','package.json'])await cp(file,path.join(directory,file),{recursive:true});
await symlink(path.resolve('node_modules'),path.join(directory,'node_modules'),'dir');
const vehicles=structuredClone(fixtureVehicles);
for(const v of vehicles){
 await mkdir(path.join(directory,`public/assets/vehicles/${v.id}`),{recursive:true});
 for(let index=1;index<=2;index++){
  const bytes=await sharp(Buffer.from(`<svg width="900" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="600" fill="${index===1?'#dde1d2':'#c2baa9'}"/><text x="50" y="300" font-size="30">FIXTURE DE TESTE — IMAGEM ${index}</text></svg>`)).webp().toBuffer();
  const file=`assets/vehicles/${v.id}/${index}.webp`;await writeFile(path.join(directory,'public',file),bytes);
  v.photos.push({sourceUrl:`https://example.invalid/${v.id}/${index}.webp`,path:file,width:900,height:600,status:'ready',variants:[],sha256:createHash('sha256').update(bytes).digest('hex')});
 }
}
await writeFile(path.join(directory,'src/data/vehicles.json'),JSON.stringify(vehicles));
await writeFile(path.join(directory,'src/data/dealership.json'),JSON.stringify(fixtureDealership));
const result=spawnSync(process.execPath,[await realpath('node_modules/.bin/astro'),'build','--root',directory],{cwd:directory,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'inherit'});
if(result.status!==0){await rm(directory,{recursive:true,force:true});process.exit(result.status??1);}
const server=serveStatic(path.join(directory,'dist'),4331);
server.once('close',()=>{rm(directory,{recursive:true,force:true}).catch(()=>{});});
