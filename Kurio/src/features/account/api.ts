/**
 * PT: Encapsula consultas e mutações do recurso com chaves de cache e invalidação.
 * EN: Encapsulates resource queries and mutations with cache keys and invalidation.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, SESSION_KEY } from '../../shared/api/client';
import { queryClient } from '../../shared/api/queryClient';
import type { Session, User, Wallet } from '../../shared/api/contracts';

export function useSession() {
  return useQuery({ queryKey: ['session'], queryFn: async ({ signal }) => (await api.get<User | null>('/session', { signal })).data, retry: false });
}

async function replaceSession(session: Session | null): Promise<void> {
  // Primeiro cancela respostas antigas; depois remove os dados privados do cache.
  await queryClient.cancelQueries();
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'session' });
  if (session) localStorage.setItem(SESSION_KEY, session.token); else localStorage.removeItem(SESSION_KEY);
  queryClient.setQueryData(['session'], session?.user ?? null);
}
export function useLogin() {
  return useMutation({ mutationFn: async (body: { email: string; password: string }) => (await api.post<Session>('/login', body)).data, onSuccess: replaceSession });
}
export function useLogout() {
  return useMutation({ mutationFn: async () => { await api.post('/logout'); }, onSuccess: () => replaceSession(null) });
}
export function useWallets() {
  const { data: user } = useSession();
  return useQuery({ queryKey: ['wallets', user?.id], enabled: !!user, queryFn: async ({ signal }) => (await api.get<Wallet[]>('/wallets', { signal })).data });
}
