/**
 * PT: Descreve a identidade e a contagem de uma coleção do catálogo.
 * EN: Describes catalog collection identity and count.
 */
// Modelo da coleção, independente de React e do transporte HTTP.
export type Collection = { id: string; name: string; count: number };
