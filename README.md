# FC3-micro-videos-typescript

Esse microsserviço é parte do projeto prático do curso Full Cycle 3.0

# Situação atual

No momento apenas os testes da entidade category estão disponíveis

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

```bash
npx tsc --noEmit
```
