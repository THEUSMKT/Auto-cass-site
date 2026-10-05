import type { Vehicle } from './model.ts';

export const filterKeys = ['q', 'brand', 'model', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'transmission', 'fuel', 'body'] as const;
export const pageSize = 12;
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
export const effectiveYear = (v: Vehicle) => v.modelYear ?? v.manufacturingYear;
export function numberParam(p: URLSearchParams, key: string): number | null {
  const value = p.get(key);
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
export function filterCatalog(vehicles: Vehicle[], p: URLSearchParams): Vehicle[] {
  const query = normalize((p.get('q') ?? '').slice(0, 120));
  const minimumPrice = numberParam(p, 'minPrice'), maximumPrice = numberParam(p, 'maxPrice');
  const minimumYear = numberParam(p, 'minYear'), maximumYear = numberParam(p, 'maxYear');
  const result = vehicles.filter(v => {
    if (v.status === 'removed' || v.status === 'unavailable') return false;
    if (query && !normalize([v.title,v.brand,v.model,v.version].filter(Boolean).join(' ')).includes(query)) return false;
    for (const key of ['brand','model','transmission','fuel','body'] as const) {
      if (p.get(key) && normalize(v[key] ?? '') !== normalize(p.get(key)!)) return false;
    }
    if (minimumPrice !== null && (v.price === null || v.price < minimumPrice)) return false;
    if (maximumPrice !== null && (v.price === null || v.price > maximumPrice)) return false;
    const currentYear = effectiveYear(v);
    if (minimumYear !== null && (currentYear === null || currentYear < minimumYear)) return false;
    if (maximumYear !== null && (currentYear === null || currentYear > maximumYear)) return false;
    return true;
  });
  const sorting = p.get('sort') ?? 'default';
  const field = sorting.startsWith('price') ? 'price' : sorting.startsWith('year') ? 'year' : null;
  if (field) result.sort((a,b) => {
    const av = field === 'price' ? a.price : effectiveYear(a), bv = field === 'price' ? b.price : effectiveYear(b);
    if (av === null) return bv === null ? a.id.localeCompare(b.id) : 1;
    if (bv === null) return -1;
    return (av - bv) * (sorting.endsWith('desc') ? -1 : 1) || a.id.localeCompare(b.id);
  });
  return result;
}
export function safeInventoryReturn(value: string | null, base: string): string | null {
  if (!value || !value.startsWith(`${base}estoque/`) || value.includes('\\')) return null;
  try {
    const url = new URL(value, 'https://local.invalid');
    return url.origin === 'https://local.invalid' && url.pathname === `${base}estoque/` ? `${url.pathname}${url.search}` : null;
  } catch { return null; }
}
export function whatsappUrl(phone: string | null, title?: string, url?: string): string | null {
  if (!phone || !/^55\d{10,11}$/.test(phone)) return null;
  const message = title && url ? `Olá! Tenho interesse no ${title}. Gostaria de saber mais: ${url}` : 'Olá! Gostaria de falar com a equipe da Auto Cass.';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
export const money = (price: number | null) => price === null ? 'Consulte o valor' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(price);
export const kilometers = (mileage: number | null) => mileage === null ? null : `${new Intl.NumberFormat('pt-BR').format(mileage)} km`;
