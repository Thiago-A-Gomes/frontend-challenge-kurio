import fs from 'node:fs';
import os from 'node:os';
import net from 'node:net';
import { createHash } from 'node:crypto';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { chromium } from '@playwright/test';
import puppeteer from 'puppeteer-core';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:5191';
const folder = 'reports/lighthouse'; fs.mkdirSync(folder, { recursive: true });
const startedAt = new Date().toISOString();
fs.writeFileSync(`${folder}/run-status.json`, JSON.stringify({ startedAt, complete: false }, null, 2));
const build = fs.readdirSync('dist/assets').map((name) => ({ name, sha256: createHash('sha256').update(fs.readFileSync(`dist/assets/${name}`)).digest('hex') }));
const port = process.env.LIGHTHOUSE_PORT ? Number(process.env.LIGHTHOUSE_PORT) : await new Promise((resolve, reject) => {
  const server = net.createServer(); server.once('error', reject);
  server.listen(0, '127.0.0.1', () => { const address = server.address(); server.close(() => resolve(address.port)); });
});
const chrome = await chromium.launch({ channel: 'chrome', headless: true, args: [`--remote-debugging-port=${port}`] });
const browserVersion = chrome.version();
const controller = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}` });
const context = await controller.createBrowserContext();
// PT: Instala o worker em navegação normal antes de o Lighthouse controlar o carregamento.
// EN: Installs the worker during normal navigation before Lighthouse controls loading.
const warmup = await context.newPage();
warmup.on('console', (message) => { if (message.type() === 'error') console.error('Navegador:', message.text()); });
const runs = [];
const invalidAttempts = [];
try {
  await warmup.goto(base);
  try { await warmup.waitForSelector('.nft-grid .nft-card:nth-child(9)'); }
  catch (error) { console.error('Falha de pré-validação:', await warmup.evaluate(() => document.body.innerText)); throw error; }
  for (const page of [{ name: 'inicio', path: '/' }, { name: 'detalhe', path: '/nfts/emerald-ape-042' }, { name: 'criadores', path: '/criadores' }]) {
    for (const profile of ['mobile', 'desktop']) {
      for (let run = 1; run <= 3; run++) {
        // PT: Cada amostra restaura os mocks e esvazia o cache HTTP, mantendo só o worker instalado.
        // EN: Each sample resets mocks and HTTP cache, retaining only the installed worker.
        await warmup.goto(base);
        await warmup.waitForSelector('.nft-grid .nft-card:nth-child(9)');
        await warmup.evaluate(async () => { localStorage.removeItem('kurio.scenario'); localStorage.removeItem('kurio.session-token'); sessionStorage.clear(); await fetch('/api/demo/reset', { method: 'POST' }); });
        await warmup.goto('about:blank');
        const cdp = await warmup.createCDPSession();
        await cdp.send('Network.clearBrowserCache'); await cdp.detach();
        let result;
        for (let attempt = 1; attempt <= 3; attempt++) {
          const target = await context.newPage();
          const session = await target.createCDPSession();
          try {
            await session.send('Network.enable');
            await session.send('Network.clearBrowserCache');
            await session.send('Network.setCacheDisabled', { cacheDisabled: true });
            result = await lighthouse(`${base}${page.path}`, { port, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], disableStorageReset: true, }, profile === 'desktop' ? desktopConfig : undefined, target);
            const failures = Object.values(result.lhr.audits).filter((audit) => audit.scoreDisplayMode === 'error');
            if (!result.lhr.runtimeError && !failures.length) {
              await target.waitForSelector(page.name === 'inicio' ? '.nft-grid .nft-card' : page.name === 'detalhe' ? '.nft-detail-price' : '.coming-soon h1');
              break;
            }
            // PT: Repete apenas coleta inválida, nunca pontuação baixa; preserva o diagnóstico.
            // EN: Retries only invalid collection, never low scores; retains diagnostics.
            const reason = { page: page.name, profile, run, attempt, runtime: result.lhr.runtimeError, audits: failures.map(({ id, errorMessage }) => ({ id, errorMessage })) };
            invalidAttempts.push(reason);
            fs.mkdirSync(`${folder}/diagnostics`, { recursive: true });
            fs.writeFileSync(`${folder}/diagnostics/${page.name}-${profile}-${run}-${attempt}.json`, result.report[1]);
            if (attempt === 3) throw new Error(`Coleta inválida após três tentativas: ${JSON.stringify(reason)}`);
            console.log(`Coleta inválida ${page.name}/${profile}/${run}; nova aba para tentativa ${attempt + 1}.`);
          } finally { await session.detach(); await target.close(); }
        }
        const lcpLabel = JSON.stringify(result.lhr.audits['largest-contentful-paint-element']?.details ?? {});
        const collectionErrors = Object.values(result.lhr.audits).filter((audit) => audit.scoreDisplayMode === 'error');
        if (result.lhr.runtimeError || collectionErrors.length) throw new Error(`Coleta inválida: ${JSON.stringify({ runtime: result.lhr.runtimeError, audits: collectionErrors.map((audit) => ({ id: audit.id, error: audit.errorMessage })) })}`);
        if (lcpLabel.includes('Não foi possível iniciar')) throw new Error('Auditoria inválida: aplicação não iniciou. Nenhuma pontuação desta execução será aceita.');
        const name = `${page.name}-${profile}-${run}`;
        fs.writeFileSync(`${folder}/${name}.html`, result.report[0]); fs.writeFileSync(`${folder}/${name}.json`, result.report[1]);
        const lhr = result.lhr;
        const entry = { page: page.name, profile, run, version: lhr.lighthouseVersion, scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)])), lcpMs: lhr.audits['largest-contentful-paint'].numericValue, cls: lhr.audits['cumulative-layout-shift'].numericValue, tbtMs: lhr.audits['total-blocking-time'].numericValue };
        runs.push(entry); console.log(JSON.stringify(entry));
      }
    }
  }
} finally { await context.close(); await controller.disconnect(); await chrome.close(); }
const median = (values) => [...values].sort((a, b) => a - b)[1];
const medians = [...new Set(runs.map((r) => `${r.page}|${r.profile}`))].map((key) => {
  const group = runs.filter((r) => `${r.page}|${r.profile}` === key);
  return { page: group[0].page, profile: group[0].profile, scores: Object.fromEntries(Object.keys(group[0].scores).map((category) => [category, median(group.map((r) => r.scores[category]))])), lcpMs: median(group.map((r) => r.lcpMs)), cls: median(group.map((r) => r.cls)), tbtMs: median(group.map((r) => r.tbtMs)) };
});
const tooling = JSON.parse(fs.readFileSync('package.json', 'utf8')).devDependencies;
fs.writeFileSync(`${folder}/summary.json`, JSON.stringify({ date: new Date().toISOString(), startedAt, complete: true, configurationVersion: 4, environment: { node: process.version, chrome: browserVersion, lighthouse: tooling.lighthouse, puppeteer: tooling['puppeteer-core'], playwright: tooling['@playwright/test'], platform: os.platform(), cpu: os.cpus()[0]?.model, base, cache: 'HTTP cleared before every sample; Service Worker preinstalled', mocks: 'reset before every sample; default scenario; 180ms latency' }, build, invalidAttempts, runs, medians }, null, 2));
fs.writeFileSync(`${folder}/run-status.json`, JSON.stringify({ startedAt, complete: true, samples: runs.length }, null, 2));
fs.writeFileSync(`${folder}/MEDIANAS.md`, `# Lighthouse — três execuções por página e perfil\n\nPerfis padrão mobile e preset desktop. Build otimizado, imagens/fontes locais e MSW ativos. Service Worker previamente instalado; mocks restaurados e cache HTTP limpo antes de cada execução. Contexto sem extensões. Nenhuma auditoria com erro de coleta é aceita. Auditado localmente; não equivale a condições reais de todos os dispositivos.\n\n| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |\n|---|---|---:|---:|---:|---:|---:|---:|---:|\n${medians.map((m) => `| ${m.page} | ${m.profile} | ${m.scores.performance} | ${m.scores.accessibility} | ${m.scores['best-practices']} | ${m.scores.seo} | ${Math.round(m.lcpMs)} | ${m.cls.toFixed(3)} | ${Math.round(m.tbtMs)} |`).join('\n')}\n\nMetas: 90 / 95 / 95 / 90. Relatórios individuais HTML/JSON e dados brutos acompanham este arquivo.\n`);
