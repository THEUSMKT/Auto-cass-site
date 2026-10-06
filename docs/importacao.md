# Importação revisável

O catálogo atual contém 46 entradas e 46 fotos importadas do pacote do usuário. O importador aceita uma exportação estruturada e as fotos correspondentes, cria uma revisão sem alterar os dados atuais e exige aplicação explícita. Nunca converte campos ausentes em fatos.

## Pacote da home salva

Leia `data/imports/home-2026-10-05/LEIA-ME-CODEX.md`. O adaptador compara os dados com o HTML e confirma as associações locais:

```sh
node scripts/prepare-home-import.mjs /caminho/Auto-Cass-Importacao
npm run import:review -- .cache/home-export.json --media-dir /caminho/Auto-Cass-Importacao
```

Ele não executa scripts do HTML. As fontes literais e associações estão em `data/imports/home-2026-10-05/`. Em um checkout sem o logo, copie a PNG inspecionada para `public/assets/brand/autocass-logo.png` antes de aplicar. Não converta `yearInTitle` em ano-modelo e não resolva o preço do BYD por escolha arbitrária. Estoque integral e galerias completas não foram confirmados.

## Preparar a exportação

JSON com `sourceUrl`, `collectedAt` (ISO UTC), `vehicles`, `dealership` opcional e os totais realmente observados: `discoveredCount`, `detailsReadCount` e `paginationVerified`. Esses totais permanecem desconhecidos quando a origem não puder ser percorrida.

Cada veículo exige `id`, `slug`, `sourceUrl` e `title`. IDs e slugs são únicos; entradas distintas podem compartilhar uma página de origem. Os demais campos são `brand`, `model`, `version`, `price` numérico BRL ou null, `originalPriceText`, `manufacturingYear`, `modelYear`, `yearInTitle` opcional, `mileage`, `fuel`, `transmission`, `color`, `body`, `doors`, `engine`, `description`, `features`, `specifications`, `status`, `publishedAt` e `issues`.

`status` aceita `unknown`, `available`, `unavailable` ou `removed`. Só use disponível ou removido com evidência. `publishedAt` não é a data da coleta. IDs são da origem, não do nome do modelo; unidades iguais permanecem anúncios separados.

`photos` é uma lista ordenada de objetos com `sourceUrl` obrigatório e `file` opcional, relativo à pasta de fotos fornecida. Sem `file`, o importador baixa a URL pública por HTTPS com verificação TLS. Não use endpoints privados. URLs públicas de mídia descobertas podem exigir inclusão do hostname na lista de rede do ambiente.

Campos ausentes devem ser null ou omitidos; strings e números não são inferidos a partir das fotografias. Divergências entre card e detalhe entram em `issues` e precisam de revisão. Preserve a redação original em `title`, `version`, `originalPriceText` e `description`.

## Revisar e aplicar

```sh
npm run import:review -- /caminho/exportacao.json --media-dir /caminho/fotos
```

Examine `.import-review/<data>/review.json`, os quatro JSONs de dados e as fotos. Confira associação, ordem, valores, ficha técnica, totais e pendências. Nenhuma foto é reatribuída entre veículos. Fotos repetidas por URL ou bytes idênticos são deduplicadas; ângulos distintos são preservados. As versões em diferentes resoluções que não forem bytes idênticos exigem decisão explícita na exportação revisada: o importador não elimina fotos por semelhança visual.

```sh
npm run import:apply -- --review .import-review/<data>
npm run check
npm test
npm run build
```

O importador preserva arquivos originais, verifica formato/dimensões/checksum e gera WebP em 480, 960 e 1600 px quando há resolução suficiente. Marca d'água e aparência do veículo não são removidas nem alteradas. HTML de erro não é aceito como foto. Falhas de mídia viram estado indisponível com pendência, sem imagem substituta.

A aplicação cria backup dos dados anteriores em `.cache/import-backups/<data>/`. Arquivos de mídia existentes com conteúdo diferente são preservados e bloqueiam a aplicação. Os JSONs anteriores são restaurados se a validação falhar. Arquivos antigos não são apagados automaticamente.

## Contatos e marca

`dealership` segue `src/data/dealership.json`. WhatsApp usa número internacional somente com dígitos, começando em `55`; telefone é o texto oficial, email deve ser válido e endereço é o texto confirmado. Preencha `verifiedAt` e registre fontes em `provenance`. Horários são strings, serviços são `{title, description}` e redes sociais são `{label, url}`.

Use `featuredIds` para selecionar veículos reais, sem alegar mais vendidos. O importador mantém `demo=true` mesmo após uma coleta reconciliada; a publicação comercial depende de revisão e confirmação. Coloque qualquer arquivo institucional verificado sob `public/assets/` e referencie o caminho relativo; a PNG do logo foi recuperada do pacote, mas fotografia da loja não foi fornecida.

## Limites atuais

O extrator de auditoria online reúne páginas, links e imagens para revisão. O adaptador `prepare-home-import.mjs` foi validado especificamente contra a home fornecida neste pacote. Não há coleta validada de fichas externas, galerias integrais ou estoque atual completo. Dados adicionais precisam de fontes associadas a cada ID e nova revisão; nunca substitua as pendências por suposições.

A cópia arquivada do HTML foi sanitizada para remover scripts, manipuladores de eventos e credenciais de integrações antigas. Os 46 títulos, descrições, preços e associações de fotos foram novamente comparados e preservados. O checksum original do arquivo fornecido e o checksum da cópia sanitizada ficam em `associations.json`; o ZIP original permanece fora do repositório.
