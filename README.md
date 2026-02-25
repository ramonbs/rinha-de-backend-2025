# Rinha de Backend 2025 - ramonbs

Projeto feito por diversão para a [Rinha de Backend 2025](https://github.com/zanfranceschi/rinha-de-backend-2025). Backend que intermedia pagamentos entre dois processadores com circuit breaker e fallback automatico.

## Stack

- **Runtime**: Bun
- **Linguagem**: TypeScript
- **Fila**: BullMQ (Redis)
- **Circuit Breaker**: Opossum
- **HTTP Client**: Undici (connection pooling com HTTP/2)
- **Load Balancer**: Nginx
- **Cache/Store**: Redis 7

## Arquitetura

```
nginx:9999 (load balancer)
  |
  +-- payment-proxy-leader:3000  (API - recebe pagamentos e enfileira)
  +-- payment-proxy-follower:3000 (API - replica)
  |
  +-- payment-worker (consome fila, processa via circuit breaker)
  |     |
  |     +-- payment-processor-default:8080  (taxa menor, prioridade)
  |     +-- payment-processor-fallback:8080 (fallback automatico)
  |
  +-- redis:6379 (fila BullMQ + armazenamento de metricas)
```

## Endpoints

| Metodo | Rota                | Descricao                          |
|--------|---------------------|------------------------------------|
| POST   | /payments           | Enfileira pagamento (retorna 202)  |
| GET    | /payments-summary   | Resumo por processador com filtro  |
| POST   | /purge-payments     | Limpa dados de pagamentos no Redis |
| GET    | /health             | Health check                       |

## Estrutura do projeto

```
api/src/
  config/redis.ts          -- conexao Redis
  types/index.ts           -- tipos de dominio
  queue/paymentQueue.ts    -- configuracao BullMQ
  services/paymentService.ts -- logica de consulta e purge
  controllers/paymentController.ts -- handlers HTTP
  routes/index.ts          -- roteamento
  index.ts                 -- entrypoint Bun.serve()
  worker/index.ts          -- consumer da fila com circuit breaker
```

## Recursos (Docker Compose)

| Servico          | CPU   | Memoria |
|------------------|-------|---------|
| proxy-leader     | 0.30  | 60MB    |
| proxy-follower   | 0.30  | 60MB    |
| payment-worker   | 0.55  | 110MB   |
| redis            | 0.20  | 50MB    |
| nginx            | 0.15  | 20MB    |
| **Total**        | **1.50** | **300MB** |

## Executar localmente

```bash
# Subir payment processors primeiro
docker compose -f payment-processor/docker-compose-arm64.yml up -d

# Subir o backend
docker compose up -d
```

API disponivel em `http://localhost:9999`.
