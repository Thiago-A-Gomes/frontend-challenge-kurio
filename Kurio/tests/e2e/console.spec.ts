import { expect, test } from '@playwright/test';

// PT: Navegador sem extensões distingue erros da aplicação de scripts externos.
// EN: An extension-free browser distinguishes application errors from external scripts.
test('fluxo principal não registra erro React, exceção ou recurso estático quebrado', async ({ page, context }, testInfo) => {
  const errors: string[] = [], failedAssets: string[] = [], deprecated: unknown[] = [], warnings: unknown[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning' || message.type() === 'warn') {
      const warning = { text: message.text(), location: message.location(), page: page.url() };
      warnings.push(warning);
      if (/deprecat|descontinuad|obsolete/i.test(message.text())) deprecated.push(warning);
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400 && /\.(webp|png|svg|ttf|woff2?|js|css)(\?|$)/.test(new URL(response.url()).pathname)) failedAssets.push(`${response.status()} ${response.url()}`); });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Audits.enable');
  cdp.on('Audits.issueAdded', ({ issue }) => { if (issue.code === 'DeprecationIssue') deprecated.push(issue); });
  await page.goto('/');
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9, { timeout: 10000 });
  await page.getByRole('link', { name: /^Ver detalhes de Emerald Ape #042/ }).click();
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await page.getByRole('link', { name: 'Conectar e finalizar' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar pedido', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible({ timeout: 15000 });
  await page.goto('/perfil');
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  for (const [route, heading] of [['/criadores', 'Conheça quem dá vida à arte digital.'], ['/aprenda', 'Sua próxima descoberta começa aqui.'], ['/carteiras', 'Carteira principal']]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await testInfo.attach('console-and-issues.json', { body: JSON.stringify({ errors, failedAssets, deprecated, warnings }, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
  expect(failedAssets).toEqual([]);
  expect(deprecated).toEqual([]);
});
