import { expect, test, type Page } from '@playwright/test';

// PT: Contextos novos por teste; cenários passam pelo MSW e eventos pelo Socket.IO real.
// EN: Fresh contexts per test; scenarios use MSW and events use the actual Socket.IO client.
async function login(page: Page, password = 'Kurio123!') {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
}
async function rest(page: Page, path: string, method = 'GET', body?: unknown, key?: string) {
  return page.evaluate(async ({ path, method, body, key }) => {
    const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('kurio.session-token')}`, ...(key ? { 'Idempotency-Key': key } : {}) }, body: body === undefined ? (method === 'POST' ? '{}' : undefined) : JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }, { path, method, body, key });
}
async function checkout(page: Page) {
  await login(page);
  await page.goto('/nfts/emerald-ape-042');
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await page.getByRole('link', { name: 'Conectar e finalizar' }).click();
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar pedido', exact: true }).click();
}

test('filtros combinados, ordenação e histórico restauram controles e resultados', async ({ page }) => {
  await page.goto('/');
  const mobile = (page.viewportSize()?.width ?? 1440) <= 640;
  if (mobile) await page.getByRole('button', { name: /Filtrar coleções/ }).click();
  await page.getByRole('button', { name: 'Arte digital (12)', exact: true }).click();
  await page.getByRole('button', { name: 'Ethereum', exact: true }).click();
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  if (mobile) await page.getByRole('button', { name: 'Ver resultados' }).click();
  await page.getByRole('combobox', { name: 'Ordenar por:' }).selectOption('price-asc');
  await page.waitForResponse((response) => response.url().includes('/api/nfts?') && response.url().includes('sort=price-asc') && response.status() === 200);
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  const firstPage = await page.locator('.nft-grid .nft-card-price').allTextContents();
  const prices = firstPage.map((text) => Number(text.match(/(\d+\.\d+) ETH/)![1]));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  await page.getByRole('button', { name: 'Página 2', exact: true }).click();
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(3);
  const secondUrl = page.url();
  await page.getByLabel('Buscar NFT', { exact: true }).fill('Emerald');
  await expect(page).toHaveURL(/q=Emerald/);
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(4);
  await page.goBack();
  await expect(page).toHaveURL(secondUrl);
  await expect(page.getByLabel('Buscar NFT', { exact: true })).toHaveValue('');
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(3);
  await page.goForward();
  await expect(page.getByLabel('Buscar NFT', { exact: true })).toHaveValue('Emerald');
  await expect(page.getByRole('combobox', { name: 'Ordenar por:' })).toHaveValue('price-asc');
  expect(new URL(page.url()).searchParams.get('network')).toBe('Ethereum');
  expect(new URL(page.url()).searchParams.get('collection')).toBe('arte-digital');
});

test('carregamento lento mostra skeleton e erro REST permite nova tentativa', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('kurio.scenario')) localStorage.setItem('kurio.scenario', 'slow'); });
  await page.goto('/');
  await expect(page.getByRole('status', { name: 'Carregando conteúdo' })).toBeVisible();
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'server-error'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Serviço temporariamente indisponível');
  await page.evaluate(() => localStorage.removeItem('kurio.scenario'));
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('avatar e senha validam erros, persistem e autenticam com a nova senha', async ({ page }) => {
  await login(page);
  await page.getByLabel('Escolher avatar').setInputFiles({ name: 'avatar.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('status').filter({ hasText: 'Escolha PNG' })).toBeVisible();
  await page.getByLabel('Escolher avatar').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=', 'base64') });
  await page.getByLabel('Senha atual', { exact: true }).fill('Incorreta123!');
  await page.getByLabel('Nova senha', { exact: true }).fill('NovaKurio123!');
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('Diferente123!');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('As senhas não coincidem.', { exact: true })).toBeVisible();
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaKurio123!');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('Senha atual incorreta.', { exact: true })).toBeVisible();
  await page.getByLabel('Senha atual', { exact: true }).fill('Kurio123!');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByAltText('Seu avatar')).toHaveAttribute('src', /^data:image\/png;base64,/);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.locator('.header').getByRole('link', { name: 'Entrar', exact: true })).toBeVisible();
  await login(page, 'NovaKurio123!');
  await page.getByRole('button', { name: 'Remover', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByAltText('Seu avatar')).toHaveCount(0);
});

test('edição de carteira rejeita endereço inválido e persiste correção', async ({ page }) => {
  await login(page); await page.goto('/carteiras');
  const form = page.locator('.wallet-form').first();
  await form.locator('[name=address]').fill('endereco-invalido');
  await form.getByRole('button', { name: 'Salvar carteira' }).click();
  await expect(form.getByRole('status')).toContainText(/endereço/i);
  await form.locator('[name=address]').fill('0x3333333333333333333333333333333333333333');
  await form.locator('[name=nickname]').fill('Principal revisada');
  await form.getByRole('button', { name: 'Salvar carteira' }).click();
  await expect(form.getByRole('status')).toHaveText('Carteira salva.');
  await page.reload();
  await expect(form.locator('[name=nickname]')).toHaveValue('Principal revisada');
  await expect(form.locator('[name=address]')).toHaveValue('0x3333333333333333333333333333333333333333');
});

test('preço e disponibilidade via Socket.IO invalidam revisão no checkout', async ({ page }) => {
  await checkout(page);
  await rest(page, '/demo/nfts/emerald-ape-042', 'PATCH', { priceEth: '1.49', duplicates: true });
  await expect(page.locator('.summary-total dd')).toHaveText('1.495 ETH');
  await expect(page.locator('.realtime-status')).toContainText('mudou');
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Os valores ou a disponibilidade mudaram' })).toBeVisible();
  await page.getByRole('button', { name: 'Revisar pedido', exact: true }).click();
  await rest(page, '/demo/nfts/emerald-ape-042', 'PATCH', { available: 0 });
  await expect(page.getByRole('alert').filter({ hasText: 'Disponibilidade alterada' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page).toHaveURL(/\/checkout/);
  expect((await rest(page, '/cart')).data.items).toHaveLength(1);
});

test('pedido pendente retoma após desconexão e clique repetido cria uma tentativa', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-21T12:00:00Z'));
  await checkout(page);
  let submissions = 0;
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') submissions++; });
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).dblclick();
  await expect(page.getByRole('heading', { name: 'Pedido em processamento', exact: true })).toBeVisible();
  const orderUrl = page.url();
  await rest(page, '/demo/disconnect', 'POST');
  await expect(page.locator('.realtime-status')).toContainText('Conexão restabelecida', { timeout: 10000 });
  await page.clock.setFixedTime(new Date('2026-10-21T12:00:10Z'));
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible({ timeout: 10000 });
  await page.reload();
  await expect(page).toHaveURL(orderUrl);
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible();
  expect(submissions).toBe(1);
});

test('teclado mantém foco no diálogo e valida formulário de login', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('.header').getByRole('link', { name: 'Entrar', exact: true });
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 16; index++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await dialog.getByLabel('E-mail', { exact: true }).fill('email-invalido');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(dialog.getByLabel('E-mail', { exact: true })).toBeFocused();
  expect(await dialog.getByLabel('E-mail', { exact: true }).evaluate((element: HTMLInputElement) => element.validity.typeMismatch)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
