/**
 * PT: Implementa abas por teclado e carrega avaliações somente quando necessárias.
 * EN: Implements keyboard tabs and loads reviews only when needed.
 */
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, errorMessage } from '../../../shared/api/client';
import type { Product, Review } from '../../../shared/api/contracts';
import { LoadingState } from '../../../shared/ui/LoadingState';

export function NftInformation({ nft }: { nft: Product }) {
  const [tab, setTab] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reviews = useQuery({ queryKey: ['reviews', nft.id], enabled: tab === 1, queryFn: async ({ signal }) => (await api.get<Review[]>(`/nfts/${nft.id}/reviews`, { signal })).data });
  const details = nft.details;
  return <section className="nft-detail-description" aria-label="Informações sobre o NFT">
    <div className="nft-information-tabs" role="tablist" aria-label="Detalhes e avaliações" onKeyDown={(event) => {
      // Setas, Home e End seguem o comportamento esperado de abas acessíveis.
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 1 - tab : null;
      if (next !== null) { event.preventDefault(); setTab(next); buttons.current[next]?.focus(); }
    }}>
      {['Detalhes do NFT', `Avaliações de colecionadores (${details.reviewCount})`].map((title, index) => <button key={title} ref={(element) => { buttons.current[index] = element; }} role="tab" type="button" id={`nft-tab-${index}`} aria-controls={`nft-panel-${index}`} aria-selected={tab === index} tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)}>{title}</button>)}
    </div>
    <div id="nft-panel-0" role="tabpanel" aria-labelledby="nft-tab-0" hidden={tab !== 0} tabIndex={0}>
      <p>{details.description}</p><p>{details.ownership}</p>
      <dl className="nft-contract-details"><dt>Rede:</dt><dd>{details.networkInfo}</dd><dt>Contrato:</dt><dd>{details.royalties}</dd><dt>Direitos autorais:</dt><dd>{details.contract}</dd></dl>
    </div>
    <div id="nft-panel-1" role="tabpanel" aria-labelledby="nft-tab-1" hidden={tab !== 1} tabIndex={0}>
      <p className="reviews-demo-note">Avaliações fictícias para demonstração.</p>
      {reviews.isPending ? <LoadingState cards={3} /> : reviews.isError ? <><p role="alert">{errorMessage(reviews.error)}</p><button className="button" onClick={() => reviews.refetch()}>Tentar novamente</button></> : reviews.data?.map((review) => <article className="nft-review" key={review.id}><h3>{review.name}</h3><span aria-label={`${review.rating} de 5 estrelas`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span><p>{review.text}</p></article>)}
    </div>
  </section>;
}
