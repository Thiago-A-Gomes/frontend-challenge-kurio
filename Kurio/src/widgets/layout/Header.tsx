/**
 * PT: Mantém links e item ativo consistentes, com menu acessível em telas pequenas.
 * EN: Keeps links and active navigation consistent, with an accessible small-screen menu.
 */
import { useState } from 'react';
import type { PendingFeatureHandler } from '../../shared/types/feedback';
import { Link, useLocation } from '@tanstack/react-router';
import { getActiveNavigation } from './navigation';
import { useSession } from '../../features/account/api';
import { useCart } from '../../features/cart/api';

// type descreve o formato das props que este componente aceita.
type HeaderProps = {
  onPendingFeature: PendingFeatureHandler;
};

export function Header(_props: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeItem = useLocation({ select: (location) => getActiveNavigation(location.pathname, location.hash) });
  const session = useSession(), cart = useCart();
  const itemCount = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  return (
    <header className="header">
      <Link className="logo" to="/" aria-label="Kurio, início">KURIO</Link>
      <button type="button" className="mobile-menu-toggle" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu de navegação">☰</button>
      <nav id="main-navigation" className={menuOpen ? 'is-open' : undefined} aria-label="Navegação principal" onClick={() => setMenuOpen(false)}>
        {/*
          Os dois links apontam para /, mas Mercado usa #mercado.
          activeProps remove a classe automática do Router; a função acima
          controla o destaque. includeHash distingue as duas âncoras também
          para o estado acessível automático do Link.
        */}
        <Link className={`nav-link${activeItem === 'home' ? ' active' : ''}`} activeProps={{ className: '' }} activeOptions={{ exact: true, includeHash: true }} to="/" aria-current={activeItem === 'home' ? 'page' : undefined}>Início</Link>
        <Link className={`nav-link${activeItem === 'market' ? ' active' : ''}`} activeProps={{ className: '' }} activeOptions={{ exact: true, includeHash: true }} to="/" hash="mercado" aria-current={activeItem === 'market' ? 'location' : undefined}>Mercado</Link>
        {/* onClick recebe uma função; ela só será executada quando houver clique. */}
        <Link className={`nav-link${activeItem === 'creators' ? ' active' : ''}`} to="/criadores" activeProps={{ className: '' }}>Criadores</Link>
        <Link className={`nav-link${activeItem === 'learn' ? ' active' : ''}`} to="/aprenda" activeProps={{ className: '' }}>Aprenda</Link>
      </nav>
      <div className="header-actions">
        <Link className="icon-button" to="/" hash="catalog-search" aria-label="Pesquisar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></svg>
        </Link>
        <Link className="icon-button cart-header-link" to="/carrinho" aria-label={`Carrinho, ${itemCount} itens`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 3h3l3 13h11l3-9H6" /><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /></svg>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        {session.data ? <Link to="/perfil" className="button login">Meu perfil</Link> : <Link to="/login" search={{ returnTo: '/perfil' }} className="button login"><span aria-hidden="true">↪</span> Entrar</Link>}
      </div>
    </header>
  );
}
