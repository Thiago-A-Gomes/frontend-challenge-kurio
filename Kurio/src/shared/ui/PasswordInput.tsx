/**
 * PT: Alterna a visibilidade da senha sem desabilitar o gerenciador de senhas.
 * EN: Toggles password visibility without disabling password managers.
 */
import { useState } from 'react';
import { Input } from './input';
import type { InputHTMLAttributes } from 'react';

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return <div className="password-input"><Input {...props} type={visible ? 'text' : 'password'} /><button type="button" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visible} onClick={() => setVisible(!visible)}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{!visible && <path d="m3 21 18-18" />}</svg>
  </button></div>;
}
