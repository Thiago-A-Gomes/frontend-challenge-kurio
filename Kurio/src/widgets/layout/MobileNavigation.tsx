/**
 * PT: Oferece acesso rápido ao início, conta e carrinho no layout mobile.
 * EN: Provides quick access to home, account and cart in the mobile layout.
 */
import { Link, useLocation } from '@tanstack/react-router';
import { AccountIcon } from './AccountIcon';

export function MobileNavigation() {
  const path = useLocation({ select: (location) => location.pathname });
  if (path !== '/') return null;
  return <nav className="mobile-bottom-navigation" aria-label="Navegação móvel">
    <Link to="/" aria-label="Início" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 10 9-8 9 8v12h-7v-7h-4v7H3z" /></svg></Link>
    <Link to="/perfil" aria-label="Meu perfil e favoritos"><AccountIcon name="Lista de interesse" /></Link>
    <Link to="/carrinho" aria-label="Abrir carrinho"><AccountIcon name="Atividade" /></Link>
    <Link to="/perfil" aria-label="Dados do perfil"><AccountIcon name="profile" /></Link>
  </nav>;
}
