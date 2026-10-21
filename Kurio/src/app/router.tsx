/**
 * PT: Define rotas tipadas, filtros na URL e proteção dos fluxos autenticados.
 * EN: Defines typed routes, URL filters and guards for authenticated flows.
 */
import { createRootRouteWithContext, createRoute, createRouter, lazyRouteComponent, Link, notFound, Outlet, redirect } from '@tanstack/react-router';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../widgets/layout/AppLayout';
import { HomePage } from '../pages/home/HomePage';
import { productOptions } from '../features/catalog/api';
import { validateCatalogSearch } from '../features/catalog/search';
import { queryClient } from '../shared/api/queryClient';
import { api } from '../shared/api/client';
import type { User } from '../shared/api/contracts';
import { LoadingState } from '../shared/ui/LoadingState';
import type { PendingFeatureHandler } from '../shared/types/feedback';

// PT: Cada página carrega seu código ao ser aberta; o início mantém todos os recursos.
// EN: Each page loads its code when opened; home retains all functionality.
const ComingSoonPage = lazyRouteComponent(() => import('../pages/ComingSoonPage'), 'ComingSoonPage');
const NftDetailsPage = lazyRouteComponent(() => import('../pages/nft-details/NftDetailsPage'), 'NftDetailsPage');
const CartPage = lazyRouteComponent(() => import('../pages/cart/CartPage'), 'CartPage');
const AuthPage = lazyRouteComponent(() => import('../pages/auth/AuthPage'), 'AuthPage');
const ProfilePage = lazyRouteComponent(() => import('../pages/account/ProfilePage'), 'ProfilePage');
const WalletsPage = lazyRouteComponent(() => import('../pages/account/WalletsPage'), 'WalletsPage');
const CheckoutPage = lazyRouteComponent(() => import('../pages/checkout/CheckoutPage'), 'CheckoutPage');
const OrderPage = lazyRouteComponent(() => import('../pages/order/OrderPage'), 'OrderPage');

// Contexto compartilha o feedback sem fazer as páginas importarem o App.
type RouterContext = { message: string; onPendingFeature: PendingFeatureHandler };

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: () => <section className="route-message"><h1>Não foi possível abrir esta página</h1><p>Tente novamente ou volte ao início.</p><Link to="/" className="button">Voltar ao início</Link></section>,
});

function RootLayout() {
  const { message, onPendingFeature } = rootRoute.useRouteContext();
  return (
    <AppLayout message={message} onPendingFeature={onPendingFeature}>
      {/* Outlet é o espaço em que o Router coloca a página do endereço atual. */}
      <Outlet />
    </AppLayout>
  );
}

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: validateCatalogSearch,
  component: function HomeRoute() {
    const { onPendingFeature } = rootRoute.useRouteContext();
    const search = homeRoute.useSearch(), navigate = homeRoute.useNavigate();
    return <HomePage search={search} onSearch={(change) => navigate({ search: (previous) => ({ ...previous, ...change, page: change.page ?? 1 }), hash: 'mercado' })} onPendingFeature={onPendingFeature} />;
  },
});

const creatorsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/criadores', component: () => <ComingSoonPage section="creators" /> });
const learnRoute = createRoute({ getParentRoute: () => rootRoute, path: '/aprenda', component: () => <ComingSoonPage section="learn" /> });

const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  // $nftId é um parâmetro: cada identificador abre seu próprio NFT.
  path: '/nfts/$nftId',
  loader: async ({ params }) => {
    // A origem agora é REST: Axios consulta a API interceptada pelo MSW.
    try { return await queryClient.ensureQueryData(productOptions(params.nftId)); }
    catch (error) { if (axios.isAxiosError(error) && error.response?.status === 404) throw notFound(); throw error; }
  },
  component: function NftRoute() {
    const initialNft = nftRoute.useLoaderData();
    const { data: nft = initialNft } = useQuery(productOptions(initialNft.id));
    const catalog = useQuery({ queryKey: ['related', nft.id], queryFn: async ({ signal }) => (await api.get<import('../shared/api/contracts').Product[]>(`/nfts/${nft.id}/related`, { signal })).data });
    const { onPendingFeature } = rootRoute.useRouteContext();
    // key reinicia o estado local ao abrir outro NFT da mesma rota dinâmica.
    return <NftDetailsPage key={nft.id} nft={nft} relatedNfts={catalog.data ?? []} onPendingFeature={onPendingFeature} />;
  },
});

// Acesso direto também valida a sessão antes de carregar uma página privada.
async function requireSession(returnTo: string): Promise<void> {
  let user: User | null = null;
  try { user = (await api.get<User | null>('/session')).data; } catch (error) { if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error; }
  if (!user) throw redirect({ to: '/login', search: { returnTo } });
  queryClient.setQueryData(['session'], user);
}
const authSearch = (value: Record<string, unknown>) => ({ returnTo: typeof value.returnTo === 'string' && /^\/(checkout|perfil|carteiras|nfts\/[a-z0-9-]+|pedidos\/[a-z0-9-]+)$/.test(value.returnTo) ? value.returnTo : '/perfil' });
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/carrinho', component: CartPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', validateSearch: authSearch, component: () => <AuthPage mode="login" returnTo={loginRoute.useSearch().returnTo} /> });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cadastro', validateSearch: authSearch, component: () => <AuthPage mode="register" returnTo={registerRoute.useSearch().returnTo} /> });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/perfil', beforeLoad: () => requireSession('/perfil'), component: ProfilePage });
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/carteiras', beforeLoad: () => requireSession('/carteiras'), component: WalletsPage });
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', beforeLoad: () => requireSession('/checkout'), component: CheckoutPage });
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pedidos/$orderId', beforeLoad: ({ location }) => requireSession(location.pathname), component: () => <OrderPage orderId={orderRoute.useParams().orderId} /> });

function NotFoundPage() {
  return <section className="route-message"><h1>Página ou NFT não encontrado</h1><p>Confira o endereço ou escolha outro NFT no catálogo.</p><Link to="/" hash="mercado" className="button">Voltar ao catálogo</Link></section>;
}

export const router = createRouter({
  // PT: Reserva a área da página para o rodapé não subir durante acesso direto lento.
  // EN: Reserves page space so the footer does not jump during slow direct navigation.
  defaultPendingComponent: () => <section style={{ minHeight: '100svh' }}><LoadingState /></section>,
  defaultNotFoundComponent: NotFoundPage,
  routeTree: rootRoute.addChildren([homeRoute, creatorsRoute, learnRoute, nftRoute, cartRoute, loginRoute, registerRoute, profileRoute, walletsRoute, checkoutRoute, orderRoute]),
  context: { message: '', onPendingFeature: () => undefined },
  // Guarda e restaura a posição da página ao usar Voltar e Avançar.
  scrollRestoration: true,
});

// Registra os caminhos no TypeScript para detectar links e parâmetros inválidos.
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
