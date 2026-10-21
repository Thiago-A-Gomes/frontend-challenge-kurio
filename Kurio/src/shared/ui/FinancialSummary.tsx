/**
 * PT: Formata os valores já calculados pela API, sem operações em ponto flutuante.
 * EN: Formats amounts already calculated by the API, without floating-point arithmetic.
 */
import type { Totals } from '../api/contracts';

// O resumo apenas apresenta valores da API; a interface não recalcula a compra.
export function FinancialSummary({ totals, discountLabel = 'Desconto', showFeeNote = false, compact = false }: { totals: Totals; discountLabel?: string; showFeeNote?: boolean; compact?: boolean }) {
  return <dl className="financial-summary">
    {!compact && <div><dt>Subtotal</dt><dd>{totals.subtotal} ETH</dd></div>}
    {(!compact || /[1-9]/.test(totals.discount)) && <div><dt>{discountLabel}</dt><dd>− {totals.discount} ETH</dd></div>}
    <div><dt>Taxa de rede</dt><dd>{totals.networkFee} ETH{showFeeNote && <small className="network-fee-note">Taxa estimada</small>}</dd></div>
    <div className="summary-total"><dt>Total</dt><dd>{totals.total} ETH</dd></div>
  </dl>;
}
