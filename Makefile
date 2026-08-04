.DEFAULT_GOAL := help

SERVER_DIR := server
CLIENT_DIR := client
BIN        := $(SERVER_DIR)/bin/api

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## --- Server (Go) -----------------------------------------------------------

.PHONY: build
build: ## Build the Go API binary
	cd $(SERVER_DIR) && go build -o bin/api ./cmd/api

.PHONY: run
run: ## Run the Go API locally (reads .env-style vars from the shell)
	cd $(SERVER_DIR) && go run ./cmd/api

.PHONY: test
test: ## Run Go tests
	cd $(SERVER_DIR) && go test ./...

.PHONY: fmt
fmt: ## Format Go source
	cd $(SERVER_DIR) && gofmt -l -w .

.PHONY: vet
vet: ## Run go vet
	cd $(SERVER_DIR) && go vet ./...

.PHONY: tidy
tidy: ## Tidy go.mod/go.sum
	cd $(SERVER_DIR) && go mod tidy

.PHONY: clean
clean: ## Remove build artifacts
	rm -rf $(SERVER_DIR)/bin

## --- Client (React) ---------------------------------------------------------

.PHONY: client-install
client-install: ## Install client dependencies
	cd $(CLIENT_DIR) && npm install

.PHONY: client-dev
client-dev: ## Run the client dev server
	cd $(CLIENT_DIR) && npm run dev

.PHONY: client-build
client-build: ## Build the client for production
	cd $(CLIENT_DIR) && npm run build

.PHONY: client-lint
client-lint: ## Lint the client
	cd $(CLIENT_DIR) && npm run lint

## --- Docker Compose ---------------------------------------------------------

.PHONY: up
up: ## Start all services in the background
	docker compose up -d --build

.PHONY: down
down: ## Stop all services
	docker compose down

.PHONY: logs
logs: ## Tail logs from all services
	docker compose logs -f

.PHONY: restart
restart: down up ## Restart all services

## --- Data ---------------------------------------------------------------

.PHONY: seed
seed: ## Seed Typesense with sample collections/data
	./seed/seed.sh
