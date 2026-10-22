# Contratos REST da simulação

Base `/api`. Cliente Axios, interceptação MSW. Valores ETH são strings com até
18 casas; quantidades são inteiras. Erros têm `{ message: string }` e status
400 (validação), 401 (sessão), 404 (ausência), 409 (conflito), 503 (transitório).
Os tipos de transporte ficam em `src/shared/api/contracts.ts`.

| Método e caminho | Entrada / saída |
| --- | --- |
| GET /nfts | q, collection, network, sort, page, min, max, category → itens, total, páginas |
| GET /collections | Coleções e contagens calculadas pelos mocks |
| GET /nfts/:id | Product com edições, estoque, preço, versão e metadados |
| GET /nfts/:id/related | Cinco relacionados na sequência da referência |
| GET /recommendations | Cinco recomendações para o carrinho |
| GET /nfts/:id/reviews | Avaliações fictícias determinísticas |
| POST /newsletter/subscriptions | email → id, email normalizado, subscribedAt, alreadySubscribed, simulated=true |
| POST /register | name, username, email, password → usuário público |
| POST /login | email, password → usuário, token opaco, expiração |
| GET /session | Usuário público ou null para visitante |
| POST /logout | Invalida o token |
| GET /cart | Carrinho do visitante/usuário |
| POST /cart/items | nftId, editionId, quantity → carrinho atualizado |
| PATCH /cart/items | Mesmos campos; quantity=0 remove o item |
| POST /cart/coupon | code; string vazia remove → carrinho |
| POST /quotes | Cotação com itens, subtotal, desconto, taxa, total, expiração |
| GET /favorites | Lista de ids do usuário |
| POST /favorites/:id | Inclui favorito |
| DELETE /favorites/:id | Remove favorito |
| PATCH /profile | name, username, email, walletNickname, ens, avatar, currentPassword/newPassword opcionais → usuário atualizado |
| POST /profile/password | currentPassword, newPassword |
| GET /wallets | Carteiras do usuário |
| POST /wallets | id opcional, name, address, network, primary; cria ou atualiza |
| POST /orders | quoteId, walletId, network, collector + Idempotency-Key |
| GET /orders/:id | Estado e snapshot do pedido, restritos ao dono |
| GET /orders/by-key/:key | Recupera a tentativa idempotente do usuário |
| POST /demo/reset | Restaura todas as fixtures da simulação |
| PATCH /demo/nfts/:id | priceEth, available, editionId, duplicates → altera o banco e publica eventos Socket.IO |
| POST /demo/disconnect | Interrompe conexões simuladas para testar reconexão pelo cliente |

Authorization Bearer transporta o token. X-Visitor-Id identifica o carrinho do
visitante. Login mescla o carrinho do visitante sem ultrapassar o estoque.
Dados de outros usuários não são retornados em endpoints privados.

## Newsletter demonstrativa

O POST valida formato e limite de 254 caracteres. O e-mail é normalizado para minúsculas; novas tentativas do mesmo endereço retornam o mesmo registro. Não há endpoint público que liste inscrições. O banco local preserva o cadastro após atualização e o reset da demonstração o remove. O cenário `newsletter-error` responde HTTP 503 sem cadastrar; uma nova tentativa pode ser feita no formulário. O limite da simulação é de 2.000 registros (HTTP 429). Nenhuma mensagem de e-mail é enviada.

## Cotação e pedido

A cotação expira em 5 minutos. O servidor simulado compara preços, quantidades,
versões, estoque e cupom antes de aceitar o pedido. Mudanças exigem revisão.
Uma chave de idempotência repetida com o mesmo corpo recupera o pedido;
com corpo diferente retorna 409. A criação reserva estoque; a recusa libera.
Confirmação/recusa são terminais e guardam os valores originais do recibo.

O estado pendente é resolvido após três segundos pelo servidor simulado e publica
`order.updated`. O cliente Socket.IO assina a sessão e recebe `nft.updated` e
`order.updated` pela binding MSW/Engine.IO. IDs e versões descartam eventos
duplicados/antigos; eventos de pedido são restritos ao dono. Reconexão invalida
catálogo, detalhe, carrinho, cotação e pedido para reconciliar com REST. Polling
de pedidos pendentes a cada três segundos oferece recuperação complementar.

## Cache e sessão

Query: staleTime 15s, gcTime 5min, uma repetição para falhas transitórias e
nenhuma para 400/401/403/404/409. Mutations não repetem automaticamente.
Respostas obsoletas são canceláveis via AbortSignal no Axios. Chaves incluem
parâmetros do catálogo ou usuário nos recursos privados.

Alterações no carrinho invalidam carrinho/cotação; carteiras invalidam sua
consulta; favoritos usam otimista com rollback. Login/logout cancelam consultas
anteriores e limpam o cache. HTTP 401 remove o token e revalida as rotas.

## Limitações conhecidas

Os cenários incluem latência variável, eventos duplicados/antigos, desconexão e
retomada de pedido pendente. Concorrência entre abas não tem garantia transacional
de um servidor real. Erros de API usam mensagem geral; não há mapa estruturado
por campo para todos os erros. A persistência usa armazenamento local do navegador;
não é autenticação de produção. Os detalhes de blockchain são conteúdo fictício
da referência, sem consulta ou verificação real.
