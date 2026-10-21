/**
 * PT: Valida o limite de confiança da simulação; produção exige as mesmas defesas no servidor.
 * EN: Validates the simulation trust boundary; production needs the same defenses on the server.
 */
// Defesas na fronteira da API simulada. Produção precisa repeti-las no servidor.
export function assertPayload(value: unknown, depth = 0): void {
  if (depth > 12) throw new Error('Estrutura de dados muito profunda.');
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Propriedade de dados não permitida.');
      assertPayload(child, depth + 1);
    }
  }
}

export function validAvatar(value: string): boolean {
  if (!value) return true;
  if (value.length > 2800000) return false;
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return false;
  try {
    const bytes = atob(match[2]);
    if (bytes.length > 2 * 1024 * 1024) return false;
    if (match[1] === 'png') return bytes.startsWith('\x89PNG\r\n\x1a\n');
    if (match[1] === 'jpeg') return bytes.startsWith('\xff\xd8\xff');
    return bytes.startsWith('RIFF') && bytes.slice(8, 12) === 'WEBP';
  } catch { return false; }
}
