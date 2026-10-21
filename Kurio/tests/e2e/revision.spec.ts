import { expect, test } from '@playwright/test';

test('carrossel troca a cada três segundos mesmo com mouse sobre o banner', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-slide.is-active')).toHaveAttribute('aria-label', '1 de 3');
  await page.clock.install();
  await page.locator('.hero').hover();
  await page.clock.runFor(3100);
  await expect(page.locator('.hero-slide.is-active')).toHaveAttribute('aria-label', '2 de 3');
  await page.getByRole('button', { name: /^Mostrar imagem 3:/ }).click();
  await expect(page.locator('.hero-slide.is-active')).toHaveAttribute('aria-label', '3 de 3');
  await page.clock.runFor(3100);
  await expect(page.locator('.hero-slide.is-active')).toHaveAttribute('aria-label', '1 de 3');
});

test('catálogo oferece quatro páginas reais e preserva a página ao recarregar', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.nft-grid .nft-card');
  await expect(cards).toHaveCount(9);
  const firstPage = await cards.locator('h3').allTextContents();
  await page.getByRole('button', { name: 'Página 2', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(cards.first()).not.toContainText(firstPage[0]);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Página 2', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Página 4', exact: true }).click();
  await expect(page).toHaveURL(/page=4/);
  await expect(cards).toHaveCount(9);
  await expect(page.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
});

test('cadastro com os quatro campos do Figma cria uma sessão', async ({ page }) => {
  await page.goto('/cadastro');
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome de usuário', { exact: true }).fill('colecionador_teste');
  await dialog.getByLabel('E-mail', { exact: true }).fill('novo@kurio.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByLabel('Confirmar senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible();
  await expect(page.getByLabel('Nome de usuário', { exact: true })).toHaveValue('colecionador_teste');
});
