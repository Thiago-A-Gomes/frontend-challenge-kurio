/**
 * PT: Consulta o catálogo e compõe o início preservando filtros e paginação.
 * EN: Loads the catalog and composes home while preserving filters and pagination.
 */
import { Hero } from './components/Hero';
import { PromotionalBanners } from './components/PromotionalBanners';
import { MintJournal } from './components/MintJournal';
import './home-sections.css';


import { Marketplace } from '../../features/catalog/components/Marketplace';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { catalogOptions } from '../../features/catalog/api';
import { defaultCatalogSearch } from '../../features/catalog/search';
import { api, errorMessage } from '../../shared/api/client';
import type { CatalogSearch } from '../../shared/api/contracts';
import type { Collection } from '../../features/catalog/model/collection';
import { LoadingState } from '../../shared/ui/LoadingState';
import type { PendingFeatureHandler } from '../../shared/types/feedback';

type HomePageProps = { onPendingFeature: PendingFeatureHandler; search?: CatalogSearch; onSearch?: (change: Partial<CatalogSearch>) => void };

// A página compõe as seções e fornece seus dados.
// TanStack Query busca a API via Axios; MSW responde na camada de rede.
// Os componentes visuais recebem props e não importam fixtures.
export function HomePage({ onPendingFeature, search = defaultCatalogSearch, onSearch = () => undefined }: HomePageProps) {
  // Mantém a busca montada durante refetch para não perder o foco ao digitar.
  const catalog = useQuery({ ...catalogOptions(search), placeholderData: keepPreviousData });
  const collections = useQuery({ queryKey: ['collections'], queryFn: async ({ signal }) => (await api.get<Collection[]>('/collections', { signal })).data });
  return (
    <>
      <Hero />
      {catalog.isPending ? <LoadingState cards={6} /> : catalog.isError ? <section className="route-message"><p role="alert">{errorMessage(catalog.error)}</p><button className="button" onClick={() => catalog.refetch()}>Tentar novamente</button></section> : <Marketplace
        nfts={catalog.data.items}
        collections={collections.data ?? []}
        search={search}
        pages={catalog.data.pages}
        total={catalog.data.total}
        currentPage={catalog.data.page}
        updating={catalog.isFetching}
        onSearch={onSearch}
        onPendingFeature={onPendingFeature}
      />}
      <div className="home-editorial"><PromotionalBanners /></div>
      <div className="home-journal"><MintJournal /></div>
    </>
  );
}
