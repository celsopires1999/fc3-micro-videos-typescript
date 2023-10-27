# FC3-micro-videos-typescript

Esse microsserviço é parte do projeto prático do curso Full Cycle 3.0

# Situação atual

No momento estão sendo atendidos os requisitos do desafio "Repositório e validação da entidade Categoria"

# Como usar

```bash
docker compose up -d --build
```

- Entrar no container da aplicação

```bash
docker compose exec app bash
```

- Executar os testes

```bash
npm run test:cov
```

- o relatório de cobertura dos testes será gravado na pasta `_coverage` e também exibido no terminal.

- resultado esperado:

```bash
Test Suites: 22 passed, 22 total
Tests:       109 passed, 109 total
Snapshots:   0 total
```

- Verificar se há erro de TypeScript

```bash
npm run tsc:check
```

- Sair do container teclando CRTL+d

- Eliminar os containers criados

```bash
docker compose down
```
