import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import {load} from 'cheerio';
import {catalogSchema,dealershipSchema} from '../../src/lib/model';
const vehicles=catalogSchema.parse(JSON.parse(await fs.readFile(new URL('../../src/data/vehicles.json',import.meta.url),'utf8')));
const dealership=dealershipSchema.parse(JSON.parse(await fs.readFile(new URL('../../src/data/dealership.json',import.meta.url),'utf8')));

const prefix='/Auto-cass-site/';
const fixture='http://127.0.0.1:4331';
for(const width of [360,390,768,1280,1440])test(`páginas reais sem overflow, dados fictícios ou erros — ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const [route,name] of [['','inicio'],['estoque/','estoque'],['sobre/','sobre'],['contato/','contato']]){
  const response=await page.goto(`${prefix}${route}`);expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toBeVisible();await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const whatsappLinks=await page.locator('a[href*="wa.me"]').evaluateAll(links=>links.map(link=>(link as HTMLAnchorElement).href));
  if(dealership.whatsapp){
   expect(whatsappLinks.length).toBeGreaterThan(0);
   for(const href of whatsappLinks){const url=new URL(href);expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe(`/${dealership.whatsapp}`);}
  }else expect(whatsappLinks).toHaveLength(0);
  expect(await page.locator('body').innerText()).not.toContain('TESTE AUTOMATIZADO');
  for(const image of await page.locator('img:visible').all()){
   await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(()=>window.scrollTo(0,0));
  await fs.mkdir('docs/screenshots',{recursive:true});
  await page.screenshot({path:`docs/screenshots/${name}-${width}.png`,fullPage:true});
 }
 expect(errors).toEqual([]);
});
test('todos os anúncios reais têm URL direta, foto associada e WhatsApp contextual',async({request})=>{
 test.setTimeout(90000);
 expect(vehicles).toHaveLength(46);
 for(const vehicle of vehicles){
  const route=`${prefix}veiculos/${vehicle.slug}/`;
  const response=await request.get(route);expect(response.status()).toBe(200);
  const $=load(await response.text());expect($('h1').text()).toBe(vehicle.title);
  expect($('meta[name="robots"]').attr('content')).toBe('noindex, nofollow');
  expect($('[data-gallery-main]').attr('src')).toBe(`${prefix}${vehicle.photos[0].path}`);
  expect((await request.get(`${prefix}${vehicle.photos[0].path}`)).status()).toBe(200);
  const url=new URL($('[data-position="vehicle-summary"]').attr('href')!);
  expect(url.pathname).toBe(`/${dealership.whatsapp}`);
  expect(url.searchParams.get('text')).toContain(vehicle.title);
  expect(url.searchParams.get('text')).toContain(`https://theusmkt.github.io${route}`);
  expect($('dt').map((_i,el)=>$(el).text()).get()).not.toContain('Ano-modelo');
 }
});
test('catálogo real mantém entradas semelhantes, filtros por ano e paginação',async({page})=>{
 await page.goto(`${prefix}estoque/`);await expect(page.locator('[data-result-count]')).toHaveText('46 veículos encontrados');
 await expect(page.locator('[data-vehicle-id]:visible')).toHaveCount(12);
 await page.getByRole('link',{name:'Página 4',exact:true}).click();await expect(page.locator('[data-vehicle-id]:visible')).toHaveCount(10);
 await page.getByRole('searchbox').fill('TIGGO 5X');await page.getByRole('button',{name:'Buscar veículos',exact:true}).click();
 await expect(page.locator('[data-vehicle-id="origem-home-20"]')).toBeVisible();await expect(page.locator('[data-vehicle-id="origem-home-21"]')).toBeVisible();
 await page.goto(`${prefix}estoque/?minYear=2027&maxYear=2027`);await expect(page.locator('[data-result-count]')).toHaveText('2 veículos encontrados');
 await page.goto(`${prefix}estoque/?sort=price-desc&page=4`);await expect(page.locator('[data-vehicle-id]:visible').last()).toHaveAttribute('data-vehicle-id','origem-home-03');
});
test('BYD real mantém preço em consulta, ano documental e uma foto sem galeria fictícia',async({page})=>{
 const byd=vehicles.find(v=>v.id==='origem-home-03')!;
 for(const width of [360,390,768,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto(`${prefix}veiculos/${byd.slug}/`);await page.reload();
  await expect(page.locator('.detail-price')).toHaveText('Consulte o valor');
  const body=await page.locator('body').innerText();expect(body).not.toMatch(/254\.800|264\.800|LINK DA BIO|Ano-modelo/);
  await expect(page.locator('.detail-key-specs')).toContainText('Ano no anúncio');
  await expect(page.locator('.gallery-thumbnails')).not.toBeVisible();
  await page.locator('[data-gallery-open]').click();await expect(page.locator('[data-lightbox-count]')).toHaveText('1 / 1');
  await expect(page.locator('[data-gallery-next]')).not.toBeVisible();
  await page.keyboard.press('ArrowRight');await expect(page.locator('[data-lightbox-count]')).toHaveText('1 / 1');
  await page.keyboard.press('Escape');await expect(page.locator('[data-gallery-open]')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const image of await page.locator('img:visible').all()){
   await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`docs/screenshots/byd-real-${width}.png`,fullPage:true});
 }
});
test('menu móvel fecha por Escape e devolve foco',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(prefix);
 const opener=page.getByRole('button',{name:'Abrir menu'});await opener.click();
 await expect(page.locator('[data-menu]')).toBeVisible();await page.keyboard.press('Escape');
 await expect(page.locator('[data-menu]')).not.toBeVisible();await expect(opener).toBeFocused();
});
test('filtros combinados, modelo dependente, chips, limpeza e URL persistem',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto(`${fixture}${prefix}estoque/`);
 await page.getByRole('searchbox').fill('agil');await page.getByRole('button',{name:'Buscar veículos',exact:true}).click();
 await page.getByRole('combobox',{name:'Marca',exact:true}).selectOption('Marca Ágil');
 await expect(page.getByRole('combobox',{name:'Modelo',exact:true}).locator('option')).toHaveCount(2);
 await page.getByLabel('Até (R$)').fill('150000');await page.getByRole('button',{name:'Aplicar filtros'}).click();
 await expect(page.locator('[data-result-count]')).toHaveText('13 veículos encontrados');
 await expect(page).toHaveURL(/q=agil/);await expect(page).toHaveURL(/maxPrice=150000/);
 await page.getByRole('link',{name:'Página 2',exact:true}).click();await expect(page.locator('[data-vehicle-id]:visible')).toHaveCount(1);
 const link=page.locator('[data-vehicle-link]:visible').first();await link.click();
 await expect(page).toHaveURL(/retorno=/);await page.getByRole('link',{name:'Voltar ao estoque',exact:true}).click();
 await expect(page).toHaveURL(/page=2/);await expect(page.getByRole('searchbox')).toHaveValue('agil');
 await page.getByRole('button',{name:'Remover filtro Preço máximo'}).click();
 await expect(page.locator('[data-result-count]')).toHaveText('14 veículos encontrados');
 await page.getByRole('button',{name:'Limpar filtros',exact:true}).first().click();await expect(page.locator('[data-result-count]')).toHaveText('15 veículos encontrados');
 await page.getByRole('searchbox').fill('inexistente');await page.getByRole('button',{name:'Buscar veículos',exact:true}).click();
 await expect(page.locator('[data-filter-empty]')).toBeVisible();await page.locator('[data-filter-empty]').getByRole('button',{name:'Limpar filtros'}).click();
 await expect(page.locator('[data-result-count]')).toHaveText('15 veículos encontrados');
});
test('filtros móveis só aplicam ao confirmar e ordenam valores ausentes no fim',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(`${fixture}${prefix}estoque/`);
 await page.getByRole('button',{name:'Filtros',exact:true}).click();await page.getByRole('combobox',{name:'Marca',exact:true}).selectOption('Marca Beta');
 await expect(page.locator('[data-result-count]')).toHaveText('15 veículos encontrados');
 await page.getByRole('button',{name:'Aplicar filtros'}).click();await expect(page.locator('[data-result-count]')).toHaveText('1 veículo encontrado');
 await expect(page.locator('[data-filter-dialog]')).not.toBeVisible();
 await page.goto(`${fixture}${prefix}estoque/?sort=price-desc&page=2`);
 await expect(page.locator('[data-vehicle-id]:visible').last()).toHaveAttribute('data-vehicle-id','fixture-3');
});
test('detalhe direto, galeria por teclado/toque, foco, imagem correta e WhatsApp',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(`${fixture}${prefix}veiculos/fixture-1/`);
 await page.reload();await expect(page.locator('h1')).toContainText('TESTE AUTOMATIZADO 1');
 const opener=page.getByRole('button',{name:'Ampliar fotos de TESTE AUTOMATIZADO 1 — Ágil Alfa'});await opener.click();
 const dialog=page.locator('[data-gallery-dialog]');await expect(dialog).toBeVisible();await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-lightbox-count]')).toHaveText('2 / 2');
 await expect(page.locator('[data-lightbox-image]')).toHaveAttribute('src',/fixture-1\/2.webp$/);
 await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-lightbox-count]')).toHaveText('1 / 2');
 await page.locator('[data-swipe]').evaluate(element=>{
  element.dispatchEvent(new TouchEvent('touchstart',{touches:[new Touch({identifier:1,target:element,clientX:300,clientY:100})]}));
  element.dispatchEvent(new TouchEvent('touchend',{changedTouches:[new Touch({identifier:1,target:element,clientX:100,clientY:100})]}));
 });await expect(page.locator('[data-lightbox-count]')).toHaveText('2 / 2');
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(opener).toBeFocused();
 const whatsapp=await page.locator('[data-position="vehicle-summary"]').getAttribute('href');const url=new URL(whatsapp!);
 expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe('/5511999999999');
 expect(url.searchParams.get('text')).toContain('TESTE AUTOMATIZADO 1 — Ágil Alfa');
 expect(url.searchParams.get('text')).toContain('https://theusmkt.github.io/Auto-cass-site/veiculos/fixture-1/');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'docs/screenshots/fixture-galeria-390.png',fullPage:true});
});
test('detalhe e fotos de teste funcionam nas cinco larguras',async({page})=>{
 for(const width of [360,390,768,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto(`${fixture}${prefix}veiculos/fixture-1/`);
  for(const image of await page.locator('img:visible').all()){
   await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`docs/screenshots/fixture-detalhe-${width}.png`,fullPage:true});
 }
});
test('compartilhar usa URL do anúncio sem parâmetros de retorno',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto(`${fixture}${prefix}veiculos/fixture-1/?retorno=%2FAuto-cass-site%2Festoque%2F%3Fq%3Dalfa`);
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:undefined,configurable:true}));
 await page.getByRole('button',{name:'Compartilhar',exact:true}).click();
 const clipboard=await page.evaluate(()=>navigator.clipboard.readText());expect(clipboard).toBe(`${fixture}${prefix}veiculos/fixture-1/`);
});
test('acessibilidade automatizada nas páginas principais e componentes interativos',async({page})=>{
 for(const [origin,route,width] of [['', '',390],['','estoque/',1280],['','contato/',390],[fixture,'veiculos/fixture-1/',390],[fixture,'estoque/',1280]] as const){
  await page.setViewportSize({width,height:900});await page.goto(`${origin}${prefix}${route}`);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 }
});
