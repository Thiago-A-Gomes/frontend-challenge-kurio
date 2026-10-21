/**
 * PT: Compõe cabeçalho e rodapé comuns; páginas escolhem seu próprio conteúdo.
 * EN: Composes shared header and footer; pages provide their own content.
 */
import { MobileNavigation } from './MobileNavigation';
import type { ReactNode } from 'react';
import type { PendingFeatureHandler } from '../../shared/types/feedback';
import { Header } from './Header';
import { SiteFooter } from './footer/SiteFooter';
import '../../styles/content.css';
import { useLocation } from '@tanstack/react-router';
import '../../styles/commerce.css';
import { useRealtime } from '../../features/realtime/useRealtime';

type AppLayoutProps = {
  // ReactNode aceita conteúdo renderizável: componentes, elementos e textos.
  children: ReactNode;
  message: string;
  onPendingFeature: PendingFeatureHandler;
};

// Layout reúne a estrutura comum, sem depender das regras de cada página.
export function AppLayout({ children, message, onPendingFeature }: AppLayoutProps) {
  const realtimeMessage = useRealtime();
  const showFooter = useLocation({ select: (location) => !/^\/(perfil|carteiras|pedidos|login|cadastro)(\/|$)/.test(location.pathname) });
  const showHeader = useLocation({ select: (location) => !location.pathname.startsWith('/pedidos/') });
  return (
    <>
      <a className="skip-link" href="#inicio">Pular para o conteúdo</a>
      <div className="page">
        {showHeader && <Header onPendingFeature={onPendingFeature} />}
        <main id="inicio">{children}</main>
        <p className="status" role="status" aria-live="polite">{message}</p>
        <p className="status realtime-status" role="status" aria-live="polite">{realtimeMessage}</p>
        {/* O rodapé é compartilhado; cada página fornece somente seu conteúdo. */}
        {showFooter && <SiteFooter onPendingFeature={onPendingFeature} />}
      </div>
      <MobileNavigation />
    </>
  );
}
