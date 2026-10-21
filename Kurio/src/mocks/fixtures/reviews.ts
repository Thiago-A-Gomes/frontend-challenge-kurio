/**
 * PT: Avaliações fictícias e determinísticas para apresentar variedade sem depender de serviços externos.
 * EN: Fictional, deterministic reviews that provide variety without external services.
 */
import type { Review } from '../../shared/api/contracts';

export const reviewExamples: Omit<Review, 'id'>[] = [
  { name: 'Marina A.', rating: 5, text: 'Gostei da combinação de cores. O personagem se destaca sem deixar o fundo pesado.' },
  { name: 'Lucas R.', rating: 4, text: 'A composição funciona bem. Eu gostaria de ver mais imagens dos pequenos detalhes.' },
  { name: 'Beatriz M.', rating: 5, text: 'A expressão do personagem dá bastante personalidade à peça. Foi o detalhe que mais chamou minha atenção.' },
  { name: 'Rafael S.', rating: 5, text: 'As texturas da roupa e os acessórios têm um acabamento visual muito interessante.' },
  { name: 'Clara T.', rating: 4, text: 'A paleta é equilibrada. Uma prévia com mais aproximação ajudaria a observar o acabamento.' },
  { name: 'Pedro L.', rating: 5, text: 'O contraste entre o personagem e o fundo deixa a leitura da imagem muito boa.' },
  { name: 'Camila F.', rating: 5, text: 'Achei a identidade da coleção consistente e fácil de reconhecer entre as outras artes.' },
  { name: 'André P.', rating: 4, text: 'Gostei da proposta. Seria interessante conhecer também os estudos que deram origem ao personagem.' },
  { name: 'Júlia C.', rating: 5, text: 'A iluminação cria volume e valoriza os detalhes do rosto. Uma das minhas partes favoritas.' },
  { name: 'Bruno V.', rating: 5, text: 'Os acessórios conversam bem com a roupa e ajudam a contar uma pequena história visual.' },
  { name: 'Sofia D.', rating: 4, text: 'A arte é agradável de observar. Mais contexto sobre as escolhas de cor enriqueceria a apresentação.' },
  { name: 'Diego N.', rating: 5, text: 'O recorte funciona muito bem como retrato. O olhar leva a atenção para o centro da composição.' },
  { name: 'Laura B.', rating: 5, text: 'Gostei especialmente das transições de luz e sombra nos materiais do personagem.' },
  { name: 'Gustavo H.', rating: 4, text: 'O resultado é expressivo. Eu exploraria algumas variações de enquadramento nas próximas peças.' },
  { name: 'Isabela E.', rating: 5, text: 'Tem muitos detalhes, mas a imagem continua organizada. A silhueta é bem marcante.' },
  { name: 'Felipe O.', rating: 5, text: 'A escolha do fundo deixa o personagem em evidência e combina com a proposta da coleção.' },
  { name: 'Renata G.', rating: 4, text: 'Boa apresentação da peça. Gostaria de uma descrição mais longa do processo criativo.' },
  { name: 'Thiago K.', rating: 5, text: 'O estilo dos materiais e a expressão dão uma sensação de unidade à composição.' },
  { name: 'Aline J.', rating: 5, text: 'Uma arte com personalidade. As cores quentes e os detalhes da roupa funcionam muito bem juntos.' },
];

export function reviewsFor(nftId: string): Review[] {
  return reviewExamples.map((review, index) => ({ ...review, id: `${nftId}-review-${index}` }));
}
