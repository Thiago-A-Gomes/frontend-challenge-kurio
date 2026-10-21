import { expect, test, type Page } from '@playwright/test';

async function stableAssets(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => {
      image.loading = 'eager';
      return image.decode().catch(() => undefined);
    }));
  });
}

test('regressão visual de início, detalhe, carrinho e pagamento', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  await stableAssets(page);
  await expect(page).toHaveScreenshot('inicio.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: .01 });
  await page.goto('/nfts/emerald-ape-042');
  await expect(page.locator('.recommendation-grid .nft-card')).toHaveCount(5);
  await stableAssets(page);
  await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: .01 });
  await page.getByRole('button', { name: 'Comprar', exact: true }).click();
  await expect(page.locator('.summary-total dd')).toHaveText('1.195 ETH');
  await expect(page.locator('.recommendation-grid .nft-card')).toHaveCount(5);
  await stableAssets(page);
  await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: .01 });
  await page.getByRole('link', { name: 'Conectar e finalizar' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Conectar carteira', exact: true })).toBeEnabled();
  await stableAssets(page);
  await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true, animations: 'disabled', maxDiffPixelRatio: .01 });
});
