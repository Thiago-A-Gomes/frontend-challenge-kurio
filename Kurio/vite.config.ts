import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O plugin transforma JSX e atualiza componentes durante o desenvolvimento.
export default defineConfig({ plugins: [react(), {
  name: 'preload-mock-transport',
  apply: 'build',
  transformIndexHtml: { order: 'post', handler(_html, context) {
    // PT: A demonstração depende do MSW; antecipa seu download sem remover a simulação.
    // EN: The demo requires MSW; preload its download without removing simulation.
    const transport = Object.values(context.bundle ?? {}).find((item) => item.type === 'chunk' && item.facadeModuleId?.replace(/\\/g, '/').endsWith('/src/mocks/browser.ts'));
    return transport ? [{ tag: 'link', attrs: { rel: 'modulepreload', href: `/${transport.fileName}` }, injectTo: 'head' }] : [];
  } },
}], server: { watch: {
  // PT: Relatórios gerados não devem recarregar a aplicação durante os testes.
  // EN: Generated reports must not reload the app while tests are running.
  ignored: ['**/reports/**', '**/playwright-report/**', '**/test-results/**', '**/tests/**'],
} }, preview: { headers: {
  // PT: O preview verifica as mesmas defesas de conteúdo configuradas no deploy.
  // EN: Preview verifies the same content defenses configured for deployment.
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws: wss:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
} } });
