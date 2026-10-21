/**
 * PT: Centraliza Axios, cabeçalhos, timeout e tratamento de sessão sem registrar credenciais.
 * EN: Centralizes Axios, headers, timeouts and session handling without logging credentials.
 */
import axios from 'axios';
import type { ApiError } from './contracts';
import { waitForNetwork } from './readiness';

// Todas as chamadas REST passam por esta instância; não há fixtures no cliente.
export const api = axios.create({ baseURL: '/api', timeout: 12000 });
export const SESSION_KEY = 'kurio.session-token';
const VISITOR_KEY = 'kurio.visitor-id';
api.interceptors.request.use(async (config) => {
  await waitForNetwork();
  const target = new URL(config.url ?? '', new URL(config.baseURL ?? '/api', window.location.origin));
  if (target.origin !== window.location.origin) throw new Error('Destino de API não autorizado.');
  const token = localStorage.getItem(SESSION_KEY);
  let visitor = localStorage.getItem(VISITOR_KEY);
  if (!visitor) { visitor = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, visitor); }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Visitor-Id'] = visitor;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  // Uma resposta atrasada da sessão anterior não deve encerrar a sessão atual.
  const currentToken = localStorage.getItem(SESSION_KEY);
  if (axios.isAxiosError(error) && error.response?.status === 401 && currentToken && error.config?.headers.Authorization === `Bearer ${currentToken}`) {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('kurio:session-expired'));
  }
  return Promise.reject(error);
});

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) return error.response?.data.message ?? 'Falha de conexão. Tente novamente.';
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}
