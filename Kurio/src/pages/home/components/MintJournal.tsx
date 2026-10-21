/**
 * PT: Apresenta prévias editoriais; a entrega não inclui um sistema de publicação.
 * EN: Presents editorial previews; the deliverable does not include a publishing system.
 */
import type { PendingFeatureHandler } from '../../../shared/types/feedback';

// Conteúdo editorial de apresentação, sem API ou rotas de artigos nesta etapa.
const articles = [
  { id: 'propriedade', image: 'neon-vessel-552-uniform.webp', date: '12 de setembro', duration: 6, title: 'Como funciona a propriedade de NFTs', description: 'Aprenda a colecionar, negociar e verificar obras digitais.' },
  { id: 'artistas', image: 'emerald-ape-042.webp', date: '13 de setembro', duration: 2, title: '10 artistas digitais para acompanhar', description: 'Conheça criadores que moldam a cultura digital.' },
  { id: 'raridade', image: 'sage-nomad-009-uniform.webp', date: '15 de setembro', duration: 3, title: 'Raridade, atributos e procedência', description: 'Entenda raridade, procedência, direitos autorais e utilidade.' },
  { id: 'carteira', image: 'golden-beat-207-uniform.webp', date: '15 de setembro', duration: 2, title: 'Como proteger sua carteira', description: 'Proteja sua carteira, seus ativos e sua identidade.' },
];

export function MintJournal({ onPendingFeature }: { onPendingFeature: PendingFeatureHandler }) {
  return (
    <section className="mint-journal" aria-labelledby="journal-title">
      <div className="journal-heading">
        <h2 id="journal-title">Diário da Cunhagem</h2>
        <p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </div>
      <div className="journal-grid">
        {/* Uma chave estável identifica cada artigo durante as atualizações. */}
        {articles.map((article) => (
          <article className="journal-card" key={article.id}>
            <img src={`/images/marketplace/${article.image}`} alt="" width="450" height="450" loading="lazy" />
            <div className="journal-card-copy">
              <p className="journal-meta">{article.date} | Leitura de {article.duration} min</p>
              <h3><button type="button" onClick={() => onPendingFeature(`Artigo: ${article.title}`)}>{article.title}</button></h3>
              <p>{article.description}</p>
              <button className="journal-read" type="button" onClick={() => onPendingFeature(`Artigo: ${article.title}`)} aria-label={`Ler: ${article.title}`}>Ler mais <span aria-hidden="true">→</span></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
