/**
 * PT: Salva dados e senha de forma validada; avatar aceita formatos e tamanho limitados.
 * EN: Saves validated profile/password changes; avatars have limited types and size.
 */
import { useRef, useState } from 'react';
import { useSession } from '../../features/account/api';
import { api, errorMessage } from '../../shared/api/client';
import type { User } from '../../shared/api/contracts';
import { queryClient } from '../../shared/api/queryClient';
import { AccountLayout } from '../../widgets/layout/AccountLayout';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { PasswordInput } from '../../shared/ui/PasswordInput';
import './account.css';

export function ProfilePage() {
  const { data: user } = useSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [avatar, setAvatar] = useState<string | null>(null);
  if (!user) return null;
  return <AccountLayout><h1>Perfil do colecionador</h1>
    {/* Uma única ação Salvar persiste os dados e, se preenchida, a nova senha. */}
    <form key={user.id} className="account-form profile-form" aria-describedby="profile-feedback" onSubmit={async (event) => {
      event.preventDefault(); const form = event.currentTarget, data = new FormData(form); setMessage('');
      const newPassword = String(data.get('newPassword') ?? '');
      if (newPassword !== data.get('confirmation')) { setMessage('As senhas não coincidem.'); return; }
      setBusy(true);
      try {
        const ens = String(data.get('ens') ?? '').trim();
        const result = await api.patch<User>('/profile', { name: data.get('name'), username: data.get('username'), email: data.get('email'), walletNickname: data.get('walletNickname'), ens: ens ? `${ens.replace(/\.eth$/, '')}.eth` : '', avatar: avatar ?? user.avatar, currentPassword: data.get('currentPassword'), newPassword });
        queryClient.setQueryData(['session'], result.data); setMessage('Perfil atualizado.');
        for (const name of ['currentPassword', 'newPassword', 'confirmation']) (form.elements.namedItem(name) as HTMLInputElement).value = '';
      } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
    }}>
      <div className="profile-fields">
        <label><span>Nome de exibição<span className="profile-required" aria-hidden="true">*</span></span><Input name="name" aria-label="Nome de exibição" defaultValue={user.name} required minLength={2} autoComplete="name" /></label>
        <label><span>Nome de usuário<span className="profile-required" aria-hidden="true">*</span></span><Input name="username" aria-label="Nome de usuário" defaultValue={user.username} required pattern="[a-zA-Z0-9_.-]{2,40}" autoComplete="username" /></label>
        <label><span>E-mail<span className="profile-required" aria-hidden="true">*</span></span><Input type="email" name="email" aria-label="E-mail" defaultValue={user.email} required autoComplete="email" /></label>
        <label>Nome ENS<div className="ens-field"><span>.eth</span><Input name="ens" defaultValue={user.ens.replace(/\.eth$/, '')} aria-label="Nome ENS" spellCheck={false} /></div></label>
        <label>Apelido da carteira<Input name="walletNickname" defaultValue={user.walletNickname} /></label>
        <div className="avatar-field"><span>Avatar</span><div className="avatar-actions">
          {(avatar ?? user.avatar) ? <img className="profile-avatar" src={avatar ?? user.avatar} alt="Seu avatar" width="56" height="56" /> : <span className="avatar-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="6" /><circle cx="9" cy="9" r="2" /><path d="m4 17 4-4 4 3 3-5 5 6" /></svg></span>}
          <Input ref={fileInput} type="file" className="visually-hidden" aria-label="Escolher avatar" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
            const file = event.target.files?.[0]; if (!file) return;
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setMessage('Escolha PNG, JPEG ou WebP de até 2 MB.'); return; }
            const reader = new FileReader(); reader.onload = () => setAvatar(String(reader.result)); reader.readAsDataURL(file);
          }} />
          <Button className="button avatar-change" type="button" onClick={() => fileInput.current?.click()}>Alterar</Button>
          <Button className="avatar-remove" type="button" variant="ghost" onClick={() => { setAvatar(''); if (fileInput.current) fileInput.current.value = ''; }}>Remover</Button>
        </div></div>
      </div>
      <fieldset className="profile-passwords"><legend>Alterar senha</legend>
        <label>Senha atual<PasswordInput name="currentPassword" autoComplete="current-password" /></label>
        <label>Nova senha<PasswordInput name="newPassword" autoComplete="new-password" minLength={8} /></label>
        <label>Confirmar nova senha<PasswordInput name="confirmation" autoComplete="new-password" minLength={8} /></label>
      </fieldset>
      <Button disabled={busy} className="button profile-save">{busy ? 'Salvando...' : 'Salvar'}</Button>
      <p id="profile-feedback" role="status" aria-live="polite">{message}</p>
    </form>
  </AccountLayout>;
}
