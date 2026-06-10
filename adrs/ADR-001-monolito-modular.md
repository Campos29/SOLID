# ADR-001: Adotar monolito modular em vez de microsservicos

## Status

Accepted

## Contexto

O SlotWise e uma plataforma academica de agendamento para prestadores, clientes e administradores. O escopo inclui autenticacao, prestadores, servicos, disponibilidade, agendamentos, notificacoes e avaliacoes.

A equipe e pequena, o prazo e curto e o dominio ainda esta em consolidacao. Separar o sistema em microsservicos agora exigiria contratos de rede, deploys independentes, observabilidade distribuida e coordenacao operacional que nao sao o foco principal da entrega.

## Decisao

Adotar um monolito modular organizado por camadas e modulos internos. O backend fica em uma unica aplicacao Node/Fastify, com separacao explicita entre `domain`, `application`, `infrastructure` e `interfaces`.

## Consequencias

- O desenvolvimento local e a execucao em Docker ficam mais simples.
- A equipe consegue evoluir o dominio sem sincronizar varios servicos independentes.
- As fronteiras de modulo precisam ser preservadas por disciplina de arquitetura, nao por isolamento fisico de deploy.
- Uma futura extracao para servicos separados ainda e possivel se os modulos permanecerem coesos e com contratos claros.
