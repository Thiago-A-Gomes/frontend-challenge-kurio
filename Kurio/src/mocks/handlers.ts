import { reviewsFor } from './fixtures/reviews';
/**
 * PT: Implementa contratos REST simulados com validação, autorização e idempotência.
 * EN: Implements mocked REST contracts with validation, authorization and idempotency.
 */
import { assertPayload, validAvatar } from './validation';
import { delay, http, HttpResponse } from 'msw';
import type { PathParams } from 'msw';
import { database, hashPassword, persist, publicUser, resetDatabase } from './database';
import type { Database, StoredOrder } from './database';
import type { Cart, CartItem, Collector, Quote, Wallet } from '../shared/api/contracts';
import { fromWei, toWei } from '../shared/lib/eth';
import { collectionPreview } from './fixtures/collections';
import { disconnectMockConnections, publishMockEvent } from './events';

class MockError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}
type Payload = Record<string, unknown>;
const text = (body: Payload, key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() : '';
const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// O cenário fica na camada de rede, sem respostas fictícias nos componentes.
function scenario(): string { return typeof localStorage === 'undefined' ? 'success' : localStorage.getItem('kurio.scenario') ?? 'success'; }
function authenticated(db: Database, request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  const session = db.sessions[token];
  if (!session || session.expiresAt <= Date.now() || scenario() === 'expired') throw new MockError('Sua sessão expirou. Entre novamente para continuar.', 401);
  const account = db.users.find((user) => user.id === session.userId);
  if (!account) throw new MockError('Sessão inválida.', 401);
  return account;
}
function owner(db: Database, request: Request): string {
  return request.headers.has('Authorization') ? authenticated(db, request).id : `guest:${request.headers.get('X-Visitor-Id') ?? 'demo'}`;
}
function getCart(db: Database, key: string) { return db.carts[key] ??= { lines: [], coupon: '' }; }
function cartView(db: Database, key: string): Cart {
  const cart = getCart(db, key);
  const items: CartItem[] = cart.lines.map((line) => {
    const product = db.products.find((nft) => nft.id === line.nftId)!;
    const available = product.editions.find((edition) => edition.id === line.editionId)?.available ?? 0;
    const unitPrice = product.priceEth ?? '0';
    return { ...line, product, available, unitPrice, lineTotal: fromWei(toWei(unitPrice) * BigInt(line.quantity)) };
  });
  return { items, coupon: cart.coupon };
}
function validateItems(items: CartItem[]): void {
  if (!items.length) throw new MockError('Seu carrinho está vazio.');
  for (const item of items) if (!item.product.priceEth || item.quantity > item.available) throw new MockError(`Disponibilidade alterada para ${item.product.name}. Revise o carrinho.`, 409);
}
function quoteSignature(quote: Pick<Quote, 'items' | 'coupon' | 'total'>) {
  return JSON.stringify({ items: quote.items.map((item) => [item.nftId, item.editionId, item.quantity, item.unitPrice, item.product.version, item.available]), coupon: quote.coupon, total: quote.total });
}
function makeQuote(db: Database, key: string): Quote {
  const cart = cartView(db, key); validateItems(cart.items);
  const subtotal = cart.items.reduce((total, item) => total + toWei(item.lineTotal), 0n);
  const discount = cart.coupon === 'KURIO10' ? subtotal / 10n : 0n;
  const networkFee = toWei('0.005');
  return { id: crypto.randomUUID(), ...cart, subtotal: fromWei(subtotal), discount: fromWei(discount), networkFee: fromWei(networkFee), total: fromWei(subtotal - discount + networkFee), expiresAt: Date.now() + 300000 };
}

// Pedido pendente é retomado pela API após refresh. O recibo guarda um snapshot,
// portanto alterações posteriores no catálogo não mudam os valores da compra.
export function settleOrder(db: Database, order: StoredOrder): void {
  if (order.status !== 'pending' || Date.now() < order.settlesAt) return;
  order.status = order.outcome; order.version += 1;
  if (order.status === 'confirmed') {
    const cart = getCart(db, order.userId);
    for (const item of order.items) {
      const line = cart.lines.find((line) => line.nftId === item.nftId && line.editionId === item.editionId);
      if (line) line.quantity = Math.max(0, line.quantity - item.quantity);
    }
    cart.lines = cart.lines.filter((line) => line.quantity > 0);
    if (!cart.lines.length) cart.coupon = '';
  } else {
    for (const item of order.items) {
      const product = db.products.find((nft) => nft.id === item.nftId)!;
      product.editions.find((edition) => edition.id === item.editionId)!.available += item.quantity;
      product.version += 1;
    }
  }
  persist(db);
  publishMockEvent({ eventId: crypto.randomUUID(), type: 'order.updated', resourceId: order.id, version: order.version, userId: order.userId, data: publicOrder(order) });
}
function publicOrder(order: StoredOrder) {
  const { key: _key, requestHash: _hash, settlesAt: _time, outcome: _outcome, ...receipt } = order;
  return receipt;
}

// Um único tratamento converte erros de negócio em respostas HTTP coerentes.
function handle(action: (db: Database, request: Request, params: PathParams) => unknown | Promise<unknown>) {
  return async ({ request, params }: { request: Request; params: PathParams }) => {
    try {
      const query = new URL(request.url).searchParams;
      await delay(scenario() === 'slow' ? 2000 : scenario() === 'variable-latency' ? (query.get('q')?.startsWith('E') ? 1200 : 80) : 180);
      if (scenario() === 'offline') return HttpResponse.error();
      if (scenario() === 'server-error') throw new MockError('Serviço temporariamente indisponível.', 503);
      if (['POST', 'PATCH', 'PUT'].includes(request.method) && request.headers.get('content-type')?.includes('application/json')) {
        const raw = await request.clone().text();
        if (raw.length > 3000000) throw new MockError('Corpo da requisição muito grande.', 413);
        try { const body: unknown = JSON.parse(raw); if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Envie um objeto JSON.'); assertPayload(body); }
        catch (error) { throw new MockError(error instanceof Error ? error.message : 'JSON inválido.'); }
      }
      const db = await database();
      const result = await action(db, request, params);
      persist(db);
      return HttpResponse.json(result === undefined ? {} : result);
    } catch (error) {
      return HttpResponse.json({ message: error instanceof Error ? error.message : 'Falha inesperada.' }, { status: error instanceof MockError ? error.status : 500 });
    }
  };
}

export const handlers = [
  // PT: Cadastro local idempotente; não expõe lista de e-mails nem envia mensagens.
  // EN: Idempotent local registration; never lists addresses or sends messages.
  http.post('/api/newsletter/subscriptions', handle(async (db, request) => {
    if (scenario() === 'newsletter-error') throw new MockError('Não foi possível salvar sua inscrição. Tente novamente.', 503);
    const body = await request.json() as Payload;
    const email = text(body, 'email').toLowerCase();
    if (!emailValid(email) || email.length > 254 || /[<>]/.test(email)) throw new MockError('Informe um e-mail válido.');
    const existing = db.newsletterSubscriptions.find((item) => item.email === email);
    if (existing) return { ...existing, alreadySubscribed: true, simulated: true };
    if (db.newsletterSubscriptions.length >= 2000) throw new MockError('Limite da demonstração atingido.', 429);
    const subscription = { id: crypto.randomUUID(), email, subscribedAt: new Date().toISOString() };
    db.newsletterSubscriptions.push(subscription);
    return { ...subscription, alreadySubscribed: false, simulated: true };
  })),
  http.post('/api/demo/disconnect', handle(() => { disconnectMockConnections(); return {}; })),
  http.patch('/api/demo/nfts/:id', handle(async (db, request, params) => {
    const body = await request.json() as Payload;
    const product = db.products.find((item) => item.id === params.id);
    if (!product) throw new MockError('NFT não encontrado.', 404);
    if (body.priceEth !== undefined) { toWei(String(body.priceEth)); product.priceEth = String(body.priceEth); }
    if (body.available !== undefined) { const edition = product.editions.find((item) => item.id === (body.editionId ?? 'fifty')); if (!edition || !Number.isInteger(body.available) || Number(body.available) < 0) throw new MockError('Disponibilidade inválida.'); edition.available = Number(body.available); }
    product.version += 1; persist(db);
    const event = { eventId: crypto.randomUUID(), type: 'nft.updated' as const, resourceId: product.id, version: product.version, data: structuredClone(product) };
    publishMockEvent(event);
    if (body.duplicates) {
      publishMockEvent(event);
      publishMockEvent({ ...event, eventId: crypto.randomUUID(), version: product.version - 1, data: { ...event.data, priceEth: '0.01', version: product.version - 1 } });
    }
    return product;
  })),
  http.get('/api/recommendations', handle((db) => ['cosmic-bloom-118', 'violet-nomad-314', 'ivory-baron-088', 'golden-beat-207', 'golden-signal-160'].map((id) => db.products.find((product) => product.id === id)!))),
  http.get('/api/nfts/:id/related', handle((db, _request, params) => {
    const referenceOrder = ['cosmic-bloom-118', 'violet-nomad-314', 'ivory-baron-088', 'golden-beat-207', 'golden-signal-160'];
    const related = referenceOrder.filter((id) => id !== params.id).map((id) => db.products.find((product) => product.id === id)!);
    return [...related, ...db.products.filter((product) => product.id !== params.id && !referenceOrder.includes(product.id))].slice(0, 5);
  })),
  http.get('/api/nfts/:id/reviews', handle((db, _request, params) => {
    const nft = db.products.find((product) => product.id === params.id);
    if (!nft) throw new MockError('NFT não encontrado.', 404);
    return reviewsFor(nft.id);
  })),
  http.get('/api/collections', handle((db) => collectionPreview.map((collection) => ({ ...collection, count: db.products.filter((nft) => nft.collection === collection.id).length })))),
  http.get('/api/nfts', handle((db, request) => {
    const search = new URL(request.url).searchParams;
    let items = db.products.filter((nft) => (!search.get('q') || nft.name.toLowerCase().includes(search.get('q')!.toLowerCase())) && (!search.get('collection') || nft.collection === search.get('collection')) && (!search.get('network') || nft.network === search.get('network')));
    if (search.get('min')) items = items.filter((nft) => nft.priceEth && toWei(nft.priceEth) >= toWei(search.get('min')!));
    if (search.get('max')) items = items.filter((nft) => nft.priceEth && toWei(nft.priceEth) <= toWei(search.get('max')!));
    if (search.get('category') === 'trending') items = items.filter((_, index) => index % 2 === 0);
    if (search.get('category') === 'new') items = [...items].reverse();
    const sort = search.get('sort');
    if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'price-asc' || sort === 'price-desc') items.sort((a, b) => {
      const first = toWei(a.priceEth ?? '0'), second = toWei(b.priceEth ?? '0');
      return (first === second ? 0 : first < second ? -1 : 1) * (sort === 'price-desc' ? -1 : 1);
    });
    const pages = Math.max(1, Math.ceil(items.length / 9));
    const page = Math.min(pages, Math.max(1, Math.floor(Number(search.get('page')) || 1)));
    return { items: scenario() === 'empty' ? [] : items.slice((page - 1) * 9, page * 9), total: scenario() === 'empty' ? 0 : items.length, pages, page };
  })),
  http.get('/api/nfts/:id', handle((db, _request, params) => {
    const nft = db.products.find((nft) => nft.id === params.id);
    if (!nft) throw new MockError('NFT não encontrado.', 404);
    return nft;
  })),
  http.get('/api/session', handle((db, request) => request.headers.has('Authorization') ? publicUser(authenticated(db, request)) : null)),
  http.post('/api/login', handle(async (db, request) => {
    const body = await request.json() as Payload;
    const account = db.users.find((user) => user.email === text(body, 'email').toLowerCase());
    if (!account || await hashPassword(text(body, 'password'), account.salt) !== account.passwordHash) throw new MockError('E-mail ou senha incorretos.', 401);
    const guest = getCart(db, `guest:${request.headers.get('X-Visitor-Id') ?? 'demo'}`);
    const cart = getCart(db, account.id);
    for (const line of guest.lines) {
      const current = cart.lines.find((item) => item.nftId === line.nftId && item.editionId === line.editionId);
      const limit = db.products.find((nft) => nft.id === line.nftId)?.editions.find((edition) => edition.id === line.editionId)?.available ?? 0;
      if (current) current.quantity = Math.min(current.quantity + line.quantity, limit);
      else if (limit > 0) cart.lines.push({ ...line, quantity: Math.min(line.quantity, limit) });
    }
    if (!cart.coupon) cart.coupon = guest.coupon;
    guest.lines = []; guest.coupon = '';
    const token = crypto.randomUUID(), expiresAt = Date.now() + 3600000;
    db.sessions[token] = { userId: account.id, expiresAt };
    return { user: publicUser(account), token, expiresAt };
  })),
  http.post('/api/register', handle(async (db, request) => {
    const body = await request.json() as Payload;
    const name = text(body, 'name'), email = text(body, 'email').toLowerCase(), password = text(body, 'password');
    if (name.length < 2 || name.length > 100 || email.length > 254 || !emailValid(email) || password.length < 8 || password.length > 128) throw new MockError('Informe nome, e-mail válido e senha com pelo menos 8 caracteres.');
    if (db.users.some((user) => user.email === email)) throw new MockError('Já existe uma conta com este e-mail.', 409);
    const salt = crypto.randomUUID();
    const username = text(body, 'username') || `${email.split('@')[0]}-${db.users.length}`;
    if (!/^[a-zA-Z0-9_.-]{2,40}$/.test(username)) throw new MockError('Nome de usuário inválido.');
    if (db.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) throw new MockError('Nome de usuário já utilizado.', 409);
    const account = { id: crypto.randomUUID(), name, username, ens: '', walletNickname: '', email, salt, passwordHash: await hashPassword(password, salt), avatar: '', wallets: [], favorites: [] };
    db.users.push(account); return publicUser(account);
  })),
  http.post('/api/logout', handle((db, request) => { delete db.sessions[request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '']; return {}; })),
  http.get('/api/cart', handle((db, request) => cartView(db, owner(db, request)))),
  http.post('/api/cart/items', handle(async (db, request) => {
    const body = await request.json() as Payload;
    const nftId = text(body, 'nftId'), editionId = text(body, 'editionId'), quantity = Number(body.quantity);
    const product = db.products.find((nft) => nft.id === nftId);
    const edition = product?.editions.find((edition) => edition.id === editionId);
    if (!product || !edition || !product.priceEth) throw new MockError('NFT ou edição indisponível.', 404);
    const key = owner(db, request), cart = getCart(db, key);
    const current = cart.lines.find((line) => line.nftId === nftId && line.editionId === editionId);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity + (current?.quantity ?? 0) > edition.available) throw new MockError('Quantidade maior que a disponibilidade.', 409);
    if (current) current.quantity += quantity; else cart.lines.push({ nftId, editionId, quantity });
    return cartView(db, key);
  })),
  http.patch('/api/cart/items', handle(async (db, request) => {
    const body = await request.json() as Payload;
    const key = owner(db, request), cart = getCart(db, key);
    const line = cart.lines.find((line) => line.nftId === body.nftId && line.editionId === body.editionId);
    if (!line) throw new MockError('Item não encontrado.', 404);
    const quantity = Number(body.quantity);
    const limit = db.products.find((nft) => nft.id === line.nftId)!.editions.find((edition) => edition.id === line.editionId)!.available;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > limit) throw new MockError('Quantidade indisponível.', 409);
    line.quantity = quantity; cart.lines = cart.lines.filter((item) => item.quantity > 0);
    return cartView(db, key);
  })),
  http.post('/api/cart/coupon', handle(async (db, request) => {
    const body = await request.json() as Payload;
    const code = text(body, 'code').toUpperCase();
    if (code === 'EXPIRADO') throw new MockError('Este cupom expirou.');
    if (code && code !== 'KURIO10') throw new MockError('Cupom inválido.');
    const key = owner(db, request); getCart(db, key).coupon = code;
    return cartView(db, key);
  })),
  http.post('/api/quotes', handle((db, request) => {
    const key = owner(db, request), quote = makeQuote(db, key);
    db.quotes[quote.id] = { owner: key, quote, signature: quoteSignature(quote) }; return quote;
  })),
  http.get('/api/favorites', handle((db, request) => authenticated(db, request).favorites)),
  http.post('/api/favorites/:id', handle((db, request, params) => {
    const user = authenticated(db, request), id = String(params.id);
    if (!db.products.some((nft) => nft.id === id)) throw new MockError('NFT não encontrado.', 404);
    if (scenario() === 'favorite-error') throw new MockError('Não foi possível salvar o favorito.', 503);
    if (!user.favorites.includes(id)) user.favorites.push(id); return user.favorites;
  })),
  http.delete('/api/favorites/:id', handle((db, request, params) => {
    const user = authenticated(db, request);
    if (scenario() === 'favorite-error') throw new MockError('Não foi possível remover o favorito.', 503);
    user.favorites = user.favorites.filter((id) => id !== params.id); return user.favorites;
  })),
  http.patch('/api/profile', handle(async (db, request) => {
    const user = authenticated(db, request), body = await request.json() as Payload;
    const name = text(body, 'name'), email = text(body, 'email').toLowerCase();
    if (name.length < 2 || name.length > 100 || email.length > 254 || !emailValid(email)) throw new MockError('Confira seu nome e e-mail.');
    if (db.users.some((other) => other.id !== user.id && other.email === email)) throw new MockError('Este e-mail já está em uso.', 409);
    const avatar = text(body, 'avatar');
    if (!validAvatar(avatar)) throw new MockError('Use uma imagem PNG, JPEG ou WebP de até 2 MB.');
    const username = text(body, 'username') || user.username;
    if (!/^[a-zA-Z0-9_.-]{2,40}$/.test(username)) throw new MockError('Nome de usuário deve ter de 2 a 40 letras, números, pontos ou traços.');
    if (db.users.some((other) => other.id !== user.id && other.username.toLowerCase() === username.toLowerCase())) throw new MockError('Nome de usuário já utilizado.', 409);
    const ens = text(body, 'ens');
    if (ens && !/^[a-zA-Z0-9-]+\.eth$/.test(ens)) throw new MockError('Informe um nome ENS válido, como nome.eth.');
    // Valida tudo antes de alterar o usuário: um erro de senha não salva meia edição.
    let newHash: string | undefined;
    if (text(body, 'newPassword') || text(body, 'currentPassword')) {
      if (text(body, 'newPassword').length < 8) throw new MockError('A nova senha deve ter pelo menos 8 caracteres.');
      if (await hashPassword(text(body, 'currentPassword'), user.salt) !== user.passwordHash) throw new MockError('Senha atual incorreta.');
      newHash = await hashPassword(text(body, 'newPassword'), user.salt);
    }
    Object.assign(user, { name, username, email, avatar, ens, walletNickname: text(body, 'walletNickname'), ...(newHash ? { passwordHash: newHash } : {}) }); return publicUser(user);
  })),
  http.post('/api/profile/password', handle(async (db, request) => {
    const user = authenticated(db, request), body = await request.json() as Payload;
    if (await hashPassword(text(body, 'currentPassword'), user.salt) !== user.passwordHash) throw new MockError('Senha atual incorreta.');
    if (text(body, 'newPassword').length < 8) throw new MockError('A nova senha deve ter pelo menos 8 caracteres.');
    user.passwordHash = await hashPassword(text(body, 'newPassword'), user.salt); return {};
  })),
  http.get('/api/wallets', handle((db, request) => authenticated(db, request).wallets)),
  http.post('/api/wallets', handle(async (db, request) => {
    const user = authenticated(db, request), body = await request.json() as Payload;
    const address = text(body, 'address'), network = text(body, 'network'), name = text(body, 'name');
    if (!name || !['Ethereum', 'Polygon', 'Solana'].includes(network) || !(network === 'Solana' ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) : /^0x[0-9a-fA-F]{40}$/.test(address))) throw new MockError('Informe nome, rede e um endereço válido para a rede.');
    const id = text(body, 'id');
    if (user.wallets.some((wallet) => wallet.id !== id && wallet.address.toLowerCase() === address.toLowerCase() && wallet.network === network)) throw new MockError('Esta carteira já está cadastrada.', 409);
    const primary = Boolean(body.primary) || !user.wallets.length;
    const email = text(body, 'email') || user.email, ens = text(body, 'ens');
    if (!emailValid(email) || (ens && !/^[a-zA-Z0-9-]+\.eth$/.test(ens))) throw new MockError('Confira o e-mail e o nome ENS.');
    if (id && !user.wallets.some((wallet) => wallet.id === id)) throw new MockError('Carteira não encontrada.', 404);
    if (body.type && !['MetaMask', 'WalletConnect', 'Coinbase Wallet'].includes(text(body, 'type'))) throw new MockError('Tipo de carteira inválido.');
    if (typeof body.primary !== 'boolean') throw new MockError('Informe se a carteira é principal.');
    if (primary) user.wallets.forEach((wallet) => { wallet.primary = false; });
    const wallet: Wallet = { id: id || crypto.randomUUID(), name, address, network, primary, nickname: text(body, 'nickname') || name, profileName: text(body, 'profileName') || user.username, type: text(body, 'type') || 'MetaMask', email, ens, referralCode: text(body, 'referralCode'), secondaryAddress: text(body, 'secondaryAddress') };
    const existing = user.wallets.find((item) => item.id === id);
    if (existing) Object.assign(existing, wallet); else user.wallets.push(wallet);
    if (!user.wallets.some((item) => item.primary)) user.wallets[0].primary = true;
    return user.wallets;
  })),
  http.post('/api/orders', handle(async (db, request) => {
    const user = authenticated(db, request), body = await request.json() as Payload;
    const key = request.headers.get('Idempotency-Key');
    if (!key || key.length > 128) throw new MockError('Falta a identificação da tentativa de compra.');
    const requestHash = JSON.stringify(body);
    const existing = db.orders.find((order) => order.userId === user.id && order.key === key);
    if (existing) {
      if (existing.requestHash !== requestHash) throw new MockError('Esta tentativa já foi usada com outros dados.', 409);
      settleOrder(db, existing); return publicOrder(existing);
    }
    const saved = db.quotes[text(body, 'quoteId')];
    const latest = makeQuote(db, user.id);
    if (!saved || saved.owner !== user.id || saved.quote.expiresAt < Date.now() || saved.signature !== quoteSignature(latest)) throw new MockError('Sua cotação mudou ou expirou. Revise os valores e confirme novamente.', 409);
    const wallet = user.wallets.find((wallet) => wallet.id === body.walletId);
    if (!wallet || wallet.network !== body.network) throw new MockError('Selecione uma carteira e rede compatíveis.');
    const collector = body.collector as Collector | undefined;
    if (!collector || !collector.name || !collector.username || !emailValid(collector.email) || collector.walletAddress !== wallet.address || collector.network !== wallet.network || collector.walletType !== wallet.type) throw new MockError('Confira os dados do colecionador e da carteira selecionada.');
    const quote = saved.quote;
    const order: StoredOrder = {
      id: crypto.randomUUID(), userId: user.id, key, requestHash, status: 'pending', version: 1,
      items: structuredClone(quote.items), totals: { subtotal: quote.subtotal, discount: quote.discount, networkFee: quote.networkFee, total: quote.total },
      wallet: structuredClone(wallet), collector, transaction: `sim-${crypto.randomUUID()}`, createdAt: Date.now(), settlesAt: Date.now() + 3000,
      outcome: scenario() === 'payment-refused' ? 'refused' : 'confirmed',
    };
    for (const item of order.items) { const product = db.products.find((nft) => nft.id === item.nftId)!; product.editions.find((edition) => edition.id === item.editionId)!.available -= item.quantity; product.version += 1; }
    db.orders.push(order); persist(db);
    setTimeout(() => settleOrder(db, order), 3100);
    if (scenario() === 'order-timeout') await delay(15000);
    return publicOrder(order);
  })),
  http.get('/api/orders/by-key/:key', handle((db, request, params) => {
    const user = authenticated(db, request), order = db.orders.find((order) => order.userId === user.id && order.key === params.key);
    if (!order) throw new MockError('Pedido não encontrado.', 404);
    settleOrder(db, order); return publicOrder(order);
  })),
  http.get('/api/orders/:id', handle((db, request, params) => {
    const user = authenticated(db, request), order = db.orders.find((order) => order.id === params.id && order.userId === user.id);
    if (!order) throw new MockError('Pedido não encontrado.', 404);
    settleOrder(db, order); return publicOrder(order);
  })),
  http.post('/api/demo/reset', async () => { await resetDatabase(); return HttpResponse.json({ message: 'Cenário restaurado.' }); }),
];
