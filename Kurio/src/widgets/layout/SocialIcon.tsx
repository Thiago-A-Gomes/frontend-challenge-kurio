/**
 * PT: Fornece símbolos SVG locais para os links e botões sociais.
 * EN: Provides local SVG symbols for social links and buttons.
 */
type SocialIconProps = { name: string };

// SVGs locais: ícones nítidos em qualquer tamanho, sem baixar imagens externas.
// O nome acessível fica no botão que contém o ícone; o desenho é decorativo.
export function SocialIcon({ name }: SocialIconProps) {
  const paths: Record<string, React.ReactNode> = {
    Facebook: <path d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5C17.4 1.3 16.5 1 15 1c-3.2 0-5 2-5 5.5V9H7v4h3v8z" />,
    Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" /></>,
    Twitter: <path d="M22 5.8a8 8 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.7 11.7 11.7 0 0 1-8.5-4.3 4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5c0 2 1.4 3.7 3.3 4a4 4 0 0 1-1.8.1 4.1 4.1 0 0 0 3.8 2.8A8.3 8.3 0 0 1 2 18.2 11.7 11.7 0 0 0 20 8.3v-.5A8.4 8.4 0 0 0 22 5.8z" />,
    LinkedIn: <><circle cx="5" cy="5" r="2" /><path d="M3 9h4v12H3zM10 9h4v1.7c.8-1.3 2-2 3.5-2 3 0 3.5 2 3.5 5V21h-4v-6.5c0-1.5-.3-2.5-1.5-2.5S14 13 14 14.5V21h-4z" /></>,
    YouTube: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3z" fill="#261813" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
