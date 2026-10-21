/**
 * PT: Exibe o carrinho e a cotação fornecidos pela API; não recalcula valores na UI.
 * EN: Displays API cart and quote data; it never recalculates amounts in the UI.
 */
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useCart, useCoupon, useQuote, useUpdateCartItem } from '../../features/cart/api';
import { CartItemRow } from '../../features/cart/components/CartItemRow';
import { CollectionRecommendations } from '../../features/catalog/components/CollectionRecommendations';
import { api, errorMessage } from '../../shared/api/client';
import type { Product } from '../../shared/api/contracts';
import { FinancialSummary } from '../../shared/ui/FinancialSummary';
import { LoadingState } from '../../shared/ui/LoadingState';
import './cart.css';

export function CartPage() {
  const cart = useCart(), quote = useQuote(), update = useUpdateCartItem(), coupon = useCoupon();
  const [code, setCode] = useState('');
  const recommendations = useQuery({ queryKey: ['recommendations'], queryFn: async ({ signal }) => (await api.get<Product[]>('/recommendations', { signal })).data });
  if (cart.isPending) return <LoadingState />;
  if (cart.isError) return <section className="route-message"><h1>Carrinho</h1><p role="alert">{errorMessage(cart.error)}</p><button className="button" onClick={() => cart.refetch()}>Tentar novamente</button></section>;
  const items = cart.data?.items ?? [];

  return <div className="cart-page">
    <nav className="cart-breadcrumbs" aria-label="Caminho da página"><Link to="/">Início</Link><span aria-hidden="true">/</span><Link to="/" hash="mercado">Mercado</Link><span aria-hidden="true">/</span><span aria-current="page">Carrinho</span></nav>
    {/* Título acessível, sem adicionar uma linha ausente no Figma. */}
    <h1 className="visually-hidden">Carrinho de NFTs</h1>
    {items.length ? <div className="cart-layout">
      <div className="cart-list-area">
        {/* Tabela associa cada preço e quantidade ao NFT correto. */}
        <table className="cart-table">
          <caption className="visually-hidden">NFTs no carrinho</caption>
          <thead><tr><th scope="col">NFTs</th><th scope="col">Preço</th><th scope="col">Edições</th><th scope="col">Total</th><th scope="col"><span className="visually-hidden">Remover</span></th></tr></thead>
          <tbody>{items.map((item) => <CartItemRow key={`${item.nftId}-${item.editionId}`} item={item} busy={update.isPending} onChange={(line) => update.mutate(line)} />)}</tbody>
        </table>
        {update.isError && <p role="alert">{errorMessage(update.error)}</p>}
        {update.isPending && <p className="cart-update-status" role="status">Atualizando carrinho...</p>}
      </div>
      <aside className="order-summary cart-summary" aria-label="Resumo da carteira">
        <h2>Resumo da carteira</h2>
        <form onSubmit={(event) => { event.preventDefault(); coupon.mutate(code); }}>
          <label htmlFor="coupon">Código promocional</label>
          <div className="inline-field"><input id="coupon" value={code} placeholder="Digite o código promocional..." onChange={(event) => setCode(event.target.value)} /><button className="button" disabled={coupon.isPending}>Aplicar</button></div>
        </form>
        {cart.data?.coupon && <p>Cupom {cart.data.coupon} <button className="text-action" disabled={coupon.isPending} onClick={() => coupon.mutate('')}>Remover</button></p>}
        {coupon.isError && <p role="alert">{errorMessage(coupon.error)}</p>}
        {quote.isPending ? <LoadingState cards={1} /> : quote.isError ? <p role="alert">{errorMessage(quote.error)}</p> : quote.data && <>
          {/* Valores da cotação, sem copiar os totais fixos da captura. */}
          <FinancialSummary totals={quote.data} discountLabel="Desconto do lançamento" showFeeNote />
          <Link to="/checkout" className="button wide-button">Conectar e finalizar</Link>
        </>}
        <Link to="/" hash="mercado" className="continue-shopping">Continuar explorando</Link>
      </aside>
    </div> : <section className="cart-empty"><h2>Seu carrinho está vazio</h2><Link to="/" hash="mercado" className="button">Explorar NFTs</Link></section>}
    {recommendations.isError ? <p role="alert">Não foi possível carregar as recomendações. <button className="text-action" onClick={() => recommendations.refetch()}>Tentar novamente</button></p> : <CollectionRecommendations title="Colecionadores também viram" nfts={recommendations.data ?? []} loading={recommendations.isPending} />}
  </div>;
}
