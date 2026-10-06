import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterCatalog,whatsappUrl,safeInventoryReturn,kilometers,money,effectiveYear,reconcileBrandModel} from '../src/lib/catalog.ts';
import {catalogSchema,dealershipSchema} from '../src/lib/model.ts';
import {makeVehicle} from './fixture-data.ts';

test('busca ignora caixa/acentos e combina filtros sem incluir valores ausentes',()=>{
 const vehicles=[makeVehicle(1),makeVehicle(2),makeVehicle(3)];
 assert.deepEqual(filterCatalog(vehicles,new URLSearchParams('q=agil&brand=Marca+%C3%81gil&transmission=Automatico&maxPrice=150000')).map(v=>v.id),['fixture-1']);
 assert.equal(filterCatalog(vehicles,new URLSearchParams('minPrice=0')).some(v=>v.price===null),false);
 assert.equal(filterCatalog(vehicles,new URLSearchParams('minYear=2024')).length,0);
 assert.equal(filterCatalog(vehicles,new URLSearchParams('q=inexistente')).length,0);
});
test('troca de marca e URL incompatível limpam apenas o modelo dependente',()=>{
 const vehicles=[{...makeVehicle(1),brand:'Volkswagen',model:'Tiguan'},{...makeVehicle(2),brand:'Toyota',model:'Hilux'}];
 const valid=reconcileBrandModel(vehicles,new URLSearchParams('brand=volkswagen&model=tiguan&q=tsi&maxPrice=400000'));
 assert.equal(valid.get('brand'),'Volkswagen');assert.equal(valid.get('model'),'Tiguan');
 const changed=reconcileBrandModel(vehicles,new URLSearchParams('brand=Toyota&model=Tiguan&q=diesel&maxPrice=300000&page=4'));
 assert.equal(changed.get('brand'),'Toyota');assert.equal(changed.has('model'),false);assert.equal(changed.has('page'),false);
 assert.equal(changed.get('q'),'diesel');assert.equal(changed.get('maxPrice'),'300000');
 assert.deepEqual(filterCatalog(vehicles,changed).map(v=>v.id),[]);
});
test('preços ausentes ficam no fim em ambas as direções; removidos não aparecem',()=>{
 const vehicles=[makeVehicle(1),makeVehicle(2),makeVehicle(3),{...makeVehicle(4),status:'removed' as const}];
 assert.deepEqual(filterCatalog(vehicles,new URLSearchParams('sort=price-desc')).map(v=>v.id),['fixture-2','fixture-1','fixture-3']);
 assert.deepEqual(filterCatalog(vehicles,new URLSearchParams('sort=price-asc')).map(v=>v.id),['fixture-1','fixture-2','fixture-3']);
 assert.equal(kilometers(null),null);assert.equal(money(null),'Consulte o valor');
});
test('retorno ao estoque rejeita destinos externos e mantém query válida',()=>{
 const base='/Auto-cass-site/';
 assert.equal(safeInventoryReturn('/Auto-cass-site/estoque/?q=alfa',base),'/Auto-cass-site/estoque/?q=alfa');
 for(const unsafe of ['https://evil.invalid','//evil.invalid','/Auto-cass-site/estoque/../../elsewhere','/Auto-cass-site/estoque/\\evil.invalid'])assert.equal(safeInventoryReturn(unsafe,base),null);
});
test('WhatsApp só existe com número configurado e codifica veículo e URL',()=>{
 assert.equal(whatsappUrl(null),null);assert.equal(whatsappUrl('123'),null);
 const link=new URL(whatsappUrl('5511999999999','Teste & Ágil','https://example.invalid/veiculo/')!);
 assert.equal(link.hostname,'wa.me');assert.equal(link.pathname,'/5511999999999');
 assert.equal(link.searchParams.get('text'),'Olá! Tenho interesse no Teste & Ágil. Gostaria de saber mais: https://example.invalid/veiculo/');
});
test('validação rejeita duplicatas, imagens trocadas e contatos sem verificação',()=>{
 assert.throws(()=>catalogSchema.parse([makeVehicle(),makeVehicle()]));
 const vehicle=makeVehicle();vehicle.photos=[{sourceUrl:'https://example.invalid/photo.jpg',path:'assets/vehicles/outro/foto.jpg',width:600,height:400,status:'ready',variants:[],sha256:'a'.repeat(64)}];
 assert.throws(()=>catalogSchema.parse([vehicle]));
 assert.throws(()=>dealershipSchema.parse({name:'Auto Cass',sourceUrl:'https://example.invalid',verifiedAt:null,demo:true,catalogStatus:'partial',whatsapp:'5511999999999'}));
});
test('entradas distintas podem vir da mesma home e ano no título não vira ano-modelo',()=>{
 const first={...makeVehicle(1),sourceUrl:'https://example.invalid/',modelYear:null,manufacturingYear:null,yearInTitle:2027};
 const second={...makeVehicle(2),sourceUrl:first.sourceUrl};
 assert.equal(catalogSchema.parse([first,second]).length,2);
 assert.equal(effectiveYear(first),2027);
 assert.equal(first.modelYear,null);assert.equal(first.manufacturingYear,null);
 assert.deepEqual(filterCatalog([first,second],new URLSearchParams('minYear=2027')).map(v=>v.id),[first.id]);
});
