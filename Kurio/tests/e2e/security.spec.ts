import { expect, test, type Page } from '@playwright/test';

async function request(page: Page, path: string, body?: unknown, token?: string) {
  return page.evaluate(async ({ path, body, token }) => {
    const response = await fetch(`/api${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }, { path, body, token });
}

test('API rejeita recursos privados sem sessão e JSON com prototype pollution', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nft-card')).toHaveCount(9);
  expect((await request(page, '/wallets')).status).toBe(401);
  // Texto bruto evita que a serialização segura do Playwright remova a chave do ataque.
  const unsafe = '{"__proto__":{"admin":true},"email":"a@b.test","name":"Teste","password":"Kurio123!"}';
  expect((await request(page, '/register', unsafe)).status).toBe(400);
  expect(await page.evaluate(() => 'admin' in Object.prototype)).toBe(false);
});

test('cadastro conflitante e nome de usuário injetado são rejeitados', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('.nft-card')).toHaveCount(9);
  const conflict = await request(page, '/register', { name: 'Teste', username: 'outra_conta', email: 'ana@kurio.test', password: 'Kurio123!' });
  expect(conflict.status).toBe(409);
  const injection = await request(page, '/register', { name: 'Teste', username: '<img src=x onerror=alert(1)>', email: 'outra@kurio.test', password: 'Kurio123!' });
  expect(injection.status).toBe(400);
});

test('carteira de outro usuário não pode ser editada e falha não remove principal', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('.nft-card')).toHaveCount(9);
  const login = await request(page, '/login', { email: 'ana@kurio.test', password: 'Kurio123!' });
  const token = login.data.token as string;
  const original = (await request(page, '/wallets', undefined, token)).data[0];
  const foreign = await request(page, '/wallets', { ...original, id: 'bruno-wallet', address: `0x${'3'.repeat(40)}` }, token);
  expect(foreign.status).toBe(404);
  const invalid = await request(page, '/wallets', { ...original, email: 'invalido' }, token);
  expect(invalid.status).toBe(400);
  expect((await request(page, '/wallets', undefined, token)).data[0].primary).toBe(true);
});

test('payload HTML em nome é exibido como texto e avatar SVG é rejeitado', async ({ page }) => {
  await page.goto('/login');
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('E-mail', { exact: true }).fill('ana@kurio.test');
  await dialog.getByLabel('Senha', { exact: true }).fill('Kurio123!');
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click();
  const name = '<img src=x onerror="window.injetado=true">';
  await page.getByLabel('Nome de exibição', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome de exibição', { exact: true })).toHaveValue(name);
  expect(await page.evaluate(() => 'injetado' in window)).toBe(false);
  const avatar = await page.evaluate(async () => {
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('kurio.session-token')}` }, body: JSON.stringify({ name: 'Ana', email: 'ana@kurio.test', username: 'ana', avatar: 'data:image/svg+xml;base64,PHN2Zy8+' }) });
    return response.status;
  });
  expect(avatar).toBe(400);
});
