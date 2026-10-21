/**
 * PT: Alterna artes a cada três segundos, com cleanup do timer e respeito a movimento reduzido.
 * EN: Cycles artwork every three seconds, cleaning up timers and respecting reduced motion.
 */
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import './hero-carousel.css';
import { imageSources } from '../../../shared/lib/images';

// As três artes compartilham a mesma área, sem mudar a altura da seção.
const slides = [
  { id: 'emerald', src: '/images/marketplace/emerald-ape-042.webp', alt: 'Emerald Ape: macaco com óculos e jaqueta verde' },
  { id: 'sage', src: '/images/marketplace/sage-nomad-009-uniform.webp', alt: 'Sage Nomad: macaco com chapéu verde e moletom roxo' },
  { id: 'neon', src: '/images/marketplace/neon-vessel-552-uniform.webp', alt: 'Neon Vessel: macaco de blazer claro e gola verde' },
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const keyboardInteraction = useRef(false);
  const [focused, setFocused] = useState(false);
  // Verifica a preferência antes de iniciar qualquer temporizador.
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  useEffect(() => {
    const keyboard = () => { keyboardInteraction.current = true; };
    const pointer = () => { keyboardInteraction.current = false; setFocused(false); };
    window.addEventListener('keydown', keyboard); window.addEventListener('pointerdown', pointer);
    return () => { window.removeEventListener('keydown', keyboard); window.removeEventListener('pointerdown', pointer); };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    // Pausa apenas para foco de teclado e preferência por movimento reduzido.
    if (focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      // A divisão com resto faz o último slide voltar ao primeiro.
      setActiveIndex((previous) => (previous + 1) % slides.length);
    }, 3000);
    // Limpa o timer ao pausar ou desmontar, evitando intervalos duplicados.
    return () => window.clearInterval(timer);
  }, [focused, reducedMotion]);

  function selectSlide(index: number): void {
    setActiveIndex(index);
    // A troca automática continua quando o usuário termina de interagir.
  }

  return (
    <section className="hero" aria-labelledby="hero-title" aria-roledescription="carrossel" onFocusCapture={() => setFocused(keyboardInteraction.current)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="hero-copy">
        <p className="eyebrow">Bem-vindo à Kurio</p>
        <h1 id="hero-title">Seja dono do futuro<br />da arte digital</h1>
        <p className="description">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</p>
        <Link className="button explore" to="/" hash="mercado">Explorar</Link>
        <div className="slide-indicators" role="group" aria-label="Controles do destaque">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" className="slide-dot" aria-label={`Mostrar imagem ${index + 1}: ${slide.alt}`} aria-pressed={activeIndex === index} aria-controls="hero-carousel-images" onClick={() => selectSlide(index)} />
          ))}
        </div>
      </div>
      <div className="hero-art hero-carousel-images" id="hero-carousel-images" aria-live={focused || reducedMotion ? 'polite' : 'off'}>
        {/* As camadas permanecem montadas: a opacidade produz a transição. */}
        {slides.map((slide, index) => (
          <div key={slide.id} className={`hero-slide${activeIndex === index ? ' is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}`} aria-hidden={activeIndex !== index}>
            {failedImages.includes(slide.id) ? (
              <div className="image-placeholder"><p>Imagem indisponível</p><small>{slide.alt}</small></div>
            ) : (
              <img src={slide.src} srcSet={imageSources(slide.src)} sizes="(max-width: 640px) 40vw, (max-width: 1000px) 40vw, 450px" fetchPriority={index === 0 ? 'high' : 'low'} width="450" height="450" alt={slide.alt} onError={() => setFailedImages((previous) => [...previous, slide.id])} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
