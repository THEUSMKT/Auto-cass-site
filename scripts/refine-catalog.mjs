import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {catalogSchema} from '../src/lib/model.ts';
import {presentEquipment} from '../src/lib/presentation.ts';

const file='src/data/vehicles.json';
const before=JSON.parse(await readFile(file,'utf8'));
const editorial=JSON.parse(await readFile('data/editorial/vehicle-presentation.json','utf8'));
const source=JSON.parse(await readFile('data/imports/home-2026-10-05/vehicles-source.json','utf8'));
assert.equal(before.length,46);assert.equal(editorial.length,46);
assert.equal(new Set(editorial.map(v=>v.id)).size,46);
const after=before.map(vehicle=>{
 const row=editorial.find(row=>row.id===vehicle.id);
 const raw=source.find(raw=>raw.id===vehicle.id);
 assert.equal(row.titleRaw,raw.titleRaw,`Procedência divergente: ${vehicle.id}`);
 const updated={...vehicle,brand:row.brand,model:row.model,title:row.title,features:[...new Set(vehicle.features.map(presentEquipment))]};
 // Slugs, prices, versions, years, mileage, specs and every media association remain unchanged.
 for(const key of Object.keys(vehicle).filter(key=>!['brand','model','title','features'].includes(key)))assert.deepEqual(updated[key],vehicle[key],`${key} alterado: ${vehicle.id}`);
 return updated;
});
catalogSchema.parse(after);
await writeFile(file,JSON.stringify(after,null,2)+'\n');
const dealerFile='src/data/dealership.json';
const dealer=JSON.parse(await readFile(dealerFile,'utf8'));
dealer.provenance.classification='Marcas e modelos revisados conforme mapeamento autorizado pelo usuário; todas as 46 entradas classificadas. Câmbio e combustível continuam limitados aos termos da origem; demais campos ausentes permanecem nulos.';
dealer.provenance.presentation='Títulos revisados individualmente em data/editorial/vehicle-presentation.json; textos literais preservados em data/imports/home-2026-10-05. Equipamentos com caixa, espaços e erros de digitação evidentes corrigidos; trechos truncados não completados.';
await writeFile(dealerFile,JSON.stringify(dealer,null,2)+'\n');
console.log(`Refinados ${after.length} anúncios; ${new Set(after.map(v=>v.brand)).size} marcas; preços, versões, dados técnicos, URLs e fotografias preservados.`);
