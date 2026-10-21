/**
 * PT: Liga uma arte ao detalhe correto e apresenta texto escapado pelo React.
 * EN: Links artwork to its detail page and displays text escaped by React.
 */
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { Nft } from '../model/nft';
import { imageSources } from '../../../shared/lib/images';

type NftCardProps = {
  nft: Nft;
  priority?: boolean;
};

// Um componente reutilizável: cada card recebe seu próprio objeto nft.
export function NftCard({ nft, priority = false }: NftCardProps) {
  // Guardamos o caminho que falhou para exibir uma alternativa legível.
  // Se o caminho mudar, o React poderá tentar carregar a nova imagem.
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    // article identifica um item que faz sentido individualmente no catálogo.
    <article className="nft-card">
      {/*
        Link produz uma âncora real: funciona por teclado e permite abrir em nova aba.
        to define a rota e params fornece o identificador do NFT escolhido.
      */}
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="nft-card-button"
        aria-label={`Ver detalhes de ${nft.name} ${nft.priceEth === null ? 'Preço a confirmar' : `${nft.priceEth} ETH`}${nft.previousPriceEth ? ` Preço anterior: ${nft.previousPriceEth} ETH` : ''}`}
      >
        <div className="nft-card-art">
          {/* width e height reservam as proporções antes de a imagem carregar. */}
          {failedImage === nft.image ? (
            <div className="nft-image-placeholder">
              <span aria-hidden="true">K</span>
              <small>Imagem a adicionar</small>
            </div>
          ) : <img
            src={nft.image}
            srcSet={imageSources(nft.image)}
            sizes="(max-width: 640px) 45vw, (max-width: 1000px) 30vw, 260px"
            alt={nft.imageAlt}
            width="450"
            height="450"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onError={() => setFailedImage(nft.image)}
          />}
        </div>
        {/* h3 é um subtítulo dentro da seção do catálogo, que usa h2. */}
        <h3>{nft.name}</h3>
        <p className="nft-card-price">
          {nft.priceEth === null ? 'Preço a confirmar' : `${nft.priceEth} ETH`}
          {/* Só mostramos o preço anterior quando o objeto possui esse campo. */}
          {nft.previousPriceEth && (
            <del className="nft-previous-price">
              <span className="visually-hidden">Preço anterior: </span>
              {nft.previousPriceEth} ETH
            </del>
          )}
        </p>
      </Link>
    </article>
  );
}


