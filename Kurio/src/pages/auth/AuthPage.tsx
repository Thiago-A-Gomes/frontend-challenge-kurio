/**
 * PT: Valida login/cadastro e retorna apenas a destinos internos permitidos.
 * EN: Validates login/registration and returns only to allowed internal destinations.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useLogin } from '../../features/account/api';
import { api, errorMessage } from '../../shared/api/client';
import { HomePage } from '../home/HomePage';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { PasswordInput } from '../../shared/ui/PasswordInput';
import { SocialIcon } from '../../widgets/layout/SocialIcon';
import './auth.css';

type Props = { mode: 'login' | 'register'; returnTo: string };
export function AuthPage({ mode, returnTo }: Props) {
  const dialog = useRef<HTMLDialogElement>(null), navigate = useNavigate(), login = useLogin();
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const registering = mode === 'register';
  useEffect(() => { dialog.current?.showModal(); return () => dialog.current?.close(); }, []);

  async function closeDialog(): Promise<void> {
    await navigate({ to: '/' });
    // PT: A troca de rota remonta o início; restaura o foco no acionador disponível.
    // EN: Routing remounts home; restore focus to the available trigger.
    requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>('.header a[href^="/login"]')?.focus());
  }

  async function submit(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form), email = String(data.get('email')), password = String(data.get('password'));
    setMessage(''); setBusy(true);
    try {
      if (registering) {
        if (password !== data.get('confirmation')) throw new Error('As senhas não coincidem.');
        await api.post('/register', { name: data.get('username'), username: data.get('username'), email, password });
      }
      await login.mutateAsync({ email, password });
      // Destinos são internos e conhecidos; URLs externas nunca são aceitas.
      if (returnTo.startsWith('/nfts/')) await navigate({ to: '/nfts/$nftId', params: { nftId: returnTo.split('/')[2] } });
      else if (returnTo.startsWith('/pedidos/')) await navigate({ to: '/pedidos/$orderId', params: { orderId: returnTo.split('/')[2] } });
      else if (returnTo === '/checkout') await navigate({ to: '/checkout' });
      else if (returnTo === '/carteiras') await navigate({ to: '/carteiras' });
      else await navigate({ to: '/perfil' });
    } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }

  return <>
    {/* Fundo visível, mas inerte: o foco fica preso no diálogo de autenticação. */}
    <div inert aria-hidden="true" className="auth-background"><HomePage onPendingFeature={() => undefined} /></div>
    <dialog ref={dialog} className="auth-dialog" aria-labelledby="auth-title" onCancel={(event) => { event.preventDefault(); void closeDialog(); }} onKeyDown={(event) => {
      if (event.key !== 'Tab') return;
      // PT: Inclui só controles visíveis, respeitando as versões desktop e mobile.
      // EN: Includes only visible controls, respecting desktop and mobile layouts.
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select,textarea,[tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <button className="dialog-close" type="button" aria-label="Fechar" onClick={() => void closeDialog()}>×</button>
      <p className="auth-mobile-brand" aria-hidden="true">KURIO</p>
      <h1 id="auth-title" className="auth-switch"><Link to="/login" search={{ returnTo }} activeProps={{ className: 'is-selected' }}>Entrar</Link><span aria-hidden="true">|</span><Link to="/cadastro" search={{ returnTo }} activeProps={{ className: 'is-selected' }}>Criar conta</Link></h1>
      <p className="auth-description">{registering ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.' : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}</p>
      <form aria-describedby="auth-error" onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }}>
        {registering && <label><span className="visually-hidden">Nome de usuário</span><Input name="username" placeholder="Nome de usuário" autoComplete="username" required pattern="[a-zA-Z0-9_.-]{2,40}" autoFocus /></label>}
        <label><span className="visually-hidden">E-mail</span><Input type="email" name="email" placeholder={registering ? 'Digite seu e-mail' : 'contato@email.com'} autoComplete="email" required autoFocus={!registering} /></label>
        <label><span className="visually-hidden">Senha</span><PasswordInput name="password" placeholder="Senha" autoComplete={registering ? 'new-password' : 'current-password'} required minLength={8} /></label>
        {registering && <label><span className="visually-hidden">Confirmar senha</span><PasswordInput name="confirmation" placeholder="Confirmar senha" autoComplete="new-password" required minLength={8} /></label>}
        {!registering && <button type="button" className="auth-forgot" onClick={() => setMessage('Recuperação de senha indisponível na demonstração. Use uma conta de teste ou cadastre uma nova conta.')}>Esqueceu a senha?</button>}
        <p id="auth-error" role="alert">{message}</p>
        <Button className="auth-submit" disabled={busy}>{busy ? 'Aguarde...' : registering ? 'Criar conta' : 'Entrar'}</Button>
      </form>
      <div className="auth-divider"><span>Ou continue com</span></div>
      {/* Logins externos não estão no escopo: o botão informa isso sem simular autenticação. */}
      <div className="auth-social"><Button variant="outline" type="button" onClick={() => setMessage('Login com Google indisponível na demonstração. Entre com e-mail e senha.')}><span className="google-mark" aria-hidden="true">G</span>Continuar com Google</Button><Button variant="outline" type="button" onClick={() => setMessage('Login com Facebook indisponível na demonstração. Entre com e-mail e senha.')}><SocialIcon name="Facebook" />Continuar com Facebook</Button></div>
      <p className="auth-mobile-footer">{registering ? <>Já tem uma conta? <Link to="/login" search={{ returnTo }}>Entre</Link></> : <>Novo na Kurio? <Link to="/cadastro" search={{ returnTo }}>Crie uma conta</Link></>}</p>
    </dialog>
  </>;
}
