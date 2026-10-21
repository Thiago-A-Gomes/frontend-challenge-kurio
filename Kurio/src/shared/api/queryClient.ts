/**
 * PT: Define validade do cache e tentativas; mutações não repetem automaticamente.
 * EN: Defines cache freshness and retries; mutations never retry automatically.
 */
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Consultas podem repetir uma falha transitória. Mutations não repetem sozinhas,
// pois criar pedido e alterar carrinho exigem controle explícito de duplicação.
export const queryClient = new QueryClient({ defaultOptions: {
  queries: { staleTime: 15000, gcTime: 300000, retry: (count, error) => count < 1 && !(axios.isAxiosError(error) && [400, 401, 403, 404, 409].includes(error.response?.status ?? 0)), refetchOnWindowFocus: true },
  mutations: { retry: false },
} });
