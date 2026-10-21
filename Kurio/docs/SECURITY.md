# Segurança / Security

## Limite da entrega / Delivery boundary

PT: Esta aplicação demonstra um marketplace com MSW. Banco, sessões, pagamentos e eventos são fictícios e executam no navegador. Não use dados reais. Não é um backend seguro de produção e este documento não é uma certificação ou pentest completo.

EN: This application demonstrates a marketplace using MSW. Database, sessions, payments and events are fictional and run in the browser. Do not enter real data. This is not a secure production backend, and this document is not a certification or a complete penetration test.

## Defesas aplicadas / Implemented defenses

| Risco / Risk | Defesa / Defense | Limite / Boundary |
|---|---|---|
| XSS e HTML injetado / Injected HTML | Texto renderizado pelo React; sem `dangerouslySetInnerHTML`, `eval` ou `new Function`; teste de payload HTML. / React text rendering and injection regression test. | URLs e novos componentes continuam exigindo revisão contextual. / New URLs and components still require contextual review. |
| Prototype pollution | Corpo JSON rejeita `__proto__`, `constructor` e `prototype`, profundidade excessiva e tamanho acima do limite. / JSON rejects dangerous keys, excessive depth and oversized bodies. | A validação deve existir no backend real. / Validation must exist on a real backend. |
| Acesso indevido / Unauthorized access | Autorização por dono em carteiras, favoritos, cotações e pedidos; rotas privadas protegidas. / Owner checks and private-route guards. | Guards de frontend não são controle de acesso de servidor. / Frontend guards are not server authorization. |
| Vazamento de sessão / Session leakage | Cancelamento de consultas, cache privado limpo, socket por sessão e descarte de 401 atrasado de outro token. / Request cancellation, private-cache cleanup and session-scoped sockets. | Tokens de demonstração em localStorage são legíveis por scripts da origem. / Demo localStorage tokens are readable by origin scripts. |
| Redirecionamento aberto / Open redirect | `returnTo` aceita somente rotas internas previstas. / Return destinations use an internal route allowlist. | Novas rotas devem ser incluídas conscientemente. / New routes require deliberate allowlist changes. |
| Avatar malicioso / Malicious avatar | PNG/JPEG/WebP, limite de 2 MB e assinatura de arquivo na API simulada; SVG e URLs remotas rejeitados. / Size, type and magic-byte validation; SVG/remote URLs rejected. | Produção deve decodificar/reencodar imagem e limitar dimensões; assinatura sozinha não faz antivírus. / Production should decode/re-encode and bound dimensions; signatures are not antivirus. |
| Senhas em claro / Plaintext passwords | PBKDF2 com salt; respostas públicas omitem hash e salt; não há logs de credenciais. / Salted PBKDF2 and limited public account responses. | Hash e banco no cliente não protegem autenticação real. / Client-side hashing/storage does not secure real authentication. |
| Valores manipulados / Tampered amounts | Totais gerados na API simulada usando BigInt; cotação revalidada e snapshot do pedido. / API-side BigInt totals, quote revalidation and order snapshot. | Repetir regras em backend confiável. / Enforce on a trusted server. |
| Duplicação de compra / Duplicate purchase | Chave de idempotência por tentativa e conflito se o corpo mudar. / Per-attempt key and conflict on changed payload. | Backend real exige transação/constraint atômica e armazenamento durável. / Real backend needs atomic constraints and durable storage. |
| Eventos antigos / Stale events | Identidade e versão, filtro por dono e estados terminais. / Event IDs, versions, owner filtering and terminal-state guards. | Eventos reais exigem autenticação/autorização no servidor Socket.IO. / Real sockets need server authorization. |
| Exfiltração de credenciais / Credential exfiltration | Axios rejeita origem externa antes de anexar credenciais. / Axios blocks cross-origin API destinations before credentials are attached. | Revisar qualquer nova integração. / Review new integrations. |
| Clickjacking e recursos externos / Framing and external resources | Configurações CSP, nosniff, política de referrer e permissões para Vercel e hospedagem com `_headers`. / Hosting security-header configurations. | Cabeçalhos só valem quando aplicados pelo host; Vite local não comprova deploy. / Headers are effective only when the host applies them. |

## O que um backend real ainda precisa / What a real backend still needs

PT: Cookies de sessão HttpOnly/Secure/SameSite, proteção CSRF conforme autenticação, rate limiting, rotação/revogação de sessão, MFA se aplicável, logs sem segredos, autorização por recurso, TLS, política CORS restrita, queries parametrizadas, transações e idempotência atômica, gestão de segredos, limites de upload, monitoramento e backups. SQL injection não é exercitada aqui porque não há banco SQL nem comandos SQL. SSRF não é simulada porque a aplicação não busca URLs arbitrárias no servidor.

EN: HttpOnly/Secure/SameSite session cookies, authentication-appropriate CSRF protection, rate limiting, session rotation/revocation, MFA where appropriate, secret-free logs, per-resource authorization, TLS, restricted CORS, parameterized queries, transactions/atomic idempotency, secret management, upload limits, monitoring and backups. SQL injection is not exercised because there is no SQL database or query execution. SSRF is not simulated because there is no arbitrary server-side URL fetching.

## Hospedagem e dependências / Hosting and dependencies

PT: O preview aplica CSP, X-Frame-Options, COOP, nosniff, Referrer-Policy e Permissions-Policy. Vercel e hosts compatíveis com `_headers` têm configurações de HSTS. Verifique domínio HTTPS publicado e redirecionamento HTTP: GitHub Pages não aplica automaticamente `_headers` ou `vercel.json`. Não declaramos HTTPS/HSTS aprovados por testes locais. Trusted Types estrito e CSP com nonce/hash não são afirmados nesta entrega; exigem compatibilidade validada, incluindo o registro do Service Worker.

EN: Preview applies content/security headers; deployment configurations include HSTS. Verify actual HTTPS responses and redirects on the host. GitHub Pages does not automatically apply these header files. Local audits do not prove HTTPS/HSTS deployment. Strict Trusted Types and nonce/hash CSP are not claimed; they require validated compatibility, including Service Worker registration.

PT: `reports/security-production.json` registra dependências de produção; `security-all.json` inclui ferramentas. O audit completo registra avisos em ferramentas de auditoria/build. Resultado sem vulnerabilidades de produção não significa que todo o repositório esteja sem avisos. Atualizações major exigem runtime suportado e testes; não foi aplicado `audit fix --force` indiscriminadamente.

EN: Production and complete dependency audits are separate. Development-tool advisories remain explicitly reported. A clean production audit does not certify the whole repository. Major upgrades require supported-runtime testing.

## Referências / References

- [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP: Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP: File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
