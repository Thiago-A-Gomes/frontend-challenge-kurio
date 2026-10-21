/**
 * PT: Normaliza parâmetros da URL e limita entradas antes de consultar a API.
 * EN: Normalizes URL parameters and bounds input before querying the API.
 */
import type { CatalogSearch } from '../../shared/api/contracts';
import type { SearchSchemaInput } from '@tanstack/react-router';

export const defaultCatalogSearch: CatalogSearch = { q: '', collection: '', network: '', sort: 'recent', page: 1, min: '', max: '', category: 'all' };
export function validateCatalogSearch(value: Record<string, unknown> & SearchSchemaInput): CatalogSearch {
  const amount = (input: unknown) => typeof input === 'string' && /^\d+(\.\d{1,18})?$/.test(input) ? input : '';
  return {
    q: typeof value.q === 'string' ? value.q.slice(0, 100) : '',
    collection: typeof value.collection === 'string' ? value.collection : '',
    network: typeof value.network === 'string' ? value.network : '',
    sort: ['recent', 'name', 'price-asc', 'price-desc'].includes(String(value.sort)) ? String(value.sort) : 'recent',
    page: Math.max(1, Math.floor(Number(value.page) || 1)), min: amount(value.min), max: amount(value.max),
    category: ['all', 'new', 'trending'].includes(String(value.category)) ? String(value.category) : 'all',
  };
}
