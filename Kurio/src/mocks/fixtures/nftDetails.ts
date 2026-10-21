import { reviewExamples } from './reviews';
/**
 * PT: Cria descrições simuladas coerentes com os dados visuais de cada NFT.
 * EN: Creates mock descriptions consistent with each NFT presentation record.
 */
import type { Nft } from '../../features/catalog/model/nft';

// Conteúdo simulado do detalhe, baseado na referência enviada. Não representa
// verificação real em blockchain. Só os handlers MSW fornecem estes dados à UI.
export function nftDetailFixture(nft: Nft) {
  const token = (nft.name.split('#')[1] ?? '0').padStart(4, '0');
  return {
    token, collectionName: 'Kurio Apes',
    attributes: nft.id.includes('emerald') ? ['Óculos', 'Esmeralda', 'Raro'] : nft.image.includes('sage') ? ['Chapéu', 'Violeta', 'Colecionável'] : nft.image.includes('neon') ? ['Blazer', 'Marfim', 'Colecionável'] : ['Fones', 'Dourado', 'Colecionável'],
    about: 'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.',
    description: `${nft.name} é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
    ownership: 'A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.',
    networkInfo: 'Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.',
    royalties: 'Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.',
    contract: '0x7A42...19E8 · Contrato inteligente ERC-721 verificado.',
    rating: Math.round(reviewExamples.reduce((sum, review) => sum + review.rating, 0) / reviewExamples.length * 10) / 10, reviewCount: reviewExamples.length,
  };
}
