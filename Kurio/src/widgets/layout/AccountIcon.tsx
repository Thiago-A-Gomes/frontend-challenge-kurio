/**
 * PT: Desenha ícones locais sem carregar scripts ou imagens externas.
 * EN: Draws local icons without loading external scripts or images.
 */
// Ícones vetoriais com traço uniforme, alinhados aos itens do menu da conta.
export function AccountIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    profile: 'M8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0M5 21v-3a7 7 0 0 1 14 0v3z',
    wallet: 'M12 22s8-8 8-14a8 8 0 0 0-16 0c0 6 8 14 8 14zM9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
    Atividade: 'M2 3h3l3 13h12l2-10H6M9 21h.01M19 21h.01',
    'Lista de interesse': 'M12 21 3 12a6 6 0 0 1 9-8 6 6 0 0 1 9 8z',
    Ofertas: 'M17 3h4v4M21 3l-8 8-4-4-6 6M20 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7',
    'Arquivos baixados': 'M12 2v13m-5-5 5 5 5-5M5 13H3v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2',
    Suporte: 'm12 3 10 18H2zM12 9v5m0 3v1',
    exit: 'M9 4H4v16h5M8 12h14m-5-5 5 5-5 5',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.profile} /></svg>;
}
