# SOLID

## Documentação da API (OpenAPI / Swagger)

A especificação OpenAPI é gerada automaticamente a partir dos schemas Zod das
rotas, via [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) e
`fastify-type-provider-zod` — não há schemas duplicados ou escritos à mão.

- **Swagger UI:** com a API em execução (`npm run dev`), acesse
  [`http://localhost:3000/docs`](http://localhost:3000/docs).
- **Spec em JSON:** o mesmo documento fica disponível em `/docs/json`.
- **Exportar para arquivo:** `npm run docs:openapi` gera/atualiza o
  `openapi.json` na raiz do projeto sem precisar de banco de dados ativo.
