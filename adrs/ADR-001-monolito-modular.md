# ADR-001: Adotar monolito modular em vez de microsserviços

## Status

Accepted

## Contexto

O SlotWise é uma plataforma acadêmica de agendamento para prestadores, clientes e administradores. O escopo inclui autenticação, prestadores, serviços, disponibilidade, agendamentos, notificações e avaliações.

A equipe é pequena, o prazo é curto e o domínio ainda está em consolidação. Separar o sistema em microsserviços agora exigiria contratos de rede, deploys independentes, observabilidade distribuída e coordenação operacional, que não são o foco principal da entrega.

## Decisão

Adotar um monolito modular organizado por camadas e módulos internos. O backend fica em uma única aplicação Node/Fastify, com separação explícita entre `domain`, `application`, `infrastructure` e `interfaces`.

## Consequências

- O desenvolvimento local e a execução em Docker ficam mais simples.
- A equipe consegue evoluir o domínio sem sincronizar vários serviços independentes.
- As fronteiras de módulo precisam ser preservadas por disciplina de arquitetura, não por isolamento físico de deploy.
- Uma futura extração para serviços separados ainda é possível se os módulos permanecerem coesos e com contratos claros.
