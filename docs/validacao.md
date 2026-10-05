# Validação da implementação

Executada em 5 de outubro de 2026, America/Sao_Paulo. Node 24.19.0, npm 11.9.0, Astro 7.3.5, TypeScript 6.0.3 e Chromium 151.0.7922.173 no ambiente em nuvem.

| Verificação | Resultado |
| --- | --- |
| Reinstalação pelo lockfile (`npm ci`) | Passou |
| Esquemas, procedência e integridade (`validate:data`) | Passou para o catálogo vazio em modo demo |
| Tipos (`astro check`) | 0 erros, 0 avisos, 0 sugestões |
| Testes de lógica e importação | 6 passaram; 0 falharam; 0 ignorados |
| Testes de navegador | 12 passaram; 0 falharam; 0 ignorados |
| Build estático | 5 páginas + robots e sitemap |
| Servidor de desenvolvimento | Início, estoque, sobre e contato responderam HTTP 200 com conteúdo esperado |
| Responsividade | 360, 390, 768, 1280 e 1440 px, páginas principais e detalhe isolado |
| Acessibilidade automatizada | Sem violações detectadas nas páginas/componentes verificados pelos conjuntos WCAG 2 A/AA e WCAG 2.1 AA |
| Fidelidade ao estoque real | Não verificada; origem inacessível |
| Contatos reais / WhatsApp comercial | Não verificados; ocultos no site real |

Os testes verificaram busca com acentos/caixa, filtros combinados, marca/modelo dependente, ordenação com valores ausentes no fim, estado vazio, limpeza, chips, paginação, persistência de filtros no retorno, página de veículo após refresh, galeria por teclado/toque/Escape, retorno de foco, compartilhamento e URL contextual do WhatsApp. Nenhuma mensagem foi enviada.

A importação foi exercitada numa pasta temporária: revisão sem alterar catálogo, aplicação explícita, imagem inválida rejeitada, deduplicação de bytes, campo ausente preservado, backup e rejeição de revisão adulterada.

Dados de teste, número de WhatsApp de teste e imagens sintéticas aparecem apenas na cópia temporária e em capturas explicitamente identificadas como fixtures; não entram em `dist` nem no catálogo público. A versão real foi verificada como demonstração sem dados fictícios ou links de WhatsApp. Capturas de todas as larguras estão em `docs/screenshots/`.

Foram corrigidos contraste de textos pequenos e nomes acessíveis antes da execução final. A análise automatizada não substitui revisão humana de acessibilidade nem garante todas as interações com todos os leitores de tela.

Não foi executado Lighthouse e não foram medidos INP, taxa de conversão ou desempenho em rede/dispositivos reais. Não há notas ou métricas de desempenho inventadas.

## Publicação e dependências externas

Acesso Git e leitura da API do repositório funcionaram. A API de criação de Pages recusou a integração com HTTP 403 `Resource not accessible by integration`, embora o repositório reporte permissão administrativa. A ativação depende de Settings → Pages → Build and deployment → Source: GitHub Actions. O workflow de validação/deploy está no repositório; o endereço previsto só deve ser considerado publicado após confirmação do workflow e resposta HTTP.

A origem continua sem HTML utilizável (CONNECT 502 no host www; CONNECT 403 no host sem www). São necessários estoque/exportação, fotos e informações comerciais verificadas para concluir a migração e validar o catálogo real.
