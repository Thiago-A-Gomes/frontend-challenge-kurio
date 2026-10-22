# Evidências da entrega

## Testes E2E

- [Análise: 74 testes aprovados](tests/ANALISE.md).
- [Resumo estruturado](tests/summary.json) e [resultado bruto](tests/results.json).
- [Relatório HTML completo (ZIP)](tests/html-report.zip): extraia e abra index.html.
- [Traces de falhas investigadas](tests/initial-failures): abra com npx playwright show-trace caminho-do-arquivo.zip.
- [Baselines visuais](../tests/e2e/visual.spec.ts-snapshots).

A suíte completa corresponde ao build local documentado. Verificações pontuais da publicação são registradas separadamente.

## Lighthouse

- [Medianas, LCP, CLS e TBT](lighthouse/MEDIANAS.md).
- [Condições e reprodução](lighthouse/README.md).
- [18 auditorias HTML/JSON (ZIP)](lighthouse/audit-reports.zip).
- [Resumo estruturado](lighthouse/summary.json).

Início mobile: desempenho mediano 89, abaixo da meta 90. Amostras e limitações foram preservadas.

## Revisão técnica

[Requisitos e limitações](REVISAO_GERAL.md) · [Medições de navegação](performance) · [Inspeção visual](visual-review).

Os diagnósticos e arquivos de segurança registram as condições da execução descrita na revisão; não constituem certificação contínua do site publicado.

[Verificação pontual do site publicado](tests/PUBLICACAO.md).
