/**
 * PT: Exibe carregamento durante a preparação; consultas e Socket aguardam a rede simulada.
 * EN: Shows loading during setup; queries and Socket wait for mocked networking.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { setNetworkReadiness } from './shared/api/readiness';
import './styles/tailwind.css';
import './styles/global.css';
// PT: A ordem dos estilos é fixa; navegar entre chunks não pode sobrescrever o mobile.
// EN: Keep style order stable so lazy route chunks cannot override mobile rules.
import './features/catalog/recommendations.css';
import './pages/nft-details/nft-details.css';
import './pages/cart/cart.css';
import './pages/auth/auth.css';
import './pages/account/account.css';
import './pages/checkout/checkout.css';
import './pages/order/order.css';
import './pages/coming-soon.css';
import './styles/mobile.css';
import './styles/motion.css';

// O HTML fornece uma única div; o React monta os componentes dentro dela.
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Não foi encontrado o elemento #root.');

async function start(): Promise<void> {
  // A demonstração publicada também usa mocks. VITE_ENABLE_MOCKS=false
  // permite apontar para uma API real no futuro, sem alterar componentes.
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }
}
const ready = start();
setNetworkReadiness(ready);
const root = createRoot(rootElement);
root.render(<section className="route-message" role="status" aria-live="polite"><p>KURIO</p><p>Preparando sua experiência...</p></section>);
void ready.then(() => root.render(<StrictMode><App /></StrictMode>)).catch((error: unknown) => {
  // PT: Registra somente falhas de inicialização, sem credenciais ou payloads da API.
  // EN: Logs startup failures only, never credentials or API payloads.
  console.error('Kurio: falha ao iniciar', error instanceof Error ? error.message : 'Erro de inicialização');
  root.render(<section className="route-message"><h1>Não foi possível iniciar a demonstração.</h1><p role="alert">Atualize a página e confira se o servidor está aberto em localhost ou 127.0.0.1.</p><button type="button" className="button" onClick={() => location.reload()}>Tentar novamente</button></section>);
});

