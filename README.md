# Typesense Monitoring Dashboard

A professional search infrastructure control panel designed for managing, monitoring, and orchestrating Typesense clusters. This project provides a centralized interface for administrative operations and real-time telemetry, ensuring high availability and performance of search services.

## 1. Project Overview

The Typesense Monitoring Dashboard is a full-stack solution built to bridge the gap between low-level search engine APIs and high-level infrastructure management. It serves as a dedicated control plane for search engineering teams to maintain Typesense clusters with precision and ease.

### Core Functionalities
*   **Collection Management:** Create, list, and delete collections with schema visualization.
*   **Document Orchestration:** Comprehensive CRUD operations, document browsing, and schema validation.
*   **Search Interface:** Native search testing environment to validate query parameters and ranking logic.
*   **Node Telemetry:** Real-time monitoring of node versions, memory utilization, and disk usage.
*   **Cluster Orchestration:** Parallel monitoring of multi-node clusters with aggregated health status.
*   **Infrastructure Ready:** Designed to evolve into a full monitoring suite including alerting, log aggregation, and historical metrics.

The backend is engineered as a structured, layered Go application. It is not a simple proxy; it is a robust abstraction layer designed to handle business logic, security, and multi-node aggregation.

## 2. System Architecture

The application follows a standard three-tier architecture, ensuring clear separation between the presentation layer and the data persistence layer.

```
[ React Frontend ] <---> [ Golang REST API ] <---> [ Typesense Cluster ]
```

### Components
*   **React Frontend:** A modern, responsive dashboard UI built for administrative efficiency.
*   **Golang REST API:** A high-performance backend that acts as a secure abstraction layer. It manages authentication, request orchestration, and data aggregation from multiple Typesense nodes.
*   **Typesense Cluster:** The underlying search engine nodes where data is indexed and queried.

## 3. Backend Architecture

The backend follows Clean Architecture principles, ensuring the codebase is modular, testable, and decoupled from external dependencies.

### Directory Structure
```
server/
├── cmd/
│   └── api/
│       └── main.go         # Application entry point and bootstrapping
├── internal/
│   ├── config/             # Environment and application configuration
│   ├── router/             # HTTP route definitions and grouping
│   ├── handler/            # HTTP request parsing and response delivery
│   ├── service/            # Business logic and cross-service orchestration
│   ├── typesense/          # Typesense client initialization and SDK wrappers
│   ├── middleware/         # Logging, CORS, authentication, and recovery
│   └── model/              # Domain models, DTOs, and API contracts
└── go.mod                  # Dependency management
```

### Layer Responsibilities
*   **cmd/api/main.go:** Responsible for initializing the configuration, connecting to services, and starting the HTTP server.
*   **router:** Defines the API surface area. It remains lean, delegating all logic to handlers.
*   **handler:** Acts as the interface between the HTTP protocol and the service layer. It handles input validation and maps service errors to HTTP status codes.
*   **service:** The core of the application. It contains the business rules and orchestrates data flow between the handlers and the Typesense client.
*   **typesense:** A specialized package that wraps the official Typesense SDK, providing a clean interface for the service layer to interact with the search engine.
*   **middleware:** Implements cross-cutting concerns such as request logging, panic recovery, and security headers.
*   **model:** Defines the shared data structures used throughout the application, ensuring consistency across layers.

This separation of concerns allows developers to swap components (e.g., changing the web framework or updating the SDK) with minimal impact on the core business logic.

## 4. Development Roadmap

The project is structured into three strategic phases to evolve from a management tool to a comprehensive monitoring platform.

### Phase 1: Clean Core
*   Implementation of Collection management (List/Create/Delete).
*   Document management system for manual data overrides.
*   Standardized search testing endpoint.
*   Basic single-node telemetry (Memory/Disk/Version).

### Phase 2: Cluster Monitoring
*   Integration of multi-node support for high-availability setups.
*   Implementation of parallel polling using Go routines to fetch status from all nodes simultaneously.
*   Unified cluster health responses (Aggregated Status).
*   Dynamic node switching within the UI for targeted debugging.

### Phase 3: Real Monitoring & Enterprise Features
*   Persistence of metrics for historical trend analysis.
*   Advanced alerting system based on configurable memory and disk thresholds.
*   Audit logging to track administrative changes across the cluster.
*   Role-Based Access Control (RBAC) to restrict sensitive operations.

## 5. Key Design Principles

*   **Clean Architecture:** Strict separation between business logic and delivery mechanisms.
*   **Modularity:** Each package has a single responsibility, making the system easy to extend.
*   **Extensibility:** The service-oriented design allows for easy integration of new features like caching or third-party notification providers.
*   **Production Readiness:** Includes structured logging, environment-based configuration, and graceful shutdown handling.
*   **Dockerized Environment:** Fully containerized setup using Docker Compose for consistent development and deployment workflows.

## 6. Future Enhancements

*   **Snapshot Management:** Automated and manual backup orchestration for Typesense state.
*   **Delete by Query:** Advanced document cleanup tools based on complex filters.
*   **Scoped Search Key Generation:** UI-driven management of security keys with specific embedded filters.
*   **External Alerts:** Integration with Slack, PagerDuty, or Email for infrastructure health notifications.
*   **Prometheus Integration:** Exporting internal metrics for ingestion into existing Grafana/Prometheus stacks.
*   **Redis Caching:** Implementation of a caching layer for frequent dashboard telemetry requests to reduce load on the search nodes.
*   **Authentication & RBAC:** Full OIDC or JWT-based authentication for enterprise environments.