/**
 * PT: Combina rede e preço na URL; os dois marcadores continuam acessíveis por teclado.
 * EN: Combines network and price in the URL; both slider handles remain keyboard-accessible.
 */
import { useEffect, useState } from 'react';
import type { CatalogSearch } from '../../../shared/api/contracts';

type CatalogFiltersProps = { search: CatalogSearch; onSearch: (change: Partial<CatalogSearch>) => void };

// A URL guarda os filtros; a API combina preço, rede e coleção na consulta.
export function CatalogFilters({ search, onSearch }: CatalogFiltersProps) {
  // Inteiros em centésimos evitam erros de arredondamento durante o slider.
  const [minimum, setMinimum] = useState(2);
  const [maximum, setMaximum] = useState(1230);
  // Restaura os controles no refresh, no histórico e ao limpar os filtros.
  useEffect(() => {
    setMinimum(search.min ? Math.round(Number(search.min) * 100) : 2);
    setMaximum(search.max ? Math.round(Number(search.max) * 100) : 1230);
  }, [search.min, search.max]);
  const format = (value: number) => (value / 100).toFixed(2).replace('.', ',');

  return (
    <>
      <fieldset className="catalog-filter-group">
        <legend>Faixa de preço</legend>
        {/* Cada controle tem seu próprio nome acessível e limites consistentes. */}
        <div className="price-range-control">
        <label className="visually-hidden" htmlFor="price-minimum">Preço mínimo em centésimos de ETH</label>
        <input id="price-minimum" type="range" min="2" max="1230" value={minimum} onChange={(event) => setMinimum(Math.min(Number(event.target.value), maximum))} />
        <label className="visually-hidden" htmlFor="price-maximum">Preço máximo em centésimos de ETH</label>
        <input id="price-maximum" type="range" min="2" max="1230" value={maximum} onChange={(event) => setMaximum(Math.max(Number(event.target.value), minimum))} />
        </div>
        <p className="price-caption">Preço: {format(minimum)} – {format(maximum)} ETH</p>
        <button className="button filter-apply" type="button" onClick={() => onSearch({ min: (minimum / 100).toFixed(2), max: (maximum / 100).toFixed(2) })}>Aplicar</button>
      </fieldset>
      <fieldset className="catalog-filter-group">
        <legend>Rede</legend>
        {/* Contagens visuais do Figma; ainda não representam resultados da API. */}
        {[
          { name: 'Ethereum', count: 119 },
          { name: 'Polygon', count: 78 },
          { name: 'Solana', count: 86 },
        ].map((network) => (
          <button key={network.name} type="button" className="collection-button" aria-pressed={search.network === network.name} onClick={() => onSearch({ network: search.network === network.name ? '' : network.name })}>
            <span>{network.name}</span>
          </button>
        ))}
      </fieldset>
    </>
  );
}
