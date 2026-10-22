import { expect, test } from '@playwright/test';

// PT: Interações reais, REST via MSW e um contexto novo por teste.
// EN: Real interactions, REST through MSW and a fresh context per test.
test('banners abrem filtros distintos e removem filtros anteriores', async ({ page }) => {
  await page.goto('/?q=inexistente&network=Solana&page=4');
  await page.getByRole('link', { name: 'Explorar novos lançamentos', exact: true }).click();
  await expect(page).toHaveURL(/category=new/);
  await expect(page.getByLabel('Buscar NFT', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Novos lançamentos', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  expect(new URL(page.url()).searchParams.get('network')).toBe('');
  await page.getByRole('link', { name: 'Explorar arte digital', exact: true }).click();
  await expect(page).toHaveURL(/collection=arte-digital/);
  await expect(page.getByRole('button', { name: 'Todos os NFTs', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.nft-grid')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.catalog-results')).toContainText('12 NFTs');
});

test('paginação troca os itens sem salto e cada card abre seu próprio detalhe', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  const original = await page.locator('.nft-grid .nft-card a').first().getAttribute('href');
  const thirdPage = page.getByRole('button', { name: 'Página 3', exact: true });
  await thirdPage.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await thirdPage.click();
  await expect(thirdPage).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.catalog-results')).toHaveText('Página 3 de 4 · 19–27 de 36 NFTs');
  expect(Math.abs(await page.evaluate(() => window.scrollY) - before)).toBeLessThan(4);
  const current = page.locator('.nft-grid .nft-card').first();
  const destination = await current.locator('a').getAttribute('href');
  const title = await current.locator('h3').innerText();
  expect(destination).not.toBe(original);
  await current.locator('a').click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe(destination);
  await page.goBack();
  await expect(thirdPage).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.nft-grid .nft-card a').first()).toHaveAttribute('href', destination!);
});

test('quatro artigos abrem conteúdos distintos e devolvem o foco por Escape', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const titles = ['Como funciona a propriedade de NFTs', '10 artistas digitais para acompanhar', 'Raridade, atributos e procedência', 'Como proteger sua carteira'];
  for (const title of titles) {
    const trigger = page.getByRole('button', { name: `Ler: ${title}`, exact: true });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('article > section')).toHaveCount(title.startsWith('10') ? 4 : 3);
    await expect(dialog.getByRole('button', { name: 'Fechar artigo' })).toBeFocused();
    expect(await dialog.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
    expect(await dialog.evaluate((element) => element.getBoundingClientRect().width <= innerWidth)).toBe(true);
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await page.getByRole('button', { name: `Ler: ${titles[0]}`, exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Explorar catálogo', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  expect(errors).toEqual([]);
});

test('newsletter valida e persiste inscrição idempotente após atualização', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('.newsletter');
  const input = form.getByLabel('Seu e-mail');
  await input.fill('email-invalido');
  await form.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(input).toBeFocused();
  expect(await input.evaluate((element: HTMLInputElement) => element.validity.typeMismatch)).toBe(true);
  await input.fill('Coletor@Example.test');
  const saved = page.waitForResponse((response) => response.url().endsWith('/api/newsletter/subscriptions') && response.request().method() === 'POST');
  await form.getByRole('button', { name: 'Enviar', exact: true }).click();
  const response = await saved;
  expect(response.status()).toBe(200);
  const first = await response.json();
  expect(first).toMatchObject({ email: 'coletor@example.test', simulated: true, alreadySubscribed: false });
  await expect(form.getByRole('status')).toHaveText('Inscrição demonstrativa confirmada neste navegador.');
  await page.reload();
  await input.fill('coletor@example.test');
  const duplicate = page.waitForResponse((response) => response.url().endsWith('/api/newsletter/subscriptions'));
  await form.getByRole('button', { name: 'Enviar', exact: true }).click();
  expect(await (await duplicate).json()).toMatchObject({ id: first.id, alreadySubscribed: true });
  await expect(form.getByRole('status')).toContainText('já está cadastrado');
});

test('newsletter rejeita payload inválido e permite nova tentativa após falha REST', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nft-grid .nft-card')).toHaveCount(9);
  expect(await page.evaluate(async () => (await fetch('/api/newsletter/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: '<script>@example.test' }) })).status)).toBe(400);
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'newsletter-error'));
  const form = page.locator('.newsletter');
  await form.getByLabel('Seu e-mail').fill('retry@example.test');
  await form.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(form.getByRole('alert')).toHaveText('Não foi possível salvar sua inscrição. Tente novamente.');
  await expect(form.getByRole('status')).toHaveCount(0);
  await expect(form.getByLabel('Seu e-mail')).toHaveValue('retry@example.test');
  await page.evaluate(() => localStorage.setItem('kurio.scenario', 'success'));
  await form.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(form.getByRole('status')).toHaveText('Inscrição demonstrativa confirmada neste navegador.');
  await expect(form.getByRole('alert')).toHaveCount(0);
});
