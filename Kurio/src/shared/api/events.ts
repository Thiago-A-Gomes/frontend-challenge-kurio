/**
 * PT: Descreve ou distribui eventos da simulação; a UI recebe eventos pela conexão Socket.IO.
 * EN: Describes or distributes simulation events; the UI receives events over Socket.IO.
 */
import type { Order, Product } from './contracts';

export type MarketEvent = {
  eventId: string; type: 'nft.updated'; resourceId: string; version: number; data: Product;
} | {
  eventId: string; type: 'order.updated'; resourceId: string; version: number; userId: string; data: Order;
};
