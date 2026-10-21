/**
 * PT: Isola a conexão por sessão, descarta versões antigas e reconcilia o cache ao reconectar.
 * EN: Scopes the connection to a session, rejects old versions and reconciles cache on reconnect.
 */
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useSession } from '../account/api';
import { SESSION_KEY } from '../../shared/api/client';
import { queryClient } from '../../shared/api/queryClient';
import type { MarketEvent } from '../../shared/api/events';
import type { Order, Product } from '../../shared/api/contracts';
import { waitForNetwork } from '../../shared/api/readiness';

export function useRealtime() {
  const { data: user } = useSession();
  const [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true, connectedBefore = false;
    const seen = new Set<string>(), versions = new Map<string, number>();
    // A sessão tem seu próprio socket. Cleanup impede eventos do usuário anterior.
    let connection: Socket | undefined;
    // PT: Importa depois de worker.start(), pois Engine.IO captura WebSocket ao carregar.
    // EN: Imports after worker.start(), because Engine.IO captures WebSocket on module load.
    void waitForNetwork().then(() => import('socket.io-client')).then(({ io }) => {
    if (!alive) return;
    const socket = io(window.location.origin, { path: '/socket.io/', transports: ['websocket'], autoConnect: false, reconnectionDelay: 500, reconnectionDelayMax: 1500 });
    connection = socket;
    const receive = (event: MarketEvent) => {
      if (!alive || seen.has(event.eventId)) return;
      if (event.type === 'order.updated' && event.userId !== user?.id) return;
      const key = `${event.type}:${event.resourceId}`;
      const cached = event.type === 'nft.updated' ? queryClient.getQueryData<Product>(['nft', event.resourceId]) : queryClient.getQueryData<Order>(['order', user?.id, event.resourceId]);
      if (event.version <= Math.max(versions.get(key) ?? 0, cached?.version ?? 0)) return;
      if (event.type === 'order.updated' && cached && 'status' in cached && cached.status !== 'pending') return;
      seen.add(event.eventId); versions.set(key, event.version);
      if (seen.size > 1000) seen.clear();
      if (event.type === 'nft.updated') {
        queryClient.setQueryData(['nft', event.resourceId], event.data);
        for (const queryKey of [['catalog'], ['cart'], ['quote'], ['related'], ['recommendations']]) void queryClient.invalidateQueries({ queryKey });
        setMessage(`Preço ou disponibilidade de ${event.data.name} mudou. Confira os valores antes de comprar.`);
      } else {
        queryClient.setQueryData(['order', user?.id, event.resourceId], event.data);
        void queryClient.invalidateQueries({ queryKey: ['cart'] });
        setMessage(event.data.status === 'confirmed' ? 'Seu pedido foi confirmado.' : event.data.status === 'refused' ? 'Seu pagamento foi recusado. Os itens continuam no carrinho.' : 'Seu pedido foi atualizado.');
      }
    };
    socket.on('connect', () => {
      if (!alive) return;
      socket.emit('subscribe', { token: localStorage.getItem(SESSION_KEY) ?? '' });
      if (connectedBefore) {
        // Reconcilia com REST, inclusive o pedido que ficou pendente offline.
        for (const queryKey of [['catalog'], ['nft'], ['cart'], ['quote'], ['order']]) void queryClient.invalidateQueries({ queryKey });
        setMessage('Conexão restabelecida. Os dados estão sendo atualizados.');
      }
      connectedBefore = true;
    });
    socket.on('nft.updated', receive); socket.on('order.updated', receive);
    socket.on('disconnect', () => { if (alive && connectedBefore) setMessage('Conexão interrompida. Tentando reconectar...'); });
    socket.connect();
    }).catch(() => { if (alive) setMessage('Atualizações em tempo real indisponíveis. Recarregue para tentar novamente.'); });
    return () => { alive = false; connection?.removeAllListeners(); connection?.disconnect(); };
  }, [user?.id]);
  return message;
}
