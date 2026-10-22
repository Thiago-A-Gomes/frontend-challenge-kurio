# Manutenção / Troubleshooting

PT: Comece pelo sintoma e reproduza o erro. Evite apagar armazenamento, atualizar tudo ou trocar versões sem diagnóstico. Use apenas contas e carteiras fictícias.

EN: Start from the symptom and reproduce the failure. Avoid clearing storage, upgrading everything or changing versions without a diagnosis. Use fictional accounts and wallets only.

## Verificação inicial / Initial checks

```sh
node --version
npm ci
npm run check
npm run dev
```

PT: Use Node 22.19 ou superior. ESLint 10 e Lighthouse 13 exigem runtime suportado. O ambiente original usava Node 20.9; a revisão usa Node 22.23.4. `npm ci` respeita o lockfile; não substitua por upgrades indiscriminados.

EN: Use Node 22.19 or later for ESLint 10 and Lighthouse 13. The original runtime was Node 20.9; this revision uses Node 22.23.4. Keep the lockfile and avoid indiscriminate upgrades.

| Sintoma / Symptom | Diagnóstico e reparo / Diagnosis and repair |
|---|---|
| Página não abre / Page does not open | PT: Confira a URL impressa pelo Vite e o terminal. EN: Check the URL printed by Vite and terminal output. |
| Porta ocupada / Port in use | PT: Preserve servidores existentes; use `npm run dev -- --port 5190 --strictPort`. EN: Preserve existing servers; select another port. |
| Playwright não encontra o servidor / Cannot reach server | PT: Use a mesma porta em `PLAYWRIGHT_PORT` e confira a permissão de rede local. EN: Match `PLAYWRIGHT_PORT` and check local network permissions. |
| Navegador de testes ausente / Missing test browser | PT: Execute `npx playwright install chromium` ou defina `PLAYWRIGHT_CHANNEL=chrome` se Chrome estiver instalado. EN: Install Chromium or select installed Chrome. |
| API retorna 404 / API returns 404 | PT: Confira `VITE_ENABLE_MOCKS`, a aba Network e o escopo do Service Worker; a aplicação precisa de localhost ou HTTPS. EN: Check the mock flag, Network tab and Service Worker scope; localhost or HTTPS is required. |
| Mocks desatualizados / Stale mocks | PT: Recarregue a aplicação. Se o worker tiver mudado, execute `npx msw init public --save` e confira a versão de `msw`. EN: Reload; if the worker changed, regenerate it using the installed MSW version. |
| Login falha / Login fails | PT: Use as contas do README; confira 401 e mensagem da API. Não remova a proteção de rotas. EN: Use README credentials and inspect the 401/API message; do not remove route guards. |
| Sessão expira / Session expires | PT: Faça login novamente; verifique se `kurio.scenario` está em `expired`. EN: Sign in again and check whether the configured scenario is `expired`. |
| Dados de outro usuário / Another user's data | PT: Pare a alteração e teste logout/troca de usuário. Revise cancelamento, chaves de cache e cleanup do socket. EN: Stop and test account switching; inspect cancellation, cache keys and socket cleanup. |
| Carrossel parado / Carousel stopped | PT: Movimento reduzido pausa a reprodução; foco de teclado também pausa. Confira o timer e seu cleanup em `Hero.tsx`. EN: Reduced motion and keyboard focus pause playback; inspect the timer and cleanup. |
| Campo de senha branco / White password field | PT: Confira as regras `autofill` em `global.css` e a ordem dos estilos; mantenha autocomplete. EN: Check autofill styles and stylesheet order; keep autocomplete enabled. |
| Imagem quebrada / Broken image | PT: Confira Network e caminho em `public/images`; execute `npm run optimize:images` se faltarem WebPs. EN: Inspect Network and local asset paths; regenerate missing WebPs. |
| CSS mobile não aplica / Mobile CSS missing | PT: `mobile.css` entra após os estilos base em `main.tsx`; revise especificidade e media queries. EN: Mobile styles load after base styles; review specificity and breakpoints. |
| Overflow horizontal / Horizontal overflow | PT: Inspecione o elemento que excede a janela; use `min-width:0`, colunas fluidas e largura limitada no componente. Não esconda o erro globalmente com `overflow-x:hidden`. EN: Find the oversized element and fix its sizing rather than hiding the issue globally. |
| Filtro perdeu estado / Filters lost state | PT: Confira a URL e `validateCatalogSearch`; filtros devem reiniciar a página em 1. EN: Inspect URL/search validation; filter changes should reset pagination. |
| Quantidade ou preço incoerente / Wrong quantity or price | PT: Compare `/api/cart` e `/api/quotes`. Use `eth.ts` e BigInt; nunca calcule dinheiro com `parseFloat`. EN: Compare cart/quote responses and use BigInt helpers instead of floating-point arithmetic. |
| Compra mudou de valor / Purchase amount changed | PT: Exija nova revisão; não contorne o conflito 409. EN: Require another review; never bypass a quote conflict. |
| Pedido ficou pendente / Order remains pending | PT: Confira REST e Socket.IO; recarregue e consulte o mesmo pedido. EN: Inspect REST/socket state, reload and recover the same order. |
| Timeout ao comprar / Purchase timeout | PT: Repita a mesma tentativa, preservando a chave de idempotência; não crie outra chave antes de consultar o resultado. EN: Retry the same attempt/key and recover its result before creating another attempt. |
| Eventos duplicados / Duplicate events | PT: Confira `eventId`, versão e usuário; um evento antigo nunca deve sobrescrever um novo. EN: Check event identity, version and owner; old events must not overwrite newer state. |
| Campo não encontrado no teste / Test cannot find field | PT: Confira `label`, `htmlFor` e nome acessível. Não substitua testes por seletores frágeis só para passar. EN: Verify label association/accessibility; avoid brittle selectors just to make tests pass. |
| Snapshot visual divergiu / Visual snapshot differs | PT: Inspecione o diff e compare com Figma antes de atualizar baselines. EN: Inspect the diff and compare with Figma before updating baselines. |
| Auditoria Lighthouse não inicia / Lighthouse does not start | PT: Confira Chrome instalado, porta `LIGHTHOUSE_PORT` e acesso local. EN: Check installed Chrome, debugging port and local network access. |
| Vulnerabilidades em dependências / Dependency advisories | PT: Diferencie produção de ferramentas de desenvolvimento; revise `npm audit`, atualize com cuidado e repita os testes. Não use `--force` automaticamente. EN: Separate runtime and development risk; review upgrades and rerun tests, without automatic forced updates. |

## Comandos reproduzíveis / Reproducible commands

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_PORT = '5190'
npm run test:e2e
npm run test:report
```

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 5191 --strictPort
```

PT: Em outro terminal, execute as auditorias uma de cada vez para reduzir interferência.

EN: Run audits one at a time in another terminal to reduce interference.

```sh
npm run audit:performance
npm run audit:lighthouse
npm audit --omit=dev
```

## Console e Lighthouse / Console and Lighthouse

PT: `Range.expand()` apontando para `contentScript.js` não aparece no código do projeto. Reproduza sem extensões antes de atribuir a origem. O teste `console.spec.ts` coleta exceções, console.error, assets quebrados e deprecações do Chrome durante uma compra completa. A versão antiga do TanStack Router renderizava um marcador `<script>`; foi atualizada para 1.170.45. Após atualizar dependências, reinicie Vite com `npm run dev -- --force` para renovar a pré-compilação. Não filtre ou esconda o erro no console.

EN: `Range.expand()` in `contentScript.js` is not present in the project source. Reproduce without extensions before attributing it. `console.spec.ts` collects exceptions, console.error, broken assets and Chrome deprecations during a complete purchase. The old TanStack Router rendered a `<script>` marker; it was updated to 1.170.45. Restart Vite with `npm run dev -- --force` after dependency changes. Never filter or suppress errors to claim a clean console.

PT: Para Lighthouse, use o build otimizado no preview 5191 e as quatro categorias exigidas. Resultados com `!` em todas as categorias ou `scoreDisplayMode: error` são falhas de coleta e não comprovam aprovação/reprovação dos controles. O script rejeita essas execuções. O warning de IndexedDB indica estado local preexistente: cada amostra automatizada usa mocks restaurados e cache HTTP limpo. A instalação prévia do worker é registrada na metodologia. Itens manuais de acessibilidade não são comprovados por pontuação automática. HTTPS, redirecionamento e HSTS precisam ser verificados no host publicado; configurações locais não provam deploy.

EN: Audit the optimized preview on port 5191 using the four required categories. All-category `!` or `scoreDisplayMode: error` indicates collection failure, not proof that controls pass/fail. The script rejects these runs. IndexedDB warnings indicate existing local state; automated samples reset mocks and HTTP cache. Preinstalled-worker conditions are documented. Automated scores do not certify manual accessibility checks. Verify HTTPS, redirects and HSTS on the deployed host.

## Reset deliberado / Deliberate reset

### Avisos de instalação na Vercel / Vercel installation warnings

PT: `engines.node` usa `^22.19.0`, limitado à linha principal 22. Os scripts de instalação aprovados constam de `allowScripts`, por pacote e versão: esbuild 0.25.12, MSW 2.10.5 e Sharp 0.33.5. Ao atualizar um desses pacotes, revise o novo script antes de atualizar sua aprovação; não habilite todos os scripts globalmente.

EN: Node is constrained to major 22. Installation approvals are pinned to the reviewed esbuild, MSW and Sharp versions. Review changed installation scripts before renewing approvals; never allow every dependency script globally.

PT: O aviso `Unknown env config cache-dir` indica a variável legada `npm_config_cache_dir`. O runner `scripts/vercel-command.mjs` a traduz para `npm_config_cache` antes de chamar npm, preservando uma configuração válida já existente. O runner não filtra logs nem muda o nível dos avisos. Se o aviso aparecer antes de executar nossos comandos, sua origem é a preparação da plataforma; remova a variável legada em Settings → Environment Variables se ela estiver cadastrada no projeto.

EN: The deployment runner translates legacy cache-dir configuration into npm's supported cache setting, retaining any explicit valid setting. It does not filter logs. Warnings emitted before the project commands originate in platform preparation; remove a project-level legacy variable if configured.

PT: Se aparecer “This library called use() to suspend”, mantenha React.lazy nas rotas secundárias. Não substitua por lazyRouteComponent sem testar o ciclo de suspensão no React 19. Se a galeria mobile voltar a exibir miniaturas na lateral, confira a ordem das importações em main.tsx: estilos das páginas antes de mobile.css. Os testes visuais devem passar sem regenerar as baselines.

EN: For “This library called use() to suspend”, retain React.lazy on secondary routes and test React 19 suspension before replacing it. If mobile thumbnails move beside the image, check main.tsx style order: page styles must precede mobile.css. Visual tests should pass without regenerating baselines.

PT: npm pode avisar sobre @opentelemetry/sdk-trace-base, dependência transitiva do Lighthouse via Sentry. A versão atual do Lighthouse ainda a utiliza. Isso é um aviso da ferramenta de auditoria em Node, não uma API descontinuada executada pela página. Registre a cadeia e acompanhe a atualização upstream; não suprima avisos nem force uma versão incompatível.

EN: npm may warn about @opentelemetry/sdk-trace-base, used transitively by Lighthouse through Sentry. This is a Node audit-tool dependency, not a deprecated browser API in the application. Track upstream migration rather than suppressing warnings or forcing incompatible packages.

PT: Para retornar ao cenário fictício inicial, use a ação documentada `/api/demo/reset`. Isso apaga os dados simulados, incluindo contas criadas e pedidos. Faça apenas quando a reprodução exigir um estado novo. Os testes já isolam cada contexto.

EN: Use the documented `/api/demo/reset` action to restore initial fixtures. It deletes simulated state, including created accounts and orders. Only do so when reproduction requires a fresh state. Tests already isolate each context.
