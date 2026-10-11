import type {Vehicle} from './model.ts';
import {effectiveYear} from './catalog.ts';

// Equipment wording is retained; these changes only repair typography and casing.
export function presentEquipment(raw: string): string {
 let text=raw.replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim().toLocaleLowerCase('pt-BR');
 text=text.replace(/\bcom\s+com\b/g,'com')
  .replace(/ar[- ]c0ndicionado/g,'ar-condicionado')
  .replace(/ar condicionado/g,'ar-condicionado')
  .replace(/fárois/g,'faróis').replace(/atraés/g,'através')
  .replace(/\bair bags\b/g,'airbags')
  .replace(/head-up-display/g,'head-up display');
 const names: Record<string,string>={
  abs:'ABS',acc:'ACC',cvt:'CVT',gps:'GPS',usb:'USB',led:'LED',isofix:'ISOFIX',jbl:'JBL',
  'wi-fi':'Wi-Fi',bose:'Bose',dirac:'Dirac',meridian:'Meridian',sony:'Sony',
  harman:'Harman',kardon:'Kardon','auto hold':'Auto Hold','soft close':'Soft Close',
 };
 for(const [word,name] of Object.entries(names))text=text.replace(new RegExp(`\\b${word}\\b`,'g'),name);
 return text.charAt(0).toLocaleUpperCase('pt-BR')+text.slice(1);
}


export interface VehicleParts {brand: string | null; model: string | null; shortTitle: string; version: string | null; year: number | null;}
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Splits the reviewed title so cards show brand and year once. Nothing is added to the title.
export function vehicleParts(v: Vehicle): VehicleParts {
 let shortTitle = v.title.trim();
 if (v.brand) shortTitle = shortTitle.replace(new RegExp(`^${escape(v.brand)}\\s+`, 'i'), '');
 const year = effectiveYear(v);
 if (year !== null) shortTitle = shortTitle.replace(new RegExp(`\\s+${year}$`), '');
 let version: string | null = null;
 if (v.model && shortTitle.toLocaleLowerCase('pt-BR').startsWith(v.model.toLocaleLowerCase('pt-BR'))) version = shortTitle.slice(v.model.length).trim() || null;
 return {brand: v.brand, model: v.model, shortTitle: shortTitle || v.title, version: v.version ?? version, year};
}

// Editorial pick of three equipment lines per featured vehicle. Strings must exist verbatim in the
// vehicle's own feature list; the build fails otherwise, so nothing can be invented here.
export const featuredHighlights: Record<string, string[]> = {
 'origem-home-01': ['Suspensão pneumática', 'Head-up display', 'Sistema de som premium Bose'],
 'origem-home-02': ['Teto solar panorâmico', 'Bancos dianteiros com massageador', 'Faróis de LED'],
 'origem-home-03': ['Câmeras para visão 360', 'Sistema de som Dirac', 'Teto solar panorâmico'],
};
export function highlightsFor(v: Vehicle): string[] {
 const picks = featuredHighlights[v.id];
 if (!picks) return v.features.slice(0, 3);
 for (const pick of picks) if (!v.features.includes(pick)) throw new Error(`Destaque inexistente em ${v.id}: ${pick}`);
 return picks;
}
