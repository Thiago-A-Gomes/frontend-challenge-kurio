# Kurio — NFT Marketplace

Marketplace de arte digital desenvolvido com React e TypeScript. Catálogo, favoritos, conta de colecionador, carrinho e compra completa com pagamento simulado e recibo.

**[Abrir demonstração](https://frontend-challenge-kurio-tau.vercel.app)** · **[Código no GitHub](https://github.com/Thiago-A-Gomes/frontend-challenge-kurio)**

> Projeto de demonstração: NFTs, contas, carteiras e pagamentos são fictícios. Nenhuma transação financeira ou conexão com blockchain é realizada. Não utilize dados pessoais ou senhas reais.

## Funcionalidades

- Busca, filtros combinados, ordenação e paginação preservados na URL e no histórico.
- Detalhe do NFT com galeria, edições, quantidade, avaliações fictícias e recomendações.
- Cadastro, login, expiração de sessão e edição de perfil, avatar, senha e carteiras.
- Favoritos e carrinho com persistência por usuário e recuperação de falhas.
- Cupom `KURIO10`, checkout, pedido pendente e recibo confirmado pela API simulada.
- Recuperação após timeout com a mesma tentativa de compra e atualizações de preço/disponibilidade via Socket.IO.
- Interface responsiva, navegação por teclado e gerenciamento de foco em diálogos.
- Quatro guias educativos com leitura em diálogo e inscrição demonstrativa na newsletter, validada e persistida pela API simulada.
- Feedback da página e do intervalo de resultados, com filtros e paginação sem saltos de rolagem.

Criadores e Aprenda apresentam “Em breve” com fundo animado. Login social e recursos sem integração exibem feedback de indisponibilidade.

## Tecnologias

| Responsabilidade | Ferramentas |
| --- | --- |
| Interface e build | React 19, TypeScript e Vite |
| Rotas e estado remoto | TanStack Router e TanStack Query |
| Requisições e simulação | Axios e Mock Service Worker (MSW) |
| Tempo real | Socket.IO Client e binding Socket.IO/MSW |
| Estilos e componentes | Tailwind CSS, Radix Slot e componentes no padrão shadcn/ui |
| Qualidade | Playwright, ESLint e Lighthouse |

REST passa pelos handlers MSW e os eventos passam pelo cliente Socket.IO. A interface aguarda a resposta da simulação para confirmar a compra. Os mocks também funcionam na demonstração publicada.

## Executar localmente

Requer **Node.js 22.19 ou mais recente da linha 22** e npm. Use `localhost`, `127.0.0.1` ou HTTPS para registrar o Service Worker.

```sh
git clone https://github.com/Thiago-A-Gomes/frontend-challenge-kurio.git
cd frontend-challenge-kurio/Kurio
npm ci
npm run dev
```

Abra o endereço indicado pelo Vite. A aplicação mostra a preparação enquanto o MSW inicia. REST e Socket.IO aguardam a rede simulada ficar pronta.

[.env.example](Kurio/.env.example) documenta `VITE_ENABLE_MOCKS`, cujo padrão é `true`. Desativar os mocks exige uma API compatível em `/api` e transporte de tempo real correspondente.

### Contas fictícias

| E-mail | Senha |
| --- | --- |
| `ana@kurio.test` | `Kurio123!` |
| `bruno@kurio.test` | `Kurio123!` |

As contas iniciais possuem carteira simulada. Você também pode cadastrar uma conta. Dados são persistidos localmente pelo mock e separados por usuário.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Desenvolvimento |
| `npm run check` | TypeScript, lint, fronteiras arquiteturais e build |
| `npm run build` | Build otimizado em `dist/` |
| `npm run preview` | Conferir o build localmente |
| `npm run test:e2e` | Testes E2E em desktop e mobile |
| `npm run test:report` | Abrir relatório HTML do Playwright |
| `npm run test:summary` | Resumir o último JSON de testes |
| `npm run audit:performance` | Medir navegação e requisições |
| `npm run audit:lighthouse` | Executar auditorias repetidas |

### Testes e regressão visual

```sh
npx playwright install chromium
npm run test:e2e -- --workers=1
npm run test:summary
npm run test:report
```

No Windows, para usar Chrome instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e -- --workers=1
```

Os projetos Chromium usam viewports de 1440×900 e 390×844, além de cenários de responsividade. Cada teste começa em contexto isolado. A suíte cobre conta e compra, falhas, sessão, tempo real, teclado e comparação visual de início, detalhe, carrinho e pagamento.

- [Testes E2E](Kurio/tests/e2e) e [baselines versionadas](Kurio/tests/e2e/visual.spec.ts-snapshots).
- [JSON da última execução](Kurio/reports/tests/results.json).
- HTML gerado localmente: `playwright-report/index.html`.
- Screenshots e traces de novas falhas: `test-results/`.

As baselines foram produzidas no Windows. Diferenças de sistema, fontes e navegador precisam de revisão visual. Não atualize snapshots apenas para esconder uma falha. A existência de testes não comprova aprovação; consulte o resultado da execução correspondente.

### Auditoria do build

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 5191 --strictPort
```

Em outro terminal:

```sh
npm run audit:performance
npm run audit:lighthouse
```

O Lighthouse usa Chrome instalado, três execuções por página/perfil, mocks no cenário padrão e cache HTTP limpo por amostra. O worker é instalado antes das medições. Imagens, fontes, animações e funcionalidades permanecem habilitadas. Relatórios HTML/JSON e configuração registrada ficam em [reports/lighthouse](Kurio/reports/lighthouse).

Considere somente conjuntos completos do mesmo build: execuções interrompidas não comprovam medianas ou metas. Audite o build otimizado; o servidor de desenvolvimento inclui módulos e verificações extras. CPU, rede e outros processos também afetam as notas.

## Resultados da revisão

**74 testes E2E aprovados**, sem falhas, instáveis ou ignorados, em Chromium desktop/mobile. As oito comparações visuais passaram; as duas baselines do início foram revisadas para incluir o contador de resultados. [Resumo por teste](Kurio/reports/tests/ANALISE.md) · [Relatório HTML para download](Kurio/reports/tests/html-report.zip).

| Lighthouse — mediana de três execuções | Desempenho | Acessibilidade | Boas práticas | SEO |
| --- | ---: | ---: | ---: | ---: |
| Início mobile | 89 | 100 | 100 | 100 |
| Início desktop | 99 | 100 | 100 | 100 |
| Detalhe mobile | 90 | 97 | 100 | 100 |
| Detalhe desktop | 100 | 97 | 100 | 100 |

O início mobile ainda fica abaixo da meta de desempenho 90. Em Criadores, o desempenho mediano ficou em 91 no mobile e 100 no desktop, com CLS mediano zero após corrigir a reserva de carregamento. [Revisão consolidada e limitações](Kurio/reports/REVISAO_GERAL.md) · [LCP, CLS, TBT e medianas](Kurio/reports/lighthouse/MEDIANAS.md) · [Auditorias HTML/JSON para download](Kurio/reports/lighthouse/audit-reports.zip).

Resultados medidos em build local otimizado, Node 22.23.4, Chrome 155 e Lighthouse 13.5.0. O audit de produção registrou zero vulnerabilidades; o audit completo ainda registra oito ocorrências em ferramentas de desenvolvimento, documentadas na revisão. Esses resultados não certificam segurança de produção nem atribuem pontuação final ao desafio.

## Simular erros

No console do navegador, escolha um cenário e recarregue:

```js
localStorage.setItem('kurio.scenario', 'slow')
location.reload()
```

| Cenário | Comportamento |
| --- | --- |
| `success` | Fluxo padrão |
| `slow` | Latência de dois segundos e carregamento visível |
| `empty` | Catálogo vazio |
| `offline` / `server-error` | Falha de rede / HTTP 503 |
| `expired` | Expiração em recurso autenticado |
| `favorite-error` | Falha da mutação e restauração do favorito |
| `payment-refused` | Recusa preservando o carrinho |
| `order-timeout` | Timeout após criar tentativa; recuperação do mesmo pedido |

Para restaurar o banco fictício deste navegador, consulte o procedimento de reset em [API.md](Kurio/API.md). O reset apaga alterações feitas na demonstração.

## Organização

```text
src/
├── app/       # Inicialização, rotas e composição
├── pages/     # Telas e fluxos de navegação
├── widgets/   # Blocos compartilhados de interface
├── features/  # Catálogo, conta, carrinho e compra
├── shared/    # Contratos, cliente HTTP, utilitários e UI
├── mocks/     # Handlers REST, banco fictício e eventos
└── styles/    # Estilos globais e responsividade
tests/e2e/    # Fluxos, falhas e baselines
scripts/      # Verificações, otimização e auditorias
docs/         # Guias de manutenção e segurança
reports/      # Evidências e medições
```

Comentários em português e inglês explicam responsabilidades e decisões. O lint também verifica as fronteiras entre camadas.

## Documentação

- [Arquitetura e decisões](Kurio/ARCHITECTURE.md)
- [Contratos da API e cenários](Kurio/API.md)
- [Mapa de telas](Kurio/SCREEN_MAP.md)
- [Guia do código em português e inglês](Kurio/docs/CODE_GUIDE.md)
- [Segurança e limites](Kurio/docs/SECURITY.md)
- [Diagnóstico e reparo](Kurio/docs/TROUBLESHOOTING.md)

## Publicação na Vercel

Configure **Root Directory: `Kurio`** e **Output Directory: `dist`**. Use os comandos de instalação/build definidos em [vercel.json](Kurio/vercel.json), que também configura fallback das rotas e cabeçalhos de segurança. Confirme os cabeçalhos e os fluxos no domínio publicado após o deploy.

O arquivo também define comandos de instalação/build que traduzem a variável legada `npm_config_cache_dir` para `npm_config_cache`. A linha principal do Node fica limitada à 22. O campo `allowScripts` do package.json aprova somente as versões instaladas de esbuild, MSW e Sharp, exigidas pelos respectivos scripts de instalação; não há autorização global de scripts de dependências.

## Limites

Este frontend demonstra integração com uma simulação determinística. Validações no navegador, isolamento por usuário e hashes no banco fictício não substituem autenticação, autorização e persistência em backend confiável. Não há pagamento, contrato blockchain ou login social real. Consulte o guia de segurança antes de adaptar o projeto para produção.
