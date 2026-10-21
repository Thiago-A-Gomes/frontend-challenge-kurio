/**
 * PT: Revisa dados e revalida a cotação antes de enviar uma tentativa idempotente.
 * EN: Reviews collector data and revalidates the quote before sending an idempotent attempt.
 */
import { useEffect, useRef, useState } from 'react';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { useCoupon } from '../../features/cart/api';
import './checkout.css';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSession, useWallets } from '../../features/account/api';
import { useCart, useQuote } from '../../features/cart/api';
import { api, errorMessage } from '../../shared/api/client';
import type { Collector, Order, Quote } from '../../shared/api/contracts';
import { FinancialSummary } from '../../shared/ui/FinancialSummary';
import { LoadingState } from '../../shared/ui/LoadingState';
import axios from 'axios';

// Compara o conteúdo econômico da cotação, ignorando id e data de expiração.
function fingerprint(quote: Quote): string {
  return JSON.stringify([quote.total, quote.coupon, quote.items.map((item) => [item.nftId, item.editionId, item.quantity, item.unitPrice, item.available, item.product.version])]);
}
type Attempt = { key: string; body: { quoteId: string; walletId: string; network: string; collector: Collector } };

export function CheckoutPage() {
  const session = useSession(), wallets = useWallets(), cart = useCart(), quote = useQuote(), navigate = useNavigate();
  const [walletId, setWalletId] = useState(''), [connected, setConnected] = useState(false);
  const [review, setReview] = useState<{ collector: Collector; fingerprint: string } | null>(null);
  const coupon = useCoupon();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const wallet = wallets.data?.find((item) => item.id === walletId) ?? wallets.data?.find((item) => item.primary) ?? wallets.data?.[0];
  const attemptKey = `kurio.checkout-attempt.${session.data?.id}`;
  const draftKey = `kurio.checkout-draft.${session.data?.id}`;
  const formRef = useRef<HTMLFormElement>(null);
  const restored = useRef('');
  // PT: Rascunho por usuário permite retomar após expiração, sem guardar senhas.
  // EN: User-scoped drafts resume after expiry without storing passwords.
  useEffect(() => {
    if (!formRef.current || !session.data || restored.current === draftKey) return;
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? '{}') as Record<string, string>;
      for (const name of ['name', 'username', 'email', 'profileName', 'referralCode', 'ens', 'secondaryAddress', 'notes']) {
        const field = formRef.current.elements.namedItem(name);
        if ((field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) && typeof draft[name] === 'string') field.value = draft[name];
      }
    } catch { sessionStorage.removeItem(draftKey); }
    restored.current = draftKey;
  }, [draftKey, session.data, cart.isPending, quote.isPending, wallets.isPending]);
  function persistDraft(form: HTMLFormElement): void {
    const data = new FormData(form);
    const draft = Object.fromEntries(['name', 'username', 'email', 'profileName', 'referralCode', 'ens', 'secondaryAddress', 'notes'].map((name) => [name, String(data.get(name) ?? '')]));
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }


  async function sendOrder(): Promise<void> {
    if (!wallet || !review || !connected) return;
    setBusy(true); setMessage('');
    try {
      const stored = localStorage.getItem(attemptKey);
      let attempt: Attempt;
      if (stored) {
        attempt = JSON.parse(stored) as Attempt;
        // Primeiro recupera o resultado: timeout não significa compra inexistente.
        try {
          const recovered = await api.get<Order>(`/orders/by-key/${attempt.key}`);
          await navigate({ to: '/pedidos/$orderId', params: { orderId: recovered.data.id } }); return;
        } catch (error) { if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error; }
      } else {
        const current = (await api.post<Quote>('/quotes')).data;
        if (fingerprint(current) !== review.fingerprint) {
          await quote.refetch(); setReview(null); setMessage('Os valores ou a disponibilidade mudaram. Revise e confirme novamente.'); return;
        }
        attempt = { key: crypto.randomUUID(), body: { quoteId: current.id, walletId: wallet.id, network: wallet.network, collector: review.collector } };
        // Guarda a tentativa antes do envio e mantém a mesma chave após timeout.
        localStorage.setItem(attemptKey, JSON.stringify(attempt));
      }
      const result = await api.post<Order>('/orders', attempt.body, { headers: { 'Idempotency-Key': attempt.key } });
      sessionStorage.removeItem(draftKey);
      await navigate({ to: '/pedidos/$orderId', params: { orderId: result.data.id } });
    } catch (error) {
      if (axios.isAxiosError(error) && [400, 409].includes(error.response?.status ?? 0)) { localStorage.removeItem(attemptKey); setReview(null); await quote.refetch(); }
      // PT: Timeout pode ocorrer depois da criação; consulta a mesma chave antes de repetir.
      // EN: Timeout may follow creation; recover by the same key before retrying.
      if (axios.isAxiosError(error) && !error.response) {
        const stored = localStorage.getItem(attemptKey);
        if (stored) {
          try { const attempt = JSON.parse(stored) as Attempt; const recovered = await api.get<Order>(`/orders/by-key/${attempt.key}`); await navigate({ to: '/pedidos/$orderId', params: { orderId: recovered.data.id } }); return; }
          catch { /* Mantém a chave para recuperação explícita após reconexão. / Keeps the key for recovery. */ }
        }
      }
      setMessage(errorMessage(error));
    } finally { setBusy(false); }
  }

  if (cart.isPending || wallets.isPending) return <LoadingState />;
  if (!cart.data?.items.length && localStorage.getItem(attemptKey)) return <section className="route-message"><h1>Recuperando seu pedido</h1><p role="status">{busy ? 'Aguardando a resposta da compra. Seus itens podem já ter sido confirmados.' : message || 'Consulte o resultado da tentativa antes de iniciar outra compra.'}</p><Button className="button" disabled={busy} onClick={async () => {
    setBusy(true);
    try { const attempt = JSON.parse(localStorage.getItem(attemptKey)!) as Attempt; const recovered = await api.get<Order>(`/orders/by-key/${attempt.key}`); await navigate({ to: '/pedidos/$orderId', params: { orderId: recovered.data.id } }); }
    catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }}>Recuperar resultado</Button></section>;
  if (!cart.data?.items.length) return <section className="route-message"><h1>Seu carrinho está vazio</h1><Link to="/" hash="mercado" className="button">Voltar ao catálogo</Link></section>;
  if (quote.isPending) return <LoadingState />;
  return <section className="commerce-page checkout-page">
    <nav className="cart-breadcrumbs" aria-label="Caminho da página"><Link to="/">Início</Link><span>/</span><Link to="/" hash="mercado">Mercado</Link><span>/</span><span aria-current="page">Pagamento</span></nav>
    <h1 className="visually-hidden">Pagamento</h1>
    <div className="commerce-columns">
      <div><h2>Perfil do colecionador</h2>
        {/* O botão de revisão usa form=checkout-form, mesmo estando no resumo. */}
        <form id="checkout-form" ref={formRef} className="checkout-form" aria-describedby="checkout-feedback" onChange={(event) => { setReview(null); persistDraft(event.currentTarget); }} onSubmit={(event) => {
          event.preventDefault(); if (!quote.data || !wallet) return;
          if (!connected) { setMessage('Conecte uma carteira para continuar.'); return; }
          const data = new FormData(event.currentTarget);
          const collector: Collector = { name: String(data.get('name')), username: String(data.get('username')), email: String(data.get('email')), profileName: String(data.get('profileName')), referralCode: String(data.get('referralCode') ?? ''), ens: String(data.get('ens') ?? ''), secondaryAddress: String(data.get('secondaryAddress') ?? ''), notes: String(data.get('notes') ?? ''), walletId: wallet.id, walletAddress: wallet.address, walletType: wallet.type, network: wallet.network };
          setReview({ collector, fingerprint: fingerprint(quote.data) }); setMessage('');
        }}>
          <div className="checkout-fields">
            <label><span>Nome de exibição<span className="checkout-required" aria-hidden="true">*</span></span><Input name="name" autoComplete="name" defaultValue={session.data?.name} required minLength={2} /></label>
            <label><span>Nome de usuário<span className="checkout-required" aria-hidden="true">*</span></span><Input name="username" autoComplete="username" defaultValue={session.data?.username} required /></label>
            <label><span>Rede<span className="checkout-required" aria-hidden="true">*</span></span><select aria-label="Rede" value={wallet?.network ?? ''} onChange={(event) => { const next = wallets.data?.find((item) => item.network === event.target.value); if (next) { setWalletId(next.id); setConnected(false); } else setMessage('Cadastre uma carteira nessa rede para utilizá-la.'); }}><option value="" disabled>Selecione uma rede</option><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label>
            <label><span>Nome do perfil<span className="checkout-required" aria-hidden="true">*</span></span><Input name="profileName" defaultValue={session.data?.username} required /></label>
            <label><span>Endereço da carteira<span className="checkout-required" aria-hidden="true">*</span></span><Input name="walletAddress" value={wallet?.address ?? ''} readOnly required /></label>
            <label>Endereço secundário (opcional)<Input name="secondaryAddress" defaultValue={wallet?.secondaryAddress} placeholder="ENS ou carteira secundária (opcional)" /></label>
            <label>Tipo de carteira<Input name="walletType" value={wallet?.type ?? ''} readOnly /></label>
            <label>Código de indicação (opcional)<Input name="referralCode" defaultValue={wallet?.referralCode} /></label>
            <label><span>E-mail<span className="checkout-required" aria-hidden="true">*</span></span><Input name="email" type="email" autoComplete="email" defaultValue={session.data?.email} required /></label>
            <label>Nome ENS (opcional)<Input name="ens" defaultValue={session.data?.ens} placeholder="nome.eth" /></label>
          </div>
          <Link to="/carteiras" className="text-action">Usar outra carteira?</Link>
          <label className="collector-notes">Observação do colecionador (opcional)<textarea name="notes" rows={6} /></label>
        </form>
      </div>
      <aside className="order-summary checkout-summary"><h2>Seus NFTs</h2>
        <div className="checkout-summary-head"><span>NFTs</span><span>Subtotal</span></div>
        {cart.data.items.map((item) => <div className="checkout-item" key={`${item.nftId}-${item.editionId}`}><img src={item.product.image} alt="" width="56" height="56" /><div><strong>{item.product.name}</strong><p>ID do token: #{item.product.details.token} (× {item.quantity})</p></div><span className="checkout-line-total">{item.lineTotal} ETH</span></div>)}
        <details className="checkout-coupon"><summary>Tem um código promocional? Aplique aqui</summary><form className="inline-field" onSubmit={(event) => { event.preventDefault(); coupon.mutate(code, { onSuccess: () => setReview(null) }); }}><Input aria-label="Código promocional" value={code} onChange={(event) => setCode(event.target.value)} /><Button size="sm" disabled={coupon.isPending}>Aplicar</Button></form>{coupon.isError && <p role="alert">{errorMessage(coupon.error)}</p>}</details>
        {quote.isError && <p role="alert">{errorMessage(quote.error)}</p>}
        {quote.data && <FinancialSummary totals={quote.data} discountLabel="Desconto do lançamento" showFeeNote />}
        <fieldset className="checkout-wallets"><legend>Carteira e rede</legend>
          {wallets.data?.map((item) => <label className="checkout-wallet-choice" key={item.id}><input type="radio" name="checkout-wallet" checked={wallet?.id === item.id} onChange={() => { setWalletId(item.id); setConnected(false); setReview(null); }} /><span>{item.type}<small>{item.name} · {item.network}</small></span></label>)}
          {!wallets.data?.length && <p><Link to="/carteiras">Cadastre uma carteira</Link> para continuar.</p>}
          {wallets.isError && <p role="alert">{errorMessage(wallets.error)}</p>}
        </fieldset>
        <div className="checkout-connect-actions"><Button type="button" variant="outline" size="sm" disabled={!wallet} onClick={() => { setConnected(!connected); setReview(null); setMessage(''); }}>{connected ? 'Desconectar' : 'Conectar carteira'}</Button><button type="button" className="text-action" onClick={() => { setConnected(false); setReview(null); setMessage('A conexão foi recusada pela carteira.'); }}>Simular recusa</button></div>
        <p className="connection-status" role="status">{connected ? 'Carteira conectada na simulação.' : 'Carteira desconectada.'}</p>
        {review ? <section className="review-panel" aria-label="Revisão do pedido"><h2>Revise antes de confirmar</h2><p>{review.collector.name} · {review.collector.email}</p><p>{wallet?.type} · {wallet?.network}</p><Button className="w-full" disabled={busy || !connected} onClick={() => void sendOrder()}>{busy ? 'Enviando...' : 'Confirmar compra'}</Button></section> : <Button type="submit" form="checkout-form" className="w-full" disabled={!quote.data || !wallet || busy}>Revisar pedido</Button>}
        <p id="checkout-feedback" role="alert">{message}</p>
        <Link to="/carrinho" className="continue-shopping">Voltar ao carrinho</Link>
      </aside>
    </div>
  </section>;
}
