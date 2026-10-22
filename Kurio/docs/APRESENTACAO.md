# Apresentação do projeto

## Resumo para recrutamento

Kurio é um desafio frontend de marketplace de NFTs com React e TypeScript. O projeto contempla catálogo com filtros na URL, conta, favoritos, carrinho e checkout com pagamento simulado. A integração usa Axios e MSW para REST, TanStack Query para cache e Socket.IO Client para atualizações em tempo real. A entrega inclui testes E2E em desktop e mobile e auditorias Lighthouse documentadas.

## Como apresentar na entrevista

1. Mostre busca e filtros, abra um detalhe e conclua uma compra com a conta demonstrativa.
2. Explique que a confirmação depende da resposta da API simulada, sem pagamento real.
3. Mostre um teste E2E e explique o que ele observa na interface e na resposta da operação.
4. Explique uma recuperação de erro, como timeout sem duplicar o pedido.
5. Apresente uma limitação e o que estudaria para evoluir a solução.

## Assuntos para estudar antes da conversa

- Router: por que filtros e paginação ficam na URL e como o histórico é restaurado.
- Query e Axios: diferença entre cache de dados remotos e cliente HTTP.
- MSW: interceptação das requisições e persistência local dos dados fictícios.
- Socket.IO: eventos duplicados, ordem dos eventos e retomada após desconexão.
- Playwright: contexto isolado, asserções, mocks e comparação visual.
- Lighthouse: LCP, CLS e TBT; por que o início mobile ainda ficou em 89.

## Como falar sobre o que ainda não domina

Uma resposta possível, adaptada ao que realmente aconteceu: “Consigo demonstrar o fluxo e explicar estas partes. Ainda estou aprofundando este ponto e prefiro consultar o código para responder com precisão.”

Se perguntarem sobre ferramentas ou auxílio no desenvolvimento, descreva o processo real, inclusive uso de IA quando aplicável. Não atribua a si decisões ou conhecimentos que ainda não consegue explicar. Testes E2E não comprovam que foi usado TDD.

Não é necessário colocar rótulos como “especialista” ou “arquitetura de nível sênior”. A demonstração funcional, o código e as limitações documentadas são a apresentação.
