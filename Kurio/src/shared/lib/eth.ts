/**
 * PT: Converte ETH para unidades inteiras BigInt, evitando arredondamento financeiro.
 * EN: Converts ETH to integer BigInt units, avoiding financial rounding errors.
 */
// 1 ETH tem 18 casas decimais. BigInt mantém os cálculos exatos, sem floats.
const SCALE = 10n ** 18n;
export function toWei(value: string): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw new Error('Valor ETH inválido.');
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(18, '0'));
}
export function fromWei(value: bigint): string {
  const fraction = (value % SCALE).toString().padStart(18, '0').replace(/0+$/, '');
  return `${value / SCALE}${fraction ? `.${fraction}` : ''}`;
}
