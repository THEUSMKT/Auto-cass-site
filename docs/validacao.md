# Validação do catálogo e refinamento

Executada em 06/10/2026 UTC. Node 24.19.0, npm 11.9.0, Astro 7.3.5, TypeScript 6.0.3 e Chromium do sistema.

| Verificação | Resultado |
| --- | --- |
| Dados, procedência, associação, dimensões e checksums | 46 anúncios / 46 fotografias originais válidas |
| Derivados responsivos | 96 WebP locais; originais preservados |
| Tipos (`astro check`) | 0 erros, 0 avisos, 0 sugestões |
| Testes de lógica, importação e fidelidade | 11 passaram |
| Testes de navegador | 20 passaram |
| Build estático | 51 páginas HTML, incluindo 46 detalhes, mais robots e sitemap |
| URLs diretas dos 46 anúncios sob `/Auto-cass-site/` | HTTP 200 no build testado; títulos/fotos/WhatsApp correspondentes |
| Responsividade | 360, 390, 768, 1280 e 1440 px |
| Canais recuperados | Número do HTML conferido na URL de WhatsApp; nenhuma mensagem enviada |
| Acessibilidade automatizada | Sem violações nos conjuntos WCAG 2 A/AA e 2.1 AA nas páginas verificadas |
| Estoque atual integral / galerias completas | Não confirmados |

A rodada de refinamento completou as 16 marcas, corrigiu três modelos, padronizou nomes e equipamentos e aumentou a legibilidade. Foram removidos link para a home antiga e explicações técnicas da interface comercial. O texto secundário #565e54 tem contraste de 6,17:1 contra #f7f5f0; o texto #1c201b no botão bronze #b88c64 tem 5,48:1. A legenda pequena da arte institucional foi escurecida para ultrapassar 4,5:1. Veja `docs/refinamento.md`.

A validação documental comparou os 46 títulos, descrições, preços de botão e URLs de fotografias com seus elementos no HTML do pacote. O teste de migração verifica preservação de IDs, campos ausentes, anos, preços, status desconhecido e checksums originais. O preço conflitante do BYD fica em consulta; os dois valores literais são preservados apenas na procedência.

Os testes de navegador percorrem as 16 marcas e seus modelos/veículos, combinam marca, texto, preço, ano, câmbio e combustível, limpam seleções incompatíveis por troca de marca ou URL, restauram os 46 anúncios e verificam retorno após refresh. A suíte mede textos secundários ≥14 px e alvos principais ≥44 × 44 px em cinco larguras; confirma que o h1 móvel fica antes da foto, acima da barra fixa. Acessibilidade inclui início, estoque, sobre, contato e detalhe real, além das fixtures.

Os testes de navegador cobrem todas as URLs e fotografias reais, WhatsApp contextual com nome/URL correta, filtros reais por ano, paginação 12/12/12/10, retenção dos Tiggo semelhantes, valores desconhecidos no fim e ausência de ano-modelo inferido. O detalhe do BYD foi aberto diretamente e após refresh nas cinco larguras, com ampliação da única foto, Escape/foco e preço em consulta.

Também foram verificados busca com acentos, filtros combinados, modelo dependente, chips, limpeza, retorno ao estoque, filtros móveis, compartilhamento, menu e galeria de múltiplas fotos em fixtures isoladas. Nenhuma fixture, imagem sintética ou número de teste entra no catálogo público. As capturas `byd-real-*`, `inicio-*`, `estoque-*`, `sobre-*` e `contato-*` representam dados reais; arquivos `fixture-*` são somente testes.

As imagens foram inspecionadas visualmente e o hero foi ajustado para manter a fotografia inteira e sua marca d'água, sem legenda sobreposta. O logo do pacote é usado no site. Todas as páginas mantêm `noindex, nofollow` e identificação de demonstração. Analytics, Pixel, Jivochat e scripts antigos permanecem desativados/ausentes.

Os primeiros comandos Astro sem a variável de telemetria encontraram uma restrição de escrita na configuração fora de `/workspace`; foram repetidos com `ASTRO_TELEMETRY_DISABLED=1`, como previsto no ambiente. A suíte passou com TLS e recursos locais normais, sem desativar verificação HTTPS.

A análise automatizada não substitui revisão humana de acessibilidade. Não foram executados Lighthouse nem medições de INP ou conversão, e não há métricas inventadas.

## Publicação da importação anterior

Código da importação publicado em `main`, commit `6b4c5915ac1799d50c665d7786548d4fbfd73faf`. O workflow https://github.com/THEUSMKT/Auto-cass-site/actions/runs/37394193217 repetiu os checks e terminou com build e deploy bem-sucedidos.

URL confirmada: https://theusmkt.github.io/Auto-cass-site/. Foram verificados publicamente os quatro caminhos institucionais e os 46 detalhes (50 páginas HTTP 200), com títulos, canonicals, noindex, associações de fotos e WhatsApp corretos. Os 150 arquivos verificados — 46 fotos originais, 96 derivados WebP, logo, favicon, CSS e JavaScript — respondem HTTP 200 e correspondem aos checksums do build local.

O navegador abriu início, estoque, detalhe do BYD e contato a 390 px, com verificação TLS ativa, todas as imagens carregadas, nenhum overflow horizontal e nenhum erro de JavaScript. A ampliação de foto única e o preço em consulta foram confirmados publicamente. Nenhuma mensagem foi enviada. Evidência em `docs/publicacao.json` e `docs/screenshots/publicado-*-390.png`.

## Republicação do refinamento

Os resultados do novo workflow e a abertura do site atualizado são registrados em `docs/publicacao.json` após o deploy desta rodada.
