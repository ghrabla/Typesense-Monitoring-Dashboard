package main

import (
	"log"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/config"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/handler"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/router"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	tsClient := ts.NewClient(cfg)

	healthSvc := service.NewHealthService(tsClient)
	collectionSvc := service.NewCollectionService(tsClient)

	healthHandler := handler.NewHealthHandler(healthSvc)
	collectionHandler := handler.NewCollectionHandler(collectionSvc)

	appRouter := router.New(healthHandler, collectionHandler, cfg.ClientOrigin)

	log.Printf("Server starting on port %s...", cfg.Port)
	log.Printf("Typesense endpoint: %s", cfg.TypesenseURL())

	if err := http.ListenAndServe(":"+cfg.Port, appRouter); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
