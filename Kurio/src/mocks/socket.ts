/**
 * PT: Adapta MSW ao protocolo Socket.IO e filtra eventos privados pela sessão inscrita.
 * EN: Adapts MSW to Socket.IO and filters private events using the subscribed session.
 */
import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { database } from './database';
import { registerMockConnection, subscribeMockEvents } from './events';

// O transporte é WebSocket; a binding implementa os frames Engine.IO/Socket.IO.
// PT: MSW 2.10 normaliza /socket.io/ para / antes de comparar a rota.
// EN: MSW 2.10 normalizes /socket.io/ to / before matching the route.
const endpoint = ws.link(/^wss?:\/\/[^/]+\/$/);
export const socketHandlers = [endpoint.addEventListener('connection', (connection) => {
  // PT: Preserva outros WebSockets, incluindo o HMR do Vite.
  // EN: Passes through other WebSockets, including Vite HMR.
  if (!connection.client.url.pathname.startsWith('/socket.io/')) { connection.server.connect(); return; }
  const io = toSocketIo(connection);
  let token = '', subscribed = false;
  io.client.on('subscribe', (_event, payload: { token?: string }) => { token = payload?.token ?? ''; subscribed = true; io.client.emit('subscription.ready'); });
  const unsubscribe = subscribeMockEvents(async (event) => {
    if (!subscribed) return;
    const db = await database(), session = db.sessions[token];
    // Eventos privados só seguem para a sessão dona do pedido, ainda válida.
    if (event.type === 'order.updated' && (!session || session.userId !== event.userId || session.expiresAt < Date.now())) return;
    io.client.emit(event.type, event);
  });
  const unregister = registerMockConnection(() => connection.client.close());
  // Heartbeat Engine.IO evita desconectar após o pingTimeout da handshake.
  const heartbeat = setInterval(() => connection.client.send('2'), 20000);
  connection.client.addEventListener('close', () => { clearInterval(heartbeat); unsubscribe(); unregister(); });
})];
