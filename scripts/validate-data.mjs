import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {catalogSchema,dealershipSchema} from '../src/lib/model.ts';

const vehicles=catalogSchema.parse(JSON.parse(await readFile('src/data/vehicles.json','utf8')));
const dealership=dealershipSchema.parse(JSON.parse(await readFile('src/data/dealership.json','utf8')));
const source=JSON.parse(await readFile('data/source-manifest.json','utf8'));
const media=JSON.parse(await readFile('data/media-manifest.json','utf8'));
let validPhotos=0;
for(const v of vehicles){
 if(!source.vehicles.some(record=>record.id===v.id&&record.sourceUrl===v.sourceUrl&&record.collectedAt===v.collectedAt))throw new Error(`Anúncio sem procedência no manifesto: ${v.id}`);
}
for(const v of vehicles)for(const p of v.photos){
 if(p.status!=='ready')continue;
 const bytes=await readFile(`public/${p.path}`);const metadata=await sharp(bytes).metadata();
 if(!metadata.width||!metadata.height)throw new Error(`Imagem inválida: ${p.path}`);
 if(createHash('sha256').update(bytes).digest('hex')!==p.sha256)throw new Error(`Checksum divergente: ${p.path}`);
 if(metadata.width!==p.width||metadata.height!==p.height)throw new Error(`Dimensões divergentes: ${p.path}`);
 const association=media.photos.find(m=>m.vehicleId===v.id&&m.path===p.path&&m.sourceUrl===p.sourceUrl);
 if(!association)throw new Error(`Foto sem rastreabilidade: ${p.path}`);
 for(const variant of p.variants){const derived=await sharp(await readFile(`public/${variant.path}`)).metadata();if(derived.width!==variant.width)throw new Error(`Derivado inválido: ${variant.path}`);}
 validPhotos++;
}
for(const id of dealership.featuredIds)if(!vehicles.some(v=>v.id===id))throw new Error(`Destaque inexistente: ${id}`);
for(const field of ['logo','storeImage'])if(dealership[field])await access(`public/${dealership[field]}`);
if(vehicles.length!==source.counts.imported)throw new Error('Total importado diverge do manifesto.');
if(validPhotos!==source.counts.validPhotos)throw new Error('Total de fotos válidas diverge do manifesto.');
if(!dealership.demo){
 if(!source.complete||!source.collectedAt||!dealership.verifiedAt||dealership.catalogStatus!=='verified')throw new Error('Publicação comercial exige estoque reconciliado e contatos verificados. Mantenha demo=true.');
 if(source.counts.discovered!==vehicles.length||source.counts.detailsRead!==vehicles.length||source.counts.uniquePhotosDiscovered!==validPhotos||source.counts.downloaded!==validPhotos)throw new Error('Reconciliação incompleta; mantenha modo de demonstração.');
 if(vehicles.some(v=>v.issues.length>0||v.photos.some(p=>p.status!=='ready')))throw new Error('Há divergências pendentes; mantenha modo de demonstração.');
}
console.log(`Dados válidos: ${vehicles.length} anúncios importados, ${validPhotos} fotos verificadas. Modo: ${dealership.demo?'demonstração':'comercial'}.`);
