# Importação revisável

Não foi possível ler o estoque original nesta coleta. O importador aceita uma exportação estruturada e as fotos correspondentes, cria uma revisão sem alterar os dados atuais e exige aplicação explícita. Nunca converte campos ausentes em fatos.

## Preparar a exportação

JSON com `sourceUrl`, `collectedAt` (ISO UTC), `vehicles`, `dealership` opcional e os totais realmente observados: `discoveredCount`, `detailsReadCount` e `paginationVerified`. Esses totais permanecem desconhecidos quando a origem não puder ser percorrida.

Cada veículo exige `id`, `slug`, `sourceUrl` e `title`. Os demais campos são `brand`, `model`, `version`, `price` numérico BRL ou null, `originalPriceText`, `manufacturingYear`, `modelYear`, `mileage`, `fuel`, `transmission`, `color`, `body`, `doors`, `engine`, `description`, `features`, `specifications`, `status`, `publishedAt` e `issues`.

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

Use `featuredIds` para selecionar veículos reais, sem alegar mais vendidos. O importador mantém `demo=true` mesmo após uma coleta reconciliada; a publicação comercial depende de revisão e confirmação. Coloque qualquer arquivo institucional verificado sob `public/assets/` e referencie o caminho relativo; o logotipo oficial e a foto da loja não foram coletados nesta entrega.

## Limites atuais

O extrator de auditoria reúne páginas, links públicos, imagens e JSON-LD para revisão; não é um adaptador validado para a plataforma da origem, pois o HTML do site não pôde ser lido. A exportação normalizada precisa ser fornecida ou construída a partir da coleta acessível. A migração só estará completa após reconciliação dos anúncios e galerias reais.
