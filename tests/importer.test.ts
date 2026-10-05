import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {makeVehicle} from './fixture-data.ts';

test('importação revisa antes de aplicar, valida mídia, deduplica e preserva dados anteriores',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'autocass-import-test-'));
 const script=path.resolve('scripts/import-catalog.mjs');
 const files=['src/data/vehicles.json','src/data/dealership.json','data/source-manifest.json','data/media-manifest.json'];
 try{
  for(const file of files){await mkdir(path.dirname(path.join(root,file)),{recursive:true});await copyFile(file,path.join(root,file));}
  // Validation imports use the application modules; the fixture never changes checkout data.
  await mkdir(path.join(root,'scripts'),{recursive:true});
  await writeFile(path.join(root,'scripts/validate-data.mjs'),`import ${JSON.stringify(path.resolve('scripts/validate-data.mjs'))};`);
  await mkdir(path.join(root,'photos'));
  await writeFile(path.join(root,'photos/valid.webp'),await sharp({create:{width:100,height:80,channels:3,background:'#d0d0d0'}}).webp().toBuffer());
  await writeFile(path.join(root,'photos/invalid.jpg'),'<html>Error</html>');
  const vehicle={...makeVehicle(),photos:[
   {sourceUrl:'https://example.invalid/photo.webp',file:'valid.webp'},
   {sourceUrl:'https://example.invalid/photo-large.webp',file:'valid.webp'},
   {sourceUrl:'https://example.invalid/broken.jpg',file:'invalid.jpg'},
  ]};
  vehicle.price=null;vehicle.mileage=null;
  const input=path.join(root,'export.json');await writeFile(input,JSON.stringify({sourceUrl:'https://example.invalid',collectedAt:'2026-10-05T12:00:00.000Z',discoveredCount:1,detailsReadCount:1,paginationVerified:true,vehicles:[vehicle]}));
  const original=await readFile(path.join(root,files[0]),'utf8');
  const review=spawnSync(process.execPath,[script,input,'--media-dir',path.join(root,'photos')],{cwd:root,encoding:'utf8'});
  assert.equal(review.status,0,review.stderr);
  assert.equal(await readFile(path.join(root,files[0]),'utf8'),original);
  const folder=(await readdir(path.join(root,'.import-review')))[0];const stage=path.join(root,'.import-review',folder);
  const report=JSON.parse(await readFile(path.join(stage,'review.json'),'utf8'));
  assert.equal(report.complete,false);assert.equal(report.counts.validPhotos,1);assert.equal(report.counts.uniquePhotosDiscovered,2);
  const imported=JSON.parse(await readFile(path.join(stage,files[0]),'utf8'));
  assert.equal(imported[0].price,null);assert.equal(imported[0].mileage,null);assert.equal(imported[0].photos.length,2);
  assert.equal(imported[0].photos[1].status,'unavailable');
  const apply=spawnSync(process.execPath,[script,'--apply','--review',stage],{cwd:root,encoding:'utf8'});
  assert.equal(apply.status,0,apply.stderr);assert.equal(JSON.parse(await readFile(path.join(root,files[0]),'utf8')).length,1);
  assert.ok((await readdir(path.join(root,'.cache/import-backups'))).length===1);
  const applied=await readFile(path.join(root,files[0]),'utf8');
  imported[0].title='TAMPERED';await writeFile(path.join(stage,files[0]),JSON.stringify(imported));
  const tampered=spawnSync(process.execPath,[script,'--apply','--review',stage],{cwd:root,encoding:'utf8'});
  assert.notEqual(tampered.status,0);assert.match(tampered.stderr,/Revisão alterada/);assert.equal(await readFile(path.join(root,files[0]),'utf8'),applied);
 }finally{await rm(root,{recursive:true,force:true});}
});
