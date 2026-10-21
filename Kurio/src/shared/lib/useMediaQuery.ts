/**
 * PT: Reage à largura, orientação e preferências sem depender de modelos de dispositivos.
 * EN: Responds to width, orientation and preferences without device-model checks.
 */
import { useEffect, useState } from 'react';

// Acompanha rotação e redimensionamento, incluindo tablet em modo dividido.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
