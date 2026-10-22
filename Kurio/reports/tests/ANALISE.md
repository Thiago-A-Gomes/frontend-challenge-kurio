# Testes E2E / E2E tests

Fonte: results.json, gerado pelo Playwright. Cada teste usa um BrowserContext novo, sem sessão ou banco herdados. Chromium, desktop 1440×900 e mobile 390×844. Cenários adicionais verificam 320, 430 e 768 px. Sem retries de testes; REST via MSW, tempo real pelo cliente Socket.IO.

Esperados/aprovados: 64; falhas: 0; instáveis: 0; ignorados: 0. Duração total: 332.5 s.

| Perfil | Teste | Resultado | Duração |
|---|---|---|---:|
| desktop | filtros combinados, ordenação e histórico restauram controles e resultados | passed | 1.9 s |
| desktop | carregamento lento mostra skeleton e erro REST permite nova tentativa | passed | 5.1 s |
| desktop | avatar e senha validam erros, persistem e autenticam com a nova senha | passed | 6.1 s |
| desktop | edição de carteira rejeita endereço inválido e persiste correção | passed | 5.0 s |
| desktop | preço e disponibilidade via Socket.IO invalidam revisão no checkout | passed | 8.0 s |
| desktop | pedido pendente retoma após desconexão e clique repetido cria uma tentativa | passed | 9.9 s |
| desktop | teclado mantém foco no diálogo e valida formulário de login | passed | 1.2 s |
| mobile | filtros combinados, ordenação e histórico restauram controles e resultados | passed | 2.0 s |
| mobile | carregamento lento mostra skeleton e erro REST permite nova tentativa | passed | 7.1 s |
| mobile | avatar e senha validam erros, persistem e autenticam com a nova senha | passed | 6.0 s |
| mobile | edição de carteira rejeita endereço inválido e persiste correção | passed | 4.7 s |
| mobile | preço e disponibilidade via Socket.IO invalidam revisão no checkout | passed | 7.9 s |
| mobile | pedido pendente retoma após desconexão e clique repetido cria uma tentativa | passed | 8.7 s |
| mobile | teclado mantém foco no diálogo e valida formulário de login | passed | 1.1 s |
| desktop | fluxo principal não registra erro React, exceção ou recurso estático quebrado | passed | 11.8 s |
| mobile | fluxo principal não registra erro React, exceção ou recurso estático quebrado | passed | 11.9 s |
| desktop | catálogo, filtros na URL, refresh e detalhe inexistente | passed | 1.4 s |
| desktop | compra do detalhe ao pedido confirmado com persistência | passed | 11.0 s |
| desktop | perfil, carteira e logout sem exposição de dados | passed | 6.4 s |
| desktop | painel do NFT, galeria ampliada, avaliações e largura da página | passed | 1.7 s |
| desktop | carrinho com quantidade, cupom, recomendações e remoção | passed | 4.8 s |
| mobile | catálogo, filtros na URL, refresh e detalhe inexistente | passed | 1.6 s |
| mobile | compra do detalhe ao pedido confirmado com persistência | passed | 11.1 s |
| mobile | perfil, carteira e logout sem exposição de dados | passed | 6.3 s |
| mobile | painel do NFT, galeria ampliada, avaliações e largura da página | passed | 1.7 s |
| mobile | carrinho com quantidade, cupom, recomendações e remoção | passed | 4.8 s |
| desktop | favorito otimista reverte quando a API falha e permite nova tentativa | passed | 5.7 s |
| desktop | eventos Socket.IO duplicados e antigos não revertem preço do carrinho | passed | 3.7 s |
| desktop | cotação antiga gera conflito, sem criar uma compra | passed | 2.8 s |
| desktop | mesma chave recupera pedido, corpo diferente conflita e recibo é imutável | passed | 7.2 s |
| desktop | pagamento recusado preserva o carrinho | passed | 7.3 s |
| desktop | sessão expirada protege o perfil e exige autenticação novamente | passed | 2.6 s |
| desktop | busca com latência variável mantém a resposta mais recente | passed | 0.8 s |
| desktop | timeout após criação recupera o mesmo pedido sem segundo envio | passed | 16.9 s |
| desktop | checkout preserva rascunho após expiração e nova autenticação | passed | 6.0 s |
| mobile | favorito otimista reverte quando a API falha e permite nova tentativa | passed | 5.7 s |
| mobile | eventos Socket.IO duplicados e antigos não revertem preço do carrinho | passed | 3.6 s |
| mobile | cotação antiga gera conflito, sem criar uma compra | passed | 3.3 s |
| mobile | mesma chave recupera pedido, corpo diferente conflita e recibo é imutável | passed | 7.7 s |
| mobile | pagamento recusado preserva o carrinho | passed | 6.8 s |
| mobile | sessão expirada protege o perfil e exige autenticação novamente | passed | 3.1 s |
| mobile | busca com latência variável mantém a resposta mais recente | passed | 0.7 s |
| mobile | timeout após criação recupera o mesmo pedido sem segundo envio | passed | 17.0 s |
| mobile | checkout preserva rascunho após expiração e nova autenticação | passed | 6.0 s |
| desktop | páginas e filtros se adaptam entre 320 e 1440 pixels | passed | 7.4 s |
| desktop | login mobile tem campos alinhados e permanece utilizável em 320px | passed | 1.6 s |
| mobile | páginas e filtros se adaptam entre 320 e 1440 pixels | passed | 7.3 s |
| mobile | login mobile tem campos alinhados e permanece utilizável em 320px | passed | 1.6 s |
| desktop | carrossel troca a cada três segundos mesmo com mouse sobre o banner | passed | 7.0 s |
| desktop | catálogo oferece quatro páginas reais e preserva a página ao recarregar | passed | 1.5 s |
| desktop | cadastro com os quatro campos do Figma cria uma sessão | passed | 2.6 s |
| mobile | carrossel troca a cada três segundos mesmo com mouse sobre o banner | passed | 6.9 s |
| mobile | catálogo oferece quatro páginas reais e preserva a página ao recarregar | passed | 1.4 s |
| mobile | cadastro com os quatro campos do Figma cria uma sessão | passed | 2.6 s |
| desktop | API rejeita recursos privados sem sessão e JSON com prototype pollution | passed | 1.1 s |
| desktop | cadastro conflitante e nome de usuário injetado são rejeitados | passed | 1.1 s |
| desktop | carteira de outro usuário não pode ser editada e falha não remove principal | passed | 1.7 s |
| desktop | payload HTML em nome é exibido como texto e avatar SVG é rejeitado | passed | 3.0 s |
| mobile | API rejeita recursos privados sem sessão e JSON com prototype pollution | passed | 1.0 s |
| mobile | cadastro conflitante e nome de usuário injetado são rejeitados | passed | 1.0 s |
| mobile | carteira de outro usuário não pode ser editada e falha não remove principal | passed | 1.7 s |
| mobile | payload HTML em nome é exibido como texto e avatar SVG é rejeitado | passed | 3.5 s |
| desktop | regressão visual de início, detalhe, carrinho e pagamento | passed | 7.6 s |
| mobile | regressão visual de início, detalhe, carrinho e pagamento | passed | 6.5 s |

## Controle dos cenários

Relógio fixado para retomada pendente; avanço explícito de data permite a confirmação. Carrossel usa relógio controlado. Cenários MSW controlam latência variável/lenta, falhas de mutação, expiração e timeout após criação. O endpoint de demonstração publica eventos pela binding Socket.IO, sem modificar estado de componentes. O cenário de desconexão fecha o transporte e observa a reconexão do cliente.

## Evidência visual e falhas

Oito PNGs em tests/e2e/visual.spec.ts-snapshots são as baselines versionadas. Comparam início, detalhe, carrinho e pagamento em dois viewports, fontes/imagens carregadas e animações estabilizadas. Tolerância máxima: 1% de pixels. Elas detectam regressões contra a implementação revisada; não são uma comparação automática pixel a pixel com o Figma.

Relatório HTML em playwright-report/index.html; cópia distribuível em reports/tests/html-report.zip. Traces de falhas de diagnóstico preservados em initial-failures/. A execução final mantém trace em qualquer falha nova. Abra com npx playwright show-trace <arquivo.zip>. Não publique contas reais: todos os dados são fictícios.
