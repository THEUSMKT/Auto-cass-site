# Redesign Auto Cass

Branch `claude/auto-cass-redesign-audit-xacsdj`. A versão publicada (`main`) não foi alterada.

**Leitura de design:** site de revenda premium para quem compra carro de alto valor, em linguagem cinematográfica e silenciosa, tema único grafite, Astro estático + CSS nativo + GSAP (ScrollTrigger, SplitText) + Lenis. Ajustes: DESIGN_VARIANCE 7, MOTION_INTENSITY 8, VISUAL_DENSITY 3.

## Sistema

| Token | Valor | Uso |
| --- | --- | --- |
| `--graphite-950` | `#161816` | rodapé, chamada final, faixa de demonstração |
| `--graphite-900` | `#202321` | fundo base |
| `--graphite-850` / `-800` | `#262a27` / `#2f3430` | superfícies e campos |
| `--text` | `#ece8e1` | texto (13:1) e botão principal |
| `--text-muted` | `#a9aaa3` | apoio (6,8:1 no base, 5,9:1 nas superfícies) |
| `--accent` | `#c8b898` | champagne fosco: foco, item ativo, linha da estrada, detalhes |

Tipografia: Geist Variable (100 a 900, itálico real), títulos em 300, ênfase só com itálico da mesma família, números tabulares em preços e fichas. Cantos de 2px em tudo; bordas de 1px; sombra quase invisível só no rótulo do cursor.

## Movimento

Entradas de 1,1 a 1,4 s com `expo.out` (sem rebote), nenhum loop decorativo. Só `transform` e `opacity`, com uma exceção deliberada: o traço da estrada (`stroke-dashoffset`).

1. Hero: máscara de cortina (moldura sobe, foto contra-move) e parallax de profundidade no scroll; no celular, 5% só na foto.
2. Brilho especular (`mix-blend-mode: screen`) que segue o mouse, contido numa elipse sobre a carroceria; só desktop com mouse.
3. Vitrine fixada (ScrollTrigger `start: "top top"`, pin) com crossfade e deslize entre Cayenne, Tiguan e BYD; índice por nome e linha de progresso. Abaixo de 1024 px ou 700 px de altura, cards empilhados de tamanhos variados.
4. Rótulo magnético "Ver detalhes" sobre fotos de veículos (o cursor do sistema continua visível) e zoom de 1.04 em 1,2 s.
5. Estrada em SVG calculada a partir da posição real dos três passos e desenhada pelo scroll.
6. View Transitions entre páginas (`@view-transition`), com a foto do card se transformando na foto do anúncio.

Base: Lenis no desktop (toque mantém rolagem nativa), títulos revelados por linha (SplitText com máscara), cabeçalho que desfoca ao rolar, some ao descer e volta ao subir. `prefers-reduced-motion` desliga tudo; se o script não iniciar em 2,5 s, a página aparece estática. O pacote de movimento (54 KB gzip) só é carregado quando o movimento é permitido.

## Checagem final (taste-skill)

- Zero travessões no texto visível (verificado no HTML gerado); 1 rótulo em maiúsculas na home (limite: 3).
- Tema único, acento único, raio único; contraste AA conferido pelo axe nas páginas principais.
- Nenhum botão quebra linha no desktop; uma etiqueta por intenção ("Fale com a equipe" = WhatsApp, "Ver estoque" = estoque).
- Hero: título em 2 linhas no desktop, apoio com 16 palavras, dois botões, sem rótulo, sem faixa decorativa, sem dica de rolagem.
- Sem números inventados: preços, anos e equipamentos vêm do catálogo; a seção de confiança só mostra dados existentes.
- Imagens AVIF + WebP/JPG com largura e altura fixas, lazy loading fora do hero, nada ampliado além do original.
- Sem listener de `scroll`: ScrollTrigger, IntersectionObserver e ResizeObserver.
- Testes: 11 unitários e 25 de navegador (5 larguras, axe, busca, vitrine, camada de movimento) passando.

## Pendências (dependem da loja)

1. Logo em SVG ou PNG com 600 px ou mais (o atual tem 150×79 e fica suave em telas retina).
2. Fotos de Cayenne, Tiguan e BYD: 3/4 frontal sem placa da loja, perfil, detalhe de roda e interior, com 2400 px ou mais, e uma vertical 4:5 de cada.
3. Foto da fachada ou do showroom (Sobre e chamada final). Hoje o Sobre e o bloco "Loja física" usam a foto do Velar no showroom.
4. Confiança: ano de fundação, garantia, financiamento, nota e número de avaliações no Google com 2 ou 3 depoimentos autorizados, horários.
5. Texto institucional para o Sobre.
6. Preço do BYD (o anúncio mostra R$ 254.800 e R$ 264.800); segue "Consulte o valor".
