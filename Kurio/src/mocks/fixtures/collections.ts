/**
 * PT: Fixtures de coleções usadas somente na camada de simulação.
 * EN: Collection fixtures used only by the simulation layer.
 */
import type { Collection } from '../../features/catalog/model/collection';

// Quantidades da referência visual; ainda não calculadas pela API.
export const collectionPreview: Collection[] = [
  { id: 'arte-digital', name: 'Arte digital', count: 33 },
  { id: 'fotografia', name: 'Fotografia', count: 12 },
  { id: 'musica', name: 'Música', count: 65 },
  { id: 'arte-3d', name: 'Arte 3D', count: 39 },
  { id: 'colecionaveis', name: 'Colecionáveis', count: 23 },
  { id: 'generativa', name: 'Generativa', count: 17 },
  { id: 'jogos', name: 'Jogos', count: 19 },
  { id: 'assinaturas', name: 'Assinaturas', count: 13 },
  { id: 'utilidade', name: 'Utilidade', count: 18 },
];
