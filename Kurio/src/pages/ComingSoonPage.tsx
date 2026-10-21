/**
 * PT: Informa conteúdo ainda não disponível e anima apenas o fundo decorativo.
 * EN: Explains unavailable content and animates only the decorative background.
 */
import { useEffect, useState } from 'react';
import { useMediaQuery } from '../shared/lib/useMediaQuery';
import { Link } from '@tanstack/react-router';
import './coming-soon.css';
import { imageSources } from '../shared/lib/images';

export function ComingSoonPage({ section }: { section: 'creators' | 'learn' }) {
  const [active, setActive] = useState(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % 3), 3000);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);
  const creators = section === 'creators';
  return <section className="coming-soon" aria-labelledby="coming-soon-title">
    <div className="coming-soon-copy"><span className="coming-soon-badge">Em breve</span>
      <p className="coming-soon-section">{creators ? 'Criadores' : 'Aprenda'}</p>
      <h1 id="coming-soon-title">{creators ? 'Conheça quem dá vida à arte digital.' : 'Sua próxima descoberta começa aqui.'}</h1>
      <p>{creators ? 'Estamos preparando um espaço para apresentar artistas, suas histórias e suas coleções.' : 'Estamos preparando guias e conteúdos para você explorar o universo dos NFTs com mais confiança.'}</p>
      <Link to="/" hash="mercado" className="button">Explorar o mercado <span aria-hidden="true">→</span></Link>
    </div>
    <div className="coming-soon-background" aria-hidden="true">{['/images/marketplace/emerald-ape-042.webp', '/images/marketplace/sage-nomad-009-uniform.webp', '/images/marketplace/neon-vessel-552-uniform.webp'].map((image, index) => <img key={image} className={index === active ? 'is-active' : ''} src={image} srcSet={imageSources(image)} sizes="(max-width:640px) 100vw, 900px" alt="" width="900" height="900" />)}</div>
  </section>;
}
