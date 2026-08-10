package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type SynonymHandler struct {
	svc *service.SynonymService
}

func NewSynonymHandler(svc *service.SynonymService) *SynonymHandler {
	return &SynonymHandler{svc: svc}
}

func (h *SynonymHandler) List(w http.ResponseWriter, r *http.Request) {
	collection := r.PathValue("name")
	if collection == "" {
		writeError(w, http.StatusBadRequest, "collection name is required")
		return
	}

	synonyms, err := h.svc.List(r.Context(), collection)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve synonyms", err)
		return
	}
	writeJSON(w, http.StatusOK, synonyms)
}

func (h *SynonymHandler) Get(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and synonym id are required")
		return
	}

	synonym, err := h.svc.Get(r.Context(), collection, id)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve synonym", err)
		return
	}
	writeJSON(w, http.StatusOK, synonym)
}

func (h *SynonymHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and synonym id are required")
		return
	}

	var req model.UpsertSynonymRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}
	if len(req.Synonyms) == 0 {
		writeError(w, http.StatusBadRequest, "at least one synonym is required")
		return
	}

	synonym, err := h.svc.Upsert(r.Context(), collection, id, &req)
	if err != nil {
		writeUpstreamError(w, r, "failed to upsert synonym", err)
		return
	}
	writeJSON(w, http.StatusOK, synonym)
}

func (h *SynonymHandler) Delete(w http.ResponseWriter, r *http.Request) {
	collection, id := r.PathValue("name"), r.PathValue("id")
	if collection == "" || id == "" {
		writeError(w, http.StatusBadRequest, "collection name and synonym id are required")
		return
	}

	if err := h.svc.Delete(r.Context(), collection, id); err != nil {
		writeUpstreamError(w, r, "failed to delete synonym", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "synonym deleted successfully"})
}
