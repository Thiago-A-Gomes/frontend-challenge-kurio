/**
 * PT: Compõe galeria, compra, informações e recomendações a partir do contrato REST.
 * EN: Composes gallery, purchase controls, information and recommendations from the REST contract.
 */
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { CollectionRecommendations } from '../../features/catalog/components/CollectionRecommendations';
import { NftGallery } from '../../features/catalog/components/NftGallery';
import { NftPurchaseOptions } from '../../features/catalog/components/NftPurchaseOptions';
import { NftInformation } from '../../features/catalog/components/NftInformation';
import { SocialIcon } from '../../widgets/layout/SocialIcon';
import type { Nft } from '../../features/catalog/model/nft';
import type { Product } from '../../shared/api/contracts';
import type { PendingFeatureHandler } from '../../shared/types/feedback';
import './nft-details.css';

type NftDetailsPageProps = {
  nft: Product;
  relatedNfts: readonly Nft[];
  onPendingFeature: PendingFeatureHandler;
};

// A página apresenta os dados da API. Compra e favoritos usam mutations;
// somente uma resposta da simulação confirma alterações de negócio.
export function NftDetailsPage({ nft, relatedNfts }: NftDetailsPageProps) {
  const [shareMessage, setShareMessage] = useState('');
  const shareUrl = encodeURIComponent(window.location.href);
  useEffect(() => {
    // Cada página tem um título próprio na aba do navegador.
    const previousTitle = document.title;
    document.title = `${nft.name} | Kurio`;
    return () => { document.title = previousTitle; };
  }, [nft.name]);

  return (
    <div className="nft-details-page">
      <nav className="nft-breadcrumbs" aria-label="Caminho da página">
        <Link to="/">Início</Link><span aria-hidden="true">/</span>
        <Link to="/" hash="mercado">Mercado</Link>
      </nav>
      <section className="nft-detail-overview" aria-labelledby="nft-detail-title">
        <NftGallery nft={nft} />
        <div className="nft-detail-info">
          <h1 id="nft-detail-title">{nft.name}</h1>
          <div className="nft-price-and-rating">
            <p className="nft-detail-price">{nft.priceEth === null ? 'Preço a confirmar' : `${nft.priceEth} ETH`}</p>
            <div className="nft-rating"><span className="rating-stars" aria-label={`${nft.details.rating} de 5 estrelas`}>★★★★★</span><span>{nft.details.reviewCount} avaliações de colecionadores</span></div>
          </div>
          <h2>Sobre este NFT:</h2>
          <p>{nft.details.about}</p>
          <NftPurchaseOptions nft={nft} />
          <dl className="nft-metadata">
            <div><dt>ID do token:</dt><dd>#{nft.details.token}</dd></div>
            <div><dt>Coleção:</dt><dd>{nft.details.collectionName}</dd></div>
            <div><dt>Atributos:</dt><dd>{nft.details.attributes.join(', ')}</dd></div>
          </dl>
          <div className="nft-share"><span>Compartilhar este NFT:</span>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no LinkedIn"><SocialIcon name="LinkedIn" /></a>
            <a href={`mailto:?subject=${encodeURIComponent(nft.name)}&body=${shareUrl}`} aria-label="Compartilhar por e-mail">✉</a>
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(nft.name)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no Twitter"><SocialIcon name="Twitter" /></a>
            <button type="button" className="copy-nft-link" aria-label="Copiar link do NFT" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setShareMessage('Link copiado.'); } catch { setShareMessage('Não foi possível copiar o link.'); } }}>Copiar link</button>
          </div>
          <p className="nft-share-status" role="status">{shareMessage}</p>
        </div>
      </section>
      <NftInformation nft={nft} />
      <CollectionRecommendations title="Mais desta coleção" nfts={relatedNfts} />
    </div>
  );
}
