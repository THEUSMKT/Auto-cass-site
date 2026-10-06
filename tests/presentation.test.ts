import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogSchema} from '../src/lib/model.ts';
import {filterCatalog} from '../src/lib/catalog.ts';
import {presentEquipment} from '../src/lib/presentation.ts';

const vehicles=catalogSchema.parse(JSON.parse(readFileSync('src/data/vehicles.json','utf8')));
const editorial=JSON.parse(readFileSync('data/editorial/vehicle-presentation.json','utf8'));
test('todos os 46 anúncios têm a marca revisada; busca encontra fabricantes antes ausentes',()=>{
 const expected={'BMW':2,'BYD':2,'CAOA Chery':5,'Chevrolet':5,'Fiat':2,'Ford':3,'Honda':4,'Hyundai':1,'Jeep':7,'Kia':1,'Land Rover':1,'Nissan':1,'Porsche':2,'Renault':2,'Toyota':3,'Volkswagen':5};
 assert.equal(vehicles.length,46);
 for(const [brand,count] of Object.entries(expected)){
  assert.equal(filterCatalog(vehicles,new URLSearchParams({brand})).length,count,brand);
  assert.equal(filterCatalog(vehicles,new URLSearchParams({q:brand})).length,count,brand);
 }
 for(const vehicle of vehicles){
  const row=editorial.find((row:{id:string})=>row.id===vehicle.id);
  assert.equal(vehicle.brand,row.brand);assert.equal(vehicle.model,row.model);assert.equal(vehicle.title,row.title);
  assert.notEqual(vehicle.title,vehicle.title.toLocaleUpperCase('pt-BR'));
 }
 for(const [id,model] of [['18','Toro'],['23','S10'],['30','Compass']])assert.equal(vehicles.find(v=>v.id===`origem-home-${id}`)!.model,model);
});
test('apresentação corrige duplicação, preserva siglas e não completa reticências',()=>{
 assert.equal(presentEquipment('BANCO DO MOTORISTA COM COM AQUECIMENTO'),'Banco do motorista com aquecimento');
 assert.equal(presentEquipment('FREIOS ABS | ACC | CÂMBIO CVT | GPS | USB | FARÓIS LED'),'Freios ABS | ACC | câmbio CVT | GPS | USB | faróis LED');
 assert.equal(presentEquipment('SISTEMA DE SOM PREMIUM BOSE'),'Sistema de som premium Bose');
 assert.equal(presentEquipment('AR C0NDICIONADO'),'Ar-condicionado');
 assert.equal(presentEquipment('SENSORES DE ESTACIONAMENTO...'),'Sensores de estacionamento...');
 assert.match(vehicles[0].title,/Porsche Cayenne S Coupé 3\.0 V6 Híbrido 2026/);
 assert.match(vehicles[4].title,/BMW X2 xDrive 20i M Sport 2\.0T 2024/);
 assert.match(vehicles[14].title,/1\.5T PHEV/);assert.match(vehicles[23].title,/CVT/);
});
