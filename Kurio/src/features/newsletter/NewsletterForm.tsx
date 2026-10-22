/**
 * PT: Valida e registra a inscrição pela API; sucesso depende da resposta do mock.
 * EN: Validates and registers through the API; success requires the mock response.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, errorMessage } from '../../shared/api/client';
import type { NewsletterSubscription } from '../../shared/api/contracts';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const subscription = useMutation({
    mutationFn: async () => (await api.post<NewsletterSubscription>('/newsletter/subscriptions', { email })).data,
    retry: false,
  });
  return <>
    <form onSubmit={(event) => { event.preventDefault(); if (!subscription.isPending) subscription.mutate(); }}>
      <label className="visually-hidden" htmlFor="newsletter-email">Seu e-mail</label>
      <div className="newsletter-field">
        <input id="newsletter-email" type="email" name="email" autoComplete="email" placeholder="Digite seu e-mail..." required maxLength={254} value={email} disabled={subscription.isPending} aria-describedby="newsletter-description" onChange={(event) => { setEmail(event.target.value); subscription.reset(); }} />
        <button className="button" type="submit" disabled={subscription.isPending}>{subscription.isPending ? 'Salvando...' : 'Enviar'}</button>
      </div>
    </form>
    <p id="newsletter-description">Demonstração: cadastro neste navegador, sem envio de e-mails.</p>
    {subscription.isError && <p role="alert">{errorMessage(subscription.error)}</p>}
    {subscription.isSuccess && <p role="status">{subscription.data.alreadySubscribed ? 'Este e-mail já está cadastrado nesta demonstração.' : 'Inscrição demonstrativa confirmada neste navegador.'}</p>}
  </>;
}
