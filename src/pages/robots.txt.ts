import type {APIRoute} from 'astro';
import {dealership} from '../lib/data';
export const GET: APIRoute = () => new Response(dealership.demo ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /Auto-cass-site/\nSitemap: https://theusmkt.github.io/Auto-cass-site/sitemap.xml\n', {headers:{'Content-Type':'text/plain; charset=utf-8'}});
