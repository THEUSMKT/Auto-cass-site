import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {fetchPublic} from './http.mjs';

const root='https://www.autocass.com.br/';
const allowedHosts=new Set(['www.autocass.com.br','autocass.com.br']);
const refresh=process.argv.includes('--refresh');
const pages=[],queue=[root],seen=new Set(),candidates=[],media=new Set(),sitemaps=new Set();
const startedAt=new Date().toISOString();
const limit=500;
await mkdir('.cache/source',{recursive:true});await mkdir('docs',{recursive:true});await mkdir('data',{recursive:true});
async function get(url) {
 const cache=`.cache/source/${createHash('sha256').update(url).digest('hex')}.json`;
 if(!refresh)try{const cached=JSON.parse(await readFile(cache,'utf8'));return {...cached,buffer:Buffer.from(cached.body,'base64'),cached:true};}catch{}
 const r=await fetchPublic(url);
 if(r.ok)await writeFile(cache,JSON.stringify({...r,buffer:undefined,body:r.buffer.toString('base64'),observedAt:new Date().toISOString()}));
 await new Promise(resolve=>setTimeout(resolve,400));
 return r;
}
function publicLink(raw,from) {
 try {const url=new URL(raw,from);if(url.protocol!=='https:'||!allowedHosts.has(url.hostname)||url.username||url.password)return null;
 url.hash='';for(const key of [...url.searchParams.keys()])if(/^(utm_|fbclid|gclid)/.test(key))url.searchParams.delete(key);
 if(/\.(?:pdf|jpg|jpeg|png|webp|avif|gif|svg|zip|mp4)$/i.test(url.pathname))return null;
 return url.href;
 }catch{return null;}
}
const home=await get(root);
const blocked=!home.ok;
let disallow=[];
if(home.ok){
 const robots=await get(new URL('/robots.txt',home.url).href);
 if(robots.ok){
  let applicable=false;
  for(const line of robots.buffer.toString('utf8').split('\n')){
   const [directive,...parts]=line.split(':');const value=parts.join(':').split('#')[0].trim();
   if(directive?.toLowerCase().trim()==='user-agent')applicable=value==='*';
   if(applicable&&directive.toLowerCase().trim()==='disallow'&&value)disallow.push(value);
   if(directive?.toLowerCase().trim()==='sitemap'){const url=publicLink(value,home.url);if(url)sitemaps.add(url);}
  }
 }
}
let sitemapComplete=true;
for(const sitemap of sitemaps){
 const response=await get(sitemap);pages.push({url:sitemap,status:response.status,ok:response.ok,observedAt:new Date().toISOString(),error:response.error});
 if(!response.ok){sitemapComplete=false;continue;}
 const xml=load(response.buffer.toString('utf8'),{xmlMode:true});
 xml('loc').each((_,el)=>{const url=publicLink(xml(el).text(),sitemap);if(!url)return;if(/sitemap.*\.xml$/i.test(url))sitemaps.add(url);else queue.push(url);});
 if(sitemaps.size>50){sitemapComplete=false;break;}
}
while(queue.length&&pages.length<limit){
 const url=queue.shift();if(seen.has(url))continue;seen.add(url);
 const pathname=new URL(url).pathname;
 if(url!==root&&disallow.some(rule=>pathname.startsWith(rule.split('*')[0]))){pages.push({url,status:null,ok:false,error:'Não coletado: Disallow em robots.txt'});continue;}
 const response=url===root?home:await get(url);
 const record={url,effectiveUrl:response.url,status:response.status,ok:response.ok,observedAt:new Date().toISOString(),error:response.error,cached:!!response.cached};pages.push(record);
 if(!response.ok){console.log(`${response.status??'ERR'} ${url}: ${response.error}`);continue;}
 const $=load(response.buffer.toString('utf8'));record.title=$('title').text().trim();record.canonical=$('link[rel="canonical"]').attr('href')??null;
 $('a[href]').each((_,el)=>{const href=$(el).attr('href');const link=publicLink(href,response.url);if(link&&!seen.has(link)&&!queue.includes(link))queue.push(link);});
 const jsonld=[];$('script[type="application/ld+json"]').each((_,el)=>{try{jsonld.push(JSON.parse($(el).text()));}catch{}});
 const contacts=$('a[href]').map((_,el)=>$(el).attr('href')).get().filter(href=>/^(tel:|mailto:|https:\/\/(?:wa\.me|api\.whatsapp\.com|www\.instagram\.com|www\.facebook\.com))/.test(href));
 const images=$('img').map((_,el)=>{const raw=$(el).attr('src')??$(el).attr('data-src');try{const url=new URL(raw,response.url);if(url.protocol==='https:'){media.add(url.href);return {url:url.href,alt:$(el).attr('alt')??''};}}catch{}return null;}).get().filter(Boolean);
 candidates.push({url:response.url,title:record.title,canonical:record.canonical,jsonld,contacts,images});
 console.log(`200 ${url}`);
}
const complete=!blocked&&queue.length===0&&sitemapComplete&&pages.every(p=>p.ok);
const report={source:root,startedAt,finishedAt:new Date().toISOString(),complete,paginationVerified:false,discoveredPages:seen.size,pages,candidates,distinctImageUrls:[...media],limitations:complete?['Revisão humana necessária para identificar anúncios e confirmar paginação/carregamento incremental.']:['Coleta incompleta: páginas inacessíveis ou limite atingido.']};
await writeFile('data/source-audit.json',JSON.stringify(report,null,2)+'\n');
const localTime=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'long',timeZone:'America/Sao_Paulo'}).format(new Date(startedAt));
await writeFile('docs/auditoria-origem.md',`# Auditoria da origem\n\nObservação: ${localTime} (America/Sao_Paulo).\nFonte: ${root}\n\n## Resultado observado\n\n${blocked?'O proxy do ambiente bloqueou a conexão antes de alcançar a origem. Isso não comprova indisponibilidade do site para os visitantes. Nenhuma avaliação visual, contato, anúncio ou fotografia pôde ser confirmada.':'As páginas acessíveis e os candidatos de conteúdo estão registrados em data/source-audit.json. A descoberta automatizada não comprova que paginação e carregamento incremental foram percorridos; revise antes de importar.'}\n\n## Páginas\n\n${pages.map(p=>`- ${p.url}: ${p.status??'sem resposta da origem'} — ${p.error??'acessível'}`).join('\n')}\n\n## Identidade e análise\n\nNome Auto Cass informado pelo solicitante. Assinatura tipográfica, grafite, branco quente e bronze são propostas de redesign, não identidade oficial verificada. História, endereço, horários, redes sociais, serviços, contatos e estoque permanecem desconhecidos até revisão da fonte. Não foram enviadas mensagens nem formulários à loja.\n\nNenhum problema visual, métrica Lighthouse, taxa de conversão ou quantidade total de veículos foi inferido. O acesso anterior com falha de certificado descrito no briefing não foi reproduzido porque esta tentativa foi bloqueada antes do TLS da origem.\n\n## Dependências\n\n${blocked?'Liberar www.autocass.com.br e autocass.com.br no acesso à internet do ambiente; depois executar npm run audit:source -- --refresh. Se a origem mantiver uma falha real de TLS, aguardar sua correção ou receber exportação do estoque e fotos. Não desativar validação TLS.':'Revisar conteúdo, inventário e fontes das imagens antes de aplicar a importação.'}\n`);
console.log(`Auditoria salva. Coleta completa: ${complete}. Paginação verificada: false.`);
if(blocked)process.exitCode=1;
