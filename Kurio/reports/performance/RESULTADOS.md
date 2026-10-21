# Tempos observados

Build otimizado, Chrome headless, sem limitação artificial de CPU/rede. Três contextos novos por viewport. A API usa MSW com atraso configurado de 180 ms; estes números não medem um servidor real. As navegações incluem a interação automatizada e a espera pelo conteúdo.

| Largura | Operação | Mediana | Mínimo | Máximo |
|---|---|---:|---:|---:|
| 390px | Início carregado (navegação completa) | 941 ms | 940 ms | 1084 ms |
| 390px | Início → Detalhe (SPA) | 43 ms | 40 ms | 46 ms |
| 390px | Detalhe → Carrinho (mutação + SPA + cotação) | 1064 ms | 1052 ms | 1075 ms |
| 1440px | Início carregado (navegação completa) | 998 ms | 961 ms | 1016 ms |
| 1440px | Início → Detalhe (SPA) | 58 ms | 55 ms | 124 ms |
| 1440px | Detalhe → Carrinho (mutação + SPA + cotação) | 1087 ms | 1069 ms | 1102 ms |

## Requisições

Tempos do navegador; valores indisponíveis do Service Worker são excluídos.

| Recurso | Amostras | Mediana |
|---|---:|---:|
| GET /api/session | 6 | 267 ms |
| GET /api/nfts | 6 | 266 ms |
| GET /api/collections | 6 | 266 ms |
| GET /api/cart | 12 | 206 ms |
| GET /api/nfts/emerald-ape-042 | 6 | 202 ms |
| GET /api/nfts/emerald-ape-042/related | 6 | 197 ms |
| POST /api/cart/items | 6 | 198 ms |
| GET /api/recommendations | 6 | 196 ms |
| POST /api/quotes | 6 | 204 ms |

Detalhes e ambiente em measurements.json.
