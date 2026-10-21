/**
 * PT: Apresenta dados recebidos por props; filtros mobile usam diálogo com foco nativo.
 * EN: Presents data received through props; mobile filters use a native focus-managed dialog.
 */
import { useRef } from 'react';
import { useMediaQuery } from '../../../shared/lib/useMediaQuery';
import { NftCard } from './NftCard';
import { CatalogFilters } from './CatalogFilters';
import { FeaturedNft } from './FeaturedNft';
import type { Nft } from '../model/nft';
import type { Collection } from '../model/collection';
import type { PendingFeatureHandler } from '../../../shared/types/feedback';
import '../catalog.css';
import type { CatalogSearch } from '../../../shared/api/contracts';

// O catálogo recebe dados por props: não depende de fixtures nem de HTTP.
// A página decide de onde os dados vêm; este componente decide como exibi-los.
type MarketplaceProps = {
  nfts: readonly Nft[];
  collections: readonly Collection[];
  onPendingFeature: PendingFeatureHandler;
  search: CatalogSearch;
  pages: number;
  onSearch: (change: Partial<CatalogSearch>) => void;
};

export function Marketplace({ nfts, collections, search, pages, onSearch }: MarketplaceProps) {
  const mobile = useMediaQuery('(max-width: 640px)');
  const filterDialog = useRef<HTMLDialogElement>(null);
  const sidebar = (<aside className="marketplace-sidebar" aria-label="Filtros e destaque do catálogo">
        <div className="catalog-filter-panel">
        <h2>Coleções</h2>
        <ul className="collection-list">
          {/*
            map transforma cada objeto da lista em um elemento JSX.
            key identifica cada item para o React acompanhar as atualizações.
            Usamos um id estável, em vez da posição do item na lista.
          */}
          {collections.map((collection) => (
            <li key={collection.id}>
              <button type="button" className="collection-button" aria-pressed={search.collection === collection.id} onClick={() => onSearch({ collection: search.collection === collection.id ? '' : collection.id })}>
                <span>{collection.name}</span>
                <span>({collection.count})</span>
              </button>
            </li>
          ))}
        </ul>
        <CatalogFilters search={search} onSearch={onSearch} />
        </div>
        <FeaturedNft />
      </aside>);
  return (
    <section id="mercado" className="marketplace" aria-label="Mercado de NFTs">
      {mobile ? <dialog ref={filterDialog} className="mobile-filter-dialog" aria-label="Filtros do catálogo"><div className="mobile-filter-heading"><h2>Filtrar coleções</h2><button className="text-action" type="button" onClick={() => filterDialog.current?.close()}>Fechar filtros</button></div>{sidebar}<button className="button" type="button" onClick={() => filterDialog.current?.close()}>Ver resultados</button></dialog> : sidebar}
      <div className="marketplace-content">
        {mobile && <button className="button mobile-filter-open" type="button" onClick={() => filterDialog.current?.showModal()}>Filtrar coleções <span aria-hidden="true">☷</span></button>}
        <div className="marketplace-toolbar">
          <h2 className="visually-hidden">Catálogo de NFTs</h2>
          {/* Botões comuns: não usamos semântica de tabs sem painéis implementados. */}
          <div className="catalog-categories" role="group" aria-label="Categorias do catálogo">
            {[['all', 'Todos os NFTs'], ['new', 'Novos lançamentos'], ['trending', 'Em alta']].map(([id, name]) => <button key={id} className={`catalog-category${search.category === id ? ' is-current' : ''}`} type="button" aria-pressed={search.category === id} onClick={() => onSearch({ category: id })}>{name}</button>)}
          </div>
          <label className="catalog-sort-note">Ordenar por: <select value={search.sort} onChange={(event) => onSearch({ sort: event.target.value })}><option value="recent">Listados recentemente</option><option value="name">Nome (A–Z)</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label>
        </div>
        <label className="catalog-search-label" htmlFor="catalog-search">Buscar NFT</label>
        <div className="inline-field catalog-search-field"><input id="catalog-search" type="search" value={search.q} onChange={(event) => onSearch({ q: event.target.value })} placeholder="Nome do NFT..." /><button className="text-action" onClick={() => onSearch({ ...search, q: '', collection: '', network: '', min: '', max: '', category: 'all' })}>Limpar filtros</button></div>

        {/* map cria um card por objeto; key mantém a identidade de cada NFT. */}
        <div className="nft-grid">
          {!nfts.length && <p role="status">Nenhum NFT encontrado. Tente outros filtros.</p>}
          {nfts.map((nft, index) => (
            <NftCard
              key={nft.id}
              nft={nft}
              priority={index < 2}
            />
          ))}
        </div>
        {/* A API informa as páginas; cada botão atualiza a URL e consulta outros itens. */}
        <nav className="catalog-pagination" aria-label="Paginação do catálogo">
          {Array.from({ length: pages }, (_, index) => index + 1).map((page) => (
            <button key={page} type="button" aria-label={`Página ${page}`} aria-current={page === search.page ? 'page' : undefined} onClick={() => onSearch({ page })}>{page}</button>
          ))}
          <button type="button" aria-label="Próxima página" disabled={search.page >= pages} onClick={() => onSearch({ page: search.page + 1 })}>›</button>
        </nav>
      </div>
    </section>
  );
}


