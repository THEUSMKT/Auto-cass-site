# Auto Cass

Site estático em **Astro + TypeScript**, preparado para GitHub Pages em `/Auto-cass-site/`. A proposta visual utiliza grafite, branco quente, bronze e o logo recuperado da origem.

**Estado da entrega:** 46 anúncios e 46 fotografias locais importados do pacote do usuário e conferidos contra a home salva em 05/10/2026. Cada anúncio possui página própria, equipamentos e WhatsApp contextual. Todos estão classificados entre 16 marcas, com nomes revisados e filtros de marca/modelo compatíveis; veja [o relatório do refinamento](docs/refinamento.md). Telefone, e-mail, endereço, redes e logo vieram do HTML; nenhuma mensagem foi enviada para testar o destinatário. O BYD Yuan Plus mostra **“Consulte o valor”** por divergência de preços. O site continua como demonstração com `noindex`: os 46 anúncios não comprovam o estoque atual integral, e uma foto por anúncio não comprova galerias completas. Campos ausentes permanecem ausentes.

## Desenvolvimento

Node 24 (mínimo 22.12) e npm. Use o checkout existente; cada tarefa em nuvem já é isolada e não exige Git worktree.

```sh
npm ci
export ASTRO_TELEMETRY_DISABLED=1
npm run dev
```

Astro 7 inicia os servidores em segundo plano. Execute no diretório do projeto:

```sh
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## Validação

```sh
export ASTRO_TELEMETRY_DISABLED=1
npm run validate:data
npm run check
npm test
npm run build
npm run preview
```

O build verifica esquemas, totais de reconciliação, dimensões, checksums, derivados e correspondência entre fotos e veículos. Ausência de dados não vira zero, automático ou disponibilidade confirmada.

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

No ambiente em nuvem atual, Chromium do sistema já está disponível:

```sh
ASTRO_TELEMETRY_DISABLED=1 PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium XDG_CACHE_HOME=/workspace/.cache npm run test:e2e
```

Os testes de navegador servem o build real e uma **cópia temporária isolada** com fixtures explicitamente rotuladas. A cópia testa páginas de veículos, galerias, filtros combinados, paginação, retorno, WhatsApp e compartilhamento sem colocar dados de teste no build público nem enviar mensagens. Capturas reais ficam em `docs/screenshots/`; a captura `fixture-detalhe-390.png` representa somente a fixture de teste.

## Conteúdo e atualização

- `src/data/vehicles.json`: catálogo e ficha técnica por veículo.
- `src/data/dealership.json`: contatos verificados, história, horários, serviços, destaque e modo de demonstração.
- `public/assets/vehicles/<id>/`: arquivos originais e derivados locais, sem hotlink.
- `data/source-manifest.json` e `data/media-manifest.json`: procedência e reconciliação.
- `data/imports/home-2026-10-05/`: README do pacote, dados literais, HTML salvo e associações/checksums.
- `docs/auditoria-origem.md` e `docs/relatorio-migracao.md`: evidências, totais e pendências.

Leia [o procedimento de importação](docs/importacao.md). Para refazer a coleta de páginas públicas depois de liberar a rede ou corrigir a origem:

```sh
npm run audit:source -- --refresh
```

A auditoria respeita HTTPS, robots.txt, cache, concorrência 1 e limite de 500 páginas. Ela reúne candidatos e não declara um estoque completo automaticamente. Paginação e carregamento incremental precisam ser revisados.

## Comportamento do catálogo

Busca tolerante a acentos/caixa; filtros combinados na URL; modelo depende da marca; paginação de 12 itens; anúncios indisponíveis/removidos não aparecem no estoque e mantêm sua página quando presentes nos dados. Preço e ano ausentes ficam no fim em ambas as ordenações. Não existe ordenação por recência sem data confiável. Destaques seguem `featuredIds`; sem configuração, usam a ordem revisada do catálogo. Semelhantes usam marca e, quando ausente, carroceria.

## Publicação

O workflow `.github/workflows/pages.yml` instala pelo lockfile, verifica dados/tipos, executa testes e publica `dist` após push em `main`. PRs executam validação sem deploy. Pages já está configurado para GitHub Actions.

Site: `https://theusmkt.github.io/Auto-cass-site/`. Consulte `docs/publicacao.json` e o resultado do workflow para a versão verificada. Não é necessário alterar DNS ou o domínio da loja.

O modo de demonstração é padrão. Para apresentar o site como catálogo comercial confirmado, reconcilie todos os anúncios/fotos e os contatos, confira a aprovação comercial e só então altere `demo` para `false`. O validador impede essa mudança enquanto faltarem evidências. `robots.txt` está no subdiretório do projeto; `noindex` nas páginas é a proteção efetiva de indexação na demonstração.

## Integrações

Não há backend, formulário de envio, analytics ativo ou segredo obrigatório. WhatsApp apenas abre uma mensagem codificada com o veículo e sua URL; o visitante precisa enviá-la. Nunca há confirmação falsa de envio.

Analytics é desativado por padrão. `src/scripts/global.ts` pode emitir `autocass:analytics` apenas se a integração habilitar explicitamente `data-analytics-enabled="true"`, depois de configurar consentimento adequado. Eventos não contêm dados pessoais. Clique no WhatsApp não equivale a lead confirmado. Não há IDs de GA, GTM ou Meta inventados.

Fontes são hospedadas localmente via pacote npm, sem requisições a Google Fonts. O logo do cabeçalho, menu e rodapé é a PNG referenciada no HTML fornecido. O favicon com iniciais é provisório. A JPG principal também contém a marca; não foi apresentada como foto da loja.
