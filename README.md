# FC3-micro-videos-typescript

Esse microsserviço é parte do projeto prático do curso Full Cycle 3.0

# Situação atual

No momento estão sendo atendidos os requisitos do desafio "Endpoints de Categoria e Cast Member"

# Como usar

```bash
docker compose up -d --build
```

- Os arquivos de configuração .env, .env.test e .env.e2e são criados automaticamente com base nos arquivos de exemplo.

- Entrar no container da aplicação

```bash
docker compose exec app bash
```

- Gerar os certificados para os testes e copiar para os arquivos .env, .env.test e env.e2e

```bash
node create-rsa
node generate-token
```

- Executar os testes de unidade e integração

```bash
npm run test:cov
```

- o relatório de cobertura dos testes será gravado na pasta `__coverage` e também exibido no terminal.

- resultado esperado:

```bash
Test Suites: 54 passed, 54 total
Tests:       287 passed, 287 total
Snapshots:   0 total
```

- Executar os testes e2e

```bash
npm run test:e2e
```

- resultado esperado:

```bash
Test Suites: 11 passed, 11 total
Tests:       64 passed, 64 total
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

- Executar migrações para criar tabelas no banco de dados
- O build tem que estar criado na pasta ./dist

```bash
npm run migrate:js up
npm run migrate:js down -- --to 0
```
