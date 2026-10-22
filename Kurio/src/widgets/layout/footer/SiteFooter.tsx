/**
 * PT: Compõe benefícios, links e cadastro demonstrativo de newsletter via API.
 * EN: Composes benefits, links and API-backed demo newsletter registration.
 */
import type { PendingFeatureHandler } from '../../../shared/types/feedback';
import { SocialIcon } from '../SocialIcon';
import { Link } from '@tanstack/react-router';
import { NewsletterForm } from '../../../features/newsletter/NewsletterForm';

const benefits = [
  { symbol: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { symbol: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { symbol: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises de mercado.' },
];

const linkGroups = [
  { title: 'Meu perfil', links: ['Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'] },
  { title: 'Central de ajuda', links: ['Central de ajuda', 'Como comprar NFTs', 'Carteiras e segurança', 'Política do mercado', 'Denunciar item'] },
  { title: 'Coleções', links: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'] },
];

// A inscrição é confirmada pela API e identificada como demonstração local.
export function SiteFooter({ onPendingFeature }: { onPendingFeature: PendingFeatureHandler }) {
  return (
    <footer className="home-footer" aria-label="Rodapé Kurio">
      <div className="footer-benefits">
        {benefits.map((benefit) => (
          <section className="footer-benefit" key={benefit.symbol}>
            <span className="benefit-symbol" aria-hidden="true">{benefit.symbol}</span>
            <h2>{benefit.title}</h2><p>{benefit.text}</p>
          </section>
        ))}
        <section className="newsletter" aria-labelledby="newsletter-title">
          <h2 id="newsletter-title">Antecipe-se ao próximo lançamento</h2>
          <NewsletterForm />
        </section>
      </div>
      <div className="footer-brand-row">
        <Link className="logo" to="/">KURIO</Link>
        <p>Feito para colecionadores,<br />criadores e cultura.</p>
        {/* Contatos da referência são demonstrativos, sem inventar destinatários. */}
        <span>contato@mail.com</span><span>+55 11 4602 8922</span>
      </div>
      <div className="footer-links">
        {linkGroups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul>{group.links.map((label) => <li key={label}>{label === 'Meu perfil' ? <Link to="/perfil">{label}</Link> : label === 'Carteiras e segurança' ? <Link to="/carteiras">{label}</Link> : group.title === 'Coleções' ? <Link to="/" hash="mercado">{label}</Link> : <button type="button" onClick={() => onPendingFeature(label)}>{label}</button>}</li>)}</ul>
          </section>
        ))}
        <section className="footer-social">
          <h2>Redes sociais</h2>
          <div className="social-buttons">
            {/* Ícones locais; os destinos externos ainda precisam ser definidos. */}
            {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map((name) => <button key={name} type="button" aria-label={name} onClick={() => onPendingFeature(name)}><SocialIcon name={name} /></button>)}
          </div>
          <h2 className="wallet-heading">Carteiras compatíveis</h2>
          <ul className="wallet-brands" aria-label="Carteiras compatíveis">
            <li>MetaMask</li><li>WalletConnect</li><li>Coinbase</li>
          </ul>
        </section>
      </div>
      <p className="footer-copyright">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  );
}
