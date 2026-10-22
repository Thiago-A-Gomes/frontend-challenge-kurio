# Tempos observados

Build otimizado, Chrome headless, sem limitação artificial de CPU/rede. Três contextos novos por viewport. A API usa MSW com atraso configurado de 180 ms; estes números não medem um servidor real. As navegações incluem a interação automatizada e a espera pelo conteúdo.

| Largura | Operação | Mediana | Mínimo | Máximo |
|---|---|---:|---:|---:|
| 390px | Início carregado (navegação completa) | 464 ms | 450 ms | 580 ms |
| 390px | Início → Detalhe (SPA) | 33 ms | 32 ms | 65 ms |
| 390px | Detalhe → Carrinho (mutação + SPA + cotação) | 1754 ms | 1743 ms | 1768 ms |
| 1440px | Início carregado (navegação completa) | 450 ms | 448 ms | 453 ms |
| 1440px | Início → Detalhe (SPA) | 44 ms | 34 ms | 51 ms |
| 1440px | Detalhe → Carrinho (mutação + SPA + cotação) | 1759 ms | 1742 ms | 1774 ms |

## Requisições

Tempos do navegador; valores indisponíveis do Service Worker são excluídos.

| Recurso | Amostras | Mediana |
|---|---:|---:|
| GET /api/session | 6 | 255 ms |
| GET /api/nfts | 6 | 255 ms |
| GET /api/collections | 6 | 255 ms |
| GET /api/cart | 12 | 193 ms |
| GET /api/nfts/emerald-ape-042 | 6 | 194 ms |
| GET /api/nfts/emerald-ape-042/related | 6 | 199 ms |
| POST /api/cart/items | 6 | 198 ms |
| GET /api/recommendations | 6 | 188 ms |
| POST /api/quotes | 6 | 193 ms |

Detalhes e ambiente em measurements.json.
