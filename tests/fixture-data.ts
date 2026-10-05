import type {Vehicle} from '../src/lib/model.ts';
export const makeVehicle = (index=1): Vehicle => ({
 id:`fixture-${index}`,slug:`fixture-${index}`,sourceUrl:`https://example.invalid/fixtures/${index}`,collectedAt:'2026-10-05T12:00:00.000Z',
 title:`TESTE AUTOMATIZADO ${index} — Ágil Alfa`,brand:index===2?'Marca Beta':'Marca Ágil',model:index===2?'Modelo Beta':'Modelo Alfa',version:null,
 price:index===3?null:index===2?200000:100000,currency:'BRL',originalPriceText:null,manufacturingYear:null,modelYear:2023,mileage:index===3?null:10000,
 fuel:'Gasolina',transmission:index===2?'Manual':'Automático',color:null,body:null,doors:null,engine:null,description:'Fixture isolada para testes. Não é um anúncio real.',
 features:['Equipamento de teste'],specifications:{},status:'unknown',publishedAt:null,photos:[],issues:[],
});
export const fixtureVehicles = Array.from({length:15},(_,i)=>makeVehicle(i+1));
export const fixtureDealership = {
 name:'Auto Cass — TESTE',sourceUrl:'https://example.invalid/',verifiedAt:'2026-10-05T12:00:00.000Z',demo:true,catalogStatus:'partial',
 tagline:null,about:null,whatsapp:'5511999999999',phone:null,email:null,address:null,hours:[],socials:[],services:[],logo:null,storeImage:null,
 accent:'#b88c64',featuredIds:[],provenance:{contact:'Número fictício somente em build isolado de teste; nenhum envio realizado.'},
};
