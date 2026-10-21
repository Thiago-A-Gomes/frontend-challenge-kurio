/**
 * PT: Conecta provedores e expiração de sessão; não contém regras financeiras.
 * EN: Connects providers and session expiry; it contains no pricing rules.
 */
import { useEffect, useState } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../shared/api/queryClient';

// Componente é uma função que descreve uma parte da interface usando JSX.
// JSX parece HTML, mas permite inserir expressões JavaScript entre chaves.
export function App() {
  // Estado é um valor que, ao mudar, faz o React atualizar a interface.
  const [message, setMessage] = useState('');
  useEffect(() => {
    const expire = async () => {
      await queryClient.cancelQueries(); queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'session' });
      queryClient.setQueryData(['session'], null);
      setMessage('Sua sessão expirou. Entre novamente para continuar.');
      await router.invalidate();
    };
    window.addEventListener('kurio:session-expired', expire);
    return () => window.removeEventListener('kurio:session-expired', expire);
  }, []);

  // O parâmetro feature só pode receber texto; void indica ausência de retorno.
  function reportPendingFeature(feature: string): void {
    setMessage(`${feature}: esta funcionalidade será construída nas próximas etapas.`);
  }

  return (
    // Provider disponibiliza o roteador. O contexto leva o feedback às páginas.
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ message, onPendingFeature: reportPendingFeature }} />
    </QueryClientProvider>
  );
}
