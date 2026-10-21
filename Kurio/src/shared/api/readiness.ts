/**
 * PT: Adia somente o transporte até a infraestrutura estar pronta; não bloqueia a interface pública.
 * EN: Defers transport until infrastructure is ready without blocking the public interface.
 */
let readiness: Promise<void> = Promise.resolve();
export function setNetworkReadiness(promise: Promise<void>): void { readiness = promise; }
export function waitForNetwork(): Promise<void> { return readiness; }
