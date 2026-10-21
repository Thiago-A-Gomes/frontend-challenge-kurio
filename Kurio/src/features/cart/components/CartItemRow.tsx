/**
 * PT: Associa preços e quantidades ao item correto e envia mudanças sem recalcular totais.
 * EN: Associates amounts and quantities with the correct item and sends changes without recomputing totals.
 */
import { Link } from '@tanstack/react-router';
import type { CartItem, CartLine } from '../../../shared/api/contracts';

type Props = { item: CartItem; busy: boolean; onChange: (line: CartLine) => void };

// Linha reutilizável: recebe os valores da API e envia somente a nova quantidade.
export function CartItemRow({ item, busy, onChange }: Props) {
  const quantityId = `quantity-${item.nftId}-${item.editionId}`;
  const change = (quantity: number) => onChange({ nftId: item.nftId, editionId: item.editionId, quantity });
  return <tr>
    <td className="cart-product-cell">
      <Link className="cart-product-link" to="/nfts/$nftId" params={{ nftId: item.nftId }}>
        <img src={item.product.image} alt={item.product.imageAlt} width="64" height="64" />
        <span><strong>{item.product.name}</strong><small>ID do token: #{item.product.details.token}</small></span>
      </Link>
    </td>
    <td className="cart-price-cell" data-label="Preço">{item.unitPrice} ETH</td>
    <td className="cart-quantity-cell" data-label="Edições">
      {/* O label distingue a quantidade de cada NFT para leitores de tela. */}
      <label className="visually-hidden" htmlFor={quantityId}>Quantidade de {item.product.name}, edição {item.product.editions.find((edition) => edition.id === item.editionId)?.label}</label>
      <div className="cart-quantity-control">
        <button type="button" aria-label={`Diminuir quantidade de ${item.product.name}`} disabled={busy || item.quantity <= 1} onClick={() => change(item.quantity - 1)}>−</button>
        <input id={quantityId} type="number" min="1" max={Math.max(1, item.available)} value={item.quantity} disabled={busy} onChange={(event) => { const quantity = Number(event.target.value); if (Number.isInteger(quantity) && quantity >= 1) change(quantity); }} />
        <button type="button" aria-label={`Aumentar quantidade de ${item.product.name}`} disabled={busy || item.quantity >= item.available} onClick={() => change(item.quantity + 1)}>+</button>
      </div>
    </td>
    <td className="cart-total-cell" data-label="Total">{item.lineTotal} ETH</td>
    <td className="cart-remove-cell">
      <button className="cart-remove-button" type="button" disabled={busy} aria-label={`Remover ${item.product.name} do carrinho`} onClick={() => change(0)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" /></svg>
      </button>
    </td>
  </tr>;
}
