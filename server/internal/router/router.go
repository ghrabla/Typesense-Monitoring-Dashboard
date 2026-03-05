package router

import (
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/handler"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/middleware"
)

func New(
	healthHandler *handler.HealthHandler,
	collectionHandler *handler.CollectionHandler,
	allowedOrigin string,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", healthHandler.Health)
	mux.HandleFunc("GET /api/stats", healthHandler.Stats)
	mux.HandleFunc("GET /api/metrics", healthHandler.Metrics)

	mux.HandleFunc("GET /api/collections", collectionHandler.ListCollections)
	mux.HandleFunc("POST /api/collections", collectionHandler.CreateCollection)
	mux.HandleFunc("GET /api/collections/{name}", collectionHandler.GetCollection)
	mux.HandleFunc("DELETE /api/collections/{name}", collectionHandler.DeleteCollection)

	var h http.Handler = mux
	h = middleware.Logger(h)
	h = middleware.CORS(allowedOrigin)(h)

	return h
}
