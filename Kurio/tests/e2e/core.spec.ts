import { expect, test, type Page } from '@playwright/test';

// Cada teste começa em um contexto isolado, sem dados de outro teste.
async function login(page: Page, email = 'ana@kurio.test') {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('E-mail', { exact: true }).fill(email);
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
}

test('catálogo, filtros na URL, refresh e detalhe inexistente', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Buscar NFT', { exact: true }).fill('Emerald');
  await expect(page.getByRole('link', { name: /^Ver detalhes de Emerald Ape #042/ })).toBeVisible();
  await expect(page).toHaveURL(/q=Emerald/);
  await page.reload();
  await expect(page.getByLabel('Buscar NFT', { exact: true })).toHaveValue('Emerald');
  await expect(page.locator('.header nav .active')).toHaveCount(1);
  await page.goto('/nfts/inexistente');
  await expect(page.getByRole('heading', { name: 'Página ou NFT não encontrado' })).toBeVisible();
});

test('compra do detalhe ao pedido confirmado com persistência', async ({ page }) => {
  await page.goto('/nfts/emerald-ape-042');
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible();
  await page.reload();
  await page.getByRole('link', { name: 'Conectar e finalizar' }).click();
  await login(page);
  await expect(page.getByRole('heading', { name: 'Pagamento', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar pedido', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
  await expect(page).toHaveURL(/\/pedidos\//);
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado', exact: true })).toBeVisible();
  await page.goto('/carrinho');
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
});

test('perfil, carteira e logout sem exposição de dados', async ({ page }) => {
  await page.goto('/perfil');
  await login(page);
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  await page.getByLabel('Nome de exibição', { exact: true }).fill('Ana de teste');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue('Ana de teste');
  await page.locator('.account-sidebar').getByRole('link', { name: 'Carteiras', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Carteira principal', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  // Aguarda o logout responder antes de iniciar uma navegação que o interromperia.
  await expect(page.locator('.header').getByRole('link', { name: 'Entrar', exact: true })).toBeVisible();
  await page.goto('/perfil');
  await expect(page.getByRole('dialog')).toBeVisible();
  await login(page, 'bruno@kurio.test');
  await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue('Bruno Colecionador');
});

test('painel do NFT, galeria ampliada, avaliações e largura da página', async ({ page }, testInfo) => {
  await page.goto('/nfts/emerald-ape-042');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible();
  await expect(page.locator('.nft-detail-price')).toHaveText('1.19 ETH');
  await expect(page.getByText('19 avaliações de colecionadores', { exact: true })).toBeVisible();
  await expect(page.locator('.nft-thumbnails button')).toHaveCount(4);
  await page.getByRole('button', { name: 'Ampliar imagem de Emerald Ape #042' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Avaliações de colecionadores (19)' }).click();
  await expect(page.locator('.nft-review')).toHaveCount(19);
  await page.getByRole('tab', { name: 'Detalhes do NFT' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath('nft-details.png'), fullPage: true });
});

test('carrinho com quantidade, cupom, recomendações e remoção', async ({ page }, testInfo) => {
  await page.goto('/nfts/emerald-ape-042');
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042', exact: true }).click();
  await expect(page.locator('.cart-total-cell')).toHaveText('2.38 ETH');
  await page.getByLabel('Código promocional', { exact: true }).fill('KURIO10');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page.locator('.summary-total dd')).toHaveText('2.147 ETH');
  await expect(page.locator('.recommendation-grid .nft-card')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath('cart.png'), fullPage: true });
  await page.getByRole('button', { name: 'Remover Emerald Ape #042 do carrinho', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio', exact: true })).toBeVisible();
});
