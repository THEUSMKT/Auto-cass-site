import type {Vehicle} from '../lib/model';
import {filterCatalog, filterKeys, normalize, pageSize, reconcileBrandModel} from '../lib/catalog';
import {base, path} from '../lib/paths';
import {track} from './global';

const root = document.querySelector<HTMLElement>('[data-inventory]');
if (root) {
 const vehicles: Vehicle[] = JSON.parse(document.querySelector('#catalog-data')?.textContent ?? '[]');
 const cards = new Map([...root.querySelectorAll<HTMLElement>('[data-vehicle-id]')].map(card => [card.dataset.vehicleId!,card]));
 const grid = root.querySelector<HTMLElement>('[data-vehicle-grid]')!;
 const form = root.querySelector<HTMLFormElement>('[data-filter-form]')!;
 const searchForm = root.querySelector<HTMLFormElement>('[data-search-form]')!;
 const search = searchForm.querySelector<HTMLInputElement>('input')!;
 const sort = root.querySelector<HTMLSelectElement>('[data-sort]')!;
 const panel = root.querySelector<HTMLDialogElement>('[data-filter-dialog]')!;
 const open = root.querySelector<HTMLButtonElement>('[data-filter-open]')!;
 const media = window.matchMedia('(max-width: 900px)');
 const labels: Record<string,string> = {q:'Busca',brand:'Marca',model:'Modelo',minPrice:'Preço mínimo',maxPrice:'Preço máximo',minYear:'Ano mínimo',maxYear:'Ano máximo',transmission:'Câmbio',fuel:'Combustível',body:'Carroceria'};
 const syncPanel = () => {if (media.matches) panel.removeAttribute('open'); else {if(panel.open) panel.close(); panel.setAttribute('open','');}};
 syncPanel(); media.addEventListener('change',syncPanel);
 open.addEventListener('click',()=> {if (media.matches) panel.showModal();});
 root.querySelector('[data-filter-close]')?.addEventListener('click',()=>panel.close());
 panel.addEventListener('click', e=>{if(e.target===panel && media.matches) panel.close();});
 panel.addEventListener('close',()=>{if(media.matches)open.focus();});
 let p = new URLSearchParams(location.search);
 const updateModels = (selectedBrand: string) => {
  const select = form.elements.namedItem('model') as HTMLSelectElement | null;
  if (!select) return;
  const current = select.value;
  const models = [...new Set(vehicles.filter(v=>!selectedBrand || normalize(v.brand??'')===normalize(selectedBrand)).map(v=>v.model).filter(v=>v!==null))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  select.replaceChildren(new Option('Todos',''),...models.map(model=>new Option(model,model)));
  select.value = models.includes(current) ? current : '';
 };
 function render() {
  const reconciled=reconcileBrandModel(vehicles,p);
  if(reconciled.toString()!==p.toString()){
   p=reconciled;history.replaceState({},'',`${location.pathname}${p.size?`?${p}`:''}`);
  }
  search.value = p.get('q') ?? '';
  sort.value = p.get('sort') ?? 'default';
  for (const key of filterKeys.filter(k=>k!=='q')) {
   const input = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | null;
   if(input) input.value = p.get(key) ?? '';
  }
  updateModels(p.get('brand')??'');
  const model = form.elements.namedItem('model') as HTMLSelectElement | null;
  if(model)model.value=p.get('model')??'';
  const result = filterCatalog(vehicles,p);
  const pages = Math.max(1,Math.ceil(result.length/pageSize));
  const page = Math.min(pages,Math.max(1,Math.floor(Number(p.get('page'))||1)));
  const selected = new Set(result.slice((page-1)*pageSize,page*pageSize).map(v=>v.id));
  for(const [id,card] of cards)card.hidden = !selected.has(id);
  for(const v of result) {const card=cards.get(v.id); if(card)grid.append(card);}
  grid.hidden=result.length===0;
  root!.querySelector<HTMLElement>('[data-source-empty]')!.hidden=vehicles.length>0;
  root!.querySelector<HTMLElement>('[data-filter-empty]')!.hidden=vehicles.length===0 || result.length>0;
  const count=root!.querySelector<HTMLElement>('[data-result-count]')!;
  if(vehicles.length)count.textContent=`${result.length} ${result.length===1?'veículo encontrado':'veículos encontrados'}`;
  const chips=root!.querySelector<HTMLElement>('[data-filter-chips]')!;
  chips.replaceChildren();
  for(const key of filterKeys)if(p.get(key)) {
   const chip=document.createElement('button');chip.type='button';chip.className='filter-chip';
   chip.textContent=`${labels[key]}: ${p.get(key)} ×`;chip.setAttribute('aria-label',`Remover filtro ${labels[key]}`);
   chip.addEventListener('click',()=>{p.delete(key);if(key==='brand')p.delete('model');p.delete('page');commit();});chips.append(chip);
  }
  const active=filterKeys.filter(k=>p.get(k)).length;
  root!.querySelector<HTMLElement>('[data-filter-count]')!.textContent=active?String(active):'';
  const pagination=root!.querySelector<HTMLElement>('[data-pagination]')!; pagination.replaceChildren();
  if(pages>1)for(let n=1;n<=pages;n++){
   const link=document.createElement('a');const params=new URLSearchParams(p);params.set('page',String(n));
   link.href=`${path('estoque/')}?${params}`;link.textContent=String(n);link.setAttribute('aria-label',`Página ${n}`);
   if(n===page)link.setAttribute('aria-current','page');
   link.addEventListener('click',e=>{e.preventDefault();p.set('page',String(n));commit();root!.scrollIntoView({behavior:'instant'});});pagination.append(link);
  }
  root!.querySelectorAll<HTMLAnchorElement>('[data-vehicle-link]').forEach(link=>{
   const url=new URL(link.href);url.searchParams.set('retorno',`${base}estoque/${p.size?`?${p}`:''}`);link.href=url.href;
  });
 }
 function commit() {history.pushState({},'',`${location.pathname}${p.size?`?${p}`:''}`);render();track('filter_inventory',{filters:filterKeys.filter(k=>p.get(k)).length});}
 searchForm.addEventListener('submit',e=>{e.preventDefault();const q=search.value.trim();q?p.set('q',q):p.delete('q');p.delete('page');commit();});
 form.addEventListener('submit',e=>{e.preventDefault();for(const key of filterKeys.filter(k=>k!=='q')){
  const value=new FormData(form).get(key)?.toString().trim();value?p.set(key,value):p.delete(key);
 }p.delete('page');commit();if(media.matches)panel.close();});
 form.querySelector('[name="brand"]')?.addEventListener('change',e=>updateModels((e.target as HTMLSelectElement).value));
 sort.addEventListener('change',()=>{p.set('sort',sort.value);p.delete('page');commit();});
 root.querySelectorAll('[data-clear-filters]').forEach(button=>button.addEventListener('click',()=>{p=new URLSearchParams();commit();if(media.matches&&panel.open)panel.close();}));
 window.addEventListener('popstate',()=>{p=new URLSearchParams(location.search);render();});
 window.addEventListener('pageshow',()=>{try{const saved=JSON.parse(sessionStorage.getItem('autocass:inventory-scroll')??'null');if(saved?.url===location.pathname+location.search)window.scrollTo(0,saved.y);}catch{}});
 root.querySelectorAll('[data-vehicle-link]').forEach(link=>link.addEventListener('click',()=>{try{sessionStorage.setItem('autocass:inventory-scroll',JSON.stringify({url:location.pathname+location.search,y:scrollY}));}catch{}}));
 render();track('view_inventory');
}
