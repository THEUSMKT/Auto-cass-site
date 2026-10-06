import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {catalogSchema,dealershipSchema} from '../src/lib/model.ts';

test('migração preserva as 46 entradas, fotos originais, campos ausentes e conflito de preço',()=>{
 const origin=JSON.parse(readFileSync('data/imports/home-2026-10-05/vehicles-source.json','utf8'));
 const associations=JSON.parse(readFileSync('data/imports/home-2026-10-05/associations.json','utf8'));
 const catalog=catalogSchema.parse(JSON.parse(readFileSync('src/data/vehicles.json','utf8')));
 const dealer=dealershipSchema.parse(JSON.parse(readFileSync('src/data/dealership.json','utf8')));
 const html=readFileSync('data/imports/home-2026-10-05/sources/Home.html','utf8');
 assert.equal(load(html)('script').length,0);
 assert.equal(associations.archivedHtmlSanitized,true);
 assert.equal(createHash('sha256').update(html).digest('hex'),associations.sourceHtmlSha256);
 assert.equal(catalog.length,46);assert.deepEqual(catalog.map(v=>v.id),origin.map((v:{id:string})=>v.id));
 for(const v of catalog){
  const raw=origin.find((item:{id:string})=>item.id===v.id);
  assert.equal(v.yearInTitle,raw.yearInTitle);assert.equal(v.modelYear,null);assert.equal(v.manufacturingYear,null);
  assert.equal(v.mileage,raw.mileageKm);assert.equal(v.color,null);assert.equal(v.body,null);assert.equal(v.doors,null);assert.equal(v.engine,null);
  assert.equal(v.status,'unknown');assert.equal(v.photos.length,1);assert.equal(v.photos[0].status,'ready');
  assert.equal(v.photos[0].sourceUrl,raw.photoOriginalUrls[0]);
  const evidence=associations.vehicles.find((item:{id:string})=>item.id===v.id);
  assert.equal(createHash('sha256').update(readFileSync(`public/${v.photos[0].path}`)).digest('hex'),evidence.sha256);
  assert.equal(v.price,v.id==='origem-home-03'?null:raw.priceBRL);
  assert.equal(v.originalPriceText,raw.priceRaw);assert.doesNotMatch(v.title,/LINK DA BIO|R\$/);
 }
 assert.ok(catalog.find(v=>v.id==='origem-home-20'));assert.ok(catalog.find(v=>v.id==='origem-home-21'));
 const byd=origin.find((v:{id:string})=>v.id==='origem-home-03');assert.match(byd.titleRaw,/264\.800/);assert.equal(byd.priceBRL,254800);
 assert.equal(dealer.whatsapp,'555134741338');assert.equal(dealer.demo,true);assert.equal(dealer.catalogStatus,'partial');assert.deepEqual(dealer.hours,[]);
});
