/**
 * PT: Exibe o snapshot imutável do pedido e recupera estados pendentes após atualização.
 * EN: Displays the immutable order snapshot and recovers pending states after reload.
 */
import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../features/account/api';
import { invalidateCart } from '../../features/cart/api';
import { api, errorMessage } from '../../shared/api/client';
import type { Order } from '../../shared/api/contracts';
import { FinancialSummary } from '../../shared/ui/FinancialSummary';
import { LoadingState } from '../../shared/ui/LoadingState';
import { Button } from '../../shared/ui/button';
import './order.css';

export function OrderPage({ orderId }: { orderId: string }) {
  const { data: user } = useSession();
  const explorer = useRef<HTMLDialogElement>(null);
  const order = useQuery({ queryKey: ['order', user?.id, orderId], enabled: !!user, queryFn: async ({ signal }) => (await api.get<Order>(`/orders/${orderId}`, { signal })).data,
    // REST também recupera o estado em reconexões; eventos atualizam o mesmo cache.
    refetchInterval: (query) => query.state.data?.status === 'pending' ? 3000 : false,
  });
  useEffect(() => {
    if (order.data && order.data.status !== 'pending' && user) {
      localStorage.removeItem(`kurio.checkout-attempt.${user.id}`);
      void invalidateCart();
    }
  }, [order.data?.status, user?.id]);
  if (order.isPending) return <LoadingState cards={1} />;
  if (order.isError || !order.data) return <section className="route-message"><h1>Não foi possível recuperar o pedido</h1><p role="alert">{errorMessage(order.error)}</p><Button onClick={() => order.refetch()}>Tentar novamente</Button></section>;
  const receipt = order.data, confirmed = receipt.status === 'confirmed';
  const title = confirmed ? 'Pedido confirmado' : receipt.status === 'refused' ? 'Pagamento recusado' : 'Pedido em processamento';
  return <section className="receipt-page transaction-receipt">
    <Link to="/" className="receipt-close" aria-label="Fechar recibo">×</Link>
    <header className="receipt-heading">
      {/* Ilustração vetorial simples do envelope, sem recurso remoto. */}
      <svg className="receipt-envelope" viewBox="0 0 90 100" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 45 45 15 78 45v45H12zM12 45l33 30 33-30M12 90l24-25M78 90 54 65M24 53V12h42v41" /><text x="45" y="30" textAnchor="middle" fill="currentColor" stroke="none" fontSize="12" fontFamily="monospace">THANK</text><text x="45" y="44" textAnchor="middle" fill="currentColor" stroke="none" fontSize="12" fontFamily="monospace">YOU</text></svg>
      <h1 className="visually-hidden">{title}</h1>
      <p role="status">{confirmed ? 'Seus NFTs agora estão na sua carteira' : receipt.status === 'refused' ? 'Pagamento recusado. Seus itens continuam no carrinho.' : 'Aguardando confirmação do pedido...'}</p>
    </header>
    <dl className="receipt-metadata">
      <div><dt>ID da transação</dt><dd title={receipt.transaction}>{receipt.transaction.slice(0, 8)}…{receipt.transaction.slice(-4)}</dd></div>
      <div><dt>Data</dt><dd>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(receipt.createdAt)}</dd></div>
      <div><dt>Total</dt><dd>{receipt.totals.total} ETH</dd></div><div><dt>Carteira</dt><dd>{receipt.wallet.type ?? receipt.wallet.name}</dd></div>
    </dl>
    <div className="receipt-body"><h2>Detalhes da transação</h2>
      <table className="receipt-table"><thead><tr><th>NFTs</th><th>Edições</th><th>Subtotal</th></tr></thead><tbody>
        {receipt.items.map((item) => <tr key={`${item.nftId}-${item.editionId}`}><td><img src={item.product.image} alt="" width="60" height="60" /><span><strong>{item.product.name}</strong><small>ID do token: #{item.product.details?.token ?? item.nftId}</small></span></td><td>(× {item.quantity})</td><td>{item.lineTotal} ETH</td></tr>)}
      </tbody></table>
      <FinancialSummary totals={receipt.totals} compact />
      <p className="receipt-network-message">{confirmed ? `Transação confirmada na simulação da rede ${receipt.wallet.network}. Seus itens e valores estão registrados neste recibo.` : 'O resultado será atualizado automaticamente. Você pode recarregar esta página para recuperar o pedido.'}</p>
      {confirmed ? <Button className="button" onClick={() => explorer.current?.showModal()}>Ver no explorador (simulado)</Button> : <Button className="button" asChild><Link to={receipt.status === 'refused' ? '/carrinho' : '/'}>{receipt.status === 'refused' ? 'Voltar ao carrinho' : 'Voltar ao início'}</Link></Button>}
    </div>
    {/* Nunca apontamos um identificador fictício para uma transação real. */}
    <dialog ref={explorer} className="explorer-dialog" aria-label="Explorador de transação simulada"><h2>Explorador simulado</h2><p>Pedido: {receipt.id}</p><p>Transação: {receipt.transaction}</p><p>Rede: {receipt.wallet.network}</p><p>Total: {receipt.totals.total} ETH</p><Button autoFocus onClick={() => explorer.current?.close()}>Fechar</Button></dialog>
  </section>;
}
