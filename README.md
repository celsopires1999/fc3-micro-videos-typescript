# FC3-micro-videos-typescript

Esse microsserviço é parte do projeto prático do curso Full Cycle 3.0

# Como usar

- Executar os containers

```bash
docker compose -f docker-compose.dev.yaml up -d --build
```

- Os arquivos de configuração .env, .env.test e .env.e2e são criados automaticamente com base nos arquivos de exemplo.

- Entrar no container da aplicação

```bash
docker compose -f docker-compose.dev.yaml exec app bash
```

- Gerar private e public key para os testes. Copiar para os arquivos .env, .env.test e env.e2e

```bash
node create-rsa
```

- Credenciais do Google Cloud. Na variável GOOGLE_CLOUD_CREDENTIALS, colocar tudo numa linha nos arquivos .env, .env.test e .env.e2e

```bash
GOOGLE_CLOUD_CREDENTIALS
GOOGLE_CLOUD_STORAGE_BUCKET_NAME
```

# Testes Automatizados

- Executar os testes de unidade e integração

```bash
npm run test:cov
```

- o relatório de cobertura dos testes será gravado na pasta `__coverage` e também exibido no terminal.

- resultado esperado:

```bash
Test Suites: 123 passed, 123 total
Tests:       714 passed, 714 total
Snapshots:   0 total
```

- Executar os testes e2e

```bash
npm run test:e2e
```

- resultado esperado:

```bash
Test Suites: 21 passed, 21 total
Tests:       205 passed, 205 total
Snapshots:   0 total
```

- Verificar se há erro de TypeScript

```bash
npm run tsc:check
```

# Testes Manuais

- Executar o script generate-token.js

```bash
node generate-token
```

- colar o token gerado na variável @jwtToken do arquivo api.http

- Executar o microsserviço

```bash
npm run start
```

- Fazer as chamadas da API usando o arquivo api.http

- Encerrar o microsserviço com tecla CRTL+c

- Sair do container teclando CRTL+d

- Eliminar os containers criados

```bash
docker compose -f docker-compose.dev.yaml down
```

# Migrações

- Executar migrações para criar tabelas no banco de dados
- O build tem que estar criado na pasta ./dist

```bash
npm run migrate:js up
npm run migrate:js down -- --to 0
```
