# ADR-003: Usar pg com SQL puro em vez de ORM

## Status

Accepted

## Contexto

O sistema usa PostgreSQL como banco principal. A regra de conflito de agendamentos depende de recursos específicos do Postgres, como `tstzrange`, constraint `EXCLUDE` com `gist` e filtros por status.

O projeto também exige que o `Pool` do `pg` fique restrito a `infrastructure/` e que o domínio não receba tipos gerados por ferramentas externas.

## Decisão

Usar `pg` (`node-postgres`) com SQL puro em repositórios concretos, mantendo migrations versionadas em arquivos `.sql` numerados em `/migrations`.

## Consequências

- Queries críticas ficam explícitas e revisáveis.
- Recursos específicos do PostgreSQL podem ser usados sem contorno de ORM.
- O domínio continua independente de tipos de persistência.
- A equipe precisa escrever e testar SQL manualmente, incluindo parâmetros, índices e mapeamento entre linhas do banco e entidades.
