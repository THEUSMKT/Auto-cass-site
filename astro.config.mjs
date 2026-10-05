import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://theusmkt.github.io',
  base: '/Auto-cass-site/',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  server: { host: '127.0.0.1', port: 4321 },
  vite: { build: { assetsInlineLimit: 0 } },
});
