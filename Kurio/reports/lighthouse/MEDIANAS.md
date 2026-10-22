# Lighthouse — três execuções por página e perfil

Perfis padrão mobile e preset desktop. Build otimizado, imagens/fontes locais e MSW ativos. Service Worker previamente instalado; mocks restaurados e cache HTTP limpo antes de cada execução. Contexto sem extensões. Nenhuma auditoria com erro de coleta é aceita. Auditado localmente; não equivale a condições reais de todos os dispositivos.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| inicio | mobile | 89 | 100 | 100 | 100 | 3327 | 0.000 | 30 |
| inicio | desktop | 99 | 100 | 100 | 100 | 780 | 0.000 | 0 |
| detalhe | mobile | 90 | 97 | 100 | 100 | 3239 | 0.012 | 0 |
| detalhe | desktop | 100 | 97 | 100 | 100 | 737 | 0.007 | 0 |
| criadores | mobile | 78 | 100 | 100 | 100 | 3159 | 0.253 | 6 |
| criadores | desktop | 89 | 100 | 100 | 100 | 701 | 0.226 | 0 |

Metas: 90 / 95 / 95 / 90. Relatórios individuais HTML/JSON e dados brutos acompanham este arquivo.
