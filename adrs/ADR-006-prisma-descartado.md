# ADR-006: Prisma avaliado e descartado por vazar tipos ao domínio

## Status

Superseded

## Contexto

Prisma foi considerado como alternativa para acelerar acesso a dados, gerar tipos TypeScript e reduzir SQL manual. Essa escolha parecia atraente para CRUDs simples de usuários, prestadores e serviços.

Durante a avaliação, a equipe identificou dois problemas para os objetivos do projeto: tipos gerados por ORM poderiam vazar para `domain` ou `application`, e regras de banco específicas do PostgreSQL para conflito de slots ficariam menos explícitas.

## Decisão

Descartar Prisma para este projeto e manter a decisão consolidada no ADR-003: `pg` com SQL puro, migrations SQL versionadas e mapeamento manual entre linhas do banco e entidades.

## Consequências

- A decisão inicial de considerar ORM foi revertida.
- O projeto preserva independência do domínio em relação a tipos gerados.
- A equipe assume maior responsabilidade por SQL, migrations e testes dos repositórios.
- Esta ADR fica com status `Superseded` porque a alternativa Prisma foi substituída pela decisão aceita no ADR-003.
