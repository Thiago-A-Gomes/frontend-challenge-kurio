# Verificação pontual da publicação

Domínio: https://frontend-challenge-kurio-thiago-gomes-projects1.vercel.app/

Acesso público confirmado com HTTP 200 e título “Kurio | Arte digital”, sem redirecionamento para login da Vercel.

Foram executados os cinco cenários de home-actions.spec.ts nos projetos Chromium desktop e mobile. A primeira execução teve oito aprovações e dois timeouts durante page.goto na URL inicial com filtros. Os dois cenários de banners foram repetidos sem alteração de código e passaram em ambos os perfis. Portanto, não se trata de uma execução única limpa dos dez testes; houve instabilidade inicial de navegação cuja causa não foi isolada.

Paginação e detalhe, artigos e foco, newsletter com persistência e recuperação de falha foram aprovados na primeira execução. Banners e reset de filtros foram aprovados na repetição dirigida.

Esta checagem não substitui a suíte completa local de 74 testes nem constitui auditoria Lighthouse da publicação. Os traces iniciais permanecem no diretório local test-results-public-review, ignorado pelo Git.
