# Rinha de Backend 2025 - ramonbs

Projeto feito por diversao para a [Rinha de Backend 2025](https://github.com/zanfranceschi/rinha-de-backend-2025). Duas implementacoes do mesmo backend: uma em Bun/TypeScript e outra em Rust.

## Estrutura

```
/
  bun/                -- implementacao em Bun + TypeScript
  rust/               -- implementacao em Rust (em desenvolvimento)
  payment-processor/  -- servicos de processamento (compartilhado)
  rinha-test/         -- testes de carga k6 (compartilhado)
```

## Implementacoes

### Bun (TypeScript)

Stack: Bun, BullMQ, Opossum (circuit breaker), Undici, Nginx, Redis 7.

Detalhes em `bun/`.

### Rust

Em desenvolvimento.

## Executar localmente

```bash
# Subir payment processors
docker compose -f payment-processor/docker-compose-arm64.yml up -d

# Subir o backend (bun)
docker compose -f bun/docker-compose.yml up -d
```

API disponivel em `http://localhost:9999`.
