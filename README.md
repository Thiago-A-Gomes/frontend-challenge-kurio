# Kurio — Marketplace de NFTs

Aplicação React + TypeScript com navegação TanStack Router, estado remoto
TanStack Query, cliente Axios e API simulada na rede com MSW.

## Execução

```sh
npm ci
npm run dev
```

Abra o endereço do Vite. A interface pública aparece enquanto o MSW inicia;
REST/Axios e Socket.IO aguardam sua instalação antes de enviar requisições.
Os mocks funcionam também no build publicado. Use localhost/127.0.0.1 ou HTTPS.
A variável `VITE_ENABLE_MOCKS` tem valor padrão `true`; `.env.example` documenta
essa opção. `false` desativa os mocks e exige uma API em `/api`.

```sh
npm run typecheck
npm run build
npm run preview
npm run test:e2e
npm run test:report
```

Antes dos testes, instale Chromium com `npx playwright install chromium`.
Para usar Chrome já instalado no Windows:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e -- --workers=1
```

Os testes usam servidor separado na porta 5180, contextos isolados, viewports
1440 e 390, relatório HTML, JSON, screenshots e traces em falhas. As oito baselines
de início, detalhe, carrinho e pagamento estão em `tests/e2e/visual.spec.ts-snapshots`.
Use `npm run check` para validar TypeScript, lint, dependências arquiteturais e build.

## Contas fictícias

- `ana@kurio.test` / `Kurio123!`
- `bruno@kurio.test` / `Kurio123!`

Cada usuário tem uma carteira Ethereum simulada inicial. Novas contas podem
cadastrar suas próprias carteiras. Cadastro, sessão, edição de perfil, senha,
avatar, favoritos e carteiras passam pela API MSW. A senha é persistida como
hash PBKDF2 com salt; o token de sessão simulado expira após uma hora.

## Rotas

| Endereço | Conteúdo |
| --- | --- |
| `/` | Início, catálogo e conteúdo editorial |
| `/nfts/emerald-ape-042` | Detalhe de exemplo; o identificador é variável |
| `/carrinho` | Itens, quantidades, cupom e resumo |
| `/login` e `/cadastro` | Autenticação sobre a página inicial |
| `/checkout` | Dados, carteira, revisão e envio |
| `/pedidos/:id` | Recuperação do pedido e recibo |
| `/perfil` | Dados, avatar e senha |
| `/carteiras` | Cadastro e edição de carteiras |

Perfil, carteiras, checkout e pedidos verificam sessão. A autenticação preserva
o destino anterior e mescla os itens do visitante ao carrinho da conta.
O catálogo usa query string para busca, filtros, ordenação e paginação.
No deploy, configurar fallback para index.html para permitir refresh das rotas.

## Fluxo demonstrável

Abra um NFT, escolha edição e quantidade, clique Comprar. No carrinho aplique
`KURIO10` para desconto de 10%. Finalize, entre com uma conta fictícia, preencha
os dados e conecte a carteira simulada. Revise e confirme. O pedido fica pendente
antes de ser confirmado ou recusado pela API. O recibo guarda seus próprios
valores e o carrinho só remove as quantidades compradas após confirmação.

Uma tentativa de pedido usa Idempotency-Key e é persistida antes do envio.
Depois de timeout, Confirmar pedido primeiro busca a tentativa na API. O mesmo
pedido pode ser retomado por seu endereço, inclusive após refresh.

## Cenários de rede

No console do navegador, configure e depois atualize a página:

```js
localStorage.setItem('kurio.scenario', 'slow')
```

Valores: `success`, `slow`, `empty`, `offline`, `server-error`, `expired`,
`favorite-error`, `payment-refused`, `order-timeout`.

- `slow`: latência de 2 segundos e skeletons.
- `empty`: catálogo sem resultados.
- `offline` / `server-error`: falha de conexão / HTTP 503.
- `expired`: invalida sessão ao acessar um recurso autenticado.
- `favorite-error`: rollback da atualização otimista de favoritos.
- `payment-refused`: recusa o pedido, mantendo os itens no carrinho.
- `order-timeout`: resposta de criação demora 15s; Axios expira em 12s,
  permitindo recuperar a mesma tentativa sem criar outra compra.
- Cupom `EXPIRADO` e qualquer código desconhecido exercitam erros de cupom.

Para restaurar todos os dados e voltar ao cenário padrão:

```js
localStorage.setItem('kurio.scenario', 'success')
await fetch('/api/demo/reset', { method: 'POST' })
localStorage.removeItem('kurio.session-token')
location.reload()
```

A simulação persiste dados em `kurio.mock-database.v1`. As tentativas de checkout
usam chaves `kurio.checkout-attempt.<usuário>`; remova-as também para um reset
completo de uma demonstração que foi interrompida durante a compra.

## Organização e limites

Consulte ARCHITECTURE.md, API.md, SCREEN_MAP.md, docs/CODE_GUIDE.md,
docs/SECURITY.md e docs/TROUBLESHOOTING.md. Os módulos têm comentários de estudo
em português e inglês. Fontes e imagens são locais. Alguns fundos foram uniformizados
por edição de IA, com originais preservados e decisões registradas.

As nove telas estão conectadas e há adaptações entre 320 e 1440 px. Tailwind e
componentes no padrão shadcn/ui são usados com o estilo do Figma. Socket.IO passa
pelo transporte WebSocket interceptado pelo MSW; eventos atualizam o cache Query,
descartam versões antigas/duplicadas e reconciliam com REST na reconexão. Polling
de pedidos pendentes a cada três segundos complementa a recuperação.
Criadores e Aprenda apresentam “Em breve” com fundo animado; logins sociais e
explorador blockchain são explicitamente indisponíveis/simulados.

## Evidências e reprodução das auditorias

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 5191 --strictPort
# Em outro terminal, mantendo o preview aberto:
npm run audit:performance
npm run audit:lighthouse
```

O Lighthouse usa Chrome instalado, três execuções por página/perfil, cenário
padrão MSW, cache HTTP limpo por amostra e worker previamente instalado. Imagens,
fontes, animações e funcionalidades permanecem habilitadas. Consulte o relatório
consolidado em `reports/REVISAO_GERAL.md` e os dados brutos em `reports/`.
Medições locais não comprovam latência de um backend real nem segurança do deploy.

Use Node >=20.19.0. A execução registrada usa Node 20.9.0 e registra essa diferença
no ambiente; não é necessário ignorar essa condição para reproduzir em versão suportada.
