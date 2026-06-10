# ADR-004: Autenticação via JWT com refresh token

## Status

Accepted

## Contexto

O SlotWise expõe uma API REST consumida pelo frontend React. Os perfis Admin, Provider e Client precisam acessar rotas protegidas e fluxos distintos.

Como a aplicação deve permanecer simples para execução local e deploy acadêmico, sessões server-side adicionariam estado compartilhado e mais infraestrutura.

## Decisão

Usar JWT para autenticação stateless, com access token para chamadas autenticadas e refresh token para renovação de sessão. O contrato de tokens fica em `domain/interfaces/ITokenService`, enquanto a implementação concreta fica em `infrastructure/auth/JwtTokenService`.

## Consequências

- A API não precisa armazenar sessão em memória ou banco para cada request.
- O frontend consegue autenticar chamadas REST de forma previsível.
- A autorização por role pode ser aplicada nos middlewares HTTP.
- Segurança passa a depender de segredo JWT forte, expiração adequada e tratamento cuidadoso do refresh token.
