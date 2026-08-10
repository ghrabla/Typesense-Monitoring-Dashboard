package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/config"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/handler"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/logger"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/router"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
	ts "github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/typesense"
)

func main() {
	logger.Init(os.Getenv("LOG_LEVEL"), os.Getenv("LOG_FORMAT"))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	logger.Init(cfg.LogLevel, cfg.LogFormat)

	tsClient := ts.NewClient(cfg)

	authService := service.NewAuthService(cfg)

	handlers := &router.Handlers{
		Auth:       handler.NewAuthHandler(authService),
		Health:     handler.NewHealthHandler(service.NewHealthService(tsClient)),
		Collection: handler.NewCollectionHandler(service.NewCollectionService(tsClient)),
		Document:   handler.NewDocumentHandler(service.NewDocumentService(tsClient)),
		Key:        handler.NewKeyHandler(service.NewKeyService(tsClient)),
		Alias:      handler.NewAliasHandler(service.NewAliasService(tsClient)),
		Override:   handler.NewOverrideHandler(service.NewOverrideService(tsClient)),
		Synonym:    handler.NewSynonymHandler(service.NewSynonymService(tsClient)),
		Preset:     handler.NewPresetHandler(service.NewPresetService(tsClient)),
		Operation:  handler.NewOperationHandler(service.NewOperationService(tsClient)),
	}

	appRouter := router.New(handlers, cfg.ClientOrigin, authService)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      appRouter,
		ReadTimeout:  cfg.TypesenseTimeout,
		WriteTimeout: cfg.TypesenseTimeout,
		IdleTimeout:  60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		slog.Info("server starting", "port", cfg.Port)
		slog.Info("typesense endpoint configured", "url", cfg.TypesenseURL())
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done()
	stop()
	slog.Info("shutting down server")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}
	slog.Info("server stopped")
}
