/**
 * PT: Encapsula consultas e mutações do recurso com chaves de cache e invalidação.
 * EN: Encapsulates resource queries and mutations with cache keys and invalidation.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../shared/api/client';
import { queryClient } from '../../shared/api/queryClient';
import { useSession } from '../account/api';
import type { Cart, CartLine, Quote } from '../../shared/api/contracts';

// A identidade participa da chave: nenhum carrinho privado é reutilizado por outro usuário.
export function useCart() {
  const session = useSession();
  return useQuery({ queryKey: ['cart', session.data?.id ?? 'guest'], enabled: !session.isPending, queryFn: async ({ signal }) => (await api.get<Cart>('/cart', { signal })).data });
}
export async function invalidateCart(): Promise<void> {
  await Promise.all([queryClient.invalidateQueries({ queryKey: ['cart'] }), queryClient.invalidateQueries({ queryKey: ['quote'] })]);
}
export function useAddCartItem() {
  return useMutation({ mutationFn: async (body: CartLine) => (await api.post<Cart>('/cart/items', body)).data, onSuccess: invalidateCart });
}
export function useUpdateCartItem() {
  return useMutation({ mutationFn: async (body: CartLine) => (await api.patch<Cart>('/cart/items', body)).data, onSuccess: invalidateCart });
}
export function useCoupon() {
  return useMutation({ mutationFn: async (code: string) => (await api.post<Cart>('/cart/coupon', { code })).data, onSuccess: invalidateCart });
}
export function useQuote() {
  const session = useSession(), cart = useCart();
  return useQuery({ queryKey: ['quote', session.data?.id ?? 'guest', cart.data], enabled: !!cart.data?.items.length, staleTime: 0, queryFn: async ({ signal }) => (await api.post<Quote>('/quotes', {}, { signal })).data });
}
