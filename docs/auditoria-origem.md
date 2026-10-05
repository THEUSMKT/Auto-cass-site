# Auditoria da origem

Observação: 05/10/2026, 20:25:04 BRT (America/Sao_Paulo).
Fonte: https://www.autocass.com.br/

## Resultado observado

O proxy do ambiente bloqueou a conexão antes de alcançar a origem. Isso não comprova indisponibilidade do site para os visitantes. Nenhuma avaliação visual, contato, anúncio ou fotografia pôde ser confirmada.

## Páginas

- https://www.autocass.com.br/: sem resposta da origem — curl: (56) CONNECT tunnel failed, response 502

## Identidade e análise

Nome Auto Cass informado pelo solicitante. Assinatura tipográfica, grafite, branco quente e bronze são propostas de redesign, não identidade oficial verificada. História, endereço, horários, redes sociais, serviços, contatos e estoque permanecem desconhecidos até revisão da fonte. Não foram enviadas mensagens nem formulários à loja.

Nenhum problema visual, métrica Lighthouse, taxa de conversão ou quantidade total de veículos foi inferido. O acesso anterior com falha de certificado descrito no briefing não foi reproduzido porque esta tentativa foi bloqueada antes do TLS da origem.

## Dependências

Liberar www.autocass.com.br e autocass.com.br no acesso à internet do ambiente; depois executar npm run audit:source -- --refresh. Se a origem mantiver uma falha real de TLS, aguardar sua correção ou receber exportação do estoque e fotos. Não desativar validação TLS.
