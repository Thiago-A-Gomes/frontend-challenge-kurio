/**
 * PT: Organiza a navegação da conta e efetua logout com limpeza dos dados privados.
 * EN: Organizes account navigation and logs out while clearing private data.
 */
import { AccountIcon } from './AccountIcon';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useLogout } from '../../features/account/api';

export function AccountLayout({ children }: { children: ReactNode }) {
  const logout = useLogout(), navigate = useNavigate();
  const [message, setMessage] = useState('');
  return <div className="account-layout"><aside className="account-sidebar"><h2>Meu perfil</h2>
    <Link to="/perfil" activeOptions={{ exact: true }}><AccountIcon name="profile" />Dados do perfil</Link>
    <Link to="/carteiras"><AccountIcon name="wallet" />Carteiras</Link>
    {['Atividade', 'Lista de interesse', 'Ofertas', 'Arquivos baixados', 'Suporte'].map((label) => <button key={label} className="account-menu-action" type="button" onClick={() => setMessage(`${label}: conteúdo indisponível nesta demonstração.`)}><AccountIcon name={label} />{label}</button>)}
    <button className="account-logout" disabled={logout.isPending} onClick={async () => { try { await logout.mutateAsync(); await navigate({ to: '/' }); } catch { setMessage('Não foi possível sair. Tente novamente.'); } }}><AccountIcon name="exit" />Sair</button>
  </aside><div className="account-content">{children}<p role="status">{message}</p></div></div>;
}
