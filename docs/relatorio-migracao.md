# Relatório de migração

Importação em 06/10/2026 UTC de `Auto-Cass-Pacote-para-Codex.zip`, fornecido pelo usuário. Evidência: home salva em 05/10/2026, sem hora informada, preservada em `data/imports/home-2026-10-05/sources/Home.html`. O README do pacote foi lido e preservado. Não foi necessário acessar novamente a origem para importar.

| Medida | Resultado |
| --- | --- |
| Entradas encontradas na home fornecida | 46 |
| Páginas individuais da origem lidas | 0; a home não fornece links individuais |
| Anúncios importados / páginas individuais novas | 46 / 46 |
| URLs de fotografias distintas na home | 46 |
| Fotografias válidas importadas localmente | 46; uma por anúncio |
| Falhas / trocas / duplicações de fotos | 0 / 0 / 0 |
| Estoque atual integral confirmado externamente | Não; total externo desconhecido |
| Galerias completas confirmadas | Não |
| Contatos recuperados do HTML | WhatsApp, telefone, e-mail, endereço e redes |
| Destinatário WhatsApp confirmado por envio | Não; nenhuma mensagem enviada |

Todos os títulos, descrições, preços de botão e URLs de foto foram comparados com os elementos correspondentes do HTML. As 46 fotografias possuem checksums distintos. Foram preservados os arquivos originais e suas marcas d'água, com derivados WebP responsivos. Os manifestos registram IDs, URLs, dimensões, checksums e associações. A importação passou por revisão e backup antes da aplicação.

Os dados literais estão em `data/imports/home-2026-10-05/vehicles-source.json`, incluindo `titleRaw`, `descriptionRaw`, `priceRaw`, IDs dos elementos, URLs e arquivos de cada foto. `associations.json` preserva o checksum do HTML e de cada original. Scripts e integrações antigos não foram executados nem incorporados. O HTML de evidência fica fora de `public` e de `dist`.

## Regras aplicadas

- As 46 entradas foram mantidas, inclusive os Tiggo 5X semelhantes (`origem-home-20` e `origem-home-21`), com páginas e fotos diferentes.
- Ano citado no título ficou em `yearInTitle`, apresentado como **Ano no anúncio**. Fabricação e ano-modelo continuam nulos nos 46 anúncios.
- Quilometragem zero apenas nos três títulos com `0KM`. As outras 43 quilometragens continuam nulas. Cor, carroceria, portas e motorização estruturada não foram deduzidas.
- Marca só preenchida quando escrita no título: Porsche, BMW, BYD, Jeep ou Chevrolet. Nos demais anúncios permanece ausente. Modelos foram extraídos dos tokens do título. Câmbio e combustível só classificados a partir de termos explícitos no título/descrição.
- Equipamentos foram separados pelas barras e parágrafos da origem; itens textualmente idênticos foram deduplicados. O texto literal completo permanece no registro de procedência. Trechos terminados em reticências não foram completados.
- Títulos de apresentação removem preço, chamada para link da bio e chamadas antigas de pronta entrega/emplaçamento; a quilometragem explícita aparece na ficha. Os títulos literais permanecem preservados.
- Disponibilidade permanece `unknown` para todos. Não há atualização em tempo real, avaliações, garantias ou aprovação de financiamento inventados.
- Cada página permite ampliar a única foto disponível, sem setas ou miniaturas redundantes quando não há outros ângulos.

## Pendências

**BYD Yuan Plus (`origem-home-03`):** título registra **R$ 264.800,00**, botão registra **R$ 254.800,00**. Ambos permanecem no registro de origem. O preço do catálogo é nulo; card, detalhe e ação móvel mostram **“Consulte o valor”**. A equipe precisa confirmar o valor correto.

As descrições de `origem-home-12`, `17`, `28` e `42` terminam com reticências na origem e não foram ampliadas artificialmente.

WhatsApp normalizado: **555134741338**, evidenciado nos links do HTML. Telefone **(51) 3474-1338**, e-mail **contato@autocass.com.br**, endereço **Av. Rubem Berta 1565 - Freitas - Sapucaia do Sul, RS - CEP 93218-350**. `verifiedAt` registra a conferência documental nesta importação, não confirmação externa ou envio. Horários, história e serviços não disponíveis permanecem ausentes.

A PNG foi inspecionada e corresponde ao logo presente no HTML; foi importada para cabeçalho, menu e rodapé. A JPG principal também contém a marca, não uma fachada; não foi usada como foto da loja. O SVG decorativo não foi necessário ao redesign.

O site mantém identificação de demonstração, `noindex, nofollow` e `catalogStatus=partial`. Publicação como canal oficial, confirmação do estoque atual completo, galerias adicionais e resolução do preço do BYD dependem de evidência/aprovação comercial.

A cópia arquivada do HTML foi sanitizada para remover scripts, manipuladores de eventos e credenciais de integrações antigas. Os 46 títulos, descrições, preços e associações de fotos foram novamente comparados e preservados. O checksum original do arquivo fornecido e o checksum da cópia sanitizada ficam em `associations.json`; o ZIP original permanece fora do repositório.
