# Typesense Monitoring Dashboard

A control panel for managing and monitoring Typesense clusters: collection/document management, search testing, and node telemetry.

## Architecture

```
[ React Frontend ] <---> [ Golang REST API ] <---> [ Typesense Cluster ]
```

- **client/** — React dashboard UI
- **server/** — Go REST API (Clean Architecture: `router`, `handler`, `service`, `typesense`, `middleware`, `model`, `config`)

## Getting Started

1. Create a `.env` file in the project root with:
   ```
   TYPESENSE_API_KEY=your-key
   TYPESENSE_ENABLE_CORS=true
   TYPESENSE_HOST=typesense
   ```
2. Run `docker compose up -d --build`
3. Client: http://localhost:5173 · API: http://localhost:8080/api/health · Typesense: http://localhost:8108/health

## Roadmap

- **Phase 1:** Collection/document management, search testing, single-node telemetry
- **Phase 2:** Multi-node cluster monitoring, aggregated health status
- **Phase 3:** Historical metrics, alerting, audit logging, RBAC