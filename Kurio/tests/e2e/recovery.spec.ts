import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await page.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
}
async function send(page: Page, path: string, method = 'GET', body?: unknown, key?: string) {
  return page.evaluate(async ({ path, method, body, key }) => {
    const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('kurio.session-token')}`, ...(key ? { 'Idempotency-Key': key } : {}) }, body: body === undefined ? (method === 'POST' ? '{}' : undefined) : JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }, { path, method, body, key });
}
async function orderBody(page: Page) {
  await send(page, '/cart/items', 'POST', { nftId: 'emerald-ape-042', editionId: 'fifty', quantity: 1 });
  const quote = (await send(page, '/quotes', 'POST')).data;
  const wallet = (await send(page, '/wallets')).data[0];
  return { quoteId: quote.id, walletId: wallet.id, network: wallet.network, collector: { name: 'Ana', username: 'ana', email: 'ana@kurio.test', walletId: wallet.id, walletAddress: wallet.address, walletType: wallet.type, network: wallet.network, profileName: 'ana', referralCode: '', ens: '', secondaryAddress: '', notes: '' } };
}

test('favorito otimista reverte quando a API falha e permite nova tentativa', async ({ page }) => {
  await signIn(page); await page.goto('/nfts/emerald-ape-042');
  const button = page.getByRole('button', { name: '♡ Favoritar', exact: true });
  await expect(button).toBeEnabled();
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'favorite-error'));
  await button.click();
  await expect(page.getByText('Não foi possível salvar o favorito.', { exact: true })).toBeVisible();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => localStorage.removeItem('kurio.scenario'));
  await button.click();
  await expect(page.getByRole('button', { name: '♥ Favoritado', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('NFT salvo nos favoritos.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '♥ Favoritado', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('eventos Socket.IO duplicados e antigos não revertem preço do carrinho', async ({ page }) => {
  await page.goto('/nfts/emerald-ape-042');
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await expect(page.locator('.cart-price-cell')).toHaveText('1.19 ETH');
  await send(page, '/demo/nfts/emerald-ape-042', 'PATCH', { priceEth: '1.49', duplicates: true });
  await expect(page.locator('.cart-price-cell')).toHaveText('1.49 ETH');
  await expect(page.locator('.summary-total dd')).toHaveText('1.495 ETH');
  await expect(page.locator('.realtime-status')).toContainText('mudou');
  await page.reload();
  await expect(page.locator('.cart-price-cell')).toHaveText('1.49 ETH');
});

test('cotação antiga gera conflito, sem criar uma compra', async ({ page }) => {
  await signIn(page); const body = await orderBody(page);
  await send(page, '/demo/nfts/emerald-ape-042', 'PATCH', { priceEth: '2.19' });
  const result = await send(page, '/orders', 'POST', body, 'stale-quote-test');
  expect(result.status).toBe(409);
  expect((await send(page, '/cart')).data.items).toHaveLength(1);
});

test('mesma chave recupera pedido, corpo diferente conflita e recibo é imutável', async ({ page }) => {
  await signIn(page); const body = await orderBody(page);
  const first = await send(page, '/orders', 'POST', body, 'same-attempt');
  const repeated = await send(page, '/orders', 'POST', body, 'same-attempt');
  expect(first.status).toBe(200); expect(repeated.data.id).toBe(first.data.id);
  expect((await send(page, '/orders', 'POST', { ...body, network: 'Polygon' }, 'same-attempt')).status).toBe(409);
  await page.goto(`/pedidos/${first.data.id}`);
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible({ timeout: 15000 });
  await send(page, '/demo/nfts/emerald-ape-042', 'PATCH', { priceEth: '9.99' });
  const receipt = (await send(page, `/orders/${first.data.id}`)).data;
  expect(receipt.items[0].unitPrice).toBe('1.19');
  expect(receipt.totals.total).toBe('1.195');
});

test('pagamento recusado preserva o carrinho', async ({ page }) => {
  await signIn(page); const body = await orderBody(page);
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'payment-refused'));
  const result = await send(page, '/orders', 'POST', body, 'refused-attempt');
  await page.goto(`/pedidos/${result.data.id}`);
  await expect(page.getByRole('heading', { name: 'Pagamento recusado', exact: true })).toBeVisible({ timeout: 15000 });
  await page.getByRole('link', { name: 'Voltar ao carrinho', exact: true }).click();
  await expect(page.locator('.cart-table tbody tr')).toHaveCount(1);
});

test('sessão expirada protege o perfil e exige autenticação novamente', async ({ page }) => {
  await signIn(page);
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'expired'));
  await page.reload();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).not.toBeVisible();
});

test('busca com latência variável mantém a resposta mais recente', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'variable-latency'));
  const search = page.getByLabel('Buscar NFT', { exact: true });
  await search.fill('Emerald'); await search.fill('Violet');
  await expect(page.locator('.nft-grid .nft-card').first()).toContainText('Violet');
  await expect(page).toHaveURL(/q=Violet/);
  await expect(page.locator('.nft-grid')).not.toContainText('Emerald');
});

test('timeout após criação recupera o mesmo pedido sem segundo envio', async ({ page }) => {
  await signIn(page); await orderBody(page); await page.goto('/checkout');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar pedido', exact: true }).click();
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'order-timeout'));
  let submissions = 0;
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders') submissions++; });
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible({ timeout: 25000 });
  expect(submissions).toBe(1);
});

test('checkout preserva rascunho após expiração e nova autenticação', async ({ page }) => {
  await signIn(page); await orderBody(page); await page.goto('/checkout');
  await page.getByLabel('Observação do colecionador (opcional)').fill('Guardar este contexto de teste');
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'expired'));
  await page.reload();
  await expect(page).toHaveURL(/\/login/);
  await page.evaluate(() => localStorage.removeItem('kurio.scenario'));
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByLabel('Observação do colecionador (opcional)')).toHaveValue('Guardar este contexto de teste');
});
