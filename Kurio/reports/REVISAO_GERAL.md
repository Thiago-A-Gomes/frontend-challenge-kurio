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
| Banners, artigos, newsletter e paginação sem salto | home-actions.spec.ts |
| Console, exceções, assets e deprecações do navegador | console.spec.ts; anexo console-and-issues.json |

Cada teste usa BrowserContext isolado. REST é interceptado pelo MSW e eventos atravessam o cliente Socket.IO. Cenários sensíveis controlam relógio, latência e eventos. Os testes de segurança verificam também resultados HTTP e isolamento de recursos; não são apenas verificações visuais.

## Correções desta revisão

- Rotas secundárias usam React.lazy para evitar o erro de suspensão use() observado com lazyRouteComponent no React 19.
- A ordem do CSS é fixa: estilos das páginas precedem mobile.css. Isso restaura a galeria mobile contra a baseline existente, sem regenerar imagens para aceitar a regressão.
- ESLint 10, plugin React Hooks 7 e Lighthouse 13 substituem versões antigas das ferramentas. Node de referência: 22.23.4; mínimo declarado: 22.19.
- README da raiz e do aplicativo explicam instalação em Kurio/, demonstração, testes, auditoria e publicação.

- Banners abrem filtros específicos; guias editoriais são carregados sob demanda em diálogo acessível. Newsletter usa REST/MSW com persistência local e não envia mensagens.
- Paginação informa a página e o intervalo; busca/filtros preservam rolagem. Interações têm movimentos breves, respeitando movimento reduzido.

## Resultados

Build, TypeScript, ESLint e fronteiras arquiteturais passaram com Node 22.23.4. A execução completa terminou com **74 aprovados, zero falhas, zero ignorados e zero instáveis**, em 360.5 segundos, Chromium desktop/mobile e um worker. Início em 21/10/2026, 22:57:22 (horário de São Paulo).

As oito comparações visuais passaram. As duas baselines do início foram revisadas e atualizadas para incluir o contador de resultados; detalhe, carrinho e pagamento preservaram suas baselines. O HTML distribuível está em tests/html-report.zip; extraia e abra playwright-report/index.html. O teste de console não encontrou exceções, erros React, assets quebrados ou deprecações nos fluxos verificados.

Os cinco novos cenários de home-actions.spec.ts verificam banners com destinos distintos, remoção de filtros anteriores, paginação sem salto de rolagem, detalhe específico de cada card, quatro artigos com foco/Tab/Escape, movimento reduzido, e-mail inválido, persistência após refresh, idempotência, payload inválido e recuperação de HTTP 503. Os cinco cenários foram executados em desktop e mobile, totalizando dez novos casos.

Durante o desenvolvimento, o teste de teclado detectou fuga de foco no diálogo editorial. A correção mantém o ciclo de Tab nos controles e devolve foco ao acionador. Os traces de diagnóstico estão em tests/initial-failures/article-focus-desktop.zip e article-focus-mobile.zip; a execução final passou sem falhas.

Lighthouse 13.5.0: 18 amostras válidas, três por página/perfil, sem repetir pontuações baixas. Medianas:

| Página | Perfil | Desempenho | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | mobile | 89 | 100 | 100 | 100 | 3335 | 0.000 | 32 |
| Início | desktop | 99 | 100 | 100 | 100 | 767 | 0.000 | 0 |
| Detalhe | mobile | 90 | 97 | 100 | 100 | 3237 | 0.012 | 0 |
| Detalhe | desktop | 100 | 97 | 100 | 100 | 735 | 0.007 | 0 |
| Criadores | mobile | 91 | 100 | 100 | 100 | 3156 | 0.000 | 7 |
| Criadores | desktop | 100 | 100 | 100 | 100 | 706 | 0.000 | 0 |

**A meta de desempenho ainda não foi atingida no início mobile (89, meta 90).** O LCP mediano é de aproximadamente 3,3 segundos; a inicialização inclui React/Router, preparação do MSW e REST antes de exibir os cards. Lighthouse aponta JavaScript não utilizado nessa navegação e CSS bloqueando renderização. Os mocks, fontes, imagens e funcionalidades foram mantidos. A imagem principal tem preload, mas o elemento identificado como LCP no mobile pode ser o primeiro card do catálogo, renderizado após REST.

Em Criadores, a reserva de carregamento passou a usar as dimensões da página final. O CLS mediano caiu de 0,253 mobile / 0,226 desktop na coleta anterior para zero nesta revisão. As medianas de desempenho passaram de 78/89 para 91/100. A troca de imagens continua ativa.

Há variação relevante nos dados brutos: detalhe desktop registrou 100, 100 e 58. A terceira amostra apresentou TBT de 1903 ms e uma tarefa de 2300 ms; o relatório atribui aproximadamente 4,6 segundos a Style & Layout. Essa amostra foi preservada, sem repetição para melhorar a nota; sua causa específica não foi isolada. A mediana é 100, mas não representa garantia de estabilidade em todo equipamento.

Os relatórios individuais HTML/JSON estão em lighthouse/audit-reports.zip, com versões, hashes e condições em summary.json. O Service Worker é previamente instalado, o banco é restaurado e o cache HTTP é desativado por amostra, sem extensões. Não se trata da primeira visita com instalação inicial do worker. Resultados pertencem ao build identificado nos hashes; pontuações de versões diferentes não foram combinadas.

Consulte [o JSON da execução](tests/results.json), [o resumo dos testes](tests/ANALISE.md), [tempos de navegação e REST](performance/RESULTADOS.md) e [as medianas Lighthouse](lighthouse/MEDIANAS.md).

## Segurança e avisos

O audit de dependências de produção está em security-production.json; security-all.json inclui ferramentas de desenvolvimento. Não há garantia de ausência de vulnerabilidades futuras. Nenhum audit fix --force foi aplicado.

Nesta execução, o audit de produção registrou **zero vulnerabilidades**. O audit completo ainda registra **oito ocorrências: duas moderadas e seis altas**, nas cadeias de ferramentas Tailwind/globs/PostCSS e Sharp. A correção sugerida pelo npm inclui migrações de versão major; não se declara o repositório livre de vulnerabilidades. Essas ferramentas não integram o bundle entregue ao navegador, mas os avisos continuam relevantes para a manutenção do ambiente de build e processamento de imagens.

O aviso npm de @opentelemetry/sdk-trace-base 2.12.0 permanece transitivamente no Lighthouse 13.5.0 via Sentry. Ele não representa uma API descontinuada da aplicação no navegador. A cadeia permanece explícita em deprecations.json e deve acompanhar uma atualização compatível upstream.

O domínio Vercel respondeu HTTPS 200 e redirecionou HTTP com 308; CSP, HSTS, COOP, X-Frame-Options e nosniff foram observados nas respostas. Evidência: diagnostics/deployed-headers.json. A inspeção corresponde à versão publicada antes do próximo deploy desta revisão. Cabeçalhos devem ser conferidos novamente após publicar.

## Limites

Os testes exercitam uma API simulada, não um backend ou pagamento real. Segurança efetiva exige autorização e persistência no servidor. Acessibilidade manual e fidelidade ao Figma exigem revisão humana adicional; snapshots verificam regressões contra a implementação revisada. Medições locais não representam todos os dispositivos e redes.
