/**
 * PT: Apresenta chamadas visuais e destinos explícitos, sem simular lançamentos reais.
 * EN: Presents visual calls to action and explicit destinations without simulating real launches.
 */
import { Link } from '@tanstack/react-router';
import { defaultCatalogSearch } from '../../../features/catalog/search';

// Banners são conteúdo de apresentação; não simulam uma compra ou lançamento.
export function PromotionalBanners() {
  return (
    <section className="promotional-banners" aria-label="Descubra coleções">
      <article className="promotion">
        {/* O wrapper recorta a foto e posiciona a curva decorativa sobre ela. */}
        <div className="promotion-art"><img src="/images/marketplace/emerald-ape-042.webp" alt="Macaco com óculos e jaqueta verde" width="450" height="450" loading="lazy" /></div>
        <div className="promotion-copy">
          <h2>Lançamentos gênesis<br />de edição limitada</h2>
          <p>Colecione edições escassas diretamente dos criadores antes da revelação pública.</p>
          <Link className="button" to="/" search={{ ...defaultCatalogSearch, category: 'new' }} hash="mercado" aria-label="Explorar novos lançamentos">Explorar <span aria-hidden="true">→</span></Link>
        </div>
      </article>
      <article className="promotion">
        <div className="promotion-art"><img src="/images/marketplace/neon-vessel-552-uniform.webp" alt="Macaco de blazer claro" width="450" height="450" loading="lazy" /></div>
        <div className="promotion-copy">
          <h2>Arte digital selecionada<br />e muito mais</h2>
          <p>Explore novos artistas, coleções verificadas e obras digitais que definem o agora.</p>
          {/* Link real para o catálogo existente na mesma página. */}
          <Link className="button" to="/" search={{ ...defaultCatalogSearch, collection: 'arte-digital' }} hash="mercado" aria-label="Explorar arte digital">Explorar <span aria-hidden="true">→</span></Link>
        </div>
      </article>
    </section>
  );
}
