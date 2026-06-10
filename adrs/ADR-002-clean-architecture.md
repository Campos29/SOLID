# ADR-002: Usar Clean Architecture como organização interna

## Status

Accepted

## Contexto

O projeto precisa demonstrar Clean Architecture, SOLID e baixo acoplamento entre regras de negócio e detalhes técnicos. O domínio de agendamento tem regras sensíveis, como conflitos de horário, status de appointment, cancelamento e notificações.

Sem uma separação clara, tecnologias como Fastify, Zod, PostgreSQL ou Nodemailer poderiam vazar para entidades e casos de uso, dificultando testes unitários e manutenção.

## Decisão

Organizar o backend em camadas com dependências apontando para dentro:

- `domain`: entidades, interfaces e estratégias puras.
- `application`: casos de uso e serviços de orquestração.
- `infrastructure`: banco, repositórios concretos, autenticação e notificações externas.
- `interfaces`: rotas HTTP, controllers, middlewares e schemas Zod.

## Consequências

- Entidades e interfaces de domínio permanecem sem dependências externas.
- Casos de uso dependem de contratos, não de implementações concretas.
- Controllers HTTP ficam responsáveis por entrada/saída, não por regras de negócio.
- Há mais arquivos e injeção manual de dependências, mas a testabilidade e a clareza das fronteiras compensam esse custo.
