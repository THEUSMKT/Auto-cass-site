// Generates AVIF siblings for every ready photo: one per existing WebP variant width
// plus one at the original width. Never upscales and never touches originals or WebP files.
import {readFile,access} from 'node:fs/promises';
import sharp from 'sharp';
import {catalogSchema} from '../src/lib/model.ts';

const vehicles=catalogSchema.parse(JSON.parse(await readFile('src/data/vehicles.json','utf8')));
const exists=file=>access(file).then(()=>true,()=>false);
let created=0,kept=0;
for(const v of vehicles)for(const p of v.photos){
 if(p.status!=='ready'||!p.path||!p.width)continue;
 const stem=p.path.replace(/\.[a-z0-9]+$/i,'');
 const widths=[...new Set([...p.variants.map(x=>x.width),p.width])].filter(w=>w<=p.width);
 for(const width of widths){
  const target=`public/${stem}-${width}.avif`;
  if(await exists(target)){kept++;continue;}
  await sharp(`public/${p.path}`).resize({width,withoutEnlargement:true}).avif({quality:52,effort:6}).toFile(target);
  created++;
 }
}
console.log(`AVIF: ${created} criados, ${kept} mantidos.`);
