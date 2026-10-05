import {readFile,writeFile,mkdir,copyFile,realpath,access} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {catalogSchema,vehicleSchema,dealershipSchema} from '../src/lib/model.ts';
import {fetchPublic} from './http.mjs';

const args=process.argv.slice(2);
const flag=(name)=>{const index=args.indexOf(name);return index>=0?args[index+1]:null;};
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const timestamp=()=>new Date().toISOString().replace(/[:.]/g,'-');
const requiredFiles=['src/data/vehicles.json','src/data/dealership.json','data/source-manifest.json','data/media-manifest.json'];
const mediaDirectory=flag('--media-dir');

if(args.includes('--apply')){
 const review=flag('--review');if(!review)throw new Error('Use npm run import:apply -- --review .import-review/<data>.');
 const directory=await realpath(review);const allowed=await realpath('.import-review');
 if(!directory.startsWith(allowed+path.sep))throw new Error('A revisão deve estar dentro de .import-review.');
 const stagedVehicles=catalogSchema.parse(JSON.parse(await readFile(path.join(directory,requiredFiles[0]),'utf8')));
 dealershipSchema.parse(JSON.parse(await readFile(path.join(directory,requiredFiles[1]),'utf8')));
 const reviewManifest=JSON.parse(await readFile(path.join(directory,'review.json'),'utf8'));
 for(const [file,expectedHash] of Object.entries(reviewManifest.checksums)){
  if(!requiredFiles.includes(file)&&!/^public\/assets\/vehicles\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/.test(file))throw new Error('Caminho de revisão inválido.');
  if(hash(await readFile(path.join(directory,file)))!==expectedHash)throw new Error(`Revisão alterada: ${file}. Gere uma nova revisão.`);
 }
 const backup=`.cache/import-backups/${timestamp()}`;
 for(const file of requiredFiles){await mkdir(path.dirname(path.join(backup,file)),{recursive:true});await copyFile(file,path.join(backup,file));}
 try {
  for(const vehicle of stagedVehicles)for(const photo of vehicle.photos.filter(p=>p.status==='ready'))for(const file of [photo.path,...photo.variants.map(p=>p.path)]){
   const target=`public/${file}`;await mkdir(path.dirname(target),{recursive:true});
   let exists=false;try{await access(target);exists=true;}catch{}
   if(exists&&hash(await readFile(target))!==hash(await readFile(path.join(directory,target))))throw new Error(`Arquivo existente preservado: ${target}`);
   if(!exists)await copyFile(path.join(directory,target),target);
  }
  for(const file of requiredFiles)await copyFile(path.join(directory,file),file);
  const result=spawnSync(process.execPath,['scripts/validate-data.mjs'],{stdio:'inherit'});
  if(result.status!==0)throw new Error('A validação rejeitou a importação.');
 }catch(error){for(const file of requiredFiles)await copyFile(path.join(backup,file),file);throw error;}
 console.log(`Importação aplicada. Backup dos dados anteriores: ${backup}. Revise git diff antes de publicar.`);
 process.exit(0);
}

const inputFile=args.find(value=>!value.startsWith('-')&&value!==mediaDirectory);
if(!inputFile){console.error('Uso: npm run import:review -- /caminho/exportacao.json [--media-dir /caminho/fotos]\nVeja docs/importacao.md. Nenhum dado foi alterado.');process.exit(1);}
const input=JSON.parse(await readFile(inputFile,'utf8'));
if(!Array.isArray(input.vehicles)||!input.collectedAt||!input.sourceUrl)throw new Error('Exportação exige vehicles, collectedAt e sourceUrl.');
const directory=`.import-review/${timestamp()}`;
await mkdir(directory,{recursive:true});
const vehicles=[],associations=[],sourceRecords=[],issues=[];
let photosDiscovered=0,downloaded=0;
const nullable=['brand','model','version','price','originalPriceText','manufacturingYear','modelYear','mileage','fuel','transmission','color','body','doors','engine','description','publishedAt'];
for(const raw of input.vehicles){
 const photoInput=raw.photos??[];
 const record={...raw,currency:'BRL',collectedAt:raw.collectedAt??input.collectedAt,status:raw.status??'unknown',features:raw.features??[],specifications:raw.specifications??{},issues:[...(raw.issues??[])],photos:[]};
 for(const key of nullable)if(record[key]===undefined||record[key]==='')record[key]=null;
 vehicleSchema.parse(record); // Validate IDs and fields before touching media paths.
 const seenUrls=new Set(),seenHashes=new Set();
 for(const [order,original] of photoInput.entries()){
  if(!original.sourceUrl)throw new Error(`Foto sem URL de procedência em ${record.id}.`);
  if(seenUrls.has(original.sourceUrl))continue;seenUrls.add(original.sourceUrl);photosDiscovered++;
  const photo={sourceUrl:original.sourceUrl,path:null,width:null,height:null,status:'unavailable',variants:[],sha256:null};
  try {
   let bytes;
   if(original.file){
    if(!mediaDirectory)throw new Error('Fotos locais exigem --media-dir.');
    const mediaRoot=await realpath(mediaDirectory);const file=await realpath(path.resolve(mediaRoot,original.file));
    if(!file.startsWith(mediaRoot+path.sep))throw new Error('Foto local fora da pasta autorizada.');
    bytes=await readFile(file);
   }else{
    const response=await fetchPublic(original.sourceUrl);if(!response.ok)throw new Error(response.error);
    if(!response.contentType.startsWith('image/'))throw new Error('A URL não retornou um tipo de imagem.');bytes=response.buffer;
    await new Promise(resolve=>setTimeout(resolve,400));
   }
   const meta=await sharp(bytes,{limitInputPixels:80000000}).metadata();
   if(!['jpeg','png','webp','avif'].includes(meta.format)||!meta.width||!meta.height)throw new Error('Imagem sem formato ou dimensões válidos.');
   const checksum=hash(bytes);
   if(seenHashes.has(checksum)){photosDiscovered--;associations.push({vehicleId:record.id,sourceUrl:original.sourceUrl,order,status:'duplicate',sha256:checksum});continue;}
   seenHashes.add(checksum);downloaded++;
   const prefix=`assets/vehicles/${record.id}/${String(order+1).padStart(3,'0')}-${checksum.slice(0,12)}`;
   photo.path=`${prefix}.${meta.format==='jpeg'?'jpg':meta.format}`;
   const target=path.join(directory,'public',photo.path);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes);
   photo.width=meta.width;photo.height=meta.height;photo.sha256=checksum;photo.status='ready';
   for(const width of [480,960,1600].filter(width=>width<meta.width)){
    const variantPath=`${prefix}-${width}.webp`;
    const output=await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:86}).toBuffer({resolveWithObject:true});
    await writeFile(path.join(directory,'public',variantPath),output.data);photo.variants.push({path:variantPath,width:output.info.width});
   }
  }catch(error){record.issues.push(`Foto ${order+1} indisponível: ${error.message}`);issues.push({vehicleId:record.id,sourceUrl:original.sourceUrl,error:error.message});}
  record.photos.push(photo);associations.push({vehicleId:record.id,sourceUrl:photo.sourceUrl,order,...photo});
 }
 vehicles.push(record);sourceRecords.push({id:record.id,sourceUrl:record.sourceUrl,collectedAt:record.collectedAt});
}
catalogSchema.parse(vehicles);
const currentDealership=JSON.parse(await readFile('src/data/dealership.json','utf8'));
// Import never promotes a proposal to the official commercial site automatically.
const dealership=dealershipSchema.parse({...currentDealership,...input.dealership,demo:true,catalogStatus:vehicles.length?'partial':'awaiting-source'});
const verifiedTotals=Number.isInteger(input.discoveredCount)&&Number.isInteger(input.detailsReadCount);
const complete=input.paginationVerified===true&&verifiedTotals&&input.discoveredCount===vehicles.length&&input.detailsReadCount===vehicles.length&&issues.length===0&&vehicles.every(v=>v.issues.length===0);
if(complete)dealership.catalogStatus='verified';
const source={source:input.sourceUrl,collectedAt:input.collectedAt,complete,status:complete?'reconciled':'partial',pages:input.pages??[],vehicles:sourceRecords,counts:{discovered:input.discoveredCount??null,detailsRead:input.detailsReadCount??null,imported:vehicles.length,uniquePhotosDiscovered:photosDiscovered,downloaded,validPhotos:downloaded},issues};
const stagedData=[vehicles,dealership,source,{collectedAt:input.collectedAt,photos:associations}];
for(let i=0;i<requiredFiles.length;i++){const target=path.join(directory,requiredFiles[i]);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,JSON.stringify(stagedData[i],null,2)+'\n');}
const checksums={};
for(const file of requiredFiles)checksums[file]=hash(await readFile(path.join(directory,file)));
for(const v of vehicles)for(const p of v.photos.filter(p=>p.status==='ready'))for(const file of [p.path,...p.variants.map(p=>p.path)])checksums[`public/${file}`]=hash(await readFile(path.join(directory,'public',file)));
await writeFile(path.join(directory,'review.json'),JSON.stringify({createdAt:new Date().toISOString(),complete,counts:source.counts,issues,checksums},null,2)+'\n');
console.log(`Revisão preparada em ${directory}\n${vehicles.length} anúncios; ${downloaded} fotos válidas; reconciliação completa: ${complete}.\nNenhum catálogo publicado foi substituído. Revise os arquivos e aplique explicitamente com npm run import:apply -- --review ${directory}.`);
