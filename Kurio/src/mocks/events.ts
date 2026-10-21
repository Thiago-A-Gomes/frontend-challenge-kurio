/**
 * PT: Descreve ou distribui eventos da simulação; a UI recebe eventos pela conexão Socket.IO.
 * EN: Describes or distributes simulation events; the UI receives events over Socket.IO.
 */
import type { MarketEvent } from '../shared/api/events';

// Barramento apenas do servidor simulado. A UI não o importa: cada entrega
// passa pela conexão WebSocket/MSW e pelo socket.io-client.
const subscribers = new Set<(event: MarketEvent) => void>();
const connections = new Set<() => void>();
export function publishMockEvent(event: MarketEvent): void { subscribers.forEach((listener) => listener(event)); }
export function subscribeMockEvents(listener: (event: MarketEvent) => void): () => void { subscribers.add(listener); return () => { subscribers.delete(listener); }; }
export function registerMockConnection(close: () => void): () => void { connections.add(close); return () => { connections.delete(close); }; }
export function disconnectMockConnections(): void { connections.forEach((close) => close()); }
