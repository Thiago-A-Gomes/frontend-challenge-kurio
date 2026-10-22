# Tempos observados

Build otimizado, Chrome headless, sem limitação artificial de CPU/rede. Três contextos novos por viewport. A API usa MSW com atraso configurado de 180 ms; estes números não medem um servidor real. As navegações incluem a interação automatizada e a espera pelo conteúdo.

| Largura | Operação | Mediana | Mínimo | Máximo |
|---|---|---:|---:|---:|
| 390px | Início carregado (navegação completa) | 446 ms | 419 ms | 486 ms |
| 390px | Início → Detalhe (SPA) | 60 ms | 57 ms | 71 ms |
| 390px | Detalhe → Carrinho (mutação + SPA + cotação) | 1773 ms | 1771 ms | 1868 ms |
| 1440px | Início carregado (navegação completa) | 444 ms | 427 ms | 463 ms |
| 1440px | Início → Detalhe (SPA) | 47 ms | 45 ms | 55 ms |
| 1440px | Detalhe → Carrinho (mutação + SPA + cotação) | 1760 ms | 1755 ms | 1858 ms |

## Requisições

Tempos do navegador; valores indisponíveis do Service Worker são excluídos.

| Recurso | Amostras | Mediana |
|---|---:|---:|
| GET /api/session | 6 | 260 ms |
| GET /api/nfts | 6 | 259 ms |
| GET /api/collections | 6 | 259 ms |
| GET /api/cart | 12 | 199 ms |
| GET /api/nfts/emerald-ape-042 | 6 | 202 ms |
| GET /api/nfts/emerald-ape-042/related | 6 | 202 ms |
| POST /api/cart/items | 6 | 198 ms |
| GET /api/recommendations | 6 | 193 ms |
| POST /api/quotes | 6 | 196 ms |

Detalhes e ambiente em measurements.json.
