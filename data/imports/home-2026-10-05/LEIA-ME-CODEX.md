# Auto Cass — importação do conteúdo recuperado

Anexe este ZIP ao mesmo chat do Codex que implementou o projeto. Extraia e leia este documento antes de continuar. O destino continua sendo https://github.com/THEUSMKT/Auto-cass-site e seu GitHub Pages.

## Ordem de execução

1. Inspecione o estado atual do repositório e suas instruções. Preserve alterações existentes e o redesign já implementado.
2. Use `data/vehicles-source.json`, `data/dealership-source.json` e `data/import-report.json` como fonte para adaptar o catálogo ao schema atual. São 46 entradas extraídas do HTML salvo pelo usuário em 05/10/2026. Não há necessidade de acessar novamente o domínio original para importar estes dados.
3. Copie as fotografias locais em `assets/vehicles/` para a pasta pública adequada. Verifique `photoDownloadStatus` de cada entrada antes de usá-la. Preserve a associação explícita entre ID e arquivo. Use os arquivos locais, não hotlink.
4. Cada entrada preserva título, descrição e preço literalmente, além do ID do elemento de origem. `yearInTitle` é o ano encontrado no título, não comprova ano de fabricação e ano-modelo separados. Quilometragem só foi preenchida como zero quando o título diz 0KM. Outros campos ausentes devem continuar ausentes até haver evidência; não deduza equipamentos ou números pela imagem.
5. Não una entradas apenas por nome, ano ou preço. Há títulos muito parecidos de Tiggo 5X, por exemplo, que podem representar veículos diferentes. Preserve as 46 entradas até confirmar eventual duplicidade.
6. Para a entrada do BYD Yuan Plus, o título contém R$ 264.800,00 e o botão mostra R$ 254.800,00. Preserve ambos no registro de origem. Mostre “Consulte o valor” enquanto a divergência não for resolvida, e informe essa pendência. Nos demais casos, o preço extraído corresponde ao botão do card.
7. Preserve o conteúdo útil das descrições e opcionais; elimine apenas duplicação textual inequívoca e erros de formatação. Não invente o fim das descrições que terminam em reticências. Remova chamadas antigas como “link da bio” do título de apresentação, mantendo `titleRaw` no registro de procedência.
8. Crie páginas individuais novas para todas as entradas, com suas fotos disponíveis, ficha limitada aos dados reais, opcionais, preço ou estado de consulta e WhatsApp contextual. O HTML da home não fornece URLs individuais dos carros: os botões voltam à própria home. As novas URLs devem ser geradas pelo projeto.
9. Há uma fotografia distinta associada a cada entrada na home. Isso NÃO comprova que exista uma galeria completa de ângulos para cada veículo. Mostre uma foto quando só houver uma; não duplique para simular galeria e não use imagens de outros carros. Atualize os relatórios para distinguir 46 anúncios recuperados de estoque integral externamente confirmado.
10. Use contatos e endereço encontrados no HTML. O número associado a links de WhatsApp é (51) 3474-1338; a forma internacional normalizada é 555134741338. Não envie mensagens de teste à loja. Declare no relatório que a evidência é o HTML fornecido e que o destinatário não foi confirmado por envio.
11. O arquivo `assets/source/IMG_0391-23c41cc5-1280w.JPG` veio do ZIP e corresponde à imagem principal referenciada na página. A pequena PNG também foi preservada; inspecione-a antes de assumir que seja um logo. O SVG é parte decorativa. Não redesenhe ou anuncie identidade oficial sem evidência.
12. O HTML original está em `sources/Home.html` para consulta. Não execute ou incorpore os scripts antigos, Facebook Pixel, Jivochat, bibliotecas ou CSS como base da implementação. Reconstrua os componentes do projeto atual e mantenha rastreamento desativado até configuração deliberada.
13. Preencha home, estoque, filtros, detalhes e contato com o conteúdo real recuperado. Substitua os estados vazios adequadamente. Não apresente avaliações fictícias. Não publique “mais vendidos”, garantia, financiamento aprovado ou outros diferenciais sem comprovação.
14. Verifique build, filtros, URLs diretas sob `/Auto-cass-site/`, imagens, campos ausentes e estados de contato. Confirme que todas as 46 entradas possuem página e foto quando o download foi bem-sucedido.
15. Atualize o relatório da migração; publique no repositório solicitado e GitHub Pages usando as permissões disponíveis. Verifique a URL após o workflow. O site permanece uma demonstração de redesign enquanto não houver aprovação de uso como canal oficial; preserve identificação e `noindex` nesse caso.
16. Ao terminar, informe URL publicada, commit, quantidade efetiva de entradas e fotos importadas e a pendência do preço do BYD. Não diga que “todas as galerias” foram importadas: apenas as fotografias presentes na home foram recuperadas.

## Observações de estrutura da origem

O HTML recebido confirma navegação “Compre seu Cass”, “Financiamento Online”, “Nossos clientes” e “Localização”, além de canais sociais e contato. Não contém o conteúdo completo das páginas externas “contate-nos” e “nossos-clientes”; não invente seus formulários ou depoimentos.

O estoque da home foi construído como uma galeria de fotografias, com título, longa descrição de opcionais e preço nos captions. Vários captions estavam salvos com `display: none`. Esse estado pode resultar de interação ou do mecanismo original e não prova sozinho que nunca sejam visíveis. No redesign, nome, ano disponível e preço devem permanecer visíveis nos cards, com equipamento detalhado na página do carro.

Os botões de preço observados apontam para a própria home, e não para páginas individuais dos veículos. Corrija o fluxo com detalhes compartilháveis. O acervo mistura veículos premium com opções mais acessíveis; não exclua os veículos menores para impor um posicionamento apenas de luxo.

## Limitações dos dados

- 46 entradas na home salva não equivalem a confirmação externa do estoque atual completo.
- Uma fotografia por entrada não equivale à galeria integral de cada carro.
- Equipamentos e alegações foram extraídos da fonte, não verificados mecanicamente.
- Disponibilidade pode mudar desde o salvamento; não crie indicadores de atualização em tempo real.
- Contatos presentes no HTML foram recuperados, mas seus destinos não foram testados com envio.

Continue diretamente com a importação, implementação e publicação. Peça complemento apenas para pendências que impeçam uma decisão real; não interrompa todo o trabalho por campos opcionais ausentes.
