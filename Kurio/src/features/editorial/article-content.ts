/**
 * PT: Conteúdo educativo carregado ao abrir o artigo, com fontes para conceitos técnicos.
 * EN: Educational content loaded on article opening, with sources for technical concepts.
 */
import type { ArticleId } from './articles';
type ArticleContent = { sections: { heading: string; text: string }[]; source?: { label: string; url: string } };
export const articleContent: Record<ArticleId, ArticleContent> = {
  propriedade: {
    sections: [
      { heading: 'O que o token identifica', text: 'Um NFT é um registro individual em um contrato. O contrato e o identificador do token permitem distinguir um item de outros da mesma coleção. A imagem exibida no marketplace apresenta o conteúdo associado a esse registro.' },
      { heading: 'Confira o contexto da obra', text: 'Antes de colecionar, leia a descrição e as condições apresentadas pelo criador. Confira a rede, o contrato informado e o identificador do item. A aparência de duas imagens semelhantes não basta para demonstrar que pertencem à mesma coleção.' },
      { heading: 'Experimente na Kurio', text: 'Abra um item do catálogo e examine suas edições e atributos. Ao concluir a compra demonstrativa, o recibo guarda um retrato dos valores daquela operação. Todos os registros desta aplicação são fictícios: nenhum token é transferido em uma blockchain.' },
    ],
    source: { label: 'Referência: NIST — Non-Fungible Token Security', url: 'https://www.nist.gov/publications/non-fungible-token-security' },
  },
  artistas: {
    sections: [
      { heading: 'Uma seleção criativa de demonstração', text: 'Os dez nomes abaixo são personagens fictícios criados para o diário da Kurio. Eles ilustram linguagens visuais diferentes; não representam artistas verificados ou recomendações de investimento.' },
      { heading: 'Cor, forma e composição', text: '1. Lia Nébula — colagens de paisagens imaginárias. 2. Caio Prisma — composições geométricas. 3. Nina Pixel — cenas em pixel art. 4. Theo Órbita — estudos de movimento. 5. Maya Croma — retratos com cores intensas.' },
      { heading: 'Outras maneiras de criar', text: '6. Ravi Traço — desenho digital. 7. Eva Aurora — fotografia experimental. 8. Ivo Forma — esculturas em 3D. 9. Luna Circuito — experiências generativas. 10. Noah Horizonte — ilustrações de mundos possíveis.' },
      { heading: 'Crie seu próprio olhar', text: 'Ao conhecer uma obra, observe composição, processo criativo e coerência da coleção. Na demonstração, explore as categorias e use os favoritos para organizar os itens que chamarem sua atenção.' },
    ],
  },
  raridade: {
    sections: [
      { heading: 'Compare dentro de uma coleção', text: 'Na Kurio, atributos descrevem elementos visuais como acessórios, roupas e cores. Compare esses detalhes entre os itens e observe a edição escolhida. As opções 1/1, 1/10, 1/50 e aberta são cenários fictícios para experimentar quantidades diferentes.' },
      { heading: 'Raridade não é promessa', text: 'Uma etiqueta de raridade ajuda a organizar uma coleção, mas não garante valor, procura ou retorno. Use a ficha do item para entender como ele é apresentado e não apenas a imagem ou o destaque visual do card.' },
      { heading: 'Procedência e informações do item', text: 'O contrato e o identificador do token fazem parte da identificação técnica de um NFT. Procure informações consistentes sobre a coleção e o conteúdo associado. Nesta aplicação, contratos, atributos e avaliações são exemplos de demonstração, sem verificação externa.' },
    ],
    source: { label: 'Referência: Ethereum — NFTs', url: 'https://ethereum.org/nft/' },
  },
  carteira: {
    sections: [
      { heading: 'Guarde suas credenciais', text: 'Não compartilhe sua frase de recuperação nem suas chaves privadas. Desconfie de mensagens que peçam esses dados para oferecer suporte ou liberar um prêmio. Confira os endereços e os canais oficiais antes de interagir.' },
      { heading: 'Revise antes de autorizar', text: 'Leia o que a carteira está solicitando. Verifique o destino, a rede e os valores apresentados. Uma conexão ou assinatura inesperada merece atenção; interrompa a operação se não compreender o pedido.' },
      { heading: 'Aqui, use somente dados fictícios', text: 'A Kurio não solicita frase de recuperação, não conecta uma carteira real e não envia transações. Você pode cadastrar endereços de exemplo, escolher uma carteira demonstrativa e testar erros de pagamento sem movimentar ativos.' },
    ],
    source: { label: 'Referência: Ethereum — segurança e prevenção de golpes', url: 'https://ethereum.org/security/' },
  },
};
