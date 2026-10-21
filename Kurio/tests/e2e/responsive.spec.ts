import { expect, test } from '@playwright/test';

test('páginas e filtros se adaptam entre 320 e 1440 pixels', async ({ page }) => {
  for (const width of [320, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Início ${width}px`).toBeTruthy();
    if (width <= 640) {
      await page.getByRole('button', { name: /Filtrar coleções/ }).click();
      await expect(page.getByRole('dialog', { name: 'Filtros do catálogo' })).toBeVisible();
      await page.getByRole('slider').first().focus();
      await page.keyboard.press('ArrowRight');
      await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
      await expect(page).toHaveURL(/min=/);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Filtros do catálogo' })).not.toBeVisible();
    }
    await page.goto('/nfts/emerald-ape-042');
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Detalhe ${width}px`).toBeTruthy();
  }
});

test('login mobile tem campos alinhados e permanece utilizável em 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/login');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const email = await dialog.getByLabel('E-mail', { exact: true }).boundingBox();
  const password = await dialog.getByLabel('Senha', { exact: true }).boundingBox();
  expect(email?.width).toBe(password?.width);
  await dialog.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
