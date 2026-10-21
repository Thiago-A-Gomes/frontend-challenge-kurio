/**
 * PT: Compartilha a apresentação de recomendações entre carrinho e detalhe.
 * EN: Shares recommendation presentation between cart and detail pages.
 */
import { NftCard } from './NftCard';
import type { Nft } from '../model/nft';
import { LoadingState } from '../../../shared/ui/LoadingState';
import '../recommendations.css';

type Props = { title: string; nfts: readonly Nft[]; loading?: boolean };

// O mesmo bloco visual é compartilhado pelo detalhe e pelo carrinho.
export function CollectionRecommendations({ title, nfts, loading = false }: Props) {
  return <section className="collection-recommendations" aria-label={title}>
    <h2>{title}</h2>
    {loading ? <LoadingState cards={5} /> : <div className="recommendation-grid">{nfts.map((nft) => <NftCard key={nft.id} nft={nft} />)}</div>}
  </section>;
}
