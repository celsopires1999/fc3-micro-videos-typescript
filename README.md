# FC3-micro-videos-typescript

Esse microsserviço é parte do projeto prático do curso Full Cycle 3.0

# Situação atual

No momento estão sendo atendidos os requisitos do desafio "Repositório e validação da entidade Categoria"

# Como usar

```bash
docker compose up --build
```

- Entrar no container da aplicação

```bash
docker compose exec app bash
```

- Executar os testes e verificar se há algum erro de typescript

```bash
npm run test
```

- resultado esperado:

```bash
Test Suites: 11 passed, 11 total
Tests:       87 passed, 87 total
Snapshots:   0 total
```

```bash
npx tsc --noEmit
```
