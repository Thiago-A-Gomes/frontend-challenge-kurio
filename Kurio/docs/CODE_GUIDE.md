# Guia do código / Code guide

Cada módulo possui comentário PT/EN. Comentários explicam responsabilidades e limites; o código e os testes são a fonte executável do comportamento.

Each module has a PT/EN comment. Comments explain responsibilities and boundaries; code and tests remain the executable source of behavior.

| Arquivo / File | Português | English |
|---|---|---|
| `src/app/App.tsx` | Conecta provedores e expiração de sessão; não contém regras financeiras. | Connects providers and session expiry; it contains no pricing rules. |
| `src/app/router.tsx` | Define rotas tipadas, filtros na URL e proteção dos fluxos autenticados. | Defines typed routes, URL filters and guards for authenticated flows. |
| `src/features/account/api.ts` | Encapsula consultas e mutações do recurso com chaves de cache e invalidação. | Encapsulates resource queries and mutations with cache keys and invalidation. |
| `src/features/cart/api.ts` | Encapsula consultas e mutações do recurso com chaves de cache e invalidação. | Encapsulates resource queries and mutations with cache keys and invalidation. |
| `src/features/cart/components/CartItemRow.tsx` | Associa preços e quantidades ao item correto e envia mudanças sem recalcular totais. | Associates amounts and quantities with the correct item and sends changes without recomputing totals. |
| `src/features/catalog/api.ts` | Encapsula consultas e mutações do recurso com chaves de cache e invalidação. | Encapsulates resource queries and mutations with cache keys and invalidation. |
| `src/features/catalog/components/CatalogFilters.tsx` | Combina rede e preço na URL; os dois marcadores continuam acessíveis por teclado. | Combines network and price in the URL; both slider handles remain keyboard-accessible. |
| `src/features/catalog/components/CollectionRecommendations.tsx` | Compartilha a apresentação de recomendações entre carrinho e detalhe. | Shares recommendation presentation between cart and detail pages. |
| `src/features/catalog/components/FeaturedNft.tsx` | Reutiliza a arte de destaque local e aponta para um NFT existente. | Reuses local featured artwork and links to an existing NFT. |
| `src/features/catalog/components/Marketplace.tsx` | Apresenta dados recebidos por props; filtros mobile usam diálogo com foco nativo. | Presents data received through props; mobile filters use a native focus-managed dialog. |
| `src/features/catalog/components/NftCard.tsx` | Liga uma arte ao detalhe correto e apresenta texto escapado pelo React. | Links artwork to its detail page and displays text escaped by React. |
| `src/features/catalog/components/NftGallery.tsx` | Seleciona miniaturas e amplia a arte em diálogo nativo com fechamento por Escape. | Selects thumbnails and enlarges artwork in a native dialog closed with Escape. |
| `src/features/catalog/components/NftInformation.tsx` | Implementa abas por teclado e carrega avaliações somente quando necessárias. | Implements keyboard tabs and loads reviews only when needed. |
| `src/features/catalog/components/NftPurchaseOptions.tsx` | Controla edição e quantidade, respeita estoque e aguarda a API antes de comprar. | Controls edition and quantity, respects stock and awaits the API before purchase. |
| `src/features/catalog/model/collection.ts` | Descreve a identidade e a contagem de uma coleção do catálogo. | Describes catalog collection identity and count. |
| `src/features/catalog/model/nft.ts` | Define ou reexporta o modelo visual compartilhado de um NFT. | Defines or re-exports the shared NFT presentation model. |
| `src/features/catalog/search.ts` | Normaliza parâmetros da URL e limita entradas antes de consultar a API. | Normalizes URL parameters and bounds input before querying the API. |
| `src/features/realtime/useRealtime.ts` | Isola a conexão por sessão, descarta versões antigas e reconcilia o cache ao reconectar. | Scopes the connection to a session, rejects old versions and reconciles cache on reconnect. |
| `src/main.tsx` | Mostra preparação, instala MSW e monta a aplicação; fixa a ordem dos estilos mobile. | Shows preparation, starts MSW and mounts the app; stabilizes mobile style order. |
| `src/shared/api/readiness.ts` | Impede REST e Socket.IO antes da instalação do worker. | Gates REST and Socket.IO until worker installation completes. |
| `src/mocks/fixtures/reviews.ts` | Fornece avaliações fictícias variadas e determinísticas. | Provides varied deterministic fictional reviews. |
| `src/mocks/browser.ts` | Registra interceptadores HTTP e WebSocket somente quando os mocks estão habilitados. | Registers HTTP and WebSocket interceptors only when mocks are enabled. |
| `src/mocks/database.ts` | Persiste somente o cenário fictício e migra dados sem alterar snapshots de pedidos. | Persists the fictional scenario and migrates data without changing order snapshots. |
| `src/mocks/events.ts` | Descreve ou distribui eventos da simulação; a UI recebe eventos pela conexão Socket.IO. | Describes or distributes simulation events; the UI receives events over Socket.IO. |
| `src/mocks/fixtures/catalog.ts` | Fixtures locais do Figma e itens fictícios adicionais para exercitar paginação. | Local Figma fixtures and additional fictional items for exercising pagination. |
| `src/mocks/fixtures/collections.ts` | Fixtures de coleções usadas somente na camada de simulação. | Collection fixtures used only by the simulation layer. |
| `src/mocks/fixtures/nftDetails.ts` | Cria descrições simuladas coerentes com os dados visuais de cada NFT. | Creates mock descriptions consistent with each NFT presentation record. |
| `src/mocks/handlers.ts` | Implementa contratos REST simulados com validação, autorização e idempotência. | Implements mocked REST contracts with validation, authorization and idempotency. |
| `src/mocks/socket.ts` | Adapta MSW ao protocolo Socket.IO e filtra eventos privados pela sessão inscrita. | Adapts MSW to Socket.IO and filters private events using the subscribed session. |
| `src/mocks/validation.ts` | Valida o limite de confiança da simulação; produção exige as mesmas defesas no servidor. | Validates the simulation trust boundary; production needs the same defenses on the server. |
| `src/pages/account/ProfilePage.tsx` | Salva dados e senha de forma validada; avatar aceita formatos e tamanho limitados. | Saves validated profile/password changes; avatars have limited types and size. |
| `src/pages/account/WalletsPage.tsx` | Cadastra e edita carteiras por usuário, mantendo seleção principal e secundária. | Creates and edits user-scoped wallets, preserving primary and secondary selection. |
| `src/pages/auth/AuthPage.tsx` | Valida login/cadastro e retorna apenas a destinos internos permitidos. | Validates login/registration and returns only to allowed internal destinations. |
| `src/pages/cart/CartPage.tsx` | Exibe o carrinho e a cotação fornecidos pela API; não recalcula valores na UI. | Displays API cart and quote data; it never recalculates amounts in the UI. |
| `src/pages/checkout/CheckoutPage.tsx` | Revisa dados e revalida a cotação antes de enviar uma tentativa idempotente. | Reviews collector data and revalidates the quote before sending an idempotent attempt. |
| `src/pages/ComingSoonPage.tsx` | Informa conteúdo ainda não disponível e anima apenas o fundo decorativo. | Explains unavailable content and animates only the decorative background. |
| `src/pages/home/components/Hero.tsx` | Alterna artes a cada três segundos, com cleanup do timer e respeito a movimento reduzido. | Cycles artwork every three seconds, cleaning up timers and respecting reduced motion. |
| `src/pages/home/components/MintJournal.tsx` | Apresenta prévias editoriais; a entrega não inclui um sistema de publicação. | Presents editorial previews; the deliverable does not include a publishing system. |
| `src/pages/home/components/PromotionalBanners.tsx` | Apresenta chamadas visuais e destinos explícitos, sem simular lançamentos reais. | Presents visual calls to action and explicit destinations without simulating real launches. |
| `src/pages/home/HomePage.tsx` | Consulta o catálogo e compõe o início preservando filtros e paginação. | Loads the catalog and composes home while preserving filters and pagination. |
| `src/pages/nft-details/NftDetailsPage.tsx` | Compõe galeria, compra, informações e recomendações a partir do contrato REST. | Composes gallery, purchase controls, information and recommendations from the REST contract. |
| `src/pages/order/OrderPage.tsx` | Exibe o snapshot imutável do pedido e recupera estados pendentes após atualização. | Displays the immutable order snapshot and recovers pending states after reload. |
| `src/shared/api/client.ts` | Centraliza Axios, cabeçalhos, timeout e tratamento de sessão sem registrar credenciais. | Centralizes Axios, headers, timeouts and session handling without logging credentials. |
| `src/shared/api/contracts.ts` | Contratos de transporte: ETH é string decimal e quantidades são inteiras. | Transport contracts: ETH uses decimal strings and quantities are integers. |
| `src/shared/api/events.ts` | Descreve ou distribui eventos da simulação; a UI recebe eventos pela conexão Socket.IO. | Describes or distributes simulation events; the UI receives events over Socket.IO. |
| `src/shared/api/queryClient.ts` | Define validade do cache e tentativas; mutações não repetem automaticamente. | Defines cache freshness and retries; mutations never retry automatically. |
| `src/shared/lib/eth.ts` | Converte ETH para unidades inteiras BigInt, evitando arredondamento financeiro. | Converts ETH to integer BigInt units, avoiding financial rounding errors. |
| `src/shared/lib/useMediaQuery.ts` | Reage à largura, orientação e preferências sem depender de modelos de dispositivos. | Responds to width, orientation and preferences without device-model checks. |
| `src/shared/lib/utils.ts` | Combina classes condicionais e resolve conflitos de utilitários Tailwind. | Merges conditional classes and resolves conflicting Tailwind utilities. |
| `src/shared/model/nft.ts` | Define ou reexporta o modelo visual compartilhado de um NFT. | Defines or re-exports the shared NFT presentation model. |
| `src/shared/types/feedback.ts` | Define o contrato de mensagens para ações auxiliares fora do escopo. | Defines the feedback contract for auxiliary out-of-scope actions. |
| `src/shared/ui/button.tsx` | Padroniza variantes e foco; Radix Slot permite reutilizar o estilo em links. | Standardizes variants and focus; Radix Slot reuses button styling for links. |
| `src/shared/ui/FinancialSummary.tsx` | Formata os valores já calculados pela API, sem operações em ponto flutuante. | Formats amounts already calculated by the API, without floating-point arithmetic. |
| `src/shared/ui/input.tsx` | Compartilha aparência e referência de campos sem substituir a validação nativa. | Shares field appearance and refs without replacing native validation. |
| `src/shared/ui/LoadingState.tsx` | Anuncia carregamento e reserva espaço enquanto a consulta está pendente. | Announces loading and reserves space while a query is pending. |
| `src/shared/ui/PasswordInput.tsx` | Alterna a visibilidade da senha sem desabilitar o gerenciador de senhas. | Toggles password visibility without disabling password managers. |
| `src/widgets/layout/AccountIcon.tsx` | Desenha ícones locais sem carregar scripts ou imagens externas. | Draws local icons without loading external scripts or images. |
| `src/widgets/layout/AccountLayout.tsx` | Organiza a navegação da conta e efetua logout com limpeza dos dados privados. | Organizes account navigation and logs out while clearing private data. |
| `src/widgets/layout/AppLayout.tsx` | Compõe cabeçalho e rodapé comuns; páginas escolhem seu próprio conteúdo. | Composes shared header and footer; pages provide their own content. |
| `src/widgets/layout/footer/SiteFooter.tsx` | Renderiza links, benefícios e newsletter sem aparentar sucesso de ações fora do escopo. | Renders links, benefits and newsletter without pretending out-of-scope actions succeeded. |
| `src/widgets/layout/Header.tsx` | Mantém links e item ativo consistentes, com menu acessível em telas pequenas. | Keeps links and active navigation consistent, with an accessible small-screen menu. |
| `src/widgets/layout/MobileNavigation.tsx` | Oferece acesso rápido ao início, conta e carrinho no layout mobile. | Provides quick access to home, account and cart in the mobile layout. |
| `src/widgets/layout/navigation.ts` | Calcula um único item ativo a partir da rota e da âncora. | Computes a single active item from the route and anchor. |
| `src/widgets/layout/SocialIcon.tsx` | Fornece símbolos SVG locais para os links e botões sociais. | Provides local SVG symbols for social links and buttons. |
