/** PT: Prévias locais do diário. EN: Local journal previews. */
export type ArticleId = 'propriedade' | 'artistas' | 'raridade' | 'carteira';
export type JournalArticle = { id: ArticleId; image: string; date: string; duration: number; title: string; description: string };
export const articles: JournalArticle[] = [
  { id: 'propriedade', image: 'neon-vessel-552-uniform.webp', date: '12 de setembro', duration: 2, title: 'Como funciona a propriedade de NFTs', description: 'Aprenda a colecionar, negociar e verificar obras digitais.' },
  { id: 'artistas', image: 'emerald-ape-042.webp', date: '13 de setembro', duration: 2, title: '10 artistas digitais para acompanhar', description: 'Conheça criadores que moldam a cultura digital.' },
  { id: 'raridade', image: 'sage-nomad-009-uniform.webp', date: '15 de setembro', duration: 2, title: 'Raridade, atributos e procedência', description: 'Entenda raridade, procedência, direitos autorais e utilidade.' },
  { id: 'carteira', image: 'golden-beat-207-uniform.webp', date: '15 de setembro', duration: 2, title: 'Como proteger sua carteira', description: 'Proteja sua carteira, seus ativos e sua identidade.' },
];
