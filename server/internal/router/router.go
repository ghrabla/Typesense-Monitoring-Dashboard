package router

import (
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/handler"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/middleware"
)

type Handlers struct {
	Health     *handler.HealthHandler
	Collection *handler.CollectionHandler
	Document   *handler.DocumentHandler
	Key        *handler.KeyHandler
	Alias      *handler.AliasHandler
	Override   *handler.OverrideHandler
	Synonym    *handler.SynonymHandler
	Preset     *handler.PresetHandler
	Operation  *handler.OperationHandler
}

func New(h *Handlers, allowedOrigin string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", h.Health.Health)
	mux.HandleFunc("GET /api/stats", h.Health.Stats)
	mux.HandleFunc("GET /api/metrics", h.Health.Metrics)
	mux.HandleFunc("GET /api/debug", h.Health.Debug)

	mux.HandleFunc("GET /api/collections", h.Collection.ListCollections)
	mux.HandleFunc("POST /api/collections", h.Collection.CreateCollection)
	mux.HandleFunc("GET /api/collections/{name}", h.Collection.GetCollection)
	mux.HandleFunc("PATCH /api/collections/{name}", h.Collection.UpdateCollection)
	mux.HandleFunc("DELETE /api/collections/{name}", h.Collection.DeleteCollection)

	mux.HandleFunc("GET /api/collections/{name}/documents/search", h.Document.Search)
	mux.HandleFunc("GET /api/collections/{name}/documents/export", h.Document.Export)
	mux.HandleFunc("POST /api/collections/{name}/documents/import", h.Document.Import)
	mux.HandleFunc("POST /api/collections/{name}/documents", h.Document.Create)
	mux.HandleFunc("PATCH /api/collections/{name}/documents", h.Document.BulkUpdate)
	mux.HandleFunc("DELETE /api/collections/{name}/documents", h.Document.BulkDelete)
	mux.HandleFunc("GET /api/collections/{name}/documents/{id}", h.Document.Get)
	mux.HandleFunc("PATCH /api/collections/{name}/documents/{id}", h.Document.Update)
	mux.HandleFunc("DELETE /api/collections/{name}/documents/{id}", h.Document.Delete)

	mux.HandleFunc("GET /api/collections/{name}/overrides", h.Override.List)
	mux.HandleFunc("GET /api/collections/{name}/overrides/{id}", h.Override.Get)
	mux.HandleFunc("PUT /api/collections/{name}/overrides/{id}", h.Override.Upsert)
	mux.HandleFunc("DELETE /api/collections/{name}/overrides/{id}", h.Override.Delete)

	mux.HandleFunc("GET /api/collections/{name}/synonyms", h.Synonym.List)
	mux.HandleFunc("GET /api/collections/{name}/synonyms/{id}", h.Synonym.Get)
	mux.HandleFunc("PUT /api/collections/{name}/synonyms/{id}", h.Synonym.Upsert)
	mux.HandleFunc("DELETE /api/collections/{name}/synonyms/{id}", h.Synonym.Delete)

	mux.HandleFunc("GET /api/keys", h.Key.List)
	mux.HandleFunc("POST /api/keys", h.Key.Create)
	mux.HandleFunc("GET /api/keys/{id}", h.Key.Get)
	mux.HandleFunc("DELETE /api/keys/{id}", h.Key.Delete)

	mux.HandleFunc("GET /api/aliases", h.Alias.List)
	mux.HandleFunc("GET /api/aliases/{name}", h.Alias.Get)
	mux.HandleFunc("PUT /api/aliases/{name}", h.Alias.Upsert)
	mux.HandleFunc("DELETE /api/aliases/{name}", h.Alias.Delete)

	mux.HandleFunc("GET /api/presets", h.Preset.List)
	mux.HandleFunc("GET /api/presets/{name}", h.Preset.Get)
	mux.HandleFunc("PUT /api/presets/{name}", h.Preset.Upsert)
	mux.HandleFunc("DELETE /api/presets/{name}", h.Preset.Delete)

	mux.HandleFunc("POST /api/operations/snapshot", h.Operation.Snapshot)
	mux.HandleFunc("POST /api/operations/vote", h.Operation.Vote)

	var handler http.Handler = mux
	handler = middleware.Logger(handler)
	handler = middleware.CORS(allowedOrigin)(handler)
	handler = middleware.Recover(handler)

	return handler
}
