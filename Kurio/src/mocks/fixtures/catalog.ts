/**
 * PT: Fixtures locais do Figma e itens fictícios adicionais para exercitar paginação.
 * EN: Local Figma fixtures and additional fictional items for exercising pagination.
 */
import type { Nft } from '../../features/catalog/model/nft';

// Prévia visual do Figma, separada do componente para facilitar a leitura.
// Ainda não é a API do desafio: estes dados serão movidos para fixtures MSW.
// Cada caminho corresponde ao arquivo que deve entrar em public/images/marketplace.
// Vários NFTs podem compartilhar a mesma arte: reutilizamos o caminho, sem duplicar arquivos.
// A imagem golden-beat-207.png atende aos três cards dourados da referência.
// Golden Beat foi extraído da captura enviada e editado por IA: removemos
// a moldura, o texto e o círculo de fundo para combinar com o Emerald Ape.
// Ajuste visual: os arquivos originais tinham fundos com cores diferentes,
// deixando os cards inconsistentes em relação ao fundo do Emerald Ape.
// Por isso, as versões com sufixo "-uniform" tiveram o fundo editado por IA
// para aproximar as cores da primeira imagem. Os originais foram preservados.
// Esta mudança é nas próprias imagens: alterar só o CSS não corrigia os fundos
// que já estavam incorporados nos PNGs. A edição pode mudar pequenos detalhes.
export const catalogPreview: Nft[] = [
  { id: 'emerald-ape-042', name: 'Emerald Ape #042', image: '/images/marketplace/emerald-ape-042.webp', imageAlt: 'Macaco com óculos e jaqueta verde', priceEth: '1.9' },
  { id: 'sage-nomad-009', name: 'Sage Nomad #009', image: '/images/marketplace/sage-nomad-009-uniform.webp', imageAlt: 'Macaco de chapéu verde e moletom roxo', priceEth: '1.69' },
  { id: 'neon-vessel-552', name: 'Neon Vessel #552', image: '/images/marketplace/neon-vessel-552-uniform.webp', imageAlt: 'Macaco de blazer claro e gola verde', priceEth: '1.99', previousPriceEth: '2.29' },
  { id: 'cosmic-bloom-118', name: 'Cosmic Bloom #118', image: '/images/marketplace/sage-nomad-009-uniform.webp', imageAlt: 'Macaco de chapéu e moletom roxo', priceEth: '1.29' },
  { id: 'violet-nomad-314', name: 'Violet Nomad #314', image: '/images/marketplace/sage-nomad-009-uniform.webp', imageAlt: 'Macaco de moletom violeta e chapéu verde', priceEth: '1.39' },
  { id: 'ivory-baron-088', name: 'Ivory Baron #088', image: '/images/marketplace/neon-vessel-552-uniform.webp', imageAlt: 'Macaco de casaco claro e gola verde', priceEth: '1.79' },
  { id: 'golden-beat-207', name: 'Golden Beat #207', image: '/images/marketplace/golden-beat-207-uniform.webp', imageAlt: 'Macaco dourado com fones verdes', priceEth: '0.99' },
  // Nome e preço confirmados na captura ampliada de login.
  { id: 'golden-frequency-071', name: 'Golden Frequency #071', image: '/images/marketplace/golden-beat-207-uniform.webp', imageAlt: 'Macaco dourado com fones verdes', priceEth: '0.59' },
  { id: 'golden-signal-160', name: 'Golden Signal #160', image: '/images/marketplace/golden-beat-207-uniform.webp', imageAlt: 'Macaco dourado com fones e roupa clara', priceEth: '0.39' },
];







// Itens adicionais são dados fictícios para exercitar as quatro páginas do teste.
// Os nove primeiros preservam a ordem e os dados conhecidos da referência.
export const paginatedCatalog: Nft[] = [...catalogPreview, ...Array.from({ length: 27 }, (_, index) => {
  const original = catalogPreview[index % catalogPreview.length];
  const number = String(600 + index).padStart(3, '0');
  return { ...original, id: original.id.replace(/-\d+$/, '') + '-' + number, name: original.name.split(' #')[0] + ' #' + number };
})];
