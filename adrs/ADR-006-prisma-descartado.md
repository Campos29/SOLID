# ADR-006: Prisma avaliado e descartado por vazar tipos ao dominio

## Status

Superseded

## Contexto

Prisma foi considerado como alternativa para acelerar acesso a dados, gerar tipos TypeScript e reduzir SQL manual. Essa escolha parecia atraente para CRUDs simples de usuarios, prestadores e servicos.

Durante a avaliacao, a equipe identificou dois problemas para os objetivos do projeto: tipos gerados por ORM poderiam vazar para `domain` ou `application`, e regras de banco especificas do PostgreSQL para conflito de slots ficariam menos explicitas.

## Decisao

Descartar Prisma para este projeto e manter a decisao consolidada no ADR-003: `pg` com SQL puro, migrations SQL versionadas e mapeamento manual entre linhas do banco e entidades.

## Consequencias

- A decisao inicial de considerar ORM foi revertida.
- O projeto preserva independencia do dominio em relacao a tipos gerados.
- A equipe assume maior responsabilidade por SQL, migrations e testes dos reposititorios.
- Esta ADR fica com status `Superseded` porque a alternativa Prisma foi substituida pela decisao aceita no ADR-003.
