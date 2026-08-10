package router

import (
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/handler"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/middleware"
)

type Handlers struct {
	Auth       *handler.AuthHandler
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

func New(h *Handlers, allowedOrigin string, validator middleware.TokenValidator) http.Handler {
	mux := http.NewServeMux()

	auth := middleware.Auth(validator)
	protect := func(next http.HandlerFunc) http.Handler {
		return auth(next)
	}

	mux.HandleFunc("GET /api/health", h.Health.Health)
	mux.HandleFunc("POST /api/auth/login", h.Auth.Login)
	mux.Handle("POST /api/auth/logout", protect(h.Auth.Logout))
	mux.Handle("GET /api/auth/me", protect(h.Auth.Me))

	mux.Handle("GET /api/stats", protect(h.Health.Stats))
	mux.Handle("GET /api/metrics", protect(h.Health.Metrics))
	mux.Handle("GET /api/debug", protect(h.Health.Debug))

	mux.Handle("GET /api/collections", protect(h.Collection.ListCollections))
	mux.Handle("POST /api/collections", protect(h.Collection.CreateCollection))
	mux.Handle("GET /api/collections/{name}", protect(h.Collection.GetCollection))
	mux.Handle("PATCH /api/collections/{name}", protect(h.Collection.UpdateCollection))
	mux.Handle("DELETE /api/collections/{name}", protect(h.Collection.DeleteCollection))

	mux.Handle("GET /api/collections/{name}/documents/search", protect(h.Document.Search))
	mux.Handle("GET /api/collections/{name}/documents/export", protect(h.Document.Export))
	mux.Handle("POST /api/collections/{name}/documents/import", protect(h.Document.Import))
	mux.Handle("POST /api/collections/{name}/documents", protect(h.Document.Create))
	mux.Handle("PATCH /api/collections/{name}/documents", protect(h.Document.BulkUpdate))
	mux.Handle("DELETE /api/collections/{name}/documents", protect(h.Document.BulkDelete))
	mux.Handle("GET /api/collections/{name}/documents/{id}", protect(h.Document.Get))
	mux.Handle("PATCH /api/collections/{name}/documents/{id}", protect(h.Document.Update))
	mux.Handle("DELETE /api/collections/{name}/documents/{id}", protect(h.Document.Delete))

	mux.Handle("GET /api/collections/{name}/overrides", protect(h.Override.List))
	mux.Handle("GET /api/collections/{name}/overrides/{id}", protect(h.Override.Get))
	mux.Handle("PUT /api/collections/{name}/overrides/{id}", protect(h.Override.Upsert))
	mux.Handle("DELETE /api/collections/{name}/overrides/{id}", protect(h.Override.Delete))

	mux.Handle("GET /api/collections/{name}/synonyms", protect(h.Synonym.List))
	mux.Handle("GET /api/collections/{name}/synonyms/{id}", protect(h.Synonym.Get))
	mux.Handle("PUT /api/collections/{name}/synonyms/{id}", protect(h.Synonym.Upsert))
	mux.Handle("DELETE /api/collections/{name}/synonyms/{id}", protect(h.Synonym.Delete))

	mux.Handle("GET /api/keys", protect(h.Key.List))
	mux.Handle("POST /api/keys", protect(h.Key.Create))
	mux.Handle("GET /api/keys/{id}", protect(h.Key.Get))
	mux.Handle("DELETE /api/keys/{id}", protect(h.Key.Delete))

	mux.Handle("GET /api/aliases", protect(h.Alias.List))
	mux.Handle("GET /api/aliases/{name}", protect(h.Alias.Get))
	mux.Handle("PUT /api/aliases/{name}", protect(h.Alias.Upsert))
	mux.Handle("DELETE /api/aliases/{name}", protect(h.Alias.Delete))

	mux.Handle("GET /api/presets", protect(h.Preset.List))
	mux.Handle("GET /api/presets/{name}", protect(h.Preset.Get))
	mux.Handle("PUT /api/presets/{name}", protect(h.Preset.Upsert))
	mux.Handle("DELETE /api/presets/{name}", protect(h.Preset.Delete))

	mux.Handle("POST /api/operations/snapshot", protect(h.Operation.Snapshot))
	mux.Handle("POST /api/operations/vote", protect(h.Operation.Vote))

	var handler http.Handler = mux
	handler = middleware.Logger(handler)
	handler = middleware.CORS(allowedOrigin)(handler)
	handler = middleware.Recover(handler)

	return handler
}
