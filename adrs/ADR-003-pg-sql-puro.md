# ADR-003: Usar pg com SQL puro em vez de ORM

## Status

Accepted

## Contexto

O sistema usa PostgreSQL como banco principal. A regra de conflito de agendamentos depende de recursos especificos do Postgres, como `tstzrange`, constraint `EXCLUDE` com `gist` e filtros por status.

O projeto tambem exige que o `Pool` do `pg` fique restrito a `infrastructure/` e que o dominio nao receba tipos gerados por ferramentas externas.

## Decisao

Usar `pg` (`node-postgres`) com SQL puro em reposititorios concretos, mantendo migrations versionadas em arquivos `.sql` numerados em `/migrations`.

## Consequencias

- Queries criticas ficam explicitas e revisaveis.
- Recursos especificos do PostgreSQL podem ser usados sem contorno de ORM.
- O dominio continua independente de tipos de persistencia.
- A equipe precisa escrever e testar SQL manualmente, incluindo parametros, indices e mapeamento entre linhas do banco e entidades.
