/**
 * PT: Define o contrato de mensagens para ações auxiliares fora do escopo.
 * EN: Defines the feedback contract for auxiliary out-of-scope actions.
 */
// Contrato compartilhado para ações ainda indisponíveis nesta etapa.
// Centralizar este tipo evita repetir a mesma assinatura em vários componentes.
export type PendingFeatureHandler = (feature: string) => void;
