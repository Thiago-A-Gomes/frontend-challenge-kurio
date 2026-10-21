/**
 * PT: Reutiliza a arte de destaque local e aponta para um NFT existente.
 * EN: Reuses local featured artwork and links to an existing NFT.
 */
import { Link } from '@tanstack/react-router';

// Reutiliza a imagem existente, sem criar uma cópia do mesmo arquivo.
// A versão "-uniform" usa o fundo ajustado para combinar com o Emerald Ape,
// pois o fundo original tinha uma cor diferente dos demais cards padronizados.
export function FeaturedNft() {
  return (
    <section className="featured-nft" aria-labelledby="featured-title">
      <h2 id="featured-title">NFT em destaque</h2>
      <p>Oferta limitada</p>
      <Link to="/nfts/$nftId" params={{ nftId: 'sage-nomad-009' }} className="featured-art" aria-label="Ver NFT em destaque: Sage Nomad">
        <img src="/images/marketplace/sage-nomad-009-uniform.webp" alt="Macaco de chapéu verde e moletom roxo" width="450" height="450" loading="lazy" />
      </Link>
    </section>
  );
}

