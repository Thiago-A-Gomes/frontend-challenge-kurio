# Lighthouse — três execuções por página e perfil

Perfis padrão mobile e preset desktop. Build otimizado, imagens/fontes locais e MSW ativos. Service Worker previamente instalado; mocks restaurados e cache HTTP limpo antes de cada execução. Contexto sem extensões. Nenhuma auditoria com erro de coleta é aceita. Auditado localmente; não equivale a condições reais de todos os dispositivos.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| inicio | mobile | 89 | 100 | 100 | 100 | 3335 | 0.000 | 32 |
| inicio | desktop | 99 | 100 | 100 | 100 | 767 | 0.000 | 0 |
| detalhe | mobile | 90 | 97 | 100 | 100 | 3237 | 0.012 | 0 |
| detalhe | desktop | 100 | 97 | 100 | 100 | 735 | 0.007 | 0 |
| criadores | mobile | 91 | 100 | 100 | 100 | 3156 | 0.000 | 7 |
| criadores | desktop | 100 | 100 | 100 | 100 | 706 | 0.000 | 0 |

Metas: 90 / 95 / 95 / 90. Relatórios individuais HTML/JSON e dados brutos acompanham este arquivo.
