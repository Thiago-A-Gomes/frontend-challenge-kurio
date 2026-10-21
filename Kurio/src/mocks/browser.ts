/**
 * PT: Registra interceptadores HTTP e WebSocket somente quando os mocks estão habilitados.
 * EN: Registers HTTP and WebSocket interceptors only when mocks are enabled.
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { socketHandlers } from './socket';
// MSW intercepta HTTP; componentes e Axios continuam fazendo chamadas reais.
export const worker = setupWorker(...handlers, ...socketHandlers);
