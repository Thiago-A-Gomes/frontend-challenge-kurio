import fs from 'node:fs';
import os from 'node:os';
import { chromium } from '@playwright/test';

const baseURL = process.env.AUDIT_URL || 'http://127.0.0.1:5191';
const output = 'reports/performance';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
const samples = [], requests = [];
const median = (items) => [...items].sort((a, b) => a - b)[Math.floor(items.length / 2)];
try {
  for (const width of [390, 1440]) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const pending = [];
      page.on('requestfinished', (request) => {
        if (!request.url().includes('/api/')) return;
        pending.push((async () => {
          const response = await request.response(), timing = request.timing();
          requests.push({ width, run, method: request.method(), resource: new URL(request.url()).pathname, status: response?.status(), durationMs: Math.round(timing.responseEnd) });
        })());
      });
      let start = performance.now();
      await page.goto(baseURL);
      await page.locator('.nft-grid .nft-card').nth(8).waitFor();
      samples.push({ width, run, operation: 'Início carregado (navegação completa)', durationMs: Math.round(performance.now() - start) });
      start = performance.now();
      await page.getByRole('link', { name: /^Ver detalhes de Emerald Ape #042/ }).click();
      await page.getByRole('heading', { name: 'Emerald Ape #042', exact: true }).waitFor();
      samples.push({ width, run, operation: 'Início → Detalhe (SPA)', durationMs: Math.round(performance.now() - start) });
      start = performance.now();
      await page.getByRole('button', { name: 'Comprar', exact: true }).click();
      await page.getByRole('heading', { name: 'Resumo da carteira' }).waitFor();
      await page.locator('.summary-total dd').waitFor();
      samples.push({ width, run, operation: 'Detalhe → Carrinho (mutação + SPA + cotação)', durationMs: Math.round(performance.now() - start) });
      await Promise.all(pending); await context.close();
    }
  }
} finally { await browser.close(); }
const groups = [...new Set(samples.map((s) => `${s.width}|${s.operation}`))].map((key) => {
  const [width, operation] = key.split('|'), values = samples.filter((s) => s.width === Number(width) && s.operation === operation).map((s) => s.durationMs);
  return { width: Number(width), operation, medianMs: median(values), minMs: Math.min(...values), maxMs: Math.max(...values) };
});
const apiGroups = [...new Set(requests.map((s) => `${s.method} ${s.resource}`))].map((resource) => {
  const values = requests.filter((s) => `${s.method} ${s.resource}` === resource && s.durationMs >= 0).map((s) => s.durationMs);
  return { resource, samples: values.length, medianMs: values.length ? median(values) : null };
});
const report = { date: new Date().toISOString(), environment: { node: process.version, platform: os.platform(), cpu: os.cpus()[0]?.model, baseURL, browser: 'Chrome headless', throttling: 'nenhum', mockDelayMs: 180 }, samples, requests, navigation: groups, api: apiGroups };
fs.writeFileSync(`${output}/measurements.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${output}/RESULTADOS.md`, `# Tempos observados\n\nBuild otimizado, Chrome headless, sem limitação artificial de CPU/rede. Três contextos novos por viewport. A API usa MSW com atraso configurado de 180 ms; estes números não medem um servidor real. As navegações incluem a interação automatizada e a espera pelo conteúdo.\n\n| Largura | Operação | Mediana | Mínimo | Máximo |\n|---|---|---:|---:|---:|\n${groups.map((s) => `| ${s.width}px | ${s.operation} | ${s.medianMs} ms | ${s.minMs} ms | ${s.maxMs} ms |`).join('\n')}\n\n## Requisições\n\nTempos do navegador; valores indisponíveis do Service Worker são excluídos.\n\n| Recurso | Amostras | Mediana |\n|---|---:|---:|\n${apiGroups.map((s) => `| ${s.resource} | ${s.samples} | ${s.medianMs ?? 'n/d'} ms |`).join('\n')}\n\nDetalhes e ambiente em measurements.json.\n`);
console.log(JSON.stringify(groups));
