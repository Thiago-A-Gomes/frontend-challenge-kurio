import fs from 'node:fs';

// PT: Produz evidência a partir do JSON real, sem converter falhas em aprovação.
// EN: Produces evidence from actual JSON without converting failures into passes.
const report = JSON.parse(fs.readFileSync('reports/tests/results.json', 'utf8'));
const rows = [];
function visit(suite, parent = '') {
  const title = [parent, suite.title].filter(Boolean).join(' / ');
  for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) {
    const last = test.results.at(-1);
    rows.push({ file: spec.file, title: spec.title, project: test.projectName, status: test.status, result: last?.status, attempts: test.results.length, durationMs: last?.duration, attachments: last?.attachments?.map(({ name, path }) => ({ name, path })) });
  }
  for (const child of suite.suites ?? []) visit(child, title);
}
for (const suite of report.suites) visit(suite);
fs.writeFileSync('reports/tests/summary.json', JSON.stringify({ stats: report.stats, projects: report.config.projects.map(({ name, use }) => ({ name, use })), tests: rows }, null, 2));
fs.writeFileSync('reports/tests/ANALISE.md', `# Testes E2E / E2E tests\n\nFonte: results.json, gerado pelo Playwright. Cada teste usa um BrowserContext novo, sem sessão ou banco herdados. Chromium, desktop 1440×900 e mobile 390×844. Cenários adicionais verificam 320, 430 e 768 px. Sem retries de testes; REST via MSW, tempo real pelo cliente Socket.IO.\n\nEsperados/aprovados: ${report.stats.expected}; falhas: ${report.stats.unexpected}; instáveis: ${report.stats.flaky}; ignorados: ${report.stats.skipped}. Duração total: ${(report.stats.duration / 1000).toFixed(1)} s.\n\n| Perfil | Teste | Resultado | Duração |\n|---|---|---|---:|\n${rows.map((row) => `| ${row.project} | ${row.title} | ${row.result} | ${(row.durationMs / 1000).toFixed(1)} s |`).join('\n')}\n\n## Controle dos cenários\n\nRelógio fixado para retomada pendente; avanço explícito de data permite a confirmação. Carrossel usa relógio controlado. Cenários MSW controlam latência variável/lenta, falhas de mutação, expiração e timeout após criação. O endpoint de demonstração publica eventos pela binding Socket.IO, sem modificar estado de componentes. O cenário de desconexão fecha o transporte e observa a reconexão do cliente.\n\n## Evidência visual e falhas\n\nOito PNGs em tests/e2e/visual.spec.ts-snapshots são as baselines versionadas. Comparam início, detalhe, carrinho e pagamento em dois viewports, fontes/imagens carregadas e animações estabilizadas. Tolerância máxima: 1% de pixels. Elas detectam regressões contra a implementação revisada; não são uma comparação automática pixel a pixel com o Figma.\n\nRelatório HTML em playwright-report/index.html; cópia distribuível em reports/tests/html-report.zip. Traces de falhas de diagnóstico preservados em initial-failures/. A execução final mantém trace em qualquer falha nova. Abra com npx playwright show-trace <arquivo.zip>. Não publique contas reais: todos os dados são fictícios.\n`);
console.log(JSON.stringify(report.stats));
