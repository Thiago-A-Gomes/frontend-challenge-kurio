/**
 * PT: Contratos de transporte: ETH é string decimal e quantidades são inteiras.
 * EN: Transport contracts: ETH uses decimal strings and quantities are integers.
 */
import type { Nft } from '../model/nft';

// Contratos descrevem o que trafega na rede. Valores monetários são strings.
export type Edition = { id: string; label: string; available: number };
export type ProductDetails = {
  token: string; collectionName: string; attributes: string[]; about: string;
  description: string; ownership: string; networkInfo: string; royalties: string;
  contract: string; rating: number; reviewCount: number;
};
export type Product = Nft & { collection: string; network: string; editions: Edition[]; version: number; details: ProductDetails };
export type Review = { id: string; name: string; rating: number; text: string };
export type User = { id: string; name: string; username: string; email: string; avatar: string; ens: string; walletNickname: string };
export type Session = { user: User; token: string; expiresAt: number };
export type Wallet = { id: string; name: string; address: string; network: string; primary: boolean; nickname: string; profileName: string; type: string; email: string; ens: string; referralCode: string; secondaryAddress: string };
export type CartLine = { nftId: string; editionId: string; quantity: number };
export type CartItem = CartLine & { product: Product; unitPrice: string; lineTotal: string; available: number };
export type Cart = { items: CartItem[]; coupon: string };
export type Totals = { subtotal: string; discount: string; networkFee: string; total: string };
export type Quote = Totals & { id: string; items: CartItem[]; coupon: string; expiresAt: number };
export type Collector = { name: string; username: string; email: string; walletId: string; walletAddress: string; walletType: string; network: string; profileName: string; referralCode: string; ens: string; secondaryAddress: string; notes: string };
export type Order = {
  id: string; userId: string; status: 'pending' | 'confirmed' | 'refused';
  items: CartItem[]; totals: Totals; wallet: Wallet; collector: Collector;
  transaction: string; createdAt: number; version: number;
};
export type CatalogSearch = { q: string; collection: string; network: string; sort: string; page: number; min: string; max: string; category: string };
export type CatalogResponse = { items: Product[]; total: number; pages: number; page: number };
export type ApiError = { message: string; fields?: Record<string, string> };
export type NewsletterSubscription = {
  id: string;
  email: string;
  subscribedAt: string;
  alreadySubscribed: boolean;
  simulated: true;
};

