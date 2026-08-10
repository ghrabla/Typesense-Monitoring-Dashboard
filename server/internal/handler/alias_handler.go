package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/model"
	"github.com/ghrabla/Typesense-Monitoring-Dashboard/internal/service"
)

type AliasHandler struct {
	svc *service.AliasService
}

func NewAliasHandler(svc *service.AliasService) *AliasHandler {
	return &AliasHandler{svc: svc}
}

func (h *AliasHandler) List(w http.ResponseWriter, r *http.Request) {
	aliases, err := h.svc.List(r.Context())
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve aliases", err)
		return
	}
	writeJSON(w, http.StatusOK, aliases)
}

func (h *AliasHandler) Get(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "alias name is required")
		return
	}

	alias, err := h.svc.Get(r.Context(), name)
	if err != nil {
		writeUpstreamError(w, r, "failed to retrieve alias", err)
		return
	}
	writeJSON(w, http.StatusOK, alias)
}

func (h *AliasHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "alias name is required")
		return
	}

	var req model.UpsertAliasRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body: "+err.Error())
		return
	}
	if req.CollectionName == "" {
		writeError(w, http.StatusBadRequest, "collection_name is required")
		return
	}

	alias, err := h.svc.Upsert(r.Context(), name, &req)
	if err != nil {
		writeUpstreamError(w, r, "failed to upsert alias", err)
		return
	}
	writeJSON(w, http.StatusOK, alias)
}

func (h *AliasHandler) Delete(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, http.StatusBadRequest, "alias name is required")
		return
	}

	if err := h.svc.Delete(r.Context(), name); err != nil {
		writeUpstreamError(w, r, "failed to delete alias", err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "alias deleted successfully"})
}
