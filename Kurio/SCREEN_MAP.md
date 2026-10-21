# Mapa de telas / Screen map

Referências: capturas desktop/mobile fornecidas pelo usuário. As baselines registram a implementação revisada; não certificam igualdade pixel a pixel com Figma nem cobertura de todos os dispositivos físicos.

| Tela | Rota | Funcionalidade e evidência |
|---|---|---|
| Início | `/` | Hero de três segundos; catálogo, busca, filtros, ordenação, quatro páginas e histórico; baseline desktop/mobile |
| NFT | `/nfts/:id` | Acesso direto, 404, galeria/zoom, edições, favoritos, avaliações e compra; baseline |
| Carrinho | `/carrinho` | Quantidade, remoção, cupom, persistência, recomendações e cotação; baseline |
| Pagamento | `/checkout` | Perfil, carteira, conexão simulada, revisão e revalidação de preço/estoque; baseline |
| Recibo | `/pedidos/:id` | Estados retornados pela API, snapshot e recuperação idempotente |
| Login / Cadastro | `/login`, `/cadastro` | Diálogo, teclado/foco, validação, sessão e retorno ao fluxo |
| Perfil | `/perfil` | Dados, avatar, senha, erros e persistência por usuário |
| Carteiras | `/carteiras` | Principal/secundária, edição, validação e autorização por dono |
| Criadores / Aprenda | `/criadores`, `/aprenda` | Em breve com fundo animado e respeito a movimento reduzido |

Rodapé em início, detalhe, carrinho e pagamento. Perfil/carteiras usam o menu da conta. Autenticação usa fundo inerte e diálogo; em mobile, ocupa a tela. Testes verificam 320, 390, 430, 768 e 1440 px. Login social, envio real de newsletter e blockchain real permanecem fora do escopo e são informados na interface.

EN: Connected challenge screens and explicit coming-soon pages. Baselines capture the reviewed implementation, not automatic Figma equivalence. Selected viewport checks do not certify every physical device/browser. External login, newsletter delivery and real blockchain are not presented as successful operations.
