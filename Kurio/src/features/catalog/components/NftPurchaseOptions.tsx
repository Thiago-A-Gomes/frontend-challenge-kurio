/**
 * PT: Controla edição e quantidade, respeita estoque e aguarda a API antes de comprar.
 * EN: Controls edition and quantity, respects stock and awaits the API before purchase.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Product } from '../../../shared/api/contracts';
import { errorMessage } from '../../../shared/api/client';
import { useAddCartItem } from '../../cart/api';
import { useSession } from '../../account/api';
import { useFavorites, useToggleFavorite } from '../api';

// As opções e limites agora são recebidos da API junto com o NFT.
export function NftPurchaseOptions({ nft }: { nft: Product }) {
  const editionOptions = nft.editions;
  const add = useAddCartItem(), session = useSession(), favorites = useFavorites(), toggle = useToggleFavorite(), navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [editionId, setEditionId] = useState('fifty');
  const [quantity, setQuantity] = useState(1);
  const edition = editionOptions.find((option) => option.id === editionId) ?? editionOptions[0];
  const favorite = favorites.data?.includes(nft.id) ?? false;
  // Disponibilidade pode mudar na rede; a seleção local nunca excede o limite.
  useEffect(() => { setQuantity((current) => Math.max(1, Math.min(current, edition.available))); }, [edition.available]);

  return (
    <div className="nft-purchase-options">
      <fieldset className="nft-editions">
        <legend>Edição:</legend>
        {/* Radios nativos permitem seleção com Tab e teclas de seta. */}
        {editionOptions.map((option) => (
          <label key={option.id} className={editionId === option.id ? 'is-selected' : ''}>
            <input type="radio" name="nft-edition" value={option.id} checked={editionId === option.id} disabled={option.available === 0} onChange={() => { setEditionId(option.id); setQuantity(1); }} />
            {option.label}
          </label>
        ))}
      </fieldset>
      <div className="nft-purchase-row">
        <div className="nft-quantity" role="group" aria-label="Quantidade de NFTs">
          <button type="button" aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
          <output aria-live="polite" aria-label="Quantidade selecionada">{quantity}</output>
          <button type="button" aria-label="Aumentar quantidade" disabled={quantity >= edition.available} onClick={() => setQuantity((value) => Math.min(edition.available, value + 1))}>+</button>
        </div>
        <div className="nft-detail-actions">
          {/* A API ainda deverá confirmar limites, valores e disponibilidade. */}
          <button type="button" className="button" disabled={!nft.priceEth || edition.available === 0 || add.isPending} onClick={async () => {
            try { await add.mutateAsync({ nftId: nft.id, editionId: edition.id, quantity }); await navigate({ to: '/carrinho' }); } catch (error) { setMessage(errorMessage(error)); }
          }}>{add.isPending ? 'Adicionando...' : 'Comprar'}</button>
          <button type="button" className="nft-favorite" aria-pressed={favorite} disabled={toggle.isPending || session.isPending} onClick={async () => {
            if (!session.data) { await navigate({ to: '/login', search: { returnTo: `/nfts/${nft.id}` } }); return; }
            try { await toggle.mutateAsync({ id: nft.id, favorite }); setMessage(favorite ? 'Favorito removido.' : 'NFT salvo nos favoritos.'); } catch (error) { setMessage(errorMessage(error)); }
          }}>{favorite ? '♥ Favoritado' : '♡ Favoritar'}</button>
        </div>
      </div>
      <p role="status" aria-live="polite">{message}</p>
    </div>
  );
}
