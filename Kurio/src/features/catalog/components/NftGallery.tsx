/**
 * PT: Seleciona miniaturas e amplia a arte em diálogo nativo com fechamento por Escape.
 * EN: Selects thumbnails and enlarges artwork in a native dialog closed with Escape.
 */
import { useRef, useState } from 'react';
import type { Nft } from '../model/nft';

// A galeria recebe o NFT, sem conhecer as rotas ou a origem dos dados.
export function NftGallery({ nft }: { nft: Nft }) {
  const [selected, setSelected] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A referência repete a mesma arte nas miniaturas. Reutilizamos o arquivo,
  // sem inventar outros ângulos. Poderemos receber imagens distintas pela API.
  const thumbnails = [0, 1, 2, 3];

  return (
    <div className="nft-gallery-layout">
      <div className="nft-thumbnails" role="group" aria-label="Imagens do NFT">
        {thumbnails.map((index) => (
          <button key={index} type="button" aria-label={`Ver imagem ${index + 1} de ${nft.name}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <img src={nft.image} alt="" width="90" height="90" />
          </button>
        ))}
      </div>
      <div className="nft-detail-gallery">
        <img src={nft.image} alt={nft.imageAlt} width="600" height="600" />
        <button className="gallery-zoom" type="button" aria-label={`Ampliar imagem de ${nft.name}`} onClick={() => dialogRef.current?.showModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="m15 15 7 7M10 6v8M6 10h8" /></svg>
        </button>
      </div>
      {/* dialog nativo controla o foco e fecha por Escape sem biblioteca extra. */}
      <dialog ref={dialogRef} className="nft-image-dialog" aria-label={`Imagem ampliada de ${nft.name}`}>
        <button className="button" type="button" autoFocus onClick={() => dialogRef.current?.close()}>Fechar</button>
        <img src={nft.image} alt={nft.imageAlt} width="900" height="900" />
      </dialog>
    </div>
  );
}
