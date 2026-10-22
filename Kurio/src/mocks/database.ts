/**
 * PT: Persiste somente o cenário fictício e migra dados sem alterar snapshots de pedidos.
 * EN: Persists the fictional scenario and migrates data without changing order snapshots.
 */
import { catalogPreview, paginatedCatalog } from './fixtures/catalog';
import { nftDetailFixture } from './fixtures/nftDetails';
import type { CartLine, Collector, Order, Product, Quote, User, Wallet } from '../shared/api/contracts';

type Account = User & { salt: string; passwordHash: string; wallets: Wallet[]; favorites: string[] };
export type StoredOrder = Order & { key: string; requestHash: string; settlesAt: number; outcome: 'confirmed' | 'refused' };
export type Database = {
  products: Product[]; users: Account[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
  carts: Record<string, { lines: CartLine[]; coupon: string }>;
  quotes: Record<string, { owner: string; quote: Quote; signature: string }>;
  orders: StoredOrder[];
  newsletterSubscriptions: { id: string; email: string; subscribedAt: string }[];
};
const STORAGE_KEY = 'kurio.mock-database.v1';
let memory: Database | undefined;
let initialization: Promise<Database> | undefined;

// Hash com salt evita persistir senhas em claro. É uma simulação no navegador,
// não substitui autenticação e armazenamento seguro de um servidor real.
export async function hashPassword(password: string, salt: string): Promise<string> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, material, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
export function publicUser(account: Account): User {
  return { id: account.id, name: account.name, username: account.username, email: account.email, avatar: account.avatar, ens: account.ens, walletNickname: account.walletNickname };
}
export function persist(db: Database): void {
  memory = db;
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
async function seed(): Promise<Database> {
  const passwordHash = await hashPassword('Kurio123!', 'kurio-demo-salt');
  return {
    products: paginatedCatalog.map((nft, index) => ({
      ...nft, details: nftDetailFixture(nft), priceEth: nft.id === 'emerald-ape-042' ? '1.19' : nft.priceEth,
      collection: index % 3 === 0 ? 'arte-digital' : index % 3 === 1 ? 'colecionaveis' : 'arte-3d',
      network: ['Ethereum', 'Polygon', 'Solana'][index % 3], version: 1,
      editions: [{ id: 'unique', label: '1/1', available: 1 }, { id: 'ten', label: '1/10', available: 10 }, { id: 'fifty', label: '1/50', available: 50 }, { id: 'open', label: 'ABERTA', available: 100 }],
    })),
    users: ['ana', 'bruno'].map((id) => ({ id, name: id === 'ana' ? 'Ana Colecionadora' : 'Bruno Colecionador', username: id, ens: `${id}.eth`, walletNickname: 'Minha carteira', email: `${id}@kurio.test`, avatar: '', salt: 'kurio-demo-salt', passwordHash,
      wallets: [{ id: `${id}-wallet`, name: 'Carteira principal', network: 'Ethereum', address: `0x${id === 'ana' ? '1' : '2'}`.padEnd(42, id === 'ana' ? '1' : '2'), primary: true, nickname: 'Principal', profileName: id, type: 'MetaMask', email: `${id}@kurio.test`, ens: `${id}.eth`, referralCode: '', secondaryAddress: '' }], favorites: [] })),
    sessions: {}, carts: {}, quotes: {}, orders: [], newsletterSubscriptions: [],
  };
}
export async function database(): Promise<Database> {
  if (memory) return memory;
  if (!initialization) initialization = (async () => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        memory = JSON.parse(stored) as Database;
        memory.newsletterSubscriptions ??= [];
        // Migra a prévia anterior sem apagar contas, carteiras ou carrinhos salvos.
        memory.products.forEach((product) => { product.details ??= nftDetailFixture(product); product.details.rating = nftDetailFixture(product).rating; product.details.reviewCount = nftDetailFixture(product).reviewCount; if (product.image.endsWith('.png')) product.image = product.image.replace(/\.png$/, '.webp'); });
        // Completa o card identificado na nova referência, mantendo seu id antigo
        // para preservar vínculos de carrinhos já salvos. Recibos ficam intactos.
        const unidentified = memory.products.find((product) => product.id === 'nft-a-confirmar');
        const identified = catalogPreview.find((product) => product.id === 'golden-frequency-071');
        if (unidentified && identified && unidentified.name === 'NFT a confirmar') {
          Object.assign(unidentified, { name: identified.name, priceEth: identified.priceEth, image: identified.image, imageAlt: identified.imageAlt, details: nftDetailFixture(identified), version: unidentified.version + 1 });
        }
        // Expande apenas o catálogo: contas, estoque existente e recibos são preservados.
        for (const [index, nft] of paginatedCatalog.entries()) {
          if (memory.products.some((product) => product.id === nft.id || (nft.id === 'golden-frequency-071' && product.id === 'nft-a-confirmar'))) continue;
          memory.products.push({ ...nft, details: nftDetailFixture(nft), collection: index % 3 === 0 ? 'arte-digital' : index % 3 === 1 ? 'colecionaveis' : 'arte-3d', network: ['Ethereum', 'Polygon', 'Solana'][index % 3], version: 1, editions: [{ id: 'unique', label: '1/1', available: 1 }, { id: 'ten', label: '1/10', available: 10 }, { id: 'fifty', label: '1/50', available: 50 }, { id: 'open', label: 'ABERTA', available: 100 }] });
        }
        const frequency = memory.products.find((product) => product.name === 'Golden Frequency #071');
        if (frequency && identified && frequency.image !== identified.image) { frequency.image = identified.image; frequency.imageAlt = identified.imageAlt; frequency.version += 1; }
        memory.users.forEach((user) => {
          user.username ??= user.email.split('@')[0]; user.ens ??= ''; user.walletNickname ??= '';
          user.wallets.forEach((wallet) => { Object.assign(wallet, { nickname: wallet.nickname ?? wallet.name, profileName: wallet.profileName ?? user.username, type: wallet.type ?? 'MetaMask', email: wallet.email ?? user.email, ens: wallet.ens ?? '', referralCode: wallet.referralCode ?? '', secondaryAddress: wallet.secondaryAddress ?? '' }); });
        });
        return memory;
      } catch { /* Uma cópia inválida é restaurada com o cenário conhecido. */ }
    }
    memory = await seed(); persist(memory); return memory;
  })();
  return initialization;
}
export async function resetDatabase(): Promise<void> { memory = await seed(); persist(memory); }
export type { Account, Collector };
