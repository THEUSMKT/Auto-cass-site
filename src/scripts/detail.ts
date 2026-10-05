import {safeInventoryReturn} from '../lib/catalog';
import {base} from '../lib/paths';
import {track} from './global';

const returnPath = safeInventoryReturn(new URLSearchParams(location.search).get('retorno'),base);
if(returnPath)document.querySelectorAll<HTMLAnchorElement>('[data-inventory-return]').forEach(link=>link.href=returnPath);
const gallery = document.querySelector<HTMLElement>('[data-gallery]');
if(gallery){
 const thumbs=[...gallery.querySelectorAll<HTMLButtonElement>('[data-photo-index]')];
 const main=gallery.querySelector<HTMLImageElement>('[data-gallery-main]');
 const expanded=gallery.querySelector<HTMLImageElement>('[data-lightbox-image]');
 const dialog=gallery.querySelector<HTMLDialogElement>('[data-gallery-dialog]');
 let index=0;
 function select(n:number){
  if(!thumbs.length)return;index=(n+thumbs.length)%thumbs.length;
  const thumb=thumbs[index];const count=`${index+1} / ${thumbs.length}`;
  for(const image of [main,expanded])if(image){image.src=thumb.dataset.photoSrc!;image.width=Number(thumb.dataset.photoWidth);image.height=Number(thumb.dataset.photoHeight);image.alt=`${dialog?.getAttribute('aria-label')?.replace(/^Fotos de /,'')} — foto ${index+1} de ${thumbs.length}`;}
  gallery!.querySelectorAll('[data-gallery-count],[data-lightbox-count]').forEach(el=>el.textContent=count);
  thumbs.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===index)));
 }
 thumbs.forEach((t,i)=>t.addEventListener('click',()=>select(i)));
 const opener=gallery.querySelector<HTMLButtonElement>('[data-gallery-open]');
 opener?.addEventListener('click',()=>dialog?.showModal());
 gallery.querySelector('[data-gallery-close]')?.addEventListener('click',()=>dialog?.close());
 dialog?.addEventListener('close',()=>opener?.focus());
 dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 gallery.querySelector('[data-gallery-previous]')?.addEventListener('click',()=>select(index-1));
 gallery.querySelector('[data-gallery-next]')?.addEventListener('click',()=>select(index+1));
 dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();select(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();select(index-1);}});
 const stage=gallery.querySelector<HTMLElement>('[data-swipe]');let touchX:number|null=null;
 stage?.addEventListener('touchstart',e=>{touchX=e.touches[0]?.clientX??null;},{passive:true});
 stage?.addEventListener('touchend',e=>{if(touchX!==null){const difference=(e.changedTouches[0]?.clientX??touchX)-touchX;if(Math.abs(difference)>50)select(index+(difference<0?1:-1));touchX=null;}},{passive:true});
}
document.querySelector<HTMLButtonElement>('[data-share]')?.addEventListener('click',async event=>{
 const button=event.currentTarget as HTMLButtonElement;const url=new URL(location.href);url.search='';url.hash='';
 const status=document.querySelector('[data-share-status]');
 try{if(navigator.share)await navigator.share({title:button.dataset.title,url:url.href});else {await navigator.clipboard.writeText(url.href);if(status)status.textContent='Link copiado.';}track('share_vehicle');}
 catch(e){if(e instanceof Error && e.name!=='AbortError' && status)status.textContent='Não foi possível compartilhar. Copie o endereço da página.';}
});
const detail=document.querySelector<HTMLElement>('[data-detail]');if(detail)track('view_vehicle',{vehicle_id:detail.dataset.vehicleId!});
