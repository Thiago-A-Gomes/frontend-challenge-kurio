# Arquitetura / Architecture

## Estrutura / Structure

```text
src/
  app/                 provedores e roteador / providers and router
  pages/               telas e coordenação / screens and orchestration
  widgets/layout/      cabeçalho, rodapé e navegação / header, footer and navigation
  features/
    account/           sessão, perfil e carteiras / session, profile and wallets
    catalog/           catálogo, busca, filtros e favoritos / catalog, search, filters and favorites
    cart/              carrinho e cotação / cart and quote
    realtime/          Socket.IO e reconciliação / Socket.IO and reconciliation
  shared/
    api/               Axios, contratos, eventos e cache / Axios, contracts, events and cache
    lib/               ETH/BigInt, media queries e classes / ETH/BigInt, media queries and classes
    model/             modelos compartilhados / shared models
    ui/                controles reutilizáveis / reusable controls
    types/             contratos de interface / UI contracts
  mocks/               REST, WebSocket, banco e fixtures / REST, WebSocket, database and fixtures
  styles/              base e adaptação mobile / base and mobile styles
scripts/               arquitetura e auditorias / architecture and audits
tests/e2e/             fluxos, recuperação, segurança e visual / flows, recovery, security and visuals
docs/                  documentação PT/EN / PT/EN documentation
reports/               evidências geradas / generated evidence
```

## Dependências / Dependencies

`main → app → pages → widgets → features → shared`

PT: `shared` não importa app/pages/widgets/features/mocks. Features não importam páginas, widgets ou mocks. Somente o bootstrap importa a simulação; a interface recebe respostas pela rede. `npm run check:architecture` verifica essas fronteiras e rejeita sinks como eval e HTML dinâmico. Não adicionamos camadas de repositório/fábrica por chamada HTTP, que duplicariam Query/Axios sem benefício neste escopo.

EN: Shared modules never import upper layers. Features never import pages, widgets or mocks. Only bootstrap imports simulation; UI receives network responses. The architecture check enforces boundaries and rejects dynamic execution/HTML sinks. Repository/factory layers per HTTP call were avoided because they would duplicate Query/Axios without a benefit in this scope.

## Estado, cache e compra / State, cache and purchase

PT: Páginas secundárias usam React.lazy e imports dinâmicos. O bootstrap mostra preparação e monta a aplicação após instalar MSW; `shared/api/readiness` também protege Axios e Socket.IO. Os estilos das páginas são importados antes das regras mobile para manter a cascata determinística, independentemente da ordem de navegação. Fonte WOFF2 com Latin/símbolos e fallback completo preserva caracteres; imagens editoriais reutilizam WebPs do catálogo.

EN: Secondary pages use React.lazy and dynamic imports. Bootstrap shows preparation and mounts the app after MSW starts; transport readiness also gates Axios and Socket.IO. Page styles precede mobile overrides so navigation order cannot change the cascade. WOFF2 subsets retain a full-character fallback; editorial imagery reuses catalog WebPs.

PT: Router controla rota e filtros na URL. Query controla estado remoto; componentes controlam edições e diálogos. Cache válido por 15 s e coletado após 5 min sem observadores. Uma tentativa extra para falhas transitórias de consultas; 400/401/403/404/409 não repetem. Mutações não repetem automaticamente. Favoritos usam atualização otimista com rollback. Cancelamento usa AbortSignal. Login/logout cancelam consultas e removem dados privados sem desligar o observador da sessão. Um 401 de token antigo não apaga sessão nova.

EN: Router owns route/search state; Query owns remote state; components own drafts/dialogs. Cache freshness is 15 s, inactive retention 5 min. Queries retry one transient failure but not business/auth errors; mutations never retry automatically. Favorites use optimistic rollback. AbortSignal cancels obsolete work. Session replacement clears private cache while retaining its observer; stale-token 401s cannot terminate newer sessions.

PT: Axios centraliza REST e credenciais da origem. ETH trafega como string e é calculado por BigInt nos handlers. Carrinhos de visitante e usuário são combinados no login. Cotação tem dono, validade e assinatura. Checkout revalida valores/estoque e exige revisão após mudança. Tentativa conserva chave de idempotência após timeout. O recibo conserva snapshot; não usa preços atuais do catálogo.

EN: Axios centralizes same-origin REST and credentials. ETH uses decimal strings and handler-side BigInt calculations. Guest/user carts merge on login. Quotes have ownership, expiry and a signature. Checkout revalidates and requires another review after changes. Attempts preserve idempotency keys after timeout. Receipts use immutable snapshots instead of current prices.

## Tempo real / Realtime

PT: MSW intercepta WebSocket; a binding implementa frames Socket.IO para o cliente real socket.io-client. O import do cliente ocorre depois da instalação dos interceptadores. Eventos têm eventId, recurso e versão; pedidos incluem dono. O cliente descarta eventos duplicados/antigos, não regride estados terminais e reconcilia REST após reconectar. Cleanup remove listeners e conexões da sessão anterior. Não há servidor real ou durabilidade de eventos.

EN: MSW intercepts WebSocket and the binding supplies Socket.IO frames to the real client. Client import occurs after interceptor installation. Event IDs, resources, versions and order ownership prevent duplicate/stale updates. REST reconciliation and cleanup handle reconnect/session changes. This mock has no real server or durable event log.

## Interface e assets / Interface and assets

PT: Fonte Roboto Mono e imagens são locais. PNGs originais preservados; entrega usa WebP de até 900 px. Algumas artes tiveram fundos uniformizados por IA anteriormente e podem diferir do Figma. Mobile usa colunas fluidas, filtros em diálogo nativo, navegação compacta e autenticação em tela inteira, mantendo as funcionalidades. Foco, Escape, labels, feedback e movimento reduzido são preservados. Autofill mantém a paleta escura sem desabilitar gerenciadores de senha.

EN: Fonts/images are local. Original PNGs remain; delivery uses WebP up to 900 px. Earlier AI background adjustments may differ from Figma. Mobile uses fluid columns, native filter dialogs, compact navigation and full-screen auth without dropping features. Focus, Escape, labels, feedback, reduced motion and password-manager compatibility are preserved.

PT: Criadores e Aprenda exibem Em breve com fundo animado. Artigos, suporte e login social não aparentam sucesso funcional. Carteiras, pagamento e explorador são explicitamente simulados. Totais do Figma não são fixados na UI. O catálogo adicional é fictício para exercitar quatro páginas.

EN: Creators/Learn show coming-soon screens. Editorial/support/social actions do not pretend to succeed. Wallets, payments and explorer are explicitly simulated. Reference totals are not hardcoded. Additional catalog entries are fictional pagination fixtures.

## Documentação e evidências / Documentation and evidence

- [Módulos / Modules](docs/CODE_GUIDE.md)
- [Segurança / Security](docs/SECURITY.md)
- [Reparos / Troubleshooting](docs/TROUBLESHOOTING.md)
- [Tempos observados / Observed timings](reports/performance/RESULTADOS.md)
- [Revisão geral / General review](reports/REVISAO_GERAL.md)

PT: Um build aprovado não comprova todos os comportamentos. Testes, baselines e auditorias registram evidências; segurança de produção exige backend confiável.

EN: A passing build does not prove all behavior. Tests, baselines and audits provide evidence; production security requires a trusted backend.
