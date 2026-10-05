import type {APIRoute} from 'astro';
import {dealership,visibleVehicles} from '../lib/data';
import {absolute} from '../lib/paths';
export const GET: APIRoute = () => {
 const pages=dealership.demo?[]:['','estoque/','sobre/','contato/',...visibleVehicles.map(v=>`veiculos/${v.slug}/`)];
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${absolute(p)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
