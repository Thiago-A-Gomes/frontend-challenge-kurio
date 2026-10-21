/**
 * PT: Encapsula consultas e mutações do recurso com chaves de cache e invalidação.
 * EN: Encapsulates resource queries and mutations with cache keys and invalidation.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/client';
import { queryClient } from '../../shared/api/queryClient';
import { useSession } from '../account/api';
import type { CatalogResponse, CatalogSearch, Product } from '../../shared/api/contracts';

export const catalogOptions = (search: CatalogSearch) => ({ queryKey: ['catalog', search], queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<CatalogResponse>('/nfts', { params: search, signal })).data });
export const productOptions = (id: string) => ({ queryKey: ['nft', id], queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<Product>(`/nfts/${encodeURIComponent(id)}`, { signal })).data });

export function useFavorites() {
  const { data: user } = useSession();
  return useQuery({ queryKey: ['favorites', user?.id], enabled: !!user, queryFn: async ({ signal }) => (await api.get<string[]>('/favorites', { signal })).data });
}
export function useToggleFavorite() {
  const { data: user } = useSession();
  return useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => (await (favorite ? api.delete<string[]>(`/favorites/${id}`) : api.post<string[]>(`/favorites/${id}`))).data,
    // Atualização otimista: muda imediatamente, mas reverte se a rede falhar.
    onMutate: async ({ id, favorite }) => {
      const key = ['favorites', user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData(key, favorite ? (previous ?? []).filter((item) => item !== id) : [...(previous ?? []), id]);
      return { key, previous };
    },
    onError: (_error, _variables, context) => { if (context) queryClient.setQueryData(context.key, context.previous); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] }),
  });
}
