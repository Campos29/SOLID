# ADR-004: Autenticacao via JWT com refresh token

## Status

Accepted

## Contexto

O SlotWise expoe uma API REST consumida pelo frontend React. Os perfis Admin, Provider e Client precisam acessar rotas protegidas e fluxos distintos.

Como a aplicacao deve permanecer simples para execucao local e deploy academico, sessoes server-side adicionariam estado compartilhado e mais infraestrutura.

## Decisao

Usar JWT para autenticacao stateless, com access token para chamadas autenticadas e refresh token para renovacao de sessao. O contrato de tokens fica em `domain/interfaces/ITokenService`, enquanto a implementacao concreta fica em `infrastructure/auth/JwtTokenService`.

## Consequencias

- A API nao precisa armazenar sessao em memoria ou banco para cada request.
- O frontend consegue autenticar chamadas REST de forma previsivel.
- A autorizacao por role pode ser aplicada nos middlewares HTTP.
- Seguranca passa a depender de segredo JWT forte, expiracao adequada e tratamento cuidadoso do refresh token.
