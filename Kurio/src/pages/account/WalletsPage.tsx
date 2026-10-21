/**
 * PT: Cadastra e edita carteiras por usuário, mantendo seleção principal e secundária.
 * EN: Creates and edits user-scoped wallets, preserving primary and secondary selection.
 */
import { useState } from 'react';
import { useSession, useWallets } from '../../features/account/api';
import { api, errorMessage } from '../../shared/api/client';
import { queryClient } from '../../shared/api/queryClient';
import type { Wallet } from '../../shared/api/contracts';
import { AccountLayout } from '../../widgets/layout/AccountLayout';
import { LoadingState } from '../../shared/ui/LoadingState';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import './account.css';

function WalletForm({ wallet, primary, onSaved }: { wallet?: Wallet; primary: boolean; onSaved: () => void }) {
  const { data: user } = useSession();
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  return <form className="account-form wallet-form" aria-describedby={`wallet-feedback-${primary}`} onSubmit={async (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setMessage('');
    try {
      const body = Object.fromEntries(['name', 'nickname', 'network', 'profileName', 'address', 'secondaryAddress', 'type', 'referralCode', 'email', 'ens'].map((key) => [key, String(data.get(key) ?? '').trim()]));
      await api.post('/wallets', { ...body, id: wallet?.id, primary });
      await queryClient.invalidateQueries({ queryKey: ['wallets'] }); setMessage('Carteira salva.'); onSaved();
    } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }}>
    {/* A ordem dos campos acompanha as duas colunas do frame desktop. */}
    <div className="wallet-fields">
      <label><span>Nome de exibição<span className="wallet-required" aria-hidden="true">*</span></span><Input name="name" defaultValue={wallet?.name ?? user?.name} required /></label>
      <label><span>Apelido da carteira<span className="wallet-required" aria-hidden="true">*</span></span><Input name="nickname" defaultValue={wallet?.nickname} required /></label>
      <label><span>Rede<span className="wallet-required" aria-hidden="true">*</span></span><select name="network" defaultValue={wallet?.network ?? ''} required><option value="" disabled>Selecione uma rede</option><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label>
      <label><span>Nome do perfil<span className="wallet-required" aria-hidden="true">*</span></span><Input name="profileName" defaultValue={wallet?.profileName ?? user?.username} required /></label>
      <label><span>Endereço da carteira<span className="wallet-required" aria-hidden="true">*</span></span><Input name="address" defaultValue={wallet?.address} placeholder="Endereço 0x da carteira" required spellCheck={false} /></label>
      <label>Endereço secundário (opcional)<Input name="secondaryAddress" defaultValue={wallet?.secondaryAddress} placeholder="ENS ou carteira secundária (opcional)" /></label>
      <label><span>Tipo de carteira<span className="wallet-required" aria-hidden="true">*</span></span><select name="type" defaultValue={wallet?.type ?? ''} required><option value="" disabled>Selecione uma carteira</option><option>MetaMask</option><option>WalletConnect</option><option>Coinbase Wallet</option></select></label>
      <label>Código de indicação (opcional)<Input name="referralCode" defaultValue={wallet?.referralCode} /></label>
      <label><span>E-mail<span className="wallet-required" aria-hidden="true">*</span></span><Input type="email" name="email" defaultValue={wallet?.email ?? user?.email} required autoComplete="email" /></label>
      <label>Nome ENS (opcional)<div className="ens-field"><span>.eth</span><Input name="ens" defaultValue={wallet?.ens} placeholder="nome.eth" /></div></label>
    </div>
    <Button className="button wallet-save" disabled={busy}>{busy ? 'Salvando...' : 'Salvar carteira'}</Button>
    <p id={`wallet-feedback-${primary}`} role="status" aria-live="polite">{message}</p>
  </form>;
}

export function WalletsPage() {
  const wallets = useWallets();
  const [addPrimary, setAddPrimary] = useState(false), [addSecondary, setAddSecondary] = useState(false);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const primary = wallets.data?.find((wallet) => wallet.primary), secondary = wallets.data?.find((wallet) => !wallet.primary);
  return <AccountLayout>
    <div className="wallet-section-heading"><h1>Carteira principal</h1><Button variant="ghost" onClick={() => setAddPrimary(!addPrimary)}>{addPrimary ? 'Cancelar' : 'Adicionar'}</Button></div>
    <p className="wallet-section-description">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
    {wallets.isPending ? <LoadingState cards={1} /> : wallets.isError ? <p role="alert">{errorMessage(wallets.error)}</p> : <>
      <WalletForm key={addPrimary ? 'new-primary' : primary?.id ?? 'primary'} wallet={addPrimary ? undefined : primary} primary onSaved={() => setAddPrimary(false)} />
      <section className="wallet-secondary" aria-label="Carteira secundária">
        <div className="wallet-section-heading"><h2>Carteira secundária</h2><div className="wallet-secondary-actions"><label className="wallet-same"><input type="checkbox" checked={sameAsPrimary} disabled={!primary} onChange={(event) => { setSameAsPrimary(event.target.checked); setAddSecondary(false); }} />Igual à carteira principal</label><Button variant="ghost" disabled={sameAsPrimary} onClick={() => setAddSecondary(!addSecondary)}>{addSecondary ? 'Cancelar' : secondary ? 'Editar' : 'Adicionar'}</Button></div></div>
        {sameAsPrimary && <p role="status">A carteira principal será usada no pagamento.</p>}
        {!sameAsPrimary && !secondary && !addSecondary && <><p>Você ainda não adicionou uma carteira secundária.</p><p>A carteira principal será usada no pagamento.</p></>}
        {!sameAsPrimary && (secondary || addSecondary) && <WalletForm key={secondary?.id ?? 'secondary'} wallet={secondary} primary={false} onSaved={() => setAddSecondary(false)} />}
      </section>
    </>}
  </AccountLayout>;
}
