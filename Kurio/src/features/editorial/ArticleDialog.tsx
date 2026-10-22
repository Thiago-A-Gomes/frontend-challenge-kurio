import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { defaultCatalogSearch } from '../catalog/search';
import type { JournalArticle } from './articles';
import { articleContent } from './article-content';
import './article-dialog.css';

/** PT: Diálogo nativo mantém foco, Escape e retorno ao acionador. EN: Native dialog manages focus, Escape and trigger restoration. */
export function ArticleDialog({ article, onDismiss }: { article: JournalArticle; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const content = articleContent[article.id];
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    return () => { dialog?.close(); trigger?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="article-dialog" aria-labelledby="article-dialog-title" onClose={() => { if (!ref.current?.open) onDismiss(); }} onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'));
    const first = controls[0], last = controls.at(-1);
    // PT: Evita que Tab no último controle leve o foco à barra do navegador.
    // EN: Keep Tab from moving focus from the last control to browser chrome.
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <button type="button" className="button article-close" autoFocus onClick={() => ref.current?.close()}>Fechar artigo</button>
    <article>
      <p className="article-kicker">Diário da Cunhagem · Guia de demonstração</p>
      <h2 id="article-dialog-title">{article.title}</h2>
      {content.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.text}</p></section>)}
      {content.source && <p><a href={content.source.url} target="_blank" rel="noreferrer">{content.source.label} ↗</a></p>}
      <Link className="button" to="/" search={defaultCatalogSearch} hash="mercado" onClick={onDismiss}>Explorar catálogo</Link>
    </article>
  </dialog>;
}
