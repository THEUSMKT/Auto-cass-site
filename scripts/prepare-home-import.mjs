import {readFile, writeFile, mkdir, realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import sharp from 'sharp';

// Adapter for the user-supplied saved home. It reads HTML as data; no scripts run.
const packagePath = process.argv[2];
if (!packagePath) throw new Error('Use node scripts/prepare-home-import.mjs /caminho/Auto-Cass-Importacao');
const root = await realpath(packagePath);
const readJson = async name => JSON.parse(await readFile(path.join(root, 'data', name), 'utf8'));
const source = await readJson('vehicles-source.json');
const contacts = await readJson('dealership-source.json');
const report = await readJson('import-report.json');
const html = await readFile(path.join(root, 'sources/Home.html'), 'utf8');
const $ = load(html);
const clean = text => text.replace(/\s+/g, ' ').trim();
const now = new Date().toISOString();
if (source.length !== report.entries || $('.caption-title').length !== source.length) throw new Error('Total de entradas diverge do HTML/pacote.');
const modelNames = ['CAYENNE', 'MACAN', 'X2', 'X1', 'TIGUAN', 'YUAN PLUS', 'SONG PLUS', 'HILUX SW4', 'HILUX', 'VELAR', 'TIGGO 5X', 'TIGGO 7', 'TIGGO 8', 'RANGER', 'MAVERICK', 'COMMANDER', 'TORO', 'COROLLA CROSS', 'HR-V', 'S10', 'KICKS', 'TRACKER', 'EQUINOX', 'T-CROSS', 'COMPASS', 'POLO', 'RENEGADE', 'SPORTAGE', 'CITY', 'CIVIC', 'IX35', 'CAPTUR', 'CRUZE', 'PRISMA', 'ECOSPORT', 'SAVEIRO', 'KWID'];
const vehicleEvidence = [];
const vehicles = [];
for (const raw of source) {
 const titleElement = $('#' + raw.sourceElementId);
 if (titleElement.length !== 1 || clean(titleElement.text()) !== clean(raw.titleRaw)) throw new Error('Título divergente: ' + raw.id);
 const caption = titleElement.parent();
 if (clean(caption.find('.caption-button .text').text()) !== clean(raw.priceRaw)) throw new Error('Preço divergente: ' + raw.id);
 const descriptionElement = caption.find('.caption-text');
 const descriptionCopy = descriptionElement.clone();
 descriptionCopy.find('p,br').after(' ');
 if (clean(descriptionCopy.text()) !== clean(raw.descriptionRaw)) throw new Error('Descrição divergente: ' + raw.id);
 const photoUrl = titleElement.closest('.photoGalleryThumbs').find('[data-image-url]').attr('data-image-url');
 if (photoUrl !== raw.photoOriginalUrls[0]) throw new Error('Associação da foto divergente: ' + raw.id);
 if (raw.photoDownloadStatus !== 'ok' || raw.localPhotos.length !== 1) throw new Error('Foto local indisponível: ' + raw.id);
 const photoPath = await realpath(path.resolve(root, raw.localPhotos[0]));
 if (!photoPath.startsWith(root + path.sep)) throw new Error('Foto fora do pacote.');
 const bytes = await readFile(photoPath);
 const meta = await sharp(bytes).metadata();
 if (meta.width !== raw.photoDimensions[0] || meta.height !== raw.photoDimensions[1]) throw new Error('Dimensões divergentes: ' + raw.id);
 const title = clean(raw.titleRaw
  .replace(/PARA MAIORES INFORMAÇÕES,.*$/i, '')
  .replace(/R\$\s*[\d.,]+/g, '')
  .replace(/\b0\s*KM\b/gi, '')
  .replace(/À PRONTA ENTREGA|EMPLACADA/gi, '')
  .replace(/\|/g, ' '));
 const withoutYear = clean(title.replace(/\b(?:19|20)\d{2}\b/g, ''));
 const model = modelNames.find(name => withoutYear.includes(name)) ?? null;
 // Brands are filled only where named in the source title, not inferred from a model/photo.
 const brandMatch = title.match(/^(PORSCHE|BMW|BYD|JEEP|CHEVROLET)\b/);
 const brand = brandMatch ? ({PORSCHE:'Porsche', BMW:'BMW', BYD:'BYD', JEEP:'Jeep', CHEVROLET:'Chevrolet'})[brandMatch[1]] : null;
 const descriptionParts = descriptionElement.find('p').toArray().map(el => $(el).text());
 const features = [...new Set((descriptionParts.length ? descriptionParts : [raw.descriptionRaw]).flatMap(text => text.split('|')).map(clean).filter(Boolean))];
 const equipment = clean(raw.descriptionRaw);
 const transmission = /\bMANUAL\b/i.test(title) || /C[ÂA]MBIO MANUAL/i.test(equipment) ? 'Manual'
  : /\bAUT\b|AUTOM[ÁA]TICO/i.test(title) || /C[ÂA]MBIO (?:AUT\b|AUTOM[ÁA]TICO)/i.test(equipment) ? 'Automático' : null;
 const fuel = /EL[ÉE]TRICO/.test(title) ? 'Elétrico' : /H[ÍI]BRID[OA]|\bPHEV\b/.test(title) ? 'Híbrido'
  : /\bDIESEL\b/.test(title) ? 'Diesel' : /\bFLEX\b/.test(title) ? 'Flex' : /\bGASOLINA\b/.test(title) ? 'Gasolina' : null;
 const conflict = raw.migrationWarnings.some(w => w.startsWith('Preço no título difere'));
 const issues = raw.migrationWarnings.map(w => w.startsWith('Preço no título difere')
  ? 'O anúncio apresenta valores divergentes. Confirme o preço com a equipe.' : w);
 vehicles.push({
  id:raw.id, slug:title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + raw.id.slice(-2),
  sourceUrl:raw.sourceUrl, collectedAt:now, title, brand, model, version:null,
  price:conflict ? null : raw.priceBRL, originalPriceText:raw.priceRaw,
  manufacturingYear:raw.manufactureYear, modelYear:null, yearInTitle:raw.yearInTitle,
  mileage:raw.mileageKm, fuel, transmission, color:null, body:null, doors:null, engine:null,
  description:null, features, specifications:{}, status:'unknown', publishedAt:null, issues,
  photos:[{sourceUrl:photoUrl, file:raw.localPhotos[0]}],
 });
 vehicleEvidence.push({id:raw.id, sourceElementId:raw.sourceElementId, sourceOrder:raw.sourceOrder, sha256:createHash('sha256').update(bytes).digest('hex'), sourceFile:raw.localPhotos[0]});
}
// Reconcile contacts against actual links/text, preserving the documented limits.
for (const text of [contacts.phoneDisplay, contacts.email, 'Av. Rubem Berta 1565', 'Sapucaia do Sul', '93218-350']) {
 if (!clean($.text()).includes(text)) throw new Error('Contato não encontrado no HTML: ' + text);
}
for (const url of [contacts.facebook, contacts.instagram, ...contacts.youtubeUrls]) {
 if (!$('a[href]').toArray().some(el => $(el).attr('href') === url)) throw new Error('Canal não encontrado no HTML: ' + url);
}
const whatsapp = new URL(contacts.whatsappUrlNormalized).pathname.slice(1);
if (!$('a[href]').toArray().some(el => {
 const href = $(el).attr('href');
 if (!href?.startsWith('https://api.whatsapp.com/')) return false;
 return new URL(href).searchParams.get('phone')?.replace(/\D/g, '') === whatsapp;
})) throw new Error('WhatsApp não encontrado no HTML.');
const dealership = {
 name:contacts.name, sourceUrl:'https://www.autocass.com.br/', verifiedAt:now,
 demo:true, catalogStatus:'partial', whatsapp, phone:contacts.phoneDisplay, email:contacts.email,
 address:contacts.addressRaw, hours:[],
 socials:[{label:'Instagram',url:contacts.instagram},{label:'Facebook',url:contacts.facebook},{label:'YouTube',url:contacts.youtubeUrls[0]}],
 logo:'assets/brand/autocass-logo.png', storeImage:null, featuredIds:[],
 provenance:{
  name:'HTML e imagens fornecidos pelo usuário em Auto-Cass-Pacote-para-Codex.zip.',
  contact:contacts.whatsappEvidence,
  verifiedAt:'Data da conferência documental nesta importação; não comprova confirmação externa ou envio de mensagem.',
  sourceSavedDate:'2026-10-05; hora do salvamento não informada.',
  logo:'PNG referenciada no HTML, inspecionada visualmente. A JPG principal também é uma imagem da marca, não uma foto da loja.',
  classification:'Modelo extraído dos tokens do título. Marca só preenchida quando explícita no título; câmbio e combustível apenas quando escritos. Carroceria e demais campos ausentes permanecem nulos.',
 },
};
await mkdir('.cache', {recursive:true});
await writeFile('.cache/home-export.json', JSON.stringify({sourceUrl:dealership.sourceUrl, collectedAt:now, discoveredCount:source.length, detailsReadCount:0, paginationVerified:false, pages:[{url:dealership.sourceUrl,evidence:'HTML fornecido pelo usuário',savedDate:'2026-10-05'}], vehicles, dealership},null,2)+'\n');
// Archive content evidence without old executable integrations or credentials.
const archive = load(html);
archive('script').remove();
archive('*').each((_i,el)=>{for(const attribute of Object.keys(el.attribs ?? {}))if(/^on/i.test(attribute))archive(el).removeAttr(attribute);});
const sanitizedHtml = archive.html().replace(/\b(?:sk|pk)\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]+\b/g, '[REDACTED_CREDENTIAL]');
await writeFile('data/imports/home-2026-10-05/sources/Home.html', sanitizedHtml);
await writeFile('data/imports/home-2026-10-05/associations.json', JSON.stringify({importedAt:now, sourceSavedDate:'2026-10-05', sourceHtmlOriginalSha256:createHash('sha256').update(html).digest('hex'), sourceHtmlSha256:createHash('sha256').update(sanitizedHtml).digest('hex'), archivedHtmlSanitized:true, vehicles:vehicleEvidence},null,2)+'\n');
console.log(`Conferidos ${vehicles.length} títulos, descrições, preços e associações de fotos no HTML. Exportação: .cache/home-export.json. Estoque completo e galerias completas não confirmados.`);
