/**
 * PT: Abre guias locais em um diálogo acessível sem tirar o visitante do catálogo.
 * EN: Opens local guides in an accessible dialog without leaving the catalog.
 */
import { lazy, Suspense, useState } from 'react';
import { articles, type JournalArticle } from '../../../features/editorial/articles';

// PT: O texto completo e o diálogo só são baixados ao solicitar leitura.
// EN: Full content and dialog are downloaded only when reading is requested.
const ArticleDialog = lazy(() => import('../../../features/editorial/ArticleDialog').then((module) => ({ default: module.ArticleDialog })));

// Conteúdo educativo local; regras de compra continuam exclusivamente na API.

export function MintJournal() {
  const [selected, setSelected] = useState<JournalArticle | null>(null);
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
              <h3><button type="button" onClick={() => setSelected(article)}>{article.title}</button></h3>
              <p>{article.description}</p>
              <button className="journal-read" type="button" onClick={() => setSelected(article)} aria-label={`Ler: ${article.title}`}>Ler mais <span aria-hidden="true">→</span></button>
            </div>
          </article>
        ))}
      </div>
      {selected && <Suspense fallback={<p role="status">Carregando artigo...</p>}><ArticleDialog article={selected} onDismiss={() => setSelected(null)} /></Suspense>}
    </section>
  );
}
