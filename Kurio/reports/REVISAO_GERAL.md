# Revisão geral e evidências

Esta revisão separa comportamento testado, medições locais e condições do deploy. Pontuações automáticas não certificam segurança de produção nem atribuem os 100 pontos do desafio.

## Matriz dos requisitos E2E

| Requisito | Evidência em tests/e2e/ |
| --- | --- |
| 1. Busca, filtros, ordenação, paginação e histórico | acceptance.spec.ts, core.spec.ts, revision.spec.ts |
| 2. Detalhe direto e recurso inexistente | core.spec.ts |
| 3. Cadastro, login, expiração, logout e troca de usuário | revision.spec.ts, core.spec.ts, recovery.spec.ts, security.spec.ts |
| 4. Favoritos, falha e restauração | recovery.spec.ts |
| 5. Carrinho, quantidade, remoção, cupom e persistência | core.spec.ts |
| 6. Compra completa e recibo confirmado | core.spec.ts, console.spec.ts |
| 7. Recusa, clique repetido e timeout idempotente | recovery.spec.ts, acceptance.spec.ts |
| 8. Perfil, avatar, senha e carteiras com validações | acceptance.spec.ts, core.spec.ts, security.spec.ts |
| 9. Preço e disponibilidade durante checkout | acceptance.spec.ts |
| 10. Eventos antigos/duplicados, desconexão e retomada | recovery.spec.ts, acceptance.spec.ts |
| 11. Teclado, foco e formulário | acceptance.spec.ts |
| 12. Skeletons, falha e nova tentativa | acceptance.spec.ts |
| Comparação visual das quatro telas em dois viewports | visual.spec.ts; oito baselines versionadas |
| Console, exceções, assets e deprecações do navegador | console.spec.ts; anexo console-and-issues.json |

Cada teste usa BrowserContext isolado. REST é interceptado pelo MSW e eventos atravessam o cliente Socket.IO. Cenários sensíveis controlam relógio, latência e eventos. Os testes de segurança verificam também resultados HTTP e isolamento de recursos; não são apenas verificações visuais.

## Correções desta revisão

- Rotas secundárias usam React.lazy para evitar o erro de suspensão use() observado com lazyRouteComponent no React 19.
- A ordem do CSS é fixa: estilos das páginas precedem mobile.css. Isso restaura a galeria mobile contra a baseline existente, sem regenerar imagens para aceitar a regressão.
- ESLint 10, plugin React Hooks 7 e Lighthouse 13 substituem versões antigas das ferramentas. Node de referência: 22.23.4; mínimo declarado: 22.19.
- README da raiz e do aplicativo explicam instalação em Kurio/, demonstração, testes, auditoria e publicação.

## Resultados

Build, TypeScript, ESLint e fronteiras arquiteturais passaram com Node 22.23.4. A execução completa terminou com **64 aprovados, zero falhas, zero ignorados e zero instáveis**, em 332,5 segundos, Chromium desktop/mobile e um worker. As oito baselines existentes passaram sem atualização. O HTML distribuível está em tests/html-report.zip; extraia e abra playwright-report/index.html. O teste de console não encontrou exceções, erros React, assets quebrados ou deprecações nos fluxos verificados.

Lighthouse 13.5.0, 18 amostras válidas, três por página/perfil, com medianas:

| Página | Perfil | Desempenho | Acessibilidade | Boas práticas | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Início | Mobile | 89 | 100 | 100 | 100 |
| Início | Desktop | 99 | 100 | 100 | 100 |
| Detalhe | Mobile | 90 | 97 | 100 | 100 |
| Detalhe | Desktop | 100 | 97 | 100 | 100 |
| Criadores (auditoria adicional) | Mobile | 78 | 100 | 100 | 100 |
| Criadores (auditoria adicional) | Desktop | 89 | 100 | 100 | 100 |

**A meta de desempenho não foi cumprida em todas as páginas/perfis.** No início mobile, LCP mediano de 3327 ms e FCP de aproximadamente 2500 ms limitam a nota; CLS foi zero e TBT mediano de 30 ms. A cadeia de inicialização inclui React/Router, a instalação dos mocks e REST. Lighthouse identificou aproximadamente 86 KiB de JavaScript não utilizado nesta navegação e cerca de 150 ms de economia potencial no CSS que bloqueia renderização. O transporte MSW e o restante das funcionalidades foram mantidos. Há preload da imagem principal e prioridade alta, mas a imagem identificada como LCP no mobile é um card do catálogo renderizado após a resposta REST.

Em Criadores, o CLS mediano de 0,253 no mobile e 0,226 no desktop penaliza o resultado. O relatório associa a mudança ao main quando o conteúdo de uma rota carregada sob demanda substitui sua reserva de carregamento. Esse é um problema remanescente de estabilidade visual, não um erro do coletor. A melhoria indicada é reservar dimensões compatíveis por rota antes de carregar seu conteúdo, verificando novamente navegação e snapshots. Não foi aplicada uma alteração funcional sem nova validação apenas para elevar a nota antes da entrega.

As notas automáticas não substituem a revisão manual de acessibilidade. Os relatórios individuais HTML/JSON estão no arquivo lighthouse/audit-reports.zip, acompanhados de ambiente, versões, hashes do build e configurações no summary.json. As condições incluem Service Worker previamente instalado, banco restaurado, cache HTTP desativado e navegador sem extensões; não representam uma primeira visita com instalação inicial do worker.

Consulte [o JSON da execução](tests/results.json), [o resumo dos testes](tests/ANALISE.md), [tempos de navegação e REST](performance/RESULTADOS.md) e [as medianas Lighthouse](lighthouse/MEDIANAS.md). Relatórios pertencem ao build e ambiente registrados nos dados; resultados de versões diferentes não devem ser combinados.

## Segurança e avisos

O audit de dependências de produção está em security-production.json; security-all.json inclui ferramentas de desenvolvimento. Não há garantia de ausência de vulnerabilidades futuras. Nenhum audit fix --force foi aplicado.

Nesta execução, o audit de produção registrou **zero vulnerabilidades**. O audit completo ainda registra **oito ocorrências: duas moderadas e seis altas**, nas cadeias de ferramentas Tailwind/globs/PostCSS e Sharp. A correção sugerida pelo npm inclui migrações de versão major; não se declara o repositório livre de vulnerabilidades. Essas ferramentas não integram o bundle entregue ao navegador, mas os avisos continuam relevantes para a manutenção do ambiente de build e processamento de imagens.

O aviso npm de @opentelemetry/sdk-trace-base 2.12.0 permanece transitivamente no Lighthouse 13.5.0 via Sentry. Ele não representa uma API descontinuada da aplicação no navegador. A cadeia permanece explícita em deprecations.json e deve acompanhar uma atualização compatível upstream.

O domínio Vercel respondeu HTTPS 200 e redirecionou HTTP com 308; CSP, HSTS, COOP, X-Frame-Options e nosniff foram observados nas respostas. Evidência: diagnostics/deployed-headers.json. A inspeção corresponde à versão publicada antes do próximo deploy desta revisão. Cabeçalhos devem ser conferidos novamente após publicar.

## Limites

Os testes exercitam uma API simulada, não um backend ou pagamento real. Segurança efetiva exige autorização e persistência no servidor. Acessibilidade manual e fidelidade ao Figma exigem revisão humana adicional; snapshots verificam regressões contra a implementação revisada. Medições locais não representam todos os dispositivos e redes.
