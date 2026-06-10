# ADR-002: Usar Clean Architecture como organizacao interna

## Status

Accepted

## Contexto

O projeto precisa demonstrar Clean Architecture, SOLID e baixo acoplamento entre regras de negocio e detalhes tecnicos. O dominio de agendamento tem regras sensiveis, como conflitos de horario, status de appointment, cancelamento e notificacoes.

Sem uma separacao clara, tecnologias como Fastify, Zod, PostgreSQL ou Nodemailer poderiam vazar para entidades e casos de uso, dificultando testes unitarios e manutencao.

## Decisao

Organizar o backend em camadas com dependencias apontando para dentro:

- `domain`: entidades, interfaces e estrategias puras.
- `application`: casos de uso e servicos de orquestracao.
- `infrastructure`: banco, reposititorios concretos, auth e notificacoes externas.
- `interfaces`: rotas HTTP, controllers, middlewares e schemas Zod.

## Consequencias

- Entidades e interfaces de dominio permanecem sem dependencias externas.
- Casos de uso dependem de contratos, nao de implementacoes concretas.
- Controllers HTTP ficam responsaveis por entrada/saida, nao por regras de negocio.
- Ha mais arquivos e injecao manual de dependencias, mas a testabilidade e a clareza das fronteiras compensam esse custo.
