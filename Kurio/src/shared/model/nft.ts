/**
 * PT: Define ou reexporta o modelo visual compartilhado de um NFT.
 * EN: Defines or re-exports the shared NFT presentation model.
 */
// Define os dados necessários para apresentar um NFT no catálogo.
// O mesmo formato poderá ser reutilizado no contrato da API simulada.
export type Nft = {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  // ETH é uma string decimal para evitar perdas de precisão de ponto flutuante.
  // Não vamos usar Number ou parseFloat para calcular valores de compra.
  // null identifica somente o item da prévia cujo preço ainda não conhecemos.
  priceEth: string | null;
  // O ponto de interrogação torna o preço anterior opcional.
  previousPriceEth?: string;
};
