package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/config"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/handler"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/logger"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/router"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
)

func main() {
	// bootstrap logger so config load errors are captured before final config is known.
	logger.Init(os.Getenv("LOG_LEVEL"), os.Getenv("LOG_FORMAT"))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	logger.Init(cfg.LogLevel, cfg.LogFormat)

	tsClient := ts.NewClient(cfg)

	healthSvc := service.NewHealthService(tsClient)
	collectionSvc := service.NewCollectionService(tsClient)

	healthHandler := handler.NewHealthHandler(healthSvc)
	collectionHandler := handler.NewCollectionHandler(collectionSvc)

	appRouter := router.New(healthHandler, collectionHandler, cfg.ClientOrigin)

	slog.Info("server starting", "port", cfg.Port)
	slog.Info("typesense endpoint configured", "url", cfg.TypesenseURL())

	if err := http.ListenAndServe(":"+cfg.Port, appRouter); err != nil {
		slog.Error("server failed", "error", err)
		os.Exit(1)
	}
}
