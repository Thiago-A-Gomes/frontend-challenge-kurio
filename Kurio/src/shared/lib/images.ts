/**
 * PT: Oferece tamanhos reais de imagens locais; o navegador escolhe pela tela e densidade.
 * EN: Offers real local image sizes; the browser chooses by viewport and pixel density.
 */
export function imageSources(source: string): string | undefined {
  if (!source.startsWith('/images/') || !source.endsWith('.webp')) return undefined;
  const stem = source.slice(0, -5);
  return `${stem}-360.webp 360w, ${stem}-600.webp 600w, ${source} 900w`;
}
