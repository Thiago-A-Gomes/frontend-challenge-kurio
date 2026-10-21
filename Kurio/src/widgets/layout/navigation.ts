/**
 * PT: Calcula um único item ativo a partir da rota e da âncora.
 * EN: Computes a single active item from the route and anchor.
 */
// Decide um único item ativo a partir do endereço, sem depender da interface.
// Hash é a parte depois de #, usada para chegar à seção do catálogo.
export function getActiveNavigation(pathname: string, hash: string): 'home' | 'market' | 'creators' | 'learn' | null {
  if (pathname === '/criadores') return 'creators';
  if (pathname === '/aprenda') return 'learn';
  if (pathname === '/mercado' || pathname.startsWith('/nfts/') || pathname === '/carrinho' || pathname === '/checkout') return 'market';
  if (pathname !== '/') return null;
  return hash.replace(/^#/, '') === 'mercado' ? 'market' : 'home';
}
