# Correções e refinamento

Rodada autorizada pelo usuário em 06/10/2026 UTC. Os 46 anúncios e suas fotografias foram preservados. As marcas foram completadas pelo mapeamento fornecido pelo usuário; a revisão não supõe nova coleta ou disponibilidade atual.

## Catálogo e procedência

| Marca | Anúncios |
| --- | --- |
| BMW | 2 |
| BYD | 2 |
| CAOA Chery | 5 |
| Chevrolet | 5 |
| Fiat | 2 |
| Ford | 3 |
| Honda | 4 |
| Hyundai | 1 |
| Jeep | 7 |
| Kia | 1 |
| Land Rover | 1 |
| Nissan | 1 |
| Porsche | 2 |
| Renault | 2 |
| Toyota | 3 |
| Volkswagen | 5 |

`data/editorial/vehicle-presentation.json` registra para cada ID a marca/modelo revisados, o título literal e o título de apresentação aprovado para esta rodada. `data/imports/home-2026-10-05/vehicles-source.json` permanece intacto com títulos, descrições, preços e URLs originais.

A classificação anterior interpretava o trecho **4x2** como o modelo **X2** em `origem-home-18` (Fiat Toro), `23` (Chevrolet S10) e `30` (Jeep Compass). Esses três modelos foram corrigidos individualmente. O adaptador agora usa limites de palavra e a tabela revisada, sem correspondência de modelo dentro de números de tração.

Os 46 títulos foram revisados individualmente, com acentos, espaços, caixa e siglas oficiais preservados: Coupé, Allspace, xDrive/sDrive, EcoSport, BMW, BYD, HR-V, TSI, SRX, CVT e PHEV. Não se aplicou title case indiscriminadamente aos títulos. Equipamentos usam caixa de leitura e preservam ABS, ACC, GPS, USB, LED, CVT, JBL e nomes de sistemas de som. Duplicação COM COM e erro AR C0NDICIONADO foram corrigidos; trechos truncados não foram completados.

O script `scripts/refine-catalog.mjs` conferiu igualdade exata de todos os outros campos antes/depois. Permaneceram iguais IDs, slugs, versões, preço, anos, quilometragem, combustível, câmbio, dados técnicos, disponibilidade, procedência, dimensões, checksums e todas as associações/resoluções de fotografias. Nenhum arquivo em `public/assets/vehicles` foi alterado. São 46 fotos originais e 96 derivados existentes.

## Navegação e apresentação

As opções de marca e modelo vêm dos dados normalizados. Trocar marca limpa modelo incompatível; URLs diretas também são reconciliadas, mantendo busca, preço e outros filtros. Busca por fabricante agora encontra todos os seus anúncios. Os filtros combinam marca/modelo com texto, preço, ano, câmbio e combustível; limpeza restaura 46 resultados.

Textos de leitura usam 16 px; informações secundárias, legendas, botões, filtros e rodapé usam ao menos 14 px nas verificações. A cor secundária foi escurecida; placeholders são opacos. Campos têm 48 px de altura e os controles principais têm ao menos 44 × 44 px. A grade passa a duas colunas no tablet, mantendo os veículos inteiros com `object-fit: contain`.

No detalhe, o nome completo aparece antes da foto no celular e ao lado dela no desktop. A barra móvel mostra preço e interesse sem truncar o título; o nome completo permanece no h1. WhatsApp mantém o nome atualizado e a URL anterior correta, sem envio de mensagem de teste. A foto única permite ampliação, sem galeria simulada.

Foram retirados o link para a home antiga, a explicação técnica de classificação/recomendação, notas de importação e avisos internos sobre reticências da interface comercial. Os detalhes permanecem nos dados e relatórios. Disponibilidade sujeita a confirmação, preço a consultar e indicação de foto única continuam visíveis. Demonstração e `noindex, nofollow` foram preservados.

## Validação

Tipos, build, 11 testes de lógica/importação e 20 testes de navegador. A suíte percorre as 16 marcas, incluindo Volkswagen, Toyota, Ford e Honda; confere modelos, veículos e contagens; combina todos os filtros com um Hilux; verifica resultado vazio, limpeza, retorno e seleção incompatível por URL. Todas as 46 URLs são abertas diretamente, com foto e WhatsApp corretos; há refresh de páginas reais e verificações em 360, 390, 768, 1280 e 1440 px. Acessibilidade automatizada WCAG 2 A/AA e 2.1 AA inclui o detalhe real. Capturas: `docs/screenshots/refinamento-*` e demais imagens das páginas reais.

Os resultados finais e a verificação pública da versão implantada são registrados em `docs/validacao.md` e `docs/publicacao.json`. Não há nota Lighthouse ou conversão inventada.

Republicação concluída e verificada em https://theusmkt.github.io/Auto-cass-site/, commit do site `be3640f609a682923765439669b6d823e0c7b16a`, workflow https://github.com/THEUSMKT/Auto-cass-site/actions/runs/37399677922. A verificação pública conferiu 50 páginas e 150 assets; o navegador abriu oito combinações de página/largura em 390 e 1280 px e testou as quatro marcas solicitadas, filtros combinados, limpeza, seleção incompatível, refresh e retorno ao estoque, sem erros de JavaScript. Capturas em `docs/screenshots/publicado-refinamento-*`.

## Pendências reais

O BYD Yuan Plus continua com **Consulte o valor**: título de origem R$ 264.800,00 e botão R$ 254.800,00. A equipe precisa confirmar o preço. As descrições que terminam em reticências e a falta de galerias adicionais continuam limitadas ao conteúdo recebido. Os 46 anúncios recuperados não atestam o estoque atual integral, nem autorização para uso do redesign como canal oficial.
