/**
 * PT: Anuncia carregamento e reserva espaço enquanto a consulta está pendente.
 * EN: Announces loading and reserves space while a query is pending.
 */
// Skeleton reserva espaço e mostra carregamento sem saltos bruscos de layout.
export function LoadingState({ cards = 3 }: { cards?: number }) {
  return <div className="loading-grid" role="status" aria-label="Carregando conteúdo">{Array.from({ length: cards }, (_, index) => <div className="skeleton" key={index} />)}</div>;
}
